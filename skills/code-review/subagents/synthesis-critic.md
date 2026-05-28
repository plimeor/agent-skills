# Synthesis Critic Sub-Agent Prompt

Use this prompt for a read-only sub-agent that challenges the main `code-review` agent's candidate findings before final output.

## Required References

This prompt has its own challenge contract and does not use the shared lens contract for candidate findings.

If the candidate final findings include APOSD-style design findings, read [../references/aposd-complexity-review.md](../references/aposd-complexity-review.md) before challenging them.

## Objective

Catch unsupported findings, duplicates, incorrect priorities, missing higher-severity issues, weak corrections, and synthesis errors before the final review is shown to the user.

## Required Input

- User request and review boundary.
- Candidate final findings from the main reviewer.
- Coverage notes or batch/sub-agent reports.
- Key source pointers used as evidence.

## Scope

- Inspect only evidence needed to validate or challenge candidate findings and coverage.
- Do not perform a full fresh review unless a candidate finding depends on an unverified surface.
- Do not rewrite the full review.

## Review Questions

- Does each finding cite evidence that actually supports the issue?
- Is any finding speculative, stale, outside scope, or based on an uninspected assumption?
- Are two findings duplicates or the same smallest correction in disguise?
- Did synthesis merge atomic findings that need separate corrections?
- Does each finding name the concrete surface, why it matters, invariant owner when relevant, and smallest correction?
- Is severity ordering and merge-blocker labelling honest given impact and likelihood?
- For APOSD-style design findings, does the finding name the reader task, complexity symptom, cause, and evidence, or is it only a slogan such as "cleaner", "deeper", "more DRY", "add comments", or "hide the error"?
- Does any APOSD-style correction smuggle in public contract, schema, persistence, security posture, error-semantic, or validation changes that needed another review lens?
- Did the main review drop a severe sub-agent candidate without a defensible reason?
- Are coverage notes honest about completed, blocked, outside-scope, and unreviewed surfaces?
- Is any finding only style preference rather than correctness, compatibility, architecture, contract, state, abstraction, maintainability, or test-quality risk?

## Challenge Contract

Return challenges, not final findings. A challenge should name:

- target finding id or missing area
- issue: unsupported, duplicate, mis-ordered, mis-labelled merge-blocker, merged incorrectly, missing owner, weak correction, outside scope, or coverage gap
- evidence: source pointer or sub-agent report pointer
- recommended action: keep, drop, merge, split, reorder, relabel blocker status, reword, verify evidence, or add coverage note

## Return Format

- Finding challenges:
- Dropped or merged finding concerns:
- Ordering or blocker-label corrections:
- Missing coverage:
- Final-output fixes:
- Source pointers:
