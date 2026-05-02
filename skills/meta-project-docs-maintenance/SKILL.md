---
name: meta-project-docs-maintenance
description: >-
  Maintain project documentation under docs/ with clear layers for living specs,
  implementation plans, and decision records. Use when the user asks to organize,
  update, split, prune, archive, or clean up docs/specs, docs/plan,
  docs/decisions, README content, or post-implementation documentation. Trigger
  on project docs maintenance, living spec cleanup, plan implemented, ADR,
  decision record, docs language policy, docs naming policy, README vs docs,
  spec bloat, documentation pruning, and similar requests.
---

# Project Docs Maintenance

Use this skill to keep project documentation useful as an operational memory
system, not as a transcript of how the work unfolded.

The goal is one current source of truth for each kind of information:

- README explains the public entrypoint.
- Living specs describe current behavior and contracts.
- Plans guide one active implementation and then disappear.
- Decision records preserve expensive-to-reverse choices.

## First Pass

Before editing docs, inspect the repo-local rules and current docs shape:

1. Read the project rules file if present, such as `AGENTS.md` or `CLAUDE.md`.
2. List existing docs paths under `docs/`, especially `docs/specs/`,
   `docs/plan/`, and `docs/decisions/`.
3. Check README only for public-facing entrypoints and current usage.
4. Follow repo-local naming and language rules when they are stricter than this
   skill.

If the user is asking to establish a new policy, propose the smallest policy
that resolves the current problem. Do not rewrite the whole docs system unless
the user explicitly asks for a migration.

## Documentation Layers

### README

README is the public entrypoint. Continue using the language the current README
already uses. Do not translate README as drive-by cleanup. If no README exists,
or the repo is intentionally establishing a new public language, infer the
language from the user's request, existing public docs, and expected audience.

Put this in README:

- What the project or package does.
- Installation and quick start.
- Current commands and minimal examples.
- Package list or public module overview.
- Links to deeper docs when useful.

Do not put this in README:

- One-feature implementation details.
- Internal debate.
- Long design alternatives.
- Repo-local policy that belongs in `AGENTS.md`.
- A duplicated copy of a living spec.

### Living Specs

Use `docs/specs/<english-topic>.md` for living implementation specs.

Specs describe the current effective contract:

- CLI commands, arguments, options, and output shape.
- Public APIs, schemas, state files, package metadata, workspace contracts, and
  package boundaries.
- Install, sync, publish, migration, or other cross-module behavior.
- Error cases and user-visible behavior.
- Current invariants that future code changes must preserve.

Do not put this in specs:

- Superseded alternatives.
- Chronological logs of failed attempts.
- Step-by-step implementation plans.
- Rationale that only explains why a major choice was made.
- Repeated README usage examples unless the spec needs contract-level detail.

When old context is still valuable, move it instead of deleting it silently:

- Move stable rationale to `docs/decisions/`.
- Move current user-facing usage to README.
- Move unfinished execution steps to `docs/plan/`.
- Delete stale attempts, dead alternatives, and duplicated prose.

### Implementation Plans

Use `docs/plan/YYYY-MM-DD-<english-description>.md` for one-time implementation
plans.

Plans are temporary. They should contain:

- The requested outcome and explicit non-goals.
- Dependencies and ordering.
- Risks and decision points.
- Verification steps for the implementation.
- A short status marker such as `Planned`, `In Progress`, `Implemented`,
  `Superseded`, or `Abandoned`.

After the plan is implemented, perform the cleanup pass:

1. Extract current contracts into the relevant spec.
2. Extract expensive-to-reverse rationale into a decision record.
3. Extract public commands or usage into README.
4. Delete the implemented plan unless the user explicitly wants to keep it as a
   historical artifact.
5. Check links and references so the deleted plan is not the only source of an
   active fact.

### Decision Records

Use `docs/decisions/YYYY-MM-DD-<english-description>.md` for historical decision
records.

Decision records are for choices that are significant, traceable, and expensive
to reverse:

- Package boundaries.
- Runtime or framework choices.
- Schema and state-file commitments.
- Public API or CLI direction.
- Migration and deprecation strategy.
- Security, publishing, or deployment posture.

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

Use English for:

- Filenames.
- Package names, command names, options, schema fields, error codes, and code
  identifiers.
- Short public summaries when the repo has external readers.

Do not create two canonical versions of the same doc in different languages.
If outside readers need help, add a short English summary or README link instead
of maintaining parallel full documents.

## Naming Policy

Use English kebab-case filenames.

Default naming:

- `docs/specs/<topic>.md`: no date prefix because the file is a living spec.
- `docs/plan/YYYY-MM-DD-<description>.md`: date prefix because the file is tied
  to one implementation episode.
- `docs/decisions/YYYY-MM-DD-<description>.md`: date prefix because the file is
  a historical record.
- `docs/ideas/YYYY-MM-DD-<description>.md`: date prefix if the repo uses an
  ideas folder for snapshots.

Use the event or decision date when it is known. Do not use today's date just
because the cleanup is happening today.

If the current repo already uses a different naming policy, do not rename files
as drive-by cleanup. First state the mismatch and ask whether the user wants a
separate migration.

## Living Spec Hygiene

Living specs should become more accurate over time, not just larger.

Split a spec when:

- It covers multiple independent packages, commands, or public contracts.
- Readers need only one section most of the time.
- New changes repeatedly touch one subsection without touching the rest.
- The doc has grown into unrelated top-level concerns.

Prune a spec when:

- A paragraph only explains a superseded plan.
- The same contract is stated in multiple places.
- README and spec both contain the same long usage block.
- Examples no longer add contract detail.
- Historical rationale interrupts the current behavior.

Prefer links over duplication. The deeper doc should own the detailed contract;
the higher-level doc should summarize and link.

## Stop Rules

Do not update specs for changes that do not affect public behavior, shared
contracts, state, package boundaries, install/sync/publish behavior, or current
usage.

Do not keep an implemented plan synchronized with later code. Extract the value,
then remove it or mark it as historical according to the repo policy.

Do not create new documentation layers when the existing README/spec/plan/decision
split is enough.

Do not make documentation cleanup look like implementation evidence. Only claim
tests, commands, logs, or measurements that were actually observed.
