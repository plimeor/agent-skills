---
name: code-standards-gate
description: >-
  Apply Plimeor's personal code review standards and implementation-boundary preferences. Use this skill for code reviews, reviewing specs before implementation, judging whether a proposed feature scope matches MVP standards, or checking whether code introduces unnecessary public surface, persisted state, abstractions, custom wrapper behavior, or future-facing options. Use after a spec or diff is available; for broad pre-spec scope control, use code-scope-gate first.
---

# Code Standards Gate

Use this skill after a spec, diff, or concrete implementation shape exists. The job is to review code through Plimeor's standards: question value first, delete unjustified surface, simplify what remains, and only then polish implementation details.

This skill is narrower than `code-scope-gate`: `code-scope-gate` controls broad scope before implementation; this skill reviews the actual contracts, types, state, wrappers, and abstractions that appeared in the spec or diff.

## Review Algorithm

Plan review batches before writing findings. Group files by related behavior first, then order those groups by risk. Do not split one contract across unrelated batches just because files are large.

Use separate batches when the diff is large, crosses several contract surfaces, or includes high-risk declarations such as public API, CLI, schemas, persisted state, generated output, wrappers, or tests that lock a contract. A useful batch has one coherent question: "what contract or behavior is this group creating?"

Create batches by association first, then sort by risk:

1. Keep files that create or preserve the same behavior in the same batch.
2. Keep tests with the behavior they lock unless the test surface is large enough to require its own batch.
3. Put public contract, persisted shape, generated contracts, and wrapper boundaries before internal implementation polish.
4. Split a large type/schema/state batch before splitting low-risk implementation files.

Default associated groups:

1. Package and distribution contract: publish/install promises, package metadata, executable entrypoints, dependency ranges, files whitelist, exports, prepack/smoke checks, and packed artifact shape.
2. User command/API contract: spec, docs, CLI/API surface, command options, command output, and committed product boundary.
3. Shape and state: types, schemas, persisted state, generated metadata, config/state readers and writers.
4. External owner: wrapper behavior around tools, libraries, runtimes, protocols, package managers, filesystems, or network boundaries.
5. Generated behavior: generated files, indexes, frontmatter, cleanup, scan outputs, cache outputs, and reader contracts.
6. Tests and validation: tests that lock public behavior, persisted state, generated output, wrapper semantics, or helper APIs.
7. Implementation: helpers, abstractions, duplication, internal orchestration, and polish.

Split public contract batches when one review would mix package distribution with command behavior. Installability, published files, executable entrypoints, dependency resolution, and export surface deserve their own batch when the diff creates or changes a publishable package. CLI/docs/spec behavior can then be reviewed separately.

Create a dedicated tests and validation batch whenever the diff includes tests, fixtures, mocks, test helpers, or changes behavior that tests lock. Do not replace this batch with implementation, wrapper, or generated-output review. The tests batch reviews test files line by line as contract evidence, while other batches may still read nearby tests for verification.

For multi-batch reviews, the main reviewer must delegate each batch to an independent subagent and then synthesize the results. The number of subagents must equal the number of batches. Use `sub-agent.md` in this skill directory as the batch reviewer guide when it is available. If native subagents are unavailable but shell execution is available, launch isolated child review sessions instead. Do not perform a multi-batch review inline and call it equivalent.

Each batch reviewer reads its batch line by line and produces its own findings, coverage notes, and judgment. The main reviewer only plans batches, launches batch reviewers, waits for all results, deduplicates findings, checks inventory coverage across batch outputs, and writes the final review.

Deduplication means removing the same issue reported by multiple batches. It does not mean merging distinct repair actions into theme-level summaries. If two reported issues would require different edits, keep them as separate final findings even when they share the same standard or root cause.

For every new or changed type, field, option, branch, helper, generated artifact, wrapper rule, and persisted value, run this loop before judging implementation quality:

1. Name the concrete surface.
2. Question its current value: what user behavior or present contract needs it now?
3. Infer its intended use from the spec, call sites, tests, docs, generated output, and write/read paths.
4. Delete it if current value does not justify its contract, state, branch, or maintenance cost.
5. Simplify the remaining code after unnecessary surface is gone.

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

For type, schema, and persisted-state batches, first make a symbol inventory from the code itself. Include exported schemas, helper schemas, optional/fallback/default variants, object schema fragments, transforms, inferred public types, persisted fields, generated metadata fields, and derived identity fields. Review each named symbol as design shape, not only as implementation.

Do not rely on a general impression that a file is too broad or too clever. If a symbol, field, transform, helper, or generated property appears in the inventory, it must either appear by name in a finding, appear by name in an acceptance note, or be marked outside scope.

## Standards

### Review Types As Design Shape

Treat types, schemas, and persisted shape declarations as high-risk design evidence. A type often reveals the real architecture before the implementation does.

Review every field, union member, mode, discriminant, helper, inferred output, and transform line by line. A field becomes state or public shape; a union member becomes a branch; a helper becomes shared semantics; a transform becomes migration or repair behavior; an exported type becomes a contract other modules preserve.

If a type, schema, helper, or field changes the shape of the program and only exists for future flexibility, convenience, or premature reuse, write a finding that names it directly.

### Delete Future Surfaces

Remove modes, workflows, runtimes, command options, docs promises, state fields, tests, or generated artifacts that are not paying for themselves in the committed boundary.

The spec is reviewable. Do not preserve a surface merely because the spec lists it. If faithful implementation of the spec spreads a low-value mode or future-facing concept across docs, commands, schemas, state, tests, and workspace paths, challenge the boundary itself and recommend deleting or reauthorizing that surface.

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

The final review should preserve the batch reviewers' atomic findings. Prefer a longer findings list over a short thematic list when the short list hides separate edits. A finding is atomic when a reviewer can point to one surface or tightly coupled surface pair and make one concrete code decision.

Split findings at the level Plimeor would likely leave separate inline comments:

- one low-value mode removal can be one finding when deleting the mode is the edit
- one field removal is usually one finding per field or tightly coupled field pair
- one helper family can be one finding only when the same edit removes the whole family
- parse-time rewrites should split by failure mode when the edits differ
- collision checks should split by identity class when validation points differ
- test gaps should split by the behavior that is not protected; do not combine unrelated command failures, persisted-state failures, generated-output failures, wrapper failures, and parser-binding failures into one missing-test finding
- persisted fields should split when they have different owners, readers, write paths, portability risks, or validation points; do not combine fields merely because they are all "state"

A tightly coupled field pair means the same code edit removes or validates both fields together, the same owner reads them, and the finding names both fields. If one field controls a clone/cache path, another controls generated output, another controls presentation, and another stores a local machine value, they are separate findings.

When synthesizing batch outputs:

- keep each batch finding unless it is a duplicate, outside scope, or clearly invalid
- merge only exact duplicates or findings whose smallest correction is the same edit
- record any dropped or merged batch finding with a short reason
- report raw batch finding count and final finding count
- treat a large count drop as a review failure unless it is explained by duplicates or invalid findings

Each finding should name the concrete surface, evidence location, why it matters, smallest correction, and interactions with other findings.

Before finalizing, compare findings back to the inventory. Every problematic surface should be covered by a finding, accepted with a reason, or marked outside scope.

Preserve output granularity:

- Do not let a root helper finding automatically cover optional, array, fallback, or object-fragment variants unless the same edit removes the whole family and the finding names the variants.
- Do not let a broad persisted-state finding cover unrelated presentation fields, policy fields, path fields, identity fields, local-machine fields, migration markers, or future hooks.
- Do not let a broad parse-rewrite finding cover distinct transforms such as identity normalization, defaults, version rewrites, sorting, invalid-data fallback, and field copying.
- Do not let a wrapper finding cover unrelated choices such as input rewriting, pre-validation, aliasing, ref resolution, output naming, and persistence.

If a named item from the inventory disappears during summarization, the review is not finished.

## Output Shape

When explicitly invoked, write in the user's primary language.

Use this order:

1. Findings.
2. Coverage notes for important inventory items not covered by findings.
3. Open questions that materially change the decision.
4. Interaction map for findings that affect each other.
5. Short overall judgment.
6. Calibration note.

The calibration note should state that this skill is a review amplifier, not a
replacement for human judgment. It should separate the handoff clearly:

- The skill is usually good enough to cover broad contract risk, persisted-state
  bloat, wrapper/source-of-truth problems, generated-output contracts,
  freshness/cleanup issues, and missing tests. A human can usually scan these
  areas after reading the findings instead of re-reviewing them from scratch.
- The skill is not reliable enough to replace a capable reviewer on
  line-by-line value judgment, delete-vs-keep taste, type/schema shape judgment,
  false abstractions, and final product-boundary calibration. A teammate should
  inspect the inventories, accepted/skipped items, and especially type/schema
  surfaces before treating the review as complete.

If there are no findings, say so directly and name any residual risk or test gap.

## Stop Rules

Stop when:

- multi-batch reviews used one independent subagent or isolated child session per batch
- test files in scope received their own tests and validation batch
- high-risk files in scope were reviewed before lower-risk polish
- each review batch was read line by line before moving on
- types, schemas, and persisted shapes were reviewed as design shape
- every problematic inventory item maps to a finding or has a reason
- findings are split to likely inline-comment granularity
- open questions only remain when they materially change the decision
