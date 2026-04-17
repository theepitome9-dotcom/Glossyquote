import { Hono } from 'hono';
import { sendNotificationEmail } from '../lib/email';

const webhooksRouter = new Hono();

const OWNER_EMAIL = process.env.OWNER_NOTIFICATION_EMAIL || 'a2bsolutionsdev@gmail.com';

// POST /api/webhooks/revenuecat - RevenueCat subscription event notifications
webhooksRouter.post('/revenuecat', async (c) => {
  try {
    const body = await c.req.json();
    const event = body?.event;

    if (!event) {
      return c.json({ error: 'Invalid payload' }, 400);
    }

    const type: string = event.type ?? '';
    const appUserId: string = event.app_user_id ?? '';
    const productId: string = event.product_id ?? '';
    const price: number | null = event.price ?? null;
    const currency: string = event.currency ?? 'GBP';
    const periodType: string = event.period_type ?? '';
    const environment: string = event.environment ?? '';

    console.log(`[Webhook] RevenueCat event: ${type} | user: ${appUserId} | product: ${productId}`);

    // Only notify for high-value subscription events (not routine renewals/expirations)
    const notifyEvents: Record<string, string> = {
      INITIAL_PURCHASE: 'New Subscription Started',
      CANCELLATION: 'Subscription Cancelled',
      BILLING_ISSUE: 'Billing Issue',
    };

    const label = notifyEvents[type];
    if (!label) {
      // Ignore events we don't care about (e.g. trial_started, etc.)
      return c.json({ received: true });
    }

    const isTrial = periodType === 'TRIAL';
    const priceStr = price != null ? ` | £${price} ${currency}` : '';
    const trialStr = isTrial ? ' (Trial)' : '';
    const envStr = environment === 'SANDBOX' ? ' [SANDBOX]' : '';

    try {
      await sendNotificationEmail(
        OWNER_EMAIL,
        `${label}${trialStr}${envStr}: ${appUserId}`,
        `${label}${trialStr}${envStr}: User ${appUserId} | Product: ${productId}${priceStr}`,
      );
      console.log(`[Webhook] Notification sent for ${type}`);
    } catch (emailErr) {
      console.error('[Webhook] Email notification failed:', emailErr);
    }

    return c.json({ received: true });
  } catch (err) {
    console.error('[Webhook] Error processing RevenueCat event:', err);
    return c.json({ error: 'Internal error' }, 500);
  }
});

export { webhooksRouter };
