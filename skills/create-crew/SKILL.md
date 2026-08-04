---
name: create-crew
description: Build a deployable crew skill from local Claude Code / Grok session history (discover → clean → signals → role inference → boundary validation). Run live-LLM evals from evals/evals.json, including against an already-installed crew when the user asks. Use when creating or refreshing a crew, mining judgment roles, "角色挖掘", "生成 crew", or "用安装的 crew 做 evals". Near miss: not agent-team; not merely invoking crew for a normal work task.
---

# Create Crew

## Problem

People cannot reliably list the judgment roles they occupy. Their agent session history already records what they started, what they corrected, and what they insisted on ruling themselves. That history is the evidence. The job is to turn it into a **crew** the user can summon later: a small set of roles with triggers and boundaries, ready to field as one or more workers under a single lead.

## Product split

| Skill | Job |
|---|---|
| **create-crew** (this skill) | Read history; write a crew package into a run directory |
| **crew** (output package) | User-invoked roster: route, field roles, keep Owner boundaries |
| **agent-team** (other skill) | Generic multi-agent orchestration for one task — not a personal roster |

create-crew never *is* the crew. It only *builds* the crew package (`name: crew` inside `skill/`).

Harness choice at invoke time (Orca vs portable dispatch, handoff vs supervised fielding) belongs in the **crew package** (`runtimes.md`), not in this product table.

## Principles

1. **Judgment travels; runtimes do not.** Portable content is who judges what, when a role engages, and what stays with the Owner. How workers are spawned is a harness property encoded in `runtimes.md`, not a success metric for mining quality.
2. **Summon a crew, not paste a treatise.** The mount object is a complete skill directory. Index and routing load first; each role Spec loads on demand; fielding loads from `runtimes.md`.
3. **One routing authority; closed Role index.** After the user invokes crew, the **main session** chooses roles and fields workers. Only Role index ids may be fielded — never invented seats. Role workers execute one Spec. They do not open a role tree.
4. **Two evidence poles for boundaries.** Friction sessions show what the Owner seizes (escalate). Census sessions show what the Owner already releases (absorb). Both poles bind Stage 3.
5. **Roster seats are earned.** A role is a battle-tested judgment pattern with a deep lead-facing interface (see `references/stage3-roles.md`). Corpus coverage is residual-complete; the Role index stays small. High-value signals do not mint roles by themselves.
6. **Write only inside the run.** The pipeline does not install into the user's live skills path. The user mounts `skill/` themselves.
7. **Incomplete is incomplete.** Package and validation claims that do not meet the contracts stay unfinished. There is no mechanical lint gate.

## Success

A run is complete when all hold:

1. **`skill/SKILL.md`** exists with `name: crew`, **Routing**, **Role index**, **Evaluation combos**, a **Runtime** pointer to `runtimes.md`, and load instructions — routing surface only, carrying no absorb/escalate semantics and no Known limits block.
2. **`skill/runtimes.md`** exists with **Select** (including the Orca probe), **Orca**, and **Portable** branches — both branches always present. Base content from `references/runtimes-template.md`.
3. **`skill/roles/<id>.md`** exists for every index row, each with Responsibility, Trigger, Absorbs, Escalates, Phase, Success, Worker contract. Role files stay free of harness commands.
4. **Dual-source boundaries** and pipeline limits (sample size, Stage 4 status) are recorded in `roles-method.md`. Census is not optional color when it has repeated task types.
5. **Evaluation combos** name multi-role fieldings when the corpus supports multi-angle work.
6. **Every high-value signal** is accounted for as an elevated-role example, a fold into an elevated role, an `out-of-package` global-rules recommendation, or the residual table — and every Role index entry has passed Stage 3 elevation (battle ≥5 with sprint merges, pattern, deep module) recorded in `roles-method.md`.
7. **Critical quotes** live in run-level `roles-evidence.md` (not in mount `skill/**`).
8. **Boundary validation** (Stage 4 primary path) has run, or `roles-method.md` states that it has not.

Not required for success: Orca installed or online; multi-agent dialogue in one session; nested orchestrator sub-agents; auto-mount; a deployment CLI; a lint script exit code.

## Run layout

```
<runDir>/
├── config.json
├── inventory/
├── cleaned/
├── tool-details/
├── manifest.md
├── user-turns/
├── census/
├── signals/
├── validation/
├── roles-method.md       # audit
├── roles-evidence.md     # provenance
└── skill/                # deployable crew (source of truth for mount)
    ├── SKILL.md          # judgment: Owner, Routing, index, combos
    ├── runtimes.md       # fielding: Select + Orca + Portable
    ├── roles/
    │   └── <role-id>.md
    └── references/       # optional depth; no new boundary axes
```

## Crew fielding (encoded in the package)

Judgment lives in `SKILL.md` and `roles/`. Fielding lives in `runtimes.md`.

| Actor | Does | Does not |
|---|---|---|
| Main session (user invoked crew) | Run Select; route **only** Role index ids; field 1..N roles under the active branch; run evaluation combos; synthesize | Hand routing to a child; invent role ids |
| Role worker | Execute one Spec; request lead help only under the active runtime rules | Spawn roles; re-route; invent seats or Owner boundaries |
| Owner (human) | Irreversible preference, scope, public form, sign-off | — |

**Select** (in `runtimes.md`): run `orca status --json`; if Orca is installed and ready → **Orca** branch; otherwise → **Portable** branch.

create-crew does not run that probe when building the package. Both branches are always written.

## Prerequisites

- `bun`, zero third-party deps in scripts.
- Read-only sources: `~/.claude/projects/`, `~/.grok/sessions/`.
- Stages 2–4 are large LLM work; state scale before starting.
- Write in the corpus language. Never translate quoted user speech.
- Pipeline execution does not require Orca.

## Pipeline

```bash
bun <create-crew>/scripts/pipeline.ts <cmd> --run <runDir>
```

| Stage | Commands | Detail |
|---|---|---|
| 0 | `init --label <name>` | Run dir + empty `skill/` |
| 1 | `discover` `normalize` `filter` `preview` | Below |
| 1.5 | `user-turns` | Census list + user turns |
| 2 | signal extraction batches | `references/stage2-signals.md` |
| 3 | write `skill/` (including `runtimes.md`) + method/evidence | `references/stage3-roles.md`, `references/runtimes-template.md` |
| 4 | boundary validation | `references/stage4-replay.md` |

Batch LLM rules for pipeline workers: `references/dispatch.md` (Stage 2/4 batching — not the crew Portable fielding protocol).

## Evals

Quality evals match skill-creator: **live agents** grade real outputs. Prep never passes quality. Protocol: `evals/EVALS.md`.

**Primary package eval is Spec blind predict/score.** It does **not** run Orca or execute `runtimes.md` Select. Optional harness stress is separate (see EVALS.md).

When the user asks to eval create-crew or an **installed crew** (“用当前安装的 crew 跑 evals”):

1. Open `evals/evals.json` and run the relevant cases with a live agent that has this skill.
2. For installed-crew cases, resolve a directory whose `SKILL.md` has `name: crew` (`~/.agents/skills/crew`, `--crew-path`, etc.). If missing, stop — do not invent a green report.
3. For package behaviour on real sessions:

```bash
# Prep: discover path, or reuse a create-crew run with seeded sampling
bun scripts/prep-crew-eval.ts --crew-path <crew> --n 5 --workdir <out>
bun scripts/prep-crew-eval.ts --crew-path <crew> --from-run <runDir> --fraction 0.5 --seed 42 --workdir <out>

# Live LLM (Grok CLI batch; idempotent; no Orca)
bun scripts/run-crew-eval-llm.ts --workdir <out> --phase predict --jobs 6
bun scripts/run-crew-eval-llm.ts --workdir <out> --phase score --jobs 6

bun scripts/aggregate-crew-eval.ts --workdir <out>
```

4. Report expectation grades and/or aggregate metrics. Never treat package hygiene or prep success as the eval.

### Stage 1 rules

- Main sessions only (Claude: top-level jsonl, not `agent-*` / `subagents/`; Grok: not subagent kinds).
- Tool arguments and results stay in `tool-details/`; cleaned trajectories keep tool name + turn only.
- Strip harness injection on the user channel; list repeated openings in `inventory/injected-turns.md`.
- Judge feedback by intent after stripping pastes.
- Drop sessions that invoke or polish create-crew (marker `create-crew`; see `config.json` `filter.selfReference`); list hits in `inventory/self-referential.md`.
- Default filters are behavioural only: no topic filter, no size floor, no project-name exclusion.

Before Stage 2:

```bash
bun scripts/pipeline.ts stats --run <run>
bun scripts/pipeline.ts preview --run <run>
```

Escalate only for ambiguous injections, non-behavioural drops, or user-requested project exclusions.

## Non-negotiables

1. Signal coverage equals kept count (reconciled, not estimated).
2. Every critical quote is traceable in run-level `roles-evidence.md` (not on the mount surface).
3. Residual accounting is complete; residual is successful coverage when elevation fails, not a Stage 3 defect.
4. No Role index entry without Stage 3 elevation (battle-tested with sprint-merged counts, pattern, deep module). No open execution-registry roles.
5. Owner stays outside the agent system; Owner ownership is recorded in role Escalates.
6. Validity claims require Stage 4 primary path (or explicit "not run" in `roles-method.md`).
7. Deliverable is a complete `skill/` package including `runtimes.md`; no auto-mount. No Known limits in mount `SKILL.md`.
8. Fielding protocol lives only in `runtimes.md`; role Specs stay harness-agnostic.

## Iteration

- New sessions → new run → full pipeline → compare `skill/` packages and validation summaries.
- Revise conclusions only → reuse signals → redo Stages 3–4 (refresh `runtimes.md` from template if the fielding contract changed).
- Change filter thresholds → new run; state funnel delta in method.

## Honesty

Value and intervention labels are heuristics. Name coverage gaps. Overstated completeness produces an overreaching crew.

## Document maintenance

| Doc | Mode |
|---|---|
| `SKILL.md` | Rewrite in place |
| `references/*`, `evals/*` | Rewrite in place |
| Script defaults | One place |
| Run directory | Per run |

Instructions describe the target system only. No revision history in prose. No single-machine measurements as portable constants.
