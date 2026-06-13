import Link from "next/link";
import { notFound } from "next/navigation";
import { site, getPart, roman, blockText } from "@/lib/structure.mjs";
import Sidebar from "@/components/Sidebar";

export const dynamicParams = false;

export function generateStaticParams() {
  return site.map((p) => ({ part: p.slug }));
}

export async function generateMetadata({ params }) {
  const { part: partSlug } = await params;
  const part = getPart(partSlug);
  if (!part) return {};
  return {
    title: part.title,
    description: part.intro[0].slice(0, 160),
  };
}

export default async function PartPage({ params }) {
  const { part: partSlug } = await params;
  const part = getPart(partSlug);
  if (!part) notFound();

  const prevPart = site.find((p) => p.num === part.num - 1);
  const nextPart = site.find((p) => p.num === part.num + 1);

  return (
    <div className="mx-auto flex max-w-6xl gap-10 px-4 py-10 sm:px-6">
      <aside className="hidden w-72 shrink-0 lg:block">
        <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
          <Sidebar />
        </div>
      </aside>

      <article className="min-w-0 flex-1">
        <p className="mb-3 font-ui text-xs font-bold uppercase tracking-[0.22em] text-cite">
          Part {roman[part.num - 1]} of {site.length}
        </p>
        <h1 className="mb-6 text-3xl font-bold leading-tight text-heading sm:text-4xl">
          {part.title.split(" — ")[1]}
        </h1>
        {part.intro.map((t, i) => (
          <p key={i} className="mb-4 text-lg leading-relaxed text-ink">
            {t}
          </p>
        ))}

        <h2 className="mt-10 mb-5 text-xl font-bold text-heading">Issues in this part</h2>
        <ol className="space-y-4">
          {part.items.map((item) => (
            <li key={item.slug}>
              <Link
                href={`/${part.slug}/${item.slug}`}
                className="group flex gap-5 rounded-lg border border-line bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-md"
              >
                <span className="w-7 shrink-0 text-right text-2xl font-bold leading-none text-cite/70">
                  {item.num}
                </span>
                <span className="min-w-0">
                  <h3 className="mb-1.5 font-bold leading-snug text-heading transition-colors group-hover:text-accent">
                    {item.title}
                  </h3>
                  <p className="line-clamp-2 text-sm leading-relaxed text-muted">
                    {blockText(item.critique).slice(0, 220)}…
                  </p>
                </span>
              </Link>
            </li>
          ))}
        </ol>

        <nav className="mt-12 flex justify-between gap-4 border-t border-line pt-6 font-ui text-sm">
          {prevPart ? (
            <Link href={`/${prevPart.slug}`} className="text-accent hover:underline">
              ← Part {roman[prevPart.num - 1]}: {prevPart.short}
            </Link>
          ) : (
            <Link href="/" className="text-accent hover:underline">
              ← Home
            </Link>
          )}
          {nextPart ? (
            <Link href={`/${nextPart.slug}`} className="text-right text-accent hover:underline">
              Part {roman[nextPart.num - 1]}: {nextPart.short} →
            </Link>
          ) : (
            <Link href="/conclusion" className="text-right text-accent hover:underline">
              Conclusion →
            </Link>
          )}
        </nav>
      </article>
    </div>
  );
}
