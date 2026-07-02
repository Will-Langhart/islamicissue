import Link from "next/link";
import { bibliography } from "@/lib/structure.mjs";
import SourceExplorer from "@/components/SourceExplorer";

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
      <p className="mb-8 text-lg leading-relaxed text-muted">Filter the bibliography by the role a source plays in the case. The mix matters: primary texts establish what traditions say; scholarship helps determine what follows historically.</p>
      <SourceExplorer sources={bibliography} />
      <nav className="mt-12 border-t border-line pt-6 font-ui text-sm">
        <Link href="/" className="text-accent hover:underline">
          ← Back to contents
        </Link>
      </nav>
    </div>
  );
}
