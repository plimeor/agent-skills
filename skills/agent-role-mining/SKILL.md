---
name: agent-role-mining
description: Reverse-engineer a user's implicit roles and decision persona from local Claude Code / Grok session history, running the pipeline (discover → clean+filter → signal extraction → role inference → boundary validation) to produce a portable roles catalog (role list, triggers, absorb/escalate boundaries) for the user to deploy on whatever harness they use. Use when the user mentions role mining, "角色挖掘", reverse-engineering their own roles or decision persona, generating or updating roles.md from session data, re-running the agent-analysis pipeline, or analyzing their own session history to distill working patterns; also use for short asks like "rerun the analysis", "重新跑一遍分析", or "update the roles with the latest sessions".
---

# Agent Role Mining

People struggle to enumerate the roles they occupy. Their session history already records what they started, how they corrected agents, and what they insisted on ruling themselves. This pipeline reads that history and writes it down as a **portable role catalog**.

## First principles

Three facts fix the design:

1. **The scarce object is judgment, not orchestration.** What transfers across tools is *who does which kind of judgment*, *when that role engages*, and *what must stay with the human*. How many agents sit in one session is a property of the harness, not of the person.
2. **Most harnesses cannot run multi-agent dialogue in one session.** An ideal harness might; this skill must not require it, measure it, or treat it as proof that the catalog is good.
3. **Deployment belongs to the user.** Different people paste into `AGENTS.md`, split skills, run one agent, or wire a custom orchestrator. The skill ships **definitions**; the user picks the **mount point**.

From that:

| This skill produces | This skill does not produce |
|---|---|
| A role list | A harness implementation |
| Trigger and phase signals for each role | A mandatory multi-agent runtime |
| Absorb / escalate-to-Owner boundaries | Proof that a specific tool can host those roles |
| Optional deployment menu (how a human might mount the catalog) | A single "correct" paste target |

## Success criteria

A run is successful when `roles.md` is a catalog a stranger could mount on *their* tools:

1. **Role list** — recurring judgment functions, count set by the data (via residual accounting), not by a target range.
2. **Trigger / definition** — for each role: when it engages (intent, phase signal, or user-visible switch), what it is for, batch vs dialogic.
3. **Boundaries** — what it absorbs alone, what it escalates to the Owner (and, if useful, when another role should take over). Owner stays outside the system.
4. **Boundary validation** — triggers and boundaries have been checked against real sessions (Stage 4 primary path). Until then, known-limits says so.

**Not success criteria:** multi-agent same-session chatter works; a full role pipeline was instantiated; prompt skeletons run under a particular CLI.

Weak substitutes that do **not** satisfy success: a taxonomy without triggers; roles named after repos or pipeline stations; "deploy by running N subagents" as the only usage story; pipeline-replay metrics offered as proof the catalog is valid when boundary check was skipped.

## Deliverable

- `roles.md` — the catalog (and only what a deployer needs to use it)
- `roles-method.md` — method, residuals, limits, validation record
- `roles-evidence.md` — quote → session/turn provenance

Two layers inside `roles.md` (see `stage3-roles.md`): Part 1 corpus-faithful raw roles; Part 2 optional cross-domain generic roles. Progressive disclosure: **boundaries and triggers first**; long skeletons and orchestration hints only if they help a deployer who already has a harness that can use them.

## Deployment (user-owned)

`roles.md` may include a short **deployment menu** — options, not a single recipe:

| Option | When it fits |
|---|---|
| Single agent + shared constraints | Default for almost every current harness |
| One agent, role selected by trigger | Harness or human picks one role definition per task |
| Multiple agents / skills | Only if the user's tools can isolate or route roles |
| Multi-agent dialogue in one session | Ideal harness capability; never assumed or required |

Write *what to mount* (which clauses, which role). Do not write *how a named product must wire tools*. Product-specific steps belong with the user, not in the catalog.

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
└── validation/          # Stage 4 boundary-validation results
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
| 4 Boundary validation | primary path required; optional pipeline stress test | `stage4-replay.md` |

Batch dispatch mechanics for Stages 2 and 4 — concurrency, timeouts, failure typing, re-dispatch — are in `dispatch.md`.

### Stage 1 — Discover, clean, filter

- Main sessions only: Claude `<project>/<uuid>.jsonl` excluding `agent-*.jsonl` and `subagents/`; Grok `session_kind ∉ {subagent, subagent_resume}`.
- **Tool arguments and results do not enter `cleaned/`.** The trajectory keeps the tool name and turn number; detail goes to `tool-details/` and is queried on demand with `tool-detail --file <cleaned.md> [--turn N] [--grep S]`. Tool detail carries no persona signal and otherwise dominates the corpus by an order of magnitude.
- **The user channel carries harness content.** Session-bootstrap dumps (`<user_info>`, IDE `<rules>`, `<agent_skills>`, MCP inventory), injected skill bodies, task notifications, slash commands and compaction hand-offs are dropped by signature. Hook stdout cannot be identified this way at all: per the [hook contract](https://code.claude.com/docs/en/hooks), `additionalContext` arrives wrapped in a `<system-reminder>` and is stripped with the rest, but `UserPromptSubmit`, `UserPromptExpansion`, `SessionStart` and `Setup` add raw stdout as context with no marker. So `filter` also flags openings that repeat verbatim across sessions into `inventory/injected-turns.md` — machine output repeats itself exactly, which is the only signal left.
- **Feedback turns are judged by intent, not length.** Pasted code, logs and specification documents are stripped first; what remains is tested for rulings, corrections, directives and challenges. There is no character cap in either direction — the longest corrections are the most substantive, and the shortest are often the most decisive.
- **Corpus self-reference**: sessions where the user was designing or evaluating this pipeline let it rediscover its own framework inside its own output. `filter` drops them above a threshold and lists every session with any marker hit in `inventory/self-referential.md`. Sessions below the threshold stay in the analysis set — if Stage 3 starts restating a framework already present in the corpus, read that table first.

**The filters are behavioural, and behavioural filters need no configuration.** What survives is decided by what the user did — empty sessions, self-referential sessions, and low-intervention sessions, the last becoming the delegation census rather than a discard. Three exclusions the pipeline deliberately does not make:

- **No topic or theme filter.** A person's work outside coding is part of the answer — it is where you see whether their judgment generalizes.
- **No size floor by default.** A short session can carry a decisive ruling.
- **No name-based project exclusion by default.** It is a property of one machine, not of the pipeline, and behavioural filters usually already drop what it was written for — check before adding one.

### Verify the funnel before Stage 2

```bash
bun scripts/pipeline.ts stats --run <run>
bun scripts/pipeline.ts preview --run <run>
```

`stats` reconciles the funnel; `preview` prints the active settings plus real session summaries — a sample of what was kept and a separate sample for every drop reason. **Read them yourself and absorb what you can.** Also spot-check 2–3 cleaned files for cleaning quality.

Escalate to the user only when the check surfaces something you cannot resolve:

- `inventory/injected-turns.md` is non-empty and a repeated opening is ambiguous — machine injection and a genuinely re-sent prompt are textually identical, and only the user knows which.
- A drop reason appears that is not behavioural, or a kept sample is obviously not this person working.
- The user wants a project excluded that the behavioural filters keep.

Thresholds changed after Stage 2 mean a new run, so this is the last cheap place to be wrong.

## Non-negotiables

Skipping any of these voids the run:

1. **Coverage is reconciled, not estimated.** `signalsWritten` equals the kept count. Failed dispatches are re-sent; "basically all covered" is not a result.
2. **Every quote is traceable.** Signal files quote the user verbatim with a turn number; `roles.md` carries the quote and `roles-evidence.md` carries the provenance.
3. **Residual accounting.** Every high-value signal either enters a role or enters the residual list. Silently dropping non-conforming samples from a descriptive conclusion is a fidelity defect.
4. **The Owner is outside the system.** Irreversible preferences, authority conflicts, scope, public-facing form and sign-off belong to the human. Naming and layering are Owner rulings, never "proven by the data".
5. **`lint-roles` passes before delivery.** Deliverable hygiene is not maintainable by memory — the model that writes a hygiene rule breaks it the same day.
6. **Boundary validation before claiming validity.** Until Stage 4's **primary** path has been run, a role definition is taxonomy. An unvalidated `roles.md` says so in its known-limits block. Optional multi-agent / pipeline stress tests never substitute for the primary path.

## Iteration

- New sessions accumulated: same config, new run, full pipeline, then compare the two `roles.md` and `validation/summary.md`. Roles should stabilize; repeated drift means the clustering is overfitting to the batch.
- Revising Stage 3 conclusions only: reuse the old run's signals and redo Stages 3–4.
- Changing filter thresholds: a new run is mandatory, and the funnel difference is stated in the conclusions.

## Honesty clause

Value and intervention labels are heuristics, not ground truth, and are described that way in every artifact. What was covered and what was not goes into the output. This pipeline produces catalogs that configure agents acting on the user's behalf; inflated completeness turns directly into an overreaching agent.

## Maintaining this skill

Documents here are separated by **how they change**, not by topic. Mixing the three modes below in one paragraph is what turns a document into a changelog.

| Document | Contains | Change mode |
|---|---|---|
| `SKILL.md` | orientation, stage order, non-negotiables | rewritten in place |
| `references/<stage>.md`, `dispatch.md` | procedure for one stage or one mechanic | rewritten in place |
| `config.json` and script defaults | parameter values | edited in one place |
| the run directory | everything measured about a corpus | produced per run |

Rules that follow:

- **Instructions are rewritten, never annotated.** No "formerly X, now Y", no strikethrough, no "(added after replay)". Fix upstream rather than appending a downstream note about upstream.
- **A rule carries at most one clause of reasoning** — enough that a later reader does not optimize it away. A reason transfers to another machine; a measurement does not.
- **No measurements from one machine.** A number observed on one person's corpus does not belong in a portable skill: a later reader takes it for a constant and skips measuring their own. Where a number matters, the procedure says to measure it. Where the history matters, that is what git log is for.
- **Numbers live in one place.** Procedure documents name the config key; they do not restate its value. A number appears in prose only when the number *is* the rule and has no key.
- **Ask the user only what the user alone can decide.** A check the agent can read and act on is not an approval gate. This is the same escalation-precision rule the pipeline's own output prescribes, applied to the pipeline.
