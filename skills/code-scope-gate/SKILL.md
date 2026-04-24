---
name: code-scope-gate
description: >-
  Gates product requirements, implementation plans, bug fixes, refactors, automation requests, and code reviews before they grow too large. Use when the user asks for requirement design, PRD shaping, implementation planning, coding, debugging, refactoring, scripting, automation, or review and there is risk of overengineering, speculative abstraction, unnecessary scope, solution-first thinking, or silent boundary changes. Also use when the user says "minimal change", "keep it simple", "scope gate", "avoid overengineering", "don't overbuild", "Musk five-step method", or "The Algorithm".
---

# Code Scope Gate

Use this skill as a pre-commitment gate before requirements design or code work. Its job is to prevent a simple request from turning into an oversized plan or implementation.

The skill implements the first three steps of the Musk-style five-step algorithm:

1. Question requirements.
2. Delete unnecessary parts, process steps, and scope.
3. Simplify or optimize only what still needs to exist.

Stop there. Do not move into acceleration or automation unless the user explicitly asks for it or the current task already requires it.

The central question is:

> What is the smallest sufficient deliverable that correctly satisfies this request?

## When To Use

Use this skill when any of these are true:

- The task involves requirement design, PRD shaping, implementation planning, coding, debugging, refactoring, scripting, automation, or code review.
- The request mixes a desired outcome with a proposed implementation, and those need to be separated.
- The work could introduce new features, roles, states, screens, fields, abstractions, dependencies, configuration, persistence, schemas, workflows, APIs, or cross-module behavior.
- The task could turn into architecture, platform work, automation, or a long-term roadmap without explicit approval.
- The user explicitly asks for minimal scope, minimal code, a scope gate, simplicity, or avoidance of overengineering.
- You feel tempted to say "while I'm here", "this may be useful later", "we should make it generic", or "let's automate it".

## When Not To Use

Do not add a visible gate for:

- Trivial, low-risk actions where the correct scope is obvious, such as typo fixes, wording tweaks, or a single requested command.
- Open-ended research or knowledge synthesis with no scope-control problem.
- Fully authorized rewrites, migrations, architecture changes, or automation projects where the user has already accepted the larger boundary.
- Emergency fixes where immediate containment matters more than up-front design. In that case, keep the fix local and revisit scope afterward.

## Workflow

### 1. Question The Requirement

Do not optimize the user's proposed solution first. Recover the actual request.

Check:

- What outcome does the user actually need?
- What evidence supports the need: user statement, bug report, failing test, runtime behavior, product requirement, customer workflow, or existing code contract?
- Which constraints are explicit?
- Which assumptions are being invented?
- Which items are true requirements, and which are only candidate implementations?
- Who owns the requirement or can answer for it? If there is no owner, treat it as weaker evidence.
- What is the Definition of Done?
- What must remain unchanged?

Rules:

- If a requirement cannot be tied to a concrete outcome, downgrade it to a candidate or remove it from the current scope.
- If missing information would materially change the result, ask one minimal question before continuing.
- If missing information does not change the main path, proceed with a conservative assumption and state it briefly.
- Do not accept "a smart person asked for it" as proof that the requirement is necessary.

### 2. Delete Before Adding

Before adding features, files, abstractions, process, or code, identify what can be removed, avoided, reused, delayed, or left unchanged.

Default cuts:

- Features not requested by the user.
- Requirements that do not map to the actual outcome.
- Options, fields, states, screens, flows, or roles that only serve hypothetical future cases.
- Single-use abstractions.
- New dependencies, configuration, persistence, schemas, scripts, CI jobs, or automation that are not required for the current Definition of Done.
- Refactors of adjacent code.
- Public behavior, API, data-model, security, deployment, or cross-module boundary changes without explicit authorization.

Deletion test:

- If no-op, documentation, existing behavior, a local fix, or reuse of an existing path satisfies the actual request, prefer that.
- If removing an item does not break the Definition of Done, keep it out of the main deliverable.
- If removing an item would harm correctness, maintainability, or verification, keep it and state why.
- If you never need to add anything back, you may not have tried hard enough to delete.

### 3. Simplify What Remains

Only simplify the work that survived deletion. Do not design an ideal system around leftovers.

For requirement or plan design:

- Reduce the deliverable to one clear goal.
- Keep only necessary constraints.
- State non-goals explicitly.
- Define completion criteria that can be checked.
- Move unvalidated expansions to `Optional` or `Future`, outside the current commitment.

For code work:

- Use existing patterns, helpers, APIs, and boundaries.
- Change the smallest coherent file set.
- Prefer boring, direct code over generic infrastructure.
- Add an abstraction only when it removes real duplication or reduces real complexity now.
- Match verification effort to risk.
- Every changed line should trace back to the actual request.

Boundary rule:

- Treat changes to public behavior, shared contracts, APIs, schemas, persistence, security posture, deployment, or cross-module ownership as `Boundary Change`.
- If a Boundary Change is not authorized, provide the best local alternative.
- If no local alternative can satisfy the request, stop and ask for confirmation.

## Output Contract

When the user explicitly invokes this skill, or when the task has clear scope risk, start with a short gate. Keep it compact enough to guide action; do not turn it into a full proposal.

```markdown
## Scope Gate

Actual request:
- [The real outcome to deliver]

Requirement check:
- [What is confirmed, what is assumed, and what is only a candidate solution]

Deletes:
- [What is removed, deferred, reused, or kept out of scope]

Smallest sufficient path:
- [The smallest plan or implementation path that still satisfies the request]

Boundary:
- [No boundary change / Authorized boundary change / Unauthorized boundary change with local alternative]

Verification:
- [The minimum evidence needed to trust the result]
```

After the gate:

- If the request is clear and the next step is low-risk and reversible, continue with the work.
- If the task is requirement design, deliver the narrowed requirement or plan.
- If the task is code work, implement the smallest sufficient path and verify it.
- If the task is review, report scope creep, unnecessary abstractions, or unauthorized boundary changes before style nits.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "This will be useful later." | Future usefulness is not current scope. Put it in `Future` unless it is required now. |
| "It's cleaner if we make it generic." | Generic code is only cleaner when the extra abstraction pays rent immediately. |
| "While I'm here, I can refactor this." | Adjacent cleanup is a separate change unless it is necessary for the request. |
| "Automation will save time." | Automating the wrong or unnecessary process preserves waste. Delete and simplify first. |
| "The requirement came from someone senior." | Seniority is not evidence. The requirement still needs an owner, rationale, and success criteria. |
| "This is too small for a gate." | Then the gate should be tiny or silent, not skipped if there is scope risk. |

## Red Flags

Watch for these signs that the skill is being violated:

- New abstractions appear before the current need is proven.
- The plan includes optional features in the main path.
- A local fix becomes a platform, framework, workflow, or architecture change.
- The implementation modifies files unrelated to the request.
- The agent adds configuration, persistence, schema changes, CI, scripts, or automation without a direct need.
- The answer explains a large system instead of naming the smallest sufficient deliverable.
- Verification is vague, such as "should work" or "looks good".

## Verification

Before treating the gate as complete, confirm:

- [ ] The actual request and Definition of Done are stated or reasonably inferred.
- [ ] Requirements are separated from candidate implementations.
- [ ] At least one deletion, reuse, no-op, or deferral option was considered.
- [ ] The smallest sufficient path is clear.
- [ ] Boundary changes are either avoided, explicitly authorized, or blocked pending confirmation.
- [ ] Verification is proportional to the risk and names concrete evidence.
