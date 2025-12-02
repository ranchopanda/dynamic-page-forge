import { HandAnalysis, OutfitAnalysis } from "../types";

// API base URL from environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper to make authenticated API calls
const apiCall = async <T>(endpoint: string, body: object): Promise<T> => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for auth
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  return response.json();
};

export const analyzeHandImage = async (base64Image: string): Promise<HandAnalysis> => {
  const fallbackAnalysis: HandAnalysis = {
    skinTone: "Warm/Neutral",
    handShape: "Classic",
    coverage: "Optimal for full coverage",
    keyFeature: "Unique finger length",
    fingerShape: "Highlights elegant structure",
    wristArea: "Ideal for intricate wrist work",
    recommendedStyles: ["Arabic", "Minimalist"],
  };

  try {
    return await apiCall<HandAnalysis>('/ai/analyze-hand', { image: base64Image });
  } catch (error: any) {
    console.error("Analysis failed", error);
    if (error?.message?.includes('429') || error?.message?.includes('Rate limited')) {
      throw new Error("Rate limited. Please wait a moment and try again.");
    }
    return fallbackAnalysis;
  }
};


export const analyzeOutfitImage = async (base64Image: string): Promise<OutfitAnalysis> => {
  const fallbackAnalysis: OutfitAnalysis = {
    outfitType: "Traditional Lehenga",
    dominantColors: ["#8F3E27", "#D8A85B"],
    styleKeywords: ["Embroidered", "Traditional"]
  };

  try {
    return await apiCall<OutfitAnalysis>('/ai/analyze-outfit', { image: base64Image });
  } catch (error) {
    console.error("Outfit analysis failed", error);
    return fallbackAnalysis;
  }
};

export const generateStyleThumbnail = async (styleName: string, description: string): Promise<string> => {
  // This function is typically admin-only, redirect to backend
  const prompt = `Professional photography, close-up of a hand with ${styleName} henna design. ${description}. High resolution, intricate details, photorealistic, neutral background.`;
  
  try {
    const result = await apiCall<{ image: string }>('/ai/generate-design', {
      image: '', // Empty for thumbnail generation
      stylePrompt: prompt,
    });
    return result.image;
  } catch (error) {
    console.error("Thumbnail generation failed", error);
    throw error;
  }
};

export const generateHennaDesign = async (
  base64Image: string,
  stylePrompt: string,
  outfitContext?: string
): Promise<string> => {
  try {
    const result = await apiCall<{ image: string }>('/ai/generate-design', {
      image: base64Image,
      stylePrompt,
      outfitContext,
    });
    return result.image;
  } catch (error) {
    console.error("Generation failed", error);
    throw error;
  }
};
