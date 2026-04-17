import { Hono } from 'hono';
import { z } from 'zod';
import { getDb } from '../db/database';
import { sendNotificationEmail } from '../lib/email';

const usersRouter = new Hono();

const OWNER_EMAIL = process.env.OWNER_NOTIFICATION_EMAIL || 'a2bsolutionsdev@gmail.com';

const userSchema = z.object({
  id: z.string().max(128),
  userType: z.enum(['customer', 'professional']),
  name: z.string().min(1).max(100),
  email: z.string().email().max(200).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  tradeCategories: z.array(z.string().max(100)).max(20).optional().nullable(),
  isPremium: z.boolean().optional().default(false),
  registeredAt: z.string().max(50),
});

const purchaseSchema = z.object({
  jobId: z.string().max(128),
  professionalId: z.string().max(128),
  professionalName: z.string().max(100),
  professionalEmail: z.string().email().max(200),
  professionalPhone: z.string().max(30).optional().nullable(),
  customerName: z.string().max(100),
  tradeCategory: z.string().max(100),
  postcode: z.string().max(20).optional().default(''),
  creditsSpent: z.number().int().min(0).max(1000),
  isPremium: z.boolean().optional().default(false),
  purchasedAt: z.string().max(50),
});

// POST /api/users - register a user (customer or professional)
usersRouter.post('/', async (c) => {
  const secret = c.req.header('x-internal-secret');
  if (secret !== process.env.INTERNAL_API_SECRET) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = await c.req.json();
    const user = userSchema.parse(body);

    const db = getDb();
    db.query(`
      INSERT OR REPLACE INTO app_users
        (id, user_type, name, email, phone, trade_categories, is_premium, registered_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      user.id,
      user.userType,
      user.name,
      user.email ?? null,
      user.phone ?? null,
      user.tradeCategories ? user.tradeCategories.join(',') : null,
      user.isPremium ? 1 : 0,
      user.registeredAt,
    );

    console.log(`[Users] Registered ${user.userType}: ${user.name}`);
    return c.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return c.json({ error: 'Invalid user data', details: err.issues }, 400);
    }
    console.error('[Users] Error registering user:', err);
    return c.json({ error: 'Failed to register user' }, 500);
  }
});

// POST /api/users/purchase - record a lead purchase and notify owner
usersRouter.post('/purchase', async (c) => {
  const secret = c.req.header('x-internal-secret');
  if (secret !== process.env.INTERNAL_API_SECRET) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = await c.req.json();
    const purchase = purchaseSchema.parse(body);

    const db = getDb();

    // Look up customer contact from job_postings table
    const jobRow = db.query(`
      SELECT customer_email, customer_phone FROM job_postings WHERE id = ?
    `).get(purchase.jobId) as { customer_email: string; customer_phone: string } | undefined;

    const customerEmail = jobRow?.customer_email ?? '';
    const customerPhone = jobRow?.customer_phone ?? '';

    const purchaseId = `${purchase.jobId}:${purchase.professionalId}`;
    db.query(`
      INSERT OR REPLACE INTO lead_purchases
        (id, job_id, professional_id, professional_name, professional_email, professional_phone,
         customer_name, customer_email, customer_phone, trade_category, postcode,
         credits_spent, is_premium, purchased_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      purchaseId,
      purchase.jobId,
      purchase.professionalId,
      purchase.professionalName,
      purchase.professionalEmail,
      purchase.professionalPhone ?? null,
      purchase.customerName,
      customerEmail,
      customerPhone,
      purchase.tradeCategory,
      purchase.postcode,
      purchase.creditsSpent,
      purchase.isPremium ? 1 : 0,
      purchase.purchasedAt,
    );

    console.log(`[Users] Lead purchase recorded: ${purchase.professionalName} bought job ${purchase.jobId}`);

    return c.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return c.json({ error: 'Invalid purchase data', details: err.issues }, 400);
    }
    console.error('[Users] Error recording purchase:', err);
    return c.json({ error: 'Failed to record purchase' }, 500);
  }
});

const creditPurchaseSchema = z.object({
  professionalId: z.string().max(128),
  professionalName: z.string().max(100),
  professionalEmail: z.string().email().max(200),
  packageId: z.string().max(128),
  packageName: z.string().max(200),
  creditsGranted: z.number().int().min(0).max(10000).default(0),
  isSubscription: z.boolean().default(false),
  amountGbp: z.number().min(0).max(10000).optional().nullable(),
  purchasedAt: z.string().max(50),
});

// POST /api/users/credit-purchase - record a credit pack or subscription purchase
usersRouter.post('/credit-purchase', async (c) => {
  const secret = c.req.header('x-internal-secret');
  if (secret !== process.env.INTERNAL_API_SECRET) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = await c.req.json();
    const cp = creditPurchaseSchema.parse(body);

    const db = getDb();
    const id = `${cp.professionalId}:${cp.packageId}:${cp.purchasedAt}`;
    db.query(`
      INSERT OR REPLACE INTO credit_purchases
        (id, professional_id, professional_name, professional_email, package_id, package_name,
         credits_granted, is_subscription, amount_gbp, purchased_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, cp.professionalId, cp.professionalName, cp.professionalEmail,
      cp.packageId, cp.packageName, cp.creditsGranted,
      cp.isSubscription ? 1 : 0, cp.amountGbp ?? null, cp.purchasedAt,
    );

    console.log(`[Users] Credit purchase recorded: ${cp.professionalName} bought ${cp.packageName}`);

    try {
      const type = cp.isSubscription ? 'SUBSCRIPTION' : 'CREDIT PACK';
      await sendNotificationEmail(
        OWNER_EMAIL,
        `${type}: ${cp.professionalName} purchased ${cp.packageName}`,
        `Professional: ${cp.professionalName} | Email: ${cp.professionalEmail} | Package: ${cp.packageName} | Credits: ${cp.creditsGranted} | Amount: ${cp.amountGbp ? `£${cp.amountGbp}` : 'N/A'} | Type: ${type}`,
      );
    } catch (emailErr) {
      console.error('[Users] Credit purchase email failed:', emailErr);
    }

    return c.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return c.json({ error: 'Invalid data', details: err.issues }, 400);
    }
    console.error('[Users] Error recording credit purchase:', err);
    return c.json({ error: 'Failed to record credit purchase' }, 500);
  }
});

// GET /api/users/admin - full admin dashboard data
usersRouter.get('/admin', (c) => {
  const secret = c.req.header('x-internal-secret');
  if (secret !== process.env.INTERNAL_API_SECRET) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const db = getDb();
    const leadPurchases = db.query(`SELECT * FROM lead_purchases ORDER BY created_at DESC`).all();
    const creditPurchases = db.query(`SELECT * FROM credit_purchases ORDER BY created_at DESC`).all();
    const jobPostings = db.query(`SELECT * FROM job_postings ORDER BY created_at DESC`).all();
    const users = db.query(`SELECT * FROM app_users ORDER BY created_at DESC`).all();

    const totalLeadRevenue = (leadPurchases as any[]).reduce((sum, p) => sum + (p.credits_spent || 0), 0);
    const totalCreditRevenue = (creditPurchases as any[]).reduce((sum, p) => sum + (p.amount_gbp || 0), 0);

    return c.json({
      summary: {
        totalLeadPurchases: leadPurchases.length,
        totalCreditPurchases: creditPurchases.length,
        totalJobPostings: jobPostings.length,
        totalUsers: users.length,
        totalCreditsSpentOnLeads: totalLeadRevenue,
        totalRevenueGbp: totalCreditRevenue,
      },
      leadPurchases,
      creditPurchases,
      jobPostings,
      users,
    });
  } catch (err) {
    console.error('[Admin] Error fetching admin data:', err);
    return c.json({ error: 'Failed to fetch admin data' }, 500);
  }
});
usersRouter.get('/lookup', (c) => {
  const secret = c.req.header('x-internal-secret');
  if (secret !== process.env.INTERNAL_API_SECRET) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const email = c.req.query('email');
  if (!email) {
    return c.json({ error: 'Missing email parameter' }, 400);
  }

  try {
    const db = getDb();
    const user = db.query(`SELECT * FROM app_users WHERE LOWER(email) = LOWER(?) LIMIT 1`).get(email) as any;
    if (!user) {
      return c.json({ found: false });
    }
    return c.json({
      found: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        tradeCategories: user.trade_categories ? user.trade_categories.split(',') : [],
        isPremium: user.is_premium === 1,
        registeredAt: user.registered_at,
      },
    });
  } catch (err) {
    console.error('[Users] Error looking up user:', err);
    return c.json({ error: 'Failed to lookup user' }, 500);
  }
});

usersRouter.get('/', (c) => {
  const secret = c.req.header('x-internal-secret');
  if (secret !== process.env.INTERNAL_API_SECRET) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const db = getDb();
    const users = db.query(`SELECT * FROM app_users ORDER BY created_at DESC`).all();
    const purchases = db.query(`SELECT * FROM lead_purchases ORDER BY created_at DESC`).all();
    return c.json({ users, purchases });
  } catch (err) {
    console.error('[Users] Error fetching users:', err);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

export { usersRouter };
