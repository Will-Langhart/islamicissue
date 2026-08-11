// Session-refresh helper, called from the root middleware.js on every request.
//
// Its one job: keep the Supabase session cookie fresh so server components and
// route handlers always see a live session. It must run getUser() (or
// getClaims()) — that call is what triggers a token refresh when needed.
//
// When Supabase isn't configured, this is a pass-through: the site behaves
// exactly as it did before auth existed.

import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./config";

export async function updateSession(request) {
  let response = NextResponse.next({ request });

  if (!isSupabaseConfigured) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Do NOT run code between createServerClient and getUser() — it refreshes the
  // token and rewrites the cookies onto `response`.
  await supabase.auth.getUser();

  return response;
}
