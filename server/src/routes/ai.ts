import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { GoogleGenAI, Type } from '@google/genai';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../middleware/errorHandler.js';
import rateLimit from 'express-rate-limit';

const router = Router();

// Initialize Gemini AI with server-side API key
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('⚠️ GEMINI_API_KEY not set - AI features will be disabled');
}
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const TEXT_MODEL = 'gemini-2.0-flash';
const IMAGE_MODEL = 'gemini-2.0-flash-exp-image-generation';

// Rate limiting for AI endpoints (more restrictive)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 AI requests per 15 minutes per IP
  message: { error: 'Too many AI requests, please try again later.' },
});

router.use(aiLimiter);

// Validation schemas
const analyzeHandSchema = z.object({
  body: z.object({
    image: z.string().min(1, 'Image data is required'),
  }),
});

const analyzeOutfitSchema = z.object({
  body: z.object({
    image: z.string().min(1, 'Image data is required'),
  }),
});

const generateDesignSchema = z.object({
  body: z.object({
    image: z.string().min(1, 'Image data is required'),
    stylePrompt: z.string().min(1).max(500),
    outfitContext: z.string().max(500).optional(),
  }),
});

// Helper to safely parse JSON
const safeParseJSON = <T>(text: string, fallback: T): T => {
  if (!text) return fallback;
  try {
    return JSON.parse(text) as T;
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]) as T;
      } catch {
        return fallback;
      }
    }
    return fallback;
  }
};

// Analyze hand image
router.post('/analyze-hand', authenticate, validate(analyzeHandSchema), async (req: Request, res: Response) => {
  if (!ai) {
    throw new AppError('AI service not configured', 503);
  }

  const { image } = req.body;
  const fallback = {
    skinTone: 'Warm/Neutral',
    handShape: 'Classic',
    coverage: 'Optimal for full coverage',
    keyFeature: 'Unique finger length',
    fingerShape: 'Highlights elegant structure',
    wristArea: 'Ideal for intricate wrist work',
    recommendedStyles: ['Arabic', 'Minimalist'],
  };

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: image } },
          { text: `Analyze this image of a hand for henna (mehendi) design placement. 
            Provide a concise JSON response with these fields (keep values short, under 50 characters each):
            - skinTone: Brief skin tone description
            - handShape: Shape type (Slender, Broad, Square, etc.)
            - coverage: Brief coverage recommendation
            - keyFeature: One unique anatomical feature
            - fingerShape: Brief finger description
            - wristArea: Brief wrist suitability note
            - recommendedStyles: Array of 2-3 style names only` },
        ],
      },
      config: {
        responseMimeType: 'application/json',
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

    res.json(safeParseJSON(response.text || '', fallback));
  } catch (error: any) {
    if (error?.message?.includes('429') || error?.message?.includes('quota')) {
      throw new AppError('Rate limited. Please wait a moment and try again.', 429);
    }
    res.json(fallback);
  }
});

// Analyze outfit image
router.post('/analyze-outfit', authenticate, validate(analyzeOutfitSchema), async (req: Request, res: Response) => {
  if (!ai) {
    throw new AppError('AI service not configured', 503);
  }

  const { image } = req.body;
  const fallback = {
    outfitType: 'Traditional Lehenga',
    dominantColors: ['#8F3E27', '#D8A85B'],
    styleKeywords: ['Embroidered', 'Traditional'],
  };

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: image } },
          { text: `Analyze this outfit image for fashion style and colors.
            Provide a concise JSON response with:
            - outfitType: One of "Traditional Lehenga", "Modern Gown", "Saree", "Sharara", "Anarkali", "Western", or "Fusion/Other"
            - dominantColors: Array of 2-3 hex color codes (e.g., "#8F3E27")
            - styleKeywords: Array of 2-3 single-word style keywords` },
        ],
      },
      config: {
        responseMimeType: 'application/json',
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

    res.json(safeParseJSON(response.text || '', fallback));
  } catch {
    res.json(fallback);
  }
});

// Generate henna design
router.post('/generate-design', authenticate, validate(generateDesignSchema), async (req: Request, res: Response) => {
  if (!ai) {
    throw new AppError('AI service not configured', 503);
  }

  const { image, stylePrompt, outfitContext } = req.body;

  let finalPrompt = `Generate a high-quality, photorealistic image of this exact hand with a beautiful ${stylePrompt} henna (mehendi) design applied to it. Keep the background and hand position exactly the same if possible. Focus on intricate details and rich stain color.`;
  
  if (outfitContext) {
    finalPrompt += ` The design should complement an outfit described as: ${outfitContext}.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: image } },
          { text: finalPrompt },
        ],
      },
      config: {
        responseModalities: ['image', 'text'],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        res.json({ image: `data:image/png;base64,${part.inlineData.data}` });
        return;
      }
    }
    
    throw new AppError('No image generated', 500);
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to generate design', 500);
  }
});

export default router;
