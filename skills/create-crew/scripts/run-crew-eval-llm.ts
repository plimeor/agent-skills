#!/usr/bin/env bun
// Live LLM predict/score for crew package eval units (Grok CLI executor).
// Does not use Orca. Primary path scores Spec judgment only.
//
//   bun scripts/run-crew-eval-llm.ts --workdir <prepDir> --phase predict --jobs 6
//   bun scripts/run-crew-eval-llm.ts --workdir <prepDir> --phase score --jobs 6
//
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { extractEvalPayload, type EvalPhase } from "./lib/grok-eval-parse.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
function flag(name: string): string | undefined {
  const i = args.indexOf(`--${name}`);
  if (i < 0) return undefined;
  const v = args[i + 1];
  return v && !v.startsWith("--") ? v : "true";
}

const workdir = path.resolve(flag("workdir") || "");
const phase = (flag("phase") || "predict") as EvalPhase;
const jobs = parseInt(flag("jobs") || "4", 10);
const only = flag("only");
const maxTurns = flag("max-turns") || "40";

if (!workdir || !fs.existsSync(path.join(workdir, "units"))) {
  console.error("usage: bun scripts/run-crew-eval-llm.ts --workdir <prepDir> --phase predict|score [--jobs 4]");
  process.exit(1);
}
if (phase !== "predict" && phase !== "score") {
  console.error("--phase must be predict or score");
  process.exit(1);
}

const predictSchema = {
  type: "object",
  additionalProperties: false,
  required: ["session_file", "roles_triggered", "escalate_points", "absorb_claims", "notes"],
  properties: {
    session_file: { type: "string" },
    roles_triggered: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "reason"],
        properties: { id: { type: "string" }, reason: { type: "string" } },
      },
    },
    escalate_points: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["summary", "axis"],
        properties: { summary: { type: "string" }, axis: { type: "string" } },
      },
    },
    absorb_claims: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["summary"],
        properties: { summary: { type: "string" } },
      },
    },
    notes: { type: "string" },
  },
};

const scoreSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "session_file",
    "contaminated",
    "contamination_reason",
    "gold_interventions",
    "escalate_precision",
    "escalate_recall",
    "trigger_fit",
    "false_escalates",
    "missed_escalates",
    "commentary",
  ],
  properties: {
    session_file: { type: "string" },
    contaminated: { type: "boolean" },
    contamination_reason: { type: ["string", "null"] },
    gold_interventions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["summary", "kind"],
        properties: { summary: { type: "string" }, kind: { type: "string" } },
      },
    },
    escalate_precision: { type: "number" },
    escalate_recall: { type: "number" },
    trigger_fit: { type: "number" },
    false_escalates: { type: "array", items: { type: "string" } },
    missed_escalates: { type: "array", items: { type: "string" } },
    commentary: { type: "string" },
  },
};

type Unit = { id: string; dir: string };

const unitDirs: Unit[] = fs
  .readdirSync(path.join(workdir, "units"))
  .filter((n) => fs.statSync(path.join(workdir, "units", n)).isDirectory())
  .filter((n) => !only || n.includes(only))
  .map((n) => ({ id: n, dir: path.join(workdir, "units", n) }));

function donePath(u: Unit): string {
  return phase === "predict"
    ? path.join(u.dir, "predict-sandbox", "prediction.json")
    : path.join(u.dir, "score-sandbox", "score.json");
}

const pending = unitDirs.filter((u) => !fs.existsSync(donePath(u)));
console.log(`phase=${phase} total=${unitDirs.length} pending=${pending.length} jobs=${jobs}`);
console.log(`executor=grok cwd-isolation notes=no-orca primary Spec judgment only`);
console.log(`skill-scripts=${__dirname}`);

function runGrok(cwd: string, promptFile: string, schema: object, outFile: string): Promise<number> {
  return new Promise((resolve) => {
    const schemaPath = path.join(cwd, "_schema.json");
    fs.writeFileSync(schemaPath, JSON.stringify(schema));
    const rawPath = path.join(cwd, `_grok-${phase}.raw`);
    const child = spawn(
      "grok",
      [
        "--prompt-file",
        promptFile,
        "--cwd",
        cwd,
        "--permission-mode",
        "bypassPermissions",
        "--json-schema",
        fs.readFileSync(schemaPath, "utf8"),
        "--disable-web-search",
        "--max-turns",
        maxTurns,
      ],
      { cwd, stdio: ["ignore", "pipe", "pipe"] },
    );
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => {
      stdout += d.toString();
    });
    child.stderr.on("data", (d) => {
      stderr += d.toString();
    });
    child.on("close", (code) => {
      fs.writeFileSync(rawPath, stdout + "\n---stderr---\n" + stderr);
      const obj = extractEvalPayload(stdout, phase);
      if (obj) {
        fs.writeFileSync(outFile, JSON.stringify(obj, null, 2) + "\n");
        resolve(0);
      } else {
        fs.writeFileSync(path.join(cwd, `_fail-${phase}.txt`), `exit=${code}\nno json parsed\n`);
        resolve(code ?? 1);
      }
    });
  });
}

async function processUnit(u: Unit): Promise<{ id: string; ok: boolean }> {
  if (phase === "predict") {
    const cwd = path.join(u.dir, "predict-sandbox");
    const wrap = path.join(cwd, "_exec-prompt.md");
    fs.writeFileSync(
      wrap,
      fs.readFileSync(path.join(cwd, "predict-prompt.md"), "utf8") +
        `\n\n## Execution\nRead only files in this directory (initial.md, crew/**, this prompt). Emit prediction via the JSON schema. Do not read gold-user-turns or paths outside this directory. Do not run Orca or field workers — Spec judgment only.\n`,
    );
    const code = await runGrok(cwd, wrap, predictSchema, path.join(cwd, "prediction.json"));
    return { id: u.id, ok: code === 0 && fs.existsSync(path.join(cwd, "prediction.json")) };
  }
  const pred = path.join(u.dir, "predict-sandbox", "prediction.json");
  const cwd = path.join(u.dir, "score-sandbox");
  if (!fs.existsSync(pred)) return { id: u.id, ok: false };
  fs.copyFileSync(pred, path.join(cwd, "prediction.json"));
  const wrap = path.join(cwd, "_exec-prompt.md");
  fs.writeFileSync(
    wrap,
    fs.readFileSync(path.join(cwd, "score-prompt.md"), "utf8") +
      `\n\n## Execution\nRead initial.md, gold-user-turns.md, prediction.json, crew/**. Emit score via JSON schema. escalate_precision, escalate_recall, trigger_fit in 0..1. Specs are the gold for escalate/absorb — not runtimes.md.\n`,
  );
  const code = await runGrok(cwd, wrap, scoreSchema, path.join(cwd, "score.json"));
  return { id: u.id, ok: code === 0 && fs.existsSync(path.join(cwd, "score.json")) };
}

async function pool<T, R>(items: T[], n: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx]);
      const r = out[idx] as { id?: string; ok?: boolean };
      console.log(`[${idx + 1}/${items.length}] ${r.id} ${r.ok ? "OK" : "FAIL"}`);
    }
  }
  await Promise.all(Array.from({ length: Math.min(n, Math.max(items.length, 1)) }, () => worker()));
  return out;
}

const results = pending.length ? await pool(pending, jobs, processUnit) : [];
const ok = results.filter((r) => r.ok).length;
const fail = results.length - ok;
const summary = {
  phase,
  totalUnits: unitDirs.length,
  pending: pending.length,
  processed: results.length,
  ok,
  fail,
  results,
};
console.log(JSON.stringify({ phase, processed: results.length, ok, fail }, null, 2));
fs.writeFileSync(path.join(workdir, `batch-${phase}-summary.json`), JSON.stringify(summary, null, 2) + "\n");
process.exit(fail ? 1 : 0);
