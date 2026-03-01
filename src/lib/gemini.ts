import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client
// We use a singleton pattern to avoid re-initializing on every render
let aiClient: GoogleGenAI | null = null;

export const getGeminiClient = () => {
  if (!aiClient) {
    // Priority: 1. LocalStorage (User provided), 2. Environment Variable (Build time)
    const apiKey = localStorage.getItem("GEMINI_API_KEY") || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set");
      throw new Error("API Key Missing");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

export const resetGeminiClient = () => {
  aiClient = null;
};

export const handleGeminiError = (error: any): string => {
  console.error("Gemini API Error:", error);
  const msg = error.message || error.toString();
  
  if (msg.includes("API Key") || msg.includes("API_KEY")) {
    return "API Key Missing. Please check Settings.";
  }
  if (msg.includes("403")) {
    return "Access Denied (403). Key invalid or restricted.";
  }
  if (msg.includes("404")) {
    return "Model not found (404). Check key permissions.";
  }
  if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota")) {
    return "Quota Exceeded (429). Please wait or use a paid key.";
  }
  if (msg.includes("500") || msg.includes("503")) {
    return "Google Server Error. Please try again later.";
  }
  return `Error: ${msg.substring(0, 100)}...`;
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

export async function generateContentWithFallback(client: GoogleGenAI, params: any) {
  try {
    return await client.models.generateContent(params);
  } catch (error: any) {
    const msg = error.message || error.toString();
    // Only retry on 429 (Quota) or 503 (Overloaded)
    if (msg.includes("429") || msg.includes("503")) {
      // Determine fallback model
      let fallbackModel = null;
      
      if (params.model === MODELS.PRO) {
        fallbackModel = MODELS.FLASH;
      } else if (params.model === MODELS.FLASH) {
        fallbackModel = MODELS.FLASH_LITE;
      } else if (params.model === MODELS.SEARCH) {
        fallbackModel = MODELS.FLASH; 
      }

      if (fallbackModel && fallbackModel !== params.model) {
        console.warn(`Quota exceeded for ${params.model}. Retrying with fallback: ${fallbackModel}`);
        
        // Remove tools if falling back to a model that might not support them (though Flash supports most)
        const newConfig = { ...params.config };
        if (newConfig.thinkingConfig) {
          delete newConfig.thinkingConfig; // Flash doesn't support thinking mode
        }

        return await client.models.generateContent({
          ...params,
          model: fallbackModel,
          config: newConfig
        });
      }
    }
    throw error;
  }
}
