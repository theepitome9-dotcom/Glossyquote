import type { MiddlewareHandler } from "hono";

/**
 * Internal API Key Authentication Middleware
 *
 * Validates requests using a shared secret between the mobile app and backend.
 * This prevents unauthorized public access to AI proxy endpoints that forward
 * requests to expensive third-party APIs (OpenAI, Anthropic, Grok).
 *
 * The secret is set in INTERNAL_API_SECRET env var and sent by the mobile
 * client as the X-Internal-Key header.
 */
export const requireInternalKey: MiddlewareHandler = async (c, next) => {
  const secret = process.env.INTERNAL_API_SECRET;

  // If no secret is configured, block all requests (misconfigured server)
  if (!secret) {
    console.error("[Auth] INTERNAL_API_SECRET is not configured");
    return c.json({ error: "Server misconfigured" }, 500);
  }

  const provided = c.req.header("X-Internal-Key");

  if (!provided || provided !== secret) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  await next();
};
