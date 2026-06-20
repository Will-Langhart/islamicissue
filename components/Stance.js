import Blocks from "./Blocks";

// One stage of the dialectic (Critique → Response → Rebuttal), rendered with a
// role node that sits on the shared vertical rail drawn by the parent .dialectic
// wrapper. The opening "critique" stage renders as open prose; the later stages
// render as native <details> so responses and rebuttals stay collapsible with no
// client JS (and still expand for print via IssueTools). `seen` is threaded
// through so glossary terms are annotated only on first appearance.
const roleNode = {
  critique: "border-cite/70 bg-accentbg text-cite",
  response: "border-line bg-surface text-muted",
  rebuttal: "border-accent/60 bg-accentbg text-accent",
};

function RoleIcon({ role }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  // critique → magnifier (echoes the site mark); response → speech bubble;
  // rebuttal → return arrow (the counter).
  if (role === "critique")
    return (
      <svg {...common}>
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    );
  if (role === "response")
    return (
      <svg {...common}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h11a5 5 0 0 1 5 5v3" />
    </svg>
  );
}

export default function Stance({
  role,
  label,
  hint,
  entries,
  seen,
  open = false,
  dropCap = false,
  id,
}) {
  if (!entries) return null;

  const header = (
    <>
      <span className="font-ui text-xs font-bold uppercase tracking-[0.18em] text-heading">
        {label}
      </span>
      {hint && (
        <span className="ml-auto hidden font-ui text-xs italic text-muted sm:inline">
          {hint}
        </span>
      )}
    </>
  );

  return (
    <div id={id} className="relative scroll-mt-24 pl-14">
      <span
        aria-hidden="true"
        className={`absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full border ${roleNode[role]}`}
      >
        <RoleIcon role={role} />
      </span>

      {open ? (
        <section className="pb-2">
          <div className="mb-4 flex min-h-9 items-center gap-3">{header}</div>
          <Blocks entries={entries} seen={seen} dropCap={dropCap} />
        </section>
      ) : (
        <details
          className={`cv overflow-hidden rounded-lg border border-line bg-surface shadow-sm border-l-2 ${
            role === "rebuttal" ? "border-l-accent" : "border-l-line"
          }`}
        >
          <summary className="flex min-h-9 items-center gap-3 px-5 py-2.5 transition-colors hover:bg-accentbg">
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
            {header}
          </summary>
          <div className="border-t border-line px-5 pt-4 pb-1">
            <Blocks entries={entries} seen={seen} />
          </div>
        </details>
      )}
    </div>
  );
}
