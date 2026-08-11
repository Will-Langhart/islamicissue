// Supabase configuration + a single source of truth for "is auth wired up?".
//
// The whole auth layer is *optional*: when the env vars are absent (local dev
// without the integration, or a preview that hasn't been provisioned yet), the
// site must keep working with anonymous reading + localStorage chat. Every entry
// point (browser client, server client, middleware, AuthButton) gates on
// `isSupabaseConfigured` and degrades to a no-op rather than throwing — the same
// posture as the Upstash rate limiter in lib/chatbot/rate-limit.mjs.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
