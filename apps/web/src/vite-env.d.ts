/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_SIMULATE_DASHBOARD?: string;
  readonly VITE_GRAPESJS_LICENSE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
