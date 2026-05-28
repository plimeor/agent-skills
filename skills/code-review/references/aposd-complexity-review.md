# APOSD Complexity Review Reference

Use this reference with `subagents/design-shape.md` when a review needs APOSD-style design judgment. This is a review lens, not a general book summary.

## Source Basis

Distilled from John Ousterhout's APOSD/CS190 material. Anchors:

- Official APOSD page: https://web.stanford.edu/~ouster/cgi-bin/aposd.php
- APOSD vs Clean Code: https://github.com/johnousterhout/aposd-vs-clean-code

## Core Review Model

APOSD review starts with apparent complexity: what a future reader or maintainer experiences while doing a real task. The author's confidence is not enough. A finding should name the reader task and explain why the reviewed shape makes that task harder.

Complexity symptoms:

- Change amplification: one conceptual change requires edits in many places.
- Cognitive load: the maintainer must hold too much non-local knowledge in mind.
- Unknown-unknown risk: important required information is not discoverable, or the maintainer cannot know it is needed.

Complexity causes:

- Dependency: one surface cannot be understood or modified independently.
- Obscurity: important behavior, ownership, invariant, reason, or coupling is not obvious.

Review rule: every APOSD-style finding must connect a concrete surface to at least one symptom and one cause. Style preferences, naming opinions, "cleaner" advice, and generic simplification do not qualify without that mapping.

## What Readers Commonly Take Away

### Complexity Is Incremental

Bad design usually accumulates through small tolerated shortcuts: one branch, one fallback, one duplicate rule, one nullable state, one wrapper, one undocumented invariant. A design-shape review should ask whether the change adds another small dependency or obscurity that future maintainers will normalize.

Review probes:

- Does this add a special case, mode, flag, sentinel, fallback, or cleanup step without reducing the underlying complexity?
- Is the change optimized for this patch while increasing future change cost?
- Is complexity being moved to another layer where callers still need to understand it?

### Working Code Is Not Enough

Tests passing and behavior working are necessary evidence, not design evidence. A change can be correct and still create a maintainability defect.

Review probes:

- After the change, would the touched area have the structure we would choose if this requirement had been known from the beginning?
- Does the plan make continual small design investment, or does it defer obvious cleanup into a vague future?
- Is the smallest correction a plan change, owner change, representation change, or interface change rather than more local patching?

### Deep Modules Are About Ratio, Not Size

A deep module has a small caller-facing interface relative to the useful behavior and hidden knowledge it provides. A large module is not automatically deep; a short function is not automatically shallow.

Review probes:

- Does the interface buy callers meaningful capability, or is it shallow ceremony?
- Must callers understand implementation state, ordering, retry behavior, cache semantics, validation timing, storage format, or fallback rules?
- Does the module hide design decisions that are likely to change?
- Does the review target split by durable abstraction, or merely by execution phase?

### Make Common Usage Simple

Interfaces should make the common case easy and obvious. Rare cases should not dominate the normal caller path.

Review probes:

- Does a common caller need to pass options, know internal defaults, or handle rare states?
- Are rare cases represented without obscuring the normal path?
- Is a "flexible" interface making all callers pay for flexibility only one caller needs?

### General-Purpose, Not Speculative

The useful version is general enough for known nearby needs, while avoiding special-purpose leakage into reusable code. Not "build a platform".

Review probes:

- Is reusable logic contaminated by product-specific, user-specific, or one-off policy?
- Is the new abstraction justified by current repeated pressure, or by imagined future extension?
- Would separating general mechanism from special policy reduce caller knowledge?

### Information Leakage Is A Primary Red Flag

Information leakage happens when knowledge that should belong to one owner affects another surface. It often appears through duplicated rules, mirrored validation, exposed data structures, ordering assumptions, generated artifact coupling, error semantics, or comments that describe another module's internals.

Review probes:

- Which design decision is leaking?
- Where should that decision live?
- How many places must change if the decision changes?
- What would tell a maintainer that this other file, mode, invariant, or side effect matters?

### Different Layer, Different Abstraction

A layer should change the abstraction level. Pass-through layers that rename parameters, forward generic options, or wrap lower-layer concepts without hiding decisions add cognitive load.

Review probes:

- Does this layer offer a new model, or only forward calls?
- Are lower-layer concepts visible in higher-layer APIs?
- Does removing the layer make the system easier to understand without losing ownership?

### Temporal Decomposition Is Suspicious

Splitting code by execution order can scatter one concept across phases. Durable design usually groups knowledge by ownership and abstraction, not just by "first do this, then do that".

Review probes:

- Does the code group the knowledge needed to make a change, or only the chronological steps?
- Does a maintainer have to jump between phases to understand one invariant?
- Are setup, mutation, cleanup, and validation split across surfaces that must be edited together?

### Pull Complexity Downward

The module or skill that owns the problem should absorb complexity so callers can stay simple. This is not a license to hide important errors or state; it means centralizing unavoidable knowledge under the right owner.

Review probes:

- Is complexity pushed to every caller because the owner avoided a hard decision?
- Can the owner choose a representation that makes invalid states harder to create?
- Can a low-level module handle retries, normalization, parsing, or aggregation without exposing mechanics upward?

### Define Errors Out Of Existence Carefully

Eliminating an error is valuable when the new contract is explicit and safe. It is dangerous when it hides security, data integrity, auditability, observability, compatibility, or recovery information.

Review probes:

- Is the "error" actually impossible or meaningless under a better contract?
- Would hiding it make incidents harder to detect or debug?
- Does the caller need to distinguish cases for correctness or user workflow?
- Is the contract change authorized and tested?

### Comments Are Interface And Design Tools

A comment should capture information not obvious from code: contract, units, boundaries, invariants, rationale, side effects, concurrency assumptions, or cross-module coupling. Comments that narrate code are weak substitutes.

Review probes:

- Could a caller use the interface without reading implementation code?
- Does the interface documentation state behavior, side effects, preconditions, ownership, error semantics, and invariants?
- Is a long comment compensating for a weak abstraction?
- Is critical rationale absent because the code is assumed to be self-documenting?
- Is the same design decision documented more than once?

### Names And Consistency Are Cognitive Contracts

Naming and conventions are not polish when they shape the reader's mental model. Consistency creates cognitive leverage; unnecessary variation forces readers to re-learn local rules.

Review probes:

- Does the name create the right model of ownership, scope, units, lifecycle, or side effects?
- Is the same concept named differently across surfaces?
- Is the same name used for different concepts?
- Does a deviation from local convention have a visible semantic reason?

### Design It Twice For Material Choices

Require alternatives only when the design choice is material; do not demand ceremonial alternatives for trivial changes.

Review probes:

- Was another owner, representation, boundary, interface, or error model considered?
- Is the rejected alternative real, or a strawman?
- Does the chosen design reduce current complexity rather than future-flexibility theater?

### Performance Needs Measurement

Performance-motivated complexity needs evidence. If a design gets harder to understand for performance reasons, the review should require measurement or a clear performance constraint.

Review probes:

- Is the optimization based on measured bottlenecks or intuition?
- Does the performance path leak complexity into normal callers?
- Can the optimization stay behind a simple interface?

## Candidate Finding Pattern

In addition to the shared finding contract, APOSD findings name:

- Reader task: the future change, review, debugging, or call-site usage made harder.
- Symptom: change amplification, cognitive load, or unknown-unknown risk.
- Cause: dependency, obscurity, or both.
- Correction type: owner change, boundary change, representation change, interface narrowing, special-case removal, comment contract, consistency fix, measurement requirement, or plan revision.

## Weak Substitutes To Reject

APOSD-specific traps beyond the generic substitutes named in `SKILL.md`:

- "Fewer lines" or "fewer files" as simplicity proof.
- "More DRY" when it creates the wrong shared dependency.
- "It follows a pattern" when the pattern is not local or semantically justified.
- "Move complexity down" when callers still must know the details.
- "Large module" as a proxy for deep module; "short function" as a proxy for shallow module.
- "Generalize it" without current repeated pressure.

## Limits

APOSD is a strong review language, not a complete engineering method. Do not let it override:

- explicit user scope and authorization boundaries
- public API, schema, persistence, security posture, or compatibility contracts
- tests and regression evidence for behavior changes
- precise types, validation, formal specs, protocol docs, or security requirements
- domain constraints such as auditability, incident response, distributed consistency, or data integrity

When APOSD conflicts with a harder contract, report the contract risk first and treat APOSD as supporting context.
