"use client";

import { useMemo, useState } from "react";

const tabs = ["All", "Primary", "Muslim scholarship", "Academic", "Critical"];

function classify(source) {
  if (/Quran|Bukhari|Muslim, Sahih|Ibn Majah|Abu Dawud|al-Tabari|Ibn Kathir|Sira|Musnad/i.test(source)) return "Primary";
  if (/Islamic Awareness|Yaqeen|IslamQA|Muslim|Quran Variants/i.test(source)) return "Muslim scholarship";
  if (/University|Press|Journal|Der Islam|Oxford|Cambridge|Brill|Studies|Encyclop/i.test(source)) return "Academic";
  return "Critical";
}

export default function SourceExplorer({ sources }) {
  const [active, setActive] = useState("All");
  const classified = useMemo(() => sources.map((source) => ({ source, perspective: classify(source) })), [sources]);
  const shown = active === "All" ? classified : classified.filter((item) => item.perspective === active);
  return <>
    <div className="mb-6 flex flex-wrap gap-2 font-ui">
      {tabs.map((tab) => <button type="button" key={tab} onClick={() => setActive(tab)} aria-pressed={active === tab} className="filter-chip">{tab}</button>)}
    </div>
    <p className="mb-6 rounded-lg border border-line bg-accentbg p-3 font-ui text-xs leading-relaxed text-muted">Classification is editorial and provisional. “Primary” means a foundational text or classical source, not that every bibliographic detail has completed edition-level verification.</p>
    <ul className="space-y-3">
      {shown.map(({ source, perspective }, i) => <li key={`${source}-${i}`} className="source-row"><span>{perspective}</span><p>{source}</p></li>)}
    </ul>
  </>;
}
