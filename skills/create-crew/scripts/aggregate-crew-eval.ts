#!/usr/bin/env bun
// Aggregate live LLM score.json files from a prep-crew-eval workdir.
//
//   bun scripts/aggregate-crew-eval.ts --workdir <evalRoot>
//
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
function flag(name: string): string | undefined {
  const i = args.indexOf(`--${name}`);
  if (i < 0) return undefined;
  const v = args[i + 1];
  return v && !v.startsWith("--") ? v : "true";
}

function die(msg: string): never {
  console.error(`error: ${msg}`);
  process.exit(1);
}

const workdir = flag("workdir");
if (!workdir) die("missing --workdir");
const root = path.resolve(workdir);
const unitsDir = path.join(root, "units");
if (!fs.existsSync(unitsDir)) die(`no units/ under ${root} — run prep-crew-eval.ts first`);

// Thresholds: quality floors (not "looks fine")
const MIN_PRECISION = parseFloat(flag("min-precision") || "0.4");
const MIN_RECALL = parseFloat(flag("min-recall") || "0.4");
const MIN_TRIGGER = parseFloat(flag("min-trigger-fit") || "0.4");

type Score = {
  session_file?: string;
  contaminated?: boolean;
  contamination_reason?: string | null;
  escalate_precision?: number;
  escalate_recall?: number;
  trigger_fit?: number;
  commentary?: string;
};

const rows: { unit: string; score: Score | null; error?: string }[] = [];

for (const name of fs.readdirSync(unitsDir)) {
  const unitPath = path.join(unitsDir, name);
  if (!fs.statSync(unitPath).isDirectory()) continue;
  // score may live in score-sandbox/score.json or unit/score.json
  const candidates = [
    path.join(unitPath, "score-sandbox", "score.json"),
    path.join(unitPath, "score.json"),
  ];
  const sp = candidates.find((p) => fs.existsSync(p));
  if (!sp) {
    rows.push({ unit: name, score: null, error: "missing score.json" });
    continue;
  }
  try {
    rows.push({ unit: name, score: JSON.parse(fs.readFileSync(sp, "utf8")) as Score });
  } catch (e) {
    rows.push({ unit: name, score: null, error: String(e) });
  }
}

const complete = rows.filter((r) => r.score);
const missing = rows.filter((r) => !r.score);
const clean = complete.filter((r) => !r.score!.contaminated);
const contaminated = complete.filter((r) => r.score!.contaminated);

function mean(xs: number[]): number {
  if (!xs.length) return NaN;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

const prec = mean(clean.map((r) => Number(r.score!.escalate_precision)).filter((x) => !Number.isNaN(x)));
const rec = mean(clean.map((r) => Number(r.score!.escalate_recall)).filter((x) => !Number.isNaN(x)));
const trig = mean(clean.map((r) => Number(r.score!.trigger_fit)).filter((x) => !Number.isNaN(x)));

const failures: string[] = [];
if (missing.length) failures.push(`${missing.length} unit(s) missing score.json (LLM score step not done)`);
if (!clean.length) failures.push("no clean (non-contaminated) scored units");
if (clean.length && !(prec >= MIN_PRECISION)) failures.push(`mean escalate_precision ${prec.toFixed(3)} < ${MIN_PRECISION}`);
if (clean.length && !(rec >= MIN_RECALL)) failures.push(`mean escalate_recall ${rec.toFixed(3)} < ${MIN_RECALL}`);
if (clean.length && !(trig >= MIN_TRIGGER)) failures.push(`mean trigger_fit ${trig.toFixed(3)} < ${MIN_TRIGGER}`);

const passed = failures.length === 0;

const report = {
  kind: "crew-llm-eval",
  workdir: root,
  passed,
  thresholds: { MIN_PRECISION, MIN_RECALL, MIN_TRIGGER },
  counts: {
    units: rows.length,
    scored: complete.length,
    clean: clean.length,
    contaminated: contaminated.length,
    missing: missing.length,
  },
  means: {
    escalate_precision: prec,
    escalate_recall: rec,
    trigger_fit: trig,
  },
  failures,
  units: rows.map((r) => ({
    unit: r.unit,
    error: r.error,
    contaminated: r.score?.contaminated,
    escalate_precision: r.score?.escalate_precision,
    escalate_recall: r.score?.escalate_recall,
    trigger_fit: r.score?.trigger_fit,
    commentary: r.score?.commentary,
  })),
};

fs.writeFileSync(path.join(root, "report.json"), JSON.stringify(report, null, 2) + "\n");

const md = [
  `# Crew LLM eval report`,
  ``,
  passed ? `**PASS**` : `**FAIL**`,
  ``,
  `| Metric | Value | Floor |`,
  `|---|---:|---:|`,
  `| escalate_precision (mean, clean) | ${Number.isNaN(prec) ? "—" : prec.toFixed(3)} | ${MIN_PRECISION} |`,
  `| escalate_recall (mean, clean) | ${Number.isNaN(rec) ? "—" : rec.toFixed(3)} | ${MIN_RECALL} |`,
  `| trigger_fit (mean, clean) | ${Number.isNaN(trig) ? "—" : trig.toFixed(3)} | ${MIN_TRIGGER} |`,
  `| clean units | ${clean.length} | ≥1 |`,
  `| contaminated | ${contaminated.length} | — |`,
  `| missing scores | ${missing.length} | 0 |`,
  ``,
  failures.length ? `## Failures\n\n${failures.map((f) => `- ${f}`).join("\n")}` : `## Failures\n\nNone.`,
  ``,
  `## Per unit`,
  ``,
  ...rows.map((r) => {
    if (!r.score) return `- **${r.unit}**: ERROR ${r.error}`;
    return `- **${r.unit}**: P=${r.score.escalate_precision} R=${r.score.escalate_recall} T=${r.score.trigger_fit}${r.score.contaminated ? " CONTAMINATED" : ""}`;
  }),
  ``,
  `Funnel and package-shape hygiene are not part of this report.`,
  ``,
];
fs.writeFileSync(path.join(root, "report.md"), md.join("\n"), "utf8");

console.log(md.join("\n"));
console.log(`\n→ ${path.join(root, "report.json")}`);
process.exit(passed ? 0 : 1);
