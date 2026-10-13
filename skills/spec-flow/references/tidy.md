# Tidy — bring existing specs and decisions within their contracts

Read with `SKILL.md`, whose Spec and Decision contracts define the target state. This file holds the procedure.

## Outcome

Every spec in `docs/specs/` follows the spec contract: a `Type:` line, requirements that pass the promise test for that type, zero to two scenarios each, no copied value lists or implementation paths, within budget or carrying a `Budget:` line with its reason, and each requirement named by a test. The live decision set is within its budget with one record per topic. Nothing the repo promises has changed; what left the prose is in the tests or in git history.

## Constraints

- No behavior changes: no code change, no new promise. A sentence the spec did not already state is not added, even where a test covers it. The only edits outside `docs/` are a requirement's name added beside the test that covers it, in a comment or the test's name; test logic is untouched.
- Whether a sentence is a promise is the user's decision. The agent classifies and proposes; the user chooses the cuts for each spec before it is rewritten.
- A spec that disagrees with the code is corrected to the code, unless the code breaks a guarantee users rely on; that is reported as a suspected bug and the sentence is left as it was.
- Published decision bodies, `docs/archive/`, and `docs/decisions/superseded/` are not edited. A decision changes only through a record that supersedes it.
- Requirement names are handles. A merge keeps one of the names; a rename or removal updates every reference outside `docs/archive/` and `docs/decisions/superseded/` in the same change.

## Done when

- Each spec passes the checks `archive` step 3 applies: within budget, `Type:` line present, no requirement twice, no requirement with more than two scenarios, no stale reference to a removed or renamed requirement.
- Each kept requirement is named by a test, or is listed in the report as a gap.
- The live decision set is within its budget, every topic that met the consolidation condition has been consolidated or the user has declined, and no link in the overview, specs, plans, or live records points at a superseded record's old path.
- The report shows, per spec, the counts before and after, and each requirement or scenario that left with where it went: a test, silence, an unspecified clause, or another spec.

## Stops

- After the inventory, with each spec's proposal: the user chooses the cuts. Batch the proposals into as few rounds as the question tool allows; the user may approve a batch at once.
- A sentence the agent cannot place above or below the promise line is a question in the same round, not a guess.
- A spec and code disagreement that looks like a broken guarantee: report it; leave the sentence.
- A consolidated decision record draft: the user approves before the records it replaces move.

Nothing else stops. Rewriting an approved spec, annotating its tests, updating references, and moving on to the next approved spec happen in one run.

## Specs

**1. Inventory.** For each spec: lines, requirements, scenarios, the most scenarios on one requirement, implementation or test paths, value lists copied from another source, and the type it reads as. One table; it is the "before" column of the report. A spec whose requirements are one per field of a format is `format`. A spec that reads as two features a user would name separately is a split candidate; two specs a user would name as one feature are a merge candidate.

**2. Classify.** Apply the promise test for the spec's type to every requirement and the scenario rule to every scenario.

| Finding | Proposal |
|---|---|
| Requirement users would be owed a fix for if it changed | Keep |
| Requirement that pins behavior nobody is owed | Demote: leaves the spec; the test that covers it keeps it |
| Several requirements that are one rule a reader applies as a unit | Merge under one of their names |
| Requirement body that enumerates values another source holds | Keep the rule and at most two values; name the source |
| Requirement that restates an external specification | Replace with the reference to it, plus the extensions and divergences |
| Requirement body that walks through an algorithm | Keep the outcome at the user's grain; when silence would mislead, close with an unspecified clause |
| Path into the implementation or tests | Replace with the concept, or drop |
| Third and later scenarios, scenarios that repeat the rule, combinations and error variants | Demote to tests |
| One-per-field requirements in a `format` spec | Rows of the `## Fields` table; leniency rules become one requirement |
| Promises alone still over budget | Split along features a user would name, or propose a `Budget:` line with the reason |

**3. Propose.** One proposal per spec, in this shape, put to the user:

```
<spec> — Type: <type>; <req>/<scn>/<lines> → <req>/<scn>/~<lines>
Keep: <names>
Demote to tests: <name> — <why nobody is owed it>; …
Merge: <names> → <surviving name>
Scenarios kept: <requirement>: <scenario>; …
Unspecified clauses: <requirement>: "<clause>"
Split / merge with another spec: <proposal, or none>
Open: <sentences the agent could not place>
```

**4. Rewrite** each approved spec as a whole, to the contract and the template: `Type:` line, Purpose, `## Fields` for a `format` spec, the kept requirements in their existing order under their existing names, their kept scenarios. Every sentence in the result traces to a sentence in the old spec, except the `Type:` line and the approved unspecified clauses. Statements that disagree with the code are corrected under the Constraints.

**5. Tests.** For each kept requirement, find the test that covers it and add the requirement's name beside it. A kept requirement no test covers is a gap in the report, not a test written during tidy. A demoted requirement or scenario no test covers is listed as left the spec and not pinned, for the user to decide on later.

**6. References.** Search the repo for each removed, merged, or renamed requirement name and update every reference outside `docs/archive/` and `docs/decisions/superseded/`.

**7. Check** each rewritten spec against the Done list.

## Decisions

**1. Inventory** the live set: count, and group by topic, where a topic is the records a reader needs together to apply any one of them.

**2. Consolidate** each topic that meets the consolidation condition in the Decision contract: two or three live records on one topic, or an Accepted record partly outdated. Draft the consolidated record under that contract, put it to the user, and on approval supersede the records it replaces as `references/decide.md` step 2 describes. A record that stands alone on its topic is left as it is; tidy reapplies no gate.

**3. Links.** Every link in the overview, specs, plans, and live records to a record now in `superseded/` is updated to the record that replaced it. Links inside `docs/archive/` stay.

**4. Numbering.** Numbers are unique across `docs/decisions/` and `superseded/`; a duplicate is reported, not renumbered, since either record may already be cited.

## Report

One report at the end: the before and after table for specs; per spec, what left and where it went; kept requirements no test names; demoted content no test pins; suspected bugs; the live decision set before and after, with the records consolidated; every file created, edited, moved, or deleted.
