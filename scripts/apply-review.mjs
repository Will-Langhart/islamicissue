// Applies editorial-pipeline decisions to content/review-status.json.
//   (no args)                     merge verifier/review-decisions.json (both dimensions)
//   <path.json>                   merge a specific decisions file (e.g. steelman)
//   --bless <issue> --reviewer N  promote ONE clean, verified issue to citation:reviewed
//   --bless-all --reviewer N      promote every clean, verified, currently-unreviewed issue
// Blessing requires a clean verification-log entry AND a named human. Only the
// citation/proof dimensions named in the decision are written; others are preserved.
import { readFileSync, writeFileSync, existsSync } from "fs";

const STATUS = "content/review-status.json";
const VERIFY_LOG = "verifier/verification-log.json";

const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const opt = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : undefined; };
const today = new Date().toISOString().slice(0, 10);

const status = JSON.parse(readFileSync(STATUS, "utf8"));
const save = () => writeFileSync(STATUS, JSON.stringify(status, null, 2) + "\n");

function merge() {
  const file = args.find((a) => a.endsWith(".json")) || "verifier/review-decisions.json";
  if (!existsSync(file)) { console.log(`No decisions file (${file}); nothing to merge.`); return; }
  const decisions = JSON.parse(readFileSync(file, "utf8"));
  let applied = 0, blocked = 0;
  for (const [key, dec] of Object.entries(decisions)) {
    for (const dim of ["citation", "proof"]) {
      const d = dec[dim];
      if (!d) continue;
      if (d.status === "reviewed" && !d.reviewer?.trim()) {
        console.warn(`Refusing 'reviewed' without reviewer: ${key}/${dim}`); blocked++; continue;
      }
      if (status[key]?.[dim]?.status === "reviewed" && d.status !== "reviewed") {
        console.warn(`Refusing to downgrade a human 'reviewed' → '${d.status}': ${key}/${dim}`);
        blocked++; continue;   // never silently clobber a sign-off
      }
      status[key] = { ...(status[key] || {}), [dim]: d };  // preserve the other dimension
      applied++;
    }
  }
  save();
  console.log(`Applied ${applied} review(s) from ${file}, ${blocked} blocked.`);
}

function bless() {
  const reviewer = opt("--reviewer")?.trim();
  if (!reviewer) { console.error("Refusing to bless without --reviewer <name>."); process.exit(1); }
  if (!existsSync(VERIFY_LOG)) {
    console.error(`No ${VERIFY_LOG}. Run the verifier first: python -m verifier.resume`);
    process.exit(1);
  }
  const log = JSON.parse(readFileSync(VERIFY_LOG, "utf8"));

  let targets;
  if (flag("--bless-all")) {
    targets = Object.keys(log).filter((k) => {
      const cur = status[k]?.citation?.status;
      return log[k].clean && cur !== "reviewed" && cur !== "in_review";
    });
  } else {
    const issue = opt("--bless");
    if (!issue) { console.error("Usage: --bless <issue> --reviewer <name>"); process.exit(1); }
    targets = [issue];
  }

  let blessed = 0, refused = 0;
  for (const key of targets) {
    const a = log[key];
    if (!a) { console.warn(`Refused ${key}: never verified.`); refused++; continue; }
    if (!a.clean) {
      console.warn(`Refused ${key}: ${a.blocking} blocking flag(s) — use the review loop, not bless.`);
      refused++; continue;
    }
    const adv = a.advisory ? `, ${a.advisory} advisory note(s)` : "";
    status[key] = {
      ...(status[key] || {}),
      citation: {
        status: "reviewed", reviewer, reviewedAt: today,
        notes: `Batch-approved after clean citation-verifier pass (${a.citations} citations, 0 blocking${adv}).`,
      },
    };
    blessed++;
  }
  save();
  console.log(`Blessed ${blessed} issue(s), refused ${refused}. Reviewer: ${reviewer}.`);
}

(flag("--bless") || flag("--bless-all")) ? bless() : merge();
