// Next.js instrumentation hook. Loads the runtime-appropriate Sentry config and
// wires captureRequestError so errors thrown in nested React Server Components
// and route handlers are reported.
import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config.js");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config.js");
  }
}

export const onRequestError = Sentry.captureRequestError;
