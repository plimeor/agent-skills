---
name: code-lean
description: >-
  Force the smallest correct coding change. Use when the user asks for Code Lean, lean code, minimal implementation, YAGNI, less boilerplate, fewer dependencies, simpler code, deleting bloat, or avoiding over-engineering. Also use before implementing broad or speculative coding requests where a smaller existing capability may satisfy the goal.
---

# Code Lean

## Outcome

Deliver the smallest correct change that satisfies the user's requested outcome. Lean means less owned surface, not lower standards.

Default stance: first remove the need to write code; if code is still needed, reuse the closest existing capability; if new code remains necessary, write the smallest version that is correct at the current boundary.

## Decision Ladder

Before adding code, stop at the first rung that satisfies the requested outcome:

1. **No change**: the request is speculative, already satisfied, or better handled by a product/process decision. Say what covers it and stop.
2. **Delete or narrow**: remove unused behavior, collapse pass-through layers, or implement only the requested slice.
3. **Standard library**: use language/runtime facilities before custom helpers.
4. **Native platform**: use browser, OS, database, framework, or infrastructure features before app code.
5. **Existing project capability**: use an installed dependency, local helper, component, command, schema, or service owner already present.
6. **One-line or local expression**: prefer a direct expression over a named abstraction when naming would not clarify repeated use.
7. **Minimum new code**: add only the files, branches, parameters, and tests required for the current behavior.

When two options are similarly small, choose the one with better edge-case correctness and clearer ownership.

## Gates

### Scope Gate

Activation: before implementing or reviewing any requested coding change.

Required evidence:

- The explicit requested outcome.
- The smallest observed boundary that can satisfy it: existing file, command, API, component, schema, standard library, native feature, or dependency.
- Any user-stated exclusions or non-negotiable behavior.

Prohibited substitutes:

- Do not build flexibility for an imagined second caller, future backend, optional provider, alternate UI, or configuration owner.
- Do not add an interface, factory, registry, adapter, event layer, config flag, wrapper, or service class with only one real implementation unless the user explicitly asked for that boundary.
- Do not ask for clarification when a reversible smaller path is available; implement the smaller path and name the assumption.

Incomplete behavior:

- If the smaller path would drop a plausible requested outcome, pause and name that exact trade-off.
- If the request is a boundary change, security change, schema/persistence change, deployment change, or external side effect, do not narrow it silently; ask for the missing authorization or state the safest local alternative.

### Quality Boundary Gate

Activation: whenever a leaner implementation would remove checks, guards, diagnostics, or user-visible behavior.

Required evidence:

- Trust boundaries still validate untrusted input.
- Error handling still prevents data loss, corruption, duplicate writes, or misleading success.
- Security, privacy, permissions, and secret handling are not weakened.
- Accessibility basics remain for UI changes.
- Explicit user requirements remain implemented.
- Real-world calibration remains when hardware, clocks, sensors, money, time zones, or external systems are involved.

Prohibited substitutes:

- "Simpler" does not justify accepting malformed input, leaking data, dropping authorization, hiding errors, or returning success after a failed side effect.
- "YAGNI" does not delete a guard that protects a real current caller.

Incomplete behavior:

- If the smallest code cannot preserve a quality boundary, choose the next rung that can.
- If preservation requires a larger design than authorized, state the gap and stop before crossing the boundary.

### Simplification Ledger Gate

Activation: when the chosen lean path intentionally accepts a known ceiling: global lock, linear scan, in-memory state, naive heuristic, no caching, no batching, no retry, no persistence, single-process assumption, local-only behavior, or partial format support.

Required evidence:

- Add a short `code-lean:` comment at the simplification point.
- The comment names the ceiling and the trigger for upgrading it.

Required form:

```text
code-lean: <ceiling>, upgrade when <specific trigger>
```

Prohibited substitutes:

- A vague `TODO`, "for now", "later", or explanation only in the chat response does not satisfy the ledger.
- Do not add comments for obvious standard-library/native usage without a meaningful ceiling.

Incomplete behavior:

- If the ceiling is real but no upgrade trigger is known, say that the simplification is incomplete and ask for the decision owner or threshold.

### Runnable Check Gate

Activation: when adding or materially changing non-trivial logic: a branch, loop, parser, formatter, validation rule, money/security path, state transition, concurrency path, migration, or external side effect.

Required evidence:

- Leave one runnable check that fails if the new logic breaks.
- Prefer the project's existing test command when it is already present and cheap.
- Otherwise use the smallest local check: an assertion-based demo, a small unit test, or a focused smoke command.

Prohibited substitutes:

- Broad fixtures, generated suites, heavy mocks, test-only production seams, and framework setup do not satisfy lean unless the project already uses them for this boundary.
- Trivial one-line glue with no branch, state, parsing, security, or side effect does not need a new test.

Incomplete behavior:

- If the environment cannot run the check, report the exact command that should be run and the reason it was not run.

## Implementation Rules

- Prefer deleting code over adding code when deletion preserves the requested outcome.
- Keep changes in the fewest existing files that naturally own the behavior.
- Use local project patterns before introducing a new style.
- Add dependencies only when the standard library, native platform, and existing dependencies do not cover the current requirement.
- Do not create abstractions for possible futures; extract only after duplication or variation exists.
- Do not add fallback paths, compatibility shims, migrations, or feature flags unless the current contract requires them.
- Code or the concrete change comes first. Then use at most three short lines for verification, skipped work, and the trigger to add it later. Explanation the user explicitly asked for is not bloat; give it in full.

## Review Mode

When the user asks to review for lean code, report only complexity that can be cut without violating the requested outcome or a quality boundary.

Use these tags:

- `delete`: dead code, duplicate behavior, unused flexibility, or speculative feature.
- `stdlib`: custom code replaced by language/runtime capability.
- `native`: app code or dependency replaced by platform/framework/database/browser/infrastructure behavior.
- `existing`: new code replaced by a local helper, component, command, schema, or dependency already in the project.
- `yagni`: abstraction, config, mode, provider, or extension point with no current second use.
- `shrink`: same behavior with fewer lines or fewer files.
- `keep`: code that looks large but protects a current quality boundary or explicit requirement.

Each finding is one line: location, tag, what to cut, and replacement. Mention a boundary only when it prevents the smaller cut.

## Output Contract

For implementation work, default to:

```markdown
[code/change]
verified: [command/check actually run, or "not run: <reason>"]
skipped: [unbuilt abstraction/dependency/feature]; add when [trigger]
```

Omit lines that do not apply. Never expand into a design note, feature tour, or defensive essay unless the user asked for that explanation. If the explanation is longer than the change, cut the explanation first.

For lean reviews, use:

```markdown
[location]: [tag] [what to cut]. [replacement].
net: -[N] lines/files/deps possible.
```

If there is nothing to cut: `Lean already. Ship.`

## Self-Review

Before finishing, check:

- Could the answer sound lean while skipping the requested outcome? If yes, restore the outcome or ask for the boundary decision.
- Did the first viable ladder rung get used, not merely the smallest code the agent wanted to write?
- Did any cut weaken validation, error handling, security, accessibility, calibration, or explicit requirements?
- Did every intentional ceiling get a `code-lean:` comment with an upgrade trigger?
- Did non-trivial logic leave one runnable check, or did the response name exactly why it could not be run?
- Did the final answer avoid selling unrequested future-proofing as quality?

## Stop Rules

Stop when the requested outcome is satisfied by the smallest current boundary, quality gates are preserved, intentional ceilings are recorded, and verification status is stated.

Pause instead of finishing when the smallest path would sacrifice an explicit requirement, cross an unauthorized boundary, or accept a known ceiling without an owner or upgrade trigger.
