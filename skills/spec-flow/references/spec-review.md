# spec-review — check a plan's spec change files against the spec contract

Runs inside `propose` once the spec change files are written, fixing what it finds, and inside `verify` step 4, reporting only. Runs on request on any plan's spec change files. Read with `SKILL.md`, whose Spec contract and spec change file rules are what it checks; this file holds the checks, the rounds, and the stops.

## Outcome

Spec change files in which every sentence passes the promise test for its spec's type, that hold nothing the contract keeps out, and whose target specs fit the budget once merged. In `propose`, reached in at most three rounds without waiting for the user.

## Checks

For each spec change file, against its target spec in `docs/specs/`:

- Each requirement's statement passes the promise test for the spec's type.
- An `api` spec covers an interface that code outside the project calls. An interface only the project's own code calls is structure, which belongs to the skeleton.
- Nothing the contract keeps out:
  - values copied from another authoritative source;
  - paths that point at the implementation;
  - layout and styling;
  - structure: units, interfaces between the project's own units, ownership, dependency direction;
  - a detail carried over from the design that sits below the promise line;
  - a scenario the rule would not be misread without, such as one that only repeats the rule.
- Each unspecified clause names what is left open, says nothing of what the implementation does, and qualifies a rule a reader would take as finer than written.
- Each MODIFIED and REMOVED entry names a requirement that exists in the target spec, and each MODIFIED entry is the whole block.
- Each affected spec listed in `plan.md` has a change file at the matching path, and each change file is listed. Each requirement What changes names is in a change file, and each requirement in a change file is named in What changes.
- No reference elsewhere in the repo still cites a requirement the plan renames, merges, or removes, outside `docs/archive/` and `docs/decisions/superseded/`.
- Each target spec is within budget once the plan is merged.
- Each target spec past about 300 lines once the plan is merged is listed with the lines that belong elsewhere. This one is a signal and never blocks.

## In propose

Up to three rounds. Each round runs every check on every change file, then:

- No finding other than the length signal: the review passes, and the tasks are written next without the user's approval.
- Findings: fix each one whose fix follows from the contract, the plan, or the interview's answers, and run the next round. Whether a sentence is a promise follows from the interview when the user placed it there; when they did not, it is a question for the user, asked as an interview round. A budget overrun is fixed with REMOVED entries, each with a reason that says where the requirement goes; which requirements leave is the user's call when the interview did not settle it.
- Findings still open after the third round, other than the length signal: stop, and put them to the user with the fixes tried.

## In verify

Run every check once and report each finding. Change nothing.

## Report

The rounds run, each finding fixed, the findings left, and the REMOVED entries added for the budget.
