# Batch LLM Dispatch Contract

Stage 2 signal extraction, Stage 4 boundary validation (primary path and optional pipeline stress test), and Stage 4 scoring are all "one instruction × N sessions" batch LLM work. The executor can be a Task subagent or an external CLI (Grok, Codex, …). **The rules below are executor-agnostic**; Grok-CLI-specific traps are in the appendix.

Every trap below disguises itself as either "the model isn't capable" or "the network flaked".

## D1. The success check must sit on the actual payload

**The most expensive failure class: the signal you check for success and the thing you actually wanted are not the same object.**

A dispatcher that judges success by "did the report file land on disk" records a FAIL whenever the model returns its structured payload and skips the file — and the mirror case, file written and payload empty, happens just as easily.

Rules:

- **If one output channel is enough, use exactly one.** Ask for a file or ask for structured output, not both.
- When two channels are unavoidable, **anchor the check on whichever carries the analysis**; treat the other as a byproduct. Only "both missing" is a FAIL.
- **Read the raw output before declaring FAIL.** A "failure" whose `.raw` holds a complete payload is recoverable — rerunning it is pure waste.

## D2. Failures must be re-dispatched, and typed

This extends the SKILL-level hard requirement (failures must be re-dispatched, never silently missing) with something actionable: **make the dispatch loop idempotent** — skip entries that already have complete output, so re-running the script *is* the re-dispatch.

Log failure types separately; the handling differs completely:

| Type | Signature | Handling |
|---|---|---|
| False failure | Returns in seconds, or payload is complete | Recover from raw output; do not rerun |
| Timeout | Runtime pinned to the limit | Raise the limit and rerun (see D3) |
| Truncation | Ends mid-sentence, JSON unclosed | Add an output-length cap and rerun (see D4) |
| Real error | Non-zero exit with no payload | Rerun as-is |

**Reconcile totals at the end of every batch**: outputs produced must equal items dispatched, and any shortfall gets named. `OK/FAIL` counters do not count as reconciliation — they tally dispatch results, not artifacts.

## D3. Set timeouts from the slowest task, not the average

Batch LLM runtimes are long-tailed, and a cap set near the median **kills tasks mid-write**, leaving half a file behind and looking like a model-capability problem.

- Start the cap at **2× the slowest observed task**, and expose it as an environment variable so retries don't require editing the script.
- **Always re-dispatch timed-out tasks** — their partial files make "skip if output exists" idempotence report success. Check that output is *complete*, not merely present.

## D4. Cap output length inside the prompt

Long reports hit the model's max_tokens, and the result is a **truncated tail** — unclosed JSON, missing conclusion — while the process exits cleanly and looks successful.

Give a hard cap in the prompt ("no more than N lines"). It is far cheaper than retrying after the fact, and it matters most with structured output, where a truncated JSON is simply unparseable.

## D5. Use a work queue, never a barrier

**Keep N tasks in flight and start a replacement the moment any one exits.** Never dispatch in fixed groups and wait for each group to finish.

The cost is arithmetic, not opinion. A queue of N finishes in `total_work / N`; barrier groups of N finish in `Σ max(group)`. With long-tailed runtimes (D3) the max of a group is far above its mean, so one straggler idles the other N−1 slots for its whole runtime. Measure the gap on any batch by comparing summed task durations against elapsed wall-clock — a healthy queue lands near `work / N`. **The concurrency number is rarely the problem; the barrier is.**

Concurrency sizing: these are **network-bound API calls, not CPU-bound local work**, so core count is the wrong input. Size against the provider's rate limit.

**Never infer a rate limit by grepping raw output.** Searching for `429|rate limit|quota` matches report *content* — a turn number, a session ID containing those digits, the word quota in prose — and yields confident false alarms. Read the actual error records instead.

This generalises: **any search over material that discusses the thing being searched for returns false positives**, and the failure looks like a finding rather than a bug. It applies equally to auditing isolation and to detecting network faults.

Implementation note: `wait -n` gives a work queue in bash ≥4.3, but macOS ships bash 3.2. `xargs -P N -n 1 <worker-script>` is a genuine work queue everywhere and avoids `export -f` (which also breaks on multibyte arguments — see the appendix).

- **Each worker gets only its own input**, never another worker's conclusions — cross-contamination within a batch is the main distortion source for analysis tasks (same requirement as Stage 2 §2A).
- Where leakage matters, make isolation **structural**: put only the readable material in the worker's working directory and make everything else physically unreachable. Symlinks escape via `../`, so use real copies. For how to verify isolation afterwards, see stage4 §4B.

## D6. Comparability: reuse one instruction across configurations

To compare two batches (A/B, same-input rerun), the **scoring instruction, schema, and sample set must be reused verbatim**. Change one word and the two numbers stop being comparable — and that distortion raises no error, it just quietly becomes a false conclusion.

Store the instruction in a file and point every configuration at the same path; do not let each configuration carry its own copy.

## Appendix · Grok CLI

```bash
grok --prompt-file <absolute-path> --cwd <workdir> \
     --permission-mode bypassPermissions \
     --json-schema "$(cat schema.json)" \
     --disable-web-search --max-turns 60 > out.raw 2>&1
```

- **Never pass a long or non-ASCII prompt via `-p <prompt>`.** Multibyte argv gets truncated in transit and surfaces as a Rust-side `Abort trap: 6` whose message has nothing to do with the real cause (observed: argument values containing fragments like `\x80\x82`). **Always use `--prompt-file`.**
- **`--prompt-file` resolves relative to `--cwd`**, not to the invoking shell's directory. **Pass an absolute path**, or you get "file not found" while staring right at the file.
- **`--output-format json` returns a nested result**, sometimes re-stringified one extra level. Parse by recursive descent (cap at depth 6) and attempt `JSON.parse` on string values; do not read a fixed field path. Constraining output with `--json-schema` is more reliable than parsing after the fact.
- **Mind the locale** when post-processing output in the dispatch script: `tr` and `sed` under the C locale hit `Illegal byte sequence` on UTF-8 and destroy the diagnostic message, which ends your error triage right there. Truncate bytes with `head -c` before handing text to UTF-8-safe tools, or just read the raw file.
- A network outage shows up as **a batch of FAILs**, not as vanished processes. The dispatch loop keeps launching new tasks, so "processes are still running" does not mean "nothing failed" — the only valid check is reconciling artifacts one by one.
