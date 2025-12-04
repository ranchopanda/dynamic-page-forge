import { HandAnalysis, OutfitAnalysis } from "../types";
import { rateLimiter, RATE_LIMITS } from "../lib/rateLimiter";

// SECURITY: API calls now go through server-side endpoints
// This protects the Gemini API key from being exposed in the browser
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper to get auth token from localStorage
const getAuthToken = (): string | null => {
  try {
    // Try to get Supabase session token
    const supabaseAuth = localStorage.getItem('henna-auth');
    if (supabaseAuth) {
      const parsed = JSON.parse(supabaseAuth);
      return parsed?.access_token || null;
    }
    // Fallback to old auth token
    return localStorage.getItem('auth_token');
  } catch {
    return null;
  }
};

// Helper to call server-side AI endpoints
const callServerAI = async (endpoint: string, body: any): Promise<any> => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `Server error: ${response.status}`);
  }

  return response.json();
};

export const analyzeHandImage = async (base64Image: string): Promise<HandAnalysis> => {
  // Check rate limit
  const cooldownCheck = rateLimiter.checkCooldown('ai-hand-analysis', RATE_LIMITS.AI_ANALYSIS.cooldown);
  if (!cooldownCheck.allowed) {
    throw new Error(`Please wait ${cooldownCheck.retryAfter} seconds before analyzing another image.`);
  }

  const rateCheck = rateLimiter.checkLimit('ai-hand-analysis', RATE_LIMITS.AI_ANALYSIS.max, RATE_LIMITS.AI_ANALYSIS.window);
  if (!rateCheck.allowed) {
    throw new Error(`Rate limit exceeded. Please wait ${rateCheck.retryAfter} seconds before trying again.`);
  }

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
    const result = await callServerAI('/ai/analyze-hand', { image: base64Image });
    return result;
  } catch (error: any) {
    console.error("Hand analysis failed:", error.message);
    return fallbackAnalysis;
  }
};


export const analyzeOutfitImage = async (base64Image: string): Promise<OutfitAnalysis> => {
  // Check rate limit
  const cooldownCheck = rateLimiter.checkCooldown('ai-outfit-analysis', RATE_LIMITS.AI_ANALYSIS.cooldown);
  if (!cooldownCheck.allowed) {
    throw new Error(`Please wait ${cooldownCheck.retryAfter} seconds before analyzing another outfit.`);
  }

  const rateCheck = rateLimiter.checkLimit('ai-outfit-analysis', RATE_LIMITS.AI_ANALYSIS.max, RATE_LIMITS.AI_ANALYSIS.window);
  if (!rateCheck.allowed) {
    throw new Error(`Rate limit exceeded. Please wait ${rateCheck.retryAfter} seconds before trying again.`);
  }

  const fallbackAnalysis: OutfitAnalysis = {
    outfitType: "Traditional Lehenga",
    dominantColors: ["#8F3E27", "#D8A85B"],
    styleKeywords: ["Embroidered", "Traditional"]
  };

  try {
    const result = await callServerAI('/ai/analyze-outfit', { image: base64Image });
    return result;
  } catch (error: any) {
    console.error("Outfit analysis failed:", error.message);
    return fallbackAnalysis;
  }
};

export const generateStyleThumbnail = async (styleName: string, description: string): Promise<string> => {
  // Image generation not supported - return placeholder
  throw new Error("Image generation requires an image generation service like DALL-E or Stable Diffusion");
};

export const generateHennaDesign = async (
  base64Image: string,
  stylePrompt: string,
  outfitContext?: string
): Promise<string> => {
  // Check rate limit with stricter limits for expensive AI generation
  const cooldownCheck = rateLimiter.checkCooldown('ai-design-generation', RATE_LIMITS.AI_GENERATION.cooldown);
  if (!cooldownCheck.allowed) {
    throw new Error(`Please wait ${cooldownCheck.retryAfter} seconds before generating another design.`);
  }

  const rateCheck = rateLimiter.checkLimit('ai-design-generation', RATE_LIMITS.AI_GENERATION.max, RATE_LIMITS.AI_GENERATION.window);
  if (!rateCheck.allowed) {
    throw new Error(`You've reached the generation limit. Please wait ${rateCheck.retryAfter} seconds before trying again.`);
  }

  try {
    const result = await callServerAI('/ai/generate-design', {
      image: base64Image,
      stylePrompt,
      outfitContext,
    });
    
    return result.image;
  } catch (error: any) {
    console.error("Design generation failed:", error.message);
    
    // Provide user-friendly error messages
    if (error.message.includes('429') || error.message.includes('quota')) {
      throw new Error("AI service is temporarily busy. Please wait 30 seconds and try again.");
    }
    
    throw new Error("Unable to generate design. Please try again or browse our gallery for inspiration.");
  }
};

/**
 * Generate henna design using PREMIUM AI model
 * Free for everyone with 5 per day limit
 */
export const generateHennaDesignPro = async (
  base64Image: string,
  stylePrompt: string,
  outfitContext?: string
): Promise<string> => {
  // Rate limiting for Pro: 5 per day (more expensive model)
  const cooldownCheck = rateLimiter.checkCooldown('ai-design-generation-pro', 30000); // 30s cooldown
  if (!cooldownCheck.allowed) {
    throw new Error(`Pro generation cooldown. Please wait ${cooldownCheck.retryAfter} seconds.`);
  }

  const rateCheck = rateLimiter.checkLimit('ai-design-generation-pro', 5, 86400000); // 5 per day (24 hours)
  if (!rateCheck.allowed) {
    const waitHours = rateCheck.retryAfter ? Math.ceil(rateCheck.retryAfter / 3600) : 24;
    throw new Error(`Pro generation limit reached (5 per day). Please wait ${waitHours} hours or sign up for unlimited access.`);
  }

  try {
    const result = await callServerAI('/ai/generate-design-pro', {
      image: base64Image,
      stylePrompt,
      outfitContext,
    });
    
    return result.image;
  } catch (error: any) {
    console.error("Pro design generation failed:", error.message);
    
    if (error.message.includes('quota') || error.message.includes('limit')) {
      throw new Error("You've reached your Pro generation limit (5 per day). Try again tomorrow or sign up for unlimited access.");
    }
    
    throw new Error("Pro generation failed. Please try Standard AI or Pattern Overlay.");
  }
};
