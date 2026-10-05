---
name: "spec-flow"
description: "Manage a repo's plans and specs through init, propose, verify, archive, and decide: scaffold the docs layout, grill then write a plan with its spec changes, check the work against plan and spec, merge the plan into the spec and archive it."
---

# Spec Flow

Keep a trace of intent and decisions in the repo without letting stale documents pass as current truth. The governing idea: **a document's location states its status**. A reader, human or agent, knows from the directory alone whether a file describes intent, reality, or history.

This skill owns the layout, the format of each document type, and the transitions between states.

A feature moves through `propose → (implementation) → verify → archive`. `init` runs once per repo. `decide` applies at any point.

Sources: plan and spec formats adapted from OpenSpec's `spec-driven` schema — https://github.com/Fission-AI/OpenSpec/blob/main/schemas/spec-driven/schema.yaml · the interview in `propose` adapted from Matt Pocock's `grilling` skill — https://github.com/mattpocock/skills

## Layout

```
AGENTS.md / CLAUDE.md             conventions block + overview loaded every session
docs/overview.md                  one page: what, principles, current focus, next, non-goals
docs/specs/<feature>.md           reality: the behavior contract of a shipped feature
docs/plans/<slug>/                intent: one directory per feature being built or queued
  plan.md                         why, what changes, design, tasks
  specs/<feature>.md              proposed changes to docs/specs/<feature>.md
docs/archive/YYYY-MM-DD-<slug>/   history: a shipped plan's directory, kept as it was
docs/decisions/NNNN-slug.md       cross-feature technical decisions
```

The `## Docs conventions` block in the repo's instruction file is authoritative for paths. Read it first; a repo may place these directories elsewhere. Use the defaults above only when the block is absent.

Write documents in the language the repo's existing docs use. The structural keywords `Requirement:`, `Scenario:`, `ADDED`, `MODIFIED`, `REMOVED`, `WHEN`, `THEN`, `AND` stay as written.

## Document contracts

Each type has a template under Templates. A document follows its template's sections in order; a section with nothing to say is omitted, not filled.

### Overview — `docs/overview.md`

One page, dated. Principles and non-goals are trade-off rules an agent applies when choosing an implementation. Status points at `docs/specs/` and lists no features: the directory is the inventory. The file is loaded every session, so length is a cost.

### Spec — `docs/specs/<feature>.md`

A spec is a behavior contract for one feature a user would name. It is not an implementation description.

- **Purpose**: one or two sentences on what the feature is for, naming the module that owns it.
- **Requirements**: each is `### Requirement: <name>` followed by one normative statement using SHALL or MUST (or the equivalent in the repo's language). One behavior per requirement.
- **Scenarios**: every requirement has at least one `#### Scenario: <name>` in WHEN / THEN form. Examples and edge cases go in scenarios, not in the requirement text. Each scenario is a potential test case.
- Belongs in a spec: observable behavior, inputs and outputs, error conditions, external constraints (security, privacy, compatibility).
- Stays out: internal class and function names, library choices, implementation steps, history, rejected options. The test: when the implementation can change without changing visible behavior, the detail does not belong in the spec.
- Code is authoritative. A spec that disagrees with the code is a defect in the spec.

### Plan — `docs/plans/<slug>/`

One plan covers one shippable feature or one change to shipped features. Every directory in `docs/plans/` is live intent. Nothing under `docs/plans/` is evidence of how the system behaves.

**`plan.md`**
- **Why**: the problem or opportunity in one or two sentences.
- **What changes**: bullets, specific about what is added, modified, or removed. Lists each affected spec as new or modified; each has a spec change file.
- **Out of scope**: see the rule below.
- **Design**: how. Included only when the change is cross-cutting, adds a dependency or changes the data model, carries security, performance, or migration complexity, or has ambiguity worth settling before coding.
  - Decisions: each choice with its reason and the alternative turned down.
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

Why and What changes stay short; `plan.md` is one to two pages before tasks.

**Spec change files — `specs/<feature>.md`**

One file per affected spec, named after the spec it targets: `docs/plans/<slug>/specs/tasks.md` proposes changes to `docs/specs/tasks.md`. Requirements and scenarios use the same heading levels and wording rules as a spec, so a block moves between the two unchanged.

- `## Purpose`: present only when the target spec does not exist yet.
- `## ADDED Requirements`: new requirements, complete with scenarios.
- `## MODIFIED Requirements`: the full updated requirement block under its existing name. The name is the handle that locates the requirement in the spec.
- `## REMOVED Requirements`: the requirement's heading followed by `**Reason**:`.
- A rename is a REMOVED entry for the old name and an ADDED entry for the new one.

A plan with no behavior change (refactor, tooling) has no `specs/` directory and touches no spec.

The plan is edited as understanding changes during implementation; plan and spec change files are kept consistent with each other.

### Archive — `docs/archive/YYYY-MM-DD-<slug>/`

A shipped plan's directory, moved whole and dated with the day it was archived. It records why the feature was built, what was left out, the design choices and the alternatives turned down, and the tasks as they were carried out.

An archived plan is history. Its contents stay as they were at archive time. Its spec change files are already merged into `docs/specs/` and carry no authority; the spec is the contract.

### Decision — `docs/decisions/NNNN-slug.md`

Sequential number, one decision per file, one to two pages. `Status:` is one of `Proposed` | `Accepted` | `Rejected` | `Superseded by NNNN`. The body of an accepted record is immutable; a changed decision is a new record. Rejected and superseded records stay in place.

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

An operation runs through to its end. It stops only where nothing can move without the user.

Stops that belong:
- `init`: the user's answers for the overview.
- `propose`: each round of the interview; an idea that runs into a Non-goal or a `Rejected` decision.
- `archive`: a `Not ready` verdict the user has not accepted; a merge or check that fails; an archive target that already exists.
- `decide`: the user's call on whether a proposed decision is accepted.

Stops that do not belong:
- In `propose`, pausing between the spec change files and `plan.md` to ask whether to continue.
- In `verify`, reporting after the code review and waiting before the plan and spec checks. Verify produces one report, at the end.
- In `archive`, pausing between the merge and the move, or holding the archive until decision records are approved.
- In any operation, ending the turn with a summary that announces the next step instead of taking it.

A status note goes in the same message as the next action.

## Operations

Identify which operation the request maps to. When it maps to none, say so rather than improvising a new transition.

### init — scaffold a repo

1. Read the instruction file and any existing `docs/`. Report what exists. Existing documents are kept as they are; create only what is missing.
2. Create the missing directories.
3. Create `docs/overview.md` from the template. Fill What / Principles / Non-goals from the user's answers; ask for them. Leave a section empty rather than inventing content.
4. Add the conventions block to the instruction file, and make the overview load every session: an `@docs/overview.md` import in `CLAUDE.md`, or a read-first line in `AGENTS.md`.
5. Report the files created and the lines added.

### propose — grill, then write the plan with its spec changes

**1. Ground.** Look widely before asking or writing anything; what the idea depends on is often somewhere the request does not mention.
- Read the overview.
- List `docs/specs/` and `docs/decisions/` and open every file that could bear on the idea, including ones the request does not name. Read each spec the idea touches in full, scenarios included.
- List `docs/plans/`. Another plan that changes the same spec is a conflict in the making: raise it with the user in the first round of the interview.
- Look in `docs/archive/` for earlier plans on the same feature; they hold the reasons behind its current shape.
- Read the code that implements the feature.

When the idea runs into a Non-goal or a `Rejected` decision, say so and ask whether the user is reopening it before going further.

**2. Grill.** Interview the user until there is a shared understanding of what is being built.
- Treat the idea as a design tree: each decision branches into the decisions that hang off it.
- Work in rounds. The frontier is every decision whose prerequisites are settled. Ask the whole frontier in one round, numbered, each question with a recommended answer. A question that depends on another still open in this round waits for a later round.
- Ask through the host's built-in question tool when it has one (such as `AskUserQuestion` in Claude Code). Each decision becomes one question; the recommended answer is the first option, marked as recommended, and the realistic alternatives are the other options. When the tool limits how many questions one call carries, split the round across consecutive calls. A decision whose answer cannot be reduced to a few options is asked in plain text in the same round. Without such a tool, ask in plain text.
- Facts are the agent's job: anything answerable from the code, the specs, or the environment is looked up, not asked. Decisions are the user's: each is put to them.
- Scope boundaries are decisions like any other. Where neighbouring work could reasonably be part of this plan (a related case, an adjacent module the change passes through, a follow-up the user mentioned), ask whether it is in. The answers that come back "no" or "later" are the plan's Out of scope; nothing else is.
- The interview ends when the frontier is empty, with no branch left silently assumed, and the user confirms the shared understanding.

**3. Write the plan directory** from what the interview settled, spec change files and `plan.md` in one go.
- Spec change files come first: one per affected spec, stating the behavior being committed to. A MODIFIED entry is the existing requirement block copied whole from the spec and then edited.
- Then `plan.md`. Design is written only when the plan contract calls for it; its decisions record what the interview chose and what it turned down.
- A question that would change the requirements, the approach, or the tasks goes back to the user. It does not become an open question in the plan.

**4. Report** the plan's path and a short summary: what changes, which specs are affected, what is out of scope. The plan is ready for implementation once the user approves it.

### verify — read plan and spec, review the code against them, check plan and spec

Report only. Verify changes no files. All five steps run before anything is reported.

**1. Read the plan and the specs.** Read `plan.md`, every spec change file in the plan, and each target spec in `docs/specs/` in full. Everything after this step is judged against what these say, so the reading comes first.

**2. Code review with that context.** Run the `code-review` skill on the change and hand it the context from step 1, so the review judges the code against what was intended, not only against general standards:
- the plan directory's path, with `plan.md` as the statement of intent
- the requirements and scenarios in the spec change files, as the behavior the change commits to
- the requirements in the target specs that the plan leaves untouched, as contracts the change must keep
- Out of scope, as the boundary the change stays inside
- the plan's Design decisions, as choices already made with the user; the review flags code that departs from them, and does not reopen them

When the `code-review` skill is unavailable, say so and review the diff directly with the same context.

**3. Plan check.**
- Every task is ticked.
- Each task's stated verification holds: the test exists and passes, the command runs, the behavior is observable.
- Work in the diff that no task covers is listed as unplanned.

**4. Spec check.** For each scenario in the plan's spec change files, classify it, drawing on the review's findings:
- satisfied and covered by a test
- satisfied, no test
- not satisfied

Then check each spec change file against its target spec:
- Each MODIFIED and REMOVED entry names a requirement that exists in the spec.
- Each affected spec listed in `plan.md` has a change file, and each change file is listed.
- The change breaks no existing requirement that the plan leaves unlisted. A broken, unlisted requirement is either a bug or a missing MODIFIED entry; report it and let the user say which.
- Behavior the code adds that no requirement describes is listed.

**5. Verdict.** `Ready to archive` or `Not ready`, followed by findings from the review and the two checks in one list ordered by severity, each tied to a file, task, or scenario. State what was run and what was only read.

### archive — merge the plan into the specs, then move it to the archive

Archive runs on a verified plan. With no verify result at hand, run `verify` first. With a `Not ready` verdict, continue only when the user accepts the open findings by name.

The order is fixed: merge, check, move. When the merge or the check fails, nothing is moved. Once the merge starts, steps 1 to 5 run without a pause, so the repo is never left with specs merged and the plan still in `docs/plans/`.

1. **Merge each spec change file into the spec of the same name.** ADDED: append the blocks as they are. MODIFIED: replace the requirement of that name with the full updated block. REMOVED: delete the requirement. A new spec is created with its Purpose. Where verify found the code behaving differently from a planned requirement and the user accepted it, correct the change file first, then merge, so the archive and the spec agree.
2. **Check the result.** Each merged spec still follows the spec contract: every requirement has a scenario, no requirement appears twice, no ADDED / MODIFIED / REMOVED heading remains.
3. **Move the plan directory** with `git mv` to `docs/archive/YYYY-MM-DD-<slug>/`, dated today. When the target already exists, stop and report.
4. **Update the overview**: Current focus, Next, and the date.
5. Keep these edits in the same change set as the code when that change is still open.
6. **Report** what was merged and moved. In the same report, propose decision records: run each choice under the plan's Design through the decision gate and list those that pass. A record is written through `decide` once the user approves it; the archive does not wait for that.

### decide — record a decision

1. Apply the decision gate. When it fails, say which condition fails and write nothing.
2. Create the record with the next number. Use `Proposed` while undecided, `Accepted` once the user decides, `Rejected` for an approach turned down for durable reasons.
3. Superseding: write the new record, then change only the old record's status line to `Superseded by NNNN`.

## Boundaries

- Commit or push only when the user asks.
- The body of an accepted decision and the contents of `docs/archive/` are left as written.
- A directory the conventions block does not name is outside this skill's remit.
- Report every file created, moved, edited, or deleted at the end of an operation.

## Templates

### Conventions block (instruction file)

```markdown
## Docs conventions
- `docs/overview.md`: what this project is, its principles, current focus, and non-goals. Read it before starting work. Non-goals are not to be implemented or proposed.
- `docs/specs/`: the behavior contract of each shipped feature. Update the spec in the same change as the code. When a spec and the code disagree, the code is right and the spec gets fixed.
- `docs/plans/`: intent for features being built or queued. Everything under it, including the spec change files in `docs/plans/<slug>/specs/`, is a proposal and not a description of current behavior. When implementing a plan, read the Tasks in its `plan.md` to find what is open, and tick each task as its work lands.
- `docs/archive/`: shipped plans kept as history. Nothing in it describes current behavior or is work to do; its spec change files are already merged into `docs/specs/`. Read it only to learn why something was built the way it was. Its contents are not edited.
- `docs/decisions/`: only records with `Status: Accepted` are in force. A changed decision is a new record that supersedes the old one. An approach recorded as `Rejected` is not to be proposed again.
```

### Overview

```markdown
# Project overview
Updated YYYY-MM-DD

## What this is

## Principles

## Status
Shipped features are described in `docs/specs/`.

## Current focus

## Next

## Non-goals
```

### Spec

```markdown
# <Feature>

## Purpose

## Requirements

### Requirement: <name>
The system SHALL <one behavior>.

#### Scenario: <name>
- **WHEN** <condition>
- **THEN** <expected outcome>
```

### Plan — `plan.md`

```markdown
# <Feature or change>

## Why

## What changes
- <change>

Specs:
- `<feature>` (new | modified)

## Out of scope
- <work someone would expect here, left out> — <why, or where it goes instead>

## Design

### Decisions
- <choice> — because <reason>. Turned down: <alternative>, because <reason>.

### Risks
- [<risk>] → <mitigation>

### Open questions

## Tasks

### 1. <group>
- [ ] 1.1 <task>; verified by <test, command, or observable behavior>
```

### Spec change file — `specs/<feature>.md`

```markdown
# <Feature> — spec changes

## Purpose

## ADDED Requirements

### Requirement: <name>
The system SHALL <one behavior>.

#### Scenario: <name>
- **WHEN** <condition>
- **THEN** <expected outcome>

## MODIFIED Requirements

### Requirement: <existing name>
<full updated requirement and all its scenarios>

## REMOVED Requirements

### Requirement: <existing name>
**Reason**: <why it is removed>
```

### Decision record

```markdown
# NNNN: <title>

Status: Proposed
Date: YYYY-MM-DD

## Context

## Decision

## Considered options

## Consequences
```