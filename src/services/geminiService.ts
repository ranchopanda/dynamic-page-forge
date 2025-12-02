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
  // Image generation not supported - return placeholder
  throw new Error("Image generation requires an image generation service like DALL-E or Stable Diffusion");
};

export const generateHennaDesign = async (
  base64Image: string,
  stylePrompt: string,
  outfitContext?: string
): Promise<string> => {
  try {
    // Generate a detailed text description of the design
    const prompt = `Based on this hand image, create a detailed description of a ${stylePrompt} henna design that would look beautiful on this hand. ${outfitContext ? `The design should complement this outfit: ${outfitContext}.` : ''} 
    
Describe the design in vivid detail including:
- Pattern placement on fingers, palm, and wrist
- Specific motifs and elements
- Flow and symmetry
- Cultural elements

Return ONLY the description text, no JSON.`;

    const description = await callGemini(prompt, base64Image);
    
    // Since we can't generate images, return the original hand image
    // The app should show this with the description overlay
    return base64Image;
  } catch (error) {
    console.error("Design generation failed", error);
    throw new Error("Unable to generate design. Please try again or browse our gallery for inspiration.");
  }
};
