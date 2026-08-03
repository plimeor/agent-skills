#!/usr/bin/env bun
// create-crew deterministic pipeline CLI (Bun, zero third-party deps).
//
//   bun pipeline.ts init --workdir <dir> [--label <name>]
//   bun pipeline.ts discover   --run <runDir>
//   bun pipeline.ts normalize  --run <runDir> [--only claude|grok] [--limit N] [--skip-existing]
//   bun pipeline.ts filter     --run <runDir>
//   bun pipeline.ts preview    --run <runDir> [--n 4] [--seed 42]
//   bun pipeline.ts tool-detail --run <runDir> --file <cleaned.md> [--turn N] [--grep S]
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
    // Thin-session cut measured on user text, not total cleaned bytes: tool volume varies
    // by two orders of magnitude between sessions and says nothing about signal density.
    minUserTextBytes: number;
    dropLowIntervention: boolean;
    // Drop sessions that invoke or polish create-crew itself. Without it, Stage 3
    // re-ingests prior crew packages and design talk about this pipeline — not real
    // work behavior.
    selfReference: {
      enabled: boolean;
      // Product identity only (`create-crew`). Not section headers, abstract concepts,
      // or retired names — those either appear in agent prose or are obsolete.
      markers: string[];       // case-insensitive; scored by distinct marker types hit
      minDistinctHits: number; // 1 is correct when every marker is product-specific
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
  userTextBytes: number;
  status: "kept" | "dropped";
  reason?: string;
  selfRefHits?: string[]; // markers hit (recorded at >=1; dropping depends on the threshold)
}

const DEFAULT_CONFIG = (): Config => ({
  createdAt: new Date().toISOString(),
  sources: {
    claude: { enabled: true, root: path.join(os.homedir(), ".claude", "projects") },
    grok: { enabled: true, root: path.join(os.homedir(), ".grok", "sessions") },
  },
  // Empty by default: what counts as an irrelevant project is a property of the person's
  // machine, not of this pipeline, and behavioural filters usually already drop it.
  excludeProjectPatterns: [],
  limits: { ...DEFAULT_LIMITS },
  filter: {
    // Off by default. With tool arguments and results moved out of cleaned/, the analysis
    // set is small enough that a size cut buys nothing and only risks dropping a short
    // session that ruled on something important. Raise it only if context becomes a problem.
    minUserTextBytes: 0,
    dropLowIntervention: true,
    selfReference: {
      enabled: true,
      markers: ["create-crew"],
      minDistinctHits: 1,
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
  const workdir = flag("workdir") || path.join(process.cwd(), ".artifacts", "create-crew");
  const label = flag("label") || "run";
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 13).replace("T", "-");
  const run = path.join(path.resolve(workdir), "runs", `${stamp}-${label}`);
  ensureDir(run);
  for (const d of ["inventory", "cleaned", "user-turns", "census", "signals", "validation", "skill", "skill/roles", "skill/references"])
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
  const statsMap = readJson<Record<string, TrajStats & { cleanedBytes: number; userTextBytes?: number; title: string | null }>>(statsPath, {});
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
      const td = path.join(run, "tool-details", fileNameFor(entry).replace(/\.md$/, ".jsonl"));
      ensureDir(path.dirname(td));
      fs.writeFileSync(td, result.toolDetails.map((d) => JSON.stringify(d)).join("\n") + "\n", "utf8");
      const userTextBytes = [...result.markdown.matchAll(
        /\n## \[\d+\] (?:user|user-feedback)\n\n([\s\S]*?)(?=\n## \[|\n> |$)/g)]
        .reduce((a, m) => a + m[1].length, 0);
      statsMap[fileNameFor(entry)] = {
        ...result.stats,
        cleanedBytes: fs.statSync(outFile).size,
        userTextBytes,
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
  const statsMap = readJson<Record<string, TrajStats & { cleanedBytes: number; userTextBytes?: number; title: string | null }>>(
    path.join(run, "inventory", "session_stats.json"), {});
  // Self-reference detection lives in filter, not normalize, for two reasons:
  //   1. an existing run gains the filter without re-running the cleaning pass;
  //   2. markers are part of config, so changing them should only require re-running filter.
  // Cache is keyed by the marker list; a config edit invalidates prior hits.
  const sr = cfg.filter.selfReference ?? { enabled: false, markers: [], minDistinctHits: 1 };
  const srKey = [...sr.markers].map((m) => m.toLowerCase()).sort().join("\0");
  const srHits = (file: string): string[] => {
    const st = statsMap[file] as any;
    if (st && st.selfRefKey === srKey && Array.isArray(st.selfRefHits)) return st.selfRefHits as string[];
    const p = path.join(run, "cleaned", file);
    if (!fs.existsSync(p)) return [];
    const text = fs.readFileSync(p, "utf8").toLowerCase();
    const hits = sr.markers.filter((m) => text.includes(m.toLowerCase()));
    if (st) {
      st.selfRefHits = hits;
      st.selfRefKey = srKey;
    }
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
      cleanedBytes: st.cleanedBytes, userTextBytes: st.userTextBytes ?? 0, status: "kept",
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
    }
    if (row.status === "kept" && cfg.filter.minUserTextBytes > 0 && (st.userTextBytes ?? 0) < cfg.filter.minUserTextBytes) {
      row.status = "dropped";
      row.reason = `thin-user-text<${Math.round(cfg.filter.minUserTextBytes / 1024 * 10) / 10}KB`;
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
      "Sessions that **invoke or polish create-crew** are dropped so Stage 3 does not re-ingest",
      "prior crew packages and design talk about this pipeline. Marker is product identity only",
      "(`create-crew`) — not section headers, abstract concepts, or retired names.", "",
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

  // Hook stdout is indistinguishable from user speech. Per the Claude Code hook contract,
  // `additionalContext` is wrapped in a <system-reminder> (stripped during normalize), but
  // UserPromptSubmit / UserPromptExpansion / SessionStart / Setup stdout is injected raw,
  // with no marker at all. The one signal left is that a machine repeats itself verbatim:
  // an opening that recurs word-for-word across many sessions is generated, not typed.
  //
  // Reported, never auto-dropped. Measured on a real corpus, a threshold of 3 sessions
  // produced a false positive — a genuine user turn re-sent across retried sessions — so
  // the call belongs to the person whose sessions these are.
  const prefixes = new Map<string, { files: Set<string>; sample: string }>();
  for (const r of rows) {
    const cp = path.join(run, "cleaned", r.file);
    if (!fs.existsSync(cp)) continue;
    for (const m of fs.readFileSync(cp, "utf8")
      .matchAll(/\n## \[\d+\] (?:user|user-feedback)\n\n([\s\S]*?)(?=\n## \[|\n> |$)/g)) {
      const body = m[1].trim();
      if (body.length < 60) continue;
      const key = body.slice(0, 120).replace(/\s+/g, " ");
      if (!prefixes.has(key)) prefixes.set(key, { files: new Set(), sample: body.slice(0, 200) });
      prefixes.get(key)!.files.add(r.file);
    }
  }
  const repeated = [...prefixes.values()].filter((v) => v.files.size >= 3)
    .sort((a, b) => b.files.size - a.files.size);
  const injLines = [
    "# Repeated user-turn openings — possible injected content", "",
    "A user turn whose opening repeats verbatim across many sessions is usually machine-generated:",
    "hook stdout (`UserPromptSubmit` / `UserPromptExpansion` / `SessionStart` / `Setup` inject raw",
    "stdout with no marker), a slash-command body, or an injected skill document.", "",
    "**Nothing here is dropped automatically.** People do re-send the same prompt, and a real user",
    "turn has been observed in this table. Review it and, for anything that is genuinely not the",
    "user speaking, add a matcher or exclude the sessions before Stage 2.", "",
    `| Sessions | Opening |`, `|---------:|---------|`,
  ];
  for (const v of repeated)
    injLines.push(`| ${v.files.size} | ${v.sample.replace(/\s+/g, " ").replace(/\|/g, "\\|").slice(0, 150)} |`);
  if (!repeated.length) injLines.push("| — | none |");
  fs.writeFileSync(path.join(run, "inventory", "injected-turns.md"), injLines.join("\n") + "\n", "utf8");

  const kept = rows.filter((r) => r.status === "kept");
  const census = rows.filter((r) => r.reason === "low-intervention");

  // manifest.md — human-readable funnel result
  const md: string[] = ["# Stage 1 Manifest", ""];
  const drops = new Map<string, number>();
  for (const r of rows) if (r.status === "dropped") drops.set(r.reason!, (drops.get(r.reason!) || 0) + 1);
  md.push(`| Item | Count |`, `|------|------:|`, `| Discovered (main sessions, normalized) | ${rows.length} |`, `| Kept (analysis set) | ${kept.length} |`);
  for (const [reason, n] of [...drops.entries()].sort()) md.push(`| Dropped: ${reason} | ${n} |`);
  md.push("", "## Kept sessions", "", `| File | Interv | U | KB | Title |`, `|------|--------|--:|---:|-------|`);
  for (const r of kept)
    md.push(`| \`${r.file}\` | ${r.intervention} | ${r.userTurns} | ${Math.round(r.cleanedBytes / 1024)} | ${(r.title || "").slice(0, 60)} |`);
  fs.writeFileSync(path.join(run, "manifest.md"), md.join("\n") + "\n");

  // census list — excluded low-intervention sessions are the positive evidence
  // for what is already safely delegable; stage 1.5 annotates them.
  writeJson(path.join(run, "census", "census-list.json"), census.map((r) => ({
    file: r.file, source: r.source, id: r.id, project: r.project,
    title: r.title, userTurns: r.userTurns, toolCalls: r.toolCalls,
  })));

  console.log(`kept ${kept.length}, dropped ${rows.length - kept.length} → manifest.md`);
  console.log(`ACTION: run \`stats\` and \`preview\`, read them, and resolve what you can before Stage 2.`);
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

// ---------- preview ----------
// The funnel is only trustworthy if the person whose sessions these are has looked at what
// it kept and what it threw away. Thresholds are heuristics; a sample of real summaries is
// the only cheap way to catch a filter that is silently wrong for this particular corpus.
function firstUserTurn(run: string, file: string, max = 300): string {
  const p = path.join(run, "cleaned", file);
  if (!fs.existsSync(p)) return "(cleaned file missing)";
  const t = fs.readFileSync(p, "utf8");
  // End-of-string with no /m flag: `$` matches EOS (JS has no `\Z` anchor).
  const m = /\n## \[\d+\] user\n\n([\s\S]*?)(?=\n## \[|\n> |$)/.exec(t);
  const body = (m ? m[1] : "").replace(/\s+/g, " ").trim();
  return body.length > max ? body.slice(0, max) + "…" : body || "(no user turn)";
}

function cmdPreview() {
  const run = requireRun();
  const cfg = loadConfig(run);
  const n = parseInt(flag("n") || "4", 10);
  const seed = parseInt(flag("seed") || "42", 10);
  const rows = readJson<ManifestRow[]>(path.join(run, "inventory", "manifest.json"), []);
  if (!rows.length) die("no manifest.json — run filter first");

  const out: string[] = ["# Funnel Preview — confirm before Stage 2", ""];
  out.push("Filters are behavioural, so this is a check rather than an approval gate. Read the samples,",
    "confirm the kept set is this person working and that nothing valuable was dropped, and adjust",
    "`config.json` plus a re-run of `filter` if not. Thresholds changed after Stage 2 mean a new run.", "");

  out.push("## Active filter settings", "",
    `- Excluded project patterns: ${cfg.excludeProjectPatterns.length ? cfg.excludeProjectPatterns.map((x) => `\`${x}\``).join(", ") : "_(none — confirm this is intended)_"}`,
    `- Minimum user text: ${cfg.filter.minUserTextBytes ? Math.round(cfg.filter.minUserTextBytes / 1024 * 10) / 10 + " KB" : "off — no size cut"}`,
    `- Drop low-intervention sessions: ${cfg.filter.dropLowIntervention} (they become the delegation census, not a discard)`,
    `- Self-reference filtering: ${cfg.filter.selfReference?.enabled} at >= ${cfg.filter.selfReference?.minDistinctHits} distinct markers`, "");

  const kept = rows.filter((r) => r.status === "kept");
  const groups = new Map<string, ManifestRow[]>();
  for (const r of rows) if (r.status === "dropped") {
    const key = (r.reason || "?").split(":")[0];
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  out.push(`## Kept — ${kept.length} sessions, ${n} samples`, "");
  for (const f of seededSample(kept.map((r) => r.file).sort(), n, seed)) {
    const r = kept.find((x) => x.file === f)!;
    out.push(`**\`${f}\`** · ${r.project || "-"} · intervention=${r.intervention} · user turns=${r.userTurns} · ${Math.round(r.cleanedBytes / 1024)} KB`,
      "", `> ${firstUserTurn(run, f)}`, "");
  }

  out.push(`## Dropped — ${rows.length - kept.length} sessions across ${groups.size} reasons`, "");
  for (const [reason, list] of [...groups.entries()].sort()) {
    out.push(`### \`${reason}\` — ${list.length} sessions, ${Math.min(n, list.length)} samples`, "");
    for (const f of seededSample(list.map((r) => r.file).sort(), n, seed)) {
      const r = list.find((x) => x.file === f)!;
      out.push(`**\`${f}\`** · ${r.project || "-"} · intervention=${r.intervention} · user turns=${r.userTurns} · ${Math.round(r.cleanedBytes / 1024)} KB`,
        "", `> ${firstUserTurn(run, f)}`, "");
    }
  }
  const inj = path.join(run, "inventory", "injected-turns.md");
  if (fs.existsSync(inj)) {
    const n = fs.readFileSync(inj, "utf8").split("\n").filter((l) => /^\| \d+ \|/.test(l)).length;
    out.push("## Possibly injected user turns", "",
      n ? `${n} opening(s) repeat verbatim across >=3 sessions — likely hook stdout, slash commands, or injected skill bodies. Review \`inventory/injected-turns.md\`; nothing there was dropped automatically.`
        : "No repeated user-turn openings detected.", "");
  }
  const dest = path.join(run, "inventory", "funnel-preview.md");
  fs.writeFileSync(dest, out.join("\n") + "\n", "utf8");
  console.log(out.join("\n"));
  console.log(`\n→ ${dest}`);
  console.log("ACTION: read this yourself. Escalate to the user only for what you cannot resolve — see SKILL.md.");
}

// ---------- tool-detail ----------
// Tool arguments and results live outside cleaned/ (see recordsToMarkdown). This is the
// way back in for the cases that genuinely need them.
function cmdToolDetail() {
  const run = requireRun();
  const file = flag("file");
  if (!file) die("missing --file <cleaned file name>");
  const turn = flag("turn") ? parseInt(flag("turn")!, 10) : null;
  const grep = flag("grep");
  const p = path.join(run, "tool-details", file.replace(/\.md$/, "") + ".jsonl");
  if (!fs.existsSync(p)) die(`no tool details for ${file} (looked in ${p})`);
  let n = 0;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    if (!line.trim()) continue;
    const d = JSON.parse(line) as { turn: number; kind: string; tool: string; id: string; body: string };
    if (turn !== null && d.turn !== turn) continue;
    if (grep && !d.body.includes(grep) && !d.tool.includes(grep)) continue;
    console.log(`\n## [${d.turn}] ${d.kind} · ${d.tool}`);
    console.log(d.body);
    n++;
  }
  if (!n) console.log("(no matching tool records)");
}

switch (cmd) {
  case "init": cmdInit(); break;
  case "discover": cmdDiscover(); break;
  case "normalize": cmdNormalize(); break;
  case "filter": cmdFilter(); break;
  case "user-turns": cmdUserTurns(); break;
  case "sample": cmdSample(); break;
  case "stats": cmdStats(); break;
  case "preview": cmdPreview(); break;
  case "tool-detail": cmdToolDetail(); break;
  default:
    die(`unknown command "${cmd || ""}" — expected init|discover|normalize|filter|preview|user-turns|sample|stats|tool-detail`);
}
