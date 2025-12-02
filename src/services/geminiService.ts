import { HandAnalysis, OutfitAnalysis } from "../types";

// Use Gemini API directly from frontend
const GEMINI_API_KEY = 'AIzaSyBmE26lEC7izfY_ERA1wBXpxBVKUFwF7pQ';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const IMAGE_GEN_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';

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
    // Create detailed prompt for henna design generation
    const prompt = `Generate a beautiful ${stylePrompt} henna/mehendi design on this hand. ${outfitContext ? `The design should complement: ${outfitContext}.` : ''} 
    
The design should:
- Follow traditional henna art patterns
- Be intricate and detailed
- Cover fingers, palm, and wrist appropriately
- Look natural and elegant on the hand
- Use traditional motifs like paisleys, flowers, mandalas, vines
- Be photorealistic and high quality`;

    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    
    const response = await fetch(`${IMAGE_GEN_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64Data
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 4096,
        }
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Image generation error:', error);
      throw new Error(`Image generation failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract generated image from response
    if (data.candidates && data.candidates[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.inline_data) {
          return `data:${part.inline_data.mime_type};base64,${part.inline_data.data}`;
        }
      }
    }
    
    throw new Error('No image generated in response');
  } catch (error) {
    console.error("Design generation failed", error);
    throw new Error("Unable to generate design. Please try again or browse our gallery for inspiration.");
  }
};
