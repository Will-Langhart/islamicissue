// Browser Supabase client (for client components).
//
// Cookie-based session via @supabase/ssr — the same session the server client
// and middleware read, so auth state is consistent across the App Router.
// Only the public (anon) key is used here; RLS is what makes that safe.

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./config";

export function createClient() {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY). " +
        "Gate on isSupabaseConfigured before calling createClient()."
    );
  }
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
