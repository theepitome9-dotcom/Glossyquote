/*
IMPORTANT NOTICE: DO NOT REMOVE
This is a secure backend-proxied client for the Grok API.
API keys are kept server-side and never exposed to the client.

grok-3-latest
grok-3-fast-latest
grok-3-mini-latest
*/

const BACKEND_URL = process.env.EXPO_PUBLIC_VIBECODE_BACKEND_URL || "";
const INTERNAL_KEY = process.env.EXPO_PUBLIC_INTERNAL_API_SECRET || "";

export const getGrokClient = () => {
  return {
    chat: {
      completions: {
        create: async (params: Record<string, unknown>) => {
          const response = await fetch(`${BACKEND_URL}/api/ai/grok/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Internal-Key": INTERNAL_KEY },
            body: JSON.stringify(params),
          });
          if (!response.ok) {
            const err = await response.text();
            throw new Error(`Grok proxy error: ${err}`);
          }
          return response.json();
        },
      },
    },
  };
};
