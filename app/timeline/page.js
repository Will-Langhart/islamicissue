import { timelineEvents } from "@/lib/editorial.mjs";

export const metadata = { title: "Text and Tradition Timeline" };

export default function TimelinePage() {
  return <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6"><p className="eyebrow">Visual chronology</p><h1 className="page-title">Text and Tradition Timeline</h1><p className="lede">A compact orientation to the manuscript, canon, and hadith dates that recur throughout the case. Dates marked “c.” are approximate.</p>
    <div className="timeline mt-12">{timelineEvents.map((event) => <article key={`${event.year}-${event.title}`}><time>{event.year}</time><span className={`timeline-dot timeline-dot--${event.kind}`} /><div><small>{event.kind}</small><h2>{event.title}</h2><p>{event.detail}</p></div></article>)}</div>
  </div>;
}
