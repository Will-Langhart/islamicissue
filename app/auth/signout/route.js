import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

// Sign out via POST (so it can't be triggered by a stray GET / prefetch).
export async function POST(request) {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  // 303 → the browser follows with a GET to the home page.
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
