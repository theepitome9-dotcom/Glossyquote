/*
IMPORTANT NOTICE: DO NOT REMOVE
This is a secure backend-proxied client for the OpenAI API.
API keys are kept server-side and never exposed to the client.

valid model names:
gpt-4.1-2025-04-14
o4-mini-2025-04-16
gpt-4o-2024-11-20
*/

const BACKEND_URL = process.env.EXPO_PUBLIC_VIBECODE_BACKEND_URL || "";
const INTERNAL_KEY = process.env.EXPO_PUBLIC_INTERNAL_API_SECRET || "";

export const getOpenAIClient = () => {
  return {
    chat: {
      completions: {
        create: async (params: Record<string, unknown>) => {
          const response = await fetch(`${BACKEND_URL}/api/ai/openai/chat`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Internal-Key": INTERNAL_KEY,
            },
            body: JSON.stringify(params),
          });
          if (!response.ok) {
            const err = await response.text();
            throw new Error(`OpenAI proxy error: ${err}`);
          }
          return response.json();
        },
      },
    },
  };
};
