---
name: code-review
description: >-
  Review concrete code plan drafts, specs, diffs, and implementation shapes. Use for code-review requests and serious code-plan design critique. Focus on design shape, public contracts, state/schema/persistence, tests, local fit, and actionable findings. Near miss: use code-plan to create or revise plans; use code-scope-gate for pre-spec scope shaping.
---

# Code Review

Perform an adversarial review of the change. Look for opportunities to **reduce layers** (pass-through wrappers, single-use abstractions), **remove complexity** (code-judo: restructurings that delete branches/modes/helpers, not rearrange them), and **increase reliability** (correctness, contract, state, concurrency, migration risk). Honor repo-wide policies (`AGENTS.md`, `CONTRIBUTING.md`, ADRs) as hard constraints. Verify what you can. Keep the original intent — simplify the *same* change, don't redirect scope.

## Attribution

Distinguish **NEW** (introduced or made materially worse by this change) from **PRE-EXISTING** (already true on the base branch). Compare against base — read the unchanged file or check blame, not just the diff hunks. Report PRE-EXISTING only when the change touches the same surface and it blocks the intended outcome, the change makes it worse, or the user asked for a broader audit. Tag every finding `[NEW]` or `[PRE-EXISTING]`; if uncertain, say so rather than defaulting to NEW.

## Bar

Volume is failure. Each finding names a concrete surface, the impact, and the smallest correction. Drop anything that wouldn't change the merge decision or follow-up plan. Cap nits at three — if you have more, the bar is too low.

Filter on severity and merge-relevance, not on your own confidence. Investigate fully, then decide what to report: surface a plausible correctness/contract/state issue even when you are unsure of it — flag the uncertainty and what would confirm it — instead of dropping it silently because you can't fully prove it. Only style and naming nits get capped.

Severity: **blocker** (correctness/contract/state), **raise** (real issue, follow-up acceptable), **nit** (small polish). Order by severity. Split atomic findings when surface or correction differs; merge only exact duplicates. If nothing meets the bar, say so and name residual risk.

For draft-plan reviews, corrections are plan changes (revised approach, added context, stronger non-goal, checkpoint, user decision).

## Lenses

Most reviews are inline — apply whichever lenses fit the change. When surfaces fan out or risk concentrates (multi-file, public API/CLI/schema/migration/persistence), dispatch focused sub-agents using the lens descriptions below as their prompts (consult `meta-subagent-orchestration` first). Sub-agents stay read-only, apply the attribution rule, and return concrete candidates with source pointers — silence is a valid output.

**Design shape.** Shallow interfaces, information leakage, tactical patches adding branches/modes/fallbacks without reducing underlying complexity, weak ownership boundaries, error handling that should be removed by design, layers that only forward calls. Use APOSD vocabulary ([references/aposd-complexity-review.md](references/aposd-complexity-review.md)) — every design finding names reader task + symptom (change amplification / cognitive load / unknown-unknown) + cause (dependency / obscurity). Reject "cleaner" / "more DRY" / "add comments" without that mapping.

**Contract surface.** Public/shared contracts: API, CLI, schemas, persisted state, generated artifacts, wrappers, migrations. New capability promises, silent rewrites/repairs/normalizations on parse, wrappers that reinterpret upstream contracts, missing collision checks on derived identities (paths/routes/cache keys/external refs), undocumented changes to behavior/imports/CLI output/event payloads/errors/timing, migrations that drop source baseline or fixture matrix. Don't invent compatibility requirements beyond observed contracts.

**Test validation.** Regression evidence. Behavior that could regress without coverage, tests that assert private state / call order / component names instead of public behavior, mocks of things that should be real, production-only seams added for testability, plans that prove the new path while leaving existing behavior unprotected. Don't report coverage gaps in untouched code.

**Implementation fit.** Fit with the local codebase. New helpers/wrappers/adapters that duplicate existing owners, single-use abstractions, wrong-layer logic, near-copy variants, broad find-and-replace that scatters one behavior, options/branches/files for future flexibility, calls to nonexistent or bypassed helpers. Don't propose adjacent refactors unless they are the smallest correction.

**Synthesis critic.** Dispatch when risk is high or evidence conflicts. Different role: challenges the draft findings, doesn't produce new candidates. Probes: evidence real, attribution correct against base, PRE-EXISTING justified, set clears the bar (drop low-value / excess nits), no bad duplicates/splits/severity, APOSD findings name reader-task/symptom/cause not slogans, severe sub-agent candidates not silently dropped, unreviewed surfaces acknowledged. Returns per challenge: target finding (or missing area), issue, evidence, action (keep / drop / retag / reword / reorder / verify / surface in judgment).

## Output

User's primary language for prose; keep code symbols, paths, errors original. Return: findings (each prefixed `[NEW]`/`[PRE-EXISTING]` and severity-tagged) → open questions that materially change the decision → short overall judgment (note blocked/unreviewed surfaces). No edits, commits, or pushes without separate authorization.
