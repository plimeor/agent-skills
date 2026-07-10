---
name: code-tasking
description: "Turn an approved development plan plus the real codebase into a bottom-up, dependency-ordered graph of atomic execution tasks for an iterative or Goal-mode executor. Use when sequencing or bundling already-planned work so a foundation change lands in one go instead of accreting upper-layer patches, and when a memoryless per-turn executor with an additive bias will run the tasks. Near miss: use code-plan to create or revise the plan itself; use code-review to judge a draft plan or diff; not for executing the tasks."
---

# Code Tasking

## Goal

Convert an approved plan plus the real codebase into an ordered graph of execution tasks that an iterative, memoryless Goal-mode executor can run one at a time without ever substituting a patch for the correct foundation change.

The executor has a documented additive/patching bias: rewarded every turn for a small, locally-green diff, it avoids any change that is temporarily red or large and keeps the build green with **an additive shortcut** — a shim, branch, optional parameter, parallel `V2`, adapter, flag, or duplicated block — leaving the wrong foundation in place permanently. Your tasks exist to make that shortcut impossible at the toolchain level, or named-and-banned where the toolchain cannot.

Ceiling: classify → bundle → order → contract each task. Stop before execution. Do not re-plan, re-scope, re-decide design, or write code.

## Boundary And Handoff

`code-plan` produces the plan: objective, scope, design shape and owner, work sequence, regression strategy, acceptance, stop condition. It also owns the root-cause-vs-symptom direction (which layer owns the behavior) and the irreducibility / no-false-incrementalism judgment (whether the change has a green intermediate); your Classification Gate PROVES that judgment against the real codebase, it does not originate it. You consume that plan and the codebase; you do not re-derive or re-emit any of it. You inherit the plan's regression bar — do not re-specify what "existing behavior still works" means; your Definition of Done adds only the anti-patch structural facts the plan does not assert. Drift firewall: if a statement is a judgment about the chosen approach's shape it belongs in `code-plan`; if it can only be checked by running a command against the real codebase it is execution-altitude and belongs here.

A completed, approved plan is a hard input precondition. If no plan exists, the plan's designated owner/boundary is wrong against the real code, or a task needs a boundary change the plan did not authorize, pause back to `code-plan` (or `code-review` for design critique). Classify any needed change as avoided / authorized / blocked per the plan's Scope Triage Gate (recorded in its `Scope` / `Non-goals` / `Pause conditions`); do not bootstrap a plan, redesign, or self-authorize a boundary change here.

`code-plan` orders its slices by risk and discovery for a human reader. You **discard that order** and re-sort the atomic tasks leaf-first by real compile/reference dependency, because a memoryless executor needs the foundation present before its dependents. These are intentionally different orderings for different consumers, not redundant.

## Classification Gate

Activate for every change the plan implies, before any task is emitted. This gate is the hinge: every other gate is selected by its verdict, so it runs first and absorbs root-cause discovery as its required evidence. Find the path empirically, against the real codebase, not by reasoning from the plan alone — symptom layer and correct-change layer are routinely different.

Required evidence before a change is classified:

- **Root-cause location** — locate in the real code the deepest-correct owner / single source of truth the plan named as the boundary, and confirm via discovery that the behavior *originates* there, not at the symptom site. You are confirming the plan's named owner against real code, not choosing root cause from scratch. Chain "why must this change?" until the next "why" leaves the edit boundary. Falsification test: trace each ripple-set member and mark whether, after the change, it merely adapts mechanically (signature/type update) or still **branches on / re-encodes the old decision**. If any upper-layer member must still know the old detail, the location is above the root — go deeper. If the code shows the plan's designated owner is wrong, pause to `code-plan`; do not re-choose the owner here.
- **Ripple set** — the inverse transitive closure of the changed symbol: every caller, type, test, and serialization that cannot keep compiling/passing under the change. Ground it by running the discovery and recording the artifact, not a label: either trial-edit the foundation and read the actual breaks (then **revert** — a kept naive attempt is exactly the executor's permanent shim; reverting is the discipline you are encoding and is nearly free for an agent), or, when trial-compile is unavailable/slow or the surface is dynamic/untyped, run a reverse-reference walk (`grep` / find-usages / LSP) outward through callers-of-callers until the set stops growing. A ripple set whose size is not corroborated by a run command + count (e.g. `rg <symbol> → 14 hits across 6 files`, or `trial-edit broke 11 sites`) is treated as **guessed and unclassified**.
- **Reachability** — every ripple-set member is inside the executor's edit + authorization boundary: same repo, hand-editable, not generated / vendored / published / cross-repo. A member outside that boundary is not reachable.
- **Compatible-seam test** — can the new form be introduced while the old form still compiles and *all* tests pass (alias, overload, adapter, default arg, additive field)?
- **Verdict** — `atomic-synchronized` | `independently-green-via-named-seam`, with a one-line why. **Atomic** whenever every ripple-set member is reachable (synchronizable): there is no green intermediate, or you can manufacture its absence. **Seam** only when synchronization is genuinely impossible — and only with a named external consumer and where it is published/persisted (package-registry entry, persisted-schema version in live data, cross-repo import the executor cannot edit). Unproven impossibility = atomic. A large-but-reachable cut is atomic, never a seam. An out-of-boundary dependent is not a license for a seam either — it is a boundary change: pause to `code-plan`.

Weak substitutes do not satisfy the gate: analytical reasoning from the plan without touching the codebase; pinpointing the symptom location without confirming the behavior originates there; a guessed or plausibility-based dependent list, or a method label with no query and count; renaming the plan's work slices into tasks; declaring `independently-green` because splitting is convenient, or asserting external/unreachable without naming the specific out-of-boundary consumer and its publication/persistence site; declaring `atomic` to avoid tracing the ripple set; calling a cut atomic when a ripple-set member is generated, vendored, or in another repo the executor cannot edit; a seam that is "legitimate" only because the executor would never remove it.

Incomplete behavior: missing or low-confidence evidence means the change is unclassified — pause, do not classify by guess.

## Atomic Bundle Gate

Activate when the Classification Gate returns `atomic-synchronized` (rename-without-alias, signature / required-field / type / representation change, moved invariant ownership, or any change with no green intermediate). The atomic-vs-seam DIRECTION is inherited from the plan's irreducibility judgment; your job here is to PROVE and ENFORCE it (ripple set, no-green-partial, terminal contract), not to first decide whether the change is irreducible. The escape branch activates **only** for a proven-impossible seam — never to shrink a reachable cut.

Atomic branch — required:

- **One task** fusing the foundation edit plus its **complete itemized** ripple set (every site, never "all callers" or "everywhere"), under a single Definition of Done that only goes green when all move together.
- The explicit statement: *atomic — not splittable; no independently-green intermediate exists*.
- **No-green-partial is mandatory, and it — not the task boundary — is what stops a memoryless executor from re-decomposing the cut and banking a partial.** Where the toolchain can enforce it, change the foundation **incompatibly in place**: rename / retype the existing symbol, do not introduce a new name, so no old-shape caller compiles and removing the old name drags every caller along. There must be no green partial state to bank and stop on. This is what makes the relaxed task size safe: a 40-site atomic cut is not 40 bankable turns when none of the 39 intermediate states are green.
- On a **dynamic / untyped surface** where the toolchain produces no red state, manufacture the pressure: the task must ship a failing characterization / exhaustiveness / "no caller passes the old shape" assertion exercising every ripple site, and that assertion stays **red until all sites move**. Without an enforced red intermediate the atomic task is unsatisfiable as written and must carry this assertion.
- Explicit authorization that the repo may be temporarily red mid-task but **must** be green at the Definition of Done — so the executor's "red = failure" instinct does not drive it to a shim.
- Task size is set by the dependency graph, not diff-comfort. Relax INVEST Independent/Small for the atomic case; keep Valuable/Testable. A large smallest-green-keeping unit is a large task, and that is correct.

Escape branch (proven-impossible seam) — required:

- An ordered `expand → migrate → contract` chain, with the named seam and the named external consumer + publication/persistence site proving synchronization is impossible.
- The **contract** (delete-old) step as a first-class, dependency-**terminal** task with its own delete-old + zero-reference Definition of Done — never optional cleanup or a backlog item.
- The **migrate** task's Definition of Done must state: *this bundle is NOT done and MUST NOT be reported complete until the contract task (delete `<old path>`) is green; leaving the old path live is a failed bundle, not a smaller safe win.* The bundle is one unit; expand + migrate without contract is an incomplete bundle, not progress.

Weak substitutes do not satisfy the gate: splitting an irreducible synchronized change into "add new path now, migrate callers later"; an atomic task that says "update all callers" instead of listing each site; a lower-layer-only task that defers callers; a backward-compatible foundation change (overload, optional param, adapter, flag, new `V2` name) when all callers are reachable; introducing a new name instead of editing the existing symbol incompatibly where the toolchain could have refused every dual-path state; over-decomposing to satisfy INVEST small/independent; filing contract/delete-old as optional cleanup; treating expand+migrate as "done, smaller and safer"; using the seam branch for a large-but-reachable cut.

Incomplete behavior: an atomic task with no enforced red intermediate (incompatible in-place edit, or a red characterization assertion on dynamic surfaces) does not bind the executor — add it. A seam bundle whose contract task is missing or non-terminal is incomplete.

## Bottom-Up Ordering Gate

Activate when sequencing the whole task graph, after every change is classified and bundled.

Required: a leaf-first topological order of the prerequisite DAG. Every task carries `Group / Order / Depends-on`; every dependency resolves to an earlier task in the order; preparatory-refactor leaves ("make the change easy, then make the easy change") are ordered before the changes that need them. Invariant: **no task assumes a not-yet-built lower layer** — the foundation is always present when its dependents are tasked, removing the executor's only honest excuse for patching upward. Emit a linearized leaf-first sequence, not a diagram; the executor consumes one task at a time.

Weak substitutes do not satisfy the gate: a convenience or risk-first order that places a dependent before its foundation (risk/discovery-first sequencing is `code-plan`'s job, not yours); implicit or unstated ordering; leaving a foundation task late enough that a dependent would have to patch around its absence.

Incomplete behavior: any forward dependency (a task depending on a later task) means the order is wrong — re-sort before emitting.

## Anti-Patch Definition Of Done Gate

Activate on every task, with extra force on any task that replaces, changes, or supersedes an existing behavior, signature, or abstraction — i.e. nearly all of them. Scope this gate to the **anti-patch structural facts** the plan does not already assert; the regression bar ("existing behavior still works") is inherited from the plan, not re-derived here.

Required in every task's Definition of Done and verification:

- A **negative post-condition**: the old path / symbol / branch is gone; exactly one code path satisfies all callers; no shim / adapter / compat-layer / feature-flag / dead-branch / unused-export / duplicate remains; no net-new public surface beyond an explicit list or `none`. Forward evidence ("new path works") is necessary but never sufficient.
- The **specific additive shortcut named for this change** (inoculation): the exact tempting shim/branch/optional-param/`V2`/adapter/flag/duplication this task must not use — not a generic "avoid hacks." E.g. *"if you find yourself writing `if <new case>` at a call site or a `…V2`, stop — change the root-cause owner."*
- **Reported command output, not a claim**: the Verify line names the exact reverse-reference command for the old symbol and requires its literal output be pasted; **any** production hit = task failed. A self-reported "zero references" without the pasted output is not acceptance — a patching run believes its own shim is the path and will report falsely.
- **Cross-layer evidence** exercising entry point → changed foundation → observable result, with the explicit statement that a green build alone does **not** satisfy the task. "Looks complete and passes its own tests in isolation" is the failure signature, not a success signal.
- The task framed as **MODIFY / REPLACE / DELETE**, never ADD / SUPPORT / HANDLE — additive framing is executed as an append. Verb choice is load-bearing.
- Tests as witness of the general behavior: forbid hard-coding outputs, branching on identifiers/filenames, weakening assertions, or editing the test to pass. The test verifies the change; it is not the target.
- **Unrequested backward-compatibility forbidden by default** — if compatibility seems required, stop and ask; do not volunteer a legacy path "to be safe."

Weak substitutes do not satisfy the gate: a Definition of Done asserting only positive behavior ("feature works", "tests pass", "compile passes"); a "zero references" claim with no pasted command output; forward-only or new-code-only test evidence as acceptance; passing a check by hard-coding, identifier-branching, weakened assertions, or test edits; a volunteered compatibility path; leftover commented-out old code or a "temporary" unreferenced helper; additive verbs ("add support for", "handle the new case", "make it also work when").

Incomplete behavior: a task whose Definition of Done has no negative post-condition, or whose Verify cannot be failed by a pasted search, is under-specified — rewrite it before emitting.

## Output Contract

Emit a top-level spine, then one self-contained record per task, ordered foundation-first. Each record restates everything the memoryless executor needs and asserts its prerequisites are already merged, so a task runs standalone. Name the full additive-shortcut list only in the per-task `Forbidden patch` slot — the place the executor actually fills.

````markdown
## Task Graph

Plan: [the approved plan this derives from]
Execution order: [T001 → T002 → T003 → … — leaf-first; run exactly in this order]
Groups: [group label: task IDs] …
Global rule for the executor: each task names a forbidden patch and a delete-the-old-path Definition of Done; a green build is never acceptance on its own. A seam bundle (expand/migrate/contract) is ONE unit — completing expand/migrate without contract is an incomplete bundle, not progress. If a foundation seems missing or a ripple-set member is outside your edit boundary, STOP and report — do not patch upward.

### T001 — <imperative MODIFY/REPLACE/DELETE title>
- Group / Order / Depends-on: [group] / [position] / [earlier task IDs, all already merged | none]
- Classification: atomic-synchronized | independently-green (seam: <named seam>) — [one-line why a green intermediate does / does not exist; for a seam, the named external consumer + publication/persistence site]
- Root-cause change: [exact module/file/symbol/contract — the deepest-correct owner, confirmed as the ORIGIN of the behavior, not the symptom site]
- Ripple set (this task): [every caller/type/test/serialization migrated in THIS task, itemized — never "all callers"; grounded by: <actual command + hit count, e.g. `rg "<old symbol>" → 14 hits across 6 files: …`, or `trial-edit broke 11 sites`>]
- Forbidden patch: [the specific shim/branch/adapter/optional-param/V2/flag/duplication this task must NOT use — named, not generic]
- Change: [the concrete edit AND every itemized ripple dependent migrated in THIS task; for atomic, edit the foundation INCOMPATIBLY IN PLACE so no old-shape caller compiles (or, on a dynamic surface, ship the red exhaustiveness assertion); repo may be red mid-task but MUST be green at the DoD]
- Definition of done: [observable cross-layer outcome] AND [negative post-condition: old path deleted; exactly one code path; every listed ripple site migrated; no shim/dead code/dual path; no net-new public surface beyond <list | none>]
- Verify: [integration command/check proving the general behavior end-to-end through the changed foundation] AND [paste output of `rg "<old symbol>" --type <lang>` — any production hit = task failed] — a green build alone is NOT acceptance
````

For an authorized `independently-green` (seam) change, emit the `expand` and `migrate` records — the `migrate` record's Definition of done stating the bundle is not complete until contract is green — **and** a mandatory terminal record `T<NNN> — Contract: delete <old path>` whose sole Definition of done is that the old path is gone and a pasted reverse-reference search returns zero production hits.

## Self-Review

Any no means the task graph is not done:

- **Adversarial test:** could an executor follow a task and satisfy it with an additive shortcut (shim, dual path, optional param, parallel `V2`, adapter, flag, duplicate block) while sounding compliant and keeping the build green? If yes, strengthen the gate, the named forbidden patch, the negative Definition of Done, or the no-green-partial enforcement until the shortcut is impossible or explicitly banned.
- Was each change classified from the real codebase with a ripple set grounded by an actual query + count (not a method label or a guess), and pointed at the confirmed origin rather than the symptom site?
- Does any ripple-set member still branch on the old decision after the change — i.e. is the root-cause location too shallow?
- Does every atomic task enforce a red intermediate — incompatible in-place edit, or a red exhaustiveness assertion on a dynamic surface — and list its ripple set itemized, not "all callers"?
- Is the order strictly foundation-first, with no task depending on a later task or assuming a not-yet-built lower layer?
- Does every Definition of Done carry a negative post-condition and a Verify that can be failed by a pasted reverse-reference search, rather than accepting a green build or a self-reported "zero references"?
- For any authorized seam, is impossibility proven by a named external consumer + publication/persistence site, is the contract/delete-old step a first-class terminal task, and does migrate forbid reporting the bundle done until contract is green?
- Does each task verb read MODIFY/REPLACE/DELETE rather than ADD/SUPPORT/HANDLE?
- Is any record low-signal filler, or does it re-derive plan content — objective, scope, design ownership, root-cause direction, irreducibility judgment, regression bar — that `code-plan` owns? Remove it; pause to `code-plan` if the plan's owner is wrong, rather than self-authorizing a redesign or boundary change.

## Stop Rules

Stop when the user has one leaf-first, dependency-ordered task graph where every task carries a confirmed root-cause location, a query-grounded ripple set, an atomicity verdict, an enforced red intermediate where atomic, a named forbidden patch, and a delete-the-old-path Definition of Done with a pasteable reverse-reference check — or a pause/blocker list naming the missing plan, the wrong design or owner to send back to `code-plan`/`code-review`, the unauthorized or out-of-boundary change for `code-plan`, or the low-confidence ripple set that blocks classification.

Do not stop with a graph in which any change is unclassified, any reachable atomic change is split or lacks a red intermediate, any order is not foundation-first, or any Definition of Done lacks its negative post-condition. Execution — file edits, test runs, commits, deployment — is a separate phase requiring the user's current request or an active execution task.