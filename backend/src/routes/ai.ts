import { Hono } from "hono";
import { requireInternalKey } from "../middleware/auth";

const ai = new Hono();

// All AI routes require the internal API key
ai.use("*", requireInternalKey);

const MAX_BODY_BYTES = 1 * 1024 * 1024; // 1 MB limit for JSON bodies

const jsonProxy = async (response: Response) => {
  const text = await response.text();
  return new Response(text, {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
};

// ─── OpenAI Chat ────────────────────────────────────────────────────────────
ai.post("/openai/chat", async (c) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return c.json({ error: "OpenAI not configured" }, 500);

  const contentLength = Number(c.req.header("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) return c.json({ error: "Request too large" }, 413);

  const body = await c.req.json();
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
  return jsonProxy(response);
});

// ─── OpenAI Transcription ────────────────────────────────────────────────────
ai.post("/openai/transcribe", async (c) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return c.json({ error: "OpenAI not configured" }, 500);

  const formData = await c.req.formData();
  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });
  return jsonProxy(response);
});

// ─── Anthropic Chat ──────────────────────────────────────────────────────────
ai.post("/anthropic/chat", async (c) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return c.json({ error: "Anthropic not configured" }, 500);

  const contentLength = Number(c.req.header("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) return c.json({ error: "Request too large" }, 413);

  const body = await c.req.json();
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });
  return jsonProxy(response);
});

// ─── Grok Chat ───────────────────────────────────────────────────────────────
ai.post("/grok/chat", async (c) => {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) return c.json({ error: "Grok not configured" }, 500);

  const contentLength = Number(c.req.header("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) return c.json({ error: "Request too large" }, 413);

  const body = await c.req.json();
  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
  return jsonProxy(response);
});

export { ai as aiRouter };
