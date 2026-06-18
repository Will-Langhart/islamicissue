"use client";
import { useState } from "react";

// Per-issue utility row: copy a permalink, copy a formatted citation, or print.
// Built for apologists who share and cite individual issues. Citation text and
// the permalink are derived from window.location at click time, so they stay
// correct regardless of host or future URL changes.
export default function IssueTools({ title, partLabel }) {
  const [flash, setFlash] = useState("");

  const ping = (msg) => {
    setFlash(msg);
    window.clearTimeout(ping._t);
    ping._t = window.setTimeout(() => setFlash(""), 1800);
  };

  const copy = async (text, msg) => {
    try {
      await navigator.clipboard.writeText(text);
      ping(msg);
    } catch {
      ping("Copy failed");
    }
  };

  const copyLink = () => copy(window.location.href, "Link copied");

  const copyCitation = () => {
    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const citation = `“${title}.” Examining Islam from Within — ${partLabel}. ${window.location.href} (accessed ${today}).`;
    copy(citation, "Citation copied");
  };

  const print = () => {
    // Expand every collapsed section so responses and rebuttals print in full.
    document.querySelectorAll("details").forEach((d) => (d.open = true));
    window.print();
  };

  return (
    <div className="issue-tools mb-8 flex flex-wrap items-center gap-2 border-y border-line py-3">
      <Btn onClick={copyLink} label="Copy link" icon="link" />
      <Btn onClick={copyCitation} label="Cite" icon="quote" />
      <Btn onClick={print} label="Print" icon="print" />
      <span
        aria-live="polite"
        className={`ml-1 font-ui text-xs font-semibold text-accent transition-opacity ${
          flash ? "opacity-100" : "opacity-0"
        }`}
      >
        {flash || "·"}
      </span>
    </div>
  );
}

function Btn({ onClick, label, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-1.5 font-ui text-xs font-semibold text-muted shadow-sm transition hover:border-accent/50 hover:text-accent"
    >
      <Icon name={icon} />
      {label}
    </button>
  );
}

function Icon({ name }) {
  const common = {
    width: 13,
    height: 13,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  if (name === "link")
    return (
      <svg {...common}>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    );
  if (name === "quote")
    return (
      <svg {...common}>
        <path d="M3 21c3-1 5-3 5-7V5H3v6h3M14 21c3-1 5-3 5-7V5h-5v6h3" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <path d="M6 14h12v8H6z" />
    </svg>
  );
}
