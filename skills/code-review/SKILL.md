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
- **Structural ambition**: be suspicious of special cases bolted into existing flows, single-use wrappers/casts/optionality, "magic" generic mechanisms, and bespoke helpers duplicating canonical ones. Prefer direct, boring code. The Approval Bar below enumerates the resulting merge gates.

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

List findings in severity-descending order. Use the **Priority Order** above as the categorical sort. Tag each finding with its expected action:

- **blocker**: matches an Approval Bar condition; merge should not proceed until addressed or justified.
- **raise**: real issue worth fixing, acceptable as a follow-up; not a merge gate on its own.
- **nit**: small polish, take or leave.

These tag merge action, not severity — wording already carries severity. Use the tags honestly: over-blocking erodes trust; under-blocking is dishonest.

Each finding names: concrete surface and evidence location, why it matters, smallest correction, and the invariant owner when state, wrapper, parse-time repair, persisted value, or boundary mismatch is involved. For draft-plan reviews, the smallest correction should be a plan change (revised approach, added context, reordered slice, stronger non-goal, checkpoint, acceptance evidence, pause condition, or user decision).

Keep findings atomic — split when surface, owner, or correction differs; merge only exact duplicates. Re-check each against its cited evidence before finalizing, and drop, merge, split, or reorder anything unsupported, stale, duplicated, or outside scope.

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

Sub-agent reports are raw material. Verify candidates against cited evidence, integrate only findings that change code/plan/scope/risk/checkpoint, and record dropped/merged/split/reordered items with short reasons. Use `synthesis-critic` for high-risk synthesis or when findings conflict.

Be direct, serious, and demanding about quality. Not rude. Do not soften major maintainability issues into mild suggestions, and do not dress up small smells as serious problems.

Good: "this special case bolts onto an already busy flow; can we move it behind its own abstraction?" Bad: "this is sloppy", or "this could maybe be a bit cleaner."

## Output

Use the user's primary language for prose. Keep code symbols, file paths, error messages, command names, and API identifiers in their original form regardless of language. Return in this order:

1. Findings.
2. Open questions that materially change the decision.
3. Short overall judgment — include any blocked, out-of-scope, or unreviewed surfaces and the validation level if it affects confidence.

## Stop Rules

Stop when every requested artifact, planned batch, and named surface is covered, blocked, or out of scope; findings are evidence-backed, atomic, ordered, and actionable; sub-agent outputs are integrated, challenged, or dropped with reason; factual claims are grounded in inspected files/diff/tests/docs or labeled inference.

Do not continue into implementation, edits, tests, commits, pushes, or deployment without separate user authorization.
