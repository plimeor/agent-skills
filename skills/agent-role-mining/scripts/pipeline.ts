#!/usr/bin/env bun
// role-mining deterministic pipeline CLI (Bun, zero third-party deps).
//
//   bun pipeline.ts init --workdir <dir> [--label <name>]
//   bun pipeline.ts discover   --run <runDir>
//   bun pipeline.ts normalize  --run <runDir> [--only claude|grok] [--limit N] [--skip-existing]
//   bun pipeline.ts filter     --run <runDir>
//   bun pipeline.ts user-turns --run <runDir> [--all]
//   bun pipeline.ts sample     --run <runDir> --n 15 [--seed 42] [--pool kept|census|all]
//   bun pipeline.ts stats      --run <runDir>
//
// Every command is idempotent and writes only inside the run directory.
// Source session stores are read-only. Every exclusion is logged with a reason.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  DEFAULT_LIMITS, type Limits, type SessionEntry, type TrajStats,
  ensureDir, readJson, writeJson, seededSample,
} from "./lib/common.ts";
import { discoverClaude, normalizeClaude } from "./lib/claude.ts";
import { discoverGrok, normalizeGrok } from "./lib/grok.ts";

interface Config {
  createdAt: string;
  sources: {
    claude: { enabled: boolean; root: string };
    grok: { enabled: boolean; root: string };
  };
  excludeProjectPatterns: string[];
  limits: Limits;
  filter: {
    minCleanedBytes: number;
    dropLowIntervention: boolean;
    midThemeWhitelist: string[];
  };
}

interface ManifestRow {
  file: string; // cleaned file name, e.g. claude_<id>.md
  source: string;
  id: string;
  project: string;
  title: string | null;
  intervention: string;
  userTurns: number;
  feedbackTurns: number;
  toolCalls: number;
  cleanedBytes: number;
  status: "kept" | "dropped" | "pending-theme";
  reason?: string;
  theme?: string;
}

const DEFAULT_CONFIG = (): Config => ({
  createdAt: new Date().toISOString(),
  sources: {
    claude: { enabled: true, root: path.join(os.homedir(), ".claude", "projects") },
    grok: { enabled: true, root: path.join(os.homedir(), ".grok", "sessions") },
  },
  excludeProjectPatterns: ["english-coach"],
  limits: { ...DEFAULT_LIMITS },
  filter: {
    minCleanedBytes: 20 * 1024,
    dropLowIntervention: true,
    midThemeWhitelist: ["review", "bugfix", "migration", "i18n-docs"],
  },
});

// ---------- arg parsing ----------
const [, , cmd, ...rest] = process.argv;
function flag(name: string): string | undefined {
  const i = rest.indexOf(`--${name}`);
  if (i < 0) return undefined;
  const v = rest[i + 1];
  return v && !v.startsWith("--") ? v : "true";
}
function requireRun(): string {
  const run = flag("run");
  if (!run) die("missing --run <runDir>");
  const abs = path.resolve(run!);
  if (!fs.existsSync(path.join(abs, "config.json"))) die(`no config.json in ${abs} — run init first`);
  return abs;
}
function die(msg: string): never {
  console.error(`error: ${msg}`);
  process.exit(1);
}
function loadConfig(run: string): Config {
  return readJson<Config>(path.join(run, "config.json"), null as unknown as Config);
}
const fileNameFor = (e: { source: string; id: string }) => `${e.source}_${e.id}.md`;

// ---------- commands ----------
function cmdInit() {
  // Default keeps run artifacts inside the project the user is working in,
  // under a namespaced folder that is easy to gitignore or clean up.
  const workdir = flag("workdir") || path.join(process.cwd(), ".artifacts", "agent-role-mining");
  const label = flag("label") || "run";
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 13).replace("T", "-");
  const run = path.join(path.resolve(workdir), "runs", `${stamp}-${label}`);
  ensureDir(run);
  for (const d of ["inventory", "cleaned", "user-turns", "census", "signals", "validation"])
    ensureDir(path.join(run, d));
  writeJson(path.join(run, "config.json"), DEFAULT_CONFIG());
  console.log(run);
}

function cmdDiscover() {
  const run = requireRun();
  const cfg = loadConfig(run);
  const all: SessionEntry[] = [];
  const excluded: { path: string; reason: string }[] = [];
  if (cfg.sources.claude.enabled) {
    const r = discoverClaude(cfg.sources.claude.root, cfg.excludeProjectPatterns);
    all.push(...r.sessions);
    excluded.push(...r.excluded);
  }
  if (cfg.sources.grok.enabled) {
    const r = discoverGrok(cfg.sources.grok.root, cfg.excludeProjectPatterns);
    all.push(...r.sessions);
    excluded.push(...r.excluded);
  }
  all.sort((a, b) => (a.source + a.id).localeCompare(b.source + b.id));
  writeJson(path.join(run, "inventory", "sessions.json"), all);
  writeJson(path.join(run, "inventory", "discover_excluded.json"), excluded);
  const bySource = { claude: 0, grok: 0 } as Record<string, number>;
  for (const s of all) bySource[s.source] = (bySource[s.source] || 0) + 1;
  console.log(`discovered ${all.length} main sessions (claude=${bySource.claude || 0}, grok=${bySource.grok || 0}); excluded ${excluded.length} (see inventory/discover_excluded.json)`);
}

function cmdNormalize() {
  const run = requireRun();
  const cfg = loadConfig(run);
  const only = flag("only");
  const limit = flag("limit") ? parseInt(flag("limit")!, 10) : Infinity;
  const skipExisting = flag("skip-existing") === "true";
  const sessions = readJson<SessionEntry[]>(path.join(run, "inventory", "sessions.json"), []);
  if (!sessions.length) die("no inventory/sessions.json — run discover first");

  const statsPath = path.join(run, "inventory", "session_stats.json");
  const statsMap = readJson<Record<string, TrajStats & { cleanedBytes: number; title: string | null }>>(statsPath, {});
  let done = 0, failed = 0, skipped = 0;

  for (const entry of sessions) {
    if (only && entry.source !== only) continue;
    if (done >= limit) break;
    const outFile = path.join(run, "cleaned", fileNameFor(entry));
    if (skipExisting && fs.existsSync(outFile) && statsMap[fileNameFor(entry)]) { skipped++; continue; }
    try {
      const result = entry.source === "claude"
        ? normalizeClaude(entry, cfg.limits)
        : normalizeGrok(entry, cfg.limits);
      fs.writeFileSync(outFile, result.markdown, "utf8");
      statsMap[fileNameFor(entry)] = {
        ...result.stats,
        cleanedBytes: fs.statSync(outFile).size,
        title: result.title,
      };
      done++;
      if (done % 25 === 0) console.log(`  …${done} normalized`);
    } catch (e) {
      failed++;
      console.error(`  FAIL ${entry.source} ${entry.id}: ${String(e).slice(0, 200)}`);
    }
  }
  writeJson(statsPath, statsMap);
  console.log(`normalized ${done}, skipped ${skipped}, failed ${failed} → cleaned/ + inventory/session_stats.json`);
}

function cmdFilter() {
  const run = requireRun();
  const cfg = loadConfig(run);
  const sessions = readJson<SessionEntry[]>(path.join(run, "inventory", "sessions.json"), []);
  const statsMap = readJson<Record<string, TrajStats & { cleanedBytes: number; title: string | null }>>(
    path.join(run, "inventory", "session_stats.json"), {});
  // themes.json: { "<cleaned file name>": "<theme>" } — written by the agent
  // after reading pending sessions (theme bucketing needs judgment, not code).
  const themes = readJson<Record<string, string>>(path.join(run, "inventory", "themes.json"), {});
  const whitelist = new Set(cfg.filter.midThemeWhitelist);

  const rows: ManifestRow[] = [];
  for (const entry of sessions) {
    const file = fileNameFor(entry);
    const st = statsMap[file];
    if (!st) continue; // not normalized (partial run)
    const row: ManifestRow = {
      file, source: entry.source, id: entry.id, project: entry.project,
      title: st.title ?? entry.title ?? null,
      intervention: st.intervention, userTurns: st.userTurns,
      feedbackTurns: st.feedbackTurns, toolCalls: st.toolCalls,
      cleanedBytes: st.cleanedBytes, status: "kept",
    };
    if (st.userTurns === 0 && st.assistantTurns === 0) {
      row.status = "dropped"; row.reason = "empty";
    } else if (cfg.filter.dropLowIntervention && st.intervention === "低") {
      row.status = "dropped"; row.reason = "low-intervention";
    } else if (st.intervention === "中") {
      const theme = themes[file];
      if (!theme) { row.status = "pending-theme"; }
      else {
        row.theme = theme;
        if (!whitelist.has(theme)) { row.status = "dropped"; row.reason = `mid-theme:${theme}`; }
      }
    }
    if (row.status === "kept" && st.cleanedBytes < cfg.filter.minCleanedBytes) {
      row.status = "dropped";
      row.reason = `thin<${Math.round(cfg.filter.minCleanedBytes / 1024)}KB`;
    }
    rows.push(row);
  }

  writeJson(path.join(run, "inventory", "manifest.json"), rows);

  const kept = rows.filter((r) => r.status === "kept");
  const pending = rows.filter((r) => r.status === "pending-theme");
  const census = rows.filter((r) => r.reason === "low-intervention");

  // manifest.md — human-readable funnel result
  const md: string[] = ["# Stage 1 Manifest", ""];
  const drops = new Map<string, number>();
  for (const r of rows) if (r.status === "dropped") drops.set(r.reason!, (drops.get(r.reason!) || 0) + 1);
  md.push(`| 项 | 数量 |`, `|----|-----:|`, `| 发现（主会话，已规范化） | ${rows.length} |`, `| 保留（分析集） | ${kept.length} |`, `| 待定主题（需 themes.json） | ${pending.length} |`);
  for (const [reason, n] of [...drops.entries()].sort()) md.push(`| 丢弃：${reason} | ${n} |`);
  md.push("", "## 保留清单", "", `| File | Interv | U | KB | Title |`, `|------|--------|--:|---:|-------|`);
  for (const r of kept)
    md.push(`| \`${r.file}\` | ${r.intervention} | ${r.userTurns} | ${Math.round(r.cleanedBytes / 1024)} | ${(r.title || "").slice(0, 60)} |`);
  fs.writeFileSync(path.join(run, "manifest.md"), md.join("\n") + "\n");

  // pending-themes.md — worklist for the agent's theme bucketing pass
  if (pending.length) {
    const p: string[] = [
      "# 待分桶的中干预会话", "",
      "读每个 cleaned 文件的用户意图，在 `inventory/themes.json` 中写入 `{\"<file>\": \"<theme>\"}`。",
      `白名单主题（保留）：${cfg.filter.midThemeWhitelist.join(", ")}；其它主题会被丢弃（丢弃也要给真实主题名，保证审计可读）。`, "",
    ];
    for (const r of pending) p.push(`- [ ] \`${r.file}\` U=${r.userTurns} ${(r.title || "").slice(0, 80)}`);
    fs.writeFileSync(path.join(run, "inventory", "pending-themes.md"), p.join("\n") + "\n");
  }

  // census list — excluded low-intervention sessions are the positive evidence
  // for what is already safely delegable; stage 1.5 annotates them.
  writeJson(path.join(run, "census", "census-list.json"), census.map((r) => ({
    file: r.file, source: r.source, id: r.id, project: r.project,
    title: r.title, userTurns: r.userTurns, toolCalls: r.toolCalls,
  })));

  console.log(`kept ${kept.length}, pending-theme ${pending.length}, dropped ${rows.length - kept.length - pending.length} → manifest.md`);
  if (pending.length) console.log(`ACTION: bucket ${pending.length} mid-intervention sessions (inventory/pending-themes.md), then re-run filter`);
}

function extractUserTurns(cleanedFile: string): { n: number; text: string }[] {
  const text = fs.readFileSync(cleanedFile, "utf8");
  const turns: { n: number; text: string }[] = [];
  const re = /^## \[(\d+)\] (user|user-feedback)\n\n([\s\S]*?)(?=^## \[|\n> \*\*Note\*\*|$(?![\s\S]))/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) turns.push({ n: parseInt(m[1], 10), text: m[3].trim() });
  return turns;
}

function cmdUserTurns() {
  const run = requireRun();
  const all = flag("all") === "true";
  const rows = readJson<ManifestRow[]>(path.join(run, "inventory", "manifest.json"), []);
  if (!rows.length) die("no manifest.json — run filter first");
  const targets = all ? rows : rows.filter((r) => r.status === "kept");
  let n = 0;
  for (const r of targets) {
    const src = path.join(run, "cleaned", r.file);
    if (!fs.existsSync(src)) continue;
    const turns = extractUserTurns(src);
    const out: string[] = [`# User turns: ${r.file}`, "", `- turns: ${turns.length}`, ""];
    turns.forEach((t, i) => {
      out.push(`## [${t.n}]${i === 0 ? " (INITIAL)" : ""}`, "", t.text, "");
    });
    fs.writeFileSync(path.join(run, "user-turns", r.file), out.join("\n"));
    n++;
  }
  console.log(`extracted user turns for ${n} sessions → user-turns/`);
}

function cmdSample() {
  const run = requireRun();
  const n = parseInt(flag("n") || "15", 10);
  const seed = parseInt(flag("seed") || "42", 10);
  const pool = flag("pool") || "kept";
  const rows = readJson<ManifestRow[]>(path.join(run, "inventory", "manifest.json"), []);
  if (!rows.length) die("no manifest.json — run filter first");
  const candidates =
    pool === "all" ? rows :
    pool === "census" ? rows.filter((r) => r.reason === "low-intervention") :
    rows.filter((r) => r.status === "kept");
  const picked = seededSample(candidates.map((r) => r.file).sort(), n, seed);
  writeJson(path.join(run, "inventory", `sample_${pool}_${seed}_${n}.json`), picked);
  for (const f of picked) console.log(f);
}

function cmdStats() {
  const run = requireRun();
  const rows = readJson<ManifestRow[]>(path.join(run, "inventory", "manifest.json"), []);
  if (!rows.length) die("no manifest.json — run filter first");
  const count = (fn: (r: ManifestRow) => boolean) => rows.filter(fn).length;
  const stats = {
    total: rows.length,
    kept: count((r) => r.status === "kept"),
    pendingTheme: count((r) => r.status === "pending-theme"),
    dropped: count((r) => r.status === "dropped"),
    bySource: {
      claude: { total: count((r) => r.source === "claude"), kept: count((r) => r.source === "claude" && r.status === "kept") },
      grok: { total: count((r) => r.source === "grok"), kept: count((r) => r.source === "grok" && r.status === "kept") },
    },
    byIntervention: {
      高: count((r) => r.intervention === "高"),
      中: count((r) => r.intervention === "中"),
      低: count((r) => r.intervention === "低"),
    },
    dropReasons: {} as Record<string, number>,
    signalsWritten: fs.existsSync(path.join(run, "signals"))
      ? fs.readdirSync(path.join(run, "signals")).filter((f) => f.endsWith(".md")).length
      : 0,
  };
  for (const r of rows) if (r.status === "dropped") stats.dropReasons[r.reason!] = (stats.dropReasons[r.reason!] || 0) + 1;
  writeJson(path.join(run, "inventory", "stats.json"), stats);
  console.log(JSON.stringify(stats, null, 2));
}

switch (cmd) {
  case "init": cmdInit(); break;
  case "discover": cmdDiscover(); break;
  case "normalize": cmdNormalize(); break;
  case "filter": cmdFilter(); break;
  case "user-turns": cmdUserTurns(); break;
  case "sample": cmdSample(); break;
  case "stats": cmdStats(); break;
  default:
    die(`unknown command "${cmd || ""}" — expected init|discover|normalize|filter|user-turns|sample|stats`);
}
