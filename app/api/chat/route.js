import Anthropic from "@anthropic-ai/sdk";
import { buildSystem, CHAT_MODEL } from "@/lib/chatbot/prompt";
import { rateLimit, clientIp } from "@/lib/chatbot/rate-limit";
import { findInvalidCitations } from "@/lib/chatbot/citations.mjs";

// Needs the Node runtime: the SDK + fs-backed corpus build.
export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_MESSAGES = 40;
const MAX_CHARS = 8000;

function sanitize(messages) {
  if (!Array.isArray(messages)) return null;
  const clean = messages
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
    )
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  // The Messages API requires the conversation to start with a user turn.
  while (clean.length && clean[0].role !== "user") clean.shift();
  if (!clean.length || clean[clean.length - 1].role !== "user") return null;
  return clean;
}

export async function POST(req) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "The chatbot is not configured (missing API key)." },
      { status: 503 }
    );
  }

  const limit = await rateLimit(clientIp(req));
  if (!limit.ok) {
    return Response.json(
      {
        error:
          "You're sending messages too quickly. Please wait a moment and try again.",
      },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const messages = sanitize(body?.messages);
  if (!messages) {
    return Response.json(
      { error: "A question is required." },
      { status: 400 }
    );
  }

  const client = new Anthropic();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const claude = client.messages.stream({
          model: CHAT_MODEL,
          max_tokens: 8000,
          // Grounded Q&A over provided context is not intelligence-hard; low
          // effort keeps answers snappy. Adaptive thinking stays on by default.
          output_config: { effort: "low" },
          system: buildSystem(),
          messages,
        });

        let answer = "";
        for await (const event of claude) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            answer += event.delta.text;
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }

        // Deterministic citation check. The client renderer already neutralizes
        // fabricated links at render time; this logs them so hallucinated
        // citations are observable in production (the client can't report back).
        const invalid = findInvalidCitations(answer);
        if (invalid.length) {
          console.warn(
            "[chat] fabricated citations:",
            invalid.map((c) => `${c.label} → ${c.url}`).join(", ")
          );
        }

        const final = await claude.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(
            encoder.encode(
              "\n\n_(I can't help with that one. Try asking about a specific issue in the compendium.)_"
            )
          );
        }
      } catch (err) {
        console.error("[chat] stream error:", err);
        controller.enqueue(
          encoder.encode(
            "\n\n_Something went wrong reaching the model. Please try again._"
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
