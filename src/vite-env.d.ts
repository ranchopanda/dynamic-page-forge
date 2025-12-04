/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  // SECURITY: Never add VITE_GEMINI_API_KEY - it would be exposed in browser
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
