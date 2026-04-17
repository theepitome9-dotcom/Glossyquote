/*
IMPORTANT NOTICE: DO NOT REMOVE
This is a secure backend-proxied client for the Anthropic API.
API keys are kept server-side and never exposed to the client.

Valid model names:
claude-sonnet-4-20250514
claude-3-7-sonnet-latest
claude-3-5-haiku-latest
*/

const BACKEND_URL = process.env.EXPO_PUBLIC_VIBECODE_BACKEND_URL || "";
const INTERNAL_KEY = process.env.EXPO_PUBLIC_INTERNAL_API_SECRET || "";

export const getAnthropicClient = () => {
  return {
    messages: {
      create: async (params: Record<string, unknown>) => {
        const response = await fetch(`${BACKEND_URL}/api/ai/anthropic/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Internal-Key": INTERNAL_KEY },
          body: JSON.stringify(params),
        });
        if (!response.ok) {
          const err = await response.text();
          throw new Error(`Anthropic proxy error: ${err}`);
        }
        return response.json();
      },
    },
  };
};
