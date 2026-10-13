---
name: "spec-flow"
description: "Manage a repo's plans and specs through init, propose, verify, archive, decide, and tidy: scaffold the docs layout, grill then write a plan with its spec changes, check the work against plan and spec, merge the plan into the spec and archive it, record, supersede, or consolidate decision records, and bring existing specs and decisions back within their contracts."
---

# Spec Flow

Keep a trace of intent and decisions in the repo without letting stale documents pass as current truth. Two ideas govern it. **A document's location states its status**: a reader, human or agent, knows from the directory alone whether a file describes intent, reality, or history. **A spec states promises, not behavior**: it holds what the project would owe users a fix or a migration note for, and stays silent on everything else, however visible.

This file is the map: the layout, how to read a repo's state, which operation a request maps to, and the contract of each document type. Each operation's steps, stops, and templates are in its own file under `references/`; read that file before running the operation.

A feature moves through `propose → (implementation) → verify → archive`. `init` runs once per repo. `decide` applies at any point. `tidy` runs on request, outside any plan.

Sources: plan and spec formats adapted from OpenSpec's `spec-driven` schema — https://github.com/Fission-AI/OpenSpec/blob/main/schemas/spec-driven/schema.yaml · the interview in `propose` adapted from Matt Pocock's `grilling` skill — https://github.com/mattpocock/skills

## Layout

- `AGENTS.md` / `CLAUDE.md` — the conventions block, and the overview loaded every session
- `docs/overview.md` — one page: what, principles, current focus, next, non-goals
- `docs/specs/<feature>.md` — reality: the promises a shipped feature makes to its users
- `docs/plans/<slug>/` — intent: one directory per feature being built or queued
  - `plan.md` — why, what changes, design, tasks
  - `specs/<feature>.md` — proposed changes to `docs/specs/<feature>.md`
- `docs/archive/YYYY-MM-DD-<slug>/` — history: a shipped plan's `plan.md`, kept as it was
- `docs/decisions/NNNN-slug.md` — live: cross-feature decisions in force (`Accepted`) or ruled out (`Rejected`)
- `docs/decisions/superseded/` — history: replaced decision records, not read by default

The `## Docs conventions` block in the repo's instruction file is authoritative for paths. Read it first; a repo may place these directories elsewhere. Use the defaults above only when the block is absent.

Write documents in the language the repo's existing docs use. The structural keywords `Type:`, `Budget:`, `Requirement:`, `Scenario:`, `ADDED`, `MODIFIED`, `REMOVED`, `WHEN`, `THEN`, `AND`, and the type names `feature`, `api`, and `format` stay as written.

## Reading a repo's state

Before any operation, and to answer any question about where a project stands, read in this order. Each location answers one question and no other.

- **The `## Docs conventions` block** in `AGENTS.md` / `CLAUDE.md`: where the directories below live in this repo. It says nothing about the project. A missing block means `init` has not run.
- **`docs/overview.md`**: what the project is, its principles, the current focus, what is next, the non-goals. Not what is shipped; the specs directory is the inventory.
- **`docs/specs/`**: the promises in force, one file per shipped feature. Not how the code does it, nor anything a spec is silent on.
- **`docs/plans/`**: live intent. Every directory is a feature being built or queued; the unticked Tasks in its `plan.md` are the open work; its `specs/` are proposals. Not how the system behaves today.
- **`docs/decisions/`**, the files directly in it: decisions in force (`Accepted`) and approaches ruled out (`Rejected`). Not feature behavior; that is the spec's.
- **`docs/archive/`** and **`docs/decisions/superseded/`**: why things came to be as they are. Not current behavior or open work; read only when the question is why.

The code is authoritative over the specs. A spec that disagrees with it is the defect, except where the code breaks a guarantee users rely on; that is a suspected bug to report, not to write into the spec.

## Routing

Identify which operation the request maps to, then read that operation's file before doing anything else; it holds the steps, the stops, and the templates the operation writes. When a request maps to none, say so rather than improvising a new transition.

- **Set up the docs layout** in a repo that has none, or complete a partial one: `init`, in `references/init.md`.
- **Plan a feature or a change** ("I want to add", "let's build", "propose"): `propose`, in `references/propose.md`.
- **Check finished work against its plan** ("is it ready", "verify", "review against the plan"): `verify`, in `references/verify.md`.
- **Ship a verified plan** ("archive", "merge the spec changes"): `archive`, in `references/archive.md`.
- **Record, change, or consolidate a cross-feature decision**: `decide`, in `references/decide.md`.
- **Tidy, shorten, or consolidate existing specs or decisions**: `tidy`, in `references/tidy.md`.

Three requests map to no operation:

- **Implement a plan's tasks.** Read the plan's Tasks to find what is open, tick each task as its work lands, keep `plan.md` and its spec change files consistent, and write the code against the spec change files and the specs the plan leaves untouched.
- **A question about the project's state**: what is shipped, what is open, why something is the way it is. Read the state as above and answer; open the archive and `superseded/` only when the question is why.
- **Drop a plan.** See Abandoned plans.

## Document contracts

Each type has a template: the spec's under Templates below, the others in the file of the operation that writes them (overview and conventions block in `init`, plan and spec change file in `propose`, decision record in `decide`). A document follows its template's sections in order; a section with nothing to say is omitted, not filled.

### Overview — `docs/overview.md`

One page, dated. Principles and non-goals are trade-off rules an agent applies when choosing an implementation. Status points at `docs/specs/` and lists no features: the directory is the inventory. The file is loaded every session, so length is a cost.

### Spec — `docs/specs/<feature>.md`

A spec is the set of promises one feature, named as a user would name it, makes to its users. It is not a description of behavior, a copy of the test suite, or an index of the code. Every statement the spec could carry lands in one of three places:

| The statement | Where it goes |
|---|---|
| A promise: if it changed, users would be owed a fix or a migration note | A requirement |
| Pinned but not promised: regression protection the project wants without owing anyone | The tests only; the spec is silent |
| Left to the implementation | Nowhere. When silence would mislead, one unspecified clause closing the requirement it qualifies |

The test for every sentence: if this changed, would users be owed a fix or a migration note? Yes: it is a requirement. No: it is not in the spec, however visible the behavior is.

- **Type.** The line after the title reads `Type: feature`, `Type: api`, or `Type: format`. The type sets where the promise line lies.
  - `feature`: a capability users act on. The promise is what the user can do and what follows, at the grain the user would describe it. Orderings, tiebreaks, algorithm steps, and the format of internal values are the implementation's unless the user named them in the interview. Layout, icons, and styling stay out.
  - `api`: a library or interface other code calls. The promise is signatures and types, guaranteed semantics, error conditions, and stability constraints such as versioning rules, build targets, and minimum toolchain. Exact outputs for given inputs, offsets, and the absence of panics under generated input are tests. Where an external specification is the authority, the spec names it and lists the extensions and divergences; it does not restate it. Examples show usage.
  - `format`: a data format, on-disk layout, or interop contract other tools read and write. The field table is the promise, written as a table under `## Fields`, one row per field: name, type, default, handling when invalid. Rows are not requirements. How leniently the format is read is one requirement.
- **Purpose**: one or two sentences on what the feature is for, naming the module that owns it.
- **Requirements**: each is `### Requirement: <name>` followed by one normative statement using SHALL or MUST (or the equivalent in the repo's language). One rule per requirement, where a rule is what a reader applies as a unit: its input checks, error variants, and edge cases stay in the same requirement. A requirement that mixes several rules is split only along rules that pass the promise test; a split does not make the spec longer.
- **Unspecified clauses.** The default for what the spec does not promise is silence.
  - A clause such as `; the order within a tier is unspecified` closes a requirement's statement only when a reader of that rule would assume a finer rule exists and go looking or fill it in, or when the user placed the matter below the promise line in the interview.
  - The clause names what is left open and says nothing about what the implementation does today. What the agent alone judged below the line is not written.
  - There is no `Unspecified` section: a list of what is not promised grows the way a list of scenarios does.
- **Scenarios**: `#### Scenario: <name>` in WHEN / THEN form, zero to two per requirement. A scenario exists only when the rule would be misread without it: the case that shows what the rule means, or the edge where it turns. Combinations, boundaries, and error variants are tests. Every scenario is a test case; most test cases are not scenarios.
- **Tests name requirements.** Each requirement is named by at least one test, in the test's name or a comment beside it. The name is the link from the promise to its evidence; `verify` checks it.
- **Details with another authoritative source.** When the repo already holds the authority for a detail — a data table in the code, a visual baseline, a design file, a generated schema, an external specification — the spec states the rule that defines it and shows at most one or two values. It does not enumerate the values or give counts derived from them.
- **Paths.** The spec names a concept, not the file that implements it. Where readers need the location, the repo's instruction file or overview maps the concept to it, in one place. A path stays in a spec only when it is itself observable: a path the user types, one printed in output, or a file whose presence the feature checks.
- **Budget.** Ten requirements, two scenarios per requirement, about 150 lines.
  - The counts are the budget; the line count checks them, since blank-line conventions differ between languages. A `format` spec's field table is outside the budget.
  - `verify` returns `Not ready` and `archive` stops for a spec that would be over budget once a plan is merged; the finding names the cuts that bring it back: requirements that demote to tests, scenarios that go, clauses that fall silent.
  - A spec that holds more promises than the budget allows is usually two features a user would name separately; split it. When it is one feature, the line after `Type:` reads `Budget: <N> requirements, because <reason>`, so the exception is visible to every reader.
- **Requirement names are handles.** Other specs, tests, code comments, and docs cite a requirement by name. A change that renames, merges, or removes a requirement updates every such reference in the same change, except in `docs/archive/` and `docs/decisions/superseded/`, which stay as written.
- Code is authoritative. A spec that disagrees with the code is a defect in the spec, with one exception: when the code breaks a guarantee users rely on, such as data kept, state consistent across commands, or a security constraint, the disagreement is a suspected bug. The spec is not rewritten to describe it; report it and let the user decide whether the code or the spec changes.

**Bringing existing specs in line** is the `tidy` operation: a direct edit to `docs/specs/`, not a plan. It changes no behavior and states nothing the spec did not already state; what leaves the spec is in the tests or in git history, not lost.

### Plan — `docs/plans/<slug>/`

One plan covers one shippable feature or one change to shipped features. Every directory in `docs/plans/` is live intent. Nothing under `docs/plans/` is evidence of how the system behaves.

**`plan.md`**
- **Why**: the problem or opportunity in one or two sentences.
- **What changes**: one line per requirement added, modified, or removed, naming the spec and the requirement; a removed requirement's line gives the reason. The spec change file holds the content; What changes does not restate it. Lists each affected spec as new or modified; each has a spec change file. A plan with no behavior change says so in one line.
- **Out of scope**: see the rule below.
- **Design**: how. Included only when the change is cross-cutting, adds a dependency or changes the data model, carries security, performance, or migration complexity, or has ambiguity worth settling before coding.
  - Decisions: at most five, each a choice a later reader would ask why about, with its reason and the alternative turned down. A choice below the promise line is not a decision; the implementer makes it in the code.
  - Risks: `[risk] → mitigation`.
  - Open questions: only unknowns that can be answered later without changing the requirements, the approach, or the tasks.
- **Tasks**: numbered groups of checkboxes, `- [ ] 1.1 <task>`, ordered by dependency, each small enough for one session. Each task states how its completion is verified. Each group lands the tests its own work calls for; a final group holds integration checks only.

**Out of scope** records boundary decisions, not a description of what the feature is not. An item earns its place when leaving it unsaid would cause a wrong assumption:
- a reader of What changes would expect the plan to include it, or
- the implementer, already in that code, would be tempted to do it.

Every item comes from the interview, where the user ruled it out or deferred it, and is written as `<the work left out> — <why, or where it goes instead>`. An item with no such reason to give does not belong.

What stays out of the section:
- Things nobody would have assumed were included. A plan to build an aircraft does not list "not a rocket, not a train".
- Restatements of the feature's category or title in the negative.
- The overview's Non-goals; they already apply to every plan.
- Items invented while writing to make the section look complete.

The section has no minimum length. With no real boundary decision to record, it is omitted.

Tasks is the working checklist during implementation. A task is ticked the moment its work lands. An agent picking the work up, after a break or in a new session, reads Tasks first to find what is open.

**Budget.** What changes holds at most ten lines and Design at most five decisions; `plan.md` is about 80 lines before Tasks. `verify` lists a plan over its budget.

**Spec change files — `specs/<feature>.md`**

One file per affected spec, named after the spec it targets: `docs/plans/<slug>/specs/tasks.md` proposes changes to `docs/specs/tasks.md`. Requirements and scenarios use the same heading levels and wording rules as a spec, so a block moves between the two unchanged.

- The `Type:` line and `## Purpose`: present only when the target spec does not exist yet.
- `## ADDED Requirements`: new requirements, complete with scenarios.
- `## MODIFIED Requirements`: the full updated requirement block under its existing name. The name is the handle that locates the requirement in the spec.
- `## REMOVED Requirements`: the requirement's heading followed by `**Reason**:`.
- A rename is a REMOVED entry for the old name and an ADDED entry for the new one.
- The file is written against the merged budget: the target spec's requirements plus ADDED minus REMOVED fit the spec budget, or the file carries the REMOVED entries that make it fit, each with its reason. A requirement that leaves the spec for the tests is a REMOVED entry whose reason says so.

A plan with no behavior change (refactor, tooling) has no `specs/` directory and touches no spec.

The plan is edited as understanding changes during implementation; plan and spec change files are kept consistent with each other.

### Archive — `docs/archive/YYYY-MM-DD-<slug>/`

A shipped plan's directory, moved and dated with the day it was archived. It holds `plan.md` only, which records why the feature was built, what was left out, the design choices and the alternatives turned down, and the tasks as they were carried out.

The spec change files stay out of the archive. After the merge their content lives in `docs/specs/`, and the change each one made is in the git history of its target spec, in the commit that lands the plan on the default branch under any merge strategy. The one part a spec diff cannot show, the reason a requirement was removed, is kept in `plan.md`'s What changes. Kept, they would add several files per shipped plan and leave stale copies of requirements beside the contract, where a search finds them. Earlier plans on a feature are found by the feature's name in their `Specs:` list.

An archived plan is history. `plan.md` stays as it was at archive time and carries no authority over behavior; the spec is the contract.

### Decision — `docs/decisions/NNNN-slug.md`

One decision per file, one to two pages. Numbers are sequential and never reused; the next number is one past the highest in `docs/decisions/` and `docs/decisions/superseded/` together.

The directory states the status:
- `docs/decisions/` holds the live set: records with `Status: Accepted`, which are in force, and records with `Status: Rejected`, which stay so the approach is not proposed again.
- `docs/decisions/superseded/` holds history: a replaced record, moved with `git mv` under its own number and file name, its status line reading `Superseded by NNNN`. It is read only to trace why a decision changed.

A record is written once the user has decided. A choice still under discussion lives in the conversation or in a plan's Design.

**Published records.** A record is published once it is on the repo's default branch, where other branches and downstream readers can cite it. Before that it belongs to the branch that adds it: it is edited in place, renumbered when another branch published the same number first, or deleted when the decision is dropped. A published record's body is fixed; changing the decision means a new record that supersedes it.

**Superseding.** The new record restates everything still in force from the records it replaces, so the live set reads complete without opening `superseded/`, and names them on its `Supersedes:` line, a line other records omit. A record that is partly outdated is superseded whole, with its still-valid part carried forward.

**Consolidation.** The live set grows with the number of topics, not with time. A topic is a set of records a reader would need together to apply any one of them. Write one consolidated record that supersedes the others when a topic holds two or three live records, or when an Accepted record is partly outdated. It carries the parts still in force, leaves out what is outdated, and may fold the topic's `Rejected` records into its Considered options, each with its reason. It restates decisions that already passed the decision gate; the gate is not reapplied.

**Budget.** The live set stays small enough to read in one pass: about 10–15 records. A larger set signals that consolidation is due; it is not a hard limit.

Decision gate — write a record only when all three hold:
1. Hard to reverse.
2. Surprising without context: a future reader would wonder why.
3. A real trade-off: genuine alternatives existed.

## Abandoned plans

An abandoned plan's directory is deleted, not archived: the archive holds plans that produced a shipped feature. The deleted text remains in git history.

What outlives an abandoned plan is the reason it was dropped, and only when that reason is durable:
- A lasting product boundary becomes one line in the overview's Non-goals.
- A technical approach rejected for reasons that will still hold later becomes a decision record with `Status: Rejected` (through `decide`, subject to the decision gate).

A plan dropped for lack of time or interest leaves nothing behind. Ask the user which case applies; record their reason, not an inferred one.

## Stops

An operation runs through to its end and stops only where nothing can move without the user. Each operation's file lists its stops and the pauses that do not belong to it. In every operation, ending the turn with a summary that announces the next step instead of taking it is not a stop. A status note goes in the same message as the next action.

## Boundaries

- Commit or push only when the user asks.
- The body of a published decision record and the contents of `docs/archive/` and `docs/decisions/superseded/` are left as written; superseding changes only the replaced record's location and status line.
- A directory the conventions block does not name is outside this skill's remit.
- Report every file created, moved, edited, or deleted at the end of an operation.

## Templates

### Spec

```markdown
# <Feature>
Type: feature | api | format

## Purpose

## Fields
| Field | Type | Default | When invalid |
|---|---|---|---|

## Requirements

### Requirement: <name>
The system SHALL <one rule>.

#### Scenario: <name>
- **WHEN** <condition>
- **THEN** <expected outcome>
```

`## Fields` appears in a `format` spec only. A scenario appears only where the rule would be misread without it.
