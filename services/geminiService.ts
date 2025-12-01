import { GoogleGenAI, Type } from "@google/genai";
import { HandAnalysis, OutfitAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Analyze the uploaded hand image
export const analyzeHandImage = async (base64Image: string): Promise<HandAnalysis> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
          {
            text: `Analyze this image of a hand for henna (mehndi) design placement. 
            Provide a JSON response with the following details:
            - skinTone: The skin tone description.
            - handShape: The general shape (e.g., Slender, Broad, Square).
            - coverage: Recommendation for design coverage (e.g., "Optimal for full coverage", "Suits minimal patterns").
            - keyFeature: A unique anatomical feature (e.g., "Long elegant fingers", "Prominent knuckles").
            - fingerShape: Description of fingers (e.g., "Tapered", "Straight").
            - wristArea: Suitability for wrist designs (e.g., "Ideal for intricate cuffs").
            - recommendedStyles: Array of 2-3 traditional henna styles that would suit this hand.`,
          },
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
            recommendedStyles: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No analysis returned");
    return JSON.parse(text) as HandAnalysis;
  } catch (error) {
    console.error("Analysis failed", error);
    // Fallback if API fails or quota exceeded
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

// Analyze the uploaded outfit image
export const analyzeOutfitImage = async (base64Image: string): Promise<OutfitAnalysis> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
          {
            text: `Analyze this outfit image for fashion style and colors.
            Provide a JSON response with:
            - outfitType: One of "Traditional Lehenga", "Modern Gown", "Saree", or "Fusion/Other".
            - dominantColors: An array of 2-3 dominant hex color codes found in the outfit (e.g. ["#FF0000", "#FFFFFF"]).
            - styleKeywords: An array of 2-3 descriptive style keywords (e.g. "Embroidered", "Floral", "Geometric", "Minimalist", "Heavy").`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            outfitType: { type: Type.STRING },
            dominantColors: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            styleKeywords: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
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

// Generate a style preview image (Text-to-Image)
export const generateStyleThumbnail = async (styleName: string, description: string): Promise<string> => {
  try {
    const prompt = `Professional photography, close-up of a hand with ${styleName} henna design. ${description}. High resolution, intricate details, photorealistic, neutral background.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: prompt }],
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

// Generate a henna design on the hand
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

    // Using gemini-2.5-flash-image for image editing/generation with the hand as reference
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
          {
            text: finalPrompt,
          },
        ],
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