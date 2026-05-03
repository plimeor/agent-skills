---
name: code-standards-gate
description: >-
  Apply Plimeor's personal code review standards and implementation-boundary preferences. Use this skill for code reviews, reviewing specs before implementation, judging whether a proposed feature scope matches MVP standards, or checking whether code introduces unnecessary public surface, persisted state, abstractions, custom wrapper behavior, or future-facing options. Use after a spec or diff is available; for broad pre-spec scope control, use code-scope-gate first.
---

# Code Standards Gate

Use this skill after a spec, diff, or concrete implementation shape exists. The job is to review code through Plimeor's standards: question value first, delete unjustified surface, simplify what remains, and only then polish implementation details.

This skill is narrower than `code-scope-gate`: `code-scope-gate` controls broad scope before implementation; this skill reviews the actual contracts, types, state, wrappers, and abstractions that appeared in the spec or diff.

## Review Algorithm

Plan review batches before writing findings. Review one batch at a time, line by line, and finish high-risk files before lower-risk implementation files.

Batch order:

1. Public contract, spec, docs, CLI/API surface, and committed product boundary.
2. Types, schemas, persisted state, generated files, config/state readers and writers.
3. Wrapper behavior around external tools, libraries, runtimes, or protocols.
4. Modes, branches, feature flags, adapters, strategies, and secondary workflows.
5. Helpers, abstractions, duplication, and internal implementation polish.

For every new or changed type, field, option, branch, helper, generated artifact, wrapper rule, and persisted value, run this loop:

1. Question its value: why does it exist now?
2. Infer its intended use from the spec, call sites, tests, docs, and generated output.
3. Delete it if current value does not justify its contract, state, branch, or maintenance cost.
4. Simplify the remaining code after unnecessary surface is gone.

Do not start with style nits when the diff exposes unnecessary product surface, state shape, schema contract, or wrapper semantics.

## Surface Inventory

Use inventory to avoid missing review targets, not as a second findings list. Keep it compact.

- **Contract surface**: public inputs, outputs, docs promises, exported types, generated artifacts, user-visible workflows.
- **Type shape**: schemas, type aliases, unions, discriminants, object fields, inferred output shapes, generic helpers.
- **Persistence**: durable state, generated metadata, migration markers, local-only values, derived values, caches.
- **Parse and validation**: transforms, defaults, normalization, fallback behavior, validation-time mutation, migration behavior.
- **Branches**: optional modes, providers, strategies, feature flags, adapters, secondary workflows.
- **Wrappers**: code that intercepts, rewrites, aliases, pre-validates, or translates another tool's contract.
- **Ownership**: invariants that should be enforced by the component that owns them.
- **Identity**: source ids, derived ids, output names, routing keys, paths, cache keys, external refs.
- **Abstractions**: helpers, shared fragments, generic adapters, normalization utilities.

Every problematic inventory item should map to a finding unless it is explicitly accepted or outside the requested scope.

## Standards

### Review Types As Design Shape

Treat types, schemas, and persisted shape declarations as high-risk design evidence. A type often reveals the real architecture before the implementation does.

Review every field, union member, mode, discriminant, helper, inferred output, and transform line by line. A field becomes state or public shape; a union member becomes a branch; a helper becomes shared semantics; a transform becomes migration or repair behavior; an exported type becomes a contract other modules preserve.

If a type, schema, helper, or field changes the shape of the program and only exists for future flexibility, convenience, or premature reuse, write a finding that names it directly.

### Delete Disproportionate Modes And Future Surfaces

Remove modes, workflows, runtimes, command options, docs promises, state fields, tests, or generated artifacts that are not paying for themselves in the committed boundary.

The spec is reviewable. Do not preserve a surface merely because the spec lists it. If faithful implementation of the spec spreads a low-value mode or future-facing concept across docs, commands, schemas, state, tests, and workspace paths, challenge the boundary itself and recommend deleting or reauthorizing that surface.

When a low-value mode creates many branches, make the mode-removal finding first. Add separate field/path findings only when those edits remain relevant if the mode stays.

### Let Contract Owners Fail Naturally

Prefer the native behavior of the tool, library, protocol, or layer that owns an input contract. Let errors happen where they naturally belong.

A wrapper should not reject, rewrite, normalize, or reinterpret an input before the owner sees it unless the wrapper intentionally exposes a smaller current contract. If the wrapper stores or documents a broader generic concept than the owner or current workflow needs, treat that as a public contract problem.

### Keep Persisted State Minimal

Persisted state is a long-lived contract. Store only values that current behavior needs and that cannot be cheaply derived from a clearer source of truth.

For every persisted field, ask who writes it, who reads it, what breaks if it is removed, whether it is portable across machines and CI, whether it duplicates another source of truth, and whether it creates migration or merge-conflict cost.

Do not collapse unrelated presentation, policy, path, identity, local-machine, and future-hook fields into one broad finding when they require different edits.

### Apply Law Of Demeter To Invariants

Use Law of Demeter as a review frame: a component should not make callers, neighboring modules, or future reviewers know internal setup details in order to use it correctly.

Prefer local enforcement over social convention. Managed directories should create their own guard/config files; new coding patterns should come with lint, format, schema, test, or build checks when humans would otherwise have to remember them; internal state should stay behind the public contract.

### Avoid False Abstractions

Avoid generic helpers when fields may diverge semantically. Declare schemas, validation, and object shape near the field until shared semantics are stable and real.

Helpers are suspect when they only save a few characters, describe syntax/container shape instead of domain meaning, or require transforms to patch their output back into the desired shape. If root helpers spawn optional/array/object variants, review the variants too.

### Do Not Rewrite Persisted Values During Parse

Persisted state parsing should validate the stored contract, not silently repair it. Input normalization belongs at command/input boundaries unless an explicit migration contract says otherwise.

Treat parse-time identity normalization, missing-value defaults, version rewriting, collection sorting, invalid-data fallback, and field-copying as separate failure modes. If a transform only restates a value already guaranteed by validation, remove the transform.

### Validate Derived Identities

Check uniqueness for every derived identity that can collide, not only the primary id. Directories, routes, output names, cache keys, external refs, generated artifact names, and custom paths can collide even when source ids differ.

If a custom derived identity is unnecessary, remove it first. If it remains, validate uniqueness explicitly.

## Finding Discipline

Start with findings in review order and keep summaries secondary. Do not cap the number of findings when the requested output is a review.

Split findings at the level Plimeor would likely leave separate inline comments:

- one low-value mode removal can be one finding when deleting the mode is the edit
- one field removal is usually one finding per field or tightly coupled field pair
- one helper family can be one finding only when the same edit removes the whole family
- parse-time rewrites should split by failure mode when the edits differ
- collision checks should split by identity class when validation points differ

Each finding should name the concrete surface, evidence location, why it matters, smallest correction, and interactions with other findings.

Before finalizing, compare findings back to the inventory. Every problematic surface should be covered by a finding, accepted with a reason, or marked outside scope.

## Output Shape

When explicitly invoked, write in the user's primary language.

Use this order:

1. Findings.
2. Coverage notes for important inventory items not covered by findings.
3. Open questions that materially change the decision.
4. Interaction map for findings that affect each other.
5. Short overall judgment.

If there are no findings, say so directly and name any residual risk or test gap.

## Stop Rules

Stop when:

- high-risk files in scope were reviewed before lower-risk polish
- each review batch was read line by line before moving on
- types, schemas, and persisted shapes were reviewed as design shape
- every problematic inventory item maps to a finding or has a reason
- findings are split to likely inline-comment granularity
- open questions only remain when they materially change the decision
