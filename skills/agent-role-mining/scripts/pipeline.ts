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
//   bun pipeline.ts lint-roles --run <runDir>
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
    // Corpus self-reference filtering: keep sessions where the user was designing or
    // evaluating this pipeline itself out of the analysis set. Without it the pipeline
    // rediscovers its own framework inside its own output — part of the clustered roles
    // then comes from the user's existing thinking about roles, not from observed behavior.
    selfReference: {
      enabled: boolean;
      markers: string[];       // case-insensitive; scored by distinct marker types hit
      minDistinctHits: number; // distinct markers required to judge a session self-referential
    };
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
  selfRefHits?: string[]; // markers hit (recorded at >=1; dropping depends on the threshold)
}

const DEFAULT_CONFIG = (): Config => ({
  createdAt: new Date().toISOString(),
  sources: {
    claude: { enabled: true, root: path.join(os.homedir(), ".claude", "projects") },
    grok: { enabled: true, root: path.join(os.homedir(), ".grok", "sessions") },
  },
  excludeProjectPatterns: ["english-coach", "agent-role-mining", "role-mining-workspace"],
  limits: { ...DEFAULT_LIMITS },
  filter: {
    minCleanedBytes: 20 * 1024,
    dropLowIntervention: true,
    midThemeWhitelist: ["review", "bugfix", "migration", "i18n-docs"],
    selfReference: {
      enabled: true,
      markers: [
        "agent-role-mining", "role-mining", "roles.md", "signals-manifest.md",
        "决策人格", "角色挖掘",
      ],
      minDistinctHits: 2,
    },
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

  // Self-reference detection lives in filter, not normalize, for two reasons:
  //   1. an existing run gains the filter without re-running the cleaning pass;
  //   2. markers are part of config, so changing them should only require re-running filter.
  // Hits are cached into session_stats.json so re-runs do not recompute.
  const sr = cfg.filter.selfReference ?? { enabled: false, markers: [], minDistinctHits: 2 };
  const srHits = (file: string): string[] => {
    const cached = (statsMap[file] as any)?.selfRefHits;
    if (Array.isArray(cached)) return cached;
    const p = path.join(run, "cleaned", file);
    if (!fs.existsSync(p)) return [];
    const text = fs.readFileSync(p, "utf8").toLowerCase();
    const hits = sr.markers.filter((m) => text.includes(m.toLowerCase()));
    if (statsMap[file]) (statsMap[file] as any).selfRefHits = hits;
    return hits;
  };

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
    const hits = sr.enabled ? srHits(file) : [];
    row.selfRefHits = hits.length ? hits : undefined;

    if (st.userTurns === 0 && st.assistantTurns === 0) {
      row.status = "dropped"; row.reason = "empty";
    } else if (sr.enabled && hits.length >= sr.minDistinctHits) {
      // Self-reference outranks other drop reasons: the problem is not "too little value",
      // it is "this material feeds the previous conclusion back into the next round"
      row.status = "dropped"; row.reason = `self-referential:${hits.length}`;
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
  writeJson(path.join(run, "inventory", "session_stats.json"), statsMap); // persist the selfRefHits cache

  // Self-reference audit: list every session with >=1 hit, including those kept because they
  // stayed below threshold — below-threshold is not "clean", it is "not enough evidence to
  // drop", and it has to stay visible.
  if (sr.enabled) {
    const flagged = rows.filter((r) => r.selfRefHits?.length).sort(
      (a, b) => (b.selfRefHits!.length - a.selfRefHits!.length) || a.file.localeCompare(b.file));
    const lines = [
      "# Corpus Self-Reference Audit", "",
      "When this pipeline's own artifact names and concepts appear in the corpus, that session is",
      "**the user designing or evaluating this pipeline itself**. Extracting signals from such a",
      "session feeds the previous round's conclusions back into this one — part of the clustered",
      "roles then comes from the user's existing thinking about roles rather than from behavior.", "",
      `**Threshold**: >= ${sr.minDistinctHits} distinct markers hit is dropped (reason=\`self-referential\`).`,
      `**Markers**: ${sr.markers.join(", ")}`, "",
      `| Session | Hits | Markers hit | Status |`, `|---------|-----:|-------------|--------|`,
    ];
    for (const r of flagged) {
      lines.push(`| \`${r.file}\` | ${r.selfRefHits!.length} | ${r.selfRefHits!.join(", ")} | ${r.status === "dropped" && r.reason?.startsWith("self-referential") ? "**dropped**" : `kept (${r.status})`} |`);
    }
    if (!flagged.length) lines.push("| — no hits — | | | |");
    lines.push("", `${flagged.length} sessions hit >=1 marker; ${rows.filter((r) => r.reason?.startsWith("self-referential")).length} were dropped as self-referential.`,
      "", "**Sessions that hit but stayed below threshold are still in the analysis set** — if Stage 3's conclusions",
      "visibly restate a framework already present in the corpus, come back to this table first.");
    fs.writeFileSync(path.join(run, "inventory", "self-referential.md"), lines.join("\n") + "\n", "utf8");
  }

  const kept = rows.filter((r) => r.status === "kept");
  const pending = rows.filter((r) => r.status === "pending-theme");
  const census = rows.filter((r) => r.reason === "low-intervention");

  // manifest.md — human-readable funnel result
  const md: string[] = ["# Stage 1 Manifest", ""];
  const drops = new Map<string, number>();
  for (const r of rows) if (r.status === "dropped") drops.set(r.reason!, (drops.get(r.reason!) || 0) + 1);
  md.push(`| Item | Count |`, `|------|------:|`, `| Discovered (main sessions, normalized) | ${rows.length} |`, `| Kept (analysis set) | ${kept.length} |`, `| Pending theme (needs themes.json) | ${pending.length} |`);
  for (const [reason, n] of [...drops.entries()].sort()) md.push(`| Dropped: ${reason} | ${n} |`);
  md.push("", "## Kept sessions", "", `| File | Interv | U | KB | Title |`, `|------|--------|--:|---:|-------|`);
  for (const r of kept)
    md.push(`| \`${r.file}\` | ${r.intervention} | ${r.userTurns} | ${Math.round(r.cleanedBytes / 1024)} | ${(r.title || "").slice(0, 60)} |`);
  fs.writeFileSync(path.join(run, "manifest.md"), md.join("\n") + "\n");

  // pending-themes.md — worklist for the agent's theme bucketing pass
  if (pending.length) {
    const p: string[] = [
      "# Mid-intervention sessions awaiting theme bucketing", "",
      "Read each cleaned file for user intent, then write `{\"<file>\": \"<theme>\"}` into `inventory/themes.json`.",
      `Whitelisted themes (kept): ${cfg.filter.midThemeWhitelist.join(", ")}. Other themes are dropped — give dropped sessions their real theme name too, so the audit stays readable.`, "",
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

// ---------- lint-roles ----------
// Mechanical hygiene check for the Stage 3/4 deliverables. The rules themselves live in
// references/stage3-roles.md; this only turns a violation into a non-zero exit code instead
// of relying on the executor to remember. Patterns match Chinese artifact prose by design.
interface Violation { file: string; line: number; rule: string; text: string }

const PATCH_STYLE: Array<[string, RegExp]> = [
  ["strikethrough", /~~[^~]+~~/],
  ["was-now", /原[^\n，。]{0,12}(现(改|更名)为|改为)/],
  ["formerly-named", /原名[^\n]{0,20}/],
  ["original-document", /原(文档|版本|稿)(缺失|没有|未|里)/],
  ["removed", /已(删除|移除|去掉|废弃)/],
  ["revised-accordingly", /(据此|已据此|因此)(修订|修改|更新)/],
  ["this-revision", /(本次|上一版|上一轮|旧版)(修订|改动|版本)/],
  ["added-note", /（[^）\n]{0,10}(新增|补充|后加|回放新增)[^）\n]{0,10}）/],
  ["changelog", /(变更记录|修订记录|变更日志|changelog|revision history)/i],
  // Same forms in English, for artifacts written in an English-language corpus
  ["was-now-en", /\b(formerly|previously|originally)\b[^\n.]{0,30}\b(now|renamed to|changed to)\b/i],
  ["removed-en", /\b(has been|now)\s+(removed|deleted|deprecated)\b/i],
  ["revised-en", /\b(revised|updated|amended)\s+accordingly\b/i],
  ["added-note-en", /\((added|amended|new)\s+(after|in)\s+[^)\n]{0,20}\)/i],
];

function lintFile(file: string, body: string, checks: string[]): Violation[] {
  const out: Violation[] = [];
  const lines = body.split("\n");
  const add = (i: number, rule: string, text: string) =>
    out.push({ file: path.basename(file), line: i + 1, rule, text: text.trim().slice(0, 110) });

  // Section numbers actually defined by headings (`## §3`, `### 3.2`)
  const defined = new Set<string>();
  lines.forEach((l) => {
    const m = /^#{2,6}\s*§?(\d+(?:\.\d+)*)/.exec(l);
    if (m) { defined.add(m[1]); const top = m[1].split(".")[0]; defined.add(top); }
  });

  lines.forEach((l, i) => {
    if (l.startsWith("<!--lint-ignore")) return;

    if (checks.includes("id")) {
      // Session IDs in all three shapes: prefixed, bare 8-hex, full UUID.
      // Bare 8-hex must contain both a digit and an a-f letter, or run stamps (20260801) false-positive.
      const idRe = /\b(?:claude|grok)_[0-9a-f]{6,}\b|\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b|(?<![0-9a-fA-F_-])(?=[0-9a-f]{8}(?![0-9a-fA-F]))(?=[a-f0-9]*\d)(?=[a-f0-9]*[a-f])[0-9a-f]{8}(?![0-9a-fA-F])/g;
      for (const m of l.matchAll(idRe)) add(i, "session-id", m[0]);
    }
    if (checks.includes("turn")) {
      for (const m of l.matchAll(/\[\d+\]/g)) add(i, "turn-ref", m[0]);
      // Inline evidence anchors: [E12], [AD-07], 见证据 3
      for (const m of l.matchAll(/\[[A-Z]{1,3}-?\d+\]|见证据\s*\d+/g)) add(i, "inline-anchor", m[0]);
    }
    if (checks.includes("patch")) {
      for (const [name, re] of PATCH_STYLE) if (re.test(l)) add(i, `patch-style:${name}`, l);
    }
    if (checks.includes("section")) {
      // In-file §N references need a matching heading. References prefixed with `roles-*.md`
      // or `Stage N` point at another document, so they are skipped.
      const stripped = l
        .replace(/`?roles-(method|evidence)\.md`?[^§\n]{0,24}§\d+(\.\d+)*/g, "")
        .replace(/Stage\s*\d[^§\n]{0,8}§\d+(\.\d+)*/g, "");
      for (const m of stripped.matchAll(/§(\d+(?:\.\d+)*)/g)) {
        if (!defined.has(m[1])) add(i, "dangling-section", m[0]);
      }
    }
  });

  if (checks.includes("section")) {
    // A subsection number must match its parent: no `### 11.1` under `## §7`
    let parent = "";
    lines.forEach((l, i) => {
      const h2 = /^##\s+§?(\d+)\s/.exec(l);
      if (h2) { parent = h2[1]; return; }
      const h3 = /^###\s+(\d+)\.(\d+)/.exec(l);
      if (h3 && parent && h3[1] !== parent) add(i, "subsection-parent-mismatch", l);
    });
  }
  return out;
}

function cmdLintRoles() {
  const run = requireRun();
  const p = (f: string) => path.join(run, f);
  const read = (f: string) => (fs.existsSync(p(f)) ? fs.readFileSync(p(f), "utf8") : null);

  const roles = read("roles.md");
  const method = read("roles-method.md");
  const evidence = read("roles-evidence.md");
  if (!roles) die(`no roles.md in ${run} — run Stage 3 first`);

  const v: Violation[] = [];
  // roles.md is the deliverable: check IDs, turn refs, anchors, patch-style prose and
  // dangling references (stage3 §3.0, §3.1)
  v.push(...lintFile("roles.md", roles, ["id", "turn", "patch", "section"]));
  // roles-method.md may carry provenance, but the writing contract applies equally
  if (method) v.push(...lintFile("roles-method.md", method, ["patch", "section"]));

  // Three-artifact split (stage3 §3D)
  if (!method) v.push({ file: "roles-method.md", line: 0, rule: "missing-artifact", text: "roles-method.md is missing" });
  if (!evidence) v.push({ file: "roles-evidence.md", line: 0, rule: "missing-artifact", text: "roles-evidence.md is missing" });

  // Known-limits block (stage3 §3E): must exist and stay within 6 lines
  const bIdx = roles.split("\n").findIndex((l) => /已知边界|Known limits/i.test(l));
  if (bIdx < 0) {
    v.push({ file: "roles.md", line: 0, rule: "missing-boundary-block", text: "no known-limits block at the top" });
  } else {
    const bullets = roles.split("\n").slice(bIdx + 1).findIndex((l) => !l.trimStart().startsWith("-") && l.trim() !== "");
    const n = roles.split("\n").slice(bIdx + 1, bIdx + 1 + (bullets < 0 ? 0 : bullets)).filter((l) => l.trim().startsWith("-")).length;
    if (n === 0) v.push({ file: "roles.md", line: bIdx + 1, rule: "empty-boundary-block", text: "known-limits block has no entries" });
    if (n > 6) v.push({ file: "roles.md", line: bIdx + 1, rule: "boundary-block-too-long", text: `${n} lines, limit is 6` });
  }

  // Quote join (stage3 §3.0): every quote in roles.md must resolve to a row in the evidence table
  const norm = (s: string) => s.replace(/[\s`｜|\\『』「」…\.·]/g, "");
  const unjoined: string[] = [];
  if (evidence) {
    const cells = evidence.split("\n").filter((l) => l.startsWith("|")).flatMap((l) => l.split("|")).map(norm).filter((s) => s.length >= 4);
    for (const m of roles.matchAll(/「([^「」\n]{6,})」/g)) {
      const q = norm(m[1]);
      if (!cells.some((c) => c.includes(q) || q.includes(c))) unjoined.push(m[1].slice(0, 60));
    }
  }

  const byRule: Record<string, number> = {};
  for (const x of v) byRule[x.rule.split(":")[0]] = (byRule[x.rule.split(":")[0]] || 0) + 1;
  for (const x of v) console.log(`${x.file}:${x.line}  [${x.rule}]  ${x.text}`);
  if (unjoined.length) {
    console.log(`\nquotes with no provenance in roles-evidence.md (${unjoined.length}):`);
    for (const q of unjoined) console.log(`  「${q}」`);
  }

  const report = { checkedAt: new Date().toISOString(), violations: v, unjoinedQuotes: unjoined, byRule };
  writeJson(path.join(run, "inventory", "lint-roles.json"), report);

  const total = v.length + unjoined.length;
  console.log(`\n${total === 0 ? "PASS" : "FAIL"}: ${v.length} violations + ${unjoined.length} unsourced quotes → inventory/lint-roles.json`);
  if (total) process.exit(1);
}

switch (cmd) {
  case "init": cmdInit(); break;
  case "discover": cmdDiscover(); break;
  case "normalize": cmdNormalize(); break;
  case "filter": cmdFilter(); break;
  case "user-turns": cmdUserTurns(); break;
  case "sample": cmdSample(); break;
  case "stats": cmdStats(); break;
  case "lint-roles": cmdLintRoles(); break;
  default:
    die(`unknown command "${cmd || ""}" — expected init|discover|normalize|filter|user-turns|sample|stats|lint-roles`);
}
