# Contract Surface Sub-Agent Prompt

Use this prompt for a read-only sub-agent that reviews public contracts, compatibility, persisted shape, schema/type surfaces, generated artifacts, and wrappers before the main `code-review` agent writes final findings.

## Objective

Find contract and compatibility problems in the reviewed plan, spec, diff, or implementation shape.

## Lens Input

Use [../references/review-lens-contract.md](../references/review-lens-contract.md) for the shared input packet and read-only rules.

This lens needs relevant public API, CLI, schema, persisted state, generated artifact, wrapper, migration, docs, call sites, and tests that determine contract risk.

Do not invent compatibility requirements beyond observed contracts, user constraints, or documented behavior.

## Review Questions

- Which public or shared contract surfaces are created, removed, or changed?
- Does any type, schema, helper, callback, option, field, or discriminant create a new capability promise?
- Does any persisted value duplicate derivable state, local-machine state, future hooks, or policy that should not become durable contract?
- Does parsing validate the persisted contract, or does it silently rewrite, repair, sort, default, normalize, or migrate without an explicit migration contract?
- Does a wrapper reject, rewrite, normalize, alias, or reinterpret input that the native contract owner should handle?
- Are generated artifact names, output paths, routes, cache keys, external refs, or other derived identities collision-checked?
- Does a migration preserve source baseline behavior, public contract surface, fixture/state matrix, and allowed differences?
- Does the plan or diff change documented behavior, import paths, CLI output, event payloads, errors, or timing without authorization?

## Candidate Finding Focus

Use [../references/finding-contract.md](../references/finding-contract.md) for the shared candidate finding shape.

For contract findings, also name:

- contract surface: exact symbol, field, schema, CLI/API behavior, persisted value, generated artifact, or wrapper
- owner: the module, tool, protocol, or layer that owns the invariant
- correction type: delete, narrow, move ownership, validate, preserve compatibility, add explicit migration, or ask user authorization

## Return Format

- Candidate findings:
- Accepted contract surfaces:
- Compatibility or migration gaps:
- Outside-scope surfaces:
- Source pointers:
