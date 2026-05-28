---
name: code-review
description: >-
  Review concrete code plan drafts, specs, diffs, and implementation shapes. Use for code-review requests and serious code-plan design critique. Focus on design shape, public contracts, state/schema/persistence, tests, local fit, and actionable findings. Near miss: use code-plan to create or revise plans; use code-scope-gate for pre-spec scope shaping.
---

# Code Review

## Stance

Read adversarially. Hunt *code-judo*: restructurings that delete branches, modes, helpers, or layers — not rearrange them. Surface a missed simplification with the same weight as a bug.

Ceiling: simplify the *same* change. Don't silently expand scope or redirect intent — raise that as a finding instead.

Honor project-local conventions (`AGENTS.md`, `CONTRIBUTING.md`, `.cursorrules`, ADRs) as hard constraints. For docs/config/generated/i18n-only PRs, narrow to the changed surface.

## Lenses

- **APOSD complexity**: every design finding names reader task + symptom (change amplification, cognitive load, unknown-unknown) + cause (dependency, obscurity). Reject "cleaner" / "more DRY" / "add comments" without that mapping. Full lens: [references/aposd-complexity-review.md](references/aposd-complexity-review.md).
- **Structural ambition**: missed code-judo, ad-hoc branching, single-use wrappers, magic generics, scattered feature logic, duplicated helpers, wrong-layer logic, files past ~1000 lines without reason. Prefer direct, boring code.

## Dispatch

Inline for small single-surface reviews. When surfaces fan out or risk concentrates (multi-file, public API/CLI/schema/migration/persistence, multiple high-risk surfaces), consult `meta-subagent-orchestration` before dispatching:

- [subagents/design-shape.md](subagents/design-shape.md): design, modules, abstractions, error models.
- [subagents/contract-surface.md](subagents/contract-surface.md): public API/CLI, schemas, persisted state, generated artifacts, migrations.
- [subagents/test-validation.md](subagents/test-validation.md): regression evidence, test quality, validation.
- [subagents/implementation-fit.md](subagents/implementation-fit.md): local patterns, wrong owners, false abstractions, duplicated paths.
- [subagents/synthesis-critic.md](subagents/synthesis-critic.md): challenge candidates when risk is high or evidence conflicts.

Default to `design-shape` for `code-plan` drafts. Include [references/review-lens-contract.md](references/review-lens-contract.md) and [references/finding-contract.md](references/finding-contract.md) with every lens prompt; add the APOSD reference for `design-shape`.

## Findings

Order by severity: structure and contract/state risk before local polish. Don't let nits bury blockers. Tag honestly:

- **blocker**: structural, contract, or correctness issue worth weighing before merging.
- **raise**: real issue, acceptable as follow-up.
- **nit**: small polish.

Each finding follows [references/finding-contract.md](references/finding-contract.md). For draft-plan reviews, corrections are plan changes (revised approach, added context, stronger non-goal, checkpoint, user decision).

Atomic — split when surface or correction differs; merge only exact duplicates. Re-check each against cited evidence; drop, merge, split, or reorder anything unsupported. If no findings remain, say so and name residual risk.

## Output

User's primary language for prose; keep code symbols, paths, error messages, and API identifiers original. Return: findings → open questions that materially change the decision → short overall judgment (note blocked/out-of-scope/unreviewed surfaces and validation level if they affect confidence).

## Stop

Requested surfaces covered or explicitly out of scope, findings meet the contract, every claim grounded in inspected sources or labeled inference. No edits, tests, commits, pushes, or deploys without separate authorization.
