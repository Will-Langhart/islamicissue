"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

// Email/password + Google + Microsoft sign-in. One component, two modes
// (sign in / sign up) toggled in place. OAuth and the email flow both round-trip
// through /auth/callback.
export default function AuthForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));

  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(params.get("error") ? "Sign-in failed. Please try again." : "");
  const [notice, setNotice] = useState("");

  if (!isSupabaseConfigured) {
    return (
      <div className="rounded-xl border border-line bg-surface p-6 text-sm text-muted">
        Accounts aren&rsquo;t enabled in this environment yet.
      </div>
    );
  }

  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
      : undefined;

  async function withOAuth(provider) {
    setError("");
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider, // "google" | "azure"
      options: {
        redirectTo,
        // Microsoft (Entra) only returns name/email when these are requested
        // explicitly — without them personal Microsoft accounts often come back
        // with no email, which breaks the profiles trigger.
        ...(provider === "azure"
          ? { scopes: "openid profile email" }
          : {}),
      },
    });
    if (error) {
      setError(error.message);
      setBusy(false);
    }
    // On success the browser navigates away to the provider.
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    const supabase = createClient();

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) {
        setError(error.message);
      } else {
        setNotice(
          "Check your email for a confirmation link to finish creating your account."
        );
      }
      setBusy(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    router.replace(next);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-2">
        <button
          type="button"
          onClick={() => withOAuth("google")}
          disabled={busy}
          className="flex items-center justify-center gap-2 rounded-xl border border-line bg-page px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-surface disabled:opacity-50"
        >
          <GoogleMark /> Continue with Google
        </button>
        <button
          type="button"
          onClick={() => withOAuth("azure")}
          disabled={busy}
          className="flex items-center justify-center gap-2 rounded-xl border border-line bg-page px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-surface disabled:opacity-50"
        >
          <MicrosoftMark /> Continue with Microsoft
        </button>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-heading">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-line bg-page px-3 py-2.5 text-[15px] text-ink outline-none placeholder:text-muted focus:border-brand-2"
            placeholder="you@example.com"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-heading">Password</span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-line bg-page px-3 py-2.5 text-[15px] text-ink outline-none placeholder:text-muted focus:border-brand-2"
            placeholder={mode === "signup" ? "At least 8 characters" : "••••••••"}
          />
        </label>

        {error && <p className="text-sm text-[color:var(--rejected,#b91c1c)]">{error}</p>}
        {notice && <p className="text-sm text-accent">{notice}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-[image:var(--grad-brand)] px-4 py-2.5 text-sm font-semibold text-oncolor transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "…" : mode === "signup" ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="text-center text-sm text-muted">
        {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
        <button
          type="button"
          onClick={() => {
            setMode((m) => (m === "signup" ? "signin" : "signup"));
            setError("");
            setNotice("");
          }}
          className="font-semibold text-accent hover:underline"
        >
          {mode === "signup" ? "Sign in" : "Create an account"}
        </button>
      </p>
    </div>
  );
}

function safeNext(value) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
    </svg>
  );
}

function MicrosoftMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 21 21" aria-hidden>
      <path fill="#F25022" d="M1 1h9v9H1z" />
      <path fill="#7FBA00" d="M11 1h9v9h-9z" />
      <path fill="#00A4EF" d="M1 11h9v9H1z" />
      <path fill="#FFB900" d="M11 11h9v9h-9z" />
    </svg>
  );
}
