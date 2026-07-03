#!/usr/bin/env node

import { execSync } from "child_process";
import { readFileSync } from "fs";
import path from "path";
import { searchIndex } from "../lib/structure.mjs";

function readPublicJson(fileName) {
  const target = path.join(process.cwd(), "public", fileName);
  return JSON.parse(readFileSync(target, "utf8"));
}

function ensureArtifacts() {
  try {
    readPublicJson("graph-index.json");
    readPublicJson("citation-report.json");
  } catch {
    console.log("Artifacts missing. Regenerating graph and citation report...");
    execSync("node build-graph.mjs", { stdio: "inherit" });
  }
}

function runValidate() {
  const issues = searchIndex.filter((entry) => entry.label.startsWith("Part "));
  const missingText = issues.filter((entry) => !entry.text || entry.text.trim().length === 0);
  console.log(`Issues indexed: ${issues.length}`);
  if (missingText.length > 0) {
    console.log(`Missing body text entries: ${missingText.length}`);
    for (const item of missingText.slice(0, 10)) {
      console.log(` - ${item.href}`);
    }
    process.exitCode = 1;
    return;
  }
  console.log("Validation passed.");
}

function runContracts() {
  ensureArtifacts();
  const graph = readPublicJson("graph-index.json");
  const citation = readPublicJson("citation-report.json");
  const failures = [];

  if (!graph || typeof graph !== "object") failures.push("graph-index.json is missing or invalid.");
  if (!Array.isArray(graph.nodes)) failures.push("graph-index.json.nodes must be an array.");
  if (!Array.isArray(graph.edges)) failures.push("graph-index.json.edges must be an array.");
  if (!Array.isArray(graph.citationIndex)) failures.push("graph-index.json.citationIndex must be an array.");
  if (!Array.isArray(graph.conceptIndex)) failures.push("graph-index.json.conceptIndex must be an array.");

  if (!citation?.summary) failures.push("citation-report.json.summary is missing.");
  if (!Array.isArray(citation?.topQuranReferences)) failures.push("citation-report.json.topQuranReferences must be an array.");
  if (!Array.isArray(citation?.topHadithCollections)) failures.push("citation-report.json.topHadithCollections must be an array.");
  if (!Array.isArray(citation?.validationWarnings)) failures.push("citation-report.json.validationWarnings must be an array.");
  if (!citation?.summary?.reviewCoverage) failures.push("citation-report.json.summary.reviewCoverage is missing.");

  if (failures.length > 0) {
    console.log("API contract validation failed:");
    for (const failure of failures) console.log(`- ${failure}`);
    process.exitCode = 1;
    return;
  }

  console.log("API contracts validated against generated artifacts.");
}

function runIndex() {
  execSync("node build-graph.mjs", { stdio: "inherit" });
}

function runCite() {
  ensureArtifacts();
  const report = readPublicJson("citation-report.json");
  console.log("Citation Summary");
  console.log(`- Total: ${report.summary.totalCitations}`);
  console.log(`- Quran: ${report.summary.byType.quran}`);
  console.log(`- Hadith: ${report.summary.byType.hadith}`);
  console.log(`- Scholars: ${report.summary.byType.scholar}`);
  console.log(`- Warnings: ${report.summary.totalWarnings}`);
  if (report.summary.totalWarnings > 0) {
    console.log("\nWarnings:");
    for (const warning of report.validationWarnings.slice(0, 20)) {
      console.log(`- ${warning.issueTitle}: ${warning.reference} (${warning.reason})`);
    }
    process.exitCode = 1;
  }
}

function runSuggest(issueHref) {
  if (!issueHref) {
    console.log("Usage: npm run content:suggest -- --issue=/part-slug/issue-slug");
    process.exitCode = 1;
    return;
  }

  ensureArtifacts();
  const graph = readPublicJson("graph-index.json");
  const nodesById = new Map(graph.nodes || []);
  const selected = [...nodesById.entries()].find(([, node]) => node?.href === issueHref)?.[0];
  if (!selected) {
    console.log(`Issue not found for href: ${issueHref}`);
    process.exitCode = 1;
    return;
  }
  const related = (graph.edges || [])
    .filter((edge) => edge.type === "related" && (edge.source === selected || edge.target === selected))
    .sort((a, b) => (b.weight || 0) - (a.weight || 0))
    .slice(0, 10)
    .map((edge) => {
      const id = edge.source === selected ? edge.target : edge.source;
      const node = nodesById.get(id);
      return {
        title: node?.label || id,
        href: node?.href || "",
        strength: Math.round((edge.weight || 0) * 100),
      };
    });

  console.log(`Top suggestions for ${issueHref}`);
  for (const item of related) {
    console.log(`- ${item.title} (${item.strength}%): ${item.href}`);
  }
}

function runReleaseCheck() {
  runIndex();
  if (process.exitCode) return;
  runValidate();
  if (process.exitCode) return;
  runContracts();
  if (process.exitCode) return;
  runCite();
}

function parseArg(name) {
  const arg = process.argv.find((item) => item.startsWith(`${name}=`));
  return arg?.split("=").slice(1).join("=") || "";
}

const command = process.argv[2];

switch (command) {
  case "validate":
    runValidate();
    break;
  case "index":
    runIndex();
    break;
  case "contracts":
    runContracts();
    break;
  case "cite":
    runCite();
    break;
  case "suggest":
    runSuggest(parseArg("--issue"));
    break;
  case "release-check":
    runReleaseCheck();
    break;
  default:
    console.log("Usage:");
    console.log("  node scripts/content-pipeline.mjs validate");
    console.log("  node scripts/content-pipeline.mjs index");
    console.log("  node scripts/content-pipeline.mjs contracts");
    console.log("  node scripts/content-pipeline.mjs cite");
    console.log("  node scripts/content-pipeline.mjs suggest --issue=/part/issue");
    console.log("  node scripts/content-pipeline.mjs release-check");
    process.exitCode = 1;
}
