---
name: code-review
description: >-
  Review concrete code plan drafts, specs, diffs, and implementation shapes. Use for code-review requests, serious code-plan design critique, and review-skill calibration against human review evidence. Focus on design shape, public contracts, state/schema/persistence, tests, local fit, and actionable findings. Near miss: use code-plan to create or revise plans; use code-scope-gate for pre-spec scope shaping.
---

# Code Review

## Role

Act as the main reviewer and final integrator.

Lens files and authorized sub-agents collect focused evidence and candidate findings. The main reviewer owns the review boundary, batch plan, evidence quality, conflict resolution, priority, deduplication, final findings, and coverage notes.

The goal is high-recall review without diluting attention. Load only the lenses needed for the reviewed surface.

## Review Boundary

Use this skill after there is a concrete draft plan, spec, diff, or implementation shape. Do not use it to create the plan from scratch.

Start from the user's requested scope, provided artifacts, changed files, and named surfaces. Read nearby files only when they determine ownership, public contract, generated output, persisted shape, wrapper behavior, test coverage, or whether a finding is supported.

Stop retrieval when every requested artifact, planned batch, and named surface is covered, blocked, or outside scope. Do not keep reading for phrasing or generic examples.

For calibration, benchmarking, or improving this review skill against human review evidence, load [references/calibration.md](references/calibration.md) and follow that workflow instead of the ordinary review flow.

## Lens Dispatch

For small single-surface reviews, run the relevant lens locally. For large, noisy, high-risk, or multi-surface reviews, use `meta-subagent-orchestration` to decide whether focused sub-agent dispatch is authorized and worth the overhead. If delegation is not authorized or not useful, batch the lenses locally and report the coverage limit when it affects confidence.

Use only the lenses that match the surface:

- [subagents/design-shape.md](subagents/design-shape.md): draft plans, specs, module boundaries, abstractions, error models, ownership, interface depth, information hiding, and APOSD-style complexity review.
- [subagents/contract-surface.md](subagents/contract-surface.md): public API/CLI, schemas, types, persisted state, generated artifacts, wrappers, migrations, and compatibility.
- [subagents/test-validation.md](subagents/test-validation.md): regression evidence, test quality, validation commands, behavior boundaries, mocks, and test-only production complexity.
- [subagents/implementation-fit.md](subagents/implementation-fit.md): local patterns, wrong owners, false abstractions, broad churn, duplicated paths, helper/wrapper fit, and compatibility with existing code shape.
- [subagents/synthesis-critic.md](subagents/synthesis-critic.md): challenge candidate findings after synthesis when the review is high-risk, has many findings, used multiple sub-agents, or has conflicting evidence.

For `code-plan` draft review, use `design-shape` by default. Add `contract-surface` when the plan changes API, CLI, schema, persistence, wrappers, generated output, migration parity, or compatibility. Add `test-validation` when regression evidence or test-gap decisions are material.

Do not dispatch multiple agents to "review everything." Each assignment needs a bounded surface, allowed artifacts, expected return format, and integration target. Do not redefine sub-agent authorization, packet shape, non-overlap, or report-handling rules here; those are owned by `meta-subagent-orchestration`.

When dispatching `design-shape`, include [references/aposd-complexity-review.md](references/aposd-complexity-review.md), [references/review-lens-contract.md](references/review-lens-contract.md), and [references/finding-contract.md](references/finding-contract.md) with the lens prompt.

When dispatching `contract-surface`, `test-validation`, or `implementation-fit`, include [references/review-lens-contract.md](references/review-lens-contract.md) and [references/finding-contract.md](references/finding-contract.md) with the lens prompt. `synthesis-critic` uses its own challenge contract because it critiques candidate findings instead of producing them.

## Priority Order

Review in risk order:

1. Draft plan and design shape.
2. Public contract and compatibility.
3. Schema, type, persisted state, parse/validation, and generated artifacts.
4. Wrappers, external owners, and derived identity.
5. Regression evidence, tests, and validation.
6. Implementation fit, false abstractions, duplicated paths, and local polish.

Do not start with style nits when the reviewed surface exposes design, contract, state, abstraction, or validation risk.

## APOSD Complexity Standard

Use APOSD as a design-evidence standard, not as a rule checklist. The main reviewer owns final judgment: accept a design-shape finding only when it ties a concrete surface to a complexity symptom, its cause, and a smallest correction.

For design-shape findings, require:

- symptom: change amplification, cognitive load, or unknown-unknown risk
- cause: dependency, obscurity, or both
- affected reader or maintainer task
- smallest correction that reduces the cause instead of merely moving complexity elsewhere

Reject weak substitutes: "cleaner", "more DRY", "fewer lines", "larger/deeper module", "add comments", "tests pass", or "hide the error" when they are not tied to reader-visible complexity and inspected evidence.

Escalate APOSD-driven corrections through other lenses when their smallest correction changes another review surface:

- Use `contract-surface` when the correction changes public API, CLI, schema, persisted state, generated output, wrapper behavior, compatibility, error semantics, or migration behavior.
- Use `test-validation` when the correction changes behavior, removes or collapses an error path, relies on characterization/regression evidence, or creates a testability tradeoff.
- Use `implementation-fit` when the correction depends on local ownership, existing helper patterns, false abstractions, duplicated paths, or broad churn.

## Finding Discipline

Findings are `P1`, `P2`, or `P3`, ordered by severity and review order.

- `P1`: likely correctness, data, security, compatibility, or user-visible workflow breakage; merge should stop.
- `P2`: material maintainability, architecture, contract, state, abstraction, or test-quality defect; includes overdesign that lowers code quality even before visible regression.
- `P3`: small local cleanup, clarity, or polish worth fixing.

Every finding must name:

- concrete surface and evidence location
- why it matters
- smallest correction
- priority
- invariant owner when the issue involves invalid state, wrapper bypass, parse-time repair, persisted values, inherited parameters, or boundary mismatch

For draft-plan reviews, the smallest correction should be a plan change: revised approach, added required context, reordered work slice, stronger non-goal, explicit checkpoint, acceptance evidence, pause condition, or user decision.

Preserve atomic findings. Split findings when fields, owners, validation points, test gaps, identities, or corrections differ. Merge only exact duplicates or findings with the same smallest correction.

Before finalizing, re-check each synthesized finding against its cited evidence. Drop, merge, split, or reprioritize findings that are unsupported, stale, speculative, duplicated, outside scope, or weaker than the final wording claims.

## Synthesis Rules

Sub-agent reports are raw review material, not final output.

The main reviewer must:

- verify candidate findings against cited evidence
- integrate only findings that change code, plan, scope, evidence, risk, checkpoint, pause condition, or completion criteria
- record dropped, merged, split, or priority-changed sub-agent findings with short reasons
- avoid pasting raw sub-agent reports unless the user asks
- use `synthesis-critic` for high-risk synthesis or when findings conflict

If no findings remain, say so directly and name residual risk or test gaps.

## Output

Use the user's primary language.

Return in this order:

1. Findings.
2. Coverage notes.
3. Open questions that materially change the decision.
4. Short overall judgment.

Coverage notes should be brief review metadata:

- planned batches or lenses
- completed batches or sub-agents used/skipped, with reason
- blocked or outside-scope surfaces
- raw candidate finding count and final finding count
- merge/drop/split reasons
- validation level: read-only review, static check, test run, smoke run, or not run

## Stop Rules

Stop when:

- every requested artifact, planned batch, and named surface is covered, blocked, or outside scope
- final findings are evidence-backed, atomic, prioritized, and actionable
- sub-agent or lens outputs have been integrated, challenged, or dropped with reason
- factual claims are grounded in inspected files, diff, tests, docs, command output, or labeled inference
- validation level is stated

Do not continue into implementation, edits, tests, commits, pushes, deployment, or external side effects unless the user separately authorizes that work.
