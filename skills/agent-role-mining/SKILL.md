---
name: agent-role-mining
description: Reverse-engineer a user's implicit roles and decision persona from local Claude Code / Grok session history, running the full five-stage pipeline (discover → clean+filter → signal extraction → role inference → replay validation) to produce a roles.md for multi-agent deployment. Use when the user mentions role mining, "角色挖掘", reverse-engineering their own roles or decision persona, generating or updating roles.md from session data, re-running or replaying the agent-analysis pipeline, or analyzing their own session history to distill working patterns; also use for short asks like "rerun the analysis", "重新跑一遍分析", or "update the roles with the latest sessions".
---

# Agent Role Mining

People struggle to enumerate the roles they occupy, but their session history records what they initiated, how they corrected agents, and what they insisted on ruling personally. This pipeline reads that history and infers the division of labour and decision persona behind it.

Deliverable: a two-layer `roles.md` — Part 1 data-faithful raw roles, Part 2 reusable cross-domain generic roles — plus `roles-method.md` and `roles-evidence.md`.

## Prerequisites

- Requires `bun`. Scripts have zero third-party dependencies.
- Source data is read-only: `~/.claude/projects/` and `~/.grok/sessions/` are never written to. Everything the pipeline produces lands inside the run directory.
- Stages 2–4 are large amounts of LLM work. Tell the user the expected scale before starting.
- Artifacts are written in the corpus's own language. Quoted user speech is never translated — a translated quote is no longer evidence.

## Run directory

```
<workdir>/runs/<stamp>-<label>/
├── config.json          # every parameter; changing one means a new run
├── inventory/           # discovery, drop audit, funnel-preview.md, injected-turns.md, stats.json, lint-roles.json
├── cleaned/             # trajectories for all main sessions, kept and dropped alike
├── tool-details/        # tool arguments and results, one .jsonl per session
├── manifest.md          # funnel result + kept list
├── user-turns/          # user turns per session
├── census/              # delegation census
├── signals/             # Stage 2 signals; _open-schema/ is the control group
├── roles.md             # Stage 3 deliverable (+ roles-method.md, roles-evidence.md)
└── validation/          # Stage 4 replay results
```

Reproducibility comes from the config snapshot, deterministic ordering and seeded sampling, a full audit trail of every drop, and idempotent scripts. Comparing two rounds means comparing two run directories.

## Stages

Scripts are invoked as `bun <skill>/scripts/pipeline.ts <cmd> --run <runDir>`.

| Stage | Command | Reference |
|---|---|---|
| 0 Initialize | `init --label <name>` | — |
| 1 Discover, clean, filter | `discover`, `normalize`, `filter`, `preview` | below |
| 1.5 Census and user turns | `user-turns` | `stage2-signals.md` §2C |
| 2 Signal extraction | subagent batches | `stage2-signals.md` |
| 3 Role inference | LLM work, then `lint-roles` | `stage3-roles.md` |
| 4 Replay validation | subagent replay, then scoring | `stage4-replay.md` |

Batch dispatch mechanics for Stages 2 and 4 — concurrency, timeouts, failure typing, re-dispatch — are in `dispatch.md`.

### Stage 1 — Discover, clean, filter

- Main sessions only: Claude `<project>/<uuid>.jsonl` excluding `agent-*.jsonl` and `subagents/`; Grok `session_kind ∉ {subagent, subagent_resume}`.
- **Tool arguments and results do not enter `cleaned/`.** The trajectory keeps the tool name and turn number; detail goes to `tool-details/` and is queried on demand with `tool-detail --file <cleaned.md> [--turn N] [--grep S]`. Tool detail carries no persona signal and would otherwise dominate the corpus (`findings.md`).
- **The user channel carries harness content.** Injected skill bodies, task notifications, slash commands and compaction hand-offs are dropped by signature. Hook stdout cannot be identified this way at all — `UserPromptSubmit`, `UserPromptExpansion`, `SessionStart` and `Setup` inject raw text with no marker — so `filter` also flags openings that repeat verbatim across sessions into `inventory/injected-turns.md`.
- **Feedback turns are judged by intent, not length.** Pasted code, logs and specification documents are stripped first; what remains is tested for rulings, corrections, directives and challenges. There is no character cap in either direction — the longest corrections are the most substantive, and the shortest are often the most decisive.
- **Corpus self-reference**: sessions where the user was designing or evaluating this pipeline let it rediscover its own framework inside its own output. `filter` drops them above a threshold and lists every session with any marker hit in `inventory/self-referential.md`. Sessions below the threshold stay in the analysis set — if Stage 3 starts restating a framework already present in the corpus, read that table first.

**The filters are behavioural, and behavioural filters need no configuration.** What survives is decided by what the user did — empty sessions, self-referential sessions, and low-intervention sessions, the last becoming the delegation census rather than a discard. Three exclusions the pipeline deliberately does not make:

- **No topic or theme filter.** A person's work outside coding is part of the answer — it is where you see whether their judgment generalizes.
- **No size floor by default.** A short session can carry a decisive ruling.
- **No name-based project exclusion by default.** It is a property of one machine, not of the pipeline, and behavioural filters usually already drop what it was written for (`findings.md`).

### Verify the funnel before Stage 2

```bash
bun scripts/pipeline.ts stats --run <run>
bun scripts/pipeline.ts preview --run <run>
```

`stats` reconciles the funnel; `preview` prints the active settings plus real session summaries — a sample of what was kept and a separate sample for every drop reason. **Read them yourself and absorb what you can.** Also spot-check 2–3 cleaned files for cleaning quality.

Escalate to the user only when the check surfaces something you cannot resolve:

- `inventory/injected-turns.md` is non-empty and a repeated opening is ambiguous — machine injection and a genuinely re-sent prompt look identical, and only the user knows which (`findings.md`).
- A drop reason appears that is not behavioural, or a kept sample is obviously not this person working.
- The user wants a project excluded that the behavioural filters keep.

Thresholds changed after Stage 2 mean a new run, so this is the last cheap place to be wrong.

## Non-negotiables

Skipping any of these voids the run:

1. **Coverage is reconciled, not estimated.** `signalsWritten` equals the kept count. Failed dispatches are re-sent; "basically all covered" is not a result.
2. **Every quote is traceable.** Signal files quote the user verbatim with a turn number; `roles.md` carries the quote and `roles-evidence.md` carries the provenance.
3. **Residual accounting.** Every high-value signal either enters a role or enters the residual list. Silently dropping non-conforming samples from a descriptive conclusion is a fidelity defect.
4. **The Owner is outside the system.** Irreversible preferences, authority conflicts, scope, public-facing form and sign-off belong to the human. Naming and layering are Owner rulings, never "proven by the data".
5. **`lint-roles` passes before delivery.** Deliverable hygiene is not maintainable by memory (`findings.md`).
6. **Replay before claiming validity.** Until it is replay-tested, a role definition is taxonomy. An unreplayed `roles.md` says so in its known-limits block.

## Iteration

- New sessions accumulated: same config, new run, full pipeline, then compare the two `roles.md` and `validation/summary.md`. Roles should stabilize; repeated drift means the clustering is overfitting to the batch.
- Revising Stage 3 conclusions only: reuse the old run's signals and redo Stages 3–4.
- Changing filter thresholds: a new run is mandatory, and the funnel difference is stated in the conclusions.

## Honesty clause

Value and intervention labels are heuristics, not ground truth, and are described that way in every artifact. What was covered and what was not goes into the output. This pipeline configures agents that act on the user's behalf, and inflated completeness turns directly into an overreaching agent.

## Maintaining this skill

Documents here are separated by **how they change**, not by topic. Mixing the three modes below in one paragraph is what turns a document into a changelog.

| Document | Contains | Change mode |
|---|---|---|
| `SKILL.md` | orientation, stage order, non-negotiables | rewritten in place |
| `references/<stage>.md`, `dispatch.md` | procedure for one stage or one mechanic | rewritten in place |
| `references/findings.md` | measurements | **append-only** |
| `config.json` and script defaults | parameter values | edited in one place |

Rules that follow:

- **Instructions are rewritten, never annotated.** No "formerly X, now Y", no strikethrough, no "(added after replay)". Fix upstream rather than appending a downstream note about upstream.
- **A rule carries at most one clause of reasoning** — enough that a later reader does not optimize it away. The measurement behind it goes to `findings.md`, joined on the topic heading.
- **Numbers live in one place.** Procedure documents name the config key; they do not restate its value. A number appears in prose only when the number *is* the rule and has no key.
- **`findings.md` is append-only.** An entry states what was measured, on what sample, and the number. An entry without a sample size is not a finding, and a past measurement is never edited to match a changed rule.
- **Ask the user only what the user alone can decide.** A check the agent can read and act on is not an approval gate. This is the same escalation-precision rule the pipeline's own output prescribes, applied to the pipeline.
