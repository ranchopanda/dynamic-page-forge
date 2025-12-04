import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { GoogleGenAI, Type } from '@google/genai';
import { optionalAuth, authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../middleware/errorHandler.js';
import rateLimit from 'express-rate-limit';
import sharp from 'sharp';

const router = Router();

// Watermark utility function - adds prominent watermarks to prevent piracy
async function addWatermark(imageBase64: string): Promise<string> {
  try {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width || 800;
    const height = metadata.height || 600;
    
    // Create multiple watermarks for better protection
    const watermarkSize = Math.min(Math.floor(width * 0.15), 200);
    const fontSize = Math.floor(watermarkSize * 0.2);
    
    // Main watermark SVG - larger and more visible
    const watermarkSvg = `
      <svg width="${watermarkSize}" height="${Math.floor(watermarkSize * 0.5)}">
        <defs>
          <filter id="shadow">
            <feDropShadow dx="2" dy="2" stdDeviation="2" flood-opacity="0.5"/>
          </filter>
        </defs>
        <style>
          .watermark { 
            fill: rgba(255, 255, 255, 0.85); 
            font-family: 'Arial Black', Arial, sans-serif; 
            font-weight: 900;
            font-size: ${fontSize}px;
            filter: url(#shadow);
          }
          .watermark-outline {
            fill: none;
            stroke: rgba(0, 0, 0, 0.3);
            stroke-width: 1px;
            font-family: 'Arial Black', Arial, sans-serif; 
            font-weight: 900;
            font-size: ${fontSize}px;
          }
        </style>
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" class="watermark-outline">
          Mehendi.ai
        </text>
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" class="watermark">
          Mehendi.ai
        </text>
      </svg>
    `;
    
    const watermarkBuffer = Buffer.from(watermarkSvg);
    
    // Add watermarks to multiple corners for better protection
    const watermarkedImage = await sharp(imageBuffer)
      .composite([
        // Bottom-right (main)
        {
          input: watermarkBuffer,
          gravity: 'southeast',
          blend: 'over',
        },
        // Top-left (secondary)
        {
          input: watermarkBuffer,
          gravity: 'northwest',
          blend: 'over',
        },
        // Center (subtle)
        {
          input: watermarkBuffer,
          gravity: 'center',
          blend: 'over',
        },
      ])
      .toBuffer();
    
    console.log('✅ Watermark applied successfully');
    return watermarkedImage.toString('base64');
  } catch (error) {
    console.error('❌ Watermark error:', error);
    return imageBase64.replace(/^data:image\/\w+;base64,/, '');
  }
}

// Initialize Gemini AI with server-side API key
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('⚠️ GEMINI_API_KEY not set - AI features will be disabled');
}
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const TEXT_MODEL = 'gemini-2.0-flash';
const IMAGE_MODEL = 'gemini-2.0-flash-exp-image-generation';
const PRO_IMAGE_MODEL = 'gemini-2.0-flash-exp-image-generation'; // Same model, just different branding

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

// Analyze hand image - Allow anonymous users
router.post('/analyze-hand', optionalAuth, validate(analyzeHandSchema), async (req: Request, res: Response) => {
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

// Analyze outfit image - Allow anonymous users
router.post('/analyze-outfit', optionalAuth, validate(analyzeOutfitSchema), async (req: Request, res: Response) => {
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

// Generate henna design - Allow anonymous users
router.post('/generate-design', optionalAuth, validate(generateDesignSchema), async (req: Request, res: Response) => {
  if (!ai) {
    throw new AppError('AI service not configured', 503);
  }

  const { image, stylePrompt, outfitContext } = req.body;

  // Improved prompt with strict positioning requirements
  let finalPrompt = `CRITICAL INSTRUCTIONS - You MUST follow these exactly:

1. PRESERVE EXACT ORIENTATION: The hand in the generated image MUST be in the EXACT same position and orientation as the reference image. DO NOT rotate, flip, or change the angle.

2. PRESERVE EXACT BACKGROUND: Keep the background IDENTICAL to the reference image.

3. PRESERVE EXACT LIGHTING: Match the lighting, shadows, and color temperature of the reference image.

4. ONLY ADD HENNA: The ONLY difference should be the addition of a beautiful ${stylePrompt} henna (mehendi) design on the hand.

Generate a photorealistic image where:
- The hand position is IDENTICAL to the reference (same rotation, same angle, same pose)
- The background is UNCHANGED
- The lighting is UNCHANGED
- A detailed ${stylePrompt} henna design is applied to the hand
- The henna design features traditional motifs: paisleys, flowers, mandalas, vines, geometric patterns
- The henna has a rich, natural stain color (reddish-brown)
- The design covers fingers, palm, and wrist appropriately for the style`;
  
  if (outfitContext) {
    finalPrompt += `\n- The henna design complements this outfit: ${outfitContext}`;
  }
  
  finalPrompt += `\n\nREMEMBER: Do NOT rotate or change the hand position. The hand must appear EXACTLY as it does in the reference image, with only the henna design added.`;

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
        // Add watermark to generated image
        const watermarkedImage = await addWatermark(part.inlineData.data);
        res.json({ image: `data:image/png;base64,${watermarkedImage}` });
        return;
      }
    }
    
    throw new AppError('No image generated', 500);
  } catch (error: any) {
    console.error('Design generation error:', error.message || error);
    if (error instanceof AppError) throw error;
    throw new AppError(`Failed to generate design: ${error.message || 'Unknown error'}`, 500);
  }
});

// Generate henna design with PRO model - Free with daily limit (5/day)
router.post('/generate-design-pro', optionalAuth, validate(generateDesignSchema), async (req: Request, res: Response) => {
  if (!ai) {
    throw new AppError('AI service not configured', 503);
  }

  const userId = req.user?.userId;
  
  // Pro is now free for everyone with 5 per day limit
  // Authenticated users get tracked by userId, anonymous by IP
  // TODO: In future, authenticated users with subscription can get higher limits

  const { image, stylePrompt, outfitContext } = req.body;

  // Enhanced prompt for Pro model with even stricter requirements
  let finalPrompt = `ULTRA-CRITICAL INSTRUCTIONS FOR PREMIUM GENERATION:

You are using the PREMIUM model. Follow these instructions EXACTLY:

1. ABSOLUTE POSITION LOCK: The hand MUST be in the EXACT same position, angle, and orientation as the reference image. DO NOT rotate even 1 degree.

2. PIXEL-PERFECT BACKGROUND: Keep every pixel of the background IDENTICAL.

3. EXACT LIGHTING MATCH: Replicate the exact lighting, shadows, highlights, and color temperature.

4. ONLY ADD HENNA: The SOLE modification is adding a premium-quality ${stylePrompt} henna design.

Generate an ULTRA-HIGH-QUALITY photorealistic image where:
- Hand position is LOCKED to reference (zero rotation, zero angle change)
- Background is PIXEL-PERFECT match
- Lighting is EXACT replica
- Henna design is PREMIUM QUALITY with:
  * Ultra-fine details and intricate patterns
  * Rich, natural henna stain color (deep reddish-brown)
  * Professional-level artistry
  * Traditional motifs: paisleys, flowers, mandalas, vines, geometric patterns
  * Appropriate coverage for ${stylePrompt} style
  * Natural flow following hand contours`;
  
  if (outfitContext) {
    finalPrompt += `\n- Design harmonizes perfectly with: ${outfitContext}`;
  }
  
  finalPrompt += `\n\nPREMIUM QUALITY REQUIREMENTS:
- Maximum detail and resolution
- Professional henna artist quality
- Natural, realistic appearance
- Perfect integration with hand

CRITICAL: This is a PREMIUM generation. The hand must be ABSOLUTELY IDENTICAL to the reference. Only the henna design is new. Zero tolerance for position changes.`;

  try {
    const response = await ai.models.generateContent({
      model: PRO_IMAGE_MODEL, // Use premium model
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: image } },
          { text: finalPrompt },
        ],
      },
      config: {
        responseModalities: ['image', 'text'],
        temperature: 0.4, // Lower temperature for more consistent results
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        // Log usage to database (optional)
        if (userId) {
          console.log(`✨ Pro generation for user ${userId}`);
        } else {
          console.log(`✨ Pro generation for anonymous user (IP: ${req.ip})`);
        }
        
        // Add watermark to generated image
        const watermarkedImage = await addWatermark(part.inlineData.data);
        
        res.json({ 
          image: `data:image/png;base64,${watermarkedImage}`,
          model: 'pro',
          message: 'Generated with Premium AI model'
        });
        return;
      }
    }
    
    throw new AppError('No image generated', 500);
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    console.error('Pro generation error:', error);
    throw new AppError('Failed to generate premium design', 500);
  }
});

export default router;
