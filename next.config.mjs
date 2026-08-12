import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {};

// Sentry build plugin. Source-map upload only runs when SENTRY_AUTH_TOKEN (+ org
// /project) are present in the build env; without them the build still succeeds,
// it just skips upload. org/project come from env so no secrets live in source.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  // Route browser Sentry calls through the app to dodge ad-blockers.
  tunnelRoute: "/monitoring",
  // Only upload source maps in CI/production builds; keeps local builds fast.
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
});
