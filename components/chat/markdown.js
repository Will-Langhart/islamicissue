"use client";

import Link from "next/link";
import { isValidInternalUrl } from "@/lib/chatbot/citations.mjs";

// A small, HTML-safe markdown renderer. Handles the subset the chatbot emits:
// paragraphs, bullet/numbered lists, bold, inline code, and links. It builds
// React nodes directly (no dangerouslySetInnerHTML), so nothing the model
// returns can inject markup.

let keySeq = 0;
const nextKey = () => `md-${keySeq++}`;

// Inline: **bold**, `code`, [text](url). Internal links (/...) route via next/link.
function renderInline(text) {
  const nodes = [];
  const pattern =
    /(\*\*([^*]+)\*\*)|(\*([^*\n]+)\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)\s]+)\))/g;
  let last = 0;
  let m;
  while ((m = pattern.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[1]) {
      nodes.push(<strong key={nextKey()}>{m[2]}</strong>);
    } else if (m[3]) {
      nodes.push(<em key={nextKey()}>{m[4]}</em>);
    } else if (m[5]) {
      nodes.push(
        <code
          key={nextKey()}
          className="rounded bg-accentbg px-1 py-0.5 font-mono text-[0.85em] text-accent"
        >
          {m[6]}
        </code>
      );
    } else if (m[7]) {
      const label = m[8];
      const url = m[9];
      const internal = url.startsWith("/");
      if (internal && !isValidInternalUrl(url)) {
        // Deterministic guard: the model invented a citation pointing to no real
        // page. Render it inert and visibly flagged so it can never 404 or pose
        // as a source of the compendium.
        nodes.push(
          <span
            key={nextKey()}
            title="Unverified citation — no such page in the compendium"
            className="text-muted line-through decoration-red-400/60"
          >
            {label}
          </span>
        );
      } else {
        nodes.push(
          internal ? (
            <Link
              key={nextKey()}
              href={url}
              className="text-accent underline decoration-brand-2/50 underline-offset-2 hover:decoration-brand-2"
            >
              {label}
            </Link>
          ) : (
            <a
              key={nextKey()}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline underline-offset-2"
            >
              {label}
            </a>
          )
        );
      }
    }
    last = pattern.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function Markdown({ text }) {
  const lines = (text || "").split("\n");
  const blocks = [];
  let list = null; // { type: "ul" | "ol", items: [] }
  let para = [];

  const flushPara = () => {
    if (para.length) {
      blocks.push(
        <p key={nextKey()} className="leading-relaxed">
          {renderInline(para.join(" "))}
        </p>
      );
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      const Tag = list.type;
      blocks.push(
        <Tag
          key={nextKey()}
          className={`ml-5 space-y-1 ${
            list.type === "ol" ? "list-decimal" : "list-disc"
          }`}
        >
          {list.items.map((it) => (
            <li key={nextKey()} className="leading-relaxed">
              {renderInline(it)}
            </li>
          ))}
        </Tag>
      );
      list = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+\.\s+(.*)$/);
    if (bullet) {
      flushPara();
      if (!list || list.type !== "ul") {
        flushList();
        list = { type: "ul", items: [] };
      }
      list.items.push(bullet[1]);
    } else if (numbered) {
      flushPara();
      if (!list || list.type !== "ol") {
        flushList();
        list = { type: "ol", items: [] };
      }
      list.items.push(numbered[1]);
    } else if (line.trim() === "") {
      flushPara();
      flushList();
    } else {
      flushList();
      para.push(line.trim());
    }
  }
  flushPara();
  flushList();

  return <div className="space-y-3">{blocks}</div>;
}
