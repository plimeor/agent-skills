# Stage 3 — Build the crew package

## Inputs

- `signals/` + `signals-manifest.md`
- `census/census.md`
- open-schema control under `signals/_open-schema/`

## Outputs

| Path | Purpose |
|---|---|
| `skill/` | Deployable **crew** skill (mount source of truth) |
| `roles-method.md` | Method, residuals, Boundary sources, validation notes |
| `roles-evidence.md` | Quote → session + turn |

## Package shape

```text
skill/
├── SKILL.md              # judgment: Owner, Routing, Role index, Combos
├── roles/
│   └── <role-id>.md      # role Spec only (no harness commands)
├── runtimes.md           # fielding: Select + Orca + Portable
└── references/           # optional depth; no new boundary axes
```

| Surface | Owns | Must not own |
|---|---|---|
| `roles/*` | What the role judges, absorbs, escalates | `orca` commands, dispatch paths |
| `SKILL.md` | Routing authority, index, combos, how to load a role | **Any absorb/escalate semantics**; long fielding protocols; Known limits |
| `runtimes.md` | How to field under Orca or Portable | New absorb/escalate axes; role roster |

**Judgment lives in `roles/*` and nowhere else.** `SKILL.md` is a router: it names which seats exist and when to field them. What a seat rules on, absorbs, and escalates is written once, in that seat's Spec.

Run-level audit (not mount): `roles-method.md` holds elevation, residuals, dual-source boundaries, and pipeline limits (sample size, Stage 4 status).

## Dual-source boundaries

| Pole | Evidence | Field it feeds |
|---|---|---|
| Friction | High-intervention signals, anger, hard corrections | Escalates |
| Census | Low-intervention completed work | Absorbs |

Both poles rank equally. When census lists repeated task types, absorb lines use source `census` or `both`. Escalate lines use `friction` or `both`.

Record every boundary clause:

```markdown
## Boundary sources
| Role | Direction | Clause (short) | Source | Backing |
|---|---|---|---|---|
| … | absorb \| escalate | … | census \| friction \| both \| waiver | … |
```

Empty census requires one explicit waiver. Silence is not a waiver.

## Role files

Each `skill/roles/<id>.md`:

| Field | Meaning |
|---|---|
| Responsibility | Recurring judgment function |
| Trigger | Operational engage condition |
| Absorbs | Work finished without Owner |
| Escalates | Work that stops for Owner |
| Phase | `batch` or `dialogic` |
| Success | Done look |
| Worker contract | Execute Spec only; request lead help only under the active runtime branch |

**Escalates is where Owner ownership is recorded.** Every decision the Owner rules personally appears in the Escalates of the role(s) that meet it.

Role ids: short kebab-case. Not repo names. Not pipeline station names.

Mount role files are **executable Spec only** (fields above). Do **not** put corpus quotes (`「」`) or evidence in `skill/**`. Verbatim Owner speech for audit lives only in run-level `roles-evidence.md` (and signal files), not on the mount surface.

Do **not** put harness commands (`orca …`, `.crew-dispatch` paths) in role files. Fielding lives in `runtimes.md`.

## What a role is

A role is a **battle-tested judgment pattern** with a **deep** lead-facing interface: short trigger and few hard escalates, relative to the useful absorb/escalate behavior it hides. It is not a task genre, not a one-off story, and not an open registry of “things agents may execute.”

Coverage of the corpus and size of the Role index are different jobs. Every durable judgment axis must be **accounted for**. Only axes that pass elevation sit in `skill/roles/` and the Role index. The rest fold into an elevated role, go to residual, or leave the package as a **global-rules recommendation** recorded in `roles-method.md`.

Owner is never an agent role.

## Boundary material (before elevation)

From signals (each list ≥1 session):

1. Decisions the Owner rules personally → escalate candidates  
2. Anger / judgment-drain points → escalate candidates  
3. Correction preferences (tolerated only with census) → absorb or escalate candidates  
4. Phase transitions → trigger candidates  

From census in the same pass: recurring completed task types → absorb candidates on **already elevated** roles only. Do not invent a role solely to hold a census whitelist. A census task type that fits no elevated role is one no role triggers on; that is expressed by its absence from every Trigger.

`batch`: compress Owner turns. `dialogic`: quality per turn, not fewer turns.

## Role elevation

An axis becomes a role only if **all three** gates pass. Fail any gate → do not add `roles/<id>.md`.

### Gate A — Battle-tested

- Count **independent battles** on the **same judgment axis** (not keyword co-occurrence, not quote count alone).
- **Minimum 5** battles.
- Turns or sessions inside **one continuous work sprint** on that axis count as **one** battle. A sprint is one uninterrupted campaign (same goal, same push), not “same calendar week” by itself.
- High-value labels and verbatim quotes support evidence; they do not replace the battle count.

### Gate B — Pattern

- The axis is a **reusable scenario family**: a stable trigger and absorb/escalate set that still makes sense on a different task or project.
- Reject one-off narratives and medium/task buckets (“the SVG role”, “the novel-writing role”) unless the judgment function is clearly cross-domain.

### Gate C — Deep module

Use the APOSD deep-module test only: **small interface relative to useful hidden behavior**.

- Pass when the lead can field the role from a short trigger and a few escalates, while the Spec still encodes substantial, independently useful boundary judgment.
- Fail when the Spec is shallow (interface ≈ implementation), is a pass-through slice of another role, or needs an absorb/escalate list that must grow without bound as new work domains appear.

### Prohibited shapes

- Open execution switch / unbounded “bounded tasks” registry (hands-shaped).
- Single-incident specialist seats.
- Rebadging an existing role under a new id.
- Roles justified mainly by imagined future domains.

### After the gates

| Outcome | Where it goes |
|---|---|
| All gates pass | `skill/roles/<id>.md` + Role index row |
| Axis real, overlaps an elevated role | fold into that role’s Spec |
| Thin constraint, applies to every agent regardless of seat | **out of package** → Global rules recommendation in `roles-method.md` |
| Axis real, gates fail | residual table (in `roles-method.md`) |
| Not this crew’s job | residual `out-of-domain` |

A constraint that holds for every agent on every task belongs in the user's global rules file (`AGENTS.md` / `CLAUDE.md`), where it reaches the main session and every subagent with no injection step. Stage 3 recommends it and leaves both the mount package and the user's global rules unmodified.

## Residuals

Residual is **complete coverage**, not a failed Stage 3. Index seats are optional; accounting is not.

```markdown
## Residuals
| Judgment axis | Battles (n; sprint merges noted) | Why not a role | Disposition |
```

Disposition: `fold-into:<id>` | `out-of-package` (global-rules recommendation) | `residual-as-needed` | `out-of-domain`.

Every high-value signal maps to: an elevated role (example/trigger), a fold, an `out-of-package` recommendation, or this table. Mapping to a **new** role is allowed only after elevation gates pass.

## `skill/runtimes.md` contract

Fielding is harness knowledge, not corpus mining. **Copy** `references/runtimes-template.md` into `skill/runtimes.md` as the base. Adjust language to match the corpus language if needed; keep structure and both branches.

Required shape:

1. **`## Select`** — includes the Orca probe: run `orca status --json`; if installed and ready → **Orca**, else **Portable**.
2. **`## Orca`** — lead routing authority, how to field a role, absorb → `worker_done`, escalate → gate/escalation, combos as parallel then barrier, worker ask to lead, full handoff only on explicit ownership transfer.
3. **`## Portable`** — session-private `.crew-dispatch/<invocation-id>/`, `DISPATCH_ROOT`, worker write path, lead may refuse, lead deletes root.

Rules:

- Always write **both** branches. Do not drop a branch because the builder machine lacks Orca (or has it).
- Do not invent absorb/escalate axes here.
- Do not require Orca online for Stage 3 success.
- create-crew pipeline execution never depends on Orca.

## `skill/SKILL.md` contract

```yaml
---
name: crew
description: >
  Summon the user's multi-role judgment crew: route to role Specs, run evaluation
  combos, keep Owner boundaries. Use when the user invokes crew or wants their
  personal absorb/escalate roster fielded. Near miss: not agent-team; not create-crew.
---
```

**Do not put Known limits / sample size / Stage 4 status in `skill/SKILL.md`.** Those live in run audit (`roles-method.md`).

**`skill/SKILL.md` holds no judgment text.** Owner-owned decisions live in the Escalates of the roles that meet them; cross-agent discipline lives in the user's global rules file, recommended from `roles-method.md`.

Required sections:

1. **Routing** — main session routes; role workers do not spawn roles; fielding details live in `runtimes.md`. **Must** include the closed-index rules below (verbatim intent, language may match corpus).
2. **Role index**

```markdown
| id | name | phase | trigger | evaluation partners | path |
|---|---|---|---|---|---|
```

Paths are relative to `skill/` and must resolve.

**Closed Role index (required Routing rules in mount `SKILL.md`):**

- The Role index is a **closed set**. Field **only** ids that appear as rows in that table (and whose `roles/<id>.md` exists).
- **Never invent** role ids, aliases, or “temporary seats” (e.g. paraphrases of a real seat). Invented ids are routing failures, not soft suggestions.
- If a task *feels* like a missing seat: map the intent to the **nearest elevated** role (or its residual disposition), and field that index id — or escalate to Owner. Do not mint a new id at invoke time.
- Evaluation combos may only name index ids. Workers never open a role tree or rename seats.

3. **Evaluation combos** — multi-role fieldings the lead should prefer for named scenarios (judgment partners and synthesis intent — not harness CLI)

```markdown
| scenario | roles (parallel) | purpose | lead synthesis |
|---|---|---|---|
```

When two or more roles exist and the corpus supports multi-angle work, at least one multi-role combo is required.

4. **Runtime** — load `runtimes.md`; run **Select** before fielding; apply the chosen branch for the rest of the invocation
5. **How to load a role** — lead injects `roles/<id>.md` + the task brief + active branch rules from `runtimes.md`. Nothing else from `SKILL.md` travels to a worker.
6. **Deployment note** — this directory is the full skill; the user mounts it

### Progressive disclosure

- Always on invoke: Routing, Role index, Evaluation combos, `runtimes.md` (Select + active branch).
- On fielding a role: that role file.
- Optional: `references/` depth. Depth never invents escalate/absorb axes absent from Specs.

### Package hygiene

No session ids, turn numbers `[n]`, or inline evidence anchors in `skill/**`.  
No pipeline Known limits block in `skill/SKILL.md`.  
No corpus quotes (`「」` / `『』`) in `skill/**` — mount is Spec only; provenance stays in `roles-evidence.md`.  
All artifacts describe the current target state only.

## Method file

State what was read, heuristic labels, open-schema convergence, dual-source outcome, residual dispositions, and self-reference filter stats (from `inventory/self-referential.md`). Session identities for self-ref and quotes live in evidence, not in the crew package.

For every elevated role and every rejected candidate that was seriously considered, record elevation in target-state form (not changelog prose):

```markdown
## Role elevation
| id or axis | battles (n) | pattern (one line) | deep (why interface stays small) | decision |
```

`decision`: `elevate` | `fold-into:<id>` | `out-of-package` | `residual` | `out-of-domain`.

Every `out-of-package` disposition lands in one table:

```markdown
## Global rules recommendation
| Clause (short) | Why it is not role judgment | Already covered by user global rules? |
```

This table is a recommendation for the user's `AGENTS.md` / `CLAUDE.md`. The pipeline does not write to those files. A clause already covered there is still listed, marked covered, so the next run does not re-propose it.

Record pipeline limits here (sample fraction, Stage 4 not run, domain skew) — not in `skill/SKILL.md`.

## Done when

The package and audit artifacts match this document’s contracts:

- `skill/SKILL.md` + `skill/roles/*` judgment surface complete
- `skill/runtimes.md` present with Select + Orca + Portable
- elevation, dual-source boundaries, residuals, and hygiene hold
- `roles-method.md` and `roles-evidence.md` written

There is no mechanical lint command. Incomplete Stage 3 work stays incomplete. Then Stage 4 (`stage4-replay.md`).
