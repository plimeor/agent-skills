---
name: test-principles
description: "Apply test principles when writing, reviewing, rewriting, or pruning automated tests, or when setting a repo's testing policy. Use when adding tests for a feature or bug fix, judging whether existing tests are worth keeping, fixing tests that break on refactors or miss real regressions, choosing assertion granularity, test doubles, or the test layer (unit, integration, e2e), or drafting a testing decision record. Near miss: a whole-diff review is code-review; writing spec requirements is spec-flow."
---

# Test Principles

Every test protects one guarantee a user or caller relies on, turns red when that guarantee is broken, and stays green when the code is restructured without changing behavior. The principles below are what that takes; a test that misses either property adds maintenance cost without adding confidence.

Sources this skill distills (do not paste them in): *Software Engineering at Google* ch. 12–14, Kent Beck's [Test Desiderata](https://testdesiderata.com/), Vladimir Khorikov's *Unit Testing Principles, Practices, and Patterns*, [clig.dev](https://clig.dev/), and the test conventions of gh, uv, cargo, jj, npm, deno, pnpm, vercel, and playwright.

A repo's own testing decision overrides these defaults where they conflict. Before applying them, read the repo's test setup: runner and its isolation model, preload or global setup, existing fakes and helpers, scripts per layer.

## 1. A test exists for a guarantee

A test stays only when all three checks pass:

1. **Guarantee**: its name states the guarantee as "when …, the user or caller sees …", traceable to a spec requirement or to something users actually depend on.
2. **Breaks red**: deliberately breaking that behavior (flip a condition, drop a field, skip a guard, change an exit code, return early) turns it red.
3. **Refactors green**: restructuring without a behavior change (rewording human text, reordering JSON keys, renaming internal functions, splitting a module) leaves it green.

On failure:

- No statable guarantee → delete.
- Breaking the behavior leaves it green → fix the assertion; if it still cannot catch the break, delete.
- A pure refactor turns it red → loosen the assertion to the contract level (principle 2).
- The same mutation is already caught by another test → merge or delete.

Check 2 is run, not reasoned, for every test written or rewritten: apply one mutation to the code under test, run the test, see red, revert. A bug-fix test is checked by putting the old code back. When judging tests without running them, mark each verdict `run` or `reasoned`; a `reasoned` red is a claim, not a result.

Stop adding tests when every guarantee in scope has one test that its mutation turns red. Coverage percentage is not the bar: it shows lines executed, not results checked.

## 2. Assert at the coarsest level that catches the break

1. success or exit code
2. a key fact present or absent
3. parsed structure, comparing contract fields only
4. the full field set
5. exact bytes

Exact bytes only where the bytes are the contract: output a script parses, generated files, wire formats. Human-readable text gets key facts plus what must not appear. Snapshotting it is a compromise: diffs surface in review and nothing silently tests empty, but every rewording means re-recording and reviewing layout that guards nothing. It holds only when the text is stable and the team reviews snapshot diffs.

Per-surface rules (CLI streams and exit codes, `--json` envelopes, help text, errors, secrets, HTTP APIs, UI, files and migrations) are in `references/surfaces.md`. Read it when the code under test has one of those surfaces.

## 3. Real before fake before stub

Classify each dependency by whether anyone outside the system observes it:

- **Owned by the system** (its own database, files, config, temp HOME): use the real thing, isolated per test. A real SQLite file beats a mocked repository.
- **External and observed by others** (third-party APIs, gateways, other teams' services, the browser): replace it at the protocol boundary with a local fake server that answers in real response shapes, including missing fields, nulls, and error codes. Patching the HTTP client instead saves a server but skips real request construction and HTTP semantics; use it only when the repo has no fake-server pattern and the request shape is not under test.
- **Strict fakes**: a request or call the test did not arrange fails the test. To test a failing dependency, arrange a failing answer.
- Assert interactions only for calls that change state outside the system (sent, written, charged). Never assert on calls to the system's own internals.
- The default suite does not touch the network. Tests against real services live in a separate, opt-in script and use dedicated test accounts.
- A dependency the test does not care about may get an in-process stand-in by default, with an explicit switch back to the real implementation for the tests that exercise it.

## 4. Same result every run, in any order

- Inject time, randomness, terminal width, color, and locale; never sleep for a fixed duration. Wait for a state or a count.
- Every process, timer, server, and browser a test starts is closed before it ends.
- Know the runner's isolation model. If files can share a process (single-file runs, coverage, watch), a test that changes process-level state (env vars, settings, module flags, module-level clocks or addresses) or deletes shared storage restores it before ending.
- Run under a temp HOME or equivalent, never the developer's real one.

## 5. Test through the public entry, at the lowest layer that finds the failure

- Test through the public entry: CLI argv, the command dispatcher, the HTTP endpoint, the rendered page. Test an internal function directly only when it is itself a stable boundary (parser, security policy, migration, crypto) or when its input combinations are too many to enumerate from above.
- Security rules: enumerate allow and deny cases table-driven at the policy unit, plus one test through the real server proving the guard is wired.
- e2e keeps only what needs a real process, browser, or built artifact to find: loading and handshakes, version mismatch, reconnects, cross-origin and host checks (each with one normal-request control), credentials absent from pages and logs, the main user path, install and upgrade from the shipped artifact. Push text checks and edge-case combinations down a layer.
- Data migrations: from every shape ever shipped straight to current, with no data lost.

## 6. A test reads as its guarantee

- The name states the guarantee, not the function. Needing "and" in the name usually means two tests.
- One behavior per test.
- Key inputs live in the test body (DAMP). Shared setup only builds objects and doubles; it does not hide the values the assertion depends on.
- No branches or loops in a test body, except a table of cases.
- An expected value comes from an independent source: a literal, a worked example, the spec. A value computed the way the code computes it agrees with the code by construction.
- A test guarding a specific defect names that defect.
- When the repo keeps specs, each test points at the requirement it guards in the repo's reference format (for spec-flow repos, a comment naming the spec and requirement), and every requirement is named by at least one test. A test that checks every reference resolves and no requirement is left unnamed keeps this true.

## 7. A failing test is evidence

To turn a failing test green, change the code, or change the test only when the guarantee it states has changed; say which in the report. Never weaken an assertion, skip a test, widen a fake to accept an unarranged call, or add a retry to make a failure go away without stating the guarantee that no longer has a test.

## Applying

- **Writing or rewriting tests**: report the tests added, changed, or removed, each with its guarantee and the mutation run against it; the commands run and their results; guarantees left without a test and why.
- **Reviewing tests**: do not edit unless asked. Give one verdict per test (`keep`, `rewrite`, `merge`, `delete`) with the guarantee, the mutation and whether it was `run` or `reasoned`, and the refactor that would break it if any. List the guarantees in scope that no test covers, and which files were not read.
- **Setting a repo's testing policy**: fill each principle with the repo's concrete entry points, fakes, helpers, and commands; a policy that only restates these principles gives the next agent nothing to check. When the repo uses spec-flow, record it through `spec-flow`'s `decide`.
