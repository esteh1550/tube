import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client
// We use a singleton pattern to avoid re-initializing on every render
let aiClient: GoogleGenAI | null = null;

export const getGeminiClient = () => {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set");
      throw new Error("GEMINI_API_KEY is required");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

export const MODELS = {
  FLASH: "gemini-2.5-flash-latest", 
  FLASH_LITE: "gemini-2.5-flash-lite-latest",
  PRO: "gemini-3.1-pro-preview",
  IMAGE_PRO: "gemini-3.1-flash-image-preview", // Updated to the latest preview for high quality
  SEARCH: "gemini-3-flash-preview",
  VEO: "veo-3.1-fast-generate-preview",
  AUDIO_TRANSCRIPTION: "gemini-3-flash-preview", // Using Flash for transcription
  TTS: "gemini-2.5-flash-preview-tts",
  AUDIO_LIVE: "gemini-2.5-flash-native-audio-preview-09-2025"
};
