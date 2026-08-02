---
name: agent-role-mining
description: Reverse-engineer a user's implicit roles and decision persona from local Claude Code / Grok session history, running the full five-stage pipeline (discover → clean+filter → signal extraction → role inference → replay validation) to produce a roles.md for multi-agent deployment. Use when the user mentions role mining, "角色挖掘", reverse-engineering their own roles or decision persona, generating or updating roles.md from session data, re-running or replaying the agent-analysis pipeline, or analyzing their own session history to distill working patterns; also use for short asks like "rerun the analysis", "重新跑一遍分析", or "update the roles with the latest sessions".
---

# Agent Role Mining

Reverse-engineer a user's role division and decision persona from real session behavior: people struggle to enumerate the roles they occupy, but session history records what they initiated, how they corrected agents, and what they insist on ruling personally. Tool stdout and full file contents carry almost no persona information — the pipeline compresses them heavily and preserves the user's own words in full.

The final deliverable is a two-layer `roles.md`: Part 1 data-faithful raw roles + Part 2 reusable cross-domain generic roles.

## Prerequisites

- Requires `bun` (scripts have zero third-party dependencies).
- Source data is read-only: `~/.claude/projects/` and `~/.grok/sessions/` are never written to. All artifacts land inside the run directory.
- A full round is heavy work (Stages 2/3/4 are large amounts of LLM work). Tell the user the expected scale up front (session count × extraction cost); batch large extractions across subagents.
- Artifacts are written in the corpus's own language; quoted user speech is never translated.

## Run directory and reproducibility contract

```
<workdir>/runs/<stamp>-<label>/
├── config.json          # snapshot of every parameter; changing a parameter = a new run
├── inventory/           # discovery list, exclusion audit (every drop has a reason), themes.json, stats.json, lint-roles.json
├── cleaned/             # Stage 1 trajectories (all main sessions, including filtered-out ones, for auditability)
├── manifest.md          # funnel results + kept list
├── user-turns/          # per-session user-turn extraction (for Stage 4 replay + open-schema control)
├── census/              # delegation census (excluded low-intervention sessions)
├── signals/             # Stage 2 signals (_open-schema/ is the control group)
├── signals-manifest.md
├── roles.md             # Stage 3 deliverable (+ roles-method.md, roles-evidence.md)
└── validation/          # Stage 4 replay results
```

Reproducibility comes from: the config snapshot, deterministic ordering and seeded sampling, a full audit trail of drops, and idempotent scripts (re-running overwrites same-named artifacts; `--skip-existing` supports resumption). Comparing two rounds means comparing two run directories.

## Pipeline

Scripts are always invoked as `bun <skill>/scripts/pipeline.ts <cmd> --run <runDir>`.

### Stage 0 — Initialize

```bash
bun scripts/pipeline.ts init --label <name>   # prints the run directory
```

`workdir` defaults to `<cwd>/.artifacts/agent-role-mining/` (created if absent); pass `--workdir` only when the user named a location. After this first step, tell the user the run directory path.

The default config excludes the `english-coach` project, drops low-intervention sessions, whitelists mid-intervention themes `review/bugfix/migration/i18n-docs`, requires cleaned ≥20KB, and **enables corpus self-reference filtering**. If the user's domain differs, edit `config.json` before continuing — the thresholds are heuristics, not truths.

### Stage 1 — Discover, clean, filter

```bash
bun scripts/pipeline.ts discover --run <run>
bun scripts/pipeline.ts normalize --run <run>          # full sweep; supports --only/--limit/--skip-existing
bun scripts/pipeline.ts filter --run <run>
```

- Main-session definition: Claude = `<project>/<uuid>.jsonl` (excluding `agent-*.jsonl` and `subagents/`); Grok = `session_kind ∉ {subagent, subagent_resume}`.
- If `filter` leaves any `pending-theme`: read `inventory/pending-themes.md`, read each cleaned file to judge its theme, write the results into `inventory/themes.json` (dropped sessions get their real theme name too, so the audit stays readable), then re-run `filter`. Theme bucketing needs judgment — this step is agent work, not script work.
- **Corpus self-reference filtering**: if sessions where the user designed or evaluated this very pipeline enter the analysis set, the pipeline rediscovers its own framework **inside its own prior output** — part of the clustered roles then comes from the user's existing thinking about roles in the corpus, rather than being discovered from behavior. `filter` detects this automatically (default: ≥2 distinct marker types → dropped, reason=`self-referential`) and writes **every session with ≥1 hit** into `inventory/self-referential.md`. **Sessions hitting below threshold remain in the analysis set** — if Stage 3 conclusions look like a restatement of a framework already present in the corpus, come back to this table first. Detection lives in `filter` rather than `normalize`, so an existing run only needs `filter` re-run after a config change.
- Afterwards run `stats` to reconcile the funnel numbers, and spot-check 2–3 cleaned files for cleaning quality (user's words intact, noise stripped).

### Stage 1.5 — Delegation census + user-turn extraction

```bash
bun scripts/pipeline.ts user-turns --run <run>
```

The low-intervention sessions the funnel discarded are positive evidence of what can already be safely delegated; looking only at friction material biases the role definitions toward control. Annotate `census/census-list.json` per `references/stage2-signals.md` §2C → `census/census.md`.

### Stage 2 — Signal extraction

Read `references/stage2-signals.md` and produce a signal file per kept session using its template. Three hard requirements:

1. Key interactions must quote the user verbatim with turn numbers (traceable back to `cleaned/`).
2. Run the open-schema control group (§2B, `sample --n 15 --seed 42`) — preset-frame extraction is circular, and the control measures that bias.
3. Coverage must be complete: `signalsWritten` from `stats` equals the kept count.

Batch dispatch mechanics — timeouts, success criteria, failure typing, re-dispatch — are in `references/dispatch.md`. Reading it before dispatching is cheaper than rediscovering it: every trap there was hit in a real run and cost 15–40 minutes each.

### Stage 3 — Role inference

Read `references/stage3-roles.md` and produce the two-layer `roles.md`. Four things that cannot be skipped:

- **Residual accounting**: every high-value signal either enters a role or enters the residual list; silently discarding non-conforming samples from a descriptive conclusion is a fidelity defect.
- **Phase type**: label each role batch or dialogic — design functions are dialogic, where the goal is per-turn quality rather than fewer turns.
- **The Owner sits outside the system**; naming and layering are Owner rulings (L5) and must not be described as "proven by the data".
- **Run `lint-roles` before delivery** (§3F). The deliverable-hygiene rules are exactly the class an LLM drops; a non-zero exit means the work isn't finished.

```bash
bun scripts/pipeline.ts lint-roles --run <run>
```

### Stage 4 — Replay validation

Read `references/stage4-replay.md`. Replay the role pipeline from the INITIAL turns of real sessions (the replay agent must not see the real subsequent turns), measuring escalation accuracy, friction prevented, and participation-density reduction; write conclusions back to `roles.md`. A `roles.md` with no replay must say "not replay-tested" in its limitations.

**Sizing depends on the question**: ≥5 sessions is enough for a descriptive replay, but a **comparative (A/B) replay needs ≥100 escalation points** — at ~30 points the measured noise floor is 7–10 percentage points and no difference smaller than that is readable in either direction.

## Iteration

- After new sessions accumulate: same config, new run → full pipeline → compare the two rounds' `roles.md` and `validation/summary.md`. Roles should stabilize; repeated drift means the clustering is overfitting to the batch.
- To revise only Stage 3 conclusions: reuse the old run's signals and redo Stages 3/4.
- To change filter thresholds: a new run is mandatory (config is a snapshot), and the funnel difference must be noted in the conclusions.

## Honesty clause

Value and intervention labels at every stage are heuristics, not ground truth; keep that wording in the manifest and in `roles.md`. What was covered and what was not gets written honestly into the artifacts — this skill's output is used to configure agents that act on the user's behalf, and inflated completeness turns directly into an overreaching agent.
