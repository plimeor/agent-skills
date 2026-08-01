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
  return false;
}

export function extractUserText(text: string): string {
  if (!text) return "";
  const m = text.match(/<user_query>\s*([\s\S]*?)\s*<\/user_query>/i);
  if (m) return m[1].trim();
  const t = text
    .replace(/<system-reminder>[\s\S]*?<\/system-reminder>/gi, "")
    .replace(/<user_info>[\s\S]*?<\/user_info>/gi, "")
    .replace(/<skill_information>[\s\S]*?<\/skill_information>/gi, "")
    .replace(/\[Full request offloaded to file\][\s\S]*?(?=\n\n|$)/g, "[request offloaded to file]")
    .trim();
  return t || text.trim();
}

// Heuristic: short corrective/confirming turns count as feedback pressure.
export function isFeedbackLike(text: string): boolean {
  if (!text) return false;
  const t = text.trim();
  if (t.length < 2) return false;
  const patterns =
    /^(yes|no|ok|不对|不是|继续|改|不要|停|好|确认|重做|再|cancel|stop|continue|fix|wrong|don't|do not)/i;
  if (t.length < 80 && patterns.test(t)) return true;
  if (/你(错|不对|应该|不要|必须)|不是这样|重新|改成|我要的是|别|不要再|少|多|只/.test(t)) return true;
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

export function recordsToMarkdown(
  meta: SessionEntry,
  records: TrajRecord[],
  stats: TrajStats,
  limits: Limits
): string {
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

  let n = 0;
  for (const r of records) {
    n++;
    if (r.role === "meta") continue;
    if (r.role === "user") {
      lines.push(`## [${n}] user`, "", r.content || "", "");
    } else if (r.role === "assistant") {
      lines.push(`## [${n}] assistant`, "", truncate(r.content || "", limits.assistantTextMax), "");
    } else if (r.role === "assistant-tool-call") {
      lines.push(`## [${n}] assistant-tool-call`, "");
      lines.push(`- **tool**: \`${r.tool_name || ""}\``);
      lines.push(`- **id**: \`${r.tool_call_id || ""}\``);
      lines.push(`- **args**: \`${r.args || ""}\``, "");
    } else if (r.role === "tool") {
      lines.push(`## [${n}] tool-result`, "");
      lines.push(`- **tool_call_id**: \`${r.tool_call_id || ""}\``);
      if (r.tool_name) lines.push(`- **tool**: \`${r.tool_name}\``);
      lines.push("", "```", truncate(r.content || "", limits.toolResultMax), "```", "");
    } else if (r.role === "feedback") {
      lines.push(`## [${n}] user-feedback`, "", r.content || "", "");
    }
  }
  if (stats.fallbackNote) lines.push("", `> **Note**: ${stats.fallbackNote}`, "");
  return lines.join("\n");
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
