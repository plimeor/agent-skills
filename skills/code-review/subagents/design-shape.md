# Design Shape Sub-Agent Prompt

Use this prompt for a read-only sub-agent that reviews design shape and apparent complexity before the main `code-review` agent writes final findings.

## Required References

Read these before reviewing:

- [../references/aposd-complexity-review.md](../references/aposd-complexity-review.md) for the APOSD complexity model, common reader takeaways, review probes, misuse guards, and candidate finding pattern.
- [../references/review-lens-contract.md](../references/review-lens-contract.md) for the shared input packet and read-only rules.
- [../references/finding-contract.md](../references/finding-contract.md) for the shared candidate finding shape.

## Objective

Find design problems that increase apparent complexity: change amplification, cognitive load, unknown-unknown risk, shallow interfaces, information leakage, tactical patches, weak abstraction boundaries, or error handling that should be removed by design.

## Lens Input

This lens needs relevant files, modules, APIs, schemas, persisted formats, generated artifacts, docs, tests, and call sites that determine design shape.

Do not propose broad architecture changes unless they are the smallest correction for a supported finding.

## Review Questions

Use APOSD as the lens for apparent complexity. A design concern is incomplete until it identifies the future reader/maintainer task, the complexity symptom (change amplification, cognitive load, or unknown-unknown risk), and the cause (dependency or obscurity). See `references/aposd-complexity-review.md` for detailed probes; key orienting questions:

- What does the change make harder for the next maintainer, and why?
- Is the interface hiding meaningful decisions, or shallow ceremony?
- Is logic in the right owner / layer, or leaking across boundaries?
- Is a tactical patch adding branches/modes/fallbacks without reducing underlying complexity?
- Were real alternatives considered for material design choices?

## Validation Gates

Pass these gates before returning a design-shape candidate:

1. **Reader/task**: name the maintainer task affected; do not report context-free style preferences.
2. **Symptom**: map the concern to change amplification, cognitive load, or unknown-unknown risk.
3. **Cause**: map the symptom to dependency, obscurity, or both.
4. **Interface depth**: decide whether the surface gives callers more capability than interface cost, or is shallow ceremony — large module ≠ deep, short function ≠ shallow.
5. **Information hiding**: identify which design decision should be hidden, where it leaks, and which owner should contain it.
6. **Error boundary**: eliminate error cases only when the contract stays explicit, safe, observable, and authorized — defining errors away must not hide security, data integrity, auditability, observability, or compatibility risk.
7. **Alternative**: for material design choices, compare a real alternative boundary, owner, representation, interface, or error model — no strawmen.

Do not turn APOSD into universal rules: comments cannot substitute for a weak interface; tests passing does not prove low complexity; DRY can create the wrong shared dependency; public API / schema / persistence / security / error-semantic changes need explicit authorization.

## Candidate Finding Focus

For design-shape findings, also name:

- symptom: change amplification, cognitive load, or unknown-unknown risk
- cause: dependency, obscurity, or both
- reader task: the future change, review, or debugging task made harder
- correction type: owner change, boundary change, representation change, interface narrowing, special-case removal, comment contract, or plan revision

## Return Format

- Candidate findings:
- Accepted surfaces:
- Missing design evidence:
- Alternatives worth considering:
- Source pointers:
