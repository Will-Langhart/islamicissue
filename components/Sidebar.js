"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site, roman } from "@/lib/structure.mjs";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav aria-label="All parts and issues" className="font-ui text-sm">
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
