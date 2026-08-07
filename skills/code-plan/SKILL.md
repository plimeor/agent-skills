---
name: code-plan
description: "Write coding plans for implementation, debugging, refactoring, migrations, design parity, and long-running agent tasks. Use when drafting, refining, or validating a development plan, /goal prompt, implementation approach, scope and non-goals, work sequence, acceptance criteria, regression evidence, verification strategy, or stop condition. Near miss: use code-review to judge an existing diff, spec, or already-drafted plan."
---

# Code Plan

## Goal

Produce one self-contained engineering plan that another agent can execute without losing the user's intent, context, boundaries, validation bar, implementation strategy, ordering, or stopping condition.

A plan is not just a Goal contract and not just a task list. It explains why the work matters, what must be true at the end, the approach and order, how to verify it, which risks to watch, and when to pause or stop.

You own the PLAN: which change is correct (the layer that owns the behavior, not the symptom site), whether that change is irreducible, the regression bar, the authorized boundary, and the risk-ordered human reading sequence. Keep the plan at planning altitude: judgments about the chosen approach's shape belong here; statements that can only be checked by running a command against the real codebase belong in execution, not in approach claims.

## What Every Plan Contains

A plan carries these sections, in this order, each filled once and not restated elsewhere. Scale depth to the work: only a small plan may collapse the obvious sections, and `Objective`, `Scope` / `Non-goals`, `Proposed approach`, `Work sequence`, regression evidence, acceptance/verification, `Pause conditions`, and `Stop condition` stay explicit at every size; an elevated-risk plan collapses none of them, and carries `Progress report format` when the task is long-running.

1. `Clarification status` - clear enough, assumptions, or blockers.
2. `Background / problem` - why this work exists and the pain or requirement it addresses, in the user's terms.
3. `Objective` - one durable outcome and target state.
4. `Scope` - included files, modules, routes, workflows, states, users, data, or environments, plus constraints and authorization boundaries.
5. `Non-goals` - adjacent work and boundary changes that stay out.
6. `Required context` - specific files, docs, tests, screenshots, issues, commands, traces, or source baselines to read first.
7. `Planning iteration` - the Lean Review Gate and Design Gate results, plus when useful: draft frame, independent or delegated research, or design review used or skipped, and findings integrated.
8. `Proposed approach` - the recommended direction and why it fits (see Section Rules).
9. `Work sequence` - ordered slices with purpose, touchpoints, dependencies, and per-slice proof (see Section Rules).
10. `Acceptance, regression evidence, and verification` - observable results that distinguish outcomes from tasks, preserved behaviors, thresholds, data sources, commands, artifacts, review gates, and coverage gaps.
11. `Risks and rabbit holes` - likely traps, unknowns, and tradeoffs, each with a containment plan or a pause condition.
12. `Checkpoints` - evidence to report before moving past risky or irreversible points.
13. `Stop condition` - the concrete state where work is done and the agent should stop.
14. `Pause conditions` - conditions requiring user input or authorization.
15. `Progress report format` - only for long-running tasks.

Do not split the artifact into separate goal, spec, and plan documents unless the user asks.

A plan is elevated-risk when it touches public contracts, schemas, persisted state, migrations, security boundaries, cross-module ownership, or irreversible or external side effects; when a fact that would change the approach is still assumed rather than verified; or when the user asks for deep or careful planning. Elevated-risk plans additionally require a filled `Planning iteration`, with each finding integrated into a concrete section rather than reported alongside the plan, and the `Test gap decision` question when project tests do not cover the regression surface.

The Lean Review Gate runs after the draft on non-mechanical plans; the Design Gate runs after lean findings are integrated or explicitly skipped and before the plan is returned.

## Evidence Budget

Start from the user's request and provided artifacts. Inspect local files, docs, issues, screenshots, logs, tests, or existing plans only when they affect objective, scope, approach, sequencing, acceptance, verification, risk, or stop conditions.

Ask a focused question when a missing fact would materially change the plan or authorize external side effects; otherwise proceed with a conservative labeled assumption. High-impact missing facts include target files or surfaces, source-of-truth behavior, allowed differences, required verification commands, credentials, deployment, destructive actions, persistent config changes, and public contract changes.

Use independent research only for questions whose answers can materially improve the plan, and use `agent-team` to decompose that research into parallel angles when it is worth the overhead. Record a skip reason only when it affects coverage, risk, or trust.

## Planning Clarity Gate

Activate when the request is too broad, conflicting, or under-specified to plan faithfully.

Required before drafting: the request and artifacts were inspected; unclear boundaries are answered, conservatively assumed, or listed as blockers; questions are specific and ordered by impact on the plan.

Weak substitutes do not satisfy the gate: a broad checklist, multiple unchosen interpretations, hidden assumptions, or "adjust later" language.

If the user proceeds without answers, record the assumptions under `Clarification status`, `Scope`, `Non-goals`, `Risks and rabbit holes`, or `Pause conditions`.

## Scope Triage Gate

Activate when the request mixes a desired outcome with a proposed implementation, the plan could add unrequested surface, or a boundary change looks necessary or tempting.

Apply scope triage — question → classify → clarify or delete → simplify. The plan is incomplete until it separates the requested outcome from candidate implementations, names ambiguous intended scope separately from deleted or deferred scope, names what was deleted, deferred, reused, or left out, classifies boundary changes — public behavior, APIs, schemas, persistence, security, deployment, or cross-module ownership — as avoided, authorized, or blocked pending user confirmation, and chooses the smallest sufficient approach before slices expand.

Weak substitutes do not satisfy the gate: restating the user's proposed implementation as a requirement, treating ambiguous intended scope as disposable, "keep it simple" without naming what stays out, moving speculative work in as optional implementation detail, or hiding public API, schema, persistence, security, deployment, or cross-module changes inside ordinary slices.

Write the result into `Scope`, `Non-goals`, `Proposed approach`, `Pause conditions`, and `Stop condition`; do not add a separate visible scope section unless the user asks. If an unauthorized boundary change is required, take the conservative path: a no-boundary-change alternative, one user decision question, or a pause condition before that work begins.

## Lean Review Gate

Activate after a draft plan frame exists and before the Design Gate when the plan is elevated-risk, broad, speculative, a refactor or migration, cross-module, or likely to add owned surface: new abstractions, files, dependencies, fallback paths, compatibility shims, feature flags, configuration, schemas, APIs, generated artifacts, or test scaffolding. Also activate when the user asks for lean code, Code Lean, YAGNI, minimal implementation, fewer dependencies, or avoiding over-engineering.

For a small mechanical plan with one viable shape and no meaningful new owned surface, record a one-line skip reason in `Planning iteration` instead of delegating.

Required before the plan is returned:

- a draft frame for review: `Objective`, `Scope`, `Non-goals`, proposed owner and approach, suspected owned surface, work sequence, and verification or regression evidence
- one bounded sub-agent pass using `code-lean`, when sub-agents are available, that reviews only for removable scope, existing capability reuse, unnecessary abstractions, dependencies, compatibility paths, extra files, and thinner verification that still protects the same public boundary
- main-agent integration of each actionable finding into `Scope`, `Non-goals`, `Proposed approach`, `Work sequence`, `Acceptance, regression evidence, and verification`, `Risks and rabbit holes`, `Pause conditions`, or `Stop condition`
- a compact `Planning iteration` note naming accepted reductions, rejected reductions and the boundary reason, or the skip reason

The sub-agent task is critique-only. It does not own the plan, choose a new objective, weaken explicit requirements, move the behavior to a symptom site, change public contracts, delete quality boundaries, or reduce regression evidence below the risk surface.

If sub-agents are unavailable, run the same `code-lean` review inline and record `sub-agent unavailable` in `Planning iteration`. If the leaner path would drop a plausible requested outcome, weaken validation, error handling, security, accessibility, calibration, or regression evidence, reject that finding and name the protected boundary. If the leaner path requires a boundary change, user decision, or evidence not yet available, add a pause condition or blocker instead of silently narrowing the plan.

Weak substitutes do not satisfy this gate: "keep it simple" self-talk, asking a sub-agent to broadly review or rewrite the plan, delegating planning ownership, pasting an unintegrated lean report, accepting the smallest absolute edit when it is a symptom patch, deleting tests or checks without equivalent public-boundary evidence, or treating a speculative abstraction as required work because it already appeared in the draft.

## Section Rules

### Proposed Approach

Name the recommended path, not every possible path; include alternatives only when the choice is material to risk, authorization, or cost.

Aim the approach at the layer that OWNS the behavior — the module, symbol, or contract where it originates — not the site where the symptom shows, even when the symptom site is the smaller edit. Smallest sufficient means smallest among root-cause-correct options, never smallest absolute. Chain "why does this behavior occur here?" until the next answer leaves the proposed edit boundary; if it still points deeper, the approach is aimed at a symptom and must move down. Falsification test: a fix that would have to be repeated at many call sites to be correct is a symptom patch — re-aim it at the owner. A root-cause approach may need a preparatory refactor first (make the change easy, then make the easy change) — order it as an earlier slice rather than patching around the un-refactored shape. State what the approach preserves and intentionally leaves out, and keep requested outcomes distinct from candidate implementations.

### Work Sequence

The work sequence is an execution map, not a backlog dump. Each slice names its purpose, likely files/surfaces/commands, dependency on earlier slices, and the forward and regression evidence that completes it. Order risky discovery, characterization, or contract checks before broad edits; put irreversible actions, external side effects, deployments, and destructive operations behind explicit pause conditions. This is the risk/discovery-first human reading order.

Before ordering, identify any change with NO independently-green intermediate — a rename without an alias, a signature, required-field, type, or representation change, or a moved invariant owner, where partial application leaves the code broken or wrong. Mark it as ONE indivisible slice that lands in a single cut; do not present it as "add the new path now, migrate callers later," which invites a permanent compatibility shim. A parallel-change sequence (expand → migrate → contract) is justified only when a consumer genuinely cannot change in the same unit because it is published, persisted, or in another repo; name that consumer, and make the contract step that deletes the old path a mandatory terminal slice, never optional cleanup. Unrequested backward-compatibility is a scoped decision to record, never a default to volunteer.

### Objective And Acceptance

Write one objective; do not turn milestones, tasks, or deliverables into separate objectives.

Acceptance results measure what becomes true, not which actions were performed. Each names the observable outcome, verification source, pass/fail threshold, and applicable scope when the domain permits — `All existing tests pass with [command]` rather than "works correctly", `No public API signatures, exported names, event payloads, or persisted formats change` rather than "compatible", `Rendered screenshots match the approved reference with 0 unapproved diffs` rather than "looks aligned". When automation is unavailable, define manual evidence: reviewer, artifact, rubric, and pass condition.

### Regression Evidence

A plan must identify the existing behavior, public contract, workflow, data format, visual surface, or integration boundary the change could accidentally break; protecting existing behavior usually matters more than proving the new path once.

For each material slice define both forward evidence (the new or changed behavior works) and regression evidence (relevant existing behavior still works). Regression evidence uses the smallest existing public boundary that protects real users or callers: existing tests, typecheck, lint, build, contract tests, E2E paths, CLI output, API responses, rendered UI states, persisted-data checks, characterization tests, or a manual smoke matrix. Do not satisfy it with weak substitutes — a new-code-only test, private-helper assertions, mock call counts without user-visible proof, "no obvious issues", or a successful compile when the behavior risk is outside compilation.

For high-risk work, plan a baseline check before edits so pre-existing failures are distinguished from new regressions. If full coverage is too expensive, stale, unavailable, or already failing, name the `Regression gap`, the accepted risk, and the next best evidence. For complex or high-risk changes a delegated Regression Gate analysis may identify existing behavior, public contracts, baselines, and coverage gaps; the plan still chooses the accepted evidence and names unresolved gaps.

If the project does not have enough tests to cover the regression surface, finish with a `Test gap decision` question: should the gaps be covered by targeted behavior test cases or end-to-end tests? For web projects prefer end-to-end tests unless a lower-level public-boundary test clearly gives equal confidence at lower cost. Do not silently add broad tests, defer the gap, or treat manual smoke as enough when the user needs to decide the coverage strategy.

### Risks And Rabbit Holes

Call out what could derail execution — hidden coupling, stale docs, migration parity gaps, visual mismatch, unclear product judgment, flaky tests, missing credentials, schema or API compatibility, generated-file churn — and for each give a containment plan or a pause condition.

## Design Gate

Run on every plan after the draft is complete, after the Lean Review Gate has been integrated or skipped, and before the plan is returned; it is not user-triggered. The pass is adversarial — try to defeat the drafted design shape with a materially different alternative instead of confirming it. Keep the plan frame fixed (objective, scope, non-goals, constraints, acceptance bar, regression bar, authorization boundaries); the pass reviews design shape, it does not restart planning.

Required before the plan is returned:

- the material design choice committed to: owner, boundary, representation, interface, error model, sequencing strategy, migration shape, or generated-artifact contract — including which layer owns the targeted behavior (origin vs symptom) and whether the change is irreducible (one cut) or genuinely supports a safe incremental / expand-contract path
- at least two viable, materially different options (the draft counts as one), the future maintainer or caller task each makes easier or harder, a complexity comparison mapped to APOSD symptoms and causes (change amplification, cognitive load, unknown-unknown risk, dependency, obscurity), and a local-fit comparison (existing patterns, public contracts, regression surface, implementation and validation cost, authorized boundary)
- the chosen design shape the executor inherits: module or API boundary, owner, callers, and changed contract surface; the complexity target (what future maintainers need not know after the change, and which symptom is avoided); the hidden knowledge kept behind the boundary (invariants, ordering constraints, derived state, error rules, special cases); and where invalid states are prevented or rejected
- the outcome applied: keep the drafted shape, revise the affected sections, or add a pause condition asking for one user decision

Independent evidence path. When a high-quality plan needs evidence researchable before the final plan — regression surface, source-of-truth behavior, migration parity, public-contract risk, visual reference, test strategy, or touchpoint discovery — do not jump from first understanding to final plan. First define a compact draft frame (`Objective`, `Scope`, `Non-goals`, known constraints, candidate approach, suspected regression surface, exact questions to answer); it may be incomplete but must let another pass investigate without inventing the goal. Then run the right pass via `agent-team`:

- `code-review` for design critique: implementation approach, module boundaries, public API shape, schema or persisted-state shape, wrapper behavior, abstraction choice, error ownership, information hiding — feed the second-design options into this critique. `plan-critic` is for executability, scope, sequencing, and verification weaknesses.
- [subagents/regression-gate.md](subagents/regression-gate.md), [subagents/implementation-surface.md](subagents/implementation-surface.md), [subagents/contract-parity.md](subagents/contract-parity.md), and [subagents/plan-critic.md](subagents/plan-critic.md) for those bounded passes.

Each pass is valid only with a bounded question, an expected evidence format, and an integration target. Integrate findings into the affected sections — especially `Required context`, `Proposed approach`, `Work sequence`, `Acceptance, regression evidence, and verification`, `Risks and rabbit holes`, `Checkpoints`, `Pause conditions`, and `Stop condition` — keeping only what changes scope, order, evidence, risk, or completion criteria.

Record the result compactly in `Planning iteration`: the design choice tested, the losing option and why it lost, and which sections changed. If there is no material design choice — a mechanical change with one viable shape — record that conclusion, the layer that owns the behavior, and whether the change is irreducible, in one line; the owner and irreducibility facts are never skippable, only the two-option comparison is. If the gate surfaces unresolved ownership, API, schema, persistence, or compatibility risk, take the conservative path named in the Scope Triage Gate.

Weak substitutes do not satisfy this gate: a single real option plus a strawman, superficial naming variants, generic pros and cons, "cleaner" without a maintainer task, future-flexibility theater, skipping the pass because the draft already looks good, "keep it simple", style-only critique, listing alternatives without choosing, generic abstractions for future flexibility; asking a sub-agent to "review the plan", delegating broad planning ownership, bypassing `agent-team`, pasting unintegrated findings, treating another agent's conclusion as accepted without source evidence, delegating work the main session can answer from already-inspected context; or a revision that changes public API, schema, persistence, security posture, deployment, or external side effects without authorization.

## Specialized Gates

These two gates fire only on their trigger, and each adds required fields the plan is incomplete without. When one activates, read [references/specialized-gates.md](references/specialized-gates.md) before writing acceptance.

- **Visual Reference Gate** — activates when the user provides a Figma URL, screenshot, mock, or design frame, or asks to match a visual reference.
- **Migration Parity Gate** — activates when migrating a component, module, workflow, framework, or implementation from a source project or path into a target.

## Self-Review

Each gate states its own required evidence and incomplete behavior — the two Specialized Gates in [references/specialized-gates.md](references/specialized-gates.md); if either fired, check the plan against that file rather than from memory. Do not re-check the rest here. These are the failure modes no single gate catches, and a yes to any one leaves the plan incomplete until fixed:

- Could an agent execute this plan without inventing the background, objective, boundaries, or order?
- Could an agent claim completion without running the stated verification, or does any acceptance result measure an action performed rather than an outcome that became true?
- Could an agent read a candidate implementation, speculative feature, or adjacent refactor as required work — or did a lean reduction quietly drop a requested outcome, the behavior owner, or a quality boundary?
- Could a risky slice ship on forward evidence alone, with nothing protecting the existing behavior it could break?
- Is any section low-signal filler, or does a gate's required evidence sit buried in prose instead of in the plan section that owns it?

## Stop Rules

Stop when the user has one executable plan that passed the Lean Review Gate or recorded a valid skip reason, passed the Design Gate, the required `Test gap decision` question for unresolved regression gaps, the next narrow clarification question, or a blocker list naming which missing facts prevent a faithful plan.

When scope risk is unresolved, stop only after the plan names the conservative no-boundary-change path, the user decision needed, or the pause condition that blocks expansion. When independent or delegated research is used, stop only after the final plan integrates the relevant findings — dropping any finding that changed no section as ceremonial — and names unresolved evidence gaps, waived risks, or user decisions; not with unintegrated notes unless the user asked for raw research output.

The next phase is separate unless already authorized: implementation, file edits, documentation changes, test execution, commits, pushes, deployment, or external side effects require the user's current request or an active execution task.
