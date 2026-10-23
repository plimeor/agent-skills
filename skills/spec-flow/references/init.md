# init — scaffold a repo

Runs once per repo, and again to complete a partial layout. Read with `SKILL.md`, whose Layout, Overview contract, and Architecture contract define the result; this file holds the steps and the three templates `init` writes.

## Stops

- The user's answers for the overview's What / Principles / Non-goals. Nothing else: the directories, the architecture doc, and the conventions block need no answer.

## Steps

1. Read the instruction file and any existing `docs/`. Report what exists. Existing documents are kept as they are; create only what is missing.
2. Create the missing directories.
3. Create `docs/overview.md` from the template. Fill What / Principles / Non-goals from the user's answers; ask for them. Leave a section empty rather than inventing content.
4. Create `docs/architecture.md` from the template, its sections empty. `architecture-review` fills them from the code.
5. Add the conventions block to the instruction file, or the lines an existing block lacks, and make the overview load every session: an `@docs/overview.md` import in `CLAUDE.md`, or a read-first line in `AGENTS.md`.
6. Report the files created and the lines added. In a repo with code, name `architecture-review` as the step that fills the architecture doc.

## Templates

### Conventions block (instruction file)

```markdown
## Docs conventions
- `docs/overview.md`: what this project is, its principles, current focus, and non-goals. Read it before starting work. Non-goals are not to be implemented or proposed.
- `docs/architecture.md`: the structure in force at the top level: the units, what each owns, how they depend on each other, and the invariants between them. Read it before changing code that crosses units. Code is authoritative over its entries; code that breaks an invariant is reported as a suspected violation for the user to decide. It changes only when a plan is archived or through an architecture review.
- `docs/specs/`: the promises each shipped feature makes to its users, one file per feature, grouped in area subdirectories where a feature area holds several specs; what a spec leaves unspecified is the implementation's choice and may change without notice. Update the spec in the same change as the code. When a spec and the code disagree, the code is right and the spec gets fixed, unless the code breaks a guarantee users rely on; that is reported as a suspected bug for the user to decide.
- `docs/plans/`: intent for features being built or queued. Everything under it, including the skeleton (`skeleton.md`), the design (`design.md`, `design/`), attachments, and the spec change files in `docs/plans/<slug>/specs/`, is a proposal and not a description of current behavior. When implementing a plan, read the Tasks in its `plan.md` to find what is open, follow its skeleton and design, and tick each task as its work lands.
- `docs/archive/`: shipped plans kept as history: `plan.md`, the skeleton, the design, and attachments. Nothing in it describes current behavior or is work to do; the spec and architecture changes each plan made are merged into `docs/specs/` and `docs/architecture.md` and recorded in their git history. Read it only to learn why something was built the way it was. Its contents are not edited.
- `docs/decisions/`: cross-feature technical decisions. Records directly in it are live: `Status: Accepted` is in force; an approach recorded as `Rejected`, or turned down in a live record's Considered options, is not to be proposed again unless the user reopens it. `docs/decisions/superseded/` is history; read it only to learn why a decision changed. A record on the default branch is changed by a new record that supersedes it; a record not yet there is edited in place.
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

### Architecture

```markdown
# Architecture
Checked against the code: YYYY-MM-DD

## Bird's eye

## Codemap

### <unit>
<responsibility in one sentence>
- Owns: <state it alone writes, or the decision it hides>
- Depends on: <units>
- Lives in: <module, package, or directory, named and not linked>

## Invariants
- **<name>**: <unit> never <calls | imports | writes> <what>. <Decision NNNN, when one set it>

## Cross-cutting
- **<concern>**: <how it is handled, and the unit that owns it>
```
