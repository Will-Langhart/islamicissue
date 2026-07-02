// Editorial metadata is deliberately separate from the prose. It makes the
// site's judgments inspectable without pretending that every issue has already
// completed the same level of source review.

export const strengthByPart = {
  "islamic-dilemma": { level: "contested", label: "Contested", note: "The textual premises are clear; the force of the dilemma depends on how Quranic confirmation and tahrif are interpreted." },
  "quran-contradictions": { level: "contested", label: "Contested", note: "Most examples turn on harmonization, context, or abrogation and should be evaluated individually." },
  preservation: { level: "strong", label: "Strong documentary case", note: "Early manuscripts and Islamic literary sources provide unusually direct evidence, though theological conclusions remain disputed." },
  "history-science": { level: "mixed", label: "Mixed evidence", note: "Historical arguments vary considerably in quality; phenomenological and linguistic readings must be considered." },
  muhammad: { level: "contested", label: "Contested", note: "The source reports are often early Islamic traditions, while their historical interpretation remains disputed." },
  "theology-ethics": { level: "contested", label: "Worldview-dependent", note: "Textual tensions can be documented, but moral and theological conclusions depend partly on prior commitments." },
  "sharia-morality": { level: "strong", label: "Strong textual basis", note: "Classical legal sources are often explicit; modern application and moral evaluation require separate analysis." },
  "hadith-problem": { level: "strong", label: "Strong methodological case", note: "The late compilation and authentication problem is widely documented, but Muslim hadith methodology offers substantive replies." },
  "prophecy-miracle": { level: "mixed", label: "Mixed evidence", note: "Some claims are textually testable; miracle and literary-quality judgments are less falsifiable." },
};

export const timelineEvents = [
  { year: "c. 30–33", title: "Crucifixion of Jesus", kind: "history", detail: "The event affirmed by the earliest Christian sources and denied by Quran 4:157." },
  { year: "2nd–4th c.", title: "Major biblical manuscript witnesses", kind: "manuscript", detail: "Papyri and codices establish the broad pre-Islamic textual record of Christian scripture." },
  { year: "610–632", title: "Quranic proclamation", kind: "quran", detail: "Traditional period of Muhammad's revelations." },
  { year: "632–634", title: "First collection tradition", kind: "canon", detail: "Bukhari reports Zayd's collection under Abu Bakr after deaths at Yamama." },
  { year: "c. 650", title: "Uthmanic standardization", kind: "canon", detail: "A consonantal text is standardized and competing materials are ordered destroyed." },
  { year: "7th c.", title: "Sanaa palimpsest", kind: "manuscript", detail: "Its lower text witnesses a non-standard early textual tradition." },
  { year: "d. 870", title: "Sahih al-Bukhari", kind: "hadith", detail: "One of the most authoritative Sunni hadith collections is compiled." },
  { year: "d. 875", title: "Sahih Muslim", kind: "hadith", detail: "The second canonical Sunni sahih collection is compiled." },
  { year: "936", title: "Seven readings canonized", kind: "canon", detail: "Ibn Mujahid's selection helps define the later canonical reading tradition." },
  { year: "1924", title: "Cairo Quran edition", kind: "print", detail: "The Hafs reading receives a highly influential modern printed standard." },
];

export function editorialFor(partSlug) {
  return strengthByPart[partSlug] || strengthByPart["quran-contradictions"];
}

export function extractEvidence(entries = []) {
  const text = entries.map((entry) => typeof entry === "string" ? entry : entry.q ? `${entry.q} ${entry.ref || ""}` : entry.b ? entry.b.join(" ") : "").join(" ");
  const refs = [];
  const seen = new Set();
  const patterns = [
    { kind: "Quran", re: /Quran\s+\d+:\d+(?:[–-]\d+)?/g },
    { kind: "Hadith", re: /(?:Sahih al-Bukhari|Sahih Muslim|Sunan (?:Ibn Majah|Abi Dawud|Abu Dawud|al-Tirmidhi|an-Nasai)|Jami al-Tirmidhi|Musnad Ahmad|Muwatta Malik)\s+\d+/g },
  ];
  for (const { kind, re } of patterns) {
    for (const match of text.matchAll(re)) {
      if (!seen.has(match[0])) {
        seen.add(match[0]);
        refs.push({ kind, ref: match[0], status: "Linked primary text" });
      }
    }
  }
  return refs.slice(0, 8);
}

