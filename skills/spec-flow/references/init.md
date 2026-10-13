# init — scaffold a repo

Runs once per repo. Read with `SKILL.md`, whose Layout and Overview contract define the result; this file holds the steps and the two templates `init` writes.

## Stops

- The user's answers for the overview's What / Principles / Non-goals. Nothing else: the directories and the conventions block need no answer.

## Steps

1. Read the instruction file and any existing `docs/`. Report what exists. Existing documents are kept as they are; create only what is missing.
2. Create the missing directories.
3. Create `docs/overview.md` from the template. Fill What / Principles / Non-goals from the user's answers; ask for them. Leave a section empty rather than inventing content.
4. Add the conventions block to the instruction file, and make the overview load every session: an `@docs/overview.md` import in `CLAUDE.md`, or a read-first line in `AGENTS.md`.
5. Report the files created and the lines added.

## Templates

### Conventions block (instruction file)

```markdown
## Docs conventions
- `docs/overview.md`: what this project is, its principles, current focus, and non-goals. Read it before starting work. Non-goals are not to be implemented or proposed.
- `docs/specs/`: the promises each shipped feature makes to its users; what a spec leaves unspecified is the implementation's choice and may change without notice. Update the spec in the same change as the code. When a spec and the code disagree, the code is right and the spec gets fixed, unless the code breaks a guarantee users rely on; that is reported as a suspected bug for the user to decide.
- `docs/plans/`: intent for features being built or queued. Everything under it, including the spec change files in `docs/plans/<slug>/specs/`, is a proposal and not a description of current behavior. When implementing a plan, read the Tasks in its `plan.md` to find what is open, and tick each task as its work lands.
- `docs/archive/`: shipped plans kept as history, `plan.md` only. Nothing in it describes current behavior or is work to do; the spec changes each plan made are merged into `docs/specs/` and recorded in its git history. Read it only to learn why something was built the way it was. Its contents are not edited.
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
