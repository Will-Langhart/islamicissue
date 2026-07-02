import Link from "next/link";

export const metadata = { title: "Methodology and Evidence Standards" };

const standards = [
  ["State the position", "The site argues that Islam is not divinely revealed. That conclusion is disclosed rather than hidden behind claims of neutrality."],
  ["Use internal critique", "Arguments should begin with Islamic texts, doctrines, or historical claims before importing outside theological assumptions."],
  ["Steelman responses", "A recognizable Muslim scholar should be able to identify the response section as a serious version of the position."],
  ["Separate text from inference", "A linked verse or hadith verifies what a source says. It does not, by itself, verify the site's interpretation."],
  ["Prefer primary and academic sources", "Popular apologetics can point toward an argument, but disputed historical claims should ultimately rest on primary texts and relevant scholarship."],
  ["Grade confidence", "Strong, contested, mixed, and worldview-dependent arguments are labeled differently. A cumulative case should not conceal its weaker components."],
  ["Correct publicly", "Material corrections are recorded with the date, affected page, change, and reason."],
];

export default function MethodologyPage() {
  return <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
    <p className="eyebrow">Editorial standards</p><h1 className="page-title">Methodology and Evidence Standards</h1>
    <p className="lede">Persuasion is most durable when readers can inspect the evidence, identify the assumptions, and disagree without being misrepresented.</p>
    <div className="mt-9 space-y-4">{standards.map(([title, body], i) => <section key={title} className="method-card"><span>{i + 1}</span><div><h2>{title}</h2><p>{body}</p></div></section>)}</div>
    <section className="mt-10 rounded-xl border border-line bg-surface p-6"><h2 className="text-xl font-bold text-heading">Current audit status</h2><p className="mt-2 leading-relaxed text-muted">Quran and major hadith references are automatically linked. Claim-level editions, page numbers, quotations, scholarly perspectives, and publication metadata are still being audited. Pages expose that gap rather than presenting it as completed work.</p></section>
    <p className="mt-8 font-ui text-sm"><Link href="/corrections" className="text-accent hover:underline">Read the corrections policy →</Link></p>
  </div>;
}
