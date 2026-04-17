import "@vibecodeapp/proxy"; // DO NOT REMOVE OTHERWISE VIBECODE PROXY WILL NOT WORK
import { Hono } from "hono";
import { cors } from "hono/cors";
import "./env";
import { sampleRouter } from "./routes/sample";
import { aiRouter } from "./routes/ai";
import { trialRouter } from "./routes/trial";
import { jobsRouter } from "./routes/jobs";
import { usersRouter } from "./routes/users";
import { webhooksRouter } from "./routes/webhooks";
import { professionalsRouter } from "./routes/professionals";
import { guidesRouter } from "./routes/guides";
import { stripeRouter } from "./routes/stripe";
import { logger } from "hono/logger";

const app = new Hono();

// CORS middleware - validates origin against allowlist
const allowed = [
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https:\/\/[a-z0-9-]+\.dev\.vibecode\.run$/,
  /^https:\/\/[a-z0-9-]+\.vibecode\.run$/,
  /^https:\/\/.*\.a2bsolution\.org$/,
  /^https:\/\/www\.glossyquotes\.com$/,
  /^https:\/\/glossyquotes\.com$/,
  /^https?:\/\/.*\.expo\.dev$/,
];

app.use(
  "*",
  cors({
    origin: (origin) => (origin && allowed.some((re) => re.test(origin)) ? origin : null),
    credentials: true,
  })
);

// Simple in-memory rate limiter: max requests per IP per window
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 60;       // requests
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute

function rateLimit(c: any, next: () => Promise<any>) {
  const ip = c.req.header('x-forwarded-for')?.split(',')[0].trim() || c.req.header('x-real-ip') || 'unknown';
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return c.json({ error: 'Too many requests' }, 429);
  }

  return next();
}

// Cleanup old entries every 5 minutes to prevent unbounded growth
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitStore) {
    if (now > val.resetAt) rateLimitStore.delete(key);
  }
}, 5 * 60_000);

// Apply rate limiting to all routes
app.use("*", rateLimit);

// Logging
app.use("*", logger());

// Health check endpoint
app.get("/health", (c) => c.json({ status: "ok" }));

// Routes
app.route("/api/sample", sampleRouter);
app.route("/api/ai", aiRouter);
app.route("/api/trial", trialRouter);
app.route("/api/jobs", jobsRouter);
app.route("/api/users", usersRouter);
app.route("/api/webhooks", webhooksRouter);
app.route("/api/professionals", professionalsRouter);

// Public guide pages (Answer Hub — for SEO/AEO indexing)
app.route("/guides", guidesRouter);

// Stripe payments
app.route("/api/stripe", stripeRouter);

const port = Number(process.env.PORT) || 3000;

export default {
  port,
  fetch: app.fetch,
};
