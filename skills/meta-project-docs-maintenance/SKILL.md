---
name: meta-project-docs-maintenance
description: >-
  Maintain project documentation under docs/ as one current source of truth
  across README, living specs, implementation plans, and decision records. Use
  when the user asks to organize, update, split, prune, archive, or clean up
  docs/specs, docs/plan, docs/decisions, README content, docs language or naming
  policy, ADRs, implemented plans, README-vs-spec boundaries, spec bloat, or
  post-implementation documentation. Do not use this as a general code-review or
  implementation planning skill unless the requested output is documentation
  maintenance.
---

# Project Docs Maintenance

## Goal

Maintain docs as the current operational memory for the repo. Each active fact
should have one owner:

- README explains the public entrypoint.
- Living specs describe current behavior and contracts.
- Plans guide one active implementation and then disappear.
- Decision records preserve expensive-to-reverse choices.

## Success Criteria

A good docs-maintenance result:

- Places each fact in the correct layer and removes unnecessary duplication.
- Keeps README public-facing instead of turning it into internal policy or a
  duplicated spec.
- Keeps living specs current and contract-focused.
- Deletes or marks implemented plans as historical after extracting active value.
- Keeps decision records thin and historical, not active plans.
- Preserves the repo's language and naming rules.
- Reports exact validation performed and any facts left unverified.

## Constraints

When establishing policy, propose the smallest policy that solves the current
problem. Treat a full docs-system migration as a separate task unless the user
explicitly requests it.

Do not update specs for changes that do not affect public behavior, shared
contracts, state, package boundaries, install/sync/publish behavior, or current
usage.

Do not make documentation cleanup look like implementation evidence. Only claim
tests, commands, logs, measurements, or smoke runs that were actually observed.

## Evidence Budget

Before editing docs, read the directly relevant docs and repo-local rules:

- project rules file if present, such as `AGENTS.md` or `CLAUDE.md`
- target docs and neighboring docs that link to or duplicate them
- README when public entrypoint, commands, or usage are involved
- existing `docs/specs/`, `docs/plan/`, and `docs/decisions/` shape when the
  task concerns docs organization

Read source code, package metadata, CLI help, schema files, or command output only
when a documentation claim depends on executable behavior, command syntax,
schema shape, package boundaries, or the user asks for verification.

Scan all of `docs/` only when the user asks for comprehensive cleanup,
migration, archive, or policy work. Stop once the current fact ownership and
required edits are supported. Do not keep searching to improve phrasing.

## Documentation Layers

### README

README is the public entrypoint. Continue using the language the current README
already uses. Do not translate README as drive-by cleanup.

Put this in README:

- What the project or package does.
- Installation and quick start.
- Current commands and minimal examples.
- Package list or public module overview.
- Links to deeper docs when useful.

Default away from putting one-feature implementation details, internal debates,
long design alternatives, repo-local policy, or duplicated living specs in
README. Keep those only when README is intentionally the sole public doc and the
user asks for that shape.

### Living Specs

Use `docs/specs/<english-topic>.md` for living implementation specs.

Specs describe the current effective contract:

- CLI commands, arguments, options, and output shape.
- Public APIs, schemas, state files, package metadata, workspace contracts, and
  package boundaries.
- Install, sync, publish, migration, or other cross-module behavior.
- Error cases and user-visible behavior.
- Current invariants that future code changes must preserve.

Do not use specs for superseded alternatives, chronological logs of failed
attempts, step-by-step implementation plans, or rationale that only explains why
a major choice was made.

When old context is still valuable, move it instead of deleting it silently:

- Move stable rationale to `docs/decisions/`.
- Move current user-facing usage to README.
- Move unfinished execution steps to `docs/plan/`.
- Delete stale attempts, dead alternatives, and duplicated prose only when they
  are not the only source of an active fact.

### Implementation Plans

Use `docs/plan/YYYY-MM-DD-<english-description>.md` for one-time implementation
plans.

Plans are temporary. They should contain the requested outcome, non-goals,
dependencies, ordering, risks, decision points, verification steps, and a status
marker such as `Planned`, `In Progress`, `Implemented`, `Superseded`, or
`Abandoned`.

After implementation:

1. Extract current contracts into the relevant spec.
2. Extract expensive-to-reverse rationale into a decision record.
3. Extract public commands or usage into README.
4. Delete the implemented plan unless the user wants to keep it as a historical
   artifact.
5. Check links and references so the deleted plan is not the only source of an
   active fact.

### Decision Records

Use `docs/decisions/YYYY-MM-DD-<english-description>.md` for historical decision
records.

Decision records are for choices that are significant, traceable, and expensive
to reverse: package boundaries, runtime or framework choices, schema and
state-file commitments, public API or CLI direction, migration strategy,
security, publishing, or deployment posture.

Keep decision records thin:

- Context: what pressure or constraint forced the decision.
- Decision: the chosen direction.
- Alternatives: only the meaningful rejected options.
- Consequences: operational effects and known tradeoffs.
- Supersession: link to a later decision instead of rewriting history.

Do not write a decision record for small internal refactors, obvious cleanup, or
temporary research.

## Language Policy

Use the user's primary working language for internal docs under `docs/`. Infer
the language from the current conversation and surrounding repo docs. If the
signal is mixed, prefer the language that lets the user review design defects
most accurately.

Continue using the README's current language for README and other established
public entrypoints. Do not change their language unless the user explicitly asks
for a translation or public-language migration.

Use English for filenames, package names, command names, options, schema fields,
error codes, and code identifiers.

Do not create two canonical versions of the same doc in different languages. If
outside readers need help, add a short English summary or README link instead of
maintaining parallel full documents.

## Naming Policy

Use English kebab-case filenames.

Default naming:

- `docs/specs/<topic>.md`: no date prefix because the file is a living spec.
- `docs/plan/YYYY-MM-DD-<description>.md`: date prefix because the file is tied
  to one implementation episode.
- `docs/decisions/YYYY-MM-DD-<description>.md`: date prefix because the file is a
  historical record.
- `docs/ideas/YYYY-MM-DD-<description>.md`: date prefix if the repo uses an
  ideas folder for snapshots.

Use the event or decision date when it is known. Do not use today's date just
because the cleanup is happening today.

If the current repo already uses a different naming policy, do not rename files
as drive-by cleanup. State the mismatch and ask whether the user wants a separate
migration.

## Living Spec Hygiene

Living specs should become more accurate over time, not just larger.

Split a spec when it covers multiple independent packages, commands, or public
contracts; when readers need only one section most of the time; or when new
changes repeatedly touch one subsection without touching the rest.

Prune a spec when a paragraph only explains a superseded plan, the same contract
is stated in multiple places, README and spec both contain the same long usage
block, examples no longer add contract detail, or historical rationale interrupts
current behavior.

Prefer links over duplication. The deeper doc owns the detailed contract; the
higher-level doc summarizes and links.

## Validation

For docs-only prose cleanup, run `git diff --check -- docs` when `docs/` exists.
If the repo has no `docs/` or the command is not applicable, say why.

When deleting or moving a plan/spec, check old path and title references in
`README.md`, `docs/`, and project rules, for example:

```bash
rg '<old-path>|<old-title>' README.md docs AGENTS.md
```

When editing commands, schema descriptions, CLI output, or executable examples,
validate with source code, existing tests, CLI help, or the actual command. If
you cannot validate, label the fact as unverified.

Do not run code tests by default for docs cleanup unless the doc change claims
executable behavior or the user asks.

## Output

When reporting completion, include:

- Changed docs and the role each doc now owns.
- Deleted, moved, or intentionally preserved docs.
- Validation performed, with exact commands or checks.
- Facts left unverified or follow-up migrations not included in scope.

## Stop Rules

Stop once the requested documentation ownership, edits, validation state, and
out-of-scope follow-ups are clear.

Do not keep an implemented plan synchronized with later code. Extract the value,
then remove it or mark it as historical according to repo policy.

Do not create new documentation layers when the existing README/spec/plan/decision
split is enough.
