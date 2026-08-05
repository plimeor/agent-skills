---
name: code-design-review
description: "Assess whether a design holds up against modern software-engineering principles: complexity and cognitive load, change economics, boundary correctness, and agent legibility. Use when the user asks whether a design, module boundary, API, data flow, design doc, or change shape is sound, holds up, or withstands scrutiny — a principle-based judgment, not a merge gate. Near miss: use code-review for exhaustive, coverage-accounted review of a diff, plan, or parity scope; use code-plan to create or revise plans."
---

# Code Design Review

Judge whether a design holds up against software-engineering principles, from the one perspective that matters: a future maintainer doing real tasks. This is consulting, not gatekeeping — the deliverable is a verdict with ranked concerns, not a merge decision. Focused examination is allowed; the focus is stated. Report only; no edits without separate authorization.

## Subject

Fix what is being judged before judging it: the design surface — module boundary, API, data flow, state ownership, design doc, or the shape of a change — and the maintainer tasks it must serve (extending it, debugging it, changing it safely, understanding it cold). Every concern anchors to one of those tasks; nothing is judged against taste, symmetry, or fashion. When the artifact is readable, read it — don't judge a design from its author's description alone.

## Core Model

Every concern maps a concrete surface to a **reader task** plus at least one **symptom** and one **cause**:

- **Symptoms** — change amplification (one concept, many edits) · cognitive load (too much non-local knowledge) · unknown-unknown risk (needed information not discoverable, or the maintainer can't know it's needed).
- **Causes** — dependency (the surface can't be understood independently) · obscurity (important behavior, owner, invariant, or coupling isn't obvious).

Style preferences, naming opinions, and unmapped "cleaner" advice do not qualify as concerns. Two further guards:

- **Working code is not design evidence.** Tests passing prove correctness, not maintainability. Ask whether the surface has the shape it would have if the requirement had been known from the start.
- **Principles never override harder contracts**: explicit user scope and authorization, public API / schema / persistence / security / compatibility contracts, regression evidence for behavior changes, and domain constraints (auditability, incident response, distributed consistency, data integrity). When a principle conflicts with a harder contract, report the contract risk first; the principle is supporting context.

## Lenses

Four axes, each with its vocabulary in a reference. Select the ones the subject activates and name the ones skipped, with reason:

- **Complexity** ([references/complexity.md](references/complexity.md)) — can a maintainer understand this, and how much must they hold in their head? Deep vs shallow modules, information leakage, layering, predictability, comments and names.
- **Change economics** ([references/change.md](references/change.md)) — what does the next change cost, and is now the time to pay for structure? Coupling and cohesion as costs, restructuring timing, abstraction timing, duplication vs locality, deletability.
- **Boundary correctness** ([references/boundaries.md](references/boundaries.md)) — can invalid state exist past this boundary, and where do effects live? Parse-don't-validate, illegal states unrepresentable, functional core / imperative shell.
- **Agent legibility** ([references/agent-legibility.md](references/agent-legibility.md)) — can the newest maintainer, human or agent, operate here and verify its own work? Machine-checkable contracts, tests as spec, self-verification, context budget.

The axes overlap on purpose — a leaked invariant is a complexity fact and a change-cost fact. Report the concern once, under the axis with the sharpest vocabulary for it.

## Judgment

Depth follows risk: concentrate where complexity concentrates — the interfaces most callers touch, the knowledge duplicated across owners, the layer whose removal would change nothing. Sampling is legitimate here; what makes it honest is naming what was examined and what was not. For each concern, state the smallest correction that resolves the mapped symptom. When a material design choice is questioned, compare a real alternative owner, representation, or boundary — no strawmen, and no ceremonial alternatives on trivial choices.

## Output

User's primary language for prose; keep code symbols and paths original. Return:

1. **Verdict** — holds up / holds with concerns / does not hold — with the load-bearing reasons.
2. **Concerns**, ranked by impact on maintainer tasks, each naming surface, reader task, symptom, cause, and smallest correction.
3. **Lenses checked and passed**, briefly.
4. **Boundary** — lenses not applicable or not assessed, surfaces not examined, each with its reason.

## Stop Rules

Finish only when the verdict is stated with its reasons, every concern carries the full surface → reader task → symptom → cause mapping, and the examined/unexamined boundary is named. If the subject or its maintainer tasks are too unclear to judge, stop with the clarifying question rather than substituting taste. No edits, commits, or pushes.
