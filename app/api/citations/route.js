import { NextResponse } from "next/server";
import { getCitationReport } from "@/lib/server-data";

export async function GET(request) {
  const report = await getCitationReport();
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") || "summary";

  if (mode === "summary") {
    return NextResponse.json({
      generatedAt: report.generatedAt,
      summary: report.summary,
    });
  }

  if (mode === "top") {
    const type = searchParams.get("type") || "quran";
    if (type === "quran") return NextResponse.json({ items: report.topQuranReferences || [] });
    if (type === "hadith") return NextResponse.json({ items: report.topHadithCollections || [] });
    if (type === "scholar") return NextResponse.json({ items: report.topScholars || [] });
    return NextResponse.json(
      { error: "Unsupported type. Use quran, hadith, or scholar." },
      { status: 400 }
    );
  }

  if (mode === "warnings") {
    const status = searchParams.get("status");
    const warnings = report.validationWarnings || [];
    const items =
      status && status !== "all"
        ? warnings.filter((warning) => warning.reviewStatus === status)
        : warnings;
    return NextResponse.json({ items });
  }

  if (mode === "parts") {
    return NextResponse.json({ items: report.citationsByPart || [] });
  }

  if (mode === "review") {
    return NextResponse.json({
      generatedAt: report.generatedAt,
      reviewCoverage: report.summary?.reviewCoverage || {
        citation: { reviewed: 0, in_review: 0, unreviewed: 0 },
        proof: { reviewed: 0, in_review: 0, unreviewed: 0 },
      },
      items: report.validationWarnings || [],
    });
  }

  return NextResponse.json(
    { error: `Unsupported mode '${mode}'.` },
    { status: 400 }
  );
}
