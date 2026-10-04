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
- `@path` imports — Claude Code expands them at launch, so the imported file costs the same as inline text. Write pointers as plain paths or markdown links; an `@name` outside backticks is an import

Describe **capabilities and stable domain terms** ("billing owns charges and invoices"; "organization ≠ group ≠ workspace"). Do not document a file tree or "auth lives in `src/auth/handlers.ts`" — paths move and then poison every later session. A pointer to a doc the agent can open now is fine; a frozen map of the tree is not.

## Monorepo

Nested `AGENTS.md` files merge with root. Root: what the workspace is, how to navigate packages, shared toolchain. Package file: that package's purpose, stack, local landmines, pointers. Each level stays within the Every-task test at its scope. Nested files are deltas, never copies of root.

Claude Code loads ancestor files at launch and a subdirectory's file only when it reads a file in that subdirectory. Keep one convention across the tree: under the default setting, a `CLAUDE.md` anywhere from the working directory up switches Claude Code to `CLAUDE.md` files only, and nested `AGENTS.md` files without their own `CLAUDE.md` import go unread.

## Contradiction and deletion pass

Before adding a line, and on every refactor, scan the draft root, the files you are about to link, and every file in the **instruction-file inventory** (Mode in `SKILL.md`) — including other tools' files, since the same repo should not tell different agents conflicting things:

1. **Contradictions.** Two instructions that cannot both be followed. Name both with locators. Do not pick silently; put the choice under Decisions needed with your recommendation.
2. **Supersession.** Replace or delete in place. Never append a correction next to the old rule.
3. **Deletion flags.** Drop a line that is redundant (model or lint/CI already enforces it), too vague to act on, or obvious ("write clean code").

When the file disagrees with the code, verify which is current and fix the loser before relying on either.

## Refactor order

Required in Refactor mode. Do not skip a step by jumping to a "clean rewrite."

1. **Find contradictions** and record each under Decisions needed.
2. **Extract essentials** that pass the Every-task test / Placement root row.
3. **Group the rest** by domain (language, testing, API, git, …).
4. **Write the split**: minimal root with markdown links; one file per group; a suggested `docs/` (or equivalent) layout.
5. **Flag for deletion** using the deletion flags above. Record drops in the Placement map.

If step 1 is unanswered, run steps 2–5 on every line the contradiction does not touch; only the contradicted lines stay held. If step 4 cannot write a target file, name that remainder; do not leave the extra rules in root "temporarily" and call the job done.

## Claude Code loading

Claude Code (v2.1.277+) reads `AGENTS.md` as project instructions when no `CLAUDE.md`, `.claude/CLAUDE.md`, or `CLAUDE.local.md` exists in the working directory or above it. Any one of them switches it to `CLAUDE.md` files only under the default **Project instructions** setting (`claude-md-or-agents-md`). The user's `~/.claude/CLAUDE.md`, managed `CLAUDE.md`, and `.claude/rules/` do not count. It does not read `AGENTS.local.md`, `AGENTS.override.md`, or anything under `.agents/`.

Default: `AGENTS.md` alone, no `CLAUDE.md`.

A `CLAUDE.md` is warranted only when one of these holds:

- Claude-only instructions exist (plan mode, hooks, Claude tool names)
- Sessions the repo supports cannot read `AGENTS.md` directly: Claude Code before v2.1.277, the built-in `agents-md` plugin disabled, or **Project instructions** set to `claude-md`
- The repo relies on `InstructionsLoaded` hooks or on `--add-dir` with `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD`; neither sees an `AGENTS.md` read directly

Its body is `@AGENTS.md` first, then only the Claude-only notes. Prefer the import over `ln -s AGENTS.md CLAUDE.md`: a Windows clone checks a symlink out as a one-line text file unless `core.symlinks` is enabled, and Claude Code's Edit and Write tools refuse to write through the link. A symlink fits only when there are no Claude-only notes and no contributor uses Windows. Do not add a `CLAUDE.md` unless a condition holds and the user asked or the repo already uses Claude Code; mention it when relevant.

Existing setups:

| Found | Action |
|---|---|
| `CLAUDE.md` importing `@AGENTS.md` | Keep; it never loads `AGENTS.md` twice. Delete it only when it holds nothing else and no condition above holds |
| `CLAUDE.md` symlinked to `AGENTS.md` | Keep or delete; content loads once either way |
| `CLAUDE.md` that tells the agent in words to read `AGENTS.md` | Replace with the import or delete; the agent sees `AGENTS.md` only if it chooses to open it |
| Hook that prints `AGENTS.md` | Remove; direct reading already loads it, so the hook adds a second copy |
| `CLAUDE.md` with its own rule body | Fork: Claude Code reads only the `CLAUDE.md`, so `AGENTS.md` rules silently miss it. Run the **Contradiction and deletion pass** across both, then collapse to the import |

When a report says Claude ignores `AGENTS.md`, check first for a `CLAUDE.md` or a personal `CLAUDE.local.md` on the path; the latter counts too. Confirm what loaded with `/memory`.
