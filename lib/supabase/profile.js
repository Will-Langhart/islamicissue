// Server-side identity + role helpers. Used by server components and route
// handlers that need the current user or a role gate. All return safe values
// (null / redirect) when Supabase isn't configured, so callers never crash on
// an unprovisioned environment.

import { redirect } from "next/navigation";
import { createClient } from "./server";
import { isSupabaseConfigured } from "./config";

/** The authenticated user, or null. Verified against Supabase (not just cookie). */
export async function getSessionUser() {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}

/** The current user's profile row (id, display_name, avatar_url, role), or null. */
export async function getProfile() {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, role")
    .eq("id", user.id)
    .single();
  return data ?? null;
}

/**
 * Guard for role-gated pages (Phase 4 moderation, etc.). Redirects to /login
 * when signed out, or home when the role is insufficient. Roles are ranked:
 * reader < contributor < editor < admin.
 */
export async function requireRole(minRole) {
  const ranks = { reader: 0, contributor: 1, editor: 2, admin: 3 };
  const profile = await getProfile();
  if (!profile) redirect("/login?next=/");
  if ((ranks[profile.role] ?? 0) < (ranks[minRole] ?? 99)) redirect("/");
  return profile;
}
