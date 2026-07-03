import { readFile } from "fs/promises";
import path from "path";

let graphCache = null;
let citationCache = null;

async function readJsonFromPublic(fileName) {
  const filePath = path.join(process.cwd(), "public", fileName);
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

export async function getGraphIndex() {
  if (!graphCache) {
    graphCache = await readJsonFromPublic("graph-index.json");
  }
  return graphCache;
}

export async function getCitationReport() {
  if (!citationCache) {
    citationCache = await readJsonFromPublic("citation-report.json");
  }
  return citationCache;
}

