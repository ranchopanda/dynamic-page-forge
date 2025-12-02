import { HandAnalysis, OutfitAnalysis } from "../types";

// Use Gemini API directly from frontend
const GEMINI_API_KEY = 'AIzaSyBmE26lEC7izfY_ERA1wBXpxBVKUFwF7pQ';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Helper to call Gemini API directly
const callGemini = async (prompt: string, image?: string): Promise<string> => {
  const parts: any[] = [{ text: prompt }];
  
  if (image) {
    // Remove data URL prefix if present
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    parts.push({
      inline_data: {
        mime_type: 'image/jpeg',
        data: base64Data
      }
    });
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
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
    const prompt = `Analyze this hand image for henna/mehendi design. Return ONLY valid JSON with this structure:
{
  "skinTone": "description",
  "handShape": "description",
  "coverage": "description",
  "keyFeature": "description",
  "fingerShape": "description",
  "wristArea": "description",
  "recommendedStyles": ["style1", "style2"]
}`;

    const result = await callGemini(prompt, base64Image);
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return fallbackAnalysis;
  } catch (error: any) {
    console.error("Analysis failed", error);
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
    const prompt = `Analyze this outfit image. Return ONLY valid JSON:
{
  "outfitType": "description",
  "dominantColors": ["#hex1", "#hex2"],
  "styleKeywords": ["keyword1", "keyword2"]
}`;

    const result = await callGemini(prompt, base64Image);
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return fallbackAnalysis;
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
  // Note: Gemini can't generate images, only analyze
  // Return a placeholder or use the original image
  console.warn("Image generation not available - Gemini API doesn't support image generation");
  throw new Error("Image generation requires a separate service. Please use the gallery templates instead.");
};
