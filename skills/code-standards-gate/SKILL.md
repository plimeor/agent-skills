---
name: code-standards-gate
description: >-
  Review a concrete spec, diff, or implementation shape against strict code standards. Use when judging public API/CLI contracts, persisted state, schemas/types, generated output, wrapper behavior, helper abstractions, future-facing options, or test coverage before merge. Do not use for broad pre-spec scope shaping; use code-scope-gate for that.
---

# Code Standards Gate

## Goal

Produce a high-recall code review against strict standards after a spec, diff, or concrete implementation shape exists.

Success means the review catches unjustified public surface, persisted state, schema/type shape, wrapper behavior, generated-output contracts, false abstractions, and missing validation before implementation polish.

## Success Criteria

A review is complete when:

- findings use `P1`, `P2`, or `P3`, ordered by priority and review order, with no artificial cap
- every high-risk contract surface has a finding, an acceptance note, or an outside-scope note
- type, schema, and persisted-state symbols are reviewed as design shape, not only implementation
- atomic findings are preserved through synthesis
- distinct edits are not merged into theme summaries
- the final answer includes findings, coverage notes, open questions when they materially affect the decision, and a short overall judgment

## Constraints

Use this skill after a concrete spec/diff exists. Use `code-scope-gate` for broad pre-spec scope control.

Do not present a shallow inline pass as exhaustive review. Large or multi-surface diffs require explicit batch planning, batch-by-batch review, and coverage notes.

Do not start with style nits when the diff exposes unnecessary product surface, state shape, schema contract, or wrapper semantics.

## Evidence Budget

Review is exhaustive within the requested scope by default. Treat named artifacts, changed files, directly related owners, contract call sites, and relevant tests as part of the scope that must be covered or explicitly marked blocked/outside scope.

Start with the provided spec, diff, and directly changed files. Read nearby files only when they determine ownership, read/write paths, generated output, command/API behavior, or test coverage.

Continue retrieval only when:

- a requested artifact, changed file, planned batch, or named surface remains uncovered
- a finding would otherwise depend on an unsupported assumption
- the owner of a contract, persisted field, wrapper, or generated artifact is unclear
- tests, docs, or call sites materially change whether a surface is justified

Stop retrieving only when every requested artifact, changed file, planned batch, and named surface is covered, blocked, or outside scope, and further lookup would only improve phrasing or collect nonessential examples.

## Review Strategy

Plan batches before writing findings. Group files by related behavior first, then order those groups by risk. Do not split one contract across unrelated batches just because files are large.

Batching is mandatory for large diffs, multi-package changes, public contract changes, persisted-state changes, generated output changes, or any review that spans more than one coherent surface. A batch is a coherent review unit with its own working inventory, inspected evidence, candidate findings, and coverage result.

Default associated groups:

1. Package and distribution contract.
2. User command/API contract.
3. Shape and state.
4. External owner and wrappers.
5. Generated behavior.
6. Tests and validation.
7. Implementation helpers and polish.

Put public contract, persisted shape, generated contracts, and wrapper boundaries before internal implementation polish. Split package distribution from command behavior when both create public promises.

Review coherent batches sequentially in the current session. Finish the planned batches before final synthesis unless the review is blocked by missing context or context budget. Preserve each batch's candidate findings through synthesis and record batch coverage in coverage notes.

The review may stop early only when the requested scope is fully covered, the remaining batches are outside scope, or a concrete blocker prevents responsible coverage. A severe finding in an early batch does not replace review of later batches.

A batch with many or severe findings does not stop the review. Continue through all planned in-scope batches before final synthesis unless a concrete blocker makes further review impossible. If context budget prevents full coverage, report the completed batches and unreviewed batches explicitly; the review is partial, not complete.

Create a dedicated tests and validation batch when tests are large, lock public behavior, or are themselves part of the contract. For small nearby tests, keep them with the behavior they protect but still review them as contract evidence.

## Working Surface Inventory

Use inventory internally to avoid missing review targets. The final review output contains findings and coverage notes, while the working inventory stays compact and temporary.

Track:

- **Contract surface**: public inputs, outputs, docs promises, exported types, generated artifacts, capability-bearing props, user-visible workflows.
- **Type shape**: schemas, type aliases, unions, discriminants, object fields, component props, callbacks, inferred outputs, generic helpers.
- **Persistence**: durable state, generated metadata, migration markers, local-only values, derived values, caches.
- **Parse and validation**: transforms, defaults, normalization, fallback behavior, validation-time mutation, migration behavior.
- **Branches**: optional modes, providers, strategies, feature flags, adapters, secondary workflows.
- **Wrappers**: code that intercepts, rewrites, aliases, pre-validates, or translates another tool's contract.
- **Ownership**: invariants that should be enforced by the component that owns them.
- **Identity**: source ids, derived ids, output names, routing keys, paths, cache keys, external refs.
- **Abstractions**: helpers, shared fragments, generic adapters, normalization utilities.

For type, schema, and persisted-state batches, first make a symbol inventory from the code itself. Include exported schemas, helper schemas, optional/fallback/default variants, object schema fragments, transforms, inferred public types, persisted fields, generated metadata fields, and derived identity fields.

If a symbol, field, transform, helper, or generated property appears in the working inventory, it should appear by name in a finding, acceptance note, or coverage note.

## Standards

Use these standards as review lenses. Apply the lenses that match the changed surface; do not force every section onto every diff.

### Review Type Changes As Capability Boundaries

Any type change changes a module's shape. Treat types, schemas, persisted shape declarations, component props, callbacks, helper types, and exported types as high-risk design evidence. A field becomes state or public shape; a union member becomes a branch; a callback becomes a capability promise; a helper becomes shared semantics; a transform becomes migration or repair behavior; an exported type becomes a contract other modules preserve.

If a type, schema, helper, or field changes the shape of the program and only exists for future flexibility, convenience, or premature reuse, write a finding that names it directly.

Review added or expanded fields, props, options, callbacks, discriminants, state variants, and helper types as capability commitments, especially when they belong to shared components, generic wrappers, public APIs, or reusable hooks.

For each capability-bearing type change, ask:

- What new capability does this surface promise to callers?
- Is it presentation configuration, or does it carry business lifecycle, orchestration, side effects, or state-machine behavior?
- Does the owner need domain knowledge to render transient UI, choose next actions, or coordinate status transitions correctly?
- Does one field, option, or callback name carry several business verbs?
- Does the responsibility belong in the generic module, or in a domain owner, controller, hook, or business-specific wrapper?

Callback types are high-risk capability boundaries because they expose actions, not just data. A callback on a shared component should usually represent a presentation event. When it starts carrying domain lifecycle, side effects, or state-machine orchestration, review the enclosing owner as a boundary problem.

If a generic module starts owning domain lifecycle or business state-machine behavior through type shape, write a finding. The smallest correction is usually to move orchestration into the domain owner and keep the generic module as a smaller primitive.

### Delete Future Surfaces

Remove modes, workflows, runtimes, command options, docs promises, state fields, tests, or generated artifacts that are not paying for themselves in the committed boundary.

The spec is reviewable. If faithful implementation spreads a low-value mode or future-facing concept across docs, commands, schemas, state, tests, and paths, challenge the boundary itself and recommend deleting or reauthorizing it.

### Challenge Unjustified Complexity

Review AI-assisted code, or code that shows AI-like failure modes, by observable symptoms rather than by provenance. Finding eligibility comes from concrete complexity, contract, compatibility, or validation risk in the diff.

Use three taste questions as the first pass over suspicious surfaces:

- Is this a real problem, or an imagined one?
- Is there a simpler way?
- What can this break for existing users or callers?

Treat a surface as suspect when it adds abstraction, configuration, state, fallback behavior, adapters, generalized helpers, or new workflows for an unproven future case. Ask what current user behavior, present contract, or observed failure pays for the new surface. If the answer is only flexibility, completeness, symmetry, or future reuse, write a deletion or reauthorization finding.

Overdesign is itself a code-quality defect. Material overdesign belongs in findings even before a demonstrable user behavior regression exists. If the diff increases cognitive load, branch count, public surface, state shape, owner coupling, or maintenance cost without current need, write a finding. Use `P2` by default for material overdesign, `P1` when it also breaks an existing contract or persisted/user workflow, and `P3` only when the excess is small and local.

Prefer reshaping the control flow, data model, or ownership boundary so special cases disappear into the normal path. Challenge fixes that add branches, sentinel states, nullable fields, catch-all fallbacks, or layered validators when a smaller representation would remove the edge case.

Flag plausible-looking code that does not fit the local codebase: calls to nonexistent or wrong-owner helpers, new patterns that bypass existing utilities, generic adapters that obscure a simple local operation, and tests that mirror the implementation without protecting the user-facing contract.

Check for code-volume debt: duplicated blocks, near-copy variants, broad find-and-replace edits, helper layers that save little, and patches that mostly add instead of deleting, moving, or simplifying existing code. The smallest correction may be to delete the new path, use the existing owner, or fold the case into an existing function rather than adding another abstraction.

Do not accept a theoretically cleaner fix that breaks existing user workflow, CLI/API behavior, persisted data, generated output, import paths, or documented contracts. A change that is correct only after users update their behavior is a compatibility finding unless the migration is explicit and authorized.

### Let Contract Owners Fail Naturally

Prefer the native behavior of the tool, library, protocol, or layer that owns an input contract. A wrapper should not reject, rewrite, normalize, or reinterpret an input before the owner sees it unless the wrapper intentionally exposes a smaller current contract.

### Keep Persisted State Minimal

Persisted state is a long-lived contract. Store only values that current behavior needs and that cannot be cheaply derived from a clearer source of truth.

For every persisted field, ask who writes it, who reads it, what breaks if it is removed, whether it is portable across machines and CI, whether it duplicates another source of truth, and whether it creates migration or merge-conflict cost.

Do not collapse unrelated presentation, policy, path, identity, local-machine, and future-hook fields into one broad finding when they require different edits.

### Apply Law Of Demeter To Invariants

Use Law of Demeter as a review frame: a component should not make callers, neighboring modules, or future reviewers know internal setup details in order to use it correctly.

Prefer local enforcement over social convention when humans would otherwise have to remember invariants.

### Avoid False Abstractions

Avoid generic helpers when fields may diverge semantically. Declare schemas, validation, and object shape near the field until shared semantics are stable and real.

Helpers are suspect when they only save a few characters, describe syntax instead of domain meaning, or require transforms to patch their output back into the desired shape.

### Do Not Rewrite Persisted Values During Parse

Persisted state parsing should validate the stored contract, not silently repair it. Input normalization belongs at command/input boundaries unless an explicit migration contract says otherwise.

Treat parse-time identity normalization, missing-value defaults, version rewriting, collection sorting, invalid-data fallback, and field-copying as separate failure modes.

### Validate Derived Identities

Check uniqueness for every derived identity that can collide, not only the primary id. Directories, routes, output names, cache keys, external refs, generated artifact names, and custom paths can collide even when source ids differ.

If a custom derived identity is unnecessary, remove it first. If it remains, validate uniqueness explicitly.

## Finding Discipline

Start with findings in review order and keep summaries secondary. Do not cap the number of findings when the requested output is a review.

Assign one of three priorities:

- `P1`: likely correctness, data, security, compatibility, or user-visible workflow breakage; merge should stop.
- `P2`: material maintainability, architecture, contract, state, abstraction, or test-quality defect; includes overdesign that lowers code quality even before a user-visible regression exists.
- `P3`: small local cleanup, clarity, or polish issue that is worth fixing but does not change the core decision.

Preserve atomic findings. A finding is atomic when a reviewer can point to one surface or tightly coupled surface pair and make one concrete code decision.

Split findings at the level a careful human reviewer would leave separate inline comments:

- one field removal is usually one finding per field or tightly coupled field pair
- parse-time rewrites should split by failure mode when edits differ
- collision checks should split by identity class when validation points differ
- test gaps should split by behavior not protected
- persisted fields should split when owners, readers, write paths, portability risks, or validation points differ

When synthesizing batch outputs, keep each batch finding unless it is a duplicate, outside scope, or clearly invalid. Merge only exact duplicates or findings whose smallest correction is the same edit. Record dropped or merged findings with a short reason.

When a finding flags a misleading wrapper, helper, field, prop, or callback name, inspect the enclosing owner one level up. The finding should target the misplaced responsibility when the naming issue is a symptom of business lifecycle, state-machine behavior, or domain orchestration entering a shared module or public contract.

After the main agent synthesizes candidate findings, double-check each one before showing it to the user. Re-open the evidence location and ask whether the finding is actually supported by inspected code, diff, docs, tests, or an explicitly labeled inference. Keep the finding only if the problem still holds after this check. Drop, merge, or lower the priority of findings that depend on stale assumptions, missing context, duplicated corrections, or speculative impact, and record the reason in coverage notes.

Each finding should name priority, concrete surface, evidence location, why it matters, and smallest correction.

## Output Shape

When explicitly invoked, write in the user's primary language.

Use this order:

1. Findings.
2. Coverage notes.
3. Open questions that materially change the decision.
4. Short overall judgment.

Findings must start with a `P1`, `P2`, or `P3` label. Material overdesign that lowers code quality is a finding, not summary prose, naming feedback, or an abstract preference note.

Coverage notes are brief review metadata, not repeated findings or an inventory map. Include:

- planned batches
- completed batches
- blocked or outside-scope batches
- raw candidate finding count and final finding count
- merge/drop reasons
- validation level

If there are no findings, say so directly and name residual risk or test gaps.

## Stop Rules

Before finalizing, check:

- each requested artifact or batch is covered, blocked, or marked outside scope
- all planned in-scope batches are reviewed before final synthesis, or any unreviewed batch is explicitly reported as blocked
- every finding has concrete surface, evidence location, impact, smallest correction, and priority
- every synthesized finding has been double-checked against its cited evidence and is still a real problem
- material overdesign that lowers code quality appears as a finding
- any dropped or merged batch finding has a reason
- factual claims are grounded in inspected files, diff, tests, docs, or labeled inference
- validation level is stated: read-only review, static check, test run, smoke run, or not run
