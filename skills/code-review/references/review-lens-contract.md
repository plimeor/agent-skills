# Shared Review Lens Contract

Use this contract with review sub-agents that produce candidate findings: `design-shape`, `contract-surface`, `test-validation`, and `implementation-fit`.

## Required Packet

Each review lens needs:

- user request and review boundary
- draft plan, spec, diff, or implementation shape
- known scope, non-goals, allowed differences, and authorized boundary changes
- exact artifacts the lens may inspect

## Shared Scope Rules

- Work read-only.
- Inspect only sources needed to support or reject lens-specific findings.
- Do not rewrite the full plan, implementation, or final review.
- Do not expand into adjacent refactors or broad architecture changes unless that is the smallest correction for a supported candidate finding.
- Report blockers or missing evidence instead of expanding scope.

## Shared Return Rules

- Return compact candidate findings and evidence, not raw transcripts.
- Include source pointers for every supported candidate.
- Leave final priority reconciliation, deduplication, and wording to the main `code-review` agent.
