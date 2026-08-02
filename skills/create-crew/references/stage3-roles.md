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
├── SKILL.md              # frontmatter name: crew
├── roles/
│   ├── _shared.md        # optional
│   └── <role-id>.md
└── references/           # optional depth
```

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

Each `skill/roles/<id>.md` except `_shared.md`:

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

At least two corpus quotes per role (`「」`) in the role file or under `skill/references/`; rows in `roles-evidence.md`.

## Pattern extraction

From signals (each list ≥1 session):

1. Decisions the Owner rules personally → escalate  
2. Anger / judgment-drain points → escalate  
3. Correction preferences (tolerated requires census)  
4. Phase transitions → triggers  

From census in the same pass: delegation whitelist → absorb.

## Clustering

- Role count follows residual-honest clustering, not a target range.
- Owner is never an agent role.
- `batch`: compress Owner turns. `dialogic`: quality per turn, not fewer turns.
- Every high-value signal → a role example/trigger or the residual table.

```markdown
## Residuals (high-value, unbucketed)
| Judgment axis | Why no role holds it | Disposition |
```

Three or more residual sessions on one axis → explicit add / extend / out-of-domain.

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

Required sections:

1. **Known limits** (≤6 bullets)  
2. **Owner & global constraints** (or pointer to `roles/_shared.md`)  
3. **Routing** — main session routes; role workers do not spawn roles  
4. **Role index**

```markdown
| id | name | phase | trigger | evaluation partners | path |
|---|---|---|---|---|---|
```

Paths are relative to `skill/` and must resolve.

5. **Evaluation combos** — multi-role fieldings the lead should prefer for named scenarios

```markdown
| scenario | roles (parallel) | purpose | lead synthesis |
|---|---|---|---|
```

When two or more roles exist and the corpus supports multi-angle work, at least one multi-role combo is required.

6. **Worker → Lead dispatch protocol**

Role workers do not spawn agents. For extra non-role help they:

1. Write the full spawn prompt to `role-dispatch-requests/<role-id>-<slug>.md`
2. Report a `Dispatch requests (for lead only)` table with file, purpose, suggested type
3. Accept that the lead may refuse; results return to the lead

7. **How to load a role** — lead reads `roles/<id>.md` into the worker task  
8. **Deployment note** — this directory is the full skill; the user mounts it  

### Progressive disclosure

- Always on invoke: Routing, Role index, Evaluation combos, shared constraints.  
- On fielding a role: that role file.  
- Optional: `references/` depth. Depth never invents escalate/absorb axes absent from Specs.

### Package hygiene

No session ids, turn numbers `[n]`, or inline evidence anchors in `skill/**`.  
`「」` is reserved for verbatim quotes.  
All artifacts describe the current target state only.

## Method file

State what was read, heuristic labels, open-schema convergence, residual dispositions, dual-source outcome, and self-reference filter stats (from `inventory/self-referential.md`). Session identities for self-ref and quotes live in evidence, not in the crew package.

## Gate

```bash
bun scripts/pipeline.ts lint-crew --run <run>
```

Non-zero exit means Stage 3 is incomplete. Then Stage 4 (`stage4-replay.md`).
