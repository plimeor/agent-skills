# Findings — the evidence ledger

**Append-only.** Entries are never rewritten or deleted: a measurement taken in the past stays true about the sample it was taken on, even after the rule it supported changes.

Procedure documents state rules and at most one clause of reasoning. The measurement behind a rule lives here, joined on the topic heading — no anchors, no ID numbers. To check why a rule exists, search this file for its topic.

Every entry states **what was measured, on what sample, and the number**. An entry with no sample size is not a finding.

---

## Tool arguments and results carry no persona signal

Sample: 329 cleaned sessions, 131 signal files, 1397 quotes of ≥8 characters.

- Tool call arguments plus tool results were **83.5%** of all cleaned bytes (26.5 MB results + 8.1 MB arguments of 41.4 MB). User speech was 8.4%.
- Tracing every signal quote back to its source record type: **1001 came from user turns, 28 from assistant text, 0 from tool arguments or results.** 368 did not match verbatim (rewritten or stitched across turns).
- Within a tool-call record, arguments are 67.8% of the bytes; the tool name is 17.2%.
- Tool *names* do appear in signals: `subagent` in 13.7% of signal files, other tool names in under 1%.

Effect of moving arguments and results out of `cleaned/`: one representative session went 31.5 KB → 6.7 KB. Corpus-wide the analysis set became **3.1× the sessions at 60% of the bytes** (131 sessions / 41.4 MB → ~412 sessions / ~25 MB).

## Name-based project exclusion was redundant

Sample: 250 sessions, no `excludeProjectPatterns` configured at all.

158 of them came from an unrelated tool's temporary workdir. **Zero reached the analysis set** — 154 dropped as low-intervention, the rest as empty, thin, or self-referential. Behavior-based filters had already done the job the name-based exclusion was written for.

Their intervention profile was 0% high / 1% medium / 98% low, which is also why including them shifts a whole-corpus distribution while changing nothing about the analysis set.

## The thin-session cut is bimodal, so its exact value barely matters

Sample: 258 sessions, measured on user text bytes after tool content was moved out.

Median user text 378 bytes, p75 796, p90 23,410. Raising the cut from 2 KB to 10 KB changes the kept set by 5 sessions (19% → 17%). The corpus separates into trivial and substantive with almost nothing between, so any value in that band behaves the same — which is also why the cut is off by default rather than tuned.

## Harness content arrives through the user channel

Sample: 532 transcripts; one session inspected turn by turn.

- Of 48 apparent user turns in one session, **17 were harness**: background task notifications, injected skill bodies, bare slash commands, command tags.
- Injected skill bodies (`Base directory for this skill:`) appeared as user turns in **37 sessions**; all 76 occurrences began with that exact prefix, so a prefix match covers every observed shape.
- A prompt-rewriting hook produced **349 user turns** that read exactly like user speech. All were confined to that tool's own workdir; **0 leaked into real project sessions.**

Per the Claude Code hook contract, `hookSpecificOutput.additionalContext` is wrapped in a `<system-reminder>` and is therefore already stripped, but `UserPromptSubmit`, `UserPromptExpansion`, `SessionStart` and `Setup` inject raw stdout with **no marker at all**.

## Repeated openings detect injection, but not cleanly enough to auto-drop

Sample: 532 transcripts, user turns of ≥60 characters, first 120 characters normalized.

36 openings recurred verbatim across ≥3 sessions. The top classes were all machine-generated: hook stdout (325 sessions), command echoes, injected skill bodies, compaction hand-off text.

At the ≥3 threshold the tail contained **one genuine user turn**, re-sent across retried sessions. That single false positive is why the detector reports and never drops.

## Feedback detection was missing most corrections

Sample: one session that was almost entirely Owner corrections, 31 real user turns after harness removal; precision checked on 300 sessions.

- The original pattern set, which required a corrective phrase and capped feedback at 80 characters, recognised **21%** of them.
- Recognising four shapes — rulings and option selection, corrections and negations, imperative directives, challenges — raised recall to **81%**. The two remaining misses were statements, not corrections.
- A `length < 2` guard was discarding single-character rulings (`b`, `跑`), which are the shortest Owner input and often the most decisive.
- Precision held: median feedback/user ratio **0.50**, and only **3 of 65** sessions with ≥3 user turns saturated at 1.0.
- Intervention distribution excluding the unrelated tool's workdir: **21% / 53% / 24%** against the previous run's 19% / 51% / 29%. The small shift toward higher intervention is the recall gain.

## Barrier dispatch wastes half the slot time

Sample: 95 scoring tasks dispatched in fixed groups of 8.

| | |
|---|---|
| Total work | 656 min |
| Ideal wall-clock at 8-way saturation | 82 min |
| Actual wall-clock with barriers | 167 min |
| Slot-time idle | **51%** |

One 3902-second task held seven slots idle for 65 minutes. The concurrency number was not the problem; the barrier was.

Resource ceiling on the same batch: ~59 MB resident per process, **zero rate-limit errors at 8-way**. Local resources and provider limits were both far from binding.

## Grepping raw output for rate limits produced only false positives

Sample: 144 scoring outputs searched for `429|rate limit|quota`.

8 apparent hits, **all report body text** — a turn number `[423]`, a session ID containing `4296`, the phrase "quota fact". Not one real rate-limit error. The same failure mode appeared twice more: a search for `ECONNRESET` matched a report discussing an environment fault, and an isolation audit that grepped log bodies for path-like strings returned **14/14 alarms, all false**, because the material being read contained those words itself.

## Dispatch failure types and their frequencies

Sample: 144 scoring tasks.

- Typical runtime 6–10 min; tail past 40 min; worst observed **3902 s** (server-side idle timeout after 3600 s with 476 K input tokens).
- A 20-minute cap killed 3 tasks mid-write, leaving partial files that idempotence then read as success.
- A 600-line output cap still hit `max_tokens_truncation` on 3 of 144.
- 3 tasks returned a complete structured payload but never wrote their report file — recorded as failures by a check anchored on the file rather than the payload.

## Evaluation noise floor

Sample: same `roles.md`, same 14 sessions, run twice.

14 sessions produce roughly **30 escalation points**, and two runs over identical input differed by **7–10 percentage points**. No difference below that is readable in either direction, including "the change did nothing". Reaching a resolution that separates a real effect required 72 sessions (~250 escalation points).

## Deliverable hygiene is not maintainable by memory

Sample: one finished `roles.md` set, checked mechanically after being written and reviewed by hand.

13 rule violations plus 63 quotes with no matching provenance row. Among them: patch-style parentheticals hung on a heading, 4 dangling section references left by an artifact split, and 6 subsections whose numbers did not match their parent.

Separately, in one real run the "coverage and limitations" section reached **21% of the file** — larger than every role definition combined — which is what motivated splitting the deliverable by reader.
