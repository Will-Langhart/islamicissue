import { Suspense } from "react";
import Link from "next/link";
import AuthForm from "@/components/auth/AuthForm";

export const metadata = {
  title: "Sign in",
  // Account plumbing, not reading content — keep it out of search indexes.
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <p className="eyebrow">Accounts</p>
      <h1 className="page-title">Sign in</h1>
      <p className="lede">
        Optional — the compendium and the chatbot stay fully open without an
        account. Signing in syncs your chats and saved issues across devices.
      </p>

      <div className="mt-8 rounded-2xl border border-line bg-surface p-6">
        <Suspense fallback={<div className="h-64" />}>
          <AuthForm />
        </Suspense>
      </div>

      <p className="mt-6 text-center text-xs text-muted">
        By continuing you agree to use accounts in good faith.{" "}
        <Link href="/" className="text-accent hover:underline">
          Back to the compendium
        </Link>
      </p>
    </div>
  );
}
