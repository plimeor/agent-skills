---
name: agent-role-mining
description: Reverse-engineer a user's implicit roles and decision persona from local Claude Code / Grok session history, running the full five-stage pipeline (discover → clean+filter → signal extraction → role inference → replay validation) to produce a roles.md for multi-agent deployment. Use when the user mentions role mining, "角色挖掘", reverse-engineering their own roles or decision persona, generating or updating roles.md from session data, re-running or replaying the agent-analysis pipeline, or analyzing their own session history to distill working patterns; also use for short asks like "rerun the analysis", "重新跑一遍分析", or "update the roles with the latest sessions".
---

# Agent Role Mining

Reverse-engineer a user's role division and decision persona from real session behavior: people struggle to enumerate the roles they occupy, but session history records what they initiated, how they corrected agents, and what they insist on ruling personally. Tool arguments and results carry almost no persona information — the pipeline moves them out of the analysed trajectory and preserves the user's own words in full.

The final deliverable is a two-layer `roles.md`: Part 1 data-faithful raw roles + Part 2 reusable cross-domain generic roles.

## Prerequisites

- Requires `bun` (scripts have zero third-party dependencies).
- Source data is read-only: `~/.claude/projects/` and `~/.grok/sessions/` are never written to. All artifacts land inside the run directory.
- A full round is heavy work (Stages 2/3/4 are large amounts of LLM work). Tell the user the expected scale up front (session count × extraction cost); batch large extractions across subagents.
- Tool arguments and results are kept out of the analysed trajectory (Stage 1), so the analysis set runs several times more sessions at a fraction of the bytes: measured, 3.1× the sessions at 60% of the corpus size.
- Artifacts are written in the corpus's own language; quoted user speech is never translated.

## Run directory and reproducibility contract

```
<workdir>/runs/<stamp>-<label>/
├── config.json          # snapshot of every parameter; changing a parameter = a new run
├── inventory/           # discovery list, exclusion audit (every drop has a reason), funnel-preview.md, injected-turns.md, stats.json, lint-roles.json
├── cleaned/             # Stage 1 trajectories (all main sessions, including filtered-out ones, for auditability)
├── tool-details/        # tool arguments and results, one .jsonl per session — queryable, out of the way
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

The default config ships **one** preset filter: corpus self-reference (this pipeline's own artifact names), which is universal because it is about the pipeline, not about the user. Everything else is empty or off by default and gets settled with the user in Stage 0.5.

### Stage 0.5 — Settle the funnel with the user (mandatory, interactive)

**Filter conditions are a property of this person's machine and habits, not of the pipeline.** Hardcoding one user's exclusions into the skill makes it silently ineffective for everyone else. So the funnel is agreed with the user before any analysis, and confirmed against real samples afterwards.

1. Run `discover`, then show the user the project list with session counts.
2. Ask which projects are irrelevant to their working identity (throwaway tooling, unrelated experiments, sessions that are really another tool's scratch space) → write them into `excludeProjectPatterns`.
3. **Do not filter by topic or theme.** A person's roles outside coding are part of the answer, not noise — filtering by theme cuts exactly the evidence that shows how their judgment generalizes. There is no theme whitelist in this pipeline by design.
4. **Do not filter by size.** With tool arguments and results moved out of `cleaned/` (see Stage 1), the analysis set is small enough that a size cut only risks dropping a short session that ruled on something important. `minUserTextBytes` exists as a knob and defaults to off.

What remains is behavior-based and stays: empty sessions, self-referential sessions, and low-intervention sessions (which become the delegation census, not a discard).

**Name-based exclusions are usually redundant — check before adding them.** Measured on a real corpus: 158 sessions from an unrelated tool's workdir, with no project exclusion configured at all, were dropped anyway — 154 by low intervention, the rest as empty, thin, or self-referential. **Zero survived into the analysis set.** Behavior-based filters had already done the job the name-based exclusion was written for.

### Stage 1 — Discover, clean, filter

```bash
bun scripts/pipeline.ts discover --run <run>
bun scripts/pipeline.ts normalize --run <run>          # full sweep; supports --only/--limit/--skip-existing
bun scripts/pipeline.ts filter --run <run>
```

- Main-session definition: Claude = `<project>/<uuid>.jsonl` (excluding `agent-*.jsonl` and `subagents/`); Grok = `session_kind ∉ {subagent, subagent_resume}`.
- **Tool arguments and results do not go into `cleaned/`.** The trajectory keeps the tool *name* and turn number; arguments and results are written to `tool-details/<session>.jsonl` and queried on demand:
  ```bash
  bun scripts/pipeline.ts tool-detail --run <run> --file <cleaned.md> [--turn N] [--grep S]
  ```
  Measured on a 329-session corpus: tool arguments and results were **83.5% of all cleaned bytes and the source of 0 of 1397 signal quotes**. Tool *names* do carry a real pattern (dispatching an independent subagent to re-check) and stay. Effect on one representative session: 31.5 KB → 6.7 KB.
- **Hook output is the one contamination the pipeline cannot fully detect.** Per the Claude Code hook contract, `hookSpecificOutput.additionalContext` is wrapped in a `<system-reminder>` — normalize strips those, so that path is covered. But **`UserPromptSubmit`, `UserPromptExpansion`, `SessionStart` and `Setup` inject raw stdout as context with no marker at all**, structurally identical to the user speaking. Two defences:
  - Content with a fixed harness signature is dropped outright: slash-command tags, local-command output and caveats, injected skill bodies (`Base directory for this skill:`), compaction hand-off text. Measured on a real corpus, injected skill bodies alone were counted as user turns in 37 sessions.
  - Everything else is caught statistically: an opening that repeats **verbatim across ≥3 sessions** is machine-generated. `filter` writes these to `inventory/injected-turns.md` and `preview` surfaces the count. **They are never dropped automatically** — a genuine user turn re-sent across retried sessions has been observed in that table, so the call belongs to the user. On the reference corpus this caught a prompt-rewriting hook that had produced 349 turns that read exactly like user speech.
- **Feedback turns are detected by intent, not length.** A user turn counts as feedback pressure when the prose it contains is corrective or directive, with **no character cap** — capping it discards exactly the most substantive corrections, which tend to be the longest. Pasted material is stripped first (fenced code, indented blocks, log runs, verbatim spec documents) so a long paste is not mistaken for engagement. Four shapes are recognised: rulings and option selection (**including single-character turns** — the shortest Owner input is often the strongest), corrections and negations, imperative directives, and challenges. Measured against a session that was almost entirely corrections, recall went from 21% to 81%; corpus-wide the metric still discriminates (median feedback/user ratio 0.50, only 3 of 65 sessions saturate at 1.0). This count feeds the intervention level, which drives the whole funnel.
- **Corpus self-reference filtering**: if sessions where the user designed or evaluated this very pipeline enter the analysis set, the pipeline rediscovers its own framework **inside its own prior output** — part of the clustered roles then comes from the user's existing thinking about roles in the corpus, rather than being discovered from behavior. `filter` detects this automatically (default: ≥2 distinct marker types → dropped, reason=`self-referential`) and writes **every session with ≥1 hit** into `inventory/self-referential.md`. **Sessions hitting below threshold remain in the analysis set** — if Stage 3 conclusions look like a restatement of a framework already present in the corpus, come back to this table first. Detection lives in `filter` rather than `normalize`, so an existing run only needs `filter` re-run after a config change.
- Afterwards run `stats` to reconcile the funnel numbers, and spot-check 2–3 cleaned files for cleaning quality (user's words intact, noise stripped).

**Then show the user the funnel and get explicit confirmation before Stage 2:**

```bash
bun scripts/pipeline.ts preview --run <run> [--n 4]
```

`preview` prints the active filter settings plus **real session summaries** — a sample of what was kept and, for every drop reason separately, a sample of what was dropped, each with its opening user turn. The user reads it and confirms that the kept set is worth analyzing and that nothing valuable was dropped. Adjust `config.json` and re-run `filter` until it looks right. **Thresholds changed after Stage 2 mean a new run**, so this gate is where it is cheap to be wrong.

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
