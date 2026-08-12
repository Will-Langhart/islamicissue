// Sentry init for the browser. Dormant until NEXT_PUBLIC_SENTRY_DSN is set.
// Tuned for error monitoring on a low-traffic content site: no continuous
// session replay (cost/overhead), but capture a replay whenever an error fires.
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  integrations: [Sentry.replayIntegration()],
  replaysSessionSampleRate: 0, // no always-on replay
  replaysOnErrorSampleRate: 1.0, // record a replay only when an error occurs
  enableLogs: true,
  debug: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
