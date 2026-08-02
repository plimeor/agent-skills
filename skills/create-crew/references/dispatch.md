# Batch LLM dispatch

Applies to Stage 2 extraction, Stage 4 boundary validation and scoring, and any other one-instruction × N-item LLM batch in this pipeline. Executor-agnostic (Task subagent, Grok CLI, Codex, …). Grok-specific traps sit in the appendix.

## D1. Success checks the payload

Judge success on the analysis payload, not on a side-channel file alone. Prefer one output channel. If two channels exist, the analysis-bearing channel is authoritative. Read raw output before declaring failure.

## D2. Typed re-dispatch

The loop is idempotent: skip items that already have complete output. Log types separately:

| Type | Signature | Action |
|---|---|---|
| False failure | Fast return or complete payload in raw | Recover; do not rerun |
| Timeout | Runtime pinned to the limit | Raise limit; rerun |
| Truncation | Mid-sentence / open JSON | Cap output length; rerun |
| Real error | Non-zero, empty payload | Rerun as-is |

End every batch by reconciling produced artifacts to dispatched items.

## D3. Timeouts from the tail

Set caps from the slowest observed task (about 2×), not the median. Always re-dispatch timeouts; partial files must not satisfy "output exists."

## D4. Cap length in the prompt

Hard line or size caps prevent silent max-token truncation.

## D5. Work queue, not barrier groups

Keep N in flight; start a replacement when one exits. Size N by provider rate limits, not core count. Each worker gets only its own input. For isolation-sensitive work, put only readable material in the worker directory (real copies, not escaping symlinks).

Do not infer rate limits by grepping report bodies for strings like `429`.

## D6. Comparability

A/B and same-input reruns reuse one instruction file, schema, and sample set.

## Appendix · Grok CLI

```bash
grok --prompt-file <absolute-path> --cwd <workdir> \
     --permission-mode bypassPermissions \
     --json-schema "$(cat schema.json)" \
     --disable-web-search --max-turns 60 > out.raw 2>&1
```

- Long or non-ASCII prompts: always `--prompt-file` with an absolute path (resolved relative to `--cwd`).
- Parse nested JSON by recursive descent; prefer `--json-schema`.
- Locale-safe post-processing: avoid C-locale `tr`/`sed` on UTF-8; truncate with `head -c` when needed.
- Network outages look like FAIL batches while processes still launch — reconcile artifacts.
