"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// The chat route is a self-contained, full-viewport experience (like Claude),
// so the site footer is suppressed there — otherwise the page scrolls past the
// composer to reveal the footer.
export default function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/chat")) return null;

  return (
    <footer className="mt-20 border-t border-line py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 text-center text-sm text-muted sm:px-6">
        <p className="font-semibold text-heading">Examining Islam from Within</p>
        <p className="max-w-xl leading-relaxed">
          Every claim sourced to the Quran, the sahih hadith, classical tafsir, or published scholarship —
          with Muslim responses stated before counter-rebuttals.
        </p>
        <p className="font-ui">
          <a href="/Examining-Islam-from-Within.docx" className="text-accent hover:underline">
            Download the full compendium (Word)
          </a>
          <span className="mx-2 text-line">·</span>
          <Link href="/sources" className="text-accent hover:underline">
            Sources
          </Link>
          <span className="mx-2 text-line">·</span>
          <Link href="/methodology" className="text-accent hover:underline">Methodology</Link>
          <span className="mx-2 text-line">·</span>
          <Link href="/timeline" className="text-accent hover:underline">Timeline</Link>
          <span className="mx-2 text-line">·</span>
          <Link href="/graph" className="text-accent hover:underline">Graph</Link>
          <span className="mx-2 text-line">·</span>
          <Link href="/citations" className="text-accent hover:underline">Citation report</Link>
          <span className="mx-2 text-line">·</span>
          <Link href="/corrections" className="text-accent hover:underline">Corrections</Link>
        </p>
        <p className="font-ui text-xs">Compiled June 2026.</p>
      </div>
    </footer>
  );
}
