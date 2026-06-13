import Link from "next/link";
import { bibliography } from "@/lib/structure.mjs";

export const metadata = {
  title: "Sources and Further Reading",
  description:
    "Primary sources, academic scholarship, and Muslim responses consulted for the internal critique compendium.",
};

export default function SourcesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="mb-3 font-ui text-xs font-bold uppercase tracking-[0.22em] text-cite">Bibliography</p>
      <h1 className="mb-8 text-3xl font-bold leading-tight text-heading sm:text-4xl">
        Sources and Further Reading
      </h1>
      <ul className="ml-5 list-disc space-y-3 marker:text-cite">
        {bibliography.map((t, i) => (
          <li key={i} className="leading-relaxed text-ink">
            {t}
          </li>
        ))}
      </ul>
      <nav className="mt-12 border-t border-line pt-6 font-ui text-sm">
        <Link href="/" className="text-accent hover:underline">
          ← Back to contents
        </Link>
      </nav>
    </div>
  );
}
