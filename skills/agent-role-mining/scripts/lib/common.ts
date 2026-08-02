// Shared normalization primitives for role-mining pipeline.
// Zero third-party dependencies; runs under Bun.
import fs from "node:fs";
import path from "node:path";

export interface Limits {
  toolResultMax: number;
  toolArgsMax: number;
  assistantTextMax: number;
}

export const DEFAULT_LIMITS: Limits = {
  toolResultMax: 2500,
  toolArgsMax: 800,
  assistantTextMax: 4000,
};

export interface SessionEntry {
  source: "claude" | "grok";
  id: string;
  path: string; // claude: jsonl file; grok: session dir
  project: string;
  mtime_iso: string;
  size: number;
  title?: string | null;
}

export interface TrajRecord {
  role: "meta" | "user" | "assistant" | "assistant-tool-call" | "tool" | "feedback";
  content?: string;
  tool_name?: string;
  tool_call_id?: string;
  args?: string;
  _feedback?: boolean;
}

export interface TrajStats {
  userTurns: number;
  assistantTurns: number;
  toolCalls: number;
  feedbackTurns: number;
  intervention: "高" | "中" | "低";
  recordCount: number;
  fallbackNote?: string;
}

export function ensureDir(d: string) {
  fs.mkdirSync(d, { recursive: true });
}

export function readJson<T>(p: string, fallback: T): T {
  if (!fs.existsSync(p)) return fallback;
  return JSON.parse(fs.readFileSync(p, "utf8")) as T;
}

export function writeJson(p: string, obj: unknown) {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

export function* jsonlLines(file: string): Generator<any> {
  const text = fs.readFileSync(file, "utf8");
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    try {
      yield JSON.parse(line);
    } catch {
      /* skip malformed line */
    }
  }
}

export function truncate(s: unknown, max: number, strategy: "head" | "head-tail" = "head-tail"): string {
  if (s == null) return "";
  const str = typeof s === "string" ? s : JSON.stringify(s);
  if (str.length <= max) return str;
  if (strategy === "head") return str.slice(0, max) + `\n…[truncated ${str.length - max} chars]`;
  const head = Math.floor(max * 0.6);
  const tail = max - head;
  return str.slice(0, head) + `\n…[truncated ${str.length - max} chars]…\n` + str.slice(-tail);
}

const PREFERRED_ARG_KEYS = [
  "command", "target_file", "file_path", "path", "pattern", "query", "url",
  "prompt", "description", "old_string", "new_string", "content", "glob",
  "type", "name", "id",
];

export function summarizeArgs(args: unknown, limits: Limits): string {
  if (args == null) return "";
  let obj: any = args;
  if (typeof args === "string") {
    try {
      obj = JSON.parse(args);
    } catch {
      return truncate(args, limits.toolArgsMax, "head");
    }
  }
  if (typeof obj !== "object" || obj === null) return truncate(String(obj), limits.toolArgsMax, "head");
  const out: Record<string, unknown> = {};
  for (const k of PREFERRED_ARG_KEYS) {
    if (obj[k] != null) {
      const v = obj[k];
      if (k === "content" || k === "old_string" || k === "new_string")
        out[k] = typeof v === "string" ? `[${v.length} chars]` : v;
      else if (typeof v === "string" && v.length > 200) out[k] = v.slice(0, 200) + "…";
      else out[k] = v;
    }
  }
  if (Object.keys(out).length === 0) {
    for (const [k, v] of Object.entries(obj).slice(0, 8)) {
      if (typeof v === "string" && v.length > 120) out[k] = v.slice(0, 120) + "…";
      else out[k] = v;
    }
  }
  return truncate(JSON.stringify(out), limits.toolArgsMax, "head");
}

// Harness/system noise that must never enter the user channel — it carries no
// human intent and would poison intervention counts and signal extraction.
export function isNoiseUserText(text: string): boolean {
  if (!text) return true;
  const t = text.trim();
  if (t.startsWith("<system-reminder>") && !t.includes("<user_query>")) return true;
  if (t.startsWith("You are Grok") || t.startsWith("You are Claude")) return true;
  if (t.includes("<user_info>") && !t.includes("<user_query>") && t.length < 2000) return true;
  if (t.includes("<teammate-message") || t.includes("Another Claude session sent a message")) return true;
  if (t.includes("<agent-message") && !t.includes("<user_query>")) return true;
  if (/^A background workflow stopped/i.test(t)) return true;
  if (/^A background (task|subagent|workflow)/i.test(t) && t.length < 1500) return true;
  if (t.includes("workflow completion reminder") && !t.includes("<user_query>")) return true;
  if (t.includes("<skill_information>") && !t.includes("<user_query>")) return true;
  if (t.startsWith("<local-command-stdout>") || t.startsWith("<command-name>")) return true;
  if (t.startsWith("<command-message>") || t.startsWith("<command-args>")) return true;
  if (/^\/[a-z][a-z0-9:-]*(\s|$)/i.test(t) && t.length < 80) return true;
  // Background-task completion notices are harness output delivered through the user channel.
  if (t.startsWith("<task-notification>") || (t.includes("<task-notification>") && t.length < 2000)) return true;
  // Skill bodies are injected as user messages. Counted as user turns they add thousands of
  // words of machine instructions to the "user's own words" channel.
  if (t.startsWith("Base directory for this skill:")) return true;
  // Compaction hand-off text is harness output, not the user speaking.
  if (t.startsWith("This session is being continued from a previous conversation")) return true;
  // A slash-command invocation arrives as a caveat banner plus command tags and no prose.
  // Counted as a user turn it inflates intervention and pollutes the first-turn preview.
  if (t.includes("<local-command-caveat>")) {
    const rest = t
      .replace(/<local-command-caveat>[\s\S]*?<\/local-command-caveat>/gi, "")
      .replace(/<(command-name|command-message|command-args|local-command-stdout)>[\s\S]*?<\/\1>/gi, "")
      .trim();
    if (rest.length < 12) return true;
  }
  return false;
}

export function extractUserText(text: string): string {
  if (!text) return "";
  const m = text.match(/<user_query>\s*([\s\S]*?)\s*<\/user_query>/i);
  if (m) return m[1].trim();
  const t = text
    .replace(/<local-command-caveat>[\s\S]*?<\/local-command-caveat>/gi, "")
    .replace(/<system-reminder>[\s\S]*?<\/system-reminder>/gi, "")
    .replace(/<user_info>[\s\S]*?<\/user_info>/gi, "")
    .replace(/<skill_information>[\s\S]*?<\/skill_information>/gi, "")
    .replace(/\[Full request offloaded to file\][\s\S]*?(?=\n\n|$)/g, "[request offloaded to file]")
    .trim();
  return t || text.trim();
}

// Pasted material — code blocks, logs, spec documents — carries no feedback intent even
// though it arrives in a user turn. Length alone cannot separate the two: a long turn is
// just as likely to be a carefully argued correction as a paste, and capping feedback
// detection by length systematically discards the most substantive corrections.
// So strip the pasted parts and judge the prose that remains.
export function stripPasted(text: string): { prose: string; pastedRatio: number } {
  const orig = text.length || 1;
  let t = text.replace(/```[\s\S]*?```/g, "\n");           // fenced code / log blocks
  t = t.replace(/^(?: {4,}|\t)\S[^\n]*(?:\n(?: {4,}|\t)\S[^\n]*){2,}/gm, "\n"); // indented blocks

  // Log-shaped runs: >=3 consecutive lines carrying timestamps, levels, or stack frames.
  const LOG = /^\s*(?:\[?\d{4}-\d{2}-\d{2}[T ]|\d{2}:\d{2}:\d{2}|\[?(?:ERROR|WARN|INFO|DEBUG|TRACE|FATAL)\b|at\s+\S+\(|\s*File "|Traceback|npm ERR!|\S+Error:|\+{3}|-{3}\s)/i;
  const lines = t.split("\n");
  const out: string[] = [];
  for (let i = 0; i < lines.length; ) {
    let j = i;
    while (j < lines.length && LOG.test(lines[j])) j++;
    if (j - i >= 3) { out.push(""); i = j; } else { out.push(lines[i]); i++; }
  }
  const prose = out.join("\n").trim();
  return { prose, pastedRatio: Math.max(0, (orig - prose.length) / orig) };
}

// A user turn counts as feedback pressure when its prose carries corrective or directive
// intent. There is no length cap: long corrections count, and pasted bulk does not.
export function isFeedbackLike(text: string): boolean {
  if (!text) return false;
  if (!text.trim()) return false;
  const { prose, pastedRatio } = stripPasted(text);
  // Dominated by pasted material: the few prose words around it are framing, not feedback.
  if (pastedRatio >= 0.7) return false;
  const t = prose.trim();
  if (!t) return false;

  // Requirement/spec documents pasted verbatim: heading- or list-dominated, and long.
  const ls = t.split("\n").filter((l) => l.trim());
  if (ls.length >= 8) {
    const structural = ls.filter((l) => /^\s*(#{1,6}\s|[-*+]\s|\d+[.)]\s|\|)/.test(l)).length;
    if (structural / ls.length >= 0.6) return false;
  }

  // Four observable shapes of intervention. Recall matters more than precision here: the
  // count feeds the intervention level, and a missed correction pushes a high-friction
  // session down the funnel. Measured on a session that was almost entirely corrections,
  // an earlier narrow pattern set recognised 21% of them.
  const first = t.slice(0, 60);
  // 1. Rulings and option selection — the shortest and strongest form of Owner input.
  if (/^(yes|no|ok|好|对|行|可以|同意|批准|approved?|go|do it|[a-z]|\d+)$/i.test(t)) return true;
  if (/^(走|选|用|按)\s*[\da-z]/i.test(first)) return true;
  // 2. Corrections and negations.
  if (/不对|不是这样|你(错|不对|应该|不要|必须)|不[用要需应能]|别(再)?|无需|没必要|重新|重做|改成|我要的是|不要再|wrong|don't|do not|shouldn't|instead/i.test(t)) return true;
  // 3. Directives — imperative openers, with or without sequencing words.
  if (/^(先|再|然后|接着|现在|继续|顺便|另外|请|帮我|麻烦)?\s*(做|跑|删|加|改|换|用|移除|去掉|补|写|出|给|看|查|试|停|修|建|拆|合|推|提交|重跑|继续|优化|调研|验证|实现|更新|检查)/.test(first)) return true;
  if (/^(fix|run|add|remove|delete|change|rewrite|update|check|revert|retry|redo|split|merge|push|commit)\b/i.test(first)) return true;
  // 4. Challenges — a question aimed at the agent's work.
  if (/[？?]/.test(t) && t.length < 400) return true;
  if (t.length < 200 && /啥|什么|怎么|为什么|为何|是否|有没有|多少|哪(个|些|一)|进度/.test(t)) return true;
  return false;
}

// Heuristic, not gold-standard. Documented so downstream stages treat it as such.
export function interventionLevel(s: {
  userTurns: number; feedbackTurns: number; toolCalls: number; assistantTurns: number;
}): "高" | "中" | "低" {
  if (s.userTurns >= 12 || s.feedbackTurns >= 5) return "高";
  if (s.userTurns >= 5 || s.feedbackTurns >= 2) return "中";
  if (s.userTurns <= 1 && s.toolCalls > 30) return "低";
  if (s.userTurns >= 2) return "中";
  return "低";
}

export interface ToolDetail {
  turn: number;
  kind: "call" | "result";
  tool: string;
  id: string;
  body: string;
}

// The main trajectory keeps tool *names* and turn numbers; arguments and results go to a
// sidecar. Measured on a 329-session corpus: tool arguments and results were 83.5% of all
// cleaned bytes and the source of 0 of 1397 signal quotes, while tool names carry a real
// pattern ("dispatch an independent subagent to re-check"). Detail stays queryable via
// `pipeline.ts tool-detail` for the cases that need it.
export function recordsToMarkdown(
  meta: SessionEntry,
  records: TrajRecord[],
  stats: TrajStats,
  limits: Limits
): { markdown: string; toolDetails: ToolDetail[] } {
  const lines: string[] = [];
  lines.push(`# Trajectory: ${meta.id}`, "");
  lines.push(`- **source**: ${meta.source}`);
  lines.push(`- **session_id**: ${meta.id}`);
  if (meta.project) lines.push(`- **project**: ${meta.project}`);
  if (meta.title) lines.push(`- **title**: ${meta.title}`);
  lines.push(`- **mtime**: ${meta.mtime_iso}`);
  lines.push(`- **source_path**: \`${meta.path}\``);
  lines.push(`- **user_turns**: ${stats.userTurns}`);
  lines.push(`- **assistant_turns**: ${stats.assistantTurns}`);
  lines.push(`- **tool_calls**: ${stats.toolCalls}`);
  lines.push(`- **feedback_turns**: ${stats.feedbackTurns}`);
  lines.push(`- **intervention**: ${stats.intervention}`);
  lines.push("", "---", "");

  const toolDetails: ToolDetail[] = [];
  let n = 0;
  for (const r of records) {
    n++;
    if (r.role === "meta") continue;
    if (r.role === "user") {
      lines.push(`## [${n}] user`, "", r.content || "", "");
    } else if (r.role === "assistant") {
      lines.push(`## [${n}] assistant`, "", truncate(r.content || "", limits.assistantTextMax), "");
    } else if (r.role === "assistant-tool-call") {
      lines.push(`## [${n}] tool-call · \`${r.tool_name || "?"}\``, "");
      toolDetails.push({
        turn: n, kind: "call", tool: r.tool_name || "", id: r.tool_call_id || "",
        body: truncate(r.args || "", limits.toolArgsMax),
      });
    } else if (r.role === "tool") {
      toolDetails.push({
        turn: n, kind: "result", tool: r.tool_name || "", id: r.tool_call_id || "",
        body: truncate(r.content || "", limits.toolResultMax),
      });
    } else if (r.role === "feedback") {
      lines.push(`## [${n}] user-feedback`, "", r.content || "", "");
    }
  }
  if (stats.fallbackNote) lines.push("", `> **Note**: ${stats.fallbackNote}`, "");
  if (toolDetails.length)
    lines.push("", `> ${toolDetails.length} tool arguments/results omitted here; query them with`,
      `> \`bun pipeline.ts tool-detail --run <run> --file ${meta.source}_${meta.id}.md [--turn N]\``, "");
  return { markdown: lines.join("\n"), toolDetails };
}

// Deterministic PRNG (mulberry32) so sampling is reproducible from a seed.
export function seededRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededSample<T>(items: T[], n: number, seed: number): T[] {
  const rng = seededRng(seed);
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}
