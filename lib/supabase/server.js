// Server Supabase client (for server components, route handlers, server actions).
//
// Wired to Next's request cookie store. In Next 15+/16, cookies() is async, so
// this factory is async too. Callers must gate on isSupabaseConfigured first.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./config";

export async function createClient() {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Gate on isSupabaseConfigured before calling createClient()."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component, where cookies are read-only. Safe to
          // ignore: middleware.js refreshes the session cookie on every request.
        }
      },
    },
  });
}
