# verify — read plan, design, and spec, review the code against them, check plan and spec

Report only. Verify changes no files. It judges the change against the plan, the design, and the specs, not the specs against the code: a gap in the spec is not a finding, since the spec is silent by design and a promise is the user's to make through `propose`, not verify's to suggest. All five steps run before anything is reported. Read with `SKILL.md`, whose Spec and Plan contracts are the rules the checks apply.

## Stops

None. Verify runs all five steps and reports once. Reporting after the code review and waiting before the plan and spec checks is not a stop.

## Steps

**1. Read the plan, the design, and the specs.** Read `plan.md`, the design (inline, `design.md`, and every file under `design/`), every spec change file in the plan, and each target spec in `docs/specs/` in full. Everything after this step is judged against what these say, so the reading comes first.

**2. Code review with that context.** Run the `code-review` skill on the change and hand it the context from step 1, so the review judges the code against what was intended, not only against general standards:
- the plan directory's path, with `plan.md` as the statement of intent
- the design's architecture, flows, and interfaces, as the shape the code is meant to take
- the requirements and scenarios in the spec change files, as the behavior the change commits to
- the requirements in the target specs that the plan leaves untouched, as contracts the change must keep
- Out of scope, as the boundary the change stays inside
- the design's decisions, as choices already made with the user; the review flags code that departs from them, and does not reopen them
- the rule that behavior the spec does not describe is not a finding for this review; the spec is silent on it by design, and such work is reported, if at all, as unplanned under the plan check

When the `code-review` skill is unavailable, say so and review the diff directly with the same context.

**3. Plan check.**
- Every task is ticked.
- Each task's stated verification holds: the test exists and passes, the command runs, the behavior is observable.
- Work in the diff that no task covers is listed as unplanned, for the user to keep or revert. It is not a reason to add a requirement.
- Each blocking open question still unanswered is listed.
- Every spec name, design section, and attachment that `plan.md` or the design points to exists.
- The plan is within its budget: Why at most two sentences and five bullets, an inline Design at most 100 lines, no design file past 800 lines unsplit, What changes naming requirements without restating the change files.
- Each line in `plan.md` or the design that belongs elsewhere is listed: a rule a spec states, fields or values copied from another authoritative source, a line number in the code, a repo-wide convention.

**4. Spec check.** For each scenario in the plan's spec change files, classify it, drawing on the review's findings:
- satisfied and covered by a test
- satisfied, no test
- not satisfied

For each requirement the plan adds or modifies, name the tests that cite it; a requirement no test names is listed.

Then check each spec change file against its target spec:
- Each MODIFIED and REMOVED entry names a requirement that exists in the spec.
- Each affected spec listed in `plan.md` has a change file at the matching path, and each change file is listed.
- The change breaks no existing requirement that the plan leaves unlisted. A broken, unlisted requirement is either a bug or a missing MODIFIED entry; report it and let the user say which.

Then check the spec change files against the spec contract, and list:
- a requirement whose statement fails the promise test for the spec's type;
- text the contract keeps out: values copied from another authoritative source, paths that point at the implementation, layout and styling, a third scenario on a requirement, a scenario that only repeats the rule, a detail carried over from the design that sits below the promise line;
- an unspecified clause that describes what the implementation does, or that qualifies a rule no reader would take as finer than written;
- references elsewhere in the repo to a requirement the plan renames, merges, or removes;
- each target spec that would be over budget once the plan is merged, with the cuts that bring it within budget or the split it suggests.

**5. Verdict.** `Ready to archive` or `Not ready`, followed by findings from the review and the two checks in one list ordered by severity. A finding from the checks is tied to a task, a scenario, a requirement, or a rule of the spec or plan contract; what cannot be tied to one of these is not a finding. A review finding is tied to the code it concerns. A target spec over budget once the plan is merged makes the plan `Not ready`, and so does a blocking question still unanswered, unless the user accepts it by name. State what was run and what was only read.
