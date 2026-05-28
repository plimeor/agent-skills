# APOSD Complexity Review Reference

APOSD vocabulary for design-shape findings in code-review. Review lens, not a book summary.

Source: John Ousterhout, *A Philosophy of Software Design* / CS190 — https://web.stanford.edu/~ouster/cgi-bin/aposd.php · https://github.com/johnousterhout/aposd-vs-clean-code

## Core Model

Apparent complexity is what a future maintainer experiences doing a real task. Every APOSD finding maps a concrete surface to at least one **symptom** and one **cause**:

- **Symptoms** — change amplification (one concept, many edits) · cognitive load (too much non-local knowledge) · unknown-unknown risk (important info not discoverable, or maintainer can't know it's needed).
- **Causes** — dependency (surface can't be understood independently) · obscurity (important behavior, owner, invariant, or coupling isn't obvious).

Style preferences, naming opinions, "cleaner" advice, and generic simplification do not qualify without that mapping.

## Principles

- **Complexity is incremental.** Each tolerated branch / flag / fallback / nullable / wrapper / undocumented invariant compounds. Ask whether the change reduces underlying complexity or just adds another tolerated shortcut.
- **Working code is not design evidence.** Tests passing prove correctness, not maintainability. Ask whether the touched area now has the shape it would have if the requirement had been known from the start.
- **Deep modules are about ratio.** Small caller-facing interface relative to hidden useful behavior. Large ≠ deep; short ≠ shallow. Ask what callers must know about ordering, retries, cache, validation timing, storage format, fallback rules.
- **Make the common case simple.** Common callers shouldn't pass options, know internal defaults, or handle rare states. Don't make all callers pay for flexibility only one needs.
- **General-purpose, not speculative.** General enough for known nearby needs; not contaminated by product-specific / one-off policy; not justified by imagined future extension.
- **Information leakage is the primary red flag.** Knowledge that should belong to one owner appears elsewhere — duplicated rules, mirrored validation, exposed data structures, ordering assumptions, generated-artifact coupling, error semantics, comments describing another module's internals. Ask which decision leaks, where it should live, how many places must change if it changes.
- **Different layer, different abstraction.** A layer that only forwards calls, renames parameters, or wraps lower-layer concepts adds cognitive load without changing the model. Removing it should make the system harder — not easier — to understand.
- **Temporal decomposition is suspicious.** Splitting code by execution order scatters one concept across phases. Group knowledge by ownership and abstraction, not "first do this, then do that".
- **Pull complexity downward.** The owner absorbs complexity so callers stay simple — without hiding important errors or state. The right owner centralizes unavoidable knowledge.
- **Define errors out of existence — carefully.** Eliminating an error is valuable only when the new contract is explicit, safe, observable, and authorized. Don't use it to hide security, data integrity, auditability, observability, compatibility, or recovery information.
- **Comments are interface tools.** Capture what code can't say: contract, units, invariants, rationale, side effects, concurrency, cross-module coupling. A long comment compensating for a weak abstraction is a smell, not a fix.
- **Names and consistency are cognitive contracts.** Same concept → same name; different concept → different name. Deviation from local convention needs a visible semantic reason.
- **Design it twice for material choices.** Compare a real alternative owner / representation / boundary / interface / error model — no strawmen, no ceremonial alternatives on trivial changes.
- **Performance needs measurement.** Optimization-motivated complexity needs evidence of a real bottleneck and should stay behind a simple interface.

## Weak Substitutes To Reject

- "Fewer lines" or "fewer files" as simplicity proof.
- "More DRY" when it creates the wrong shared dependency.
- "It follows a pattern" when the pattern isn't local or semantically justified.
- "Move complexity down" when callers still must know the details.
- "Large module" as a proxy for deep; "short function" as a proxy for shallow.
- "Generalize it" without current repeated pressure.
- "Add a comment" instead of fixing a weak interface.

## Limits

APOSD is review vocabulary, not a complete engineering method. Don't let it override: explicit user scope and authorization, public API / schema / persistence / security / compatibility contracts, regression evidence for behavior changes, precise types / validation / formal specs / protocol docs, or domain constraints (auditability, incident response, distributed consistency, data integrity). When APOSD conflicts with a harder contract, report the contract risk first; APOSD is supporting context.
