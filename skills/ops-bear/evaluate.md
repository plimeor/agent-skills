# Evaluate Bear CLI Skill Accuracy

Use this resource when the user asks whether `ops-bear` is accurate, when Bear
CLI behavior changed, or before updating `SKILL.md` from memory.

## Goal

Refresh the skill against the real local `bear` / `bearcli` binary, then patch
`SKILL.md` so commands, options, output shapes, and safety notes match observed
local behavior.

## Evidence Rules

- Treat local CLI help as the source of truth for this machine.
- Do not rely on remembered command names, old SDK behavior, or prior skill text.
- Preserve private Bear data. Prefer `--help` and command reference output over
  listing or reading notes.
- If a behavior claim requires touching notes, create a temporary note with a
  unique title/tag and clean it up after verification.

## Retrieval

Start with availability and version-level context:

```bash
command -v bear || command -v bearcli
bear help
bear help all
```

Then inspect only the command families affected by the requested update:

```bash
bear list --help
bear search --help
bear show --help
bear cat --help
bear search-in --help
bear create --help
bear append --help
bear edit --help
bear overwrite --help
bear tags list --help
bear tags add --help
bear tags remove --help
bear tags rename --help
bear tags delete --help
bear pin list --help
bear pin add --help
bear pin remove --help
bear trash --help
bear archive --help
bear restore --help
bear attachments list --help
bear attachments add --help
bear attachments save --help
bear attachments delete --help
bear open --help
```

## Contract Checklist

Update `SKILL.md` when the local CLI evidence changes any of these surfaces:

- Subcommand names, especially full-note write behavior such as `overwrite`.
- Option names, especially edit operations such as `--find`, `--replace`,
  `--insert-after`, and `--insert-before`.
- Which commands accept `--format` and which commands are silent mutations.
- JSON output shapes for read commands.
- Exit-code conventions and where errors are emitted.
- Safety gates such as `--base`, `--force`, attachment deletion, global tag
  rename/delete, and note movement.
- Search syntax or default fields.
- Attachment save behavior: raw bytes by default, structured base64 with JSON or
  CSV.

## Patch Rules

- Keep `SKILL.md` as the operational entrypoint. Put only the evaluation workflow
  in this file.
- Prefer command examples copied from current help output, adjusted only for
  placeholders like `<note-id>` and `$CONTENT`.
- Remove examples that use unsupported options instead of keeping compatibility
  notes for obsolete behavior.
- State observed uncertainty directly when help output is ambiguous.
- After patching, run the repo verification checks from `AGENTS.md`.

## Minimal Verification

After updating the skill, run:

```bash
rg --files -g 'SKILL.md'
git diff --check
```

If a skill was added, also check the directory/frontmatter name match and update
the README index.
