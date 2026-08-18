# AGENTS.md

Load with the Budget Gate. Placement's root row is the normative list of what the root file may contain; this page is the mechanics.

`AGENTS.md` sits at the top of the conversation, under the system prompt, on **every** request. Extra lines tax every other instruction the model is trying to follow. Stale lines do worse than waste: agents trust them. Prefer a small file with breadcrumbs over a ball of mud grown by appending a rule after every disliked action.

Do not auto-generate this file from an init script. Generated drafts optimize for coverage, not restraint; treat them as raw material to rewrite against Placement, never as the commit.

## Every-task test

A root line belongs only when an **ordinary session** in this repo would be harmed by not knowing it: wrong default toolchain, a destructive command, a landmine that ordinary work hits.

Not every-task, even when important: language style guides, framework how-tos, test patterns, git/PR etiquette, API design, architecture tours. Those go to linked files or a nested `AGENTS.md`. "We use TypeScript" is visible in the code; it is not a root rule. "Never run the production build in-session; it replaces the dest folder and kills the dev server" is a root landmine.

Personal-scope preferences (commit voice, local editor habits) belong in the user's global rules unless the user asked to put them in this repo's file. Project-scope facts belong here or in linked project docs.

Write the one-sentence description as a role anchor, not an architecture overview: what the repo is for, in one line.

Name the toolchain **negatively** when the model would guess wrong: `pnpm, not npm`; `uv, not pip`; `just`, not raw `make`. Skip the line when the ecosystem default is correct. Prefer Corepack or equivalent so the environment, not prose, warns on the wrong package manager.

Include a command only when it is non-standard or easy to get wrong. `go test ./...` in a Go module is usually skippable; `pnpm check` as the one required wrapper is not.

## Disclosure mechanics

Agents navigate documentation hierarchies well. Root `AGENTS.md` points; it does not copy.

```markdown
This is a React component library for accessible data visualization.
This project uses pnpm workspaces.
For TypeScript conventions, see docs/TYPESCRIPT.md.
```

Light conversational pointers. No ALL-CAPS, no "ALWAYS", no restated body under the link.

Linked files may point deeper (`docs/TYPESCRIPT.md` → `docs/TESTING.md`). Skills are the same pattern: pull knowledge when the task needs it. External official docs are valid targets.

**Not disclosure** (still every-request cost):

- A table of contents, full style guide, or "comprehensive" appendix inside `AGENTS.md`
- Moving text to `docs/` while leaving a copy in the root
- Pasting README, API docs, or license into the agents file "so the agent has it"

Describe **capabilities and stable domain terms** ("billing owns charges and invoices"; "organization ≠ group ≠ workspace"). Do not document a file tree or "auth lives in `src/auth/handlers.ts`" — paths move and then poison every later session. A pointer to a doc the agent can open now is fine; a frozen map of the tree is not.

## Monorepo

Nested `AGENTS.md` files merge with root. Root: what the workspace is, how to navigate packages, shared toolchain. Package file: that package's purpose, stack, local landmines, pointers. Each level stays within the Every-task test at its scope. Nested files are deltas, never copies of root.

## Contradiction and deletion pass

Before adding a line, and on every refactor, scan the loaded chain — draft root, nested files in scope, files you are about to link:

1. **Contradictions.** Two instructions that cannot both be followed. Name both. Do not pick silently; ask which to keep.
2. **Supersession.** Replace or delete in place. Never append a correction next to the old rule.
3. **Deletion flags.** Drop a line that is redundant (model or lint/CI already enforces it), too vague to act on, or obvious ("write clean code").

When the file disagrees with the code, verify which is current and fix the loser before relying on either.

## Refactor order

Required in Refactor mode. Do not skip a step by jumping to a "clean rewrite."

1. **Find contradictions** and ask which version to keep.
2. **Extract essentials** that pass the Every-task test / Placement root row.
3. **Group the rest** by domain (language, testing, API, git, …).
4. **Write the split**: minimal root with markdown links; one file per group; a suggested `docs/` (or equivalent) layout.
5. **Flag for deletion** using the deletion flags above. Record drops in the Placement map.

If step 1 is unanswered, pause. If step 4 cannot write a target file, name that remainder; do not leave the extra rules in root "temporarily" and call the job done.

## CLAUDE.md

Claude Code reads `CLAUDE.md`, not `AGENTS.md`. Keep one canonical body:

```bash
ln -s AGENTS.md CLAUDE.md
```

or a `CLAUDE.md` whose body is `@AGENTS.md` plus, at most, Claude-only harness notes. Two diverging files are a contradiction source. Do not create the symlink or import unless the user asked or the repo already uses Claude Code; mention it when relevant.
