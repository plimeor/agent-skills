# architecture-review — keep `docs/architecture.md` true to the code

Runs on request: to build the document from the code in a repo that has none, or to check and correct it. `archive` runs its checks on the entries a plan merges. Read with `SKILL.md`, whose Architecture contract defines the target; this file holds the steps, the checks, and the stops.

## Outcome

`docs/architecture.md` within its contract and in agreement with the code: every unit, location, and dependency it names exists as stated; every invariant holds or is reported as violated; nothing below the top level; the `Checked against the code:` line carries today's date.

## Constraints

- Code is authoritative over entries. A codemap entry that disagrees with the code is corrected to the code without asking. An invariant the code breaks is not rewritten; it is a suspected violation for the user.
- An invariant is added only when the user confirms it, a decision record sets it, or a shipped skeleton introduces it, and removed only when the user decides.
- Edits stay inside `docs/architecture.md`. A dependency checker that could enforce an invariant is proposed in the report, not configured.

## Stops

- Candidate invariants found in the code, put to the user in one batch: each confirmed one is written, each declined one is dropped.
- A suspected violation: report it, and leave the invariant as written.
- An invariant that no longer constrains anything, such as one naming a unit that no longer exists: propose its removal.

Nothing else stops. Correcting entries to the code, cutting what sits below the top level, and dating the check happen in one run.

## Steps

1. **Read** `docs/architecture.md`, the decision records its invariants name, and the code's top-level layout and imports. When the document or its line in the conventions block is missing, run `init` first; it creates only what is missing.
2. **Inventory the top-level units** in the code: the crates, packages, services, or directory groups a maintainer would name, what each owns, and the imports between them. Use the repo's dependency tool to draw the graph when one is configured.
3. **Compare the codemap** with the inventory, and correct it to the code:
   - a unit in the code with no entry gets one;
   - an entry with no unit in the code is removed; one whose unit moved or was renamed is corrected;
   - a responsibility, owner, dependency list, or location that disagrees with the code is corrected.

   An empty codemap is filled this way.
4. **Check each invariant** by the means the code allows: an absence of imports, calls, or writes is checked by search or by the repo's dependency tool. One that holds stays; one that fails is a suspected violation; one no static check can decide is listed as unchecked.
5. **Find candidate invariants**: absences between units that look deliberate, such as a lower layer that never imports a higher one. Put them to the user.
6. **Apply the contract.** Each entry passes the inclusion test; an entry below the top level, a file tree, a link, a line number, or the path of a single feature is cut. Past about 300 lines, list the entries that most likely belong one level down.
7. **Date the check**: `Checked against the code: YYYY-MM-DD`.
8. **Report** the entries added, corrected, removed, and cut; the invariants checked, unchecked, and violated; the candidates confirmed and declined; and each invariant a dependency checker the repo has, or could add, would enforce.

## Checks for archive

`archive` runs steps 3, 4, and 6 on the entries of a skeleton's Architecture changes, before merging them. An entry that disagrees with the code means the shipped structure departs from the skeleton: the entry is corrected to the code, then merged. An invariant the plan introduces or keeps that the code breaks is a suspected violation and stops the archive. Drift in entries the plan does not touch is reported for a later `architecture-review`, not corrected by `archive`, and the check date is left as it was.
