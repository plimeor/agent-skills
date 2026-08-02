// Claude Code session discovery + normalization (raw JSONL parser, zero deps).
// Main sessions live at ~/.claude/projects/<project-slug>/<uuid>.jsonl.
// Subagent artifacts (agent-*.jsonl, <uuid>/subagents/**) are excluded: the
// user only ever interacts with the main session, so only it carries persona signal.
import fs from "node:fs";
import path from "node:path";
import {
  type Limits, type SessionEntry, type TrajRecord, type TrajStats,
  jsonlLines, truncate, summarizeArgs, isNoiseUserText, extractUserText,
  isFeedbackLike, interventionLevel, recordsToMarkdown,
} from "./common.ts";

const UUID_JSONL = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jsonl$/i;

export interface DiscoverResult {
  sessions: SessionEntry[];
  excluded: { path: string; reason: string }[];
}

export function discoverClaude(root: string, excludeProjectPatterns: string[]): DiscoverResult {
  const sessions: SessionEntry[] = [];
  const excluded: { path: string; reason: string }[] = [];
  if (!fs.existsSync(root)) return { sessions, excluded };

  for (const project of fs.readdirSync(root).sort()) {
    const projectDir = path.join(root, project);
    let st: fs.Stats;
    try { st = fs.statSync(projectDir); } catch { continue; }
    if (!st.isDirectory()) continue;
    if (excludeProjectPatterns.some((p) => project.includes(p))) {
      excluded.push({ path: projectDir, reason: `project-excluded:${project}` });
      continue;
    }
    for (const f of fs.readdirSync(projectDir).sort()) {
      const full = path.join(projectDir, f);
      if (f.startsWith("agent-") && f.endsWith(".jsonl")) {
        excluded.push({ path: full, reason: "subagent-transcript" });
        continue;
      }
      if (!UUID_JSONL.test(f)) continue; // session dirs (subagents/ etc.) and other files
      const fst = fs.statSync(full);
      sessions.push({
        source: "claude",
        id: f.replace(/\.jsonl$/i, ""),
        path: full,
        project,
        mtime_iso: fst.mtime.toISOString(),
        size: fst.size,
        title: null,
      });
    }
  }
  return { sessions, excluded };
}

function collectText(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .filter((b: any) => b && (b.type === "text" || typeof b === "string"))
    .map((b: any) => (typeof b === "string" ? b : b.text || ""))
    .join("\n");
}

export function normalizeClaude(
  entry: SessionEntry,
  limits: Limits
): { markdown: string; stats: TrajStats; title: string | null } {
  const records: TrajRecord[] = [{ role: "meta" }];
  let userTurns = 0, assistantTurns = 0, toolCalls = 0, feedbackTurns = 0;
  let title: string | null = null;
  // tool_use id -> name, so tool-results can be labeled with their tool.
  const toolNames = new Map<string, string>();

  for (const o of jsonlLines(entry.path)) {
    const t = o.type;
    if (t === "summary" && typeof o.summary === "string" && !title) {
      title = o.summary;
      continue;
    }
    if (t === "user") {
      const c = o.message?.content;
      // tool_result blocks arrive as type:"user" lines; route them to the tool channel.
      if (Array.isArray(c)) {
        for (const b of c) {
          if (b?.type !== "tool_result") continue;
          let body = "";
          if (typeof b.content === "string") body = b.content;
          else if (Array.isArray(b.content))
            body = b.content.map((x: any) => (x?.type === "text" ? x.text : "")).join("\n");
          body = body.replace(/<system-reminder>[\s\S]*?<\/system-reminder>/gi, "").trim();
          records.push({
            role: "tool",
            tool_call_id: b.tool_use_id,
            tool_name: toolNames.get(b.tool_use_id),
            content: truncate(body, limits.toolResultMax),
          });
        }
      }
      const text = collectText(c);
      if (isNoiseUserText(text)) continue;
      const content = extractUserText(text) || text;
      if (!content.trim()) continue;
      userTurns++;
      if (isFeedbackLike(content)) feedbackTurns++;
      records.push({ role: "user", content });
      continue;
    }
    if (t === "assistant") {
      const c = o.message?.content;
      let text = "";
      if (typeof c === "string") text = c;
      else if (Array.isArray(c)) {
        for (const b of c) {
          if (!b || typeof b !== "object") continue;
          if (b.type === "text" && b.text) text += (text ? "\n" : "") + b.text;
          if (b.type === "tool_use") {
            toolCalls++;
            if (b.id && b.name) toolNames.set(b.id, b.name);
            records.push({
              role: "assistant-tool-call",
              tool_name: b.name || "unknown",
              tool_call_id: b.id,
              args: summarizeArgs(b.input, limits),
            });
          }
        }
      }
      if (text.trim()) {
        assistantTurns++;
        records.push({ role: "assistant", content: truncate(text, limits.assistantTextMax) });
      }
      continue;
    }
    // mode / permission-mode / file-history-snapshot / system etc.: harness noise, skip.
  }

  const stats: TrajStats = {
    userTurns, assistantTurns, toolCalls, feedbackTurns,
    intervention: interventionLevel({ userTurns, feedbackTurns, toolCalls, assistantTurns }),
    recordCount: records.length,
  };
  if (userTurns === 0 && assistantTurns === 0)
    stats.fallbackNote = "Empty or non-conversational session (no normalizable turns).";
  const { markdown, toolDetails } = recordsToMarkdown({ ...entry, title }, records, stats, limits);
  return { markdown, stats, title, toolDetails };
}
