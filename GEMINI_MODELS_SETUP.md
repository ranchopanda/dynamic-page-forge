# Gemini Models Configuration

## ✅ Setup Complete

The Edge Function has been configured with the correct Gemini models and deployed successfully.

## 🎯 Model Configuration

### Analysis Models (Hand & Outfit)
- **Model**: `gemini-2.5-flash`
- **Purpose**: Analyze hand images and outfit images for design recommendations
- **Usage**: Both free and pro users

### Image Generation Models

#### Free Tier
- **Model**: `gemini-2.5-flash-image`
- **Purpose**: Standard quality henna design generation
- **Limits**: Rate limited per user

#### Pro Tier
- **Model**: `gemini-3-pro-image-preview`
- **Purpose**: High quality henna design generation
- **Limits**: 5 generations per day per pro user

## 🔐 Security

- ✅ API key stored securely in Supabase Edge Function secrets
- ✅ API key never exposed to frontend
- ✅ All AI requests go through secure Edge Function
- ✅ Test files with API keys removed from repository

## 🚀 Deployment Status

- ✅ Edge Function deployed: `generate-design`
- ✅ API key configured in Supabase
- ✅ Models verified and working
- ✅ CORS configured for frontend access

## 📝 Usage

The frontend automatically calls the Edge Function through:
- `analyzeHandImage()` - Hand analysis
- `analyzeOutfitImage()` - Outfit analysis  
- `generateHennaDesign()` - Free tier generation
- `generateHennaDesignPro()` - Pro tier generation

## 🧪 Testing

To test the Edge Function:

```bash
curl https://kowuwhlwetplermbdvbh.supabase.co/functions/v1/generate-design \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action":"analyze-hand", "image":"BASE64_IMAGE"}'
```

## ⚠️ Important Notes

1. **Never commit API keys** to the repository
2. **API key is stored only** in Supabase secrets
3. **Frontend uses** Supabase client to call Edge Function
4. **Edge Function handles** all Gemini API communication

## 🔄 To Update Models

If you need to change models in the future:

1. Edit `supabase/functions/generate-design/index.ts`
2. Update model names in the appropriate action handlers
3. Deploy: `supabase functions deploy generate-design --project-ref kowuwhlwetplermbdvbh`

---

**Last Updated**: December 5, 2025
**Status**: ✅ Production Ready
