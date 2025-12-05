# Deploy Supabase Edge Function (Secure API Key)

This keeps your Gemini API key secure on the server side.

## 1. Install Supabase CLI (if not installed)

```bash
npm install -g supabase
```

## 2. Login to Supabase

```bash
supabase login
```

## 3. Link to your project

```bash
supabase link --project-ref kowuwhlwetplermbdvbh
```

## 4. Set the Gemini API Key as a secret

```bash
supabase secrets set GEMINI_API_KEY=AIzaSyB5MOEMkgmJatNs8voMxzDm0blv3pBCMsw
```

## 5. Deploy the Edge Function

```bash
supabase functions deploy generate-design
```

## 6. Done!

The frontend will now call the Edge Function, which securely uses your API key.

Your API key is:
- ✅ Stored as a Supabase secret (not in code)
- ✅ Never exposed to the browser
- ✅ Only accessible by your Edge Function

## Alternative: Set secret via Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/kowuwhlwetplermbdvbh/settings/functions
2. Click "Add new secret"
3. Name: `GEMINI_API_KEY`
4. Value: Your Gemini API key
5. Save

Then deploy the function:
```bash
supabase functions deploy generate-design
```
