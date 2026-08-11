import { updateSession } from "@/lib/supabase/middleware";

// Next 16 "proxy" convention (formerly middleware). Refreshes the Supabase
// session cookie on every matched request; no-ops when Supabase isn't configured
// (see lib/supabase/middleware.js).
export async function proxy(request) {
  return updateSession(request);
}

export const config = {
  // Run on everything except static assets and image files — those never need a
  // session refresh and skipping them keeps the proxy cheap.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
