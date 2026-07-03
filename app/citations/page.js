import Link from "next/link";
import CitationReportDashboard from "@/components/CitationReportDashboard";

export const metadata = {
  title: "Citation Validation Report",
  description:
    "Build-time citation analytics and validation for Quran, Hadith, and scholar references across all issues.",
};

export default function CitationsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="mb-2 font-ui text-xs font-bold uppercase tracking-[0.22em] text-cite">
        Research Tool
      </p>
      <h1 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl">
        Citation Validation Report
      </h1>
      <p className="mt-4 max-w-3xl leading-relaxed text-muted">
        This dashboard tracks source usage and highlights malformed or out-of-range references
        discovered during build-time validation.
      </p>

      <div className="mt-8">
        <CitationReportDashboard />
      </div>

      <nav className="mt-10 border-t border-line pt-6 font-ui text-sm">
        <Link href="/" className="text-accent hover:underline">
          ← Back to contents
        </Link>
      </nav>
    </div>
  );
}

