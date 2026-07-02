// Claim-level audit records for Part I. These records are narrower than the
// prose: they show what a source actually establishes and where an inference
// begins. Last reviewed 2026-07-02.

const records = {
  "what-the-quran-says-about-the-torah-and-the-gospel": {
    reviewed: "July 2, 2026",
    status: "Claim-level review complete",
    thesis: "The Quran treats the Torah and Gospel as divine revelations and addresses seventh-century Jews and Christians as readers accountable to revealed scripture.",
    premises: [
      { label: "Textual observation", text: "Quran 3:3, 5:43, 5:47, 5:68, and 10:94 speak positively of earlier revelation and of communities reading it." },
      { label: "Disputed bridge", text: "The critical case reads those references as affirming substantially available Jewish and Christian scriptures, not only inaccessible originals." },
      { label: "Qualified conclusion", text: "The verses create a real interpretive tension, but do not by themselves settle the extent or kind of tahrif alleged elsewhere." },
    ],
    sources: [
      { perspective: "Primary", type: "Quran", citation: "Quran 5:47", quote: "Let the people of the Gospel judge by what Allah has revealed in it.", url: "https://quran.com/5/47", supports: "The verse addresses the People of the Gospel and assigns normative force to what God revealed in it.", limit: "It does not explicitly identify the Injil with the entire later New Testament canon." },
      { perspective: "Primary", type: "Quran", citation: "Quran 10:94", quote: "Ask those who read the Scripture before you.", url: "https://quran.com/10/94", supports: "The verse appeals to people characterized as readers of prior scripture.", limit: "Classical exegesis may restrict the intended witnesses to trustworthy or believing People of the Book." },
      { perspective: "Muslim", type: "Classical tafsir", citation: "Ibn Kathir on Quran 5:47", url: "https://quran.com/al-maidah/47/tafsirs/ar-tafsir-ibn-kathir", supports: "Ibn Kathir reads the command as the Gospel community judging by it in their own period.", limit: "This supplies a strong traditional alternative to reading 5:47 as a permanent endorsement of every circulating Christian text." },
      { perspective: "Muslim", type: "Classical tafsir", citation: "Al-Tabari on Quran 10:94", url: "https://quran.com/en/10%3A94/tafsirs/ar-tafsir-al-tabari", supports: "Al-Tabari identifies readers of Torah and Gospel who recognized Muhammad in their books.", limit: "He narrows the appeal to truthful believers such as Abdullah ibn Salam, not all Jewish and Christian readers." },
      { perspective: "Academic", type: "Reference article", citation: "Andrew O'Connor, “The Bible and the Qur'an,” Oxford Bibliographies (2024)", url: "https://doi.org/10.1093/obo/9780195393361-0322", supports: "Summarizes the scholarly tension between Quranic appeals to earlier scripture and accusations of misunderstanding or misuse.", limit: "It is an orientation to the debate, not an adjudication of the apologetic dilemma." },
      { perspective: "Academic", type: "Monograph", citation: "Gordon Nickel, Narratives of Tampering in the Earliest Commentaries on the Qur'an (Brill, 2011)", url: "https://doi.org/10.1163/9789004192393", supports: "Documents how early exegetes developed varied narratives of scriptural tampering.", limit: "Variation among commentators prevents attributing one uniform tahrif theory to all early Islam." },
    ],
  },
  "the-dilemma-stated": {
    reviewed: "July 2, 2026",
    status: "Claim-level review complete",
    thesis: "The dilemma has force only if the Quran endorses substantially identifiable biblical texts and those texts contradict Quranic Christology on central claims.",
    premises: [
      { label: "Premise A", text: "The Quran gives positive authority to earlier scripture available to its audience." },
      { label: "Premise B", text: "Pre-Islamic manuscript evidence establishes that crucifixion and high Christology were not late post-Quranic additions." },
      { label: "Contested conclusion", text: "If A and B are accepted without a qualifying theory of confirmation or tahrif, the Quran appears to validate sources that conflict with it." },
    ],
    sources: [
      { perspective: "Primary", type: "Quran", citation: "Quran 4:157", url: "https://quran.com/4/157", supports: "The standard reading denies that Jesus was killed or crucified by his opponents.", limit: "Muslim interpretations differ on what historically occurred and on the referent of the pronouns." },
      { perspective: "Primary", type: "Manuscript project", citation: "Codex Sinaiticus Project, manuscript history", url: "https://www.codexsinaiticus.org/en/project/history.aspx", supports: "The manuscript is generally dated to the mid-fourth century and preserves most of the Greek Bible, including the New Testament.", limit: "One codex cannot establish every reading or resolve the theological identity of the Quranic Injil." },
      { perspective: "Primary", type: "Manuscript archive", citation: "Israel Antiquities Authority, Leon Levy Dead Sea Scrolls Digital Library", url: "https://www.deadseascrolls.org.il/?locale=en_us", supports: "Provides pre-Islamic witnesses to Jewish biblical texts and their textual plurality.", limit: "The Dead Sea Scrolls contain no New Testament Gospel manuscripts." },
      { perspective: "Muslim", type: "Research paper", citation: "Taha Soomro and Sharif Randhawa, “The Qur'an's Engagement with Christian and Jewish Literature,” Yaqeen Institute (2023; updated 2024)", url: "https://yaqeeninstitute.org/read/paper/the-qurans-engagement-with-christian-and-jewish-literature", supports: "Presents confirmation as selective continuity and correction within a broader intertextual environment.", limit: "It begins from Islamic theological commitments and does not accept the dilemma's identification premise." },
      { perspective: "Academic", type: "Reference article", citation: "Andrew O'Connor, “The Bible and the Qur'an,” Oxford Bibliographies (2024)", url: "https://doi.org/10.1093/obo/9780195393361-0322", supports: "Confirms that the Quran's relationship to biblical scripture and tahrif remains a genuine scholarly interpretive question.", limit: "The article does not endorse either polemical conclusion." },
      { perspective: "Critical", type: "Editorial assessment", citation: "Argument dependency audit", supports: "Makes the hidden identification premise explicit: Torah/Injil must connect sufficiently to extant biblical traditions for the dilemma to work.", limit: "This is the site's reasoning, not an independent source." },
    ],
  },
  "the-qurans-own-falsification-test": {
    reviewed: "July 2, 2026",
    status: "Claim-level review complete",
    thesis: "Quran 4:82 invites reflection on internal consistency as evidence of divine origin, but applying it requires distinguishing contradiction from tension or unresolved interpretation.",
    premises: [
      { label: "Textual test", text: "Quran 4:82 contrasts divine origin with the presence of much inconsistency or discrepancy." },
      { label: "Method rule", text: "A proposed contradiction must use the same terms, respect literary context, and survive plausible harmonization." },
      { label: "Burden", text: "One genuine contradiction would challenge a maximal inerrancy claim; a list of merely difficult verses would not." },
    ],
    sources: [
      { perspective: "Primary", type: "Quran", citation: "Quran 4:82", quote: "Had it been from other than Allah, they would have found much inconsistency in it.", url: "https://quran.com/4/82", supports: "The verse explicitly connects divine provenance with freedom from substantial inconsistency.", limit: "The Arabic term and the force of “much” require interpretation; the verse does not define a modern logical test protocol." },
      { perspective: "Muslim", type: "Classical tafsir", citation: "Ibn Kathir on Quran 4:82", url: "https://quran.com/en/4%3A82/tafsirs/ar-tafsir-ibn-kathir", supports: "Ibn Kathir interprets the verse as denying inconsistency and contradiction in the Quran.", limit: "A theological commentary states the traditional conclusion; it does not independently test every alleged case." },
      { perspective: "Academic", type: "Commentary", citation: "Angelika Neuwirth, The Qur'an: Text and Commentary, vol. 1 (Yale University Press, 2022)", url: "https://doi.org/10.12987/yale/9780300232332.001.0001", supports: "Models historical, literary, and philological analysis rather than treating isolated verse pairs as self-interpreting.", limit: "Volume 1 focuses on early Meccan suras and is methodological context, not a direct commentary on 4:82." },
      { perspective: "Critical", type: "Editorial protocol", citation: "Contradiction test used by this site", supports: "Requires same sense, same respect, same time, and an exhaustive attempt at the strongest harmonization.", limit: "This protocol must still be applied issue by issue; labeling a tension is not proof of contradiction." },
    ],
  },
};

export function part1AuditFor(issueSlug) {
  return records[issueSlug] || null;
}

