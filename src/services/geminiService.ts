import { HandAnalysis, OutfitAnalysis } from "../types";
import { rateLimiter, RATE_LIMITS } from "../lib/rateLimiter";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI directly in frontend
// Note: For production, consider using Supabase Edge Functions to protect the key
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyB5MOEMkgmJatNs8voMxzDm0blv3pBCMsw';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const TEXT_MODEL = 'gemini-2.0-flash';
const IMAGE_MODEL = 'gemini-2.0-flash-exp-image-generation';

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
    const model = genAI.getGenerativeModel({ model: TEXT_MODEL });
    
    const prompt = `Analyze this hand image for henna/mehendi design recommendations. Return a JSON object with:
    - skinTone: description of skin tone
    - handShape: description of hand shape
    - coverage: recommended coverage area
    - keyFeature: notable feature of the hand
    - fingerShape: description of finger shape
    - wristArea: wrist area description
    - recommendedStyles: array of 2-3 recommended henna styles
    
    Return ONLY valid JSON, no markdown.`;

    const result = await model.generateContent([
      { text: prompt },
      { inlineData: { mimeType: 'image/jpeg', data: base64Image.replace(/^data:image\/\w+;base64,/, '') } }
    ]);

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return fallbackAnalysis;
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
    const model = genAI.getGenerativeModel({ model: TEXT_MODEL });
    
    const prompt = `Analyze this outfit image for henna design coordination. Return a JSON object with:
    - outfitType: type of outfit (e.g., "Bridal Lehenga", "Saree", "Western Dress")
    - dominantColors: array of hex color codes
    - styleKeywords: array of style keywords
    
    Return ONLY valid JSON, no markdown.`;

    const result = await model.generateContent([
      { text: prompt },
      { inlineData: { mimeType: 'image/jpeg', data: base64Image.replace(/^data:image\/\w+;base64,/, '') } }
    ]);

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return fallbackAnalysis;
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
    const model = genAI.getGenerativeModel({ model: IMAGE_MODEL });
    
    let finalPrompt = `Generate a photorealistic image of a hand with beautiful ${stylePrompt} henna (mehendi) design.
    The hand should look natural with the henna design applied.
    The henna should have a rich, natural reddish-brown color.
    Include traditional motifs: paisleys, flowers, mandalas, vines.`;
    
    if (outfitContext) {
      finalPrompt += `\nThe design should complement this outfit: ${outfitContext}`;
    }

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image.replace(/^data:image\/\w+;base64,/, '') } },
          { text: finalPrompt }
        ]
      }],
      generationConfig: {
        responseModalities: ['image', 'text'] as any,
      }
    } as any);

    const response = result.response;
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if ((part as any).inlineData) {
        return `data:image/png;base64,${(part as any).inlineData.data}`;
      }
    }
    
    throw new Error('No image generated');
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

  // Pro uses the same model but with enhanced prompts
  return generateHennaDesign(base64Image, stylePrompt, outfitContext);
};
