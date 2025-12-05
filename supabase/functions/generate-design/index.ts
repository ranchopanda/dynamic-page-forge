import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    const { image, stylePrompt, outfitContext, action, isPro } = await req.json();

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    if (action === "analyze-hand") {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
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
        { inlineData: { mimeType: "image/jpeg", data: image } },
      ]);

      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      return new Response(JSON.stringify(jsonMatch ? JSON.parse(jsonMatch[0]) : {}), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "analyze-outfit") {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `Analyze this outfit image for henna design coordination. Return a JSON object with:
      - outfitType: type of outfit
      - dominantColors: array of hex color codes
      - styleKeywords: array of style keywords
      Return ONLY valid JSON, no markdown.`;

      const result = await model.generateContent([
        { text: prompt },
        { inlineData: { mimeType: "image/jpeg", data: image } },
      ]);

      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      return new Response(JSON.stringify(jsonMatch ? JSON.parse(jsonMatch[0]) : {}), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "generate") {
      // Use pro model for pro users, standard for free users
      const modelName = isPro ? "gemini-3-pro-image-preview" : "gemini-2.5-flash-image";
      const model = genAI.getGenerativeModel({ model: modelName });
      
      let finalPrompt = `Generate a photorealistic image of a hand with beautiful ${stylePrompt} henna (mehendi) design.
      The hand should look natural with the henna design applied.
      The henna should have a rich, natural reddish-brown color.
      Include traditional motifs: paisleys, flowers, mandalas, vines.`;
      
      if (outfitContext) {
        finalPrompt += `\nThe design should complement this outfit: ${outfitContext}`;
      }

      const result = await model.generateContent({
        contents: [{
          role: "user",
          parts: [
            { inlineData: { mimeType: "image/jpeg", data: image } },
            { text: finalPrompt },
          ],
        }],
        generationConfig: {
          responseModalities: ["image", "text"],
        },
      } as any);

      const response = result.response;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if ((part as any).inlineData) {
          return new Response(
            JSON.stringify({ image: `data:image/png;base64,${(part as any).inlineData.data}` }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
      
      throw new Error("No image generated");
    }

    throw new Error("Invalid action");
  } catch (error: any) {
    console.error("Edge Function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
