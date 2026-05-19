---
name: code-plan
description: >-
  Write evidence-backed coding plans for implementation, debugging, refactoring, migrations, design parity work, and long-running agent tasks. Use when defining, clarifying, refining, or validating a development plan, /goal prompt, implementation approach, scope and non-goals, work sequence, acceptance criteria, regression evidence, verification strategy, or stop condition. Near miss: use code-review when judging an existing diff, spec, or already drafted plan rather than drafting or revising a plan.
---

# Code Plan

## Goal

Produce one self-contained engineering plan that another agent can execute without losing the user's intent, context, boundaries, validation bar, implementation strategy, ordering, or stopping condition.

A plan is not just a Goal contract and not just a task list. It should explain why the work matters, what must be true at the end, how the work should be approached, what order to use, how to verify it, which risks to watch, and when to pause or stop.

## Hard Requirements

Every plan is incomplete unless it includes:

- background/problem context in the user's terms
- one durable objective and target outcome
- scope, non-goals, constraints, and authorization boundaries
- required context to inspect before implementation
- a recommended approach with the main tradeoff or rationale
- ordered work slices with dependencies or sequencing reasons when order matters
- acceptance results that distinguish outcomes from implementation tasks
- regression surface and regression evidence for existing behavior that must keep working
- verification commands, artifacts, review gates, or manual evidence
- risks, rabbit holes, assumptions, and pause conditions
- a concrete stop condition

Serious, uncertain, or design-risk plans also require:

- `Planning iteration` status: independent research, delegated research, design review, local review, or explicit skip reason
- integration of any research or review findings into concrete scope, sequence, regression evidence, risks, checkpoints, pause conditions, or stop conditions
- for material design-shape risk, a design critique through `code-review` or an equivalent local review, plus an explicit reason if the critique was skipped
- a user decision question for unresolved regression gaps caused by insufficient project tests

Do not split the artifact into separate goal, spec, and plan documents unless the user asks. Keep one cohesive plan.

## Evidence Budget

Start from the user's request and provided artifacts. Inspect local files, docs, issues, screenshots, Figma links, logs, tests, or existing plans only when they affect objective, scope, implementation approach, sequencing, acceptance, verification, risk, or stop conditions.

Ask a focused question when a missing fact would materially change the plan or authorize external side effects. Otherwise proceed with a conservative assumption and label it in the plan.

High-impact missing facts include target files or surfaces, source-of-truth behavior, allowed differences, required verification commands, credentials, deployment, destructive actions, persistent config changes, and public contract changes.

Use independent research only for questions whose answers can materially improve the plan. When sub-agents might help, use `meta-subagent-orchestration` to decide whether delegation is authorized and worth the overhead. If delegation is not used, keep the research local and record the skip reason only when it affects coverage, risk, or trust.

## Planning Clarity Gate

Activate this gate when the request is too broad, conflicting, or under-specified to produce a faithful plan.

Required evidence before drafting:

- the request and provided artifacts were inspected
- unclear boundaries are answered, conservatively assumed, or listed as blockers
- questions are specific and ordered by impact on the plan

Weak substitutes do not satisfy the gate: a broad checklist, multiple unchosen interpretations, hidden assumptions, or "adjust later" language.

If the user wants to proceed without answers, record the assumptions under `Clarification status`, `Scope`, `Non-goals`, `Assumptions`, `Risks`, or `Pause conditions`.

## Plan Shape

Use the shortest structure that preserves the plan's executable value. For most coding plans, use these sections in this order:

1. `Clarification status` - clear enough, assumptions, or blockers.
2. `Background / problem` - why this work exists and what pain or requirement it addresses.
3. `Objective` - one durable outcome.
4. `Scope` - included files, modules, routes, workflows, states, users, data, or environments.
5. `Non-goals` - adjacent work and boundary changes that stay out.
6. `Required context` - specific files, docs, tests, screenshots, issues, commands, traces, or source baselines to read first.
7. `Planning iteration` - only when useful: draft frame, independent research, delegated research, or design review used or skipped, and findings integrated.
8. `Proposed approach` - recommended implementation direction and why it fits the constraints.
9. `Work sequence` - ordered slices with purpose, likely touchpoints, dependencies, and proof expected after each slice.
10. `Acceptance, regression evidence, and verification` - observable results, preserved behaviors, thresholds, data sources, commands, artifacts, review gates, coverage gaps, and scope.
11. `Risks and rabbit holes` - likely traps, unknowns, tradeoffs, and how to avoid or contain them.
12. `Checkpoints` - evidence to report before moving past risky or irreversible points.
13. `Stop condition` - concrete state where work is done and the agent should stop.
14. `Pause conditions` - conditions requiring user input or authorization.
15. `Progress report format` - only for long-running tasks.

For small plans, collapse obvious sections, but keep objective, scope/non-goals, approach, work sequence, regression evidence, acceptance/verification, pause conditions, and stop condition explicit.

## Section Rules

### Objective And Acceptance

Write one objective. Do not turn milestones, tasks, or deliverables into separate objectives.

Acceptance results should measure what changes or becomes true, not merely which actions were performed. Each acceptance result should name the observable outcome, verification source, pass/fail threshold, and applicable scope when the domain permits.

Prefer:

- `All existing tests pass with [command]` over `works correctly`.
- `No public API signatures, exported names, event payloads, or persisted formats change` over `compatible`.
- `Rendered desktop and mobile screenshots match the approved reference with 0 unapproved diffs` over `looks aligned`.
- `Manual review by [role] passes [rubric]` over `quality is good`.

When automation is unavailable, define manual evidence: reviewer, artifact, rubric, and pass condition.

### Planning Iteration And Independent Evidence Gate

Treat every serious plan as an artifact that should withstand scrutiny. Do not jump from first understanding to final plan when independent research or review could materially improve correctness.

Activate this gate when a high-quality plan needs evidence that can be researched independently before the final plan is written, such as regression surface analysis, source-of-truth behavior, migration parity, public contract risk, visual reference review, test strategy, or implementation touchpoint discovery.

Before delegated or independent review, the main session must define a compact draft planning frame: `Objective`, `Scope`, `Non-goals`, known constraints, candidate approach, suspected regression surface, and the exact questions the research or review must answer. The draft can be incomplete, but it must contain enough context for another agent or local review pass to investigate without inventing the goal.

Use `meta-subagent-orchestration` before any sub-agent operation. Delegate only when that skill classifies delegation as authorized and useful. Useful independent tasks include:

- inspecting regression surface and existing test coverage
- checking public API, schema, persistence, or migration compatibility
- reviewing visual/design parity requirements
- researching relevant code paths, prior plans, issues, logs, or docs
- stress-testing the draft plan for missing constraints, unsafe order, or weak verification

Use `code-review` rather than `plan-critic` when the draft plan needs design critique: implementation approach, module boundaries, public API shape, schema or persisted-state shape, wrapper behavior, abstraction choice, error ownership, or information hiding. `plan-critic` is for executability, scope, sequencing, and verification weaknesses.

When delegation is authorized, load only the sub-agent prompt file needed for that task:

- [subagents/regression-gate.md](subagents/regression-gate.md) for regression surface, existing behavior, coverage gaps, and test strategy
- [subagents/implementation-surface.md](subagents/implementation-surface.md) for likely touchpoints, dependencies, sequencing, and risky code paths
- [subagents/contract-parity.md](subagents/contract-parity.md) for public API, schema, persistence, migration, visual, or behavior parity
- [subagents/plan-critic.md](subagents/plan-critic.md) for adversarial review of a draft plan before finalization

Delegated or local independent work is valid only when it has a bounded question, an expected evidence format, and an integration target in the final plan. Useful outputs include regression surfaces, baseline commands, affected files, public contracts, existing test coverage, coverage gaps, risks, and recommended verification evidence.

Weak substitutes do not satisfy this gate: asking a sub-agent to "review the plan", delegating broad planning ownership, bypassing `meta-subagent-orchestration`, pasting unintegrated findings, adding ceremonial parallel tasks, treating another agent's conclusion as accepted without source evidence, or delegating work the main session can answer from already inspected context.

The final plan must integrate delegated findings into the relevant sections, especially `Required context`, `Proposed approach`, `Work sequence`, `Acceptance, regression evidence, and verification`, `Risks and rabbit holes`, `Checkpoints`, `Pause conditions`, and `Stop condition`. Keep only findings that change scope, order, evidence, risk, or completion criteria.

### Design Review Gate

Activate this gate when the plan chooses or changes module boundaries, shared abstractions, public APIs, CLI contracts, schemas, persisted state, wrapper semantics, generated artifacts, error handling, or cross-module ownership. Also activate it when a small-looking change could push complexity onto future callers or maintainers.

Before the final plan, create a draft planning frame and run `code-review` as a design critique when the host can apply another skill within the current authorization boundary. If skill chaining or delegation is unavailable, perform the same design-shape review locally and record that in `Planning iteration`.

The final plan is incomplete unless it names:

- the proposed design shape: module or API boundary, owner, callers, and changed contract surface
- the complexity target: what future maintainers should not need to know after the change, and which complexity symptom the plan is avoiding: change amplification, cognitive load, or unknown-unknown risk
- the hidden knowledge: invariants, ordering constraints, derived state, error rules, or special cases the design keeps behind the right boundary
- the invariant and error owner: where invalid states are prevented or rejected
- at least one plausible alternative when the design choice is material, plus why the chosen shape reduces current complexity
- design-review findings that changed approach, scope, work sequence, acceptance evidence, risks, checkpoints, pause conditions, or stop condition

Weak substitutes do not satisfy the gate: "keep it simple", style-only critique, listing alternatives without choosing, adding generic abstractions for future flexibility, calling a broad review without design questions, or leaving review findings unintegrated.

If design review surfaces unresolved ownership, API, schema, persistence, or compatibility risk, the final plan must either choose the conservative no-boundary-change path, ask one user decision question, or mark a pause condition.

### Regression Evidence

Regression evidence is usually more important than proving the new code path once. A plan must identify the existing behavior, public contract, workflow, data format, visual surface, or integration boundary that the change could accidentally break.

For each material work slice, define both:

- forward evidence: proof that the new or changed behavior works
- regression evidence: proof that relevant existing behavior still works

Regression evidence should use the smallest existing public boundary that protects real users or callers: existing tests, typecheck, lint, build, contract tests, E2E paths, CLI output, API responses, rendered UI states, persisted data checks, characterization tests, or a manual smoke matrix.

Do not satisfy regression evidence with weak substitutes such as a new-code-only test, private helper assertions, mock call counts without user-visible proof, "no obvious issues", or a successful compile when behavior risk is outside compilation.

For high-risk work, plan a baseline check before edits when feasible, so pre-existing failures are distinguished from new regressions. If full regression coverage is too expensive, stale, unavailable, or already failing, name the `Regression gap`, the accepted risk, and the next best evidence.

If the project does not have enough tests to cover the regression surface, finish the plan with a `Test gap decision` question. Ask whether the remaining gaps should be covered by targeted behavior test cases or end-to-end tests. For web projects, recommend end-to-end tests unless a lower-level public-boundary test clearly gives equal confidence at lower cost.

Do not silently choose to add broad tests, defer the gap, or treat manual smoke as enough when the user needs to decide the coverage strategy.

For complex or high-risk changes, a delegated Regression Gate analysis may identify existing behavior, public contracts, baseline checks, coverage gaps, and the smallest useful regression evidence. The final plan must still choose the accepted evidence and name unresolved gaps.

### Proposed Approach

Name the recommended path, not every possible path. Include alternatives only when the choice is material to risk, user authorization, or implementation cost.

The approach should explain the reasoning boundary: why this is the smallest sufficient path, what it preserves, and what it intentionally leaves out.

### Work Sequence

The work sequence is an execution map, not a backlog dump. Each slice should have:

- purpose
- likely files, modules, surfaces, or commands involved
- dependency on earlier slices when relevant
- forward and regression evidence that the slice is complete

Order risky discovery, characterization, or contract checks before broad edits. Put irreversible actions, external side effects, deployments, and destructive operations behind explicit pause conditions.

### Risks And Rabbit Holes

Call out details that could derail execution: hidden coupling, stale docs, migration parity gaps, visual mismatch, unclear product judgment, flaky tests, missing credentials, schema or API compatibility, and generated-file churn.

For each meaningful risk, either state the containment plan or mark it as a pause condition.

## Specialized Gates

### Visual Reference Gate

Activate when the user provides a Figma URL, screenshot, mock, design frame, or asks to match a visual reference.

The plan is incomplete unless the first acceptance result names the reference source, target surface, states, viewport matrix, required evidence, allowed masks, and review rule.

Default threshold: 0 unapproved visual diffs. Dynamic text or data may be masked; layout, spacing, typography, colors, borders, radius, shadows, icons, selected states, empty states, and filled states may not be masked unless the user explicitly approves.

Weak substitutes do not satisfy this gate: `looks aligned`, `manual smoke`, `Figma inspect`, or an uncaptured screenshot comparison.

### Migration Parity Gate

Activate when migrating a component, module, workflow, framework, or implementation from a source project/path into a target.

The plan is incomplete unless it names the source baseline, target location, public contract surface, fixture/state matrix, parity evidence, allowed differences, and stop gate.

Adapting imports, file layout, naming, formatting, framework conventions, local helpers, and design-system primitives does not authorize observable behavior changes.

## Self-Review

Before returning the plan, check:

- Could an agent execute the plan without inventing the background, objective, boundaries, or order?
- For serious or uncertain plans, did the main session draft enough context and use or explicitly skip useful independent research?
- If delegated research was used, did the main session define the objective, scope, non-goals, and exact research questions before delegation?
- If delegation was considered, did the plan rely on `meta-subagent-orchestration` for authorization and coordination?
- Did each delegated finding change a concrete part of the final plan: scope, sequence, regression evidence, risk, checkpoint, pause condition, or stop condition?
- Are any delegated tasks ceremonial, broad, unbounded, or pasted without integration? If yes, remove them or rewrite them into bounded evidence questions.
- If the plan has design-shape risk, did `code-review` or an equivalent design critique inspect interface depth, information hiding, invariant/error ownership, and complexity pushed to callers?
- Did design-review findings change the final plan, or does `Planning iteration` explain why no plan change was needed?
- Does the final plan remain one cohesive executable plan rather than a bundle of sub-agent notes?
- Does the plan explain why the recommended approach fits better than obvious alternatives?
- Are acceptance results outcomes, not task completions?
- Does every risky slice protect existing behavior with regression evidence, not only prove the new path?
- If project tests are insufficient, does the plan ask the user to choose targeted behavior tests or end-to-end tests, with E2E recommended for web projects?
- Is every risky work slice tied to evidence, containment, or a pause condition?
- Could an agent claim completion without running or reporting the stated verification? If yes, rewrite the stop condition.
- If a hard gate applies, does the output contract require the gate's evidence rather than burying it in prose?
- Is any section low-signal filler that should be removed or collapsed?

## Stop Rules

Stop when the user has one executable plan, the required `Test gap decision` question for any unresolved regression gaps, the next narrow clarification question, or a blocker list explaining which missing facts prevent a faithful plan.

When independent or delegated research is used, stop only after the final plan integrates the relevant findings and names unresolved evidence gaps, waived risks, or user decisions. Do not stop with unintegrated notes unless the user explicitly asked for raw research output.

The next phase is separate unless already authorized: implementation, file edits, documentation changes, test execution, commits, pushes, deployment, or external side effects require the user's current request or an active execution task.
