# Change Economics Review Reference

Axis question: what will the next change cost, and is now the right time to pay for structure?

Sources: Kent Beck, *Tidy First?* — https://tidyfirst.substack.com/ · Sandi Metz, *The Wrong Abstraction* — https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction · Carson Gross, *Locality of Behaviour* — https://htmx.org/essays/locality-of-behaviour/ · tef, *Write code that is easy to delete* — https://programmingisterrible.com/post/139222674273/write-code-that-is-easy-to-delete-not-easy-to

## Core Model

- Software design is an investment decision, not a virtue. Coupling is the cost of a change spreading **across** elements; cohesion is the cost of a change **within** one element. Structure is good when it makes the changes that actually arrive cheaper — not when it matches a shape catalog.
- An element can lack cohesion by being too large or too small: a fragment solving part of a problem must be coupled to the elements solving the rest, and changing the solution means changing them all.
- Structure changes and behavior changes are different activities with different risk. A design where behavior can't be changed without restructuring, or restructured without behavior change, has already coupled the two — that is itself a finding.

## Principles

- **Tidy first only when it pays.** Restructuring is justified by a change it makes cheaper — one that is planned or demonstrably recurring — not by discomfort. "Tidy after" and "don't tidy" are legitimate outcomes of the same calculation.
- **Cohesion follows the domain.** Things that change together belong together; structure should mirror the domain's change patterns, not technical layering. When answering one domain question requires touching N technical layers, the architecture itself is change amplification.
- **Duplication is cheaper than the wrong abstraction.** Abstract when the pattern is understood, not when text repeats — two occurrences form a line that may point the wrong way. A shared abstraction that accumulates parameters and conditional paths for each new caller has already failed; the recovery is re-inlining the duplication and letting it show the right shape.
- **Weigh DRY against locality of behavior.** Extracting shared behavior trades local readability for a new coupling. The behavior of a surface should be understandable at its point of use; ask how far a reader must travel from trigger to behavior before treating deduplication as free.
- **Design for deletion.** The measure of a boundary is the blast radius of removing what's behind it. Code that is easy to delete — isolated, unshared state, countable callers — is cheap to be wrong about; code woven into everything must be right forever. Ease of deletion, not ease of extension, is the default to optimize for.

## Weak Substitutes To Reject

- "More DRY" when it creates the wrong shared dependency.
- "We might need it later" as justification for structure ahead of a demonstrated change pattern.
- "Refactor while we're here" without naming the change it makes cheaper.
- Preserving an existing abstraction because it exists, while it accretes parameters and modes — sunk cost is not cohesion.
