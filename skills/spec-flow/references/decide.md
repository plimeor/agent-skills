# decide — record, supersede, or consolidate a decision

Applies at any point. Read with `SKILL.md`, whose Decision contract defines the record, its status by directory, superseding, consolidation, the budget, and the decision gate; this file holds the steps, the stops, and the template.

## Stops

- The user's call on a decision.
- The user's approval of a consolidated record before the records it replaces move.

## Steps

1. **New decision.** Apply the decision gate. When it fails, say which condition fails and write nothing. Otherwise create the record in `docs/decisions/` with the next number: `Accepted` for the user's chosen approach, `Rejected` for an approach turned down for durable reasons.
2. **Changed decision.** An unpublished record is edited in place. A published one is superseded: write the new record, `git mv` each replaced record to `docs/decisions/superseded/`, change only its status line to `Superseded by NNNN`, and update links to its old path in the overview, plans, specs, and live records. Links inside `docs/archive/` stay as written; the number still locates the record.
3. **Consolidation.** When a topic meets the consolidation condition, or the live set is past its budget, group the live records by topic and draft the consolidated record. Put the draft to the user; on approval, write it and supersede the records it replaces as in step 2. An unpublished record it replaces is deleted rather than moved.
4. **Check the live set.** After any write, count the live records and look for topics that meet the consolidation condition. Name them in the report as consolidation candidates.
5. **Report** the records created, edited, moved, or deleted, and the size of the live set.

## Template

### Decision record

```markdown
# NNNN: <title>

Status: Accepted
Date: YYYY-MM-DD
Supersedes: NNNN, NNNN

## Context

## Decision

## Considered options

## Consequences
```
