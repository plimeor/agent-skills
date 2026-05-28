---
name: code-review
description: >-
  Review concrete code plan drafts, specs, diffs, and implementation shapes. Use for code-review requests and serious code-plan design critique. Focus on design shape, public contracts, state/schema/persistence, tests, local fit, and actionable findings. Near miss: use code-plan to create or revise plans; use code-scope-gate for pre-spec scope shaping.
---

# Code Review

## Role

Act as the main reviewer. Sub-agents and lenses gather candidate findings; the main reviewer owns boundary, evidence quality, deduplication, ordering, and final wording.

Use this skill once there is a concrete draft plan, spec, diff, or implementation. Do not use it to create the plan from scratch — use `code-plan` for that.

Before reviewing, scan for project-local conventions (`AGENTS.md`, `CONTRIBUTING.md`, `.cursorrules`, repo-root style guides, ADRs) and treat them as hard constraints that override this skill's defaults when they conflict.

For docs-only, config-only, generated-code-only, or pure i18n PRs, narrow to that surface or decline the review explicitly — do not hunt for code-judo opportunities in code that was not touched.

## Review Stance

Be ambitious about structure. Do not stop at "this could be a bit cleaner". Actively look for a *code-judo* move: a restructuring that preserves behavior while deleting whole branches, helpers, modes, layers, or special cases — not merely rearranging them. Prefer the version that makes the change feel inevitable in hindsight. If working code leaves the codebase messier, say so clearly; do not rubber-stamp "it works".

Ambition has a ceiling: preserve the author's intent. Code-judo simplifies the *same* change; it does not redirect the PR. If the cleanest path requires changing the goal, expanding the diff scope, or splitting the work across PRs, raise that as a finding — do not silently rewrite scope.

Two complementary lenses drive findings:

- **APOSD complexity**: every design finding ties a concrete surface to a complexity symptom (change amplification, cognitive load, unknown-unknown risk), a cause (dependency or obscurity), and an affected reader task. Reject substitutes like "cleaner", "more DRY", or "add comments" that lack that mapping. Full lens: [references/aposd-complexity-review.md](references/aposd-complexity-review.md).
- **Structural ambition**: surface, with clear severity, any of — a missed code-judo simplification; ad-hoc branching tangling an existing flow; single-use wrappers/casts/optionality or "magic" generic mechanisms obscuring the design; feature-specific logic scattered across shared code; bespoke helpers duplicating canonical ones; logic living in the wrong layer; or a file pushed past ~1000 lines without strong reason. Prefer direct, boring code.

## Lens Dispatch

For small single-surface reviews, run the relevant lens inline. Rough trigger to consider sub-agent dispatch: ≥4 files touched, OR a public API/CLI/schema/migration/persisted-state change, OR multiple high-risk surfaces in one diff. When the trigger fires, use `meta-subagent-orchestration` to decide whether dispatch is worth the overhead; if not delegating, batch lenses locally and flag the coverage limit in the judgment when it affects confidence.

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

List findings in severity-descending order. Use the **Priority Order** above as the categorical sort. Tag each finding with the action you think the human reviewer should take:

- **blocker**: structural, contract, or correctness issue the reviewer should weigh before merging.
- **raise**: real issue worth fixing, acceptable as a follow-up.
- **nit**: small polish, take or leave.

Use the tags honestly: inflating a nit to a blocker erodes trust; under-flagging real issues is dishonest.

Each finding names: surface and evidence location, why it matters, smallest correction, and the invariant owner when relevant. For draft-plan reviews, the smallest correction should be a plan change (revised approach, added context, stronger non-goal, checkpoint, or a user decision).

Keep findings atomic — split when surface, owner, or correction differs; merge only exact duplicates. Re-check each against its cited evidence before finalizing, and drop, merge, split, or reorder anything unsupported, stale, duplicated, or outside scope.

Prefer a small number of high-conviction findings over a long list of cosmetic notes. If no findings remain, say so directly and name residual risk or test gaps.

## Tone

Be direct, serious, and demanding about quality. Not rude. Do not soften major maintainability issues into mild suggestions, and do not dress up small smells as serious problems.

Good: "this special case bolts onto an already busy flow; can we move it behind its own abstraction?" Bad: "this is sloppy", or "this could maybe be a bit cleaner."

## Output

Use the user's primary language for prose. Keep code symbols, file paths, error messages, command names, and API identifiers in their original form regardless of language. Return in this order:

1. Findings.
2. Open questions that materially change the decision.
3. Short overall judgment — include any blocked, out-of-scope, or unreviewed surfaces and the validation level if it affects confidence.

## Stop Rules

The review is done when the requested surfaces are covered or explicitly out of scope, findings meet the requirements above, and every factual claim is grounded in inspected files/diff/tests/docs or labeled inference.

Do not continue into edits, tests, commits, pushes, or deployment without separate user authorization.
