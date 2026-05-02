---
name: code-standards-gate
description: >-
  Apply Plimeor's personal code review standards and implementation-boundary
  preferences. Use this skill for code reviews, reviewing specs before
  implementation, judging whether a proposed feature scope matches MVP
  standards, or checking whether code introduces unnecessary public surface,
  persisted state, abstractions, custom wrapper behavior, or future-facing
  options. Use after a spec or diff is available; for broad pre-spec scope
  control, use code-scope-gate first.
---

# Code Standards Gate

Use this skill as a reviewer and implementation-boundary gate for Plimeor's
code taste. The job is to decide whether a spec, diff, or implementation plan
matches the user's durable standards, then surface concrete changes before
polishing details.

This skill is more specific than `code-scope-gate`: `code-scope-gate` narrows
the requested work before or during planning; this skill applies Plimeor's
personal standards once there is a spec, diff, or concrete implementation shape
to judge.

## Core Review Order

Review in this order:

1. Public contract and committed product boundary.
2. Persisted state, schemas, generated directories, and long-lived files.
3. Ownership of validation and behavior between this code and underlying tools.
4. Abstractions, helpers, and duplication.
5. Internal implementation polish.

Do not start with style nits when the diff exposes unnecessary product surface,
state shape, schema contract, or tool-wrapper semantics.

## Durable Standards

### Delete disproportionate secondary modes

When a secondary mode adds schema, workspace, command, documentation, or test
surface that is not paying for itself now, remove the mode instead of carrying
it for completeness.

Treat "we may need this later" as a future note, not a reason to keep active
implementation.

### Do not expose future surfaces

Do not expose non-MVP or future-facing behavior in docs, state, command options,
schemas, or public APIs unless the user explicitly authorizes that boundary.

Specs should describe the committed boundary, not anticipated architecture.
Remove inactive modes, placeholder commands, generalized option names, and
state fields that only serve future expansion.

### Prefer tool-native contracts

Prefer the underlying tool's native behavior when that tool already validates or
defines the input contract. Avoid creating a wrapper-specific normalization or
validation layer unless it clearly improves the current workflow.

Example: if Git already accepts and validates repository arguments, prefer
passing clone-compatible arguments through and letting Git fail, rather than
inventing a second repository-URL contract.

### Keep persisted state minimal and portable

Persisted state is a long-lived contract. Keep it minimal, portable, and
non-duplicative.

Default stance:

- Do not store derived paths when they can be recomputed from the stable id.
- Do not duplicate configuration that already has a clearer source of truth
  elsewhere.
- Do not store tool-managed absolute paths that make state less portable.
- Add fields only when current behavior needs them and migration cost is
  justified.

### Tool-owned directories protect themselves

When a tool creates generated, cache, or internal working directories, that
tool-owned directory should protect itself from accidental commits. Do not make
callers remember ignore rules for managed internal state.

Prefer writing the appropriate `.gitignore` or equivalent guard inside the
managed directory at creation time.

### Avoid false schema helpers

Avoid generic helper schemas when fields may diverge semantically. Declare
validation near the field until shared semantics are stable and real.

Generic helpers are suspect when they only save a few characters but hide
field-specific validation needs.

Bad:

```ts
const NonEmptyText = schema.string().trim().min(1)

title: OptionalText
externalUrl: NonEmptyText
```

Good:

```ts
externalUrl: schema.string().trim().url()
```

### Do not overwrite parsed persisted values silently

Do not silently replace parsed persisted values inside transforms unless that is
the explicit migration contract. Silent replacement can mask invalid, old, or
future schema state.

If a persisted value is no longer acceptable, validate and fail clearly, or
write an explicit migration path.

### Validate all derived identities

When validating arrays of entries, check uniqueness for every derived path or
identity that can collide, not only the primary id.

If two entries have different ids but derive the same directory, slug, file
path, cache key, or external identity, the state is still invalid.

## Review Style

Prefer comments that name the boundary problem and the concrete deletion or
replacement.

Good review comments usually look like:

- "This mode adds command/schema/workspace surface without current value. Remove
  it from this phase."
- "This state field duplicates a value that can be derived from existing state.
  Drop the field unless current behavior needs independent persistence."
- "Let the underlying tool own this validation. Passing through its native input
  keeps our contract smaller."
- "This helper is a false abstraction. Inline the schema until the fields share
  stable semantics."

Avoid review comments that only say "simplify this" without naming the extra
contract, duplicated source of truth, or future surface being introduced.

## Output Contract

When explicitly invoked, write in the user's primary language. If the current
conversation language is clear, use that language.

Start with findings in review order. Keep summaries secondary. Do not cap the
number of findings; enumerate every concrete optimization item that follows
from the standards above, even when several findings are related.

Use these priorities:

- `P0`: The issue violates the committed boundary, corrupts or destabilizes
  persisted state, creates a public contract that should not exist, causes data
  loss, or blocks the feature from being accepted.
- `P1`: The issue adds meaningful complexity, duplicate sources of truth,
  brittle wrapper behavior, migration risk, or avoidable long-lived maintenance
  cost, but the feature can still function.
- `P2`: The issue is a local simplification, clarity improvement, smaller
  abstraction cleanup, or non-blocking consistency fix.

Before finalizing the list, check how findings interact. Some fixes change the
shape or importance of other findings. Name those dependencies instead of
treating every item as isolated.

```markdown
Findings:
- [P0/P1/P2] [Concrete boundary or standards issue]
  Evidence: [file, diff, spec section, or behavior]
  Why it matters: [state contract, public surface, tool contract, schema risk, or complexity]
  Change: [smallest concrete correction]
  Interactions: [Upstream/downstream effects on other findings, or "None"]

Open questions:
- [Only questions that materially change the decision]

Interaction map:
- [Finding A] affects [Finding B] because [specific dependency or consequence]

Summary:
- [Short overall judgment]
```

If there are no findings, say that directly and name the residual risk or test
gap, if any.

## Stop Rules

Stop when you have checked:

- Public contract and active product boundary do not expose future surfaces.
- Persisted state and schemas are minimal, strict, portable, and non-duplicative.
- Tool-native behavior is preserved unless wrapper behavior is justified.
- Generated or cache directories guard themselves from accidental commits.
- Helpers and abstractions remove real complexity now.
- Validation catches collisions for derived identities, not only primary ids.
