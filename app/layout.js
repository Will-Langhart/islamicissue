import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { Newsreader, Inter } from "next/font/google";
import Header from "@/components/Header";
import ProgressBar from "@/components/ProgressBar";
import SiteFooter from "@/components/SiteFooter";

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

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  "https://islamicissue.vercel.app"
).replace(/\/$/, "");

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Examining Islam from Within — An Internal Critique Compendium",
    template: "%s — Examining Islam from Within",
  },
  description:
    "A scholarly compendium of internal critiques of Islam: the Islamic Dilemma, Quranic contradictions, textual preservation, history and science, the prophetic credentials of Muhammad, and theology — each with Muslim responses and counter-rebuttals, fully sourced.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" className={`${newsreader.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-page text-ink antialiased">
        <ProgressBar />
        <Header />
        <main>{children}</main>
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
