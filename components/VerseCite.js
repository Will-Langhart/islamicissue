"use client";
import { useEffect, useId, useRef, useState } from "react";

// A Quran citation that links to quran.com and reveals the verse text inline.
// The <a> is real (SEO + cmd/ctrl-click opens quran.com); a plain click opens
// the preview popover instead of navigating, so readers can check the wording
// without leaving the page.
export default function VerseCite({ label, href, reference, verse }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // No verse text on hand → degrade to a plain external link.
  if (!verse?.translation) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="cite-link">
        {label}
      </a>
    );
  }

  const onClick = (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // allow new-tab
    e.preventDefault();
    setOpen((o) => !o);
  };

  return (
    <span
      ref={wrapRef}
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="cite-link"
        aria-describedby={open ? id : undefined}
        onClick={onClick}
      >
        {label}
      </a>
      {open && (
        <span
          role="tooltip"
          id={id}
          className="absolute left-1/2 top-full z-30 mt-2 w-[min(22rem,82vw)] -translate-x-1/2 cursor-auto rounded-lg border border-line bg-surface p-4 text-left shadow-xl"
        >
          <span className="mb-2 block font-ui text-[11px] font-bold uppercase tracking-wider text-cite">
            Quran {reference}
          </span>
          {verse.arabic && (
            <span
              dir="rtl"
              lang="ar"
              className="mb-2 block text-right text-xl leading-loose text-heading"
              style={{ fontFamily: "'Scheherazade New', 'Amiri', 'Noto Naskh Arabic', serif" }}
            >
              {verse.arabic}
            </span>
          )}
          <span className="block text-sm not-italic leading-relaxed text-ink">
            {verse.translation}
          </span>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block font-ui text-xs font-semibold text-accent hover:underline"
          >
            Read full context on Quran.com ↗
          </a>
          <span className="mt-1 block font-ui text-[10px] text-muted">
            Translation: Saheeh International
          </span>
        </span>
      )}
    </span>
  );
}
