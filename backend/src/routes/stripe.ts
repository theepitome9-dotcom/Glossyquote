import { Hono } from "hono";
import { z } from "zod";
import Stripe from "stripe";

const stripeRouter = new Hono();

const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key);
};

// Product definitions — prices in pence (GBP)
const PRODUCTS: Record<string, { name: string; amount: number; mode: "payment" | "subscription"; interval?: "month" | "year"; trialDays?: number }> = {
  monthly:           { name: "Premium Monthly — 60 credits/month", amount: 4900,  mode: "subscription", interval: "month", trialDays: 7 },
  annual:            { name: "Premium Annual — 720 credits/year",  amount: 49000, mode: "subscription", interval: "year" },
  trial_pack:        { name: "Trial Pack — 10 Credits",            amount: 1500,  mode: "payment" },
  starter_pack:      { name: "Starter Pack — 28 Credits",          amount: 3500,  mode: "payment" },
  professional_pack: { name: "Professional Pack — 46 Credits",     amount: 5000,  mode: "payment" },
  business_pack:     { name: "Business Pack — 100 Credits",        amount: 9900,  mode: "payment" },
  premium_pack:      { name: "Premium Pack — 200 Credits",         amount: 16900, mode: "payment" },
  estimate:          { name: "Professional Estimate",              amount: 299,   mode: "payment" },
};

const checkoutSchema = z.object({
  productId: z.string(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  customerEmail: z.string().email().optional(),
  professionalId: z.string().optional(),
});

// GET /api/stripe/products
stripeRouter.get("/products", (c) => {
  const items = Object.entries(PRODUCTS).map(([id, p]) => ({
    id,
    name: p.name,
    amount: p.amount,
    currency: "gbp",
    formattedPrice: `£${(p.amount / 100).toFixed(2)}`,
    mode: p.mode,
    interval: p.interval ?? null,
    trialDays: p.trialDays ?? null,
  }));
  return c.json({ products: items });
});

// POST /api/stripe/checkout
stripeRouter.post("/checkout", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Invalid request", details: parsed.error.flatten() }, 400);
    }

    const { productId, successUrl, cancelUrl, customerEmail, professionalId } = parsed.data;
    const product = PRODUCTS[productId];
    if (!product) return c.json({ error: "Unknown product" }, 400);

    const stripe = getStripe();
    const metadata: Record<string, string> = { productId };
    if (professionalId) metadata.professionalId = professionalId;

    let session: Stripe.Checkout.Session;

    if (product.mode === "subscription") {
      session = await stripe.checkout.sessions.create({
        mode: "subscription",
        currency: "gbp",
        line_items: [{
          price_data: {
            currency: "gbp",
            product_data: { name: product.name },
            unit_amount: product.amount,
            recurring: { interval: product.interval! },
          },
          quantity: 1,
        }],
        subscription_data: {
          trial_period_days: product.trialDays,
          metadata,
        },
        customer_email: customerEmail,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata,
      });
    } else {
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        currency: "gbp",
        line_items: [{
          price_data: {
            currency: "gbp",
            product_data: { name: product.name },
            unit_amount: product.amount,
          },
          quantity: 1,
        }],
        customer_email: customerEmail,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata,
      });
    }

    return c.json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    console.error("[Stripe] Checkout error:", err.message);
    return c.json({ error: err.message ?? "Failed to create checkout session" }, 500);
  }
});

// POST /api/stripe/webhook
stripeRouter.post("/webhook", async (c) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const rawBody = await c.req.text();
  const signature = c.req.header("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } else {
      event = JSON.parse(rawBody) as Stripe.Event;
    }
  } catch (err: any) {
    console.error("[Stripe] Webhook signature error:", err.message);
    return c.json({ error: "Invalid signature" }, 400);
  }

  console.log(`[Stripe] Webhook: ${event.type}`);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const productId = session.metadata?.productId ?? "unknown";
    const professionalId = session.metadata?.professionalId;
    console.log(`[Stripe] Payment complete — product: ${productId}, professional: ${professionalId ?? "anon"}`);
  } else if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    console.log(`[Stripe] Subscription cancelled: ${sub.id}`);
  }

  return c.json({ received: true });
});

export { stripeRouter };
