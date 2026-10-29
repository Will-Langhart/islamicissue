// Per-IP rate limiter for the chatbot API.
//
// Durable path: when Upstash Redis credentials are present, uses
// @upstash/ratelimit with a sliding window — a hard global limit shared across
// every serverless instance.
//
// Fallback path: when no credentials are set (local dev, preview without the
// integration), uses a best-effort in-memory sliding window. Effective on a
// single instance; per-instance across many. This keeps the app working
// everywhere without a hard dependency on Upstash being provisioned.
//
// Daily caps (spend ceiling): on top of the per-minute limit, each IP gets
// CHAT_IP_DAILY_LIMIT requests per UTC day and the whole site gets
// CHAT_DAILY_LIMIT. Without Upstash the global cap is per instance, so set the
// Anthropic Console spend limit as the hard backstop.

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const WINDOW = "60 s";
const MAX_REQUESTS = 12;

// ---- Durable (Upstash) --------------------------------------------------

// The Vercel Upstash Marketplace integration injects UPSTASH_REDIS_REST_URL /
// UPSTASH_REDIS_REST_TOKEN; older Vercel KV wiring used KV_REST_API_*. Accept both.
function upstashCreds() {
  const url =
    process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

let durableLimiter;
function getDurableLimiter() {
  if (durableLimiter !== undefined) return durableLimiter; // memoized (incl. null)
  const creds = upstashCreds();
  durableLimiter = creds
    ? new Ratelimit({
        redis: new Redis(creds),
        limiter: Ratelimit.slidingWindow(MAX_REQUESTS, WINDOW),
        prefix: "eiw-chat",
        analytics: false,
      })
    : null;
  return durableLimiter;
}

// ---- In-memory fallback -------------------------------------------------

const WINDOW_MS = 60_000;
const SWEEP_EVERY_MS = 5 * 60_000;
const buckets = new Map(); // ip -> number[] (timestamps, ascending)
let lastSweep = Date.now();

function sweep(now) {
  if (now - lastSweep < SWEEP_EVERY_MS) return;
  lastSweep = now;
  const cutoff = now - WINDOW_MS;
  for (const [ip, hits] of buckets) {
    const live = hits.filter((t) => t > cutoff);
    if (live.length) buckets.set(ip, live);
    else buckets.delete(ip);
  }
}

function memoryLimit(ip) {
  const now = Date.now();
  sweep(now);
  const cutoff = now - WINDOW_MS;
  const hits = (buckets.get(ip) || []).filter((t) => t > cutoff);
  if (hits.length >= MAX_REQUESTS) {
    const retryAfter = Math.max(1, Math.ceil((hits[0] + WINDOW_MS - now) / 1000));
    return { ok: false, retryAfter };
  }
  hits.push(now);
  buckets.set(ip, hits);
  return { ok: true, remaining: MAX_REQUESTS - hits.length };
}

// ---- Daily caps -----------------------------------------------------------

function envInt(name, fallback) {
  const n = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

const IP_DAILY_LIMIT = envInt("CHAT_IP_DAILY_LIMIT", 30);
const GLOBAL_DAILY_LIMIT = envInt("CHAT_DAILY_LIMIT", 300);

function secondsUntilUtcMidnight(now = Date.now()) {
  const next = new Date(now);
  next.setUTCHours(24, 0, 0, 0);
  return Math.max(1, Math.ceil((next.getTime() - now) / 1000));
}

let durableDaily;
function getDurableDaily() {
  if (durableDaily !== undefined) return durableDaily;
  const creds = upstashCreds();
  if (!creds) return (durableDaily = null);
  const redis = new Redis(creds);
  durableDaily = {
    ip: new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(IP_DAILY_LIMIT, "1 d"),
      prefix: "eiw-chat-ip-day",
      analytics: false,
    }),
    global: new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(GLOBAL_DAILY_LIMIT, "1 d"),
      prefix: "eiw-chat-global-day",
      analytics: false,
    }),
  };
  return durableDaily;
}

// In-memory daily counters, reset when the UTC date changes.
let memDay = "";
let memGlobal = 0;
const memIpDaily = new Map(); // ip -> count

function memoryDaily(ip) {
  const today = new Date().toISOString().slice(0, 10);
  if (today !== memDay) {
    memDay = today;
    memGlobal = 0;
    memIpDaily.clear();
  }
  const ipCount = memIpDaily.get(ip) || 0;
  if (ipCount >= IP_DAILY_LIMIT) return { ok: false, scope: "ip" };
  if (memGlobal >= GLOBAL_DAILY_LIMIT) return { ok: false, scope: "global" };
  memIpDaily.set(ip, ipCount + 1);
  memGlobal += 1;
  return { ok: true };
}

/**
 * Per-IP and site-wide daily request ceilings.
 * @returns {Promise<{ok: boolean, scope?: "ip" | "global", retryAfter?: number}>}
 */
export async function dailyLimit(ip) {
  const retryAfter = secondsUntilUtcMidnight();
  const limiters = getDurableDaily();
  if (!limiters) {
    const res = memoryDaily(ip);
    return res.ok ? res : { ...res, retryAfter };
  }

  try {
    // Check the IP first so one heavy user can't burn the global budget.
    const perIp = await limiters.ip.limit(ip);
    if (!perIp.success) return { ok: false, scope: "ip", retryAfter };
    const site = await limiters.global.limit("all");
    if (!site.success) return { ok: false, scope: "global", retryAfter };
    return { ok: true };
  } catch (err) {
    console.error("[rate-limit] Upstash daily error, falling back:", err);
    const res = memoryDaily(ip);
    return res.ok ? res : { ...res, retryAfter };
  }
}

// ---- Public API ---------------------------------------------------------

/**
 * @returns {Promise<{ok: boolean, retryAfter?: number, remaining?: number}>}
 */
export async function rateLimit(ip) {
  const limiter = getDurableLimiter();
  if (!limiter) return memoryLimit(ip);

  try {
    const { success, reset, remaining } = await limiter.limit(ip);
    if (success) return { ok: true, remaining };
    return {
      ok: false,
      retryAfter: Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
    };
  } catch (err) {
    // Never fail the request because the limiter backend is unreachable —
    // degrade to the in-memory limiter for this call.
    console.error("[rate-limit] Upstash error, falling back:", err);
    return memoryLimit(ip);
  }
}

/** Best available client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(req) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}
