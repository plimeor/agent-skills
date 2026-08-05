# Boundary Correctness Review Reference

Axis question: can invalid state exist past this boundary, and where do effects live?

Sources: Alexis King, *Parse, don't validate* — https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/ · Gary Bernhardt, *Functional Core, Imperative Shell* — https://www.destroyallsoftware.com/screencasts/catalog/functional-core-imperative-shell · John Ousterhout, *A Philosophy of Software Design* (define errors out of existence)

## Core Model

- The strongest correctness is structural: a state that cannot be represented cannot occur, and no downstream code needs to defend against it. Prefer a boundary that transforms less-structured input into a more-structured type once over checks that verify and then forget.
- Stratify the program into a parse phase (all input rejection happens here) and an execute phase (illegal input is impossible here). Failure concentrates where it can be handled; the core is freed from defensive noise.

## Principles

- **Parse, don't validate.** A check whose result isn't captured in the type or structure will be repeated downstream — or worse, assumed. Ask: after this validation, what stops an unvalidated value from reaching the same code path?
- **Make illegal states unrepresentable.** Nullable-but-never-null fields, paired fields with an implicit invariant ("when status is X, payload is set"), stringly-typed enums, boolean combinations of which only three of four occur. Each representable-but-illegal state is a latent branch every reader must rule out and every agent must rediscover.
- **Functional core, imperative shell.** Decision logic stays pure; effects — IO, clock, randomness, network, persistence — live at the shell. The test: can the interesting logic be exercised without mocks? A design that needs test doubles for its own domain rules keeps effects in the wrong place.
- **Mirrored validation marks a failed boundary.** The same rule enforced in UI, API, and storage layers means the boundary never captured its guarantee in a type or contract; the copies will diverge silently.
- **Define errors out of existence — carefully.** Eliminating an error case is valuable only when the new contract is explicit, safe, observable, and authorized. Not a license to hide security, data integrity, auditability, observability, compatibility, or recovery information.

## Weak Substitutes To Reject

- Defensive checks scattered "just in case" instead of a boundary that makes them unnecessary.
- A doc comment promising an invariant a type could enforce.
- Mocking your own domain logic to reach testability — that is a boundary defect wearing a test harness.
