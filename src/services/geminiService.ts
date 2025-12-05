import { HandAnalysis, OutfitAnalysis } from "../types";
import { rateLimiter, RATE_LIMITS } from "../lib/rateLimiter";
import { supabase } from "../lib/supabase";

// Call Supabase Edge Function (API key is secure on server)
const callEdgeFunction = async (action: string, data: any) => {
  const { data: result, error } = await supabase.functions.invoke("generate-design", {
    body: { action, ...data },
  });

  if (error) throw new Error(error.message);
  if (result?.error) throw new Error(result.error);
  return result;
};

export const analyzeHandImage = async (base64Image: string): Promise<HandAnalysis> => {
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
    const image = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const result = await callEdgeFunction("analyze-hand", { image });
    return result || fallbackAnalysis;
  } catch (error: any) {
    console.error("Hand analysis failed:", error.message);
    return fallbackAnalysis;
  }
};

export const analyzeOutfitImage = async (base64Image: string): Promise<OutfitAnalysis> => {
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
    const image = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const result = await callEdgeFunction("analyze-outfit", { image });
    return result || fallbackAnalysis;
  } catch (error: any) {
    console.error("Outfit analysis failed:", error.message);
    return fallbackAnalysis;
  }
};

export const generateStyleThumbnail = async (styleName: string, description: string): Promise<string> => {
  throw new Error("Image generation requires an image generation service");
};

export const generateHennaDesign = async (
  base64Image: string,
  stylePrompt: string,
  outfitContext?: string
): Promise<string> => {
  const cooldownCheck = rateLimiter.checkCooldown('ai-design-generation', RATE_LIMITS.AI_GENERATION.cooldown);
  if (!cooldownCheck.allowed) {
    throw new Error(`Please wait ${cooldownCheck.retryAfter} seconds before generating another design.`);
  }

  const rateCheck = rateLimiter.checkLimit('ai-design-generation', RATE_LIMITS.AI_GENERATION.max, RATE_LIMITS.AI_GENERATION.window);
  if (!rateCheck.allowed) {
    throw new Error(`You've reached the generation limit. Please wait ${rateCheck.retryAfter} seconds before trying again.`);
  }

  try {
    const image = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const result = await callEdgeFunction("generate", { image, stylePrompt, outfitContext });
    return result.image;
  } catch (error: any) {
    console.error("Design generation failed:", error.message);
    
    if (error.message.includes('429') || error.message.includes('quota')) {
      throw new Error("AI service is temporarily busy. Please wait 30 seconds and try again.");
    }
    
    throw new Error("Unable to generate design. Please try again or browse our gallery for inspiration.");
  }
};

export const generateHennaDesignPro = async (
  base64Image: string,
  stylePrompt: string,
  outfitContext?: string
): Promise<string> => {
  const cooldownCheck = rateLimiter.checkCooldown('ai-design-generation-pro', 30000);
  if (!cooldownCheck.allowed) {
    throw new Error(`Pro generation cooldown. Please wait ${cooldownCheck.retryAfter} seconds.`);
  }

  const rateCheck = rateLimiter.checkLimit('ai-design-generation-pro', 5, 86400000);
  if (!rateCheck.allowed) {
    const waitHours = rateCheck.retryAfter ? Math.ceil(rateCheck.retryAfter / 3600) : 24;
    throw new Error(`Pro generation limit reached (5 per day). Please wait ${waitHours} hours.`);
  }

  return generateHennaDesign(base64Image, stylePrompt, outfitContext);
};
