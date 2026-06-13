import "./globals.css";
import Link from "next/link";
import { Newsreader, Inter } from "next/font/google";
import Header from "@/components/Header";
import ProgressBar from "@/components/ProgressBar";

const newsreader = Newsreader({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-newsreader",
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: {
    default: "Examining Islam from Within — An Internal Critique Compendium",
    template: "%s — Examining Islam from Within",
  },
  description:
    "A scholarly compendium of internal critiques of Islam: the Islamic Dilemma, Quranic contradictions, textual preservation, history and science, the prophetic credentials of Muhammad, and theology — each with Muslim responses and counter-rebuttals, fully sourced.",
};

const themeInit = `
try {
  if (localStorage.getItem("theme") === "dark") {
    document.documentElement.classList.add("dark");
  }
} catch {}
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" className={`${newsreader.variable} ${inter.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-screen bg-page text-ink antialiased">
        <ProgressBar />
        <Header />
        <main>{children}</main>
        <footer className="mt-20 border-t border-line py-10">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 text-center text-sm text-muted sm:px-6">
            <p className="font-semibold text-heading">Examining Islam from Within</p>
            <p className="max-w-xl leading-relaxed">
              Every claim sourced to the Quran, the sahih hadith, classical tafsir, or published scholarship —
              with Muslim responses stated before counter-rebuttals.
            </p>
            <p className="font-ui">
              <a href="/Examining-Islam-from-Within.docx" className="text-accent hover:underline">
                Download the full compendium (Word)
              </a>
              <span className="mx-2 text-line">·</span>
              <Link href="/sources" className="text-accent hover:underline">
                Sources
              </Link>
            </p>
            <p className="font-ui text-xs">Compiled June 2026.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
