#!/usr/bin/env bun
// Prep a real-LLM crew eval workspace. Does not call an LLM. Exit 0 is not an eval pass.
//
// Discover path (re-scan local history):
//   bun scripts/prep-crew-eval.ts --crew-path ~/.agents/skills/crew --n 5
//   bun scripts/prep-crew-eval.ts --crew-path <crew> --sample evals/sessions/sample.json
//
// From an existing create-crew run (reuse user-turns; seeded sample):
//   bun scripts/prep-crew-eval.ts --crew-path ~/.agents/skills/crew \
//     --from-run <runDir> --fraction 0.5 --seed 42 --workdir <out>
//   bun scripts/prep-crew-eval.ts --crew-path <crew> --from-run <runDir> --n 20 --seed 1
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

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  const rnd = mulberry32(seed >>> 0);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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
  const blocks = t.split(/(?=^## \[\d+\])/m).filter((p) => p.trim());
  const turnBlocks = blocks.filter((b) => /^## \[\d+\]/.test(b.trim()));
  if (!turnBlocks.length) return null;
  const initialIdx = turnBlocks.findIndex((b) => /\(INITIAL\)/.test(b.split("\n")[0] || ""));
  const i = initialIdx >= 0 ? initialIdx : 0;
  return {
    initial: turnBlocks[i].trim(),
    rest: turnBlocks.filter((_, j) => j !== i).join("\n\n").trim(),
  };
}

type Row = { file: string; status?: string; id: string; source: string };

function pickCandidates(pool: Row[], opts: { n?: number; fraction?: number; seed: number }): Row[] {
  const shuffled = seededShuffle(pool, opts.seed);
  if (opts.fraction !== undefined) {
    if (!(opts.fraction > 0 && opts.fraction <= 1)) die("--fraction must be in (0, 1]");
    const k = Math.max(1, Math.floor(shuffled.length * opts.fraction));
    return shuffled.slice(0, k);
  }
  const n = opts.n ?? 5;
  return shuffled.slice(0, Math.min(n, shuffled.length));
}

function buildUnits(
  run: string,
  candidates: Row[],
  crewDir: string,
  workdir: string,
  predictPrompt: string,
  scorePrompt: string,
) {
  const unitsDir = path.join(workdir, "units");
  fs.mkdirSync(unitsDir, { recursive: true });
  const units: { id: string; dir: string; session_file: string }[] = [];

  for (const row of candidates) {
    const utPath = path.join(run, "user-turns", row.file);
    const split = splitUserTurns(utPath);
    if (!split?.initial) continue;

    const unitId = row.file.replace(/\.md$/, "");
    const unitDir = path.join(unitsDir, unitId);
    const predDir = path.join(unitDir, "predict-sandbox");
    const scoreDir = path.join(unitDir, "score-sandbox");
    fs.mkdirSync(predDir, { recursive: true });
    fs.mkdirSync(scoreDir, { recursive: true });

    fs.writeFileSync(path.join(predDir, "initial.md"), split.initial + "\n", "utf8");
    fs.writeFileSync(path.join(scoreDir, "initial.md"), split.initial + "\n", "utf8");
    fs.writeFileSync(
      path.join(scoreDir, "gold-user-turns.md"),
      (split.rest || "(no further user turns)") + "\n",
      "utf8",
    );

    copyDir(crewDir, path.join(predDir, "crew"));
    copyDir(crewDir, path.join(scoreDir, "crew"));

    fs.writeFileSync(
      path.join(predDir, "predict-prompt.md"),
      predictPrompt + `\n\n## Unit meta\n\nsession_file: ${row.file}\n`,
      "utf8",
    );
    fs.writeFileSync(
      path.join(scoreDir, "score-prompt.md"),
      scorePrompt +
        `\n\n## Unit meta\n\nsession_file: ${row.file}\nprediction path: ../predict-sandbox/prediction.json (copy into this sandbox as prediction.json before scoring)\n`,
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
  return units;
}

const nFlag = flag("n");
const fractionFlag = flag("fraction");
const seed = parseInt(flag("seed") || "42", 10);
const n = nFlag ? parseInt(nFlag, 10) : undefined;
const fraction = fractionFlag ? parseFloat(fractionFlag) : undefined;
if (nFlag && fractionFlag) die("pass only one of --n or --fraction");

const workdir = path.resolve(
  flag("workdir") || path.join(os.tmpdir(), "create-crew-llm-eval", `e-${Date.now()}`),
);
const fromRun = flag("from-run") ? path.resolve(flag("from-run")!) : undefined;
const samplePath = path.resolve(flag("sample") || path.join(EVALS, "sessions", "sample.json"));
const crewDir = resolveCrew();

const predictPrompt = fs.readFileSync(path.join(EVALS, "prompts", "predict.md"), "utf8");
const scorePrompt = fs.readFileSync(path.join(EVALS, "prompts", "score.md"), "utf8");

fs.mkdirSync(workdir, { recursive: true });

let run: string;
let candidates: Row[];
let mode: string;

if (fromRun) {
  // Reuse an existing create-crew run (user-turns + manifest). No rediscover.
  if (!fs.existsSync(path.join(fromRun, "inventory", "manifest.json"))) {
    die(`--from-run missing inventory/manifest.json: ${fromRun}`);
  }
  if (!fs.existsSync(path.join(fromRun, "user-turns"))) {
    die(`--from-run missing user-turns/: ${fromRun}`);
  }
  run = fromRun;
  const manifest = readJson<Row[]>(path.join(run, "inventory", "manifest.json"));
  const kept = manifest.filter((r) => r.status === "kept");
  const pool = kept.length ? kept : manifest;
  candidates = pickCandidates(pool, {
    n: fraction === undefined ? n ?? 5 : undefined,
    fraction,
    seed,
  });
  mode = "from-run";
} else {
  // Discover path
  const initOut = spawnSync(
    "bun",
    [PIPELINE, "init", "--workdir", workdir, "--label", "prep"],
    { encoding: "utf8", cwd: SKILL_ROOT },
  );
  const runLine = (initOut.stdout || "").trim().split("\n").filter(Boolean).pop();
  if (!runLine || initOut.status !== 0) die(`init failed: ${initOut.stdout} ${initOut.stderr}`);
  run = runLine;

  runPipeline(["discover"], run);

  const sample = fs.existsSync(samplePath)
    ? readJson<{ sessions: { source: string; id: string }[]; maxNormalize?: number }>(samplePath)
    : { sessions: [] as { source: string; id: string }[], maxNormalize: n ?? 5 };

  const invPath = path.join(run, "inventory", "sessions.json");
  const all = readJson<{ id: string; source: string; path?: string }[]>(invPath);
  let selected = all;
  if (sample.sessions.length) {
    const want = new Set(sample.sessions.map((s) => `${s.source}:${s.id}`));
    selected = all.filter((s) => want.has(`${s.source}:${s.id}`));
    if (!selected.length) {
      die("sample.json pins sessions not found by discover; run --refresh-sample from run-evals or update sample");
    }
    writeJson(invPath, selected);
  }

  const targetCount =
    fraction !== undefined
      ? Math.max(n ?? 0, sample.maxNormalize || 0, 50)
      : Math.max(n ?? 5, sample.maxNormalize || n || 5);
  runPipeline(["normalize", "--limit", String(targetCount)], run);
  runPipeline(["filter"], run);
  runPipeline(["user-turns"], run);

  const manifest = readJson<Row[]>(path.join(run, "inventory", "manifest.json"));
  const kept = manifest.filter((r) => r.status === "kept");
  const pool = kept.length ? kept : manifest;
  candidates = pickCandidates(pool, {
    n: fraction === undefined ? n ?? 5 : undefined,
    fraction,
    seed,
  });
  mode = "discover";
}

const units = buildUnits(run, candidates, crewDir, workdir, predictPrompt, scorePrompt);
if (!units.length) die("no units with user-turns produced; widen sample or lower filter");

const llmScript = path.join(SKILL_ROOT, "scripts", "run-crew-eval-llm.ts");
const aggScript = path.join(SKILL_ROOT, "scripts", "aggregate-crew-eval.ts");

writeJson(path.join(workdir, "manifest.json"), {
  createdAt: new Date().toISOString(),
  mode,
  seed,
  fraction: fraction ?? null,
  n: n ?? null,
  crewPath: crewDir,
  pipelineRun: run,
  unitCount: units.length,
  candidateCount: candidates.length,
  units,
  notes: [
    "Primary package eval is Spec blind predict/score. It does not invoke Orca or runtimes.md Select.",
    "runtimes.md is optional context and is not escalate/absorb gold.",
  ],
  next: [
    `bun ${llmScript} --workdir ${workdir} --phase predict --jobs 6`,
    `bun ${llmScript} --workdir ${workdir} --phase score --jobs 6`,
    `bun ${aggScript} --workdir ${workdir}`,
  ],
});

const checklist = [
  `# Crew LLM eval — ${workdir}`,
  ``,
  `Crew: \`${crewDir}\``,
  `Mode: ${mode} · units: ${units.length} · seed: ${seed}` +
    (fraction !== undefined ? ` · fraction: ${fraction}` : n !== undefined ? ` · n: ${n}` : ""),
  ``,
  `Primary path does **not** use Orca. Blind Spec judgment only.`,
  ``,
  `## Live LLM (Grok CLI batch)`,
  ``,
  `\`\`\`bash`,
  `bun ${llmScript} --workdir ${workdir} --phase predict --jobs 6`,
  `bun ${llmScript} --workdir ${workdir} --phase score --jobs 6`,
  `bun ${aggScript} --workdir ${workdir}`,
  `\`\`\``,
  ``,
  `Manual per-unit (optional):`,
  ``,
  ...units.slice(0, 3).flatMap((u, i) => [
    `### ${i + 1}. ${u.session_file}`,
    `1. Predictor: cwd \`${u.dir}/predict-sandbox\``,
    `2. Copy prediction.json → score-sandbox`,
    `3. Scorer: cwd \`${u.dir}/score-sandbox\``,
    ``,
  ]),
  units.length > 3 ? `… and ${units.length - 3} more units (see manifest.json)\n` : ``,
  `Prep is not a pass. Quality is only aggregate metrics after live predict+score.`,
  ``,
];
fs.writeFileSync(path.join(workdir, "AGENT_CHECKLIST.md"), checklist.join("\n"), "utf8");

console.log(workdir);
console.log(`units=${units.length} crew=${crewDir} mode=${mode}`);
console.log(`checklist=${path.join(workdir, "AGENT_CHECKLIST.md")}`);
