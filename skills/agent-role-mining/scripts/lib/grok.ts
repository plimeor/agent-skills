// Grok session discovery + normalization (zero deps).
// Layout: ~/.grok/sessions/<urlencoded-cwd>/<session-id>/{chat_history.jsonl,
// updates.jsonl|events.jsonl, summary.json, feedback.jsonl?}
// Main sessions: summary.json has NO session_kind in {subagent, subagent_resume}
// (missing kind and "fork" are interactive and therefore in scope).
import fs from "node:fs";
import path from "node:path";
import {
  type Limits, type SessionEntry, type TrajRecord, type TrajStats,
  jsonlLines, truncate, summarizeArgs, isNoiseUserText, extractUserText,
  isFeedbackLike, interventionLevel, recordsToMarkdown, readJson,
} from "./common.ts";
import type { DiscoverResult } from "./claude.ts";

const SUBAGENT_KINDS = new Set(["subagent", "subagent_resume"]);

export function discoverGrok(root: string, excludeProjectPatterns: string[]): DiscoverResult {
  const sessions: SessionEntry[] = [];
  const excluded: { path: string; reason: string }[] = [];
  if (!fs.existsSync(root)) return { sessions, excluded };

  for (const encProject of fs.readdirSync(root).sort()) {
    const projectDir = path.join(root, encProject);
    let st: fs.Stats;
    try { st = fs.statSync(projectDir); } catch { continue; }
    if (!st.isDirectory()) continue;
    let project: string;
    try { project = decodeURIComponent(encProject); } catch { project = encProject; }
    if (excludeProjectPatterns.some((p) => project.includes(p) || encProject.includes(p))) {
      excluded.push({ path: projectDir, reason: `project-excluded:${project}` });
      continue;
    }
    for (const id of fs.readdirSync(projectDir).sort()) {
      const sessionDir = path.join(projectDir, id);
      let sst: fs.Stats;
      try { sst = fs.statSync(sessionDir); } catch { continue; }
      if (!sst.isDirectory()) continue;
      const summary = readJson<any>(path.join(sessionDir, "summary.json"), {});
      if (SUBAGENT_KINDS.has(summary.session_kind)) {
        excluded.push({ path: sessionDir, reason: `session_kind:${summary.session_kind}` });
        continue;
      }
      const chatPath = path.join(sessionDir, "chat_history.jsonl");
      const size = fs.existsSync(chatPath) ? fs.statSync(chatPath).size : 0;
      sessions.push({
        source: "grok",
        id,
        path: sessionDir,
        project,
        mtime_iso: (summary.updated_at as string) || sst.mtime.toISOString(),
        size,
        title: summary.session_summary || null,
      });
    }
  }
  return { sessions, excluded };
}

// Build tool_call_id -> {name, args} from updates.jsonl (or events.jsonl fallback).
function loadToolMeta(sessionDir: string): Map<string, { name?: string; args?: unknown }> {
  const toolMeta = new Map<string, { name?: string; args?: unknown }>();
  const src = ["updates.jsonl", "events.jsonl"]
    .map((f) => path.join(sessionDir, f))
    .find((p) => fs.existsSync(p));
  if (!src) return toolMeta;
  for (const o of jsonlLines(src)) {
    const u = o?.params?.update;
    if (!u) continue;
    if (u.sessionUpdate === "tool_call" || u.sessionUpdate === "tool_call_update") {
      const id = u.toolCallId;
      if (!id) continue;
      const prev = toolMeta.get(id) || {};
      toolMeta.set(id, {
        name: u.title || u._meta?.["x.ai/tool"]?.name || prev.name || "unknown_tool",
        args: u.rawInput ?? prev.args,
      });
    }
  }
  return toolMeta;
}

export function normalizeGrok(
  entry: SessionEntry,
  limits: Limits
): { markdown: string; stats: TrajStats; title: string | null } {
  const sessionDir = entry.path;
  const chatPath = path.join(sessionDir, "chat_history.jsonl");
  const feedbackPath = path.join(sessionDir, "feedback.jsonl");
  const toolMeta = loadToolMeta(sessionDir);

  const records: TrajRecord[] = [{ role: "meta" }];
  let userTurns = 0, assistantTurns = 0, toolCalls = 0, feedbackTurns = 0;

  if (fs.existsSync(chatPath)) {
    for (const o of jsonlLines(chatPath)) {
      const t = o.type;
      if (t === "system" || t === "reasoning") continue;

      if (t === "user") {
        let text = "";
        if (typeof o.content === "string") text = o.content;
        else if (Array.isArray(o.content))
          text = o.content.filter((b: any) => b?.type === "text").map((b: any) => b.text || "").join("\n");
        if (isNoiseUserText(text)) continue;
        const content = extractUserText(text) || text;
        if (!content.trim()) continue;
        if (content.startsWith("<system-reminder>") && content.length < 500) continue;
        userTurns++;
        if (isFeedbackLike(content)) feedbackTurns++;
        records.push({ role: "user", content });
        continue;
      }

      if (t === "assistant") {
        let text = "";
        if (typeof o.content === "string") text = o.content;
        else if (Array.isArray(o.content))
          text = o.content.filter((b: any) => b?.type === "text").map((b: any) => b.text || "").join("\n");
        if (text.trim()) {
          assistantTurns++;
          records.push({ role: "assistant", content: truncate(text, limits.assistantTextMax) });
        }
        continue;
      }

      if (t === "tool_result") {
        const id = o.tool_call_id || o.toolCallId;
        const meta = toolMeta.get(id) || {};
        toolCalls++;
        records.push({
          role: "assistant-tool-call",
          tool_name: meta.name || "unknown",
          tool_call_id: id,
          args: meta.args != null ? summarizeArgs(meta.args, limits) : "",
        });
        let content = typeof o.content === "string" ? o.content : JSON.stringify(o.content);
        content = String(content || "").replace(/<system-reminder>[\s\S]*?<\/system-reminder>/gi, "").trim();
        records.push({
          role: "tool",
          tool_call_id: id,
          tool_name: meta.name,
          content: truncate(content, limits.toolResultMax),
        });
      }
    }
  }

  if (fs.existsSync(feedbackPath)) {
    for (const o of jsonlLines(feedbackPath)) {
      const text = o.text || o.content || o.feedback || JSON.stringify(o);
      if (text) {
        feedbackTurns++;
        records.push({ role: "feedback", content: String(text) });
      }
    }
  }

  const stats: TrajStats = {
    userTurns, assistantTurns, toolCalls, feedbackTurns,
    intervention: interventionLevel({ userTurns, feedbackTurns, toolCalls, assistantTurns }),
    recordCount: records.length,
  };
  const { markdown, toolDetails } = recordsToMarkdown(entry, records, stats, limits);
  return { markdown, stats, title: entry.title ?? null, toolDetails };
}
