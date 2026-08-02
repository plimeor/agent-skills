#!/usr/bin/env bun
// Prep a real-LLM crew eval workspace. Does not call an LLM. Exit 0 is not an eval pass.
//
//   bun scripts/prep-crew-eval.ts --crew-path ~/.agents/skills/crew --n 5
//   bun scripts/prep-crew-eval.ts --crew-path <run>/skill --sample evals/sessions/sample.json
//
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = path.resolve(__dirname, "..");
const PIPELINE = path.join(SKILL_ROOT, "scripts", "pipeline.ts");
const EVALS = path.join(SKILL_ROOT, "evals");

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

function runPipeline(cmd: string[], run: string) {
  const r = spawnSync("bun", [PIPELINE, ...cmd, "--run", run], { encoding: "utf8", cwd: SKILL_ROOT });
  if (r.status !== 0) die(`pipeline ${cmd.join(" ")} failed:\n${r.stdout}\n${r.stderr}`);
  return r.stdout || "";
}

function readJson<T>(p: string): T {
  return JSON.parse(fs.readFileSync(p, "utf8")) as T;
}

function writeJson(p: string, v: unknown) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(v, null, 2) + "\n");
}

function copyDir(src: string, dst: string) {
  fs.mkdirSync(dst, { recursive: true });
  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    const a = path.join(src, ent.name);
    const b = path.join(dst, ent.name);
    if (ent.isDirectory()) copyDir(a, b);
    else fs.copyFileSync(a, b);
  }
}

function resolveCrew(): string {
  const home = os.homedir();
  const cwd = process.cwd();
  const candidates = [
    flag("crew-path"),
    process.env.CREW_SKILL_PATH,
    path.join(home, ".agents", "skills", "crew"),
    path.join(home, ".claude", "skills", "crew"),
    path.join(cwd, "skills", "crew"),
    path.join(cwd, ".agents", "skills", "crew"),
  ].filter(Boolean) as string[];

  for (const c of candidates) {
    const abs = path.resolve(c);
    const md = path.join(abs, "SKILL.md");
    if (!fs.existsSync(md)) continue;
    const name = /^name:\s*(\S+)/m.exec(fs.readFileSync(md, "utf8"))?.[1];
    if (name === "crew") return abs;
  }
  die(
    "no crew package found. Pass --crew-path <dir> with name: crew, or install crew under ~/.agents/skills/crew",
  );
}

function splitUserTurns(userTurnsPath: string): { initial: string; rest: string } | null {
  if (!fs.existsSync(userTurnsPath)) return null;
  const t = fs.readFileSync(userTurnsPath, "utf8");
  // Pipeline format: ## [n] (INITIAL) on the first user turn block
  const blocks = t.split(/(?=^## \[\d+\])/m).filter((p) => p.trim());
  const turnBlocks = blocks.filter((b) => /^## \[\d+\]/.test(b.trim()));
  if (!turnBlocks.length) return null;
  const initialIdx = turnBlocks.findIndex((b) => /\(INITIAL\)/.test(b.split("\n")[0] || ""));
  const i = initialIdx >= 0 ? initialIdx : 0;
  const initial = turnBlocks[i].trim();
  const rest = turnBlocks.filter((_, j) => j !== i).join("\n\n").trim();
  return { initial, rest };
}

const n = parseInt(flag("n") || "5", 10);
const workdir = path.resolve(flag("workdir") || path.join(os.tmpdir(), "create-crew-llm-eval", `e-${Date.now()}`));
const samplePath = path.resolve(flag("sample") || path.join(EVALS, "sessions", "sample.json"));
const crewDir = resolveCrew();

const predictPrompt = fs.readFileSync(path.join(EVALS, "prompts", "predict.md"), "utf8");
const scorePrompt = fs.readFileSync(path.join(EVALS, "prompts", "score.md"), "utf8");

fs.mkdirSync(workdir, { recursive: true });

// Pipeline run for sessions
const initOut = spawnSync(
  "bun",
  [PIPELINE, "init", "--workdir", workdir, "--label", "prep"],
  { encoding: "utf8", cwd: SKILL_ROOT },
);
const run = (initOut.stdout || "").trim().split("\n").filter(Boolean).pop();
if (!run || initOut.status !== 0) die(`init failed: ${initOut.stdout} ${initOut.stderr}`);

runPipeline(["discover"], run);

// Intersect with sample if present
const sample = fs.existsSync(samplePath)
  ? readJson<{ sessions: { source: string; id: string }[]; maxNormalize?: number }>(samplePath)
  : { sessions: [] as { source: string; id: string }[], maxNormalize: n };

const invPath = path.join(run, "inventory", "sessions.json");
const all = readJson<{ id: string; source: string; path?: string }[]>(invPath);
let selected = all;
if (sample.sessions.length) {
  const want = new Set(sample.sessions.map((s) => `${s.source}:${s.id}`));
  selected = all.filter((s) => want.has(`${s.source}:${s.id}`));
  if (!selected.length) die("sample.json pins sessions not found by discover; run --refresh-sample from run-evals or update sample");
  writeJson(invPath, selected);
}

runPipeline(["normalize", "--limit", String(Math.max(n, sample.maxNormalize || n))], run);
runPipeline(["filter"], run);
runPipeline(["user-turns"], run);

const manifest = readJson<{ file: string; status: string; id: string; source: string }[]>(
  path.join(run, "inventory", "manifest.json"),
);
const kept = manifest.filter((r) => r.status === "kept");
// Prefer kept; if too few, include dropped with user turns for eval diversity
const candidates = (kept.length >= n ? kept : manifest).slice(0, n);

const unitsDir = path.join(workdir, "units");
fs.mkdirSync(unitsDir, { recursive: true });

const units: { id: string; dir: string; session_file: string }[] = [];

for (const row of candidates) {
  const utPath = path.join(run, "user-turns", row.file);
  const split = splitUserTurns(utPath);
  if (!split || !split.initial) continue;

  const unitId = row.file.replace(/\.md$/, "");
  const unitDir = path.join(unitsDir, unitId);
  fs.mkdirSync(unitDir, { recursive: true });

  // Structural isolation layout for predictor
  const predDir = path.join(unitDir, "predict-sandbox");
  const scoreDir = path.join(unitDir, "score-sandbox");
  fs.mkdirSync(predDir, { recursive: true });
  fs.mkdirSync(scoreDir, { recursive: true });

  fs.writeFileSync(path.join(predDir, "initial.md"), split.initial + "\n", "utf8");
  fs.writeFileSync(path.join(scoreDir, "initial.md"), split.initial + "\n", "utf8");
  fs.writeFileSync(path.join(scoreDir, "gold-user-turns.md"), (split.rest || "(no further user turns)") + "\n", "utf8");

  copyDir(crewDir, path.join(predDir, "crew"));
  copyDir(crewDir, path.join(scoreDir, "crew"));

  fs.writeFileSync(
    path.join(predDir, "predict-prompt.md"),
    predictPrompt + `\n\n## Unit meta\n\nsession_file: ${row.file}\n`,
    "utf8",
  );
  fs.writeFileSync(
    path.join(scoreDir, "score-prompt.md"),
    scorePrompt + `\n\n## Unit meta\n\nsession_file: ${row.file}\nprediction path: ../predict-sandbox/prediction.json (copy into this sandbox as prediction.json before scoring)\n`,
    "utf8",
  );

  writeJson(path.join(unitDir, "meta.json"), {
    session_file: row.file,
    source: row.source,
    id: row.id,
    predict_sandbox: predDir,
    score_sandbox: scoreDir,
  });

  units.push({ id: unitId, dir: unitDir, session_file: row.file });
}

if (!units.length) die("no units with user-turns produced; widen sample or lower filter");

writeJson(path.join(workdir, "manifest.json"), {
  createdAt: new Date().toISOString(),
  crewPath: crewDir,
  pipelineRun: run,
  unitCount: units.length,
  units,
  next: [
    "For each unit: run a LIVE LLM predictor with cwd=predict-sandbox; allow only that dir; write prediction.json",
    "Copy prediction.json into score-sandbox; run a LIVE LLM scorer with cwd=score-sandbox; write score.json",
    "bun scripts/aggregate-crew-eval.ts --workdir " + workdir,
  ],
});

// Agent-facing checklist
const checklist = [
  `# Crew LLM eval — ${workdir}`,
  ``,
  `Crew: \`${crewDir}\``,
  `Units: ${units.length}`,
  ``,
  `## Steps (real LLM only)`,
  ``,
  ...units.flatMap((u, i) => [
    `### ${i + 1}. ${u.session_file}`,
    `1. Predictor: cwd \`${u.dir}/predict-sandbox\` — follow predict-prompt.md — write prediction.json`,
    `2. Copy prediction.json → \`${u.dir}/score-sandbox/prediction.json\``,
    `3. Scorer: cwd \`${u.dir}/score-sandbox\` — follow score-prompt.md — write score.json`,
    ``,
  ]),
  `## Aggregate`,
  ``,
  `\`\`\`bash`,
  `bun ${path.join(SKILL_ROOT, "scripts/aggregate-crew-eval.ts")} --workdir ${workdir}`,
  `\`\`\``,
  ``,
  `Prep is not a pass. Quality is only the aggregate metrics after live predict+score.`,
  ``,
];
fs.writeFileSync(path.join(workdir, "AGENT_CHECKLIST.md"), checklist.join("\n"), "utf8");

console.log(workdir);
console.log(`units=${units.length} crew=${crewDir}`);
console.log(`checklist=${path.join(workdir, "AGENT_CHECKLIST.md")}`);
