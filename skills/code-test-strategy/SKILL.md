---
name: code-test-strategy
description: >-
  Decide the smallest useful test strategy for coding tasks without letting tests
  drive production-only complexity. Use when the user asks to add tests, write
  regression coverage, improve coverage, use TDD, choose unit/integration/E2E
  level, review mocks, or when an agent is about to add or modify tests. This
  skill gates whether to write tests now, defer them, or report a test gap; it
  keeps tests focused on public behavior, real risk, and existing project
  boundaries.
---

# Code Test Strategy

## Goal

Choose the smallest useful test strategy for the current coding task without
letting tests drive production-only complexity.

## Success Criteria

A good result:

- Matches test timing to the user's authorization and the implementation stage.
- Proves public behavior, a caller-visible contract, or a concrete risk when
  tests are written.
- Avoids production changes that exist only to expose test seams.
- Names exact verification commands run and important checks not run.
- Reports deferred tests or test gaps only when they reflect real remaining risk.

## Constraints

Tests verify behavior that users or callers rely on. They are not a copy of the
implementation, and they are not a reason to create extra operational surfaces
for the agent.

Do not change production code only to support tests by:

- Adding test-only runtimes, adapters, hooks, flags, switches, or environment
  branches.
- Exporting private functions, internal state, internal components, or transient
  steps.
- Introducing dependency injection, factories, service locators, or abstraction
  layers for a single test scenario.
- Changing a user-invisible execution path only to make assertions easier.
- Adding parameters, callbacks, or modes to production interfaces that only
  tests call.

Keep such an interface only when it also has a real product use. In that case,
treat it as a product requirement, not as a testing convenience.

## Evidence Budget

Before choosing or writing tests, inspect only the evidence needed to identify
the current stage, public boundary, existing test style, and risk:

- the user's exact request and latest scope constraint
- changed files or the bug reproduction when available
- nearby existing tests and package test commands
- public APIs, CLIs, UIs, HTTP endpoints, persisted outputs, or other observable
  boundaries

Stop reading when you can name the behavior, test level, boundary, and
verification command. Continue only if a missing fact would change whether tests
should be written, which level to use, or whether production code would need a
new test-only seam.

## Decision Rules

### Production Complexity

If the behavior cannot be tested through an existing public boundary, first look
for a higher-level behavior test, then consider running existing verification and
recording the test gap. Do not default to changing production code to fit the
test.

If a test mostly needs production-only exports, call-order hooks, fake runtime
modes, or private-state access, question the test target before changing code.

### Timing

During implementation or bug-fix work, default to the smallest production change
plus relevant existing verification. Add persistent tests in the same turn when:

- the user asked for tests
- the task is primarily test work
- TDD is requested
- a confirmed bug has a clear behavior-level regression boundary

Defer tests when the implementation direction is still uncertain, the useful
test would require production-only seams, or the current risk is better covered
by existing checks plus a documented test gap.

Even when tests are authorized, write the minimum tests needed for the current
risk. Do not expand the work into a broad branch-coverage project.

### Test Target

Prefer testing:

- Critical paths real users or callers can reach.
- Public APIs, CLIs, UIs, HTTP endpoints, command output, or persisted results.
- Reproduced behavior for historical bugs.
- High-risk boundaries such as permissions, data loss, money, concurrency,
  migrations, parsing, and external system interaction.
- Cross-module contracts that can realistically fail.

Avoid testing:

- Private functions, internal state, component names, call order, or intermediate
  variables.
- Branch mirror tests that map one-to-one to the implementation.
- Tests that only prove a mock was called without proving the user-visible
  result.
- Low-value assertions written only to improve coverage numbers.
- Framework, third-party library, or language behavior that the project does not
  own.

## Choosing Test Level

Use the lowest level that still proves the behavior.

- **Unit tests**: pure business rules, parsing, formatting, permission decisions,
  and boundary cases. Test through public functions or module exports, not
  private helpers.
- **Integration tests**: contracts across modules or external boundaries, such as
  databases, filesystems, HTTP handlers, queues, or caches.
- **End-to-end tests**: a small number of critical user journeys. Do not push
  every edge case into E2E.
- **Manual or smoke checks**: unstable implementations, UI-heavy changes, or
  cases where automation cost is higher than current confidence value.

If a high-level test finds a bug that can be captured through a lower-level
public boundary, keep the lower-level regression test and remove duplicate
high-level coverage.

## Mocking Rules

Mock only dependencies that are uncontrolled, expensive, slow, or external.

Acceptable mocks:

- Network, payment, email, and third-party APIs
- Time, randomness, and system environment
- Slow or nondeterministic infrastructure

Avoid mocking:

- The business logic the current module is supposed to verify
- Cheap in-process collaborators that can run for real
- Internal call order when the user-visible result is what matters

If a test is mostly mock setup and call-count assertions, it is usually too far
from user behavior.

## Output

For implementation or bug-fix work, always report verification with exact
commands and observed results. If tests were not written, name the reason:
`Timing`, `Scope`, `Seam`, or `Cost`.

Include `Deferred tests` only when a real remaining behavior risk exists:

```markdown
Verification:
- [existing tests/build/type checks/smoke checks actually run]

Deferred tests:
- [one to three behavior-level tests worth adding after the user confirms the implementation direction]
```

For test-writing work, state the target briefly before implementing:

```markdown
Test target:
- Behavior: [public behavior to prove]
- Level: [unit / integration / E2E / smoke]
- Boundary: [public interface used for observation]
- Non-goals: [implementation details not being tested]
```

After writing tests, report exact verification commands and results.

## Common Judgments

When the user says "add tests", find the smallest user behavior or historical bug
that protects the current change. Do not automatically add broad coverage.

When the user says "coverage is too low", find uncovered behavior with real risk
instead of adding assertions by line count. If there is no clear risk, recommend
keeping the current suite or list test candidates.

When the user says "TDD", writing the failing test first is allowed, but the test
must still use a public boundary. TDD is not a reason to expose private
implementation or add test-only production interfaces.

When existing code is hard to test, do not translate that into "add an abstraction
layer." First check whether there is a real public behavior boundary. If not,
explain the test gap and wait for user authorization before refactoring.

## Stop Rules

Stop after the smallest useful test decision or test patch is complete.

Do not keep adding tests for coverage numbers once the current behavior or risk
is covered. Do not refactor production code for testability unless the user
explicitly authorizes that boundary change.

If the behavior has no public boundary and testing would require a
production-only seam, report the test gap and wait for authorization. If existing
verification is enough for the current risk, report the commands and stop instead
of inventing deferred tests.
