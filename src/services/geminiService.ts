import { GoogleGenAI, Type } from "@google/genai";
import { HandAnalysis, OutfitAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY });

// Use gemini-2.0-flash for text/analysis (higher free tier limits)
const TEXT_MODEL = "gemini-2.0-flash";
// Use image model for generation (lower limits)
const IMAGE_MODEL = "gemini-2.0-flash-exp-image-generation";

export const analyzeHandImage = async (base64Image: string): Promise<HandAnalysis> => {
  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: `Analyze this image of a hand for henna (mehndi) design placement. 
            Provide a JSON response with:
            - skinTone: The skin tone description.
            - handShape: The general shape (e.g., Slender, Broad, Square).
            - coverage: Recommendation for design coverage.
            - keyFeature: A unique anatomical feature.
            - fingerShape: Description of fingers.
            - wristArea: Suitability for wrist designs.
            - recommendedStyles: Array of 2-3 traditional henna styles.` },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            skinTone: { type: Type.STRING },
            handShape: { type: Type.STRING },
            coverage: { type: Type.STRING },
            keyFeature: { type: Type.STRING },
            fingerShape: { type: Type.STRING },
            wristArea: { type: Type.STRING },
            recommendedStyles: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No analysis returned");
    
    // Try to parse JSON, handle potential truncation
    try {
      return JSON.parse(text) as HandAnalysis;
    } catch (parseError) {
      console.error("JSON parse error, attempting to fix:", parseError);
      // Try to extract valid JSON from potentially truncated response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]) as HandAnalysis;
        } catch {
          // Fall through to default
        }
      }
      throw parseError;
    }
  } catch (error: any) {
    console.error("Analysis failed", error);
    // Check if rate limited
    if (error?.message?.includes('429') || error?.message?.includes('quota')) {
      throw new Error("Rate limited. Please wait a moment and try again.");
    }
    // Return fallback analysis instead of failing
    return {
      skinTone: "Warm/Neutral",
      handShape: "Classic",
      coverage: "Optimal for full coverage",
      keyFeature: "Unique finger length",
      fingerShape: "Highlights elegant structure",
      wristArea: "Ideal for intricate wrist work",
      recommendedStyles: ["Arabic", "Minimalist"],
    };
  }
};


export const analyzeOutfitImage = async (base64Image: string): Promise<OutfitAnalysis> => {
  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: `Analyze this outfit image for fashion style and colors.
            Provide a JSON response with:
            - outfitType: One of "Traditional Lehenga", "Modern Gown", "Saree", or "Fusion/Other".
            - dominantColors: An array of 2-3 dominant hex color codes.
            - styleKeywords: An array of 2-3 descriptive style keywords.` },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            outfitType: { type: Type.STRING },
            dominantColors: { type: Type.ARRAY, items: { type: Type.STRING } },
            styleKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No analysis returned");
    return JSON.parse(text) as OutfitAnalysis;
  } catch (error) {
    console.error("Outfit analysis failed", error);
    return {
      outfitType: "Traditional Lehenga",
      dominantColors: ["#8F3E27", "#D8A85B"],
      styleKeywords: ["Embroidered", "Traditional"]
    };
  }
};

export const generateStyleThumbnail = async (styleName: string, description: string): Promise<string> => {
  try {
    const prompt = `Professional photography, close-up of a hand with ${styleName} henna design. ${description}. High resolution, intricate details, photorealistic, neutral background.`;

    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: { parts: [{ text: prompt }] },
      config: {
        responseModalities: ["image", "text"],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image generated");
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
    let finalPrompt = `Generate a high-quality, photorealistic image of this exact hand with a beautiful ${stylePrompt} henna (mehndi) design applied to it. Keep the background and hand position exactly the same if possible. Focus on intricate details and rich stain color.`;
    
    if (outfitContext) {
      finalPrompt += ` The design should complement an outfit described as: ${outfitContext}.`;
    }

    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: finalPrompt },
        ],
      },
      config: {
        responseModalities: ["image", "text"],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image generated");
  } catch (error) {
    console.error("Generation failed", error);
    throw error;
  }
};
