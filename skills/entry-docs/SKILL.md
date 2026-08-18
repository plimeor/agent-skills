---
name: entry-docs
description: "Author, refactor, or diagnose a repository's AGENTS.md (and CLAUDE.md) and/or README.md as complementary entrypoints. Use when writing, shrinking, splitting, or reviewing those files, when AGENTS.md is bloated or contradictory, or when a README cannot keep users out of the source. Near miss: not for SKILL.md authoring, ADRs, API reference as the primary artifact, CONTRIBUTING.md alone, blog posts, or implementing product features."
---

# Entry Docs

## Outcome

Produce or improve the repo's two entrypoint files so each serves its reader and neither becomes a dump:

- **`README.md`** — human consumers deciding whether and how to use the project
- **`AGENTS.md`** — coding agents on every request. Canonical agent file. `CLAUDE.md` is a symlink or a one-line `@AGENTS.md` import, never a second body of rules

They share a shape, not a template: as short as they can be without being shorter, with depth behind pointers. They are complementary, not mirrors. One-liner project description is the only intended overlap.

Sources this skill distills (do not paste them in): [A Complete Guide To AGENTS.md](https://www.aihero.dev/a-complete-guide-to-agents-md) and [Art of README](https://github.com/hackergrrl/art-of-readme) (CC BY 2.0, Kira / hackergrrl).

## Mode

Choose the narrowest match. If the user names one file, do not rewrite the other.

- **Author** — create or rewrite the named file(s)
- **Refactor** — split a bloated `AGENTS.md` through progressive disclosure. Follow **Refactor order** in `references/agents-md.md`
- **Diagnose** — review against the gates; do not rewrite unless asked

Inspect the repo before drafting: existing entrypoints, package manager, scripts, license, public interface. Do not invent project facts. File bodies match the repo's existing docs language; if new and unmarked, English.

Not in scope: working-doc folders and distill-then-delete lifecycles, decision ledgers, ADR migration, or a multi-section root rules template (critical rules, conventions, git etiquette, gotchas) that fails the Every-task test. An earned mistake still belongs in a linked file unless ordinary sessions hit it.

## Audience Gate

Activation: every run.

Required evidence: each file in scope has a named audience (`human-consumer` or `every-request-agent`), and every kept block has a Placement home.

Collapse modes — each is a failed gate, not a style miss:

- One template, outline, or body used for both files
- README material in `AGENTS.md`: usage demos, API encyclopedia, badges, license, marketing
- Agent instruction lists in `README.md`: always/never coding rules, model-facing conventions
- Generating one file by summarizing the other
- Merging both into one document
- An in-file table of contents or "comprehensive guide" inside `AGENTS.md` counted as disclosure (it still loads every request)
- Padding `AGENTS.md` because the README is thin

Incomplete: any kept block without a Placement home.

## Placement Gate

Activation: when deciding where any block lives.

| Home | What belongs |
|---|---|
| Root `AGENTS.md` | Relevant to every task in this repo. See **Every-task test** in `references/agents-md.md`. Typical contents: one-sentence project description; toolchain when it is not the ecosystem default the model would guess; non-standard check/build commands; markdown links to domain files |
| Nested `AGENTS.md` | Package-local every-task facts. Deltas, not copies of root. Root and nested merge into one context — do not overload either level |
| Linked markdown or skills | Domain conventions, procedures, sometimes-relevant knowledge |
| `README.md` | Human evaluation. **Funnel order** and **Completeness checklist** in `references/readme.md` |
| Drop | Redundant with the model or with lint/CI; too vague to act on; obvious; stale path maps; copies of the other entrypoint |

Prohibited substitutes: init-script or generator output committed unedited; unedited dumps; copying README into `AGENTS.md`.

Incomplete: an addition to `AGENTS.md` that has no row in this table.

## Budget Gate

Activation: authoring, editing, refactoring, or diagnosing `AGENTS.md` or `CLAUDE.md`. Read `references/agents-md.md` before producing those files.

Required evidence:

- Root contents satisfy the Placement root row and the **Every-task test**
- **Contradiction and deletion pass** has been run on the loaded chain
- Refactor mode followed **Refactor order**
- `CLAUDE.md` is not a fork
- Depth uses **Disclosure mechanics** (a root TOC or leftover copies of moved rules do not count)

Prohibited substitutes: a "comprehensive" agents file; directory tours or volatile paths as the project map; ALL-CAPS / always-forcing on mere pointers; claiming disclosure while the root still contains the moved text.

Incomplete: unresolved contradictions pause for a user choice. Unwritable split targets are named remainder, not claimed disclosure.

Do not treat estimated token count, context size, or "file too long" as a reason to skip the pass. If the contract cannot be met, name the unmet remainder and return the decision.

## Funnel Gate

Activation: authoring, editing, or diagnosing `README.md`. Read `references/readme.md` before producing that file.

Required evidence: **Funnel order** and **Completeness checklist** in that reference — each checklist item is in the README, in Gaps, or N/A with a reason. Disqualifying caveats appear before the reader has to install. Essential meaning survives if images and external hosts vanish.

Prohibited substitutes: burying "what it is" under install, changelog, or badges; selling instead of describing; padding with every bonus practice; a screenshot as the only usage evidence.

Incomplete: missing one-liner, usage, install, or license is a named gap, not invented copy.

## Output

Surrounding prose in the user's language. Deliver:

```
## Artifacts
(full contents of each file in scope, with paths; Refactor includes every new linked file)

## Placement map
- Kept in entrypoint: <item> — <every-task reason or funnel stage>
- Pointed elsewhere: <item> → <path>
- Dropped: <item> — <redundant | vague | obvious | stale | wrong-audience>

## Pair check
(when both files are in scope, or leakage is suspected)
- Shared one-liner: yes/no
- Cross-file leaks: none | <named blocks>

## Gaps
missing facts that would change the files
```

Diagnose mode: findings against the gates, with locators in the named files; skip Artifacts unless the user asked for a rewrite.

## Stop Rules

Stop when the requested files or diagnosis exist, every kept block has a Placement home, every activated gate has its required evidence, contradictions are resolved or paused, and Gaps lists anything not invented.

Do not keep expanding either file after budget and funnel are met. Do not edit code, CI, or unrelated docs unless those paths are the split targets the user asked for.
