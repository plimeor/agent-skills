---
name: code-standards-gate
description: >-
  Review a concrete spec, diff, or implementation shape against Plimeor's code
  standards. Use when judging public API/CLI contracts, persisted state,
  schemas/types, generated output, wrapper behavior, helper abstractions,
  future-facing options, or test coverage before merge. Do not use for broad
  pre-spec scope shaping; use code-scope-gate for that.
---

# Code Standards Gate

## Goal

Produce a high-recall code review against Plimeor's standards after a spec, diff,
or concrete implementation shape exists.

Success means the review catches unjustified public surface, persisted state,
schema/type shape, wrapper behavior, generated-output contracts, false
abstractions, and missing validation before implementation polish.

## Success Criteria

A review is complete when:

- findings are ordered by severity and review order, with no artificial cap
- every high-risk contract surface has a finding, an acceptance note, or an
  outside-scope note
- type, schema, and persisted-state symbols are reviewed as design shape, not
  only implementation
- atomic findings are preserved through synthesis
- distinct edits are not merged into theme summaries
- the final answer includes findings, inventory, coverage notes, open questions,
  interaction map, overall judgment, and calibration note

## Constraints

Use this skill after a concrete spec/diff exists. Use `code-scope-gate` for broad
pre-spec scope control.

Do not present a single inline pass as equivalent to an independent multi-batch
review when the review scope requires batch isolation.

Do not start with style nits when the diff exposes unnecessary product surface,
state shape, schema contract, or wrapper semantics.

## Evidence Budget

Start with the provided spec, diff, and directly changed files. Read nearby files
only when they determine ownership, read/write paths, generated output,
command/API behavior, or test coverage.

Continue retrieval only when:

- a finding would otherwise depend on an unsupported assumption
- the owner of a contract, persisted field, wrapper, or generated artifact is
  unclear
- tests, docs, or call sites materially change whether a surface is justified
- the user asked for exhaustive review or a named artifact must be inspected

Stop retrieving when the core review judgment is supported and further lookup
would only improve phrasing or collect nonessential examples.

## Review Strategy

Plan batches before writing findings. Group files by related behavior first,
then order those groups by risk. Do not split one contract across unrelated
batches just because files are large.

Default associated groups:

1. Package and distribution contract.
2. User command/API contract.
3. Shape and state.
4. External owner and wrappers.
5. Generated behavior.
6. Tests and validation.
7. Implementation helpers and polish.

Put public contract, persisted shape, generated contracts, and wrapper
boundaries before internal implementation polish. Split package distribution
from command behavior when both create public promises.

For large, high-risk, or explicitly exhaustive reviews, assign each coherent
batch to an independent subagent or isolated child session when available. Use
`sub-agent.md` as the batch reviewer guide when present. If independent review is
unavailable, say the review is degraded.

Create a dedicated tests and validation batch when tests are large, lock public
behavior, or are themselves part of the contract. For small nearby tests, keep
them with the behavior they protect but still review them as contract evidence.

## Surface Inventory

Use inventory to avoid missing review targets, not as a second findings list.
Keep a working inventory while reviewing; make the final inventory a compact
coverage map a human can scan quickly.

Track:

- **Contract surface**: public inputs, outputs, docs promises, exported types,
  generated artifacts, user-visible workflows.
- **Type shape**: schemas, type aliases, unions, discriminants, object fields,
  inferred outputs, generic helpers.
- **Persistence**: durable state, generated metadata, migration markers,
  local-only values, derived values, caches.
- **Parse and validation**: transforms, defaults, normalization, fallback
  behavior, validation-time mutation, migration behavior.
- **Branches**: optional modes, providers, strategies, feature flags, adapters,
  secondary workflows.
- **Wrappers**: code that intercepts, rewrites, aliases, pre-validates, or
  translates another tool's contract.
- **Ownership**: invariants that should be enforced by the component that owns
  them.
- **Identity**: source ids, derived ids, output names, routing keys, paths, cache
  keys, external refs.
- **Abstractions**: helpers, shared fragments, generic adapters, normalization
  utilities.

For type, schema, and persisted-state batches, first make a symbol inventory from
the code itself. Include exported schemas, helper schemas,
optional/fallback/default variants, object schema fragments, transforms, inferred
public types, persisted fields, generated metadata fields, and derived identity
fields.

If a symbol, field, transform, helper, or generated property appears in the
working inventory, it should appear by name in a finding, acceptance note, or
outside-scope note.

## Standards

Use these standards as review lenses. Apply the lenses that match the changed
surface; do not force every section onto every diff.

### Review Types As Design Shape

Treat types, schemas, and persisted shape declarations as high-risk design
evidence. A field becomes state or public shape; a union member becomes a branch;
a helper becomes shared semantics; a transform becomes migration or repair
behavior; an exported type becomes a contract other modules preserve.

If a type, schema, helper, or field changes the shape of the program and only
exists for future flexibility, convenience, or premature reuse, write a finding
that names it directly.

### Delete Future Surfaces

Remove modes, workflows, runtimes, command options, docs promises, state fields,
tests, or generated artifacts that are not paying for themselves in the committed
boundary.

The spec is reviewable. If faithful implementation spreads a low-value mode or
future-facing concept across docs, commands, schemas, state, tests, and paths,
challenge the boundary itself and recommend deleting or reauthorizing it.

### Let Contract Owners Fail Naturally

Prefer the native behavior of the tool, library, protocol, or layer that owns an
input contract. A wrapper should not reject, rewrite, normalize, or reinterpret an
input before the owner sees it unless the wrapper intentionally exposes a smaller
current contract.

### Keep Persisted State Minimal

Persisted state is a long-lived contract. Store only values that current behavior
needs and that cannot be cheaply derived from a clearer source of truth.

For every persisted field, ask who writes it, who reads it, what breaks if it is
removed, whether it is portable across machines and CI, whether it duplicates
another source of truth, and whether it creates migration or merge-conflict cost.

Do not collapse unrelated presentation, policy, path, identity, local-machine,
and future-hook fields into one broad finding when they require different edits.

### Apply Law Of Demeter To Invariants

Use Law of Demeter as a review frame: a component should not make callers,
neighboring modules, or future reviewers know internal setup details in order to
use it correctly.

Prefer local enforcement over social convention when humans would otherwise have
to remember invariants.

### Avoid False Abstractions

Avoid generic helpers when fields may diverge semantically. Declare schemas,
validation, and object shape near the field until shared semantics are stable and
real.

Helpers are suspect when they only save a few characters, describe syntax instead
of domain meaning, or require transforms to patch their output back into the
desired shape.

### Do Not Rewrite Persisted Values During Parse

Persisted state parsing should validate the stored contract, not silently repair
it. Input normalization belongs at command/input boundaries unless an explicit
migration contract says otherwise.

Treat parse-time identity normalization, missing-value defaults, version
rewriting, collection sorting, invalid-data fallback, and field-copying as
separate failure modes.

### Validate Derived Identities

Check uniqueness for every derived identity that can collide, not only the
primary id. Directories, routes, output names, cache keys, external refs,
generated artifact names, and custom paths can collide even when source ids
differ.

If a custom derived identity is unnecessary, remove it first. If it remains,
validate uniqueness explicitly.

## Finding Discipline

Start with findings in review order and keep summaries secondary. Do not cap the
number of findings when the requested output is a review.

Preserve atomic findings. A finding is atomic when a reviewer can point to one
surface or tightly coupled surface pair and make one concrete code decision.

Split findings at the level Plimeor would likely leave separate inline comments:

- one field removal is usually one finding per field or tightly coupled field
  pair
- parse-time rewrites should split by failure mode when edits differ
- collision checks should split by identity class when validation points differ
- test gaps should split by behavior not protected
- persisted fields should split when owners, readers, write paths, portability
  risks, or validation points differ

When synthesizing batch outputs, keep each batch finding unless it is a duplicate,
outside scope, or clearly invalid. Merge only exact duplicates or findings whose
smallest correction is the same edit. Record dropped or merged findings with a
short reason.

Each finding should name the concrete surface, evidence location, why it matters,
smallest correction, and interactions with other findings.

## Output Shape

When explicitly invoked, write in the user's primary language.

Use this order:

1. Findings.
2. Inventory.
3. Coverage notes for important inventory items not covered by findings.
4. Open questions that materially change the decision.
5. Interaction map for findings that affect each other.
6. Short overall judgment.
7. Calibration note.

The final `Inventory` section is part of the deliverable, but it is not the full
working checklist. Format it as a compact batch-by-batch coverage map:

```text
- B3 schema/state: `ProjectIdSchema` F2; `ProjectsDocumentSchema` F6; `strictObject` usage Accepted.
- B6 tests: persisted bad-state tests missing, freshness invalidation tests missing. Not separate findings because they belong to F2/F10 acceptance.
```

Coverage notes should summarize raw batch count, final count, merge/drop reasons,
and validation level. They should not repeat findings or expand the inventory.

The calibration note should state that this skill is a review amplifier, not a
replacement for human judgment:

- Usually strong enough for broad contract risk, persisted-state bloat,
  wrapper/source-of-truth problems, generated-output contracts,
  freshness/cleanup issues, and missing tests.
- Not reliable enough to replace a capable reviewer on line-by-line value
  judgment, delete-vs-keep taste, type/schema shape judgment, false
  abstractions, and final product-boundary calibration.

If there are no findings, say so directly and name residual risk or test gaps.

## Stop Rules

Before finalizing, check:

- each requested artifact or batch is covered, blocked, or marked outside scope
- every finding has concrete surface, evidence location, impact, smallest
  correction, and interaction when relevant
- inventory items with risk map to `F#`, `Accepted`, or `Outside scope`
- any dropped or merged batch finding has a reason
- factual claims are grounded in inspected files, diff, tests, docs, or labeled
  inference
- validation level is stated: read-only review, static check, test run, smoke
  run, or not run
