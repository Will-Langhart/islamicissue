// Sentry init for the Node.js server runtime (API routes, RSC, the chat stream).
// Dormant until NEXT_PUBLIC_SENTRY_DSN is set in the environment — with no DSN,
// Sentry.init is a no-op and ships no events, so this is safe to deploy as-is.
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Error monitoring is the goal; keep tracing light (full in dev, 10% in prod).
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  enableLogs: true,
  // Trim local noise; real DSN + Vercel env drives production reporting.
  debug: false,
});
