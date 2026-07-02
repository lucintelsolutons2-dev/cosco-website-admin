import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// True only when both env vars are present. The app shows a friendly
// "configure me" screen instead of crashing when they're missing.
export const isConfigured = Boolean(url && key);

export const supabase = isConfigured
  ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;
