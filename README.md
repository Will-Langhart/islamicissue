# Examining Islam from Within

A scholarly compendium of internal critiques of Islam — every argument tested against
Islam's own sources (the Quran, the sahih hadith, the sira, classical tafsir, and the
manuscript record), with the strongest Muslim responses stated before each counter-rebuttal.

**Live site:** https://islamicissue.vercel.app

## Structure

The site spans **8 parts and 49 issues**:

1. The Islamic Dilemma — the Quran and the prior scriptures
2. Internal Contradictions within the Quran
3. The Preservation Problem — textual history of the Quran
4. Historical Anachronisms and Scientific Difficulties
5. The Prophetic Credentials of Muhammad
6. Theological and Ethical Tensions
7. Sharia and Morality — law as the mirror of revelation
8. The Hadith Problem — Islam's epistemological dilemma

Each issue follows a **critique → common Muslim responses → counter-rebuttal** format.

## Tech stack

- **Next.js** (App Router) — statically prerendered, one page per issue for SEO
- **Tailwind CSS v4** — semantic design tokens, light/dark themes (amber + charcoal)
- **docx** — the same content module generates a downloadable Word document
- Deployed on **Vercel**

## Single source of truth

`content/content.mjs` holds all the prose. Both the website (`lib/structure.mjs`)
and the Word document (`build-doc.mjs`) read from it, so edits stay in sync.

```bash
npm install
npm run dev        # local dev server
npm run build      # production build
npm run build-doc  # regenerate the Word document from content/content.mjs
```
