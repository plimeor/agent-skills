# Complexity Review Reference

Axis question: can a future maintainer understand this surface well enough to change it safely, and how much must they hold in their head to do it?

Sources: John Ousterhout, *A Philosophy of Software Design* — https://web.stanford.edu/~ouster/cgi-bin/aposd.php · Artem Zakirullin, *Cognitive load is what matters* — https://github.com/zakirullin/cognitive-load · Dan North, *CUPID* (Predictable, Idiomatic) — https://dannorth.net/cupid-for-joyful-coding/

## Core Model

- Apparent complexity is what a maintainer experiences doing a real task, not a property of the text. Line count, file count, and function length measure nothing by themselves.
- Working memory is small — roughly four non-local facts at once. Every fact a reader must import from elsewhere (a flag's meaning, an ordering constraint, another module's internals) occupies a slot; past the limit, reading becomes re-deriving.
- Complexity is incremental. Each tolerated branch / flag / fallback / nullable / wrapper / undocumented invariant compounds. Ask whether a change reduces underlying complexity or adds another tolerated shortcut.

## Principles

- **Deep modules are about ratio.** Small caller-facing interface relative to hidden useful behavior. Large ≠ shallow; short ≠ deep. Ask what callers must know about ordering, retries, cache, validation timing, storage format, fallback rules.
- **Beware many shallow modules.** Decomposition has a cost: each extra module adds its responsibility and its interactions to the reader's working set. A cohesive large module often reads cheaper than five fragments; "smaller classes and shorter functions" is not a simplification argument.
- **Make the common case simple.** Common callers shouldn't pass options, know internal defaults, or handle rare states. Don't make all callers pay for flexibility only one needs.
- **General-purpose, not speculative.** General enough for known nearby needs; not contaminated by product-specific or one-off policy; not justified by imagined future extension.
- **Information leakage is the primary red flag.** Knowledge that should belong to one owner appears elsewhere — duplicated rules, mirrored validation, exposed data structures, ordering assumptions, generated-artifact coupling, error semantics, comments describing another module's internals. Ask which decision leaks, where it should live, and how many places must change if it changes.
- **Different layer, different abstraction.** A layer that only forwards calls, renames parameters, or wraps lower-layer concepts adds cognitive load without changing the model. Removing it should make the system harder — not easier — to understand.
- **Temporal decomposition is suspicious.** Splitting code by execution order scatters one concept across phases. Group knowledge by ownership and abstraction, not "first do this, then do that".
- **Pull complexity downward.** The owner absorbs complexity so callers stay simple — without hiding important errors or state. The right owner centralizes unavoidable knowledge.
- **Predictable: code does what it looks like it does.** No surprising side effects behind an innocent name, no action at a distance, no behavior depending on invisible state or call order. A deviation from the least-surprise reading is a defect in the interface, not in the reader.
- **Comments are interface tools.** Capture what code can't say: contract, units, invariants, rationale, side effects, concurrency, cross-module coupling. A long comment compensating for a weak abstraction is a smell, not a fix.
- **Names and consistency are cognitive contracts.** Same concept → same name; different concept → different name. Deviation from local convention needs a visible semantic reason.
- **Performance needs measurement.** Optimization-motivated complexity needs evidence of a real bottleneck and should stay behind a simple interface.

## Weak Substitutes To Reject

- "Fewer lines" or "fewer files" as simplicity proof; "short function" or "small class" as goals in themselves.
- "Large module" as a proxy for shallow; "short function" as a proxy for deep.
- "It follows a pattern" when the pattern isn't local or semantically justified.
- "Add a comment" instead of fixing a weak interface.
