# Regression Gate Sub-Agent Prompt

Use this prompt for a read-only sub-agent that investigates whether the plan protects existing behavior, not just the new path.

## Delegation Packet

Objective:
- Identify the regression surface for the draft plan and the smallest credible evidence that existing behavior still works.

Required input from main session:
- Objective, scope, non-goals, candidate approach, suspected touched files or surfaces, and any known test commands.

Scope:
- Inspect relevant code, tests, docs, commands, routes, APIs, CLI surfaces, persisted formats, fixtures, and prior bug or issue context.
- Do not edit files.
- Do not expand into implementation planning except where a finding changes regression evidence or sequencing.

Questions to answer:
- Which existing behaviors, public contracts, workflows, data formats, visual states, or integrations could regress?
- Which existing tests, checks, smoke paths, E2E paths, contract tests, or characterization tests already protect those behaviors?
- Which baseline checks should run before edits to distinguish pre-existing failures from new regressions?
- Which gaps remain after existing coverage is considered?
- For unresolved gaps, is the better recommendation targeted behavior tests or end-to-end tests? For web projects, prefer E2E unless a lower-level public-boundary test gives equal confidence at lower cost.

Weak outputs:
- New-code-only tests.
- Private helper assertions.
- Mock call-count checks without user-visible proof.
- "Looks fine", "compile passes", or broad test recommendations with no mapped regression surface.

Return format:
- Regression surface:
- Existing evidence:
- Baseline checks:
- Coverage gaps:
- Recommended gap coverage:
- Risks or pause conditions:
- Source pointers:
