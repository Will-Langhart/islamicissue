import Link from "next/link";
import { conclusionParas, flatIssues } from "@/lib/structure.mjs";

export const metadata = {
  title: "Conclusion: The Cumulative Case",
  description:
    "How the seven parts of the internal critique converge — tested against the Quran's own standard in 4:82.",
};

export default function ConclusionPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="mb-3 font-ui text-xs font-bold uppercase tracking-[0.22em] text-cite">Closing</p>
      <h1 className="mb-8 text-3xl font-bold leading-tight text-heading sm:text-4xl">
        Conclusion: The Cumulative Case
      </h1>
      {conclusionParas.map((t, i) => (
        <p key={i} className="mb-5 text-lg leading-relaxed text-ink">
          {t}
        </p>
      ))}
      <nav className="mt-12 flex flex-wrap justify-between gap-4 border-t border-line pt-6 font-ui text-sm">
        <Link href={flatIssues[flatIssues.length - 1].href} className="text-accent hover:underline">
          ← Back to the last issue
        </Link>
        <Link href="/sources" className="text-accent hover:underline">
          Sources and Further Reading →
        </Link>
      </nav>
    </div>
  );
}
