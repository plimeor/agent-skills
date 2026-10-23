# readability-review — make a document readable once its content holds

Runs as the last part of the review that owns each document, after that review has passed: `skeleton-review` for `skeleton.md`, `spec-review` for the spec change files, `architecture-review` for `docs/architecture.md`, and `propose`'s plan check for `plan.md` and the design. Also runs on request on any of them. The owning review checks that a document is right; this one checks that a reader can follow it. It comes last because fixes made by the owning review tend to land as clauses appended to sentences that were already full, and those clauses are what it most often finds. Read with `SKILL.md`, whose document contracts and budgets still govern every fix; this file holds the two checks, the limits on a fix, and the stops.

## Outcome

The document reviewed by the `sepia` skill and read cold by a fresh reader, fixed, and holding the same facts, interfaces, promises, and tasks it held before. A contradiction the cold reader finds is not left in place: it goes to the owning review, which treats it as a finding of its own.

When the `sepia` skill is unavailable, or the host cannot spawn a sub-agent for the cold read, say so in the report and skip that check; do not run it from memory or in the context that wrote the document.

## Stops

- A fix that would change what a document says, not how: a unit, an interface, an owner, a dependency, a path step, a requirement, a task, an entry, or a decision. It is not a readability fix. Leave the text, and send the finding to the owning review: `skeleton-review`, `spec-review`, or `architecture-review`; for `plan.md` and the design, the user.
- A document that can be made readable only by going past its budget. Leave it within budget and name the passages in the report; the user decides between the budget and the fix.

Not a stop: a document with no finding.

## 1. Sepia review

Run the `sepia` skill's `review` operation on the document. Pass as protected ranges the parts whose wording is fixed by the contract or by code: code blocks and signatures, requirement and scenario names, the structural keywords `SKILL.md` lists, paths, commands, and quoted identifiers. Sepia reports defects found there but does not fix them.

## 2. Cold read

A fresh sub-agent reads the document once as the reader it is written for, with nothing else in its context and no access to the repo, except that a spec change file is read together with its target spec:

| Document | Reader | Restates |
|---|---|---|
| `docs/architecture.md` | A maintainer new to the repo | For two changes the agent picks from the overview's Next or recent history: which unit each belongs in and which invariants bind it |
| `plan.md` | The person approving the plan | What changes for users, what is out of scope, and what group 1 delivers |
| `skeleton.md` | The implementer of task group 1 | The change in three to five sentences, one sentence per unit, and the first path step by step |
| The design | The implementer of a later task group | Each section's decision in one sentence |
| A spec change file | A reviewer of what users are promised | Each requirement it adds or changes, in their own words |

The reader reports, quoting the document each time: its restatement; each sentence or code line it had to reread or could not parse, and why; each term used before it is explained; and each place where two sections disagree.

Judge the report against the document:
- A restatement that differs from what the document says is a finding: the passage it came from misleads.
- A stall or an undefined term is a readability finding, fixed in step 3.
- A disagreement between sections is a content finding. It goes to the owning review, which fixes it under its own rules; for the skeleton it is a failed consistency check.

## 3. Fix

Fix each readability finding from steps 1 and 2, deepest first, by hand under the document's contract. Sepia's own `refactor` and `recreate` are not used: they do not know the document's template, inclusion tests, or budget. A fix:
- replaces or deletes words, or splits one sentence or bullet into several; it adds a word only where the split sentence needs it to parse;
- keeps every fact, in the section and order its template sets;
- defines a term where the document first uses it;
- rewrites a sentence carrying an appended correction as the one sentence it should have been, with nothing left that reads as a patch.

A defect sepia reports inside a protected range is fixed only when the contract allows a different wording, such as a comment inside a code block that should be a bullet under it.

## 4. Second pass

When step 3 or the owning review changed the document, run the sepia review once more on the changed passages, and a new cold read, by a fresh sub-agent, on the whole document. Fix what they find under the same rules. Findings left after this pass go in the report; there is no third pass.

## Report

Inside the owning review's report, or on its own when run on request: the checks run and those skipped, with why; the findings fixed, counted per check; the restatements that differed and the passages fixed for them; the contradictions sent to the owning review or the user; the findings left, each with its quoted evidence; and the passages left over budget. Cold-read results are reported as simulated readers, not real ones.
