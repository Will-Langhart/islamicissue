import Link from "next/link";
import GraphExplorer from "@/components/GraphExplorer";
import ConceptBrowser from "@/components/ConceptBrowser";

export const metadata = {
  title: "Knowledge Graph",
  description:
    "Explore the argument network behind the compendium: connected issues, concept frequencies, and relationship strength.",
  // A research tool, not reading content — kept out of search indexes.
  robots: { index: false, follow: true },
};

export default function GraphPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="mb-2 font-ui text-xs font-bold uppercase tracking-[0.22em] text-cite">
        Research Tool
      </p>
      <h1 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl">
        Knowledge Graph Lab
      </h1>
      <p className="mt-4 max-w-3xl leading-relaxed text-muted">
        This view surfaces how arguments connect across the project. Explore issue-to-issue links,
        inspect concept clusters, and jump directly into the strongest related discussions.
      </p>

      <div className="mt-8 space-y-8">
        <GraphExplorer />
        <ConceptBrowser />
      </div>

      <nav className="mt-10 border-t border-line pt-6 font-ui text-sm">
        <Link href="/" className="text-accent hover:underline">
          ← Back to contents
        </Link>
      </nav>
    </div>
  );
}

