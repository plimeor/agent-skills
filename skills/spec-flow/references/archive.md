# archive — merge the plan into the specs, then move it to the archive

Archive runs on a verified plan. With no verify result at hand, run `verify` first. With a `Not ready` verdict, continue only when the user accepts the open findings by name. Read with `SKILL.md`, whose Spec and Archive contracts define the result; this file holds the steps and the stops.

## Stops

- A `Not ready` verdict the user has not accepted.
- A merged spec that would be over budget, until the user has chosen the cuts.
- A merge or check that fails.
- An archive target that already exists.

Not a stop: pausing between the merge and the move, or holding the archive until decision records are approved.

## Steps

The order is fixed: count, merge, check, then close the open questions, delete the change files, and move the plan. When the count, the merge, or the check fails, nothing is deleted or moved. Once the merge starts, steps 2 to 8 run without a pause, so the repo is never left with specs merged and the plan still in `docs/plans/`.

1. **Count the merged result.** For each target spec: its requirements plus ADDED minus REMOVED, against the spec budget. When a spec would be over budget, stop before merging and put the cuts to the user: requirements that demote to tests or merge into one rule, or a split along features a user would name. Apply the chosen cuts to the change files, then continue.
2. **Merge each spec change file into the spec at the same path.** ADDED: append the blocks as they are. MODIFIED: replace the requirement of that name with the full updated block. REMOVED: delete the requirement. A new spec is created with its `Type:` line and Purpose, in its area directory when it has one. Where verify found the code behaving differently from a planned requirement and the user accepted it, correct the change file first, then merge, so the spec states the behavior that shipped.
3. **Check the result.** Each merged spec follows the spec contract: within budget, no requirement appears twice, no ADDED / MODIFIED / REMOVED heading remains, and no reference elsewhere in the repo still cites a requirement the plan renamed or removed.
4. **Close the open questions.** Each answered question is written into the text of the design it settled and removed from the list. One the user accepted unanswered stays, marked as shipped unanswered.
5. **Delete the spec change files**: the plan's `specs/` directory. Their content is now in `docs/specs/`.
6. **Move the plan directory** with `git mv` to `docs/archive/YYYY-MM-DD-<slug>/`, dated today, with `plan.md`, the design, and the attachments. When the target already exists, stop and report.
7. **Update the overview**: Current focus, Next, and the date.
8. Keep these edits in the same change set as the code when that change is still open.
9. **Report** what was merged, cut, deleted, and moved. In the same report, propose decision records: run each of the design's Decisions through the decision gate and list those that pass, each with any live record on the same topic it would supersede or consolidate with. A record is written through `decide` once the user approves it; the archive does not wait for that.
