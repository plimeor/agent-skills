#!/usr/bin/env bun
// Prep entry for crew quality evals. Quality requires live LLM runs (see evals/EVALS.md).
//
//   bun scripts/run-evals.ts --crew-path ~/.agents/skills/crew --n 5
//   bun scripts/run-evals.ts --refresh-sample
//
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import os from "node:os";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = path.resolve(__dirname, "..");
const args = process.argv.slice(2);

if (args.includes("--refresh-sample")) {
  const tmp = path.join(os.tmpdir(), "create-crew-sample-refresh");
  const pipeline = path.join(__dirname, "pipeline.ts");
  const init = spawnSync(
    "bun",
    [pipeline, "init", "--workdir", tmp, "--label", "sample"],
    { encoding: "utf8", cwd: SKILL_ROOT },
  );
  const run = (init.stdout || "").trim().split("\n").filter(Boolean).pop();
  if (!run || init.status !== 0) {
    console.error(init.stdout, init.stderr);
    process.exit(1);
  }
  spawnSync("bun", [pipeline, "discover", "--run", run], { encoding: "utf8", cwd: SKILL_ROOT });
  const inv = JSON.parse(fs.readFileSync(path.join(run!, "inventory", "sessions.json"), "utf8"));
  const picked = inv.slice(0, 12).map((s: { source: string; id: string; project?: string }) => ({
    source: s.source,
    id: s.id,
    projectHint: s.project,
  }));
  const samplePath = path.join(SKILL_ROOT, "evals", "sessions", "sample.json");
  fs.writeFileSync(
    samplePath,
    JSON.stringify(
      {
        version: 1,
        description: "Pinned main-session sample for live crew evals.",
        maxNormalize: 12,
        refreshedAt: new Date().toISOString(),
        sessions: picked,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`refreshed ${samplePath} n=${picked.length}`);
  process.exit(0);
}

const r = spawnSync("bun", [path.join(__dirname, "prep-crew-eval.ts"), ...args], {
  encoding: "utf8",
  cwd: SKILL_ROOT,
  stdio: "inherit",
});
if (r.status !== 0) process.exit(r.status ?? 1);

console.log(`
Prep finished. This is not a quality pass.

Live LLM (Grok CLI; no Orca on primary path):
  bun scripts/run-crew-eval-llm.ts --workdir <prep-workdir> --phase predict --jobs 6
  bun scripts/run-crew-eval-llm.ts --workdir <prep-workdir> --phase score --jobs 6
  bun scripts/aggregate-crew-eval.ts --workdir <prep-workdir>

See evals/EVALS.md.
`);
