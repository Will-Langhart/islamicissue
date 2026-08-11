"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import UserMenu from "./UserMenu";

// Header auth entry point. Client-rendered so the static content pages stay
// static: only this small widget is dynamic. Renders nothing when Supabase is
// unconfigured, "Sign in" when signed out, and the avatar menu when signed in.
export default function AuthButton() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setReady(true);
      return;
    }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setReady(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!isSupabaseConfigured) return null;
  // Reserve space to avoid a layout shift while we resolve the session.
  if (!ready) return <div className="h-8 w-8" aria-hidden />;

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-full border border-line px-3 py-1 text-sm font-semibold text-ink transition-colors hover:border-brand-2 hover:text-accent"
      >
        Sign in
      </Link>
    );
  }

  return <UserMenu user={user} />;
}
