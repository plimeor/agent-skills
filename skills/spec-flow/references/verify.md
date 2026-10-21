# verify — read plan, skeleton, design, and spec, review the code against them, check plan, skeleton, and spec

Report only. Verify changes no files. It judges the change against the plan, the skeleton, the design, the specs, and the invariants of `docs/architecture.md`, not the specs against the code: a gap in the spec is not a finding, since the spec is silent by design and a promise is the user's to make through `propose`, not verify's to suggest. All five steps run before anything is reported. Read with `SKILL.md`, whose Architecture, Spec, and Plan contracts are the rules the checks apply.

## Stops

None. Verify runs all five steps and reports once. Reporting after the code review and waiting before the plan and spec checks is not a stop.

## Steps

**1. Read the plan, the skeleton, the design, and the specs.** Read `plan.md`, `skeleton.md`, the design (inline, `design.md`, and every file under `design/`), every spec change file in the plan, each target spec in `docs/specs/` in full, and `docs/architecture.md`. Everything after this step is judged against what these say, so the reading comes first.

**2. Code review with that context.** Run the `code-review` skill on the change and hand it the context from step 1, so the review judges the code against what was intended, not only against general standards:
- the plan directory's path, with `plan.md` as the statement of intent
- the skeleton's units, interfaces, owners, and paths, as the structure the code is meant to have
- the invariants of the skeleton and of `docs/architecture.md`, as rules between units the code keeps
- the design's flows and external contracts, as the shape of the work inside each unit
- the requirements and scenarios in the spec change files, as the behavior the change commits to
- the requirements in the target specs that the plan leaves untouched, as contracts the change must keep
- Out of scope, as the boundary the change stays inside
- the design's decisions, as choices already made with the user; the review flags code that departs from them, and does not reopen them
- the rule that behavior the spec does not describe is not a finding for this review; the spec is silent on it by design, and such work is reported, if at all, as unplanned under the plan check

When the `code-review` skill is unavailable, say so and review the diff directly with the same context.

**3. Plan and skeleton check.**
- Every task is ticked.
- Each task's stated verification holds: the test exists and passes, the command runs, the behavior is observable. In a plan with a skeleton, group 1 is the walking skeleton, and its end-to-end test exists and passes.
- Work in the diff that no task covers is listed as unplanned, for the user to keep or revert. It is not a reason to add a requirement.
- Each blocking open question still unanswered is listed.
- Every spec name, skeleton unit, design section, and attachment that `plan.md`, the skeleton, or the design points to exists.
- The code has the structure the skeleton states: each unit, interface, and owner exists as stated, and each dependency the change adds between units is in the skeleton.
- Each invariant of the skeleton and of `docs/architecture.md` holds in the code. A broken invariant the plan does not change is either a bug or a missing Architecture change; report it and let the user say which.
- The skeleton's Architecture changes describe the code as built, by the checks `references/architecture-review.md` lists for `archive`.
- The plan is within its budget: Why at most two sentences and five bullets, the skeleton at most 150 lines, three paths, and two units refined, an inline Design at most 100 lines, no design file past 800 lines unsplit, What changes naming requirements without restating the change files.
- Each line in `plan.md` or the design that belongs elsewhere is listed: a rule a spec states, structure the skeleton or `docs/architecture.md` states, fields or values copied from another authoritative source, a line number in the code, a repo-wide convention.

**4. Spec check.** For each scenario in the plan's spec change files, classify it, drawing on the review's findings:
- satisfied and covered by a test
- satisfied, no test
- not satisfied

For each requirement the plan adds or modifies, name the tests that cite it; a requirement no test names is listed.

The change breaks no existing requirement that the plan leaves unlisted. A broken, unlisted requirement is either a bug or a missing MODIFIED entry; report it and let the user say which.

Then run the checks in `references/spec-review.md` on the spec change files, reporting only. A target spec over budget once the plan is merged is listed with the cuts that bring it within budget or the split it suggests.

**5. Verdict.** `Ready to archive` or `Not ready`, followed by findings from the review and the two checks in one list ordered by severity. A finding from the checks is tied to a task, a scenario, a requirement, a skeleton entry, an invariant, or a rule of the architecture, spec, or plan contract; what cannot be tied to one of these is not a finding. A review finding is tied to the code it concerns. A target spec over budget once the plan is merged makes the plan `Not ready`, and so do a blocking question still unanswered and an invariant the code breaks that the plan does not change, unless the user accepts it by name. State what was run and what was only read.
