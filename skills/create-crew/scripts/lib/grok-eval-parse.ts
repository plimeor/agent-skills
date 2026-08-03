// Parse Grok CLI stdout into crew-eval prediction or score JSON.
// The CLI often wraps the answer in { text: "…concatenated JSON objects…" }.

export type EvalPhase = "predict" | "score";

export function tryParse(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

/** Pull complete top-level JSON objects (brace-balanced, string-aware). */
export function extractJsonObjects(s: string): unknown[] {
  const out: unknown[] = [];
  let i = 0;
  while (i < s.length) {
    const start = s.indexOf("{", i);
    if (start < 0) break;
    let depth = 0;
    let inStr = false;
    let esc = false;
    let end = -1;
    for (let j = start; j < s.length; j++) {
      const c = s[j];
      if (inStr) {
        if (esc) esc = false;
        else if (c === "\\") esc = true;
        else if (c === '"') inStr = false;
        continue;
      }
      if (c === '"') inStr = true;
      else if (c === "{") depth++;
      else if (c === "}") {
        depth--;
        if (depth === 0) {
          end = j;
          break;
        }
      }
    }
    if (end < 0) break;
    const obj = tryParse(s.slice(start, end + 1));
    if (obj) out.push(obj);
    i = end + 1;
  }
  return out;
}

export function looksLikePredict(o: Record<string, unknown>): boolean {
  return Array.isArray(o.roles_triggered) && Array.isArray(o.escalate_points);
}

export function looksLikeScore(o: Record<string, unknown>): boolean {
  return (
    typeof o.escalate_precision === "number" &&
    typeof o.escalate_recall === "number" &&
    typeof o.trigger_fit === "number"
  );
}

/**
 * Prefer the last schema-matching object (final agent answer).
 * Handles outer CLI envelopes and fenced JSON in thought blobs.
 */
export function extractEvalPayload(stdout: string, phase: EvalPhase): unknown {
  const body = stdout.split("---stderr---")[0] || stdout;
  const candidates: unknown[] = [];

  for (const o of extractJsonObjects(body)) {
    if (!o || typeof o !== "object") continue;
    const rec = o as Record<string, unknown>;
    if (typeof rec.text === "string") candidates.push(...extractJsonObjects(rec.text));
    if (phase === "predict" && looksLikePredict(rec)) candidates.push(o);
    if (phase === "score" && looksLikeScore(rec)) candidates.push(o);
    if (rec.prediction) candidates.push(rec.prediction);
    if (rec.score) candidates.push(rec.score);
    if (rec.result) candidates.push(rec.result);
  }

  const fence = /```(?:json)?\s*([\s\S]*?)```/g;
  let m: RegExpExecArray | null;
  while ((m = fence.exec(stdout))) {
    candidates.push(...extractJsonObjects(m[1]));
  }

  const good = candidates.filter((c) => {
    if (!c || typeof c !== "object") return false;
    const r = c as Record<string, unknown>;
    return phase === "predict" ? looksLikePredict(r) : looksLikeScore(r);
  });
  return good.length ? good[good.length - 1] : null;
}
