---
name: code-test-strategy
description: >-
  Test strategy gate for coding tasks. Use this skill whenever the user asks to write tests, add tests, create test cases, add regression tests, improve coverage, use TDD, or when an agent is about to add or modify tests for an implementation. It decides when not to write tests yet, when to propose a test plan, and how to write behavior-level tests after the implementation direction is confirmed. Trigger on test, testing, unit test, integration test, E2E, regression test, coverage, TDD, mocks, or changing production code to make tests easier.
---

# Purpose

Prevent tests from driving production complexity, expanding implementation scope, or creating avoidable rework.

This skill does three things:
1. Decide whether persistent tests should be written at the current stage.
2. Keep tests focused on real behavior and public contracts.
3. Block production-code complexity that exists only to make tests easier.

# Core Principle

Tests verify behavior that users or callers rely on. They are not a copy of the implementation, and they are not a reason to create extra operational surfaces for the agent.

If a test requires production code to expose extra seams, runtimes, hooks, test flags, or private details, question the test design before changing production code to satisfy it.

# Workflow

## 1. Production Complexity Gate

Before adding or changing tests, check whether the test would make production code more complex.

Do not change production code only to support tests by:
- Adding test-only runtimes, adapters, hooks, flags, switches, or environment branches
- Exporting private functions, internal state, internal components, or transient steps
- Introducing dependency injection, factories, service locators, or abstraction layers for a single test scenario
- Changing a user-invisible execution path only to make assertions easier
- Adding parameters, callbacks, or modes to production interfaces that only tests call

Only keep such an interface when it also has a real product use. In that case, treat it as a product requirement, not as a testing convenience.

If the behavior cannot be tested through an existing public boundary:
- First look for a higher-level behavior test
- Then consider running existing verification and recording the test gap
- Do not default to changing production code to fit the test

## 2. Timing Gate

During implementation or bug-fix work, do not add or heavily rewrite persistent tests by default.

Default behavior:
- Make the smallest production change first
- Run existing tests, type checks, builds, or a minimal smoke check
- In the final response, list the follow-up tests worth adding instead of writing a full test suite immediately

Write tests in the same turn only when:
- The user explicitly asks to write tests now, add tests, or write tests first
- The task itself is a test task, such as adding regression coverage for a module
- The user explicitly requests TDD
- The user has already confirmed the implementation direction and asks for a behavior-level regression test for a reproduced bug

Even when tests are authorized, write the minimum tests needed for the current risk. Do not expand the work into a broad branch-coverage project.

## 3. Behavior Gate

Start from the user, the public contract, and the risk.

Prefer testing:
- Critical paths real users or callers can reach
- Public APIs, CLIs, UIs, HTTP endpoints, command output, or persisted results
- Reproduced behavior for historical bugs
- High-risk boundaries such as permissions, data loss, money, concurrency, migrations, parsing, and external system interaction
- Cross-module contracts that can realistically fail

Avoid testing:
- Private functions, internal state, component names, call order, or intermediate variables
- Branch mirror tests that map one-to-one to the implementation
- Tests that only prove a mock was called without proving the user-visible result
- Low-value assertions written only to improve coverage numbers
- Framework, third-party library, or language behavior that the project does not own

# Choosing Test Level

Use the lowest level that still proves the behavior.

- **Unit tests**: pure business rules, parsing, formatting, permission decisions, and boundary cases. Test through public functions or module exports, not private helpers.
- **Integration tests**: contracts across modules or external boundaries, such as databases, filesystems, HTTP handlers, queues, or caches.
- **End-to-end tests**: a small number of critical user journeys. Do not push every edge case into E2E.
- **Manual or smoke checks**: unstable implementations, UI-heavy changes, or cases where automation cost is higher than current confidence value.

If a high-level test finds a bug that can be captured through a lower-level public boundary, keep the lower-level regression test and remove duplicate high-level coverage.

# Mocking Rules

Mock only dependencies that are uncontrolled, expensive, slow, or external.

Acceptable mocks:
- Network, payment, email, and third-party APIs
- Time, randomness, and system environment
- Slow or nondeterministic infrastructure

Avoid mocking:
- The business logic the current module is supposed to verify
- Cheap in-process collaborators that can run for real
- Internal call order when the user-visible result is what matters

If a test is mostly mock setup and call-count assertions, it is usually too far from user behavior.

# Output Contract

## Implementation Stage

When the current task is mainly implementation or bug fixing, include this in the final response by default:

```markdown
Verification:
- [existing tests/build/type checks/smoke checks actually run]

Deferred tests:
- [one to three behavior-level tests worth adding after the user confirms the implementation direction]
```

If no tests were written, say that they were deferred by the Timing Gate. Do not present it as an accidental omission.

## Test-Writing Stage

When the user confirms that tests should be written, first state the test target briefly, then implement:

```markdown
Test target:
- Behavior: [public behavior to prove]
- Level: [unit / integration / E2E / smoke]
- Boundary: [public interface used for observation]
- Non-goals: [implementation details not being tested]
```

After writing tests, report the exact verification commands and results.

# Common Judgments

## The user says "add tests"

Do not automatically add broad coverage. Find the smallest user behavior or historical bug that protects the current change.

## The user says "coverage is too low"

Do not add assertions by line count. Find uncovered behavior with real risk. If there is no clear risk, recommend keeping the current suite or list test candidates instead.

## The user says "TDD"

Writing the failing test first is allowed, but the test must still use a public boundary. TDD is not a reason to expose private implementation or add test-only production interfaces.

## The existing code is hard to test

Do not translate "hard to test" into "add an abstraction layer." First check whether there is a real public behavior boundary. If not, explain the test gap and wait for user authorization before refactoring.

# Completion Criteria

- No production-only complexity was introduced for testing.
- Test timing matches the user's confirmation state.
- The test target maps to user behavior, a public contract, or a concrete risk.
- Mocks do not replace the logic that needs verification.
- Verification results distinguish between tests that were run, tests that were not run, and tests suggested for later.
