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

## Principles

1. **Judgment travels; runtimes do not.** Portable content is who judges what, when a role engages, and what stays with the Owner. Peer multi-agent chat is a harness property, not a success metric for the package.
2. **Summon a crew, not paste a treatise.** The mount object is a complete skill directory. Index and routing load first; each role Spec loads on demand.
3. **One routing authority.** After the user invokes crew, the **main session** chooses roles and spawns workers. Role workers execute one Spec. They do not open a role tree. Extra non-role help is requested back to the lead through a temp prompt file.
4. **Two evidence poles for boundaries.** Friction sessions show what the Owner seizes (escalate). Census sessions show what the Owner already releases (absorb). Both poles bind Stage 3.
5. **Write only inside the run.** The pipeline does not install into the user's live skills path. The user mounts `skill/` themselves.
6. **Fail closed on hygiene.** Incomplete packages and unvalidated claims are incomplete, not "good enough prose."

## Success

A run is complete when all hold:

1. **`skill/SKILL.md`** exists with `name: crew`, Known limits, Owner constraints, **Routing**, **Role index**, **Evaluation combos**, Worker→Lead dispatch rules, and load instructions.
2. **`skill/roles/<id>.md`** exists for every index row, each with Responsibility, Trigger, Absorbs, Escalates, Phase, Success, Worker contract.
3. **Dual-source boundaries** are recorded in `roles-method.md` (Boundary sources). Census is not optional color when it has repeated task types.
4. **Evaluation combos** name multi-role fieldings when the corpus supports multi-angle work.
5. **Every high-value signal** maps to a role or to the residual list.
6. **Quotes** in the crew package join to `roles-evidence.md`.
7. **`lint-crew` exits 0.**
8. **Boundary validation** (Stage 4 primary path) has run, or Known limits state that it has not.

Not required for success: multi-agent dialogue in one session; nested orchestrator sub-agents; auto-mount; a deployment CLI.

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
    ├── SKILL.md          # name: crew
    ├── roles/
    │   ├── _shared.md    # optional global constraints
    │   └── <role-id>.md
    └── references/       # optional depth; no new boundary axes
```

## Crew runtime (encoded in the package)

| Actor | Does | Does not |
|---|---|---|
| Main session (user invoked crew) | Route; field 1..N roles; run evaluation combos; spawn non-role sub-agents; synthesize | Hand routing to a child |
| Role worker | Execute one Spec; may request lead help via temp file | Spawn roles; re-route |
| Owner (human) | Irreversible preference, scope, public form, sign-off | — |

Dispatch request path (relative to session cwd):

`role-dispatch-requests/<role-id>-<slug>.md`

The lead may refuse. Results return to the lead.

## Prerequisites

- `bun`, zero third-party deps in scripts.
- Read-only sources: `~/.claude/projects/`, `~/.grok/sessions/`.
- Stages 2–4 are large LLM work; state scale before starting.
- Write in the corpus language. Never translate quoted user speech.

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
| 3 | write `skill/` + method/evidence → `lint-crew` | `references/stage3-roles.md` |
| 4 | boundary validation | `references/stage4-replay.md` |

Batch LLM rules: `references/dispatch.md`.

## Evals

Quality evals match skill-creator: **live agents run realistic prompts** from `evals/evals.json`, then grade `expectations` against real outputs. Prep scripts only set up inputs; they never pass quality.

Protocol: `evals/EVALS.md`.

When the user asks to eval create-crew or an **installed crew** (“用当前安装的 crew 跑 evals”):

1. Open `evals/evals.json` and run the relevant cases with a live agent that has this skill.
2. For installed-crew cases, resolve a directory whose `SKILL.md` has `name: crew` (`~/.agents/skills/crew`, `--crew-path`, etc.). If missing, stop — do not invent a green report.
3. For package behaviour on real sessions:  
   `bun scripts/prep-crew-eval.ts --crew-path <crew> --n 5`  
   then live blind predict + live score per unit, then  
   `bun scripts/aggregate-crew-eval.ts --workdir <dir>`.
4. Report expectation grades and/or aggregate metrics. Never treat `lint-crew` as the eval.

### Stage 1 rules

- Main sessions only (Claude: top-level jsonl, not `agent-*` / `subagents/`; Grok: not subagent kinds).
- Tool arguments and results stay in `tool-details/`; cleaned trajectories keep tool name + turn only.
- Strip harness injection on the user channel; list repeated openings in `inventory/injected-turns.md`.
- Judge feedback by intent after stripping pastes.
- Drop self-referential pipeline-design sessions above marker threshold; list hits in `inventory/self-referential.md`.
- Default filters are behavioural only: no topic filter, no size floor, no project-name exclusion.

Before Stage 2:

```bash
bun scripts/pipeline.ts stats --run <run>
bun scripts/pipeline.ts preview --run <run>
```

Escalate only for ambiguous injections, non-behavioural drops, or user-requested project exclusions.

## Non-negotiables

1. Signal coverage equals kept count (reconciled, not estimated).
2. Every critical quote is traceable.
3. Residual accounting is complete.
4. Owner stays outside the agent system.
5. `lint-crew` passes.
6. Validity claims require Stage 4 primary path (or explicit "not run" in Known limits).
7. Deliverable is a complete `skill/` package; no auto-mount.

## Iteration

- New sessions → new run → full pipeline → compare `skill/` packages and validation summaries.
- Revise conclusions only → reuse signals → redo Stages 3–4.
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
