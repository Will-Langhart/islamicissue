import Blocks from "./Blocks";

// Expandable section using native <details> — no client JS required.
export default function Collapsible({ label, hint, entries, accent = false }) {
  if (!entries) return null;
  return (
    <details
      className={`cv mb-5 overflow-hidden rounded-lg border border-line bg-surface shadow-sm ${
        accent ? "border-l-2 border-l-accent" : "border-l-2 border-l-line"
      }`}
    >
      <summary className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-accentbg">
        <svg
          className="chev shrink-0 text-accent"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
        <span className="font-ui text-xs font-bold uppercase tracking-[0.18em] text-heading">
          {label}
        </span>
        <span className="ml-auto hidden font-ui text-xs italic text-muted sm:inline">
          {hint}
        </span>
      </summary>
      <div className="border-t border-line px-5 pt-4 pb-1">
        <Blocks entries={entries} />
      </div>
    </details>
  );
}
