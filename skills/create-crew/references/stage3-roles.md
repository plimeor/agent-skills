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
├── SKILL.md              # frontmatter name: crew (no Known limits here)
├── roles/
│   └── <role-id>.md
└── references/           # optional depth; no new boundary axes
```

Run-level audit (not part of the mount surface): `roles-method.md` holds elevation, residuals, dual-source boundaries, and pipeline limits (sample size, Stage 4 status).

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
| Worker contract | Execute Spec only; dispatch requests go to lead |

Role ids: short kebab-case. Not repo names. Not pipeline station names.

Mount role files are **executable Spec only** (fields above). Do **not** put corpus quotes (`「」`) or evidence in `skill/**`. Verbatim Owner speech for audit lives only in run-level `roles-evidence.md` (and signal files), not on the mount surface.

## What a role is

A role is a **battle-tested judgment pattern** with a **deep** lead-facing interface: short trigger and few hard escalates, relative to the useful absorb/escalate behavior it hides. It is not a task genre, not a one-off story, and not an open registry of “things agents may execute.”

Coverage of the corpus and size of the Role index are different jobs. Every durable judgment axis must be **accounted for**. Only axes that pass elevation sit in `skill/roles/` and the Role index. The rest go to residual, fold into an elevated role, or into **Owner & global constraints** in `skill/SKILL.md`.

Owner is never an agent role.

## Boundary material (before elevation)

From signals (each list ≥1 session):

1. Decisions the Owner rules personally → escalate candidates  
2. Anger / judgment-drain points → escalate candidates  
3. Correction preferences (tolerated only with census) → absorb or escalate candidates  
4. Phase transitions → trigger candidates  

From census in the same pass: recurring completed task types → absorb candidates on **already elevated** roles or thin global lines in `SKILL.md` Owner constraints. Do not invent a role solely to hold a census whitelist.

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
| Thin global constraint | `skill/SKILL.md` → Owner & global constraints |
| Axis real, gates fail | residual table (in `roles-method.md`) |
| Not this crew’s job | residual `out-of-domain` |

## Residuals

Residual is **complete coverage**, not a failed Stage 3. Index seats are optional; accounting is not.

```markdown
## Residuals
| Judgment axis | Battles (n; sprint merges noted) | Why not a role | Disposition |
```

Disposition: `fold-into:<id>` | `shared` (Owner constraints in SKILL.md) | `residual-as-needed` | `out-of-domain`.

Every high-value signal maps to: an elevated role (example/trigger), a fold, Owner constraints in SKILL.md, or this table. Mapping to a **new** role is allowed only after elevation gates pass.

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

Required sections:

1. **Owner & global constraints** — full text in SKILL.md (not a pointer to `_shared.md`)  
2. **Routing** — main session routes; role workers do not spawn roles  
3. **Role index**

```markdown
| id | name | phase | trigger | evaluation partners | path |
|---|---|---|---|---|---|
```

Paths are relative to `skill/` and must resolve.

4. **Evaluation combos** — multi-role fieldings the lead should prefer for named scenarios

```markdown
| scenario | roles (parallel) | purpose | lead synthesis |
|---|---|---|---|
```

When two or more roles exist and the corpus supports multi-angle work, at least one multi-role combo is required.

5. **Worker → Lead dispatch protocol** (isolation required)

Role workers do not spawn agents. For extra non-role help:

1. **Lead** creates a private root for **this invocation only**, under the **current session cwd**:

   `<session-cwd>/.crew-dispatch/<invocation-id>/`

   `invocation-id` is opaque and unique. Lead passes the absolute path as `DISPATCH_ROOT` in each worker brief. Never use a fixed global folder shared across sessions (e.g. bare repo-root `role-dispatch-requests/`).

2. **Worker** writes only:

   `<DISPATCH_ROOT>/<role-id>-<slug>.md`

   Must not read or list other invocations under `.crew-dispatch/`.

3. Worker reports a `Dispatch requests (for lead only)` table (path under `DISPATCH_ROOT`, purpose, suggested type). Lead may refuse; results return via lead. Lead deletes this invocation’s root when the crew turn ends.

6. **How to load a role** — lead injects SKILL.md constraints + `roles/<id>.md` + `DISPATCH_ROOT`  
7. **Deployment note** — this directory is the full skill; the user mounts it  

### Progressive disclosure

- Always on invoke: Owner constraints, Routing, Role index, Evaluation combos, dispatch protocol.  
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

`decision`: `elevate` | `fold-into:<id>` | `shared` | `residual` | `out-of-domain`.

Record pipeline limits here (sample fraction, Stage 4 not run, domain skew) — not in `skill/SKILL.md`.

## Gate

```bash
bun scripts/pipeline.ts lint-crew --run <run>
```

Non-zero exit means Stage 3 is incomplete. Then Stage 4 (`stage4-replay.md`).
