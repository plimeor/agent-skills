# skeleton-review — review a plan's skeleton and fix it before anything is built on it

Runs inside `propose` on every skeleton it writes, and on request on any plan's skeleton. Read with `SKILL.md`, whose Skeleton and Architecture contracts define what a skeleton holds; this file holds the rounds, the checks, and the stops.

## Outcome

A skeleton with no blocking finding, reached in at most three review rounds without waiting for the user, or a stop that puts the blocking findings still open to the user. The design, the spec change files, and the tasks are then built on it.

## Stops

- A finding whose fix needs a decision the user owns: one the interview did not reach, one that would change an answer the user gave, or one that would change an existing invariant of `docs/architecture.md`. Ask it as an interview round, as `references/propose.md` step 2 describes, then continue from the round where it was found.
- Blocking findings still open after the third round's review. Put them to the user, each with the fixes tried and the realistic options. The user either decides the fixes or accepts the findings by name; either way the skeleton then counts as passed.

Not a stop: a skeleton that passes. It goes on to the design without the user's approval.

## Rounds

A round reviews the whole skeleton in three parts — design review, skeleton checks, static pre-check — and then acts on what it found:

- No blocking finding: the review passes. Fix the non-blocking findings whose fix is plain; list the rest in the report.
- Blocking findings after the first or second round's review: fix each one whose fix follows from the code, the specs, the interview's answers, or the correction a review states; ask the user the ones that need their decision. Then run the next round.
- Blocking findings after the third round's review: stop, without a further fix.

A finding is blocking when leaving it would force work built on the skeleton to be redone: a unit, an interface, an owner, or a dependency that would have to change after the design, the specs, or the code rest on it. Every failed skeleton check and every failed static check is blocking, except an inclusion-test failure, which is fixed by moving the entry. A finding whose fix stays inside one unit's entry, such as a name or a clearer sentence, is not blocking.

When the host can spawn sub-agents, the design review runs in a fresh one, given `skeleton.md`, `plan.md`, the specs the plan touches, and `docs/architecture.md`, so it does not inherit the reasoning that produced the skeleton.

Run on request on a plan whose design, spec change files, or tasks already exist, each fix is carried down to them as `SKILL.md`'s How plan, skeleton, design, and spec relate describes.

## 1. Design review

Run the `code-design-review` skill with:
- the subject: the skeleton's units, their interfaces and ownership, and the paths;
- the maintainer tasks: building the plan's capabilities, and the changes the overview's Next and the later phases settled in the interview foresee;
- the harder contracts: the specs the plan touches and the invariants of `docs/architecture.md`.

A concern whose smallest correction changes an interface, an owner, a dependency, or which unit holds a responsibility is blocking. When the skill is unavailable, say so and apply its lenses to the skeleton directly.

## 2. Skeleton checks

Each is answered yes or no.

- Every entry passes the inclusion test. An entry that fails moves to the design or is cut.
- Each unit is defined by what it owns or hides, not by its place in a path: no unit whose responsibility reads as a stage, such as "validate" or "then persist".
- Each piece of state has exactly one owning unit, and only that unit writes it.
- The dependencies form no cycle and run in the direction `docs/architecture.md` already sets.
- Every path step names a unit, from Units or from the codemap, and a call in that unit's declared or existing interface. Every unit in Units appears in a path.
- The first path runs from an entry a user or caller triggers to an end someone can observe.
- Each line of `plan.md`'s What changes whose delivery crosses units is carried by a path.
- Every invariant of `docs/architecture.md` a path crosses is kept, or changed in Architecture changes.
- Architecture changes holds only top-level entries; every MODIFIED or REMOVED entry names one that exists; each invariant marked introduced or changed has its ADDED or MODIFIED entry; and each unit entry there agrees with the unit's entry in Units.
- The skeleton is within its budget.
- First round only: the decision the skeleton rests on most, the one whose change would move the most units, is compared with one real alternative. The comparison goes to the design's Decisions. An alternative that comes out better is a blocking finding.

## 3. Static pre-check of the walking skeleton

Checks that task group 1 can be built as the skeleton states, against the current code, by reading it and by using the static tools the repo already configures. No new code is written or run.

- Every existing unit, symbol, and type the skeleton names exists under that name and plays the role the skeleton gives it.
- For each changed interface, its callers today are found, and `Called by:` lists every one of them.
- Every type in a new or changed interface exists or is declared in the skeleton.
- Along the first path, each step's input is what the step before it produces, by the existing signatures or the ones the skeleton declares.
- Each new dependency between units is allowed by the repo's dependency rules: the rules a configured checker such as dependency-cruiser, import-linter, or ArchUnit holds, applied to the new edge; without one, the direction of the existing imports.

Each check reports what it inspected and what it found. A check that cannot run, such as one on a unit with no code yet, is named as not run; that is not a finding.

## Report

Inside `propose`'s report, or on its own when run on request: the rounds run; each finding fixed, one line each; the non-blocking findings left; the findings the user accepted; the static checks not run; and the alternative compared, with the outcome.
