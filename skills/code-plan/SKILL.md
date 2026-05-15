---
name: code-plan
description: >-
  Write complete, measurable Codex Goal contracts for coding work from user intent. Use when defining, clarifying, refining, or validating goals, /goal prompts, durable coding objectives, acceptance criteria, measurable outcomes, stop conditions, validation loops, Figma or design parity, behavior-preserving migrations, refactors, debugging, implementation tasks, or long-running code agent work. Clarifies ambiguous user intent and goal boundaries before drafting unless the objective, scope, exclusions, acceptance bar, and stop condition are already clear. Produces intent, scope, non-goals, acceptance results, verification, checkpoints, pause conditions, and stop conditions before planning or execution.
---

# Code Plan

## Goal

Produce a self-contained coding Goal contract that another agent can follow across a long-running engineering task without losing the user's intent, acceptance bar, boundaries, or stopping condition.

The contract emphasizes final acceptance results over implementation approach. It names what done means in observable, measurable terms, and it keeps design, planning, and execution as separate downstream work.

## Success Criteria

A strong Goal contract:

- States one durable objective rather than a backlog or broad project wish.
- Preserves the user's intent in the user's terms.
- Separates scope, non-goals, constraints, and allowed differences.
- Converts completion into measurable acceptance results with metric, threshold, data source, and scope.
- Names the context the agent must inspect before acting, such as files, docs, issues, Figma links, screenshots, logs, commands, or plans.
- Defines a validation loop, checkpoint evidence, stop condition, pause conditions, and compact progress-report format.
- Makes subjective quality bars evaluable through examples, rubrics, score thresholds, or human review gates.

## Evidence Budget

Start from the user's request and any artifacts they provided. Inspect local files, screenshots, Figma references, docs, issues, tests, logs, or existing plans only when they affect the goal's acceptance bar, validation loop, boundary, or stop condition.

Ask as many focused questions as needed when missing information would materially change acceptance. Continue the clarification loop until the goal boundary is clear enough to draft, or until the user explicitly asks you to proceed with stated assumptions. Otherwise proceed with a conservative assumption and label it in the contract.

High-impact missing facts include:

- the target artifact, route, component, module, repository, or file set
- the source of truth for expected behavior or visuals
- allowed differences from current behavior or the reference design
- required verification commands, environments, browsers, viewports, fixtures, or scores
- credentials, external side effects, destructive operations, deployment, or persistence changes

## Goal Boundary Clarification Gate

Before writing the Goal contract, decide whether the user's request is clear enough to preserve intent, boundaries, acceptance, and stopping condition.

The gate applies when any of these are missing, conflicting, or broad enough to change the contract:

- objective: the durable outcome the agent should achieve
- scope: target artifacts, routes, modules, workflows, states, or repositories
- non-goals: adjacent work, behaviors, systems, or decisions that should stay out
- acceptance bar: observable results, thresholds, evidence, review gate, or verification command
- stop condition: the concrete state where the agent should stop
- authorization boundary: external side effects, destructive actions, persistence changes, deployments, credentials, or shared contract changes

Required evidence before drafting:

- the request text and provided artifacts have been inspected
- each unclear boundary is either answered by the user, made explicit as a conservative assumption, or listed as a blocker
- clarification questions are specific, answerable, and ordered by impact on the contract

Ask multiple questions when multiple boundary facts are needed before drafting. Group related questions together when that is more efficient for the user, and continue with follow-up questions across turns until the objective, scope, non-goals, acceptance bar, authorization boundary, and stop condition are clear enough to write.

Do not replace clarification with weak substitutes such as a broad plan, a list of possible interpretations, hidden assumptions, or "we can adjust later" language. If the user wants to proceed without answering, write the assumptions into `Clarification status`, `Scope`, `Non-goals`, `Acceptance results`, `Allowed differences`, or `Pause conditions`.

The Goal contract is incomplete while required boundary facts are missing and cannot be safely assumed. In that case, return the smallest useful blocker list or the next clarification question instead of drafting the contract.

## Visual Reference Gate

If the user provides a Figma URL, screenshot, mock, design frame, or asks to match a design, the Goal contract is incomplete unless it includes a first-class visual acceptance result.

Default threshold: 0 unapproved visual diffs.

The visual acceptance result must name:

- reference source: Figma node, screenshot, or mock
- target surface, states, and viewport matrix
- required evidence: reference screenshot, actual screenshot, pixel diff artifact, and mask list
- allowed masks: dynamic text/data only; never mask layout, spacing, typography, colors, borders, radius, shadows, icons, selected state, empty state, or filled state
- review rule: any nonzero diff must be fixed or explicitly approved as an allowed difference
- stop gate: the goal is not complete without reference / actual / diff evidence and 0 unapproved diffs

Do not treat `manual smoke`, `Figma inspect`, `screenshot comparison`, `visual review`, or `looks aligned` as substitutes for pixel diff evidence unless the user explicitly waives pixel comparison.

## Output Contract

When the user asks for a goal, produce this shape. Keep the `Ready Goal` self-contained enough to paste into `/goal` or a long-running task prompt.

```markdown
Clarification status:
- [Clear enough to draft, or blocked on specific boundary questions. Include assumptions accepted by the user or made conservatively.]

Ready Goal:
[One complete goal statement. Include the objective, boundaries, acceptance bar, validation loop, and stop condition.]

Intent:
- [Why the user wants this outcome, in the user's terms.]

Objective:
- [One durable objective.]

Scope:
- [Included surfaces, artifacts, states, routes, modules, or workflows.]

Non-goals:
- [Explicitly excluded work, behaviors, files, systems, or decisions.]

Required context:
- [Files, docs, links, screenshots, Figma frames, logs, tests, commands, plans, or issues to read first.]

Acceptance results:
- Result: [Observable outcome.]
  Metric: [What is measured.]
  Threshold: [Pass/fail boundary.]
  Data source / verification: [Command, screenshot diff, test, API response, rendered UI, log, artifact, or human review gate.]
  Scope: [Browsers, viewports, fixtures, states, locales, modules, or inputs.]

Allowed differences:
- [Changes explicitly permitted by the user or existing project contract.]

Validation loop:
- [Exact checks to run, when to run them, and how to react to failure.]

Checkpoints:
- [Milestones and proof required at each checkpoint.]

Stop condition:
- [Concrete state where the agent should stop because the goal is met.]

Pause conditions:
- [Conditions requiring user input, such as ambiguous product judgment, missing access, failed validation needing scope choice, destructive action, deployment, or boundary conflict.]

Progress report format:
- Current checkpoint:
- Changes made:
- Verification run:
- Result:
- Remaining work:
- Blockers:
```

For small goals, keep the same fields but collapse empty or obvious sections. Keep `Acceptance results`, `Validation loop`, and `Stop condition` explicit.

When the Visual Reference Gate applies, make the visual acceptance result the first Acceptance result.

## Quantification Rules

Each acceptance result should be as measurable as the domain permits.

Prefer:

- `All existing tests pass with [command]` over `works correctly`.
- `No public API signatures, exported names, event payloads, or persisted formats change` over `compatible`.
- `Score reaches at least 0.90 on [eval command]` over `improves quality`.
- `No new console errors, type errors, lint errors, accessibility violations, or failed network requests in [scope]` over `polished`.

When exact automation is unavailable, define the manual acceptance evidence: who reviews, what artifact they inspect, which rubric they apply, and what result counts as pass.

## Migration Parity Gate

If the user asks to migrate a component, module, workflow, framework, or implementation from a source project/path into the current project, the Goal contract is incomplete unless it includes a first-class migration parity acceptance result.

Adapting imports, file layout, naming, formatting, framework conventions, local helpers, and design-system primitives does not permit observable behavior changes.

The migration acceptance result must name:

- source baseline and target location
- public contract surface: exports, props, inputs, outputs, errors, events, callbacks, API payloads, persisted data, accessibility/keyboard behavior, side effects, and timing behavior that apply
- fixture matrix: representative inputs, states, permissions, loading, empty, error, and edge cases
- parity evidence: existing tests, authorized characterization tests, side-by-side output/DOM/API/log comparison, manual smoke evidence, screenshots, or contract checks
- allowed differences: explicit behavior, style, dependency, or framework-adaptation differences
- stop gate: the goal is not complete if source baseline, contract surface, fixture matrix, parity evidence, or allowed differences are missing

When a migration also has a Figma/screenshot/design reference, both the Visual Reference Gate and Migration Parity Gate apply. Make the visual acceptance result first, then the migration parity acceptance result.

## Clarification Rules

Clarify before drafting when the user's target is under-specified. The goal is not to interview by default; it is to prevent an ambiguous request from becoming a false contract.

Ask all questions needed to make the contract faithful enough to execute. Keep each question narrow, but do not limit the count when the user's target remains ambiguous. Ask only when the answer changes the goal's objective, scope, non-goals, acceptance threshold, validation method, authorization boundary, or stop condition.

Useful narrow questions:

- `Which Figma frame or selection URL is the source of truth?`
- `What viewport and state matrix must count for acceptance?`
- `Which source project path is the behavior baseline for this migration?`
- `Are any behavior differences allowed, or should parity be exact?`
- `Which command is the authoritative validation check?`

Ask about visual diff threshold only if the user explicitly wants a lower bar than the default. Default is 0 unapproved diffs.

If the user says to proceed without the answer, write the conservative assumption into `Required context`, `Acceptance results`, or `Allowed differences`.

## Self-Review

Before returning the Goal contract, check:

- `Clarification status` shows the goal is clear enough to draft, or names the specific unresolved blockers.
- The contract has exactly one objective.
- Acceptance results are observable and include metric, threshold, data source, and scope where possible.
- Non-goals and allowed differences protect the user's boundary.
- Could an agent skip needed clarification, assume the user's boundary, and still sound compliant? If yes, ask the next boundary question or record the assumption explicitly before drafting.
- If a visual reference exists, could an implementation agent claim completion without reference / actual / diff artifacts? If yes, rewrite the goal.
- Migration goals include public contract, fixture, test, and allowed-difference parity.
- The stop condition is concrete enough for an agent to stop without asking.
- Pause conditions cover ambiguity, missing access, external side effects, destructive changes, and failed validation requiring product judgment.

## Stop Rules

The skill is complete when the user has either an approvable Goal contract whose boundary is clear enough to execute, the next narrow clarification question, or a short list of blockers that materially prevent writing one.

The next phase is a separate action: setting `/goal`, planning, coding, writing documentation, running tests, or changing files requires the user's current request or an already active execution task.
