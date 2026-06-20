"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site, roman, flatIssues } from "@/lib/structure.mjs";

export default function Sidebar() {
  const pathname = usePathname();

  // Reading position derived from the URL: which part, which issue, and the
  // overall index across all issues — drives the mini-map strip below.
  const seg = pathname.split("/").filter(Boolean);
  const [partSlug, issueSlug] = seg;
  const currentPartIndex = site.findIndex((p) => p.slug === partSlug);
  const currentPart = currentPartIndex >= 0 ? site[currentPartIndex] : null;
  const currentIssue =
    currentPart && issueSlug
      ? currentPart.items.find((i) => i.slug === issueSlug)
      : null;
  const total = flatIssues.length;
  const globalNum = currentIssue
    ? flatIssues.findIndex(
        (f) => f.partSlug === partSlug && f.issueSlug === issueSlug
      ) + 1
    : 0;

  return (
    <nav aria-label="All parts and issues" className="font-ui text-sm">
      {/* Reading-position mini-map: one segment per part, filled by progress */}
      <div className="mb-4 rounded-lg border border-line bg-page/50 p-3">
        <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.15em] text-muted">
          <span>Reading map</span>
          {globalNum > 0 && (
            <span className="text-cite">
              {globalNum} <span className="text-muted">/ {total}</span>
            </span>
          )}
        </div>
        <div className="flex gap-1" aria-hidden="true">
          {site.map((part, pi) => {
            const pct =
              pi < currentPartIndex
                ? 100
                : pi === currentPartIndex && currentIssue
                ? Math.round((currentIssue.num / part.items.length) * 100)
                : 0;
            const here = pi === currentPartIndex;
            return (
              <div
                key={part.slug}
                title={`${roman[pi]}. ${part.short}`}
                className={`h-1.5 flex-1 overflow-hidden rounded-full ${
                  here ? "bg-accentbg" : "bg-line"
                }`}
              >
                <div
                  className="progress-fill h-full rounded-full"
                  style={{ width: `${pct}%` }}
                />
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] leading-snug text-muted">
          {currentPart ? (
            <>
              <span className="font-semibold text-heading">
                Part {roman[currentPartIndex]}
              </span>
              {" · "}
              {currentIssue
                ? `Issue ${currentIssue.num} of ${currentPart.items.length}`
                : "Overview"}
            </>
          ) : (
            "Select a part to begin"
          )}
        </p>
      </div>

      {site.map((part) => {
        const isCurrentPart = pathname.startsWith(`/${part.slug}`);
        return (
          <details key={part.slug} open={isCurrentPart} className="cv mb-1">
            <summary className="flex items-center gap-2 rounded-md px-2 py-1.5 font-semibold text-heading transition-colors hover:bg-line/40">
              <svg className="chev shrink-0 text-cite" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
              <span>
                {roman[part.num - 1]}. {part.short}
              </span>
            </summary>
            <ul className="mb-2 ml-3 border-l border-line pl-3">
              <li>
                <Link
                  href={`/${part.slug}`}
                  className={`block rounded px-2 py-1 italic transition-colors ${
                    pathname === `/${part.slug}`
                      ? "font-semibold text-accent"
                      : "text-muted hover:text-accent"
                  }`}
                >
                  Overview
                </Link>
              </li>
              {part.items.map((item) => {
                const href = `/${part.slug}/${item.slug}`;
                const active = pathname === href;
                return (
                  <li key={item.slug}>
                    <Link
                      href={href}
                      className={`block rounded px-2 py-1 leading-snug transition-colors ${
                        active
                          ? "font-semibold text-accent"
                          : "text-muted hover:text-accent"
                      }`}
                    >
                      {item.num}. {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </details>
        );
      })}
      <div className="mt-2 border-t border-line pt-2">
        <Link href="/conclusion" className={`block rounded px-2 py-1 transition-colors ${pathname === "/conclusion" ? "font-semibold text-accent" : "text-muted hover:text-accent"}`}>
          Conclusion
        </Link>
        <Link href="/sources" className={`block rounded px-2 py-1 transition-colors ${pathname === "/sources" ? "font-semibold text-accent" : "text-muted hover:text-accent"}`}>
          Sources
        </Link>
      </div>
    </nav>
  );
}
