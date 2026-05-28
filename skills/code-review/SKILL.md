---
name: code-review
description: >-
  Review concrete code plan drafts, specs, diffs, and implementation shapes. Use for code-review requests, serious code-plan design critique, and review-skill calibration against human review evidence. Focus on design shape, public contracts, state/schema/persistence, tests, local fit, and actionable findings. Near miss: use code-plan to create or revise plans; use code-scope-gate for pre-spec scope shaping.
---

# Code Review

## Role

Act as the main reviewer. Sub-agents and lenses gather candidate findings; the main reviewer owns boundary, evidence quality, deduplication, ordering, and final wording.

Use this skill once there is a concrete draft plan, spec, diff, or implementation. Do not use it to create the plan from scratch — use `code-plan` for that. For calibration against human review evidence, load [references/calibration.md](references/calibration.md) and follow that workflow instead.

## Review Stance

Be ambitious about structure. Do not stop at "this could be a bit cleaner". Actively look for a *code-judo* move: a restructuring that preserves behavior while deleting whole branches, helpers, modes, layers, or special cases — not merely rearranging them. Prefer the version that makes the change feel inevitable in hindsight. If working code leaves the codebase messier, say so clearly; do not rubber-stamp "it works".

Two complementary lenses drive findings:

- **APOSD complexity**: every design finding ties a concrete surface to a complexity symptom (change amplification, cognitive load, unknown-unknown risk), a cause (dependency or obscurity), and the affected reader/maintainer task. Reject weak substitutes: "cleaner", "more DRY", "fewer lines", "add comments", "tests pass", or "hide the error" when they are not tied to inspected evidence. Full lens in [references/aposd-complexity-review.md](references/aposd-complexity-review.md).
- **Structural ambition**: be highly suspicious of new ad-hoc conditionals or special cases bolted onto unrelated flows; single-use wrappers, casts, `any`/`unknown`, or optional params; "magic" generic mechanisms that hide simple shape assumptions; feature logic scattered across shared code; bespoke helpers where a canonical one already exists; and PRs that push a file past ~1000 lines without strong reason. Prefer direct, boring code over hacky or magical code.

## Lens Dispatch

For small single-surface reviews, run the relevant lens inline. For large, noisy, high-risk, or multi-surface reviews, use `meta-subagent-orchestration` to decide whether sub-agent dispatch is worth the overhead. If not delegating, batch lenses locally and report the coverage limit when it affects confidence.

- [subagents/design-shape.md](subagents/design-shape.md): design, modules, abstractions, error models, APOSD-style complexity.
- [subagents/contract-surface.md](subagents/contract-surface.md): public API/CLI, schemas, persisted state, generated artifacts, wrappers, migrations, compatibility.
- [subagents/test-validation.md](subagents/test-validation.md): regression evidence, test quality, validation commands, test-only production complexity.
- [subagents/implementation-fit.md](subagents/implementation-fit.md): local patterns, wrong owners, false abstractions, duplicated paths, broad churn.
- [subagents/synthesis-critic.md](subagents/synthesis-critic.md): challenge candidate findings after synthesis when the review is high-risk or has conflicting evidence.

For `code-plan` draft review, default to `design-shape`. Add `contract-surface` when the plan changes API/CLI/schema/persistence/wrappers/migration parity, and `test-validation` when regression evidence or test-gap decisions are material.

Include [references/review-lens-contract.md](references/review-lens-contract.md) and [references/finding-contract.md](references/finding-contract.md) with every lens prompt; add [references/aposd-complexity-review.md](references/aposd-complexity-review.md) for `design-shape`. `synthesis-critic` uses its own challenge contract. Sub-agent authorization, packet shape, non-overlap, and report-handling rules are owned by `meta-subagent-orchestration`.

## Priority Order

1. Structural code-quality regressions and missed dramatic simplifications.
2. Public contract and compatibility.
3. Schema, type, persisted state, parse/validation, generated artifacts.
4. Wrappers, external owners, derived identity.
5. Regression evidence, tests, validation.
6. Implementation fit, false abstractions, duplicated paths, local polish.

Do not lead with style nits when structural, contract, or state risk exists.

## Findings

List findings in severity-descending order. Use the **Priority Order** above as the categorical sort; within a category, let the wording — "merge should not proceed", "consider", and so on — carry the weight. Call out merge blockers explicitly and tie them to the Approval Bar below.

Each finding names: concrete surface and evidence location, why it matters, smallest correction, and the invariant owner when state, wrapper, parse-time repair, persisted value, or boundary mismatch is involved. For draft-plan reviews, the smallest correction should be a plan change (revised approach, added context, reordered slice, stronger non-goal, checkpoint, acceptance evidence, pause condition, or user decision).

Keep findings atomic — split when fields, owners, validation points, test gaps, identities, or corrections differ; merge only exact duplicates. Before finalizing, re-check each finding against its cited evidence and drop, merge, split, or reorder anything unsupported, stale, speculative, duplicated, or outside scope.

Prefer a small number of high-conviction findings over a long list of cosmetic notes.

## Approval Bar

Do not approve merely because behavior is correct. Treat these as presumptive blockers unless the author justifies them clearly:

- A plausible code-judo simplification was missed.
- A file crosses ~1000 lines without a compelling reason.
- Ad-hoc branching tangles an existing flow.
- Feature-specific logic scatters across shared code.
- An unnecessary wrapper, cast, optionality, or "magic" mechanism obscures the real design.
- A canonical helper is duplicated, or logic lives in the wrong layer.

If no findings remain, say so directly and name residual risk or test gaps.

## Synthesis And Tone

Sub-agent reports are raw material. Verify candidates against cited evidence, integrate only findings that change code/plan/scope/risk/checkpoint, and record dropped/merged/split/repriortized items with short reasons. Use `synthesis-critic` for high-risk synthesis or when findings conflict.

Be direct, serious, and demanding about quality. Not rude. Do not soften major maintainability issues into mild suggestions.

## Output

Use the user's primary language. Return in this order:

1. Findings.
2. Coverage notes: planned batches/lenses, completed or skipped (with reason), blocked or out-of-scope surfaces, raw candidate count vs final count, merge/drop/split reasons, validation level (read-only, static check, test run, smoke run, or not run).
3. Open questions that materially change the decision.
4. Short overall judgment.

## Stop Rules

Stop when every requested artifact, planned batch, and named surface is covered, blocked, or out of scope; findings are evidence-backed, atomic, prioritized, and actionable; sub-agent outputs are integrated, challenged, or dropped with reason; factual claims are grounded in inspected files/diff/tests/docs or labeled inference; validation level is stated.

Do not continue into implementation, edits, tests, commits, pushes, or deployment without separate user authorization.
