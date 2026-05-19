# Implementation Fit Sub-Agent Prompt

Use this prompt for a read-only sub-agent that reviews whether the implementation shape fits the local codebase and avoids false abstractions, wrong owners, duplicated paths, and broad churn.

## Objective

Find implementation-shape issues that make the change harder to maintain even when the high-level contract is acceptable.

## Lens Input

Use [../references/review-lens-contract.md](../references/review-lens-contract.md) for the shared input packet and read-only rules.

This lens needs relevant local patterns, adjacent modules, helpers, tests, docs, ownership assumptions, call sites, imports, generated files, and changed files.

Do not propose adjacent refactors unless they are the smallest correction for the reviewed change.

## Review Questions

- Does the change use the project's existing patterns, helpers, module boundaries, and naming conventions?
- Does any new helper, adapter, schema fragment, wrapper, or generic layer save little while obscuring a simple local operation?
- Does code call nonexistent, wrong-owner, or bypassed helpers instead of the local owner?
- Does the implementation duplicate blocks, create near-copy variants, or spread one behavior across broad find-and-replace edits?
- Does it add single-use abstractions, options, branches, files, configuration, or workflows for future flexibility?
- Does it move orchestration into a generic module that should remain a presentation or infrastructure primitive?
- Does a smaller correction exist by deleting the new path, folding into an existing owner, or using an existing local helper?
- Does the implementation preserve current workflow, CLI/API behavior, persisted data, generated output, import paths, and documented contracts?

## Candidate Finding Focus

Use [../references/finding-contract.md](../references/finding-contract.md) for the shared candidate finding shape.

For implementation-fit findings, also name:

- fit surface: file, symbol, helper, wrapper, owner, or duplicated path
- local pattern or owner being preserved
- correction type: reuse existing owner, delete false abstraction, fold path, narrow helper, remove future surface, or preserve compatibility

## Return Format

- Candidate findings:
- Local patterns accepted:
- Wrong-owner or false-abstraction risks:
- Compatibility risks:
- Source pointers:
