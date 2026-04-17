import { Hono } from 'hono';
import { z } from 'zod';
import { getDb } from '../db/database';

const jobsRouter = new Hono();

const jobSchema = z.object({
  id: z.string().max(128),
  customerName: z.string().min(1).max(100),
  customerEmail: z.string().email().max(200).optional().nullable(),
  customerPhone: z.string().min(1).max(30),
  tradeCategory: z.string().max(100),
  description: z.string().min(1).max(2000),
  postcode: z.string().max(20).optional().default(''),
  estimatePaid: z.boolean().optional().default(false),
  estimateMinPrice: z.number().optional().nullable(),
  estimateMaxPrice: z.number().optional().nullable(),
  imageCount: z.number().int().min(0).max(20).optional().default(0),
  postedAt: z.string().max(50),
});

// POST /api/jobs - save a new job posting and notify owner
jobsRouter.post('/', async (c) => {
  const secret = c.req.header('x-internal-secret');
  if (secret !== process.env.INTERNAL_API_SECRET) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = await c.req.json();
    const job = jobSchema.parse(body);

    const db = getDb();

    db.query(`
      INSERT OR REPLACE INTO job_postings
        (id, customer_name, customer_email, customer_phone, trade_category, description, postcode, estimate_paid, estimate_min_price, estimate_max_price, image_count, posted_at)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      job.id,
      job.customerName,
      job.customerEmail ?? null,
      job.customerPhone,
      job.tradeCategory,
      job.description,
      job.postcode,
      job.estimatePaid ? 1 : 0,
      job.estimateMinPrice ?? null,
      job.estimateMaxPrice ?? null,
      job.imageCount,
      job.postedAt,
    );

    console.log(`[Jobs] Saved job ${job.id} - ${job.tradeCategory} - ${job.postcode || 'no postcode'}`);

    return c.json({ success: true, id: job.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return c.json({ error: 'Invalid job data', details: err.issues }, 400);
    }
    console.error('[Jobs] Error saving job:', err);
    return c.json({ error: 'Failed to save job' }, 500);
  }
});

// GET /api/jobs - list all job postings (internal use)
jobsRouter.get('/', (c) => {
  const secret = c.req.header('x-internal-secret');
  if (secret !== process.env.INTERNAL_API_SECRET) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const db = getDb();
    const jobs = db.query(`SELECT * FROM job_postings ORDER BY posted_at DESC`).all();
    return c.json({ jobs });
  } catch (err) {
    console.error('[Jobs] Error fetching jobs:', err);
    return c.json({ error: 'Failed to fetch jobs' }, 500);
  }
});

// GET /api/jobs/:id/contact - fetch contact details for a purchased lead
// Requires internal secret + professionalId who made the purchase
jobsRouter.get('/:id/contact', (c) => {
  const secret = c.req.header('x-internal-secret');
  if (secret !== process.env.INTERNAL_API_SECRET) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const jobId = c.req.param('id');
  const professionalId = c.req.query('professionalId');

  if (!professionalId) {
    return c.json({ error: 'professionalId required' }, 400);
  }

  try {
    const db = getDb();

    // Strictly verify this professional purchased this lead — no fallback
    const purchaseId = `${jobId}:${professionalId}`;
    const purchase = db.query(
      `SELECT id FROM lead_purchases WHERE id = ?`
    ).get(purchaseId);

    if (!purchase) {
      console.warn(`[Jobs] Unauthorised contact attempt: job=${jobId} professional=${professionalId}`);
      return c.json({ error: 'Purchase not found' }, 403);
    }

    const job = db.query(
      `SELECT customer_email, customer_phone FROM job_postings WHERE id = ?`
    ).get(jobId) as { customer_email: string; customer_phone: string } | undefined;

    if (!job) {
      return c.json({ error: 'Job not found' }, 404);
    }

    // Audit log — no PII in log
    console.log(`[Jobs] Contact accessed: job=${jobId} professional=***`);

    return c.json({ customerEmail: job.customer_email, customerPhone: job.customer_phone });
  } catch (err) {
    console.error('[Jobs] Error fetching contact:', err);
    return c.json({ error: 'Failed to fetch contact' }, 500);
  }
});

export { jobsRouter };
