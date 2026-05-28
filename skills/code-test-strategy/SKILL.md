---
name: code-test-strategy
description: >-
  Decide the smallest useful test strategy for a coding task without letting tests drive production-only complexity. Use when adding tests, choosing unit/integration/E2E level, reviewing mocks, doing TDD, or when an agent is about to add or modify tests. Gates whether to write tests now, defer them, or report a test gap.
---

# Code Test Strategy

## Stance

Tests prove public behavior, a caller-visible contract, or a concrete risk. They are not a copy of the implementation, and they are not a reason to grow production surface.

Hard rule: **never deform production code to make tests easier.** No test-only exports, hooks, flags, runtime modes, DI layers, factories, parameters, or callbacks that only tests call. Keep such an interface only when it has a real product use — then it's a product requirement, not a testing convenience.

Ceiling: smallest useful target → lowest level that proves it → stop. Don't expand into a coverage project.

## The Three Moves

1. **Target** — name the user-visible behavior, caller contract, or reproduced bug worth proving, and the public boundary you'll observe it through. If no public boundary exists, report a test gap instead of inventing a seam.
2. **Level** — use the lowest level that proves the behavior through that boundary: unit for pure rules; integration for cross-module / external contracts; E2E for a small number of critical journeys; manual smoke when automation cost exceeds confidence value. If a higher-level test catches a bug that a lower-level public boundary can also catch, keep the lower one.
3. **Stop** — write the minimum for current risk; report exact verification commands and results; record `Deferred tests` or `Test gap` only when real remaining behavior risk exists.

## Timing

Write tests in the same turn when: user asked for tests, the task is primarily test work, TDD is requested, or a confirmed bug has a clear regression boundary.

Defer when: implementation direction is uncertain, the useful test would need production-only seams, or existing checks plus a documented gap already cover the current risk.

## Mocking

Mock only what's uncontrolled, expensive, slow, or external — network, payments, third-party APIs, time, randomness, slow/nondeterministic infra. Don't mock the business logic under test, cheap in-process collaborators, or internal call order. A test that's mostly mock setup and call-count assertions is too far from user behavior.

## Anti-targets

Avoid: private functions, internal state, component names, call order, intermediate variables, one-to-one branch mirrors, mock-was-called assertions without user-visible proof, coverage-number tests, framework / third-party behavior the project doesn't own.

## Output

For implementation or bug-fix work:

```markdown
Verification:
- [existing tests / build / type checks / smoke actually run]

Deferred tests:
- [one to three behavior-level tests worth adding after the user confirms direction]
```

Include `Deferred tests` only when real remaining risk exists. If tests weren't written, name the reason: `Timing`, `Scope`, `Seam`, or `Cost`.

For test-writing work, state the target before implementing, then report verification commands and results:

```markdown
Test target:
- Behavior: [public behavior to prove]
- Level: [unit / integration / E2E / smoke]
- Boundary: [public interface used for observation]
- Non-goals: [implementation details not being tested]
```

## Common Judgments

- **"Add tests"** → smallest user behavior or historical bug that protects the current change, not broad coverage.
- **"Coverage is too low"** → find uncovered behavior with real risk; if none, recommend keeping the suite or list candidates.
- **"TDD"** → failing test first is fine, but it must use a public boundary; not a license for test-only seams.
- **"Hard to test"** → check for a real public boundary first. If none, report the gap and wait for authorization before refactoring.
