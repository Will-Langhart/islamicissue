// Shared content module — single source of truth for the Word document and the website.
// Block entry types: string (paragraph), { q, ref } (block quote), { b: [...] } (bullet list).

const parts = [];

// ============ PART I ============
parts.push({
  title: "Part I — The Islamic Dilemma: The Quran and the Prior Scriptures",
  intro: [
    "The single most discussed internal critique of Islam in contemporary apologetics is the argument popularly known as the “Islamic Dilemma.” It is an internal critique in the strictest sense: it uses only the Quran’s own statements about the Torah and the Gospel, combined with the documented manuscript history of those scriptures, to argue that the Quran’s position is self-defeating. The argument does not assume the truth of Christianity or Judaism at any step; it asks only whether the Quran’s claims about prior revelation can be held together consistently.",
  ],
  items: [
    {
      title: "What the Quran Says About the Torah and the Gospel",
      critique: [
        "The Quran repeatedly affirms the Torah (Tawrat) and the Gospel (Injil) as genuine revelations of God, and—crucially—it speaks of them as present, available, and authoritative in the seventh century, in the hands of the Jews and Christians of Muhammad’s own day. Key passages include the following.",
        { q: "He has sent down upon you the Book in truth, confirming what was before it. And He revealed the Torah and the Gospel before, as guidance for the people.", ref: "Quran 3:3–4" },
        { q: "But how is it that they come to you for judgement while they have the Torah, in which is the judgement of Allah?", ref: "Quran 5:43" },
        { q: "And let the People of the Gospel judge by what Allah has revealed therein. And whoever does not judge by what Allah has revealed — then it is those who are the defiantly disobedient.", ref: "Quran 5:47" },
        { q: "Say, ‘O People of the Scripture, you are standing on nothing until you uphold the Torah, the Gospel, and what has been revealed to you from your Lord.’", ref: "Quran 5:68" },
        { q: "So if you are in doubt about that which We have revealed to you, then ask those who have been reading the Scripture before you.", ref: "Quran 10:94" },
        "Alongside these affirmations stands a categorical promise about the durability of God’s words: “The word of your Lord has been fulfilled in truth and in justice. None can alter His words” (Quran 6:115); “Recite what has been revealed to you of the Book of your Lord. None can change His words” (Quran 18:27). The Quran also tells its audience that Muhammad himself is “written in what they have of the Torah and the Gospel” (Quran 7:157) — a present-tense claim about texts in circulation circa 600–632 AD.",
      ],
    },
    {
      title: "The Dilemma Stated",
      critique: [
        "The argument runs as follows. (1) The Quran affirms the inspiration and continuing authority of the Torah and the Gospel that existed in the seventh century, commanding contemporary Christians to judge by the Gospel “with them.” (2) The Bible of the seventh century is, in all text-critical essentials, the Bible we possess today: Codex Sinaiticus and Codex Vaticanus (fourth century), the great papyri (second–third centuries), and the Dead Sea Scrolls (pre-Christian, for the Hebrew Bible) all predate Muhammad by centuries and contain the same books teaching the deity of Christ, His crucifixion, His resurrection, and salvation by atonement. (3) The Quran denies precisely these central teachings — it denies the crucifixion (Quran 4:157), denies that Jesus is the Son of God (Quran 9:30; 112:3), and denies the atonement (Quran 53:38). The dilemma follows:",
        { b: [
          "If the Bible is the preserved Word of God, then Islam is false, because the Quran contradicts the Bible’s core message about Jesus.",
          "If the Bible is corrupted, then Islam is still false, because the Quran — claiming to be the speech of an all-knowing God — affirmed, endorsed, and commanded obedience to a corrupted text, and asserted that no one can change God’s words.",
        ]},
        "Either way, the critic argues, the Quran cannot be the word of an omniscient God. The argument has been developed in published form by writers such as David Wood and discussed by both Christian and Muslim respondents (see the sources collected at islamicdilemma.net and Ad Lucem Ministries).",
      ],
      response: [
        "The mainstream Muslim answer is the doctrine of tahrif: the previous scriptures were genuinely revealed but were subsequently corrupted by Jews and Christians. Proof texts offered include Quran 2:79 (“Woe to those who write the Scripture with their own hands, then say, ‘This is from Allah’”), 3:78, 4:46, and 5:13 (they “distort words from their places”). On this view, the Quran confirms the original Torah and Injil, not the texts circulating in the seventh century, and the commands to “judge by the Gospel” refer either to what remains of the truth within it or to the original revelation. A more sophisticated modern variant holds that the Injil was a single book given to Jesus that is now lost entirely, so that the four Gospels were never the Injil at all.",
      ],
      rebuttal: [
        "Critics reply that the tahrif response collides with the Quran’s own wording. First, the corruption proof texts describe distortion “with their tongues” (Quran 3:78) — misreading, mispronouncing, concealing — and 3:78 explicitly says they do this “so that you may think it is from the Scripture, but it is not from the Scripture,” which presupposes an intact Scripture against which the distortion is measured. Second, Quran 5:43 says the Jews of Medina have the Torah “in which is the judgement of Allah” — present tense, about physical books in seventh-century Arabia. Third, Quran 10:94 tells Muhammad to resolve his own doubts by asking the People of the Book, which would be incoherent advice if their scriptures were corrupt. Fourth, the claim that the “real Injil” is lost is an article of faith with no manuscript, patristic, or historical evidence: no fragment, citation, or memory of any such book exists, whereas the four Gospels are attested within decades of Jesus.",
        "Classical Muslim scholarship itself was divided. The thoroughgoing textual-corruption thesis is largely a development associated with Ibn Hazm (d. 1064), four centuries after Muhammad, formulated in polemical context. Earlier and later authorities — al-Tabari on several verses, al-Razi, and in the modern period Muhammad Abduh, who wrote that the charge of textual corruption “makes no sense at all,” since Jews and Christians scattered across the world could never have coordinated identical changes — located the corruption in interpretation, not text. The manuscript record settles the empirical question: the Bible Muhammad’s contemporaries possessed is the Bible we can read today in manuscripts that predate him. Whatever the Quran was confirming in 600s Arabia, we still have it — and the Quran contradicts it.",
      ],
    },
    {
      title: "The Quran’s Own Falsification Test",
      critique: [
        "The Quran proposes an internal test of its divine origin: “Do they not reflect upon the Quran? If it had been from other than Allah, they would have found within it much contradiction” (Quran 4:82). This invites precisely the kind of examination undertaken in this document. The critic’s claim is that the Quran fails its own test — not on one or two debatable points but across doctrine (Part II), textual transmission (Part III), history and science (Part IV), and the career of its prophet (Part V). By the Quran’s own standard, a single genuine internal contradiction is evidence against its divine origin.",
      ],
      response: [
        "Muslim commentators respond that 4:82 refers to contradiction in the Quran’s overall message, guidance, and consistency of theology across twenty-three years of revelation, and that all alleged contradictions have harmonizations in the tafsir literature. The doctrine of abrogation (naskh) is invoked for legal tensions: later rulings supersede earlier ones by divine design, which is development, not contradiction (so al-Tabatabai and others).",
      ],
      rebuttal: [
        "The critic answers that harmonization-by-any-means is unfalsifiable: if every tension can be dissolved by positing a new distinction after the fact, then 4:82 is no test at all, and the verse’s rhetorical force evaporates. Abrogation in particular sits awkwardly with the claim that the Quran is the timeless speech of God inscribed on a preserved tablet (Quran 85:21–22): an eternal, unchangeable decree that nonetheless cancels and replaces its own rulings within a single generation (Quran 2:106; 16:101) looks, from the outside, like a text responding to changing political circumstances — and early Muslims themselves catalogued hundreds of abrogated verses (the counts in al-Suyuti and Ibn al-Jawzi range from five to over two hundred).",
      ],
    },
  ],
});

// ============ PART II ============
parts.push({
  title: "Part II — Internal Contradictions Within the Quran",
  intro: [
    "This part catalogues the most frequently cited internal tensions in the Quranic text itself. For each, the standard harmonization offered by Muslim commentators is given, followed by the critic’s assessment of that harmonization. Comprehensive lists are maintained by WikiIslam (“Contradictions in the Quran”) and discussed in the academic literature on Quranic composition (e.g., the editorial-process analyses of Joseph Witztum and the Corpus Coranicum project).",
  ],
  items: [
    {
      title: "How Many Days of Creation — Six or Eight?",
      critique: [
        "Quran 7:54, 10:3, 11:7, and 25:59 state that Allah created the heavens and the earth in six days. But Quran 41:9–12 itemizes the process: two days for the earth (41:9), four days for the mountains and sustenance (41:10), and two days for the seven heavens (41:12). Two plus four plus two is eight, not six.",
      ],
      response: [
        "Commentators from al-Tabari onward harmonize by reading the four days of 41:10 as inclusive of the first two — i.e., “in four days” means “completing four days from the start,” so the sequence is 2 + (2 more = 4 total) + 2 = 6.",
      ],
      rebuttal: [
        "Critics note that this reading is not what the Arabic naturally says — each stage is introduced as a discrete act with its own duration — and that the inclusive-counting device is applied here and nowhere else in the Quran’s arithmetic, suggesting it is motivated solely by the need to avoid the contradiction. An omniscient author dictating a “clear book” (Quran 12:1) could have said “two more days.”",
      ],
    },
    {
      title: "Who Was the First Muslim?",
      critique: [
        "Quran 6:14 and 6:163 command Muhammad to be “the first of the Muslims.” Quran 7:143 has Moses declare “I am the first of the believers.” Quran 2:131–132 presents Abraham as submitting (aslamtu) and bequeathing islam to his sons, and 3:67 calls him a muslim. Egyptian magicians (7:120–126) and the disciples of Jesus (5:111) are likewise called muslims long before Muhammad.",
      ],
      response: [
        "The standard answer: “first” is relative to each prophet’s own community and era — Muhammad is the first Muslim of his umma, Moses of his.",
      ],
      rebuttal: [
        "This is a workable harmonization, critics concede, but it concedes that the Quran’s superlatives cannot be read at face value — a hermeneutical solvent which, once licensed, can dissolve any inconvenient statement in the book, undermining the claim of clear, decisive revelation (cf. Quran 11:1: a book “whose verses are perfected”).",
      ],
    },
    {
      title: "How Long Is a Day with Allah — 1,000 Years or 50,000?",
      critique: [
        "Quran 22:47 and 32:5 say a day with the Lord is “as a thousand years of those you count.” Quran 70:4 says the angels ascend to Him “in a day the measure of which is fifty thousand years.”",
      ],
      response: [
        "Harmonizers say these describe different “days” — the day of cosmic administration versus the Day of Judgment — or that both are simply idioms for vast spans.",
      ],
      rebuttal: [
        "Possible, critics reply, but the texts give no such qualifiers; both use the same construction (“a day, the measure of which is…”). The idiom defense again trades precision for safety: if numbers in the Quran are not to be pressed, the same courtesy must extend to its numbered miracles and prophecies.",
      ],
    },
    {
      title: "Was Iblis an Angel or a Jinn?",
      critique: [
        "In Quran 2:34, 7:11, 15:28–31, 17:61, 20:116 and 38:71–74, Allah commands the angels to prostrate to Adam, “and they prostrated, except Iblis” — a grammatical exception that places Iblis among the angels addressed. Yet Quran 18:50 states flatly: “he was of the jinn, and he departed from the command of his Lord.” The problem compounds: Quran 66:6 says angels “do not disobey Allah in what He commands them,” so an angel Iblis could not have rebelled, while a jinn Iblis was never commanded in the verses that only address angels.",
      ],
      response: [
        "The classical answer makes the exception in 2:34 a “disconnected exception” (istithna munqati) — Iblis was a jinn present among the angels and included in the command by association. Some traditions (via Ibn Abbas) say he was an angel-class being from a tribe called jinn.",
      ],
      rebuttal: [
        "Critics observe that the disconnected-exception reading must be invoked in all seven retellings, and that the Ibn Abbas tradition simply restates the contradiction as biography. The simplest source-critical explanation is that the Quran inherits two distinct late-antique traditions — the Christian fallen-angel narrative (cf. the Cave of Treasures) and an Arabian jinn demonology — without fully reconciling them.",
      ],
    },
    {
      title: "Does Intercession Exist or Not?",
      critique: [
        "Quran 2:254 warns of a Day in which there is “no bargaining, no friendship, and no intercession (shafa‘a).” Quran 2:48 and 6:51 likewise deny intercessors. But Quran 10:3, 19:87, 20:109, and 53:26 allow intercession “by His permission,” and the hadith corpus builds an entire soteriology on Muhammad’s intercession for sinners of his umma (Sahih al-Bukhari 7510).",
      ],
      response: [
        "The harmonization: what is denied is unauthorized intercession (the pagan model of idols interceding autonomously); what is affirmed is intercession granted by Allah’s leave.",
      ],
      rebuttal: [
        "The distinction is genuinely present across the corpus, critics concede, but 2:254 admits no exception — it is addressed to believers, not pagans, and denies the thing categorically on that Day. The harmonization works only by importing a qualifier the verse pointedly lacks, in a book that elsewhere does state the qualifier. The tension between an unbendable divine justice and a vast hadith economy of intercession remains one of the live fault lines between Quranist and traditionalist Muslims.",
      ],
    },
    {
      title: "Could Allah Have a Son?",
      critique: [
        "Quran 39:4 says: “If Allah had intended to take a son, He could have chosen from what He creates whatever He willed.” Quran 19:35 says it is “not befitting” for Allah to take a son, but the conditional in 39:4 treats it as possible. Yet Quran 6:101 argues it is impossible for a different reason: “How could He have a son when He has no consort?” The first text says a son would be chosen from creation (no consort needed); the second says a son is ruled out for lack of a consort.",
      ],
      response: [
        "Commentators read 6:101 as a reductio against the pagan Meccans’ notion of literal divine offspring, and 39:4 as a hypothetical showing Allah’s self-sufficiency; both deny sonship, so there is no contradiction in doctrine.",
      ],
      rebuttal: [
        "The doctrinal conclusion is consistent, critics agree — but the arguments are mutually undermining, and more importantly, both attack a biological-procreation concept of sonship that no Christian creed ever held. Nicene Christianity explicitly confesses the Son as “begotten, not made… not created,” eternal, without consort or procreation. An omniscient author correcting Christianity would have engaged the doctrine Christians actually profess; the Quran instead refutes a crude caricature (see also 5:116 below).",
      ],
    },
    {
      title: "Does the Quran Misdescribe the Trinity?",
      critique: [
        "Quran 5:116 has Allah ask Jesus: “Did you say to the people, ‘Take me and my mother as two gods besides Allah?’” Quran 5:73 condemns those who say “Allah is the third of three,” and 4:171 warns “do not say ‘Three.’” Read together with 5:75 (Jesus and Mary “both used to eat food” — an argument against their divinity), the Quran appears to think the Christian Trinity is Allah, Jesus, and Mary, and that Christians worship three gods. No Christian body, orthodox or heretical, ever defined the Trinity as Father, Son, and Mary; the doctrine is one God in three persons, defined at Nicaea (325) and Constantinople (381), centuries before the Quran.",
      ],
      response: [
        "Apologists answer that 5:116 condemns Mariolatry (excessive Marian veneration, allegedly among the “Collyridians” mentioned by Epiphanius), not a definition of the Trinity, and that “third of three” renders a Syriac Christian idiom for the Trinity rather than asserting tritheism.",
      ],
      rebuttal: [
        "The Collyridian rescue rests on a single hostile fourth-century reference to an obscure sect with no evidence of presence in seventh-century Arabia, critics reply — while the Quran addresses “People of the Gospel” generally, never distinguishing a fringe sect from the Chalcedonian, Miaphysite, and Nestorian churches that actually surrounded Arabia. And if 5:116 targets only excess veneration, the question put to Jesus (“did you tell people to take you and your mother as two gods”) still misses every form of Christianity on record. The internal-critique point stands: the Quran claims to correct Christian doctrine yet repeatedly engages a doctrine no Christians held.",
      ],
    },
    {
      title: "Tolerance Verses Versus Sword Verses, and the Problem of Abrogation",
      critique: [
        "“There is no compulsion in religion” (Quran 2:256) and “to you your religion, to me mine” (109:6) sit alongside “kill the polytheists wherever you find them” (9:5) and “fight those who do not believe in Allah… until they pay the jizya with willing submission and feel themselves subdued” (9:29). Classical jurists resolved the tension chronologically: the Medinan sword verses abrogate the earlier irenic ones. Ibn Kathir’s tafsir on 9:5 cites al-Dahhak: it “abrogated every agreement of peace between the Prophet and any idolater.” The internal problem is twofold: the Quran both contains the contradiction and contains the abrogation mechanism (2:106) that institutionalizes it — and Quran 2:106 responds to the accusation of substitution (16:101: “when We substitute a verse in place of a verse… they say, ‘You are but an inventor’”) by affirming that substitution occurs.",
      ],
      response: [
        "Modernist scholars (following Muhammad Abduh and others) reject the abrogating status of 9:5: its immediate context (9:4, 9:6–7) exempts treaty-keeping polytheists and commands safe conduct, so the verse addresses only specific treaty-breaking Arab tribes; the peaceful verses remain operative, and abrogation, if real at all, concerns a handful of legal details.",
      ],
      rebuttal: [
        "The modernist reading may be the more humane one, critics respond, but the internal critique targets the tradition as a whole: for over a millennium the dominant juristic schools held the opposite, building the fiqh of offensive jihad on exactly these verses, and they did so using the Quran’s own stated mechanism of abrogation. A revelation whose “clear verses” (3:7) yielded a thousand years of consensus that modernists now call a misreading is, at minimum, not perspicuous — and the disagreement over which verses even remain in force (counts of abrogated verses range from 5 to 247 among classical authorities, per al-Suyuti’s al-Itqan) is itself an internal incoherence in the doctrine of a preserved, eternal message.",
      ],
    },
    {
      title: "Pure Arabic — With Foreign Loanwords",
      critique: [
        "The Quran insists on its pure Arabic character as evidence of authenticity: “a clear Arabic tongue” (16:103; 26:195), “an Arabic Quran without any crookedness” (39:28). Yet the text contains scores of non-Arabic loanwords — Syriac, Hebrew, Greek, Persian, Ethiopic — catalogued by Muslim philologists themselves (al-Suyuti devotes a section of al-Itqan to them) and by Arthur Jeffery’s The Foreign Vocabulary of the Qur’an (1938): injil (Greek euangelion), firdaws (Persian paradayadam via Greek), istabraq (Persian), sirat (Latin strata via Aramaic), and many more.",
      ],
      response: [
        "Defenders answer that “Arabic” describes the language as a whole, not every lexeme; all living languages absorb loanwords, which become naturalized Arabic by use — a point al-Suyuti already made.",
      ],
      rebuttal: [
        "Fair enough as linguistics, critics reply, but 16:103 is responding to a specific accusation — that a foreign informant taught Muhammad — by contrasting the informant’s foreign tongue with the Quran’s clear Arabic. If the Quran’s vocabulary is in fact saturated with the religious terminology of Syriac-speaking Christianity and Judaism, the apologetic force of the verse inverts: the loanword distribution maps precisely onto the biblical and post-biblical material the Quran retells (Gabriel Said Reynolds, The Qur’an and the Bible, 2018), which is what one expects from human cultural contact, not pristine dictation.",
      ],
    },
  ],
});

// ============ PART III ============
parts.push({
  title: "Part III — The Preservation Problem: Textual History of the Quran",
  intro: [
    "The mainstream Muslim claim — taught in da‘wa materials worldwide — is that the Quran is perfectly preserved, letter for letter, since its revelation, in fulfillment of Quran 15:9 (“Indeed, We sent down the Reminder, and We are its Guardian”). The internal critique tests this claim against Islam’s own canonical sources: Sahih al-Bukhari, Sahih Muslim, Ibn Abi Dawud’s Kitab al-Masahif, al-Suyuti’s al-Itqan, and the physical manuscript record. The argument is not that the Quran is wildly different from the seventh-century text — academic scholarship affirms the Uthmanic consonantal skeleton is well preserved — but that Islam’s own sources falsify the perfect-preservation claim that Islam makes for itself, a standard the Quran also wields against the Bible.",
  ],
  items: [
    {
      title: "The Quran Was Compiled After Muhammad’s Death — and Parts Were Nearly Lost",
      critique: [
        "By Islam’s own account (Sahih al-Bukhari 4986), the Quran was not collected in a book during Muhammad’s lifetime. After many reciters died at the Battle of Yamama, Umar feared “a large part of the Quran may be lost,” and Abu Bakr commissioned Zayd ibn Thabit, who protested that shifting a mountain would have been lighter work, and who then gathered the text “from palm-leaf stalks, thin white stones, and from the men who knew it by heart.” The last verses of Surat al-Tawba were found “with none other than” a single man, Abu Khuzayma al-Ansari. A community one careless battle away from losing parts of its scripture is not a community in possession of a supernaturally guarded text.",
      ],
      response: [
        "Muslims answer that preservation was primarily oral — thousands of huffaz carried the whole text in memory — and the written collection was a redundancy, not the primary vehicle. The Abu Khuzayma report concerns written attestation only; the verses were known in memory.",
      ],
      rebuttal: [
        "The sources themselves undercut this, critics reply: Umar’s stated fear was precisely that the deaths of memorizers endangered the text, which is incoherent if oral preservation was secure; and the next sections show that the memorizers disagreed with each other about the text’s contents.",
      ],
    },
    {
      title: "Uthman Burned the Competing Codices",
      critique: [
        "Sahih al-Bukhari 4987 reports that during the campaigns in Armenia and Azerbaijan, Hudhayfa was alarmed by Muslims’ differences in recitation and begged Uthman: “Save this nation before they differ about the Book as the Jews and the Christians did before.” Uthman had a standard edition copied out and then “ordered that all the other Quranic materials, whether written in fragmentary manuscripts or whole copies, be burnt.” The perfect-preservation narrative thus contains, at its center, a state-ordered destruction of the variant evidence — an act that makes the claim “no variants existed” unfalsifiable by design, and which several companions resisted.",
      ],
      response: [
        "The standard account: the differences were merely dialectal — the Quran was revealed in “seven ahruf” (modes), and Uthman eliminated confusion by standardizing on the Quraysh dialect. The burning unified the community around an accurate text verified by surviving companions and memorizers; nothing of the revelation was lost.",
      ],
      rebuttal: [
        "Critics make three points. First, if the variants were trivial dialect, the alarm of civil-war-level division (“as the Jews and Christians differed”) and the drastic remedy of burning are inexplicable. Second, the “seven ahruf” doctrine is itself obscure — classical scholars recorded dozens of incompatible opinions about what the ahruf even were (al-Suyuti lists many), and the canonical qira’at do not map onto them. Third, the companion-level disagreements recorded in Islam’s own sources (next item) were not dialectal: they concerned which surahs belonged in the Quran and the wording of verses.",
      ],
    },
    {
      title: "Ibn Mas‘ud and Ubayy: The Master Reciters Disagreed About the Canon",
      critique: [
        "Muhammad himself named Abdullah ibn Mas‘ud first among the four men from whom Muslims should learn the Quran (Sahih al-Bukhari 3808). Yet Islam’s own literature records that Ibn Mas‘ud’s codex omitted Surat al-Fatiha and the last two surahs (113 and 114), which he reportedly did not consider part of the Quran (Ibn Abi Dawud, Kitab al-Masahif; al-Suyuti, al-Itqan; the reports are discussed by Ibn Hajar in Fath al-Bari). When Uthman’s standardization came, Ibn Mas‘ud told his students to “conceal your codices” rather than surrender them, and bristled that the community was being ordered to follow the text of Zayd, a junior. Ubayy ibn Ka‘b’s codex, conversely, contained two extra compositions (al-Khal‘ and al-Hafd) used as prayers, and companions reported Surat al-Ahzab had once been as long as al-Baqara (286 verses; today it has 73) — the report transmitted from Ubayy in Musnad Ahmad and discussed in al-Itqan.",
      ],
      response: [
        "Defenders respond that the Ibn Mas‘ud reports are isolated (ahad) and contested; some scholars (e.g., al-Nawawi, al-Baqillani) denied their authenticity, or explained that he merely declined to write the surahs because they were so universally known, or considered them protective prayers rather than recitation. Ubayy’s extras were du‘a (supplications) he wrote in his personal copy, and the al-Ahzab report refers to abrogated material withdrawn by Allah.",
      ],
      rebuttal: [
        "The critic notes the structure of these replies: every report that fits the preservation narrative is accepted from these sources, and every report that does not is declared weak, misunderstood, or abrogated — yet the reports come through the same isnad culture that authenticates the rest of the tradition. Explaining lost material as “abrogated by withdrawal of recitation” (naskh al-tilawa) does not rescue perfect preservation; it renames imperfect preservation as a divine act. And the very existence of the category — verses Muslims once recited that are no longer in the Quran — is conceded by the tradition itself, as the next item shows.",
      ],
    },
    {
      title: "Missing Verses: Stoning, Adult Suckling, and the Sheep",
      critique: [
        "Umar ibn al-Khattab, preaching from Muhammad’s own pulpit, declared: “Allah sent Muhammad with the truth and revealed the Book to him, and among what was revealed was the verse of stoning (ayat al-rajm). We recited it, memorized it, and understood it… I am afraid that after a long time has passed, somebody will say, ‘By Allah, we do not find the verse of stoning in Allah’s Book,’ and thus they will go astray” (Sahih al-Bukhari 6829). The verse is not in the Quran; the punishment it prescribed (stoning for adultery) remains in sharia, sourced from a verse that vanished. Aisha reported that a verse prescribing ten (later five) sucklings to establish foster-kinship “was among what was recited of the Quran” when Muhammad died (Sahih Muslim 1452), and in Sunan Ibn Majah 1944 she adds that the page on which it was kept was eaten by a sheep after his death. Abu Musa al-Ash‘ari recalled an entire lost surah “similar in length to Bara’a” of which only one line was remembered (Sahih Muslim 1050).",
      ],
      response: [
        "Islamic scholarship classifies these under naskh al-tilawa: the recitation was abrogated by Allah while (for stoning and suckling) the legal ruling remained. The sheep detail in Ibn Majah is graded weak (da‘if) by many scholars (so IslamQA 175355), though the underlying suckling-verse report in Sahih Muslim is accepted. Nothing was “lost”; Allah withdrew what He willed, per Quran 2:106 (“We do not abrogate a verse or cause it to be forgotten except that We bring forth one better”).",
      ],
      rebuttal: [
        "Critics respond that “abrogation of recitation with retention of ruling” is a category invented to reconcile these reports with 15:9, with no Quranic basis — 2:106 speaks of replacing verses with better ones, not of deleting them while keeping their laws. Umar’s own stated fear (“people will say we do not find it in Allah’s Book”) shows he regarded it as belonging in the Book, not as graciously withdrawn. On the preservation claim as advertised — every letter intact from Gabriel to today — Islam’s most authentic sources answer: verses existed, were recited, and are not in the codex. That is the definition of textual loss, whatever theological name is given to it.",
      ],
    },
    {
      title: "The Sanaa Palimpsest: Physical Evidence of a Different Text",
      critique: [
        "In 1972, restoration work in the Great Mosque of Sanaa uncovered a cache of early manuscripts, among them a palimpsest (Sanaa 1 / DAM 01-27.1) whose erased lower text is the only surviving witness to a non-Uthmanic textual tradition, radiocarbon-dated with high probability to the mid-seventh century. The lower text differs from the standard Quran in word order, wording, omissions, and additions — far beyond spelling (Behnam Sadeghi and Mohsen Goudarzi, “Ṣan‘ā’ 1 and the Origins of the Qur’ān,” Der Islam, 2012; see also the Wikipedia and WikiIslam treatments). It corroborates the literary reports of companion codices: in the first decades, the Quranic text was fluid, and the uniformity that exists today is the product of Uthman’s standardization and later refinements — not unbroken letter-perfect transmission.",
      ],
      response: [
        "Muslim scholars respond that the lower text may be a student’s exercise, a private copy with errors, or one of the readings later abandoned under the ahruf concession; its erasure and correction to the standard text shows the community’s quality control working. Academic scholars (including Sadeghi) affirm the Uthmanic text itself is an early, well-preserved tradition going back to the Prophet’s recitations.",
      ],
      rebuttal: [
        "The critic accepts the academic consensus — and points out that it is fatal to the theological claim, not supportive of it. “The Uthmanic recension is old and stable” is a statement about one textual tradition that a caliph imposed while burning others; Sanaa 1 is direct physical proof that at least one different tradition circulated as Quran among believers. Perfect preservation of everything revealed is the doctrine; preservation of one edited recension is the evidence. Those are different claims, and Muslim apologetics routinely equivocates between them — a point made even by the Muslim-run Quran Variants project, which catalogues “bad apologetic arguments on Quran preservation.”",
      ],
    },
    {
      title: "The Qira’at: Today’s Qurans Differ From Each Other",
      critique: [
        "The Quran printed in Saudi Arabia (the reading of Hafs from Asim) and the Quran traditionally used in North and West Africa (Warsh from Nafi) differ in thousands of details of pronunciation and in dozens of places in actual wording and meaning: e.g., Quran 1:4 maliki (“Owner”) versus maliki (“King”) of the Day of Judgment; 3:146 qatala (“he fought”) versus qutila (“he was killed”); 2:184 differences affecting the law of fasting ransom. These descend from the ten canonical “readings,” formalized when Ibn Mujahid (d. 936) — three centuries after Muhammad — selected seven systems and the authorities suppressed others (the reader Ibn Shanabudh was tried and flogged in 935 for reciting non-canonical variants). The dating of canonical readings is documented in the academic literature on the transmission history (see Academia.edu, “Variations in the Consonantal Text of Qur’anic Manuscripts from Uthman to Ibn Mujahid”).",
      ],
      response: [
        "The traditional position: all canonical qira’at are divinely revealed, transmitted by mass-transmission (tawatur) from the Prophet under the seven-ahruf dispensation; the variations are complementary facets of one revelation, enriching meaning rather than contradicting it. Standard da‘wa materials present the differences as minor and mutually illuminating.",
      ],
      rebuttal: [
        "Critics reply that “every variant is revelation” multiplies the miracle to cover the data — and contradicts the Uthman narrative, which exists precisely because differing recitations were tearing the community apart and were suppressed, not celebrated. Nor can readings canonized by a tenth-century scholar’s choice of seven (a number he admittedly took from the ahruf hadith) claim unbroken mass-transmission; Islam’s own biographical literature records the canon being enforced by trial and lash. The bottom line for the preservation claim: a Muslim in Riyadh and a Muslim in Casablanca today hold printed Qurans that do not match word for word, while the da‘wa claim remains “not one letter has changed.” Both cannot be true.",
      ],
    },
  ],
});

// ============ PART IV ============
parts.push({
  title: "Part IV — Historical Anachronisms and Scientific Difficulties",
  intro: [
    "The Quran presents itself as the speech of the Creator, free of error. The critiques in this part allege errors of two kinds: anachronisms — details transplanted from one era into another, of the sort a seventh-century compiler drawing on garbled traditions would make, but an omniscient author would not — and descriptions of nature that reflect the science of late antiquity rather than reality. Catalogues are maintained at WikiIslam (“Historical Errors in the Quran”; “Scientific Errors in the Quran”) and in Christian apologetic compilations; mainstream Muslim responses are drawn from Islamic Awareness and similar sites.",
  ],
  items: [
    {
      title: "Haman in Pharaoh’s Egypt",
      critique: [
        "The Quran places a figure named Haman in Egypt as Pharaoh’s minister in the time of Moses (Quran 28:6, 28:38; 40:24, 40:36–37), where Pharaoh asks him to build a tower of baked bricks to look upon the God of Moses. In the Bible, Haman is the vizier of the Persian king Ahasuerus in the book of Esther — roughly a thousand years later and a thousand miles away — and the brick tower to reach heaven belongs to the Babel story (Genesis 11). The Quran appears to have fused Esther, Babel, and Exodus into a single scene.",
      ],
      response: [
        "Apologists (notably Islamic Awareness) argue “Haman” may be an Arabicized Egyptian title or name (proposals include Ha-Amen, connected to the god Amun), so the Quran preserves authentic Egyptian color the Bible lost; Maurice Bucaille popularized a claim that a hieroglyphic inscription names a construction overseer with a similar name.",
      ],
      rebuttal: [
        "Egyptologists have not accepted these reconstructions: the proposed etymologies are ad hoc, the Bucaille claim badly misrepresents the inscription (the name read is not Haman and the title is a doorkeeper, not a master builder), and the convergence of the three biblical motifs (Haman’s name, Pharaoh’s court, the brick tower against heaven) is far more economically explained by oral conflation of well-known stories — exactly the explanation that fits the Quran’s other retellings. The Babylonian Talmud (Megillah 11a) and other late-antique Jewish texts already associated Haman with tyrannical tower-builders, providing a documented literary pathway.",
      ],
    },
    {
      title: "Crucifixion Before Crucifixion Existed",
      critique: [
        "The Quran has Pharaoh in Moses’ day threaten to crucify people on palm trunks (Quran 7:124; 20:71; 26:49), and describes crucifixion in Joseph’s Egypt (12:41). Crucifixion as a method of execution is attested from the first millennium BC (Assyrians/Persians, then Carthaginians and Romans); there is no evidence of it in New Kingdom or Middle Kingdom Egypt, roughly half a millennium to a millennium earlier.",
      ],
      response: [
        "Defenders argue salb in Arabic can denote impalement or exposure of a corpse on a stake or tree, which ancient Egypt did practice (some point to “putting to the stake” in Egyptian sources), so the verses need not mean Roman-style crucifixion.",
      ],
      rebuttal: [
        "Critics answer that the Quran’s own usage fixes the meaning: the same verb describes the punishment in 5:33 alongside amputation, and 4:157 uses it for the crucifixion of Jesus — Roman crucifixion. The Pharaoh verses also specify crucifixion “on the trunks of palm trees” with mass application to the magicians, which reads as the standard punishment-scene of late antiquity retrojected into the Bronze Age, alongside the anachronistic dirham coins paid for Joseph (12:20, silver coinage appearing only c. 600 BC).",
      ],
    },
    {
      title: "The Samaritan at Sinai",
      critique: [
        "Quran 20:85–97 blames the golden-calf episode at Sinai on “al-Samiri” — the Samaritan. The Samaritans as a people emerged from the population history of the northern kingdom after the Assyrian conquest (8th century BC) and the schism around the Gerizim temple (Persian/Hellenistic period) — many centuries after Moses. A Samaritan at Sinai is like a Protestant at the Last Supper.",
      ],
      response: [
        "Apologists propose al-Samiri is a personal name or epithet unrelated to Samaria (from samara, or a tribal name Samir), or that he came from a place retroactively called Samaria.",
      ],
      rebuttal: [
        "The classical commentators themselves (al-Tabari and others) understood him to be connected with the Samaritans, and the polemical fit is conspicuous: Samaritans were the archetypal calf-associated schismatics in Jewish eyes (cf. the long-standing Jewish accusation about the calf of Bethel in Samaritan territory), making this another documented motif-migration into the Quran’s retelling rather than independent history.",
      ],
    },
    {
      title: "Mary the Sister of Aaron, Daughter of Amram",
      critique: [
        "The Quran calls Mary, mother of Jesus, “sister of Aaron” (19:28) and “daughter of Imran” (66:12; cf. 3:35–36, where the wife of Imran bears Mary). Moses’ and Aaron’s father in the Bible is Amram (Arabic: Imran) and their sister is Miriam — in Hebrew and Aramaic the same name as Mary (Maryam). The straightforward reading is that the Quran has conflated Mary of Nazareth with Miriam, daughter of Amram, who lived more than a millennium earlier.",
      ],
      response: [
        "The classical answer comes from a hadith: when Christians of Najran raised this very objection, Muhammad replied that people “used to give names after the prophets and pious persons before them” (Sahih Muslim 2135) — “sister of Aaron” means descendant or tribal affiliate of Aaron, idiomatic for a priestly lineage; “daughter of Imran” likewise marks the clan (so Islamic Awareness, “Mary, Sister of Aaron?”).",
      ],
      rebuttal: [
        "Critics note three problems. First, Sahih Muslim 2135 answers only the “sister of Aaron” phrase; it does not address the Quran’s naming of Mary’s father as Imran and her mother as “the wife of Imran” — a complete family portrait matching Miriam’s, not a loose tribal idiom. Second, the kinship idiom defense requires “sister of,” “daughter of,” and “wife of” all to be non-literal in the same family narrative, while the Quran uses the identical terms literally everywhere else. Third, the conflation has a documented source-pathway: Syriac Christian texts and homilies already drew typological parallels between Miriam and Mary, the kind of material an oral environment would fuse — and which an omniscient author would not.",
      ],
    },
    {
      title: "The Sun Sets in a Muddy Spring",
      critique: [
        "In the Dhul-Qarnayn narrative, the traveler journeys “until, when he reached the setting-place of the sun, he found it setting in a muddy spring, and he found near it a people” (Quran 18:86), and later reaches “the rising-place of the sun… upon a people for whom We had not made any shelter from it” (18:90). The text narrates the sun’s setting-place and rising-place as physical locations reachable by travel — cosmology at home in seventh-century folklore (the Alexander legend, of which the Dhul-Qarnayn story is a recognized parallel via the Syriac Alexander Legend, c. 630 AD) but not in reality.",
      ],
      response: [
        "The standard response: the verse describes appearance from Dhul-Qarnayn’s vantage — he reached the westernmost point of his journey and saw the sun appear to set in murky water (an ocean horizon or volcanic spring); the Quran speaks phenomenologically, as we still say “sunset.”",
      ],
      rebuttal: [
        "Critics reply that the Arabic narrates what he found (wajadaha taghrubu — “he found it setting in a muddy spring”), with a settlement of people located “near it”; the parallel “rising-place” scene describes people who live where the sun rises on them without covering, which is not vantage language. Early commentators took it concretely (al-Tabari transmits views of the sun setting in dark mud), and the contemporaneous Syriac Alexander Legend has Alexander reach the fetid sea at the world’s edge where the sun sets — the same story-world. The phenomenological reading is a modern retrofit; the natural reading is a borrowed legend with a flat-earth horizon.",
      ],
    },
    {
      title: "Semen From Between the Backbone and the Ribs",
      critique: [
        "“Let man consider from what he was created. He was created from a fluid, ejected, emerging from between the backbone and the ribs” (Quran 86:5–7). Sperm is produced in the testes and seminal fluid in glands in the pelvis — not between the spine and ribcage. The description matches Greek medical theory (the Hippocratic and Galenic view that semen descends from the region of the kidneys/back), which circulated in late antiquity.",
      ],
      response: [
        "Apologetic harmonizations: the verse describes the embryonic origin of the gonads near the kidneys (which later descend), or the “fluid” is the combined male-female contribution and the body region named is the woman’s, or sulb/tara’ib poetically denotes the loins of the man and chest of the woman respectively (see, e.g., the responses at Infiniti Islam and Answering Christianity).",
      ],
      rebuttal: [
        "Each rescue, critics observe, requires the verse to be about something other than what it says: the fluid described is “ejected/gushing” semen, an adult phenomenon, not an embryonic structure; and the multiplicity of mutually exclusive apologetic readings (man’s back and woman’s ribs; gonadal embryology; pure metonymy) signals that the plain sense — semen comes from the torso region between back and ribs, as Greek physicians taught — is being avoided because it is wrong.",
      ],
    },
    {
      title: "Embryology: The Clot and the Bones-Then-Flesh Sequence",
      critique: [
        "Quran 23:13–14 describes development: a drop (nutfa), then a clinging clot (alaqa), then a chewed-like lump (mudgha), “then We made the lump into bones, then We clothed the bones with flesh.” There is no blood-clot stage in embryology, and bone and muscle develop concurrently from the mesoderm — muscle does not get draped over a pre-formed skeleton. The four-stage scheme closely parallels Galen’s embryology (semen → bloody vascularized form → flesh → articulated skeleton clothed in flesh), a correspondence documented by the Muslim historian of science Basim Musallam (Sex and Society in Islam, 1983), who wrote that “the stages of development which the Quran and Hadith established for believers agreed perfectly with Galen’s scientific account.”",
      ],
      response: [
        "The famous modern defense — promoted via Maurice Bucaille and the commissioned statements of embryologist Keith Moore in the 1980s — re-translates alaqa as “leech-like clinging thing” (accurate for implantation) and presents the sequence as miraculously ahead of its time; bones-then-flesh is defended as cartilage models preceding mature muscle attachment.",
      ],
      rebuttal: [
        "Critics respond that the “scientific miracle” industry is a twentieth-century apologetic genre: classical lexicons and every classical commentator render alaqa as a clot of blood; the hadith corpus fixes the stages at forty days each (Sahih al-Bukhari 3208), which is flatly false (the heart beats at week three; limbs form well before day 80); and the Galenic parallel — conceded by a Muslim scholar with no polemical agenda — explains both what the Quran gets approximately right and exactly where it goes wrong, since it errs where Galen erred. A revelation that tracks the best available human science of its day, including its mistakes, is evidence of a human author with human sources.",
      ],
    },
    {
      title: "Stars as Missiles, Seven Earths, and the Solid Sky",
      critique: [
        "The Quran describes the stars (lamps adorning “the nearest heaven”) as projectiles hurled at eavesdropping devils (Quran 67:5; 37:6–10; 72:8–9), conflating stars with meteors. It teaches seven heavens in layers and “of the earth, the like of them” — seven earths (65:12). The sky is a “ceiling, protected” (21:32) held up without visible pillars (31:10), which could fall on the earth (34:9), and on the Last Day will be rolled up like a scroll (21:104); the earth is spread out like a carpet or bed (2:22; 15:19; 71:19; 88:20). Hadith complete the picture: the sun travels daily to prostrate beneath Allah’s Throne before being commanded to rise again (Sahih al-Bukhari 3199, commenting on Quran 36:38).",
      ],
      response: [
        "Apologists treat the shooting-star passages as describing meteors only (the “lamps” doing double duty), the seven heavens as atmospheric layers or unseen dimensions, the spread-out earth as phenomenological description of the earth’s habitable surface (with 79:30 dahaha sometimes translated “made egg-shaped”), and Bukhari 3199 as the sun’s metaphorical prostration of submission.",
      ],
      rebuttal: [
        "The critic’s reply: the texts form a coherent ancient cosmology — flat extended earth, solid layered firmament, celestial lamps in the lowest layer, a literal divine throne above — which matches the Near Eastern world-picture of the period point for point, and every modern reading must take each element in isolation and allegorize it against its plain sense and its classical interpretation. The “egg-shaped earth” translation of dahaha is a modern invention unknown to classical tafsir (which glossed it “spread out”). Seven atmospheric layers do not exist as discrete heavens, and no reading of 65:12 produces seven earths. As with embryology, the Quran’s cosmos is the cosmos of its time and place.",
      ],
    },
    {
      title: "Hadith Science: The Fly, the Camel Urine, and Adam’s Height",
      critique: [
        "Because Sunni Islam holds the sahih hadith to be revelation-adjacent (Muhammad “does not speak from desire,” Quran 53:3–4 as traditionally applied), their scientific content is internally fair game: if a fly falls in your drink, dip it fully, for one wing carries disease and the other its cure (Sahih al-Bukhari 3320); the sick were prescribed camel urine to drink (Bukhari 233); black seed cures every disease except death (Bukhari 5688); fever is from the heat of Hell and is cooled with water (Bukhari 3261); Adam was created sixty cubits (about 27 metres) tall, and people have been shrinking since (Bukhari 3326) — contradicted by the continuous skeletal record of human stature.",
      ],
      response: [
        "Responses include: occasional studies are cited hopefully (antibacterial peptides on flies; thymoquinone in black seed); camel urine reflected era-appropriate folk medicine permitted, not revealed science; some modernists simply demote such reports to non-binding or question isolated transmitters even within the Sahihayn.",
      ],
      rebuttal: [
        "The critic notes the asymmetry: when a hadith can be made to sound prescient it is broadcast as a miracle of prophetic knowledge; when it is indefensible it is reclassified as folk medicine or “not part of the message.” But Bukhari’s fly hadith states a precise etiological claim (disease on one wing, cure on the other) with no scientific support, and the Adam report is unambiguous and falsified. Either the sahih corpus carries prophetic authority or it does not; Islam’s traditional epistemology says it does, and that epistemology is what the internal critique tests.",
      ],
    },
  ],
});

// ============ PART V ============
parts.push({
  title: "Part V — The Prophetic Credentials of Muhammad",
  intro: [
    "Islam stands or falls with one claim: that Muhammad was a true prophet receiving speech from God. The critiques in this part are internal in the strongest sense — every datum comes from the Quran itself or from the hadith and sira literature that Islam grades most authentic. The recurring pattern alleged by critics: revelations that arrive on cue to license the Prophet’s personal interests, episodes the tradition itself found embarrassing, and a stated Quranic test for false prophets that the tradition then narrates Muhammad failing.",
  ],
  items: [
    {
      title: "A Messenger Without Signs — Who Later Has Thousands",
      critique: [
        "When the Meccans demanded miracles, the Quran’s consistent answer was refusal: “Say: the signs are only with Allah, and I am only a clear warner. Is it not sufficient for them that We revealed to you the Book?” (Quran 29:50–51); “Nothing prevented Us from sending the signs except that the former peoples denied them” (17:59); challenged to ascend to heaven or produce fountains, Muhammad is told to reply, “Glory be to my Lord! Am I anything but a human messenger?” (17:90–93). Yet the later hadith corpus attributes hundreds of public miracles to him — splitting the moon, water flowing from his fingers, feeding multitudes. The internal tension: the Quran, the earliest source, presents a prophet whose only sign is the book; the miracle traditions grow with distance from the events, the classic signature of legend.",
      ],
      response: [
        "Muslims harmonize by reading the refusal verses as declining the specific demanded signs (whose rejection would have triggered annihilation, per 17:59’s logic), not denying all miracles; the moon-splitting is anchored in Quran 54:1–2 (“the moon has split”), and mass-transmitted reports cannot be legend.",
      ],
      rebuttal: [
        "Critics reply that 29:50–51 is general (“the signs are only with Allah… is not the Book sufficient?”), and that 54:1–2’s context has the deniers calling it “continuing magic” with no historical corroboration anywhere on earth for a globally visible event. The growth pattern — zero contemporary miracle claims in the Quran’s polemic context (where they were demanded and would have been decisive), abundant claims two centuries later — is precisely how the tradition’s own science of hadith explains fabrication in other cases.",
      ],
    },
    {
      title: "Convenient Revelations: Zaynab, the Wives, and Aisha’s Observation",
      critique: [
        "Quran 33:37 authorizes Muhammad to marry Zaynab bint Jahsh, the divorced wife of his own adopted son Zayd — and reveals that Allah had already decreed the marriage (“you concealed within yourself what Allah was to disclose”), while 33:4–5 simultaneously abolishes adoption as a legal institution, removing the obstacle. Quran 33:50 grants Muhammad, “exclusively for you, not the believers,” categories of women beyond the four-wife limit imposed on others (4:3); 33:51 permits him to defer or take whichever wives he wishes, upon which Aisha — his own wife, in Islam’s most authentic collection — remarked: “I feel that your Lord hastens in fulfilling your wishes and desires” (Sahih al-Bukhari 4788). In Quran 66:1–5, after a domestic dispute (the Maria/Hafsa affair in the classical commentaries), Allah personally intervenes to release Muhammad from an oath, scold two wives, and threaten them that the Prophet could divorce them all and receive better.",
      ],
      response: [
        "The traditional defenses: the Zaynab marriage was a painful divine commission to demolish the pagan adoption taboo, which only the Prophet’s own example could break (so Ibn Kathir on 33:37; IslamQA 96464) — he concealed it out of fear of people’s talk, for which the verse rebukes him, and a fabricated revelation would hardly rebuke its author. Aisha’s remark is read as the candid affection of a co-wife, demonstrating the tradition’s honesty. The Prophet’s special marital privileges served political alliance, widow care, and the transmission of his private conduct to the community through many witnesses.",
      ],
      rebuttal: [
        "Critics answer that the rebuke defense proves too little: court prophets in every tradition include mild self-criticism, which costs nothing and buys credibility, while the operative content of each revelation — the marriage permitted, the limit waived, the oath dissolved, the wives subdued — runs uniformly in the founder’s personal favor. The probability question is cumulative: one self-serving oracle might be providence; a documented series in which heaven repeatedly adjudicates the Prophet’s household disputes in his favor, capped by his own wife’s wry observation preserved in Bukhari, is the pattern one expects from a human source. And abolishing adoption — stripping adopted children of filiation and inheritance across an entire civilization, permanently — to clear one marriage is a moral cost the harmonization simply absorbs.",
      ],
    },
    {
      title: "The Satanic Verses Incident",
      critique: [
        "Early Islamic sources — al-Tabari’s History and tafsir, Ibn Sa‘d’s Tabaqat, and the sira tradition of Ibn Ishaq, with numerous chains catalogued by modern scholarship (Shahab Ahmed, Before Orthodoxy, 2017, who shows the early community broadly accepted the story) — report that while reciting Surat al-Najm, Muhammad uttered verses praising the pagan goddesses al-Lat, al-Uzza, and Manat (“these are the exalted cranes; their intercession is hoped for”), prostrating with the Meccans, before later declaring the words had been thrown in by Satan. The Quran itself contains the apparent aftermath: “We did not send before you any messenger or prophet except that when he recited, Satan threw into his recitation; but Allah abolishes what Satan throws in” (22:52), and the warning “they almost tempted you away from what We revealed to you, that you might fabricate against Us something else… then We would have made you taste double punishment in life and death” (17:73–75).",
      ],
      response: [
        "The dominant later position (following al-Razi and others, and most modern Muslims) rejects the story outright: its chains are mostly mursal (broken), it contradicts prophetic infallibility (isma) in conveying revelation, and 22:52 needs no such occasion. Some classical scholars (Ibn Taymiyya among them) accepted a version, holding that Allah’s correction is exactly what 22:52 promises and the incident thus confirms the system works.",
      ],
      rebuttal: [
        "Critics press the dilemma: if the story is false, the early Islamic historical method — the same isnad culture that delivers the sira, the compilation accounts, and the occasions of revelation — manufactured and widely transmitted a maximally embarrassing fiction within the first two centuries, which corrodes confidence in everything else it transmits; Shahab Ahmed’s study shows rejection of the story became orthodoxy only later, driven by developing isma doctrine, not by evidence. If the story is true, then by the Quran’s own test the recitation stream was, at least once, satanically contaminated and indistinguishable to its audience — and a text whose own mechanism admits satanic insertions corrected after the fact cannot offer the certainty Islam claims for it. Either horn damages the tradition; there is no third.",
      ],
    },
    {
      title: "The Bewitchment of the Prophet",
      critique: [
        "Sahih al-Bukhari 5763 (cf. 3268) reports that a Jewish sorcerer, Labid ibn al-A‘sam, bewitched Muhammad “so that he used to think that he had done a thing which he had not done” — a condition lasting, in some reports, months. Yet the Quran indignantly denies the pagans’ charge “you follow only a bewitched man” (Quran 25:8; 17:47) as the slander of wrongdoers. Islam’s most authentic hadith collection thus affirms the very condition the Quran treats as a disqualifying accusation — and a prophet who cannot distinguish what he did from what he did not do has, on Islam’s own terms, a compromised channel of testimony.",
      ],
      response: [
        "Scholars respond that the magic affected only mundane domestic matters (famously, whether he had approached his wives), never the reception or delivery of revelation, which Allah guaranteed (5:67: “Allah will protect you from the people”); the episode ends with revelation (the mu‘awwidhatayn) exposing and breaking the spell, vindicating prophecy. The pagans’ “bewitched man” taunt meant “a madman whose whole message is delusion,” which is different from a temporary domestic affliction.",
      ],
      rebuttal: [
        "The critic notes that the domestic/prophetic firewall is asserted, not evidenced — the report itself says he thought he had done things he had not, a global statement about his reality-testing; no narrator audited which utterances during those months were affected. A tradition that affirms its prophet spent a period unable to track his own actions, while resting its entire epistemology on that man’s reports of invisible encounters, has an internal credibility problem that the firewall hypothesis papers over. Notably, some Muslim modernists (and the Mu‘tazila historically) rejected the bewitchment reports precisely because they saw the contradiction — but the reports sit in Bukhari, the collection the tradition calls the most authentic book after the Quran.",
      ],
    },
    {
      title: "Aisha’s Age",
      critique: [
        "Sahih al-Bukhari 5134: “The Prophet married me when I was six years old, and consummated the marriage when I was nine years old” — Aisha’s own narration, repeated in Bukhari 3896 and Sahih Muslim 1422, with corroborating details (she was playing on a swing; her dolls; she remained with him nine years). Quran 65:4 prescribes a divorce waiting-period for wives “who have not yet menstruated,” which classical jurists across all schools read as regulating marriage to pre-pubescent girls. The internal critique is straightforward: Islam presents Muhammad as al-insan al-kamil, the perfect man and timeless moral exemplar (Quran 33:21; 68:4), and its most authentic sources record this.",
      ],
      response: [
        "Three families of response: (1) contextual — the marriage was arranged socially (by Abu Bakr’s circle, with no objection from Muhammad’s enemies, who attacked him for much else), age at menarche defined adulthood in virtually all premodern societies, and judging the seventh century by modern ages of consent is anachronism; (2) revisionist — some modern Muslims recompute Aisha’s age to 15–19 from sira chronology (her sister Asma’s age, the timing of her conversion), treating the Bukhari numbers as transmission error; (3) theological — the marriage was divinely commanded (Muhammad dreamt of her presented in silk, Bukhari 3895).",
      ],
      rebuttal: [
        "Critics reply: against (2), the revisionists must overturn multiply-attested first-person reports in the two most authentic collections — the same standard of evidence Islam uses for everything else — to rescue a conclusion fixed in advance; classical scholarship was unanimous about the nine, and used it juridically. Against (1), the anachronism defense works for an ordinary seventh-century man but not for a timeless exemplar: Quran 33:21 makes his conduct normative for all ages, and jurists accordingly kept child marriage lawful for centuries on this precedent — the critique targets exactly that normative claim. Against (3), defending the act by private dream-revelation restates the problem of self-authenticating convenient revelation documented above.",
      ],
    },
    {
      title: "Banu Qurayza and the Captives",
      critique: [
        "After the Battle of the Trench, the men of the Jewish tribe Banu Qurayza surrendered; on the verdict of Sa‘d ibn Mu‘adh — which Muhammad ratified as “the judgement of Allah” (Sahih al-Bukhari 4121) — all adult males (sira sources: 600–900) were beheaded in the market trenches of Medina, and the women and children enslaved; Quran 33:26 references the event (“some you killed, and some you took captive”). Quran 4:24 permits intercourse with married captive women (“those your right hands possess”), the occasion of revelation being the captives of Awtas (Sahih Muslim 1456). At Khaybar, Kinana, husband of Safiyya, was tortured and killed over treasure, and Muhammad took Safiyya in marriage (Ibn Ishaq; the marriage itself is in Bukhari 371).",
      ],
      response: [
        "Defenders argue Banu Qurayza committed treason during an existential siege, violating the Constitution of Medina; the punishment followed the tribe’s own scripture (Deuteronomy 20 parallels) via Sa‘d’s arbitration, which both sides accepted in advance; captive concubinage regulated an institution universal in antiquity, with strong incentives toward manumission; the Kinana torture report comes from Ibn Ishaq without an authenticated chain.",
      ],
      rebuttal: [
        "Critics respond that treason was collective only by tribal attribution — individual fighters and non-combatant adolescents (tradition: boys were inspected for pubic hair to decide execution, Sunan Abi Dawud 4404) were killed by category; that invoking Deuteronomy concedes the moral standard Islam claims to supersede; and that the sira material is accepted by the tradition when it supplies chronology and victories but waved off as chainless when it records cruelty. Above all, the internal problem is normativity: these precedents entered fiqh as law (captive concubinage, the treatment of surrendered fighters), because the actor is the eternal exemplar — which is precisely the claim the critique tests.",
      ],
    },
    {
      title: "The Aorta Test: Quran 69:44–46 and the Prophet’s Death",
      critique: [
        "The Quran states a vivid test for a fabricating prophet: “If he had invented false sayings about Us, We would have seized him by the right hand, then We would have cut his aorta (al-watin)” (Quran 69:44–46). Islam’s most authentic collection then records Muhammad’s final illness, traced to the poisoned lamb served by a Jewish woman at Khaybar: “O Aisha! I still feel the pain caused by the food I ate at Khaybar, and now I feel as if my aorta (abhari) is being cut from that poison” (Sahih al-Bukhari 4428). On Islam’s own documents, Muhammad died describing in himself the precise sign his revelation assigned to a false prophet.",
      ],
      response: [
        "Muslim scholars respond that the two passages use different Arabic words (watin in the Quran, abhar in the hadith), that 69:44–46 describes an immediate divine execution scene (seizure by the right hand, instant severing) not a lingering illness three years after the poisoning, that the Prophet’s death by poison conferred the rank of martyrdom, and that his words were an idiom of mortal pain, not a clinical claim.",
      ],
      rebuttal: [
        "Critics reply that watin and abhar are treated as synonyms or near-synonyms by the classical lexicons (both denoting the great vessel whose severing means death) — the hadith’s wording deliberately echoes the verse, which is presumably why the tradition preserved it as significant; that the “immediacy” qualifier is absent from the verse, which specifies the manner of the sign, not a stopwatch; and that the martyrdom reframing concedes the event while relabeling it. The argument is not that poison proves fabrication; it is that the Quran volunteered a falsification criterion, and the tradition’s own most-sahih memory of the Prophet’s death narrates him, in the first person, matching it. A tradition cannot author both texts and keep both claims.",
      ],
    },
  ],
});

// ============ PART VI ============
parts.push({
  title: "Part VI — Theological and Ethical Tensions",
  intro: [
    "This part examines internal strains within Islamic theology proper: the character of Allah as the Quran describes him, the coherence of Islamic soteriology, and ethical rulings that sit uneasily with the claim of a perfectly just and merciful lawgiver.",
  ],
  items: [
    {
      title: "Allah, the Best of Schemers",
      critique: [
        "The Quran repeatedly applies the verb makara — to scheme, plot, deceive — to Allah: “they schemed, and Allah schemed; and Allah is the best of schemers (khayru al-makirin)” (Quran 3:54; cf. 8:30; 7:99: “do they feel secure from the scheme of Allah? None feels secure from the scheme of Allah except the losing people”; 4:142: the hypocrites “seek to deceive Allah, but He is deceiving them”). In every other Quranic usage, makr is morally negative — the plotting of the wicked. A deity who out-schemes schemers, and from whose scheming even believers may not feel secure (7:99), generates an internal epistemological problem: a revelation from a God whose self-description includes supreme deception cannot guarantee that the revelation itself is not part of a scheme.",
      ],
      response: [
        "Theologians answer that makr predicated of Allah is requital-in-kind — a rhetorical device (mushakala) in which the punishment is named after the crime: Allah “schemes” only against schemers, justly turning their plots upon them; His attribute is best because His purposes are righteous. Translations such as “planner” reflect this.",
      ],
      rebuttal: [
        "Critics note that 7:99 extends the warning to everyone (“none feels secure… except the losers”), beyond the plotters of 3:54, and that 4:142’s active deception of hypocrites — letting them believe falsely until the Day — is deception in the ordinary sense, however just. The contrast with the Bible’s “God is not a man, that He should lie” (Numbers 23:19) and “it is impossible for God to lie” (Hebrews 6:18) frames the apologetic exchange, but the internal point needs no Bible: a system whose God deceives whom He wills and leads astray whom He wills (14:4; 74:31) cannot, from inside itself, certify its own revelation.",
      ],
    },
    {
      title: "Predestination Versus Accountability",
      critique: [
        "“We have certainly created for Hell many of the jinn and mankind” (Quran 7:179). “If We had willed, We could have given every soul its guidance, but the word from Me will come true: I will surely fill Hell with jinn and people all together” (32:13). Allah “leads astray whom He wills and guides whom He wills” (14:4; 16:93; 74:31), and “you do not will except that Allah wills” (81:29). The same book holds every soul responsible for its unbelief and punishes it eternally. The hadith sharpen it: the angel writes each fetus’s deeds and destiny in the womb (Sahih al-Bukhari 3208), and Muhammad said of children of polytheists, “Allah knows what they would have done” — while the classical Ash‘ari synthesis (kasb, “acquisition”) holds that Allah creates every human act, which the human merely acquires.",
      ],
      response: [
        "Islamic theology answers with kasb (al-Ash‘ari) or divine-knowledge compatibilism (the Maturidi line): Allah creates acts, humans earn them through intention; “leading astray” is judicial — Allah abandons those who first choose denial (cf. 2:26: “He misleads not except the defiantly disobedient”). The Mu‘tazila simply affirmed libertarian freedom. Mystery beyond this is adab before the divine decree.",
      ],
      rebuttal: [
        "Critics observe that kasb was mocked within Islam itself as a verbal evasion (“more subtle than the kasb of al-Ash‘ari” became a proverb for incomprehensibility), that 7:179 and 32:13 state purpose (“created for Hell… I will surely fill Hell”), not mere foreknowledge, and that the existence of three irreconcilable classical schools (Jabriyya, Ash‘ariyya, Mu‘tazila/Qadariyya) on the most consequential question in the religion — with each side armed with proof texts — is itself the internal datum: the revelation underdetermines its own answer to whether the damned ever had a chance.",
      ],
    },
    {
      title: "The Crucifixion Denial",
      critique: [
        "Quran 4:157 declares of the Jews: “they did not kill him, nor did they crucify him, but it was made to appear so to them (shubbiha lahum)… they certainly did not kill him.” The crucifixion of Jesus under Pontius Pilate is among the most securely established facts of ancient history — attested by Josephus, Tacitus, all four Gospels, the pre-Pauline creeds, and conceded by the most skeptical critical scholars (Bart Ehrman: the crucifixion is as certain as anything historical can be; John Dominic Crossan likewise). The Quran, written six hundred years later and a thousand kilometres away, denies it in a single ambiguous clause, offering a substitution scenario (someone made to resemble Jesus) that classical commentators filled with contradictory candidates (Judas, Simon of Cyrene, a volunteer disciple). Internally, the Quran elsewhere has Jesus say “peace is upon me the day I was born, the day I die, and the day I am raised alive” (19:33) and has Allah say “I will cause you to die (mutawaffika) and raise you to Myself” (3:55) — texts most naturally read as affirming a death the tradition then relocates to a second coming.",
      ],
      response: [
        "Muslims respond that divine revelation outranks human historiography — the appearance (shubbiha) explains the unanimous human testimony, so historical evidence cannot count against it; some modern scholars and the Ahmadiyya read 4:157 as denying only that the Jews killed him (Allah took him), allowing a crucifixion survived or a natural death; mutawaffika in 3:55 is glossed as “taking in full” (sleep-like assumption), deferring death to the eschaton.",
      ],
      rebuttal: [
        "Critics answer that an unfalsifiable illusion-hypothesis (“God made all the evidence look that way”) is the epistemology of last resort — it could defend any claim against any evidence, and it makes God the author of the very deception that birthed Christianity, which loops back into the makr problem above: on the substitution reading, Allah personally staged the event that misled billions, then waited six centuries to issue a one-line correction. The internal tensions (19:33, 3:55) required the tradition to invent a two-stage biography (rapture now, return and death later) found nowhere in the text. A revelation correcting history is conceivable; a revelation whose correction consists of an ambiguous clause generating a dozen mutually exclusive tafsir scenarios is indistinguishable from late legend.",
      ],
    },
    {
      title: "Salvation Without Atonement — and the Transferred Sins Hadith",
      critique: [
        "Islamic soteriology is a scale: “those whose scales are heavy — they are the successful; those whose scales are light — they have lost their souls” (Quran 23:102–103), with no atonement, no mediator (2:48), and the axiom “no bearer of burdens shall bear the burden of another” (53:38; 6:164). Yet Sahih Muslim 2767 reports: “When the Day of Resurrection comes, Allah will hand over to every Muslim a Jew or a Christian and say: this is your ransom (fikak) from the Fire” — sins lifted from Muslims and placed, in another version, upon Jews and Christians “like mountains.” The hadith collides with the Quran’s own no-transferred-burden axiom; and the system as a whole leaves the believer with no assurance: even Muhammad said, “By Allah, though I am the Apostle of Allah, I do not know what Allah will do to me” (Sahih al-Bukhari 5673; cf. Quran 46:9), and every person, believer or not, must come to Hell (“there is none of you but will come to it” — Quran 19:71).",
      ],
      response: [
        "Scholars harmonize Muslim 2767 as the unbelievers entering Hell for their own sins, “ransom” being a figure for Muslims’ vacated places; 19:71’s “coming to” Hell is the crossing of the sirat bridge over it, not entering; assurance is deliberately withheld to balance fear and hope (khawf and raja), which is spiritually healthy; and Allah’s mercy outweighs the scales for the sincere (39:53).",
      ],
      rebuttal: [
        "The critic replies that the ransom hadith’s own wording (sins placed upon them) resists the figure-of-speech reading and was felt as a problem by the commentators themselves; that a religion whose founder disclaims knowledge of his own fate (46:9) while guaranteeing paradise to those who die in jihad (9:111 — the one transaction with certainty) creates a soteriological incentive structure with documented historical consequences; and that the absence of any mechanism reconciling perfect justice with mercy — the scale simply ignores residual sin for whomever Allah wills — leaves the system asserting both attributes without an account of their coherence, where the Christian doctrine it rejects exists precisely to supply one. Internally, Islam answers Anselm’s question (how can the just God justify sinners?) with a shrug of voluntarism: He just does, for whom He wills (4:48).",
      ],
    },
    {
      title: "Women in the Quran and Sahih Hadith",
      critique: [
        "Quran 4:34 makes men qawwamun (in authority) over women and prescribes, for wives whose nushuz (rebellion) is feared: admonition, then abandonment in beds, then “strike them” (wadribuhunna). Quran 2:282 values a woman’s testimony at half a man’s “so that if one errs, the other can remind her”; 4:11 halves her inheritance; 2:223 calls wives “a tilth for you, so come to your tilth as you will”; 4:3 permits four wives plus slave concubines; 65:4 (above) regulates divorce of the pre-menstrual. The Prophet, in Bukhari 304, tells women they are “deficient in intelligence and religion” and constitute the majority of Hell’s inhabitants; Bukhari 5193 has angels cursing the wife who refuses the bed until morning.",
      ],
      response: [
        "Responses range from contextualization (the verses revolutionized seventh-century Arabia upward: inheritance where women had none, mahr paid to the bride, marriage as contract), to reinterpretation (daraba as “separate from” — a modern minority reading; the strike as symbolic miswak-twig per the jurists’ restrictions; testimony rules limited to financial documents reflecting commercial experience), to the complementarian frame: different roles, equal worth before Allah (33:35).",
      ],
      rebuttal: [
        "The critic grants the historical-uplift point for the seventh century and turns it: a time-indexed improvement frozen as eternal law becomes a ceiling, and the tradition treated these texts as a ceiling for fourteen centuries — classical fiqh of all schools codified the discipline hierarchy, the half-testimony, and marital availability as timeless divine law, because the book presents itself as timeless. The reinterpretations are post-hoc minority readings that classical Islam never knew (every classical tafsir reads daraba as strike). As with Aisha’s age, the internal problem is the exemplar-and-eternal-law claim: a merely human seventh-century reform document would be judged kindly by history; a final revelation for all times and places is fairly judged by all times and places.",
      ],
    },
    {
      title: "Eternal Hell, the Treatment of Unbelief, and Compulsion in Practice",
      critique: [
        "The Quran prescribes eternal torment, described with unusual physical specificity — skins roasted and replaced to renew the pain (4:56), boiling water, hooked iron rods (22:19–21) — for the sin of unbelief as such, including those who simply died in their ancestral religion. In law, the tradition added temporal penalties: the sahih corpus commands “whoever changes his religion, kill him” (Sahih al-Bukhari 6922), and all four Sunni schools codified the death penalty for apostasy — sitting uneasily beside “no compulsion in religion” (2:256). The dhimma system institutionalized subordination of Jews and Christians (9:29: fight them “until they pay the jizya… and feel themselves subdued”).",
      ],
      response: [
        "Responses: hell texts are deterrence rhetoric and Allah’s mercy prevails (some classical voices — Ibn Taymiyya’s student Ibn al-Qayyim entertained Hell’s eventual extinction); apostasy hadith targeted treasonous defection in a state at war, not private conscience (the modern reformist position, citing 2:256 and the Quran’s lack of any worldly apostasy penalty); jizya was a tax in lieu of military service, often lighter than zakat.",
      ],
      rebuttal: [
        "Critics respond that the reformist apostasy reading, whatever its merits, indicts the tradition it rescues: for thirteen centuries the consensus (ijma) of the schools — the same ijma Islam elsewhere treats as infallible (the hadith “my umma will not agree on error”) — held the opposite, so either the consensus mechanism fails or the reformists do. And the deterrence defense of 4:56’s regenerating skins concedes that the text’s author chose imagery of maximized, engineered, unending pain as the response to honest unbelief — an internal tension with “the Most Merciful of the merciful” that no amount of contextualizing dissolves, and which the minority annihilationist voices within Islam arose precisely to relieve.",
      ],
    },
  ],
});

// ============ PART VII ============
parts.push({
  title: "Part VII — Sharia and Morality: Law as the Mirror of Revelation",
  intro: [
    "Because Islam presents Muhammad as the timeless exemplar (Quran 33:21) and the Quran as eternal law, the practices of seventh-century Arabia did not remain history — they became jurisprudence. This part examines the institutions that classical fiqh built on those foundations: child marriage, the dhimma system, slavery and concubinage, sanctioned deception, temporary marriage, and political violence against critics. The internal-critique question throughout is not whether these were unusual for late antiquity (they were not), but whether a law claiming divine perfection for all times and places can contain them. Muslim responses, including the modern reform readings, are stated for each.",
  ],
  items: [
    {
      title: "Child Marriage: Quran 65:4 and the Juristic Consensus",
      critique: [
        "Quran 65:4 legislates the divorce waiting-period (idda) for three categories of wives: those past menstruation, “and those who have not yet menstruated” — wa-allati lam yahidna. An idda exists to ensure a divorced wife is not pregnant; it presupposes a consummated marriage. The verse therefore regulates the divorce of wives who have not yet reached puberty, and that is precisely how the classical tradition read it: al-Tabari, Ibn Kathir, and the tafsir tradition gloss the phrase as “the young girls who have not yet menstruated,” and the jurists of all four Sunni schools held — Ibn al-Mundhir reports consensus — that a father may contract his minor daughter in marriage without her consent, with the Aisha precedent (Part V) cited as the governing example. The rule was not theoretical: classical fiqh manuals discuss consummation timing in terms of physical capacity rather than age, and well into the modern era sharia-based objections have been raised in several countries against legislating any minimum marriage age, on the explicit ground that such a law would forbid what Allah permitted.",
      ],
      response: [
        "Modern Muslim responses take three lines. First, a re-reading: “those who have not menstruated” refers to adult women whose menses are delayed or absent (a view recorded as a minority opinion in al-Tabari and al-Qurtubi), so the verse says nothing about children. Second, a mitigation: classical law contracted minors but deferred consummation until physical maturity, and figures such as Ibn Shubruma (d. 761) and, on consent, Ibn Taymiyya held that a girl should not be married before puberty or without her agreement — so the tradition contained its own corrective. Third, the contextual defense: age-of-menarche marriage was the norm of virtually every premodern society, and the Quran’s framework (mahr, contract, maintenance) improved on it.",
      ],
      rebuttal: [
        "Critics answer each line. The delayed-menses reading was a recorded minority precisely because the plain sense and the majority reading was minors — a tradition that wished to exclude child marriage had fourteen centuries of ijma in which to say so, and said the opposite; Ibn Shubruma’s view was so marginal the schools preserved it as a curiosity. The consummation-deferral mitigation concedes the institution while softening its edge, and the criterion the jurists actually used (capacity, not age) is the problem, not the solution. The contextual defense once again proves too much: it is exactly the right defense of a human seventh-century document and exactly the wrong defense of a timeless one. The internal contradiction is sharpest at the legal level: modern Muslim states that set a minimum marriage age did so against the inherited fiqh, not from it — the reform energy came from outside the revelation that was supposed to be morally sufficient (Quran 5:3: “This day I have perfected for you your religion”).",
      ],
    },
    {
      title: "The Jizya and the Dhimma System",
      critique: [
        "Quran 9:29 commands fighting the People of the Book “until they give the jizya from a hand, while they are saghirun” — brought low, humbled, subdued. The classical exegetes read the final word institutionally: al-Mawardi, the Shafi‘i manuals (Umdat al-Salik lists the dhimmi’s disabilities), and the Hanafi Hidaya specify that the dhimmi pays in a posture of submission, and some tafsir describe deliberately demeaning collection rituals. The Pact of Umar — the template document of classical dhimma law — required distinctive dress, forbade new churches and synagogues, barred dhimmis from authority over Muslims, and obliged them to yield seats and the center of the road. Legal disabilities followed them into court: the testimony of a dhimmi against a Muslim was inadmissible in classical Hanafi law, and blood-money valuations differed by religion. The seventeenth-century scholar Ahmad Sirhindi stated the purpose with unusual candor: the jizya exists “to humiliate them to such an extent that they may not be able to dress well and to live in grandeur.” All of this sits beside Quran 2:256 — “there is no compulsion in religion” — as the institutional answer to what non-compulsion meant in practice: not equality, but regulated subordination.",
      ],
      response: [
        "Muslim responses emphasize that jizya was a tax in lieu of military service and zakat, often lighter than the levies on Muslims, with exemptions for women, children, the elderly, the poor, and monks; that Umar himself ordered treasury support for an aged dhimmi and condemned over-taxation; that the majority of exegetes read saghirun as “subject to the state’s law,” not ritually humiliated, with the degrading collection rituals being later accretions the texts do not require; and that dhimma, judged against the seventh through twelfth centuries, was more tolerant than Christendom’s treatment of Jews — Mark R. Cohen’s comparative work (Under Crescent and Cross) is often cited.",
      ],
      rebuttal: [
        "Critics accept the comparative point and decline its conclusion: “better than medieval Christendom” is a relative-historical defense, unavailable to a law claiming divine finality. The exemption-tax framing explains the levy but not the legal architecture around it — the dress codes, church-building bans, testimony disabilities, and street etiquette were not folk excess but black-letter fiqh across the schools for a millennium, enforced with varying rigor from al-Mutawakkil’s Baghdad onward. And the verse itself sets the goal: fight until payment in a state of being made small — the modern reading of saghirun as mere “law-abidingness” must explain why no classical authority read it so mildly. As with child marriage, the abolition of the dhimma (the Ottoman Tanzimat reforms, 1839–1856) arrived under European pressure, against juristic resistance — external correction of a supposedly perfect law.",
      ],
    },
    {
      title: "Slavery and Concubinage",
      critique: [
        "The Quran regulates slavery without ever prohibiting it. It permits sexual access to “those your right hands possess” (Quran 4:3; 4:24; 23:5–6; 33:50; 70:29–30) — the technical phrase for slave women — including, per the occasion of revelation in Sahih Muslim 1456, women captured in war whose husbands were still alive. Muhammad himself owned, received, and gave away slaves; Mariya the Copt, mother of his son Ibrahim, was a concubine gifted by the Byzantine governor of Egypt. Classical fiqh elaborated the institution in detail: the enslavement of war captives, the slave market, the rules of the umm walad, the discounted legal weight of slave testimony and slave life. No school of law treated abolition as a religious objective; the suppression of slavery in the Muslim world came in the nineteenth and twentieth centuries through Ottoman decrees and European treaties — Saudi Arabia abolished slavery in 1962, Mauritania in 1981 — over recorded juristic objection that prohibition forbids what Allah permitted. The point was demonstrated catastrophically in 2014, when the Islamic State revived sexual slavery for Yazidi captives and defended it with accurate citations of classical fiqh.",
      ],
      response: [
        "The Muslim response is a trajectory argument, developed most fully in Jonathan A.C. Brown’s Slavery and Islam (2019): the Quran channels an economy it could not abolish overnight toward humanization — manumission is a stated virtue (90:13) and a prescribed expiation for sins (4:92; 5:89; 58:3); mistreatment voids ownership in some schools; the umm walad cannot be sold and is freed at her owner’s death; and the religion’s deepest logic (all humans as God’s servants) points toward the institution’s extinction, which Muslim modernists treat as the revelation’s intended endpoint. Concubinage, on this view, regularized the status of captive women who would otherwise have been destitute, granting maintenance and legitimacy to their children.",
      ],
      rebuttal: [
        "Critics reply that the trajectory is read into the sources, not out of them: a lawgiver who could prohibit pork, wine, and riba in plain words could have prohibited owning and bedding human beings, and instead issued permanent regulations presupposing the practice’s continuation — the jurists who systematized those regulations for thirteen centuries were not misreading. The expiation mechanism makes manumission a currency for the owner’s sins, which is charity within the institution, not a verdict against it. The 2014 test case is the decisive internal datum: when ISIS cited the fiqh, mainstream refutations argued changed circumstances, treaty obligations, and maslaha — not that the texts forbid slavery, because they do not. A moral law that requires the abolitionist’s conclusion to be imported from outside itself has failed the exemplar claim at the point where the modern conscience tests it most directly.",
      ],
    },
    {
      title: "Sanctioned Deception and the Dissolution of Oaths",
      critique: [
        "Islam’s most authentic sources license deception in enumerated spheres. “War is deceit,” the Prophet said (Sahih al-Bukhari 3030). Sahih Muslim 2605 permits untruth in three contexts: war, reconciling disputants, and between spouses. When the assassins of Ka‘b ibn al-Ashraf (next issue) asked permission to lie to their target, the Prophet granted it (Bukhari 4037, with Ibn Ishaq’s detail: “Say what you like; you are absolved”). Quran 66:2 announces that “Allah has ordained for you the dissolution of your oaths,” releasing Muhammad from a sworn commitment; the Prophet taught as general principle, “If I take an oath and later find something better, I do what is better and expiate my oath” (Bukhari 6718); and Quran 3:28 with 16:106 permits concealment of faith under compulsion — the seed of the taqiyya doctrine elaborated chiefly in Shia law. Each item has its context; the critique concerns their sum. A tradition whose God is “the best of schemers” (Part VI), whose Prophet licenses lying in named categories and teaches a procedure for exiting oaths, and whose jurists codified when the imam may void treaties (building on Quran 9:1–3, the unilateral renunciation of existing treaties), has built discretionary deception into its moral foundations.",
      ],
      response: [
        "Muslim scholars respond that military deception is universal ethics — every law of war from Sun Tzu onward distinguishes ruse from perfidy, and the same hadith corpus categorically forbids treachery and treaty-breaking (Bukhari 3166 on killing a person under covenant; Muslim 1735: “every betrayer will have a banner on the Day of Resurrection”). The three permitted untruths are the white-lie category every ethical system tolerates (sparing a spouse, making peace). Oath expiation is a mercy mechanism preventing rash vows from compelling sin, with kaffara attached as cost. Taqiyya is a persecution concession (concealment to save life), predominantly Shia in elaboration, and its popular use as “Muslims are commanded to lie” is rejected by the academic literature on the “War is Deceit” hadith as an anti-Muslim trope.",
      ],
      rebuttal: [
        "Critics grant the parallels and press the disanalogy: secular laws of war do not claim their general is a timeless moral exemplar whose every licensed act becomes precedent; Islam does. The Ka‘b episode is therefore not a ruse between armies but the founder authorizing named individuals to lie a civilian critic to his death — and it sits in Bukhari, not in polemic. The internal-epistemological point follows: a revelation delivered by a man whose system permits category-licensed deception, reporting encounters no one else could verify, asks for a trust its own rules complicate. And the oath teaching had constitutional consequences inside Islam — jurists invoked it in statecraft on when the ruler’s commitments bind — so the critique is not that Muslims are individually untruthful (they are not), but that the system’s founding documents make truthfulness conditional at exactly the points where verification is impossible.",
      ],
    },
    {
      title: "Temporary Marriage (Mut‘ah): The Revocable Sexual Contract",
      critique: [
        "Both Sunni and Shia canons agree that the Prophet permitted mut‘ah — marriage contracted for a fixed term and a stated payment, dissolving automatically — during campaigns: Sahih al-Bukhari 5117–5119 and Sahih Muslim 1404–1406 record companions contracting temporary marriages, in one report for a cloak. Ibn Mas‘ud and Ibn Abbas read Quran 4:24 (istamta‘tum, “what you enjoy of them”) as the institution’s warrant, Ibn Abbas famously maintaining its permissibility into later decades. What happened next is the problem: the prohibition reports contradict each other on when (Khaybar; the conquest of Mecca; Awtas; later campaigns), al-Nawawi’s harmonization concedes the institution was permitted, banned, re-permitted, and banned again, and Umar’s sermon — “two mut‘ahs existed in the time of the Messenger of Allah and I forbid them both and punish for them” — attributes the operative ban to the caliph, which is precisely why Twelver Shia law holds mut‘ah lawful to this day and practices it. One revelation, two living canons, opposite rulings on whether a standing sexual institution is permission or prostitution.",
      ],
      response: [
        "Sunni scholarship answers that the final prohibition is prophetic and explicit — Ali’s report bans mut‘ah at Khaybar (Bukhari 5115) and Sabra al-Juhani’s has the Prophet forbidding it “until the Day of Resurrection” (Muslim 1406) — with Umar merely enforcing what some companions had not yet learned; staged legislation (as with wine) is divine pedagogy, not vacillation. Shia scholarship answers that the Quranic warrant stands, the prohibition reports conflict too badly to abrogate it, and Umar’s own words claim the prohibition as his (al-Islam.org collects the Sunni-source evidences). Both agree the original permission addressed the hardship of men long separated from their wives.",
      ],
      rebuttal: [
        "The critic observes that each side’s case is built from the other’s authenticated documents, which is the internal problem in its purest form: the tradition’s most rigorous sources cannot settle whether a standing sexual institution is lawful, and the split is not academic — mut‘ah is practiced today, and its documented modern abuses (contracts of hours’ duration around shrine cities; the related Sunni device of halala marriage) descend directly from the unresolved texts. Either the Prophet banned it (and Allah first revealed a license for term-limited sexual access, later withdrawn — the abrogation problem of Part II applied to sexual ethics), or Umar banned it (and a caliph’s decree overrode standing revelation, the precedent Shia polemic has pressed for centuries). The wine parallel fails: wine’s staged verses are in the Quran; mut‘ah’s prohibition is not in the Quran at all, only in mutually contradictory reports — a case study of the hadith dilemma of Part VIII operating on a question of basic morality.",
      ],
    },
    {
      title: "Assassinations of Critics and the Nakhla Precedent",
      critique: [
        "“Who will deal with Ka‘b ibn al-Ashraf? He has hurt Allah and His Messenger” (Sahih al-Bukhari 4037). Muhammad ibn Maslama volunteered, asked leave to deceive, received it, lured the poet out by night, and killed him. The night assassination of Abu Rafi‘, another critic, follows in Bukhari 4039–4040. The sira literature (Ibn Ishaq; Ibn Sa‘d) adds Asma bint Marwan, a mother of five killed in her bed for verses, and the centenarian Abu Afak — reports whose chains later scholars graded weak, but which the earliest biographers transmitted without embarrassment. To these the tradition adds the Nakhla raid (Rajab, 624): Muslim raiders attacked a Meccan caravan in the sacred month, killing a man; Muhammad initially disavowed the act — until Quran 2:217 was revealed declaring that while sacred-month fighting is grave, “fitna is worse than killing,” legitimating the raid and its spoils. Classical law drew the doctrinal consequence: Ibn Taymiyya’s al-Sarim al-Maslul built the death penalty for insulting the Prophet on precisely the poet-killing precedents, a juristic line that runs to the modern blasphemy codes and their extrajudicial enforcers.",
      ],
      response: [
        "Muslim responses distinguish the cases. Ka‘b, on the sources’ own telling, was not a private satirist: after Badr he traveled to Mecca to grieve the Quraysh dead and incite war against Medina, then plotted against Muhammad’s life — under the Constitution of Medina this was capital treason in wartime, and enemy propagandists have been treated as lawful targets in most laws of war. Asma bint Marwan and Abu Afak rest on chains containing al-Waqidi and other rejected narrators — al-Albani and earlier critics graded them unreliable, so the tradition’s own quality control discards them (IslamQA 177694). At Nakhla the raiders exceeded ambiguous orders; the Prophet’s anger was real, and 2:217 answered the legal question the community was already debating. The blasphemy-law extension is contested by modern scholars, who note the Prophet pardoned many abusers at the conquest of Mecca.",
      ],
      rebuttal: [
        "Critics respond that the strongest cases are the untouchable ones: Ka‘b and Abu Rafi‘ are in Bukhari, and whatever Ka‘b’s incitement, the method — sanctioned deception, a night killing without summons or process — became exemplar conduct, which is why Ibn Taymiyya could build law on it. The weak-grading of Asma bint Marwan illustrates the asymmetric filter documented in Part VIII: the same early biographers whose chains are decisive for the Quran’s compilation history and the battles’ chronology become “unreliable” at exactly the points of maximal embarrassment. Nakhla follows the convenient-revelation pattern of Part V — a violation disavowed until a verse arrived to bless it and release the spoils, with “fitna is worse than killing” supplying an elastic justification that later jurisprudence stretched over offensive jihad. The modern relevance is not hypothetical: the enforcers of blasphemy killings cite this precedent line, and the mainstream counter-argument must run through the conquest-of-Mecca pardons — that is, must argue the exemplar against the exemplar.",
      ],
    },
  ],
});

// ============ PART VIII ============
parts.push({
  title: "Part VIII — The Hadith Problem: Islam’s Epistemological Dilemma",
  intro: [
    "Beneath all the preceding parts lies a structural dilemma about Islam’s sources themselves. Islam cannot be practiced from the Quran alone, yet the hadith literature that supplies the missing content is, by the tradition’s own admission, a sea of fabrication filtered two centuries late. The critique here is not that any one hadith is weak; it is that the religion’s epistemology is internally unstable — too dependent on the hadith to drop them, too compromised by them to keep them.",
  ],
  items: [
    {
      title: "Islam Is Unworkable Without Hadith",
      critique: [
        "The Quran calls itself complete and fully detailed (6:114–115; 16:89: “a clarification of all things”), yet it does not contain the five daily prayers by name, number, or form, the details of zakat rates, the rituals of hajj, or the call to prayer; all of these — the spine of Islamic practice — come from hadith and inherited practice. The Quran commands obedience to the Messenger (4:80; 59:7), which traditionally grounds hadith authority. So a book claiming to clarify all things is, in practice, unusable for its own central rituals without a second corpus it never specifies, canonizes, or protects.",
      ],
      response: [
        "The traditional answer embraces this: the Sunna is the second revelation (“he does not speak from desire,” 53:3–4), divinely intended as the Quran’s living explanation (16:44: “We revealed to you the Reminder that you may make clear to people what was sent down to them”); mass-practiced rituals like prayer are mutawatir — transmitted by continuous community practice that needs no isnad. Quranists (Quran-alone Muslims) take the other horn and reconstruct prayer from the Quran’s fragments.",
      ],
      rebuttal: [
        "Critics note that 53:3–4 in context concerns the Quranic revelation itself, and that the “second revelation” has none of the protections claimed for the first — no promise of preservation, no early canon, no consensus text — as the next item documents. The existence of the Quranist movement, and the mainstream’s verdict that Quranists cannot even pray correctly, is the dilemma made flesh: Islam’s own factions agree the Quran alone is insufficient, and disagree on whether the supplement is trustworthy.",
      ],
    },
    {
      title: "The Hadith Corpus: Late, Sifted, and Self-Confessedly Polluted",
      critique: [
        "Al-Bukhari (d. 870) worked roughly 240 years after Muhammad’s death; by the tradition’s own account he examined some 600,000 circulating reports and retained around 7,400 (some 2,600 without repetition) — i.e., Islam’s premier collector judged over 98% of the material attributed to the Prophet in his day unusable or false. The science of hadith (mustalah) is an elaborate response to acknowledged mass forgery: reports were invented for sects, dynasties, cities, legal schools, and storytellers’ profits. Western scholarship from Ignaz Goldziher through Joseph Schacht (isnads “grow backwards” — legal opinions acquired prophetic pedigrees over time) and G.H.A. Juynboll formalized the suspicion; even conservative revisions (Motzki’s isnad-cum-matn analysis) date much material to the generation after the companions, not to the Prophet.",
      ],
      response: [
        "Muslim specialists respond that the isnad system is history’s most rigorous transmission audit — biographical dictionaries (rijal) tracked tens of thousands of narrators’ reliability; the 600,000 figure counts chains, not distinct texts, so the sifting was less catastrophic than it sounds; and Schacht’s skepticism has been substantially moderated by Motzki, Harald Motzki-school dating, and the documentary finds of early hadith papyri.",
      ],
      rebuttal: [
        "The critic grants the system’s sophistication and presses the structural point: an audit of memory chains conducted two centuries late can detect anachronistic narrators but cannot detect a plausible lie told early — and the tradition itself preserves the categories (the pious forger who invented hadith “for the love of the Prophet” was a recognized type). The preceding parts of this document rest almost entirely on reports the system graded sahih — the bewitchment, the aorta, the age of Aisha, the sheep, the burning of codices. The dilemma closes: if the grading is reliable, those embarrassments are history; if the grading is unreliable, Islam loses its prayer rituals, its law, its biography of the Prophet, and its exegesis. The tradition cannot have the Sunna without the scandals; they arrive in the same books, with the same seals.",
      ],
    },
    {
      title: "The Consensus Trap",
      critique: [
        "Sunni epistemology rests on a tripod: Quran, Sunna, and ijma (consensus), the last guaranteed by the hadith “my umma will never agree upon error” (Sunan al-Tirmidhi 2167 and parallels). But every modern reform position surveyed in this document — that 9:5 abrogates nothing, that apostates face no earthly penalty, that daraba does not mean strike, that child marriage was never intended, that the scientific-miracle readings are correct and the classical readings wrong — requires that the umma did agree upon error, for centuries, on questions of practice and law. Conversely, if classical consensus stands, the rulings of Parts V through VII stand with it as Islam’s authentic face.",
      ],
      response: [
        "Reformists answer that ijma properly binds only on transmitted essentials (prayer, fasting), not on derived rulings open to renewed ijtihad; the gates of interpretation were never truly closed, and fiqh has always evolved. Traditionalists simply accept the classical rulings and reject the reformers’ premise.",
      ],
      rebuttal: [
        "Which is the point, the critic concludes: the tradition contains no agreed mechanism for deciding which consensus binds — the meta-question is itself unresolved. A revelation for all mankind whose institutional safeguards (preserved text, audited Sunna, protected consensus) each dissolve under its own sources’ testimony has failed internally, by the standard of Quran 4:82, before any external critique is ever raised.",
      ],
    },
  ],
});

// ============ CONCLUSION ============
const conclusionParas = [
  "The arguments compiled here share a single method: they take Islam’s claims about itself — a perfectly preserved book, free of contradiction, from an all-knowing God, delivered through a morally exemplary prophet, explained by an authenticated Sunna and guarded by an unerring consensus — and test each claim against Islam’s own canonical sources. On the critics’ assessment, every pillar of that self-description is contradicted from within: the Quran affirms scriptures it also contradicts (Part I); it contains tensions its own falsification test forbids (Part II); its perfect preservation is denied by Bukhari, Muslim, the companion codices, and the Sanaa palimpsest (Part III); its picture of history and nature is the picture of seventh-century late antiquity (Part IV); its prophet’s career, as remembered by Islam’s most authentic books, repeatedly fails the tests the Quran itself announces (Part V); its theology asserts attributes it cannot reconcile (Part VI); its law canonizes seventh-century institutions — child marriage, the dhimma, slave concubinage, sanctioned deception — as timeless divine morality (Part VII); and its epistemology cannot keep its rituals without keeping its scandals (Part VIII).",
  "Muslim scholarship has responses at every point, and this document has tried to state them fairly; the reader should consult Muslim sources directly (al-Tabari, Ibn Kathir, al-Suyuti, IslamQA, Islamic Awareness, Yaqeen Institute) alongside the critical literature. The cumulative question the internal critique poses is not whether any single harmonization is possible — given enough distinctions, every text can be saved — but whether a book that requires this many rescues, of these kinds, at these load-bearing points, is plausibly the flawless speech of God by its own announced standard: “If it had been from other than Allah, they would have found within it much contradiction” (Quran 4:82).",
  "For the Christian reader, the Islamic Dilemma of Part I carries a further implication: the Quran itself testifies that the Torah and the Gospel in seventh-century hands were God’s revelation — and those texts, demonstrably unchanged since centuries before Muhammad, testify of Jesus: His deity, His crucifixion, His resurrection. By the Quran’s own witness to the scriptures it could not have known would survive to judge it, the reader is sent back to the Gospel the Quran commands Christians to judge by (Quran 5:47).",
];

const bibliography = [
  "The Quran — citations follow standard surah:verse numbering (Sahih International and Pickthall renderings consulted).",
  "Sahih al-Bukhari; Sahih Muslim; Sunan Abi Dawud; Sunan Ibn Majah; Sunan al-Tirmidhi — hadith numbering per sunnah.com (Fath al-Bari / standard editions).",
  "Ibn Ishaq, Sirat Rasul Allah (trans. A. Guillaume, The Life of Muhammad, Oxford, 1955).",
  "al-Tabari, Tarikh al-Rusul wa’l-Muluk and Jami al-Bayan (tafsir); Ibn Kathir, Tafsir al-Qur’an al-Azim; al-Suyuti, al-Itqan fi Ulum al-Qur’an; Ibn Abi Dawud, Kitab al-Masahif.",
  "Behnam Sadeghi and Mohsen Goudarzi, “Ṣan‘ā’ 1 and the Origins of the Qur’ān,” Der Islam 87 (2012).",
  "Arthur Jeffery, The Foreign Vocabulary of the Qur’an (1938); Materials for the History of the Text of the Qur’an (1937).",
  "Shahab Ahmed, Before Orthodoxy: The Satanic Verses in Early Islam (Harvard, 2017).",
  "Basim Musallam, Sex and Society in Islam (Cambridge, 1983).",
  "Gabriel Said Reynolds, The Qur’an and the Bible: Text and Commentary (Yale, 2018).",
  "Joseph Schacht, The Origins of Muhammadan Jurisprudence (1950); Ignaz Goldziher, Muslim Studies (1890); Harald Motzki, The Origins of Islamic Jurisprudence (2002).",
  "Patricia Crone and Michael Cook, Hagarism (1977); Patricia Crone, Meccan Trade and the Rise of Islam (1987); John Wansbrough, Quranic Studies (1977).",
  "David Wood, “The Islamic Dilemma” (Acts17Apologetics; islamicdilemma.net); Rudolph P. Boshoff, “The Islamic Dilemma: A Scholarly Breakdown” (Ad Lucem Ministries).",
  "Jonathan A.C. Brown, Slavery and Islam (Oneworld, 2019); Kecia Ali, Marriage and Slavery in Early Islam (Harvard, 2010).",
  "Mark R. Cohen, Under Crescent and Cross: The Jews in the Middle Ages (Princeton, 1994); Ibn Taymiyya, al-Sarim al-Maslul ala Shatim al-Rasul.",
  "WikiIslam: “Contradictions in the Quran”; “Scientific Errors in the Quran”; “Historical Errors in the Quran”; “Textual History of the Qur’an”; “Sana’a Manuscript.”",
  "Muslim responses consulted: Islamic Awareness (islamic-awareness.org); IslamQA (islamqa.info); Quran.com tafsir layers; SeekersGuidance; Yaqeen Institute; Quran Variants project (quranvariants.wordpress.com).",
];

const preface = [
  "This document compiles the major internal critiques of Islam — arguments that test Islam’s truth-claims using Islam’s own sources: the Quran, the sahih hadith collections, the sira (prophetic biography), the classical tafsir and legal tradition, and the physical manuscript record of the Quran itself. An internal critique does not ask whether Islam is unattractive or unfamiliar; it asks whether the system’s claims about itself are mutually consistent and consistent with the evidence the system itself accepts.",
  "Three editorial commitments govern what follows. First, sourcing: every factual claim is tied to a Quranic citation, a numbered hadith (per the standard sunnah.com numbering), a named classical authority, or published academic scholarship, so that each can be checked. Second, steel-manning: for every critique, the strongest common Muslim responses are stated before the counter-rebuttal, because an argument that survives only against weak opposition is worthless — for the writer and for the reader who will meet informed Muslim interlocutors. Third, register: the tone aims at the scholarly, not the contemptuous. The subject is a body of truth-claims held by nearly two billion people; the claims deserve serious examination precisely because the people deserve serious respect.",
  "A note on what this document is not. It is not a survey of Muslim behavior, cultures, or persons, and nothing in it warrants hostility toward Muslims — the Christian tradition from which the closing chapter speaks commands love of neighbor without exception. It is also not a complete inventory: whole literatures exist on each section, and the bibliography points onward. Finally, the academic field of Quranic studies is alive and contested; where a critique depends on disputed scholarship, the dispute is flagged.",
  "The document is organized so that each numbered issue is self-contained — critique, response, counter-rebuttal — and can be lifted out as an independent article.",
];

export { parts, conclusionParas, bibliography, preface };
