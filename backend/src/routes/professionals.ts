import { Hono } from 'hono';
import { z } from 'zod';
import { getDb } from '../db/database';

const professionalsRouter = new Hono();

const reviewSchema = z.object({
  id: z.string(),
  customerName: z.string().max(100),
  rating: z.number().min(1).max(5),
  comment: z.string().max(2000),
  professionalResponse: z.string().max(2000).optional().nullable(),
  createdAt: z.string(),
});

const portfolioItemSchema = z.object({
  id: z.string(),
  uri: z.string().max(2000),
  type: z.enum(['photo', 'video']),
  caption: z.string().max(500).optional().nullable(),
  uploadedAt: z.string(),
});

const profileSchema = z.object({
  id: z.string().max(128),
  name: z.string().min(1).max(100),
  tradeCategories: z.array(z.string().max(100)).max(20),
  profileDescription: z.string().max(2000).optional().nullable(),
  rating: z.number().min(0).max(5),
  totalReviews: z.number().int().min(0),
  reviews: z.array(reviewSchema).max(200),
  portfolio: z.array(portfolioItemSchema).max(50),
  isPremium: z.boolean().optional().default(false),
});

// POST /api/professionals/profile — save or update a public profile snapshot
// Uses internal secret so only the app can publish profiles
professionalsRouter.post('/profile', async (c) => {
  const secret = c.req.header('x-internal-secret');
  if (secret !== process.env.INTERNAL_API_SECRET) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = await c.req.json();
    const data = profileSchema.parse(body);

    const db = getDb();
    db.query(`
      INSERT OR REPLACE INTO professional_profiles
        (id, name, trade_categories, profile_description, rating, total_reviews,
         reviews_json, portfolio_json, is_premium, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      data.id,
      data.name,
      data.tradeCategories.join(','),
      data.profileDescription ?? null,
      data.rating,
      data.totalReviews,
      JSON.stringify(data.reviews),
      JSON.stringify(data.portfolio),
      data.isPremium ? 1 : 0,
    );

    console.log(`[Professionals] Profile published: ${data.name} (${data.id})`);
    return c.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return c.json({ error: 'Invalid profile data', details: err.issues }, 400);
    }
    console.error('[Professionals] Error saving profile:', err);
    return c.json({ error: 'Failed to save profile' }, 500);
  }
});

// GET /api/professionals/:id/public — public profile, no auth required
professionalsRouter.get('/:id/public', (c) => {
  const id = c.req.param('id');

  try {
    const db = getDb();
    const row = db.query(`
      SELECT id, name, trade_categories, profile_description, rating, total_reviews,
             reviews_json, portfolio_json, is_premium, updated_at
      FROM professional_profiles
      WHERE id = ?
    `).get(id) as {
      id: string;
      name: string;
      trade_categories: string;
      profile_description: string | null;
      rating: number;
      total_reviews: number;
      reviews_json: string;
      portfolio_json: string;
      is_premium: number;
      updated_at: string;
    } | undefined;

    if (!row) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    return c.json({
      id: row.id,
      name: row.name,
      tradeCategories: row.trade_categories ? row.trade_categories.split(',') : [],
      profileDescription: row.profile_description,
      rating: row.rating,
      totalReviews: row.total_reviews,
      reviews: JSON.parse(row.reviews_json || '[]'),
      portfolio: JSON.parse(row.portfolio_json || '[]'),
      isPremium: row.is_premium === 1,
      updatedAt: row.updated_at,
    });
  } catch (err) {
    console.error('[Professionals] Error fetching public profile:', err);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

export { professionalsRouter };
