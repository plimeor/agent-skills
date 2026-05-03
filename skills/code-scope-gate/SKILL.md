---
name: code-scope-gate
description: >-
  Scope gate for coding, debugging, refactoring, automation, implementation
  planning, requirement design, and code review when the task may grow beyond the
  requested outcome. Use it to separate the actual request from candidate
  solutions, delete unnecessary scope, avoid unauthorized boundary changes, and
  choose the smallest sufficient path before work proceeds. Show a visible gate
  when the user asks for minimal scope or when scope risk affects the plan;
  otherwise apply it silently. Formerly framed around the first three steps of
  the Musk five-step method.
---

# Code Scope Gate

## Goal

Find the smallest sufficient deliverable that correctly satisfies the user's
request.

Use this skill as a pre-commitment gate before requirements design, planning,
code work, debugging, refactoring, automation, or review when scope risk could
change the result.

## Success Criteria

A good scope gate:

- Separates the actual requested outcome from candidate implementations.
- Names explicit constraints, inferred assumptions, and the Definition of Done.
- Deletes, defers, reuses, or avoids at least one unnecessary surface when scope
  risk exists.
- Chooses the smallest coherent path that still satisfies correctness,
  maintainability, and verification.
- Classifies boundary changes as avoided, authorized, or blocked pending user
  confirmation.

## Constraints

This skill implements only the first three steps of the Musk-style five-step
algorithm:

1. Question requirements.
2. Delete unnecessary parts, process steps, and scope.
3. Simplify or optimize only what still needs to exist.

Stop there. Do not move into acceleration or automation unless the user
explicitly asks for it or the current task already requires it.

Treat changes to public behavior, shared contracts, APIs, schemas, persistence,
security posture, deployment, or cross-module ownership as `Boundary Change`.
If a boundary change is not authorized, provide the best local alternative. If no
local alternative can satisfy the request, stop and ask for confirmation.

## Trigger And Visibility

Use the reasoning whenever the request involves requirement design, PRD shaping,
implementation planning, coding, debugging, refactoring, scripting, automation,
or review and the work could expand beyond the requested outcome.

Show a visible `Scope Gate` when:

- The user explicitly asks for minimal scope, minimal code, a scope gate,
  simplicity, or avoidance of overengineering.
- The request mixes a desired outcome with a proposed implementation and the
  distinction affects the plan.
- The work may add features, roles, states, screens, fields, abstractions,
  dependencies, configuration, persistence, schemas, workflows, APIs, or
  cross-module behavior.
- A boundary change appears necessary or tempting.

Apply the reasoning silently for ordinary low-risk work where the correct scope
is clear. Skip a visible gate for typo fixes, wording tweaks, a single requested
command, fully authorized large rewrites, or emergencies where immediate
containment matters more than up-front design.

## Evidence Budget

Start with the user's request, specified files, failure output, nearby code, and
existing project constraints.

Continue reading or searching only when a missing fact would change:

- the Definition of Done
- whether a boundary change is authorized
- ownership of the requirement
- runtime behavior or user-visible behavior
- schema, API, persistence, deployment, or security impact
- the verification needed to trust the result

Stop retrieval once you can state the actual request, the unnecessary scope to
delete or defer, the boundary status, and concrete verification. Do not continue
looking for phrasing, generic examples, or nonessential background.

## Scope Decision

### Question

Recover the actual request before improving the proposed solution.

Ask:

- What outcome does the user need?
- What evidence supports the need: user statement, bug report, failing test,
  runtime behavior, product requirement, customer workflow, or existing code
  contract?
- Which constraints are explicit?
- Which assumptions are invented?
- Which items are requirements, and which are candidate implementations?
- Who owns the requirement or can answer for it?
- What must remain unchanged?

If a requirement cannot be tied to a concrete outcome, downgrade it to a
candidate or remove it from the current scope. If missing information would
materially change the result, ask one narrow question before continuing. If it
does not change the main path, proceed with a conservative assumption and state
it briefly.

### Delete

Before adding features, files, abstractions, process, or code, identify what can
be removed, avoided, reused, delayed, or left unchanged.

Default cuts:

- Features not requested by the user.
- Requirements that do not map to the actual outcome.
- Options, fields, states, screens, flows, or roles that only serve hypothetical
  future cases.
- Single-use abstractions.
- New dependencies, configuration, persistence, schemas, scripts, CI jobs, or
  automation not required for the current Definition of Done.
- Refactors of adjacent code.
- Public behavior, API, data-model, security, deployment, or cross-module
  boundary changes without explicit authorization.

Prefer no-op, documentation, existing behavior, a local fix, or reuse of an
existing path when any of them satisfies the actual request. Keep an item only
when deleting it would harm correctness, maintainability, or verification, and
state why.

### Simplify

Only simplify work that survived deletion.

For requirement or plan design, reduce the deliverable to one clear goal, keep
only necessary constraints, state non-goals explicitly, define checkable
completion criteria, and move unvalidated expansions to `Optional` or `Future`.

For code work, use existing patterns, helpers, APIs, and boundaries; change the
smallest coherent file set; prefer boring direct code over generic
infrastructure; and add an abstraction only when it removes real duplication or
reduces real complexity now.

## Output

When the user explicitly invokes this skill, or when the task has clear scope
risk, start with a compact gate:

```markdown
## Scope Gate

Actual request:
- [The real outcome to deliver]

Requirement check:
- [Confirmed facts, assumptions, and candidate solutions]

Deletes:
- [What is removed, deferred, reused, or kept out of scope]

Smallest sufficient path:
- [The smallest plan or implementation path that still satisfies the request]

Boundary:
- [No boundary change / Authorized boundary change / Unauthorized boundary change with local alternative]

Verification:
- [Concrete checks or evidence needed to trust the result]

Next action:
- [Proceed / Ask one question / Stop for authorization]
```

After the gate, continue only if the next step is within scope and authorized.
For code work, implement the smallest sufficient path and verify it. For review,
report scope creep, unnecessary abstractions, or unauthorized boundary changes
before style nits.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "This will be useful later." | Future usefulness is not current scope. Put it in `Future` unless required now. |
| "It's cleaner if we make it generic." | Generic code is only cleaner when the extra abstraction pays rent immediately. |
| "While I'm here, I can refactor this." | Adjacent cleanup is a separate change unless necessary for the request. |
| "Automation will save time." | Automating the wrong or unnecessary process preserves waste. Delete and simplify first. |
| "The requirement came from someone senior." | Seniority is not evidence. The requirement still needs an owner, rationale, and success criteria. |
| "This is too small for a gate." | Then the gate should be tiny or silent, not skipped when scope risk exists. |

## Stop Rules

Stop the gate when the actual request, Definition of Done, deletion choices,
smallest sufficient path, boundary status, and verification are clear enough to
act.

Do not keep expanding the plan after that point. Do not continue into
acceleration, automation, platform work, adjacent refactors, or future options
unless the user explicitly authorizes that larger boundary.

Before treating the gate as complete, confirm:

- Requirements are separated from candidate implementations.
- At least one deletion, reuse, no-op, or deferral option was considered when
  scope risk exists.
- Boundary changes are avoided, authorized, or blocked pending confirmation.
- Verification is proportional to risk and names concrete checks, such as
  targeted tests, type checks, lint, build, smoke checks, requirement-to-step
  trace, or file/line review evidence.
