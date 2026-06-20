"use client";
import { useEffect, useState } from "react";

// Sticky "On this page" rail for an issue: the dialectic stages plus Related.
// Scroll-spy highlights the current stage; clicking a collapsed stage opens it
// before scrolling so the reader lands on visible content. `items` is a stable
// array of { id, label } supplied by the issue page.
export default function InPageToc({ items }) {
  const [active, setActive] = useState(items[0]?.id);
  // Stable key so the effect only re-binds when the section set actually changes.
  const ids = items.map((i) => i.id).join("|");

  useEffect(() => {
    const onScroll = () => {
      const offset = 120; // clears the sticky header
      let current = items[0]?.id;
      for (const it of items) {
        const el = document.getElementById(it.id);
        if (el && el.getBoundingClientRect().top <= offset) current = it.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids]);

  const go = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const details = el.querySelector("details");
    if (details) details.open = true;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <nav
      aria-label="On this page"
      className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto"
    >
      <p className="mb-3 font-ui text-[11px] font-bold uppercase tracking-[0.2em] text-cite">
        On this page
      </p>
      <ul className="border-l border-line">
        {items.map((it) => {
          const on = active === it.id;
          return (
            <li key={it.id} className="-ml-px">
              <a
                href={`#${it.id}`}
                onClick={(e) => go(e, it.id)}
                className={`block border-l-2 py-1.5 pl-3 font-ui text-[13px] leading-snug transition-colors ${
                  on
                    ? "border-l-cite font-semibold text-heading"
                    : "border-l-transparent text-muted hover:text-accent"
                }`}
              >
                {it.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
