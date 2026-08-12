// Sentry init for the Edge runtime (middleware / any edge routes). Dormant until
// NEXT_PUBLIC_SENTRY_DSN is set — no DSN means Sentry.init is a no-op.
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  enableLogs: true,
  debug: false,
});
