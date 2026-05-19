# Shared Finding Contract

Use this contract for candidate findings returned by review sub-agents.

## Candidate Finding Shape

Each candidate finding should name:

- priority: `P1`, `P2`, or `P3`
- surface: exact plan section, file, symbol, interface, schema, behavior, test, command, generated artifact, persisted value, wrapper, owner, or module boundary
- evidence: source pointer, command output, inspected fact, or explicitly labeled inference
- impact: why this matters for correctness, compatibility, user workflow, data, maintainability, architecture, contract, state, abstraction, or test quality
- smallest correction: the smallest code, plan, test, contract, owner, representation, validation, documentation, or user-decision change that resolves the issue
- invariant owner when relevant: the data source, state writer, shared contract, call boundary, tool/protocol owner, or presentation layer that should make the bad state impossible

## Weak Candidates

Do not return findings that are only:

- style preferences
- broad "make it simpler" advice without concrete surface and impact
- speculative compatibility risk without a named contract
- generic "add more tests" advice without a mapped behavior or regression surface
- future-flexibility arguments not tied to current behavior
- refactors of adjacent code not needed for the reviewed change
- implementation-detail complaints that do not affect the requested review boundary
- recommendations unsupported by inspected evidence or explicit inference

## Return Discipline

Return candidate findings, not final findings. The main `code-review` agent owns deduplication, priority changes, final wording, and whether a candidate appears in the final review.
