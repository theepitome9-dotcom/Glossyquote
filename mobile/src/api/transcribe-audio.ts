/*
IMPORTANT NOTICE: DO NOT REMOVE
This is a secure backend-proxied audio transcription service.
API keys are kept server-side and never exposed to the client.
*/

const BACKEND_URL = process.env.EXPO_PUBLIC_VIBECODE_BACKEND_URL || "";
const INTERNAL_KEY = process.env.EXPO_PUBLIC_INTERNAL_API_SECRET || "";

/**
 * Transcribe an audio file
 * @param localAudioUri - The local URI of the audio file to transcribe. Obtained via the expo-av library.
 * @returns The text of the audio file
 */
export const transcribeAudio = async (localAudioUri: string) => {
  try {
    const formData = new FormData();
    formData.append("file", {
      uri: localAudioUri,
      type: "audio/m4a",
      name: "recording.m4a",
    } as any);
    formData.append("model", "gpt-4o-transcribe");
    formData.append("language", "en");

    const response = await fetch(`${BACKEND_URL}/api/ai/openai/transcribe`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Transcription failed: ${errorText}`);
    }

    const result = await response.json();
    return result.text;
  } catch (error) {
    if (__DEV__) {
      console.error("Transcription error:", error);
    }
    throw error;
  }
};
