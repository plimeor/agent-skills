---
name: ops-bear
description: >-
  Use Bear App's local `bear` / `bearcli` command-line interface to read,
  search, create, edit, organize, open, or manage Bear notes and attachments on
  this Mac. Use whenever the user mentions Bear App, Bear notes, Bear CLI,
  `bear help`, the local Bear database, Bear tags, pins, attachments, note
  capture, or updating/retrieving notes from Bear. Do not use for Obsidian,
  generic Markdown files, web articles, or cloud note services; use the relevant
  local skill or tool instead.
---

# Bear CLI

## Goal

Use Bear's local CLI to operate on Bear notes while preserving note data and
making mutations auditable.

The CLI reads and writes the local Bear database in place. Treat Bear content as
private local user data: retrieve only the fields needed for the request, avoid
broad dumps, and verify mutations with the smallest useful follow-up read.

## Compatibility

Requires Bear App installed on macOS. Prefer invoking `bear`; the underlying
binary may be named `bearcli`.

If the user has asked to use Bear and `bear` is not on `PATH`, make the bundled
CLI discoverable when Bear is installed:

```bash
if ! command -v bear >/dev/null 2>&1 && [ -x "/Applications/Bear.app/Contents/MacOS/bearcli" ]; then
  mkdir -p "$HOME/.local/bin"
  ln -s "/Applications/Bear.app/Contents/MacOS/bearcli" "$HOME/.local/bin/bear" >/dev/null 2>&1 || true
fi
```

Then verify availability:

```bash
bear help
bear help all
```

If neither `bear` nor `/Applications/Bear.app/Contents/MacOS/bearcli` exists,
report that Bear CLI is unavailable and stop unless the user wants installation
help.

## Operating Rules

- Prefer `--format json` whenever output will be parsed, summarized, or used by
  another command. Default TSV has no header.
- Prefer note IDs from `list`, `search`, or `create` over case-insensitive
  `--title` lookups when mutating notes.
- Bound broad reads with `--limit`, `--fields`, `--count`, and specific Bear
  search syntax.
- Use `cat` for raw note content and `show` for structured metadata.
- `--fields all` excludes content; use `--fields all,content` only when the
  note body is needed.
- Use stdin for long or multiline content instead of forcing fragile shell
  escaping through `--content`.
- Use `--no-update-modified` only when the user explicitly wants to preserve the
  note's modification timestamp.
- Locked or encrypted notes may expose metadata but reject content reads.
- Mutating commands should be tied to a direct user request. Read enough current
  state first to identify the target note and preserve title, tags,
  attachments, and concurrent edits.

## Output And Errors

Common output formats:

- `--format json`: structured JSON for all commands, including JSON error
  objects.
- `--format csv`: RFC 4180 CSV with a header row.
- default TSV: tab-separated output with no header.

Useful JSON shapes:

- `list`, `search`, `tags list`, `pin list`, `attachments list`, `search-in`:
  arrays.
- `show`, `create`: one object.
- `cat`: `{"content":"..."}`.
- `--count`: `{"count":N}`.
- mutating commands: `{"ok":true}`.
- errors: `{"error":{"code":"...","message":"..."}}`.

Exit codes are `0` for success, `1` for business errors, and `64` for usage
errors. Empty `list` or `search` results are still success: `[]` in JSON mode.

## Read And Search

Use these commands for retrieval before considering mutation:

```bash
bear list --limit 20 --format json --fields id,title,tags,modified
bear list --tag work --format json --fields id,title,tags,modified
bear search "@today @todo meeting" --limit 20 --format json --fields id,title,tags,matches,modified
bear search --query "- [ ]" --format json --fields id,title,matches
bear show <note-id> --format json --fields id,title,tags,hash,created,modified
bear cat <note-id> --format json
bear search-in <note-id> --string "TODO" --context 120 --format json
```

Bear search supports text terms, exact phrases, negation, tags, dates, created
dates, task status, title-only search, pinned notes, content filters such as
`@images` / `@files` / `@attachments` / `@code`, state filters such as
`@locked`, and link filters such as `@wikilinks` and `@backlinks`. Use
`--query` when the query starts with `-`.

## Create And Edit Notes

Use `create` for new notes. Capture the returned ID for follow-up commands.

```bash
bear create "My Note" --content "Body text" --tags "work,draft" --format json --fields id,title,tags,hash
printf "%s" "$CONTENT" | bear create "My Note" --format json --fields id,title,tags,hash
```

When a title is provided, Bear auto-generates the heading. If `--content` starts
with a matching heading, Bear strips it to avoid duplication. Prefer `--tags`
for tag placement because Bear inserts tags according to the user's Bear
settings.

Use `append` for additive updates:

```bash
bear append <note-id> --content "New paragraph" --format json
printf "%s" "$CONTENT" | bear append <note-id> --position end --format json
bear append --title "Mars" --content "Update" --position beginning --format json
```

Use `edit` only for exact string replacement or insertion. Run `search-in`
first when the target string might be ambiguous.

```bash
bear search-in <note-id> --string "TODO" --format json
bear edit <note-id> --at "TODO" --replace "DONE" --format json
bear edit <note-id> --at "## Notes" --insert "\nNew line" --format json
bear edit <note-id> --at "cat" --replace "dog" --all --word --format json
```

Use `write` only when the user wants to replace the whole note. Preserve the
first heading, tags, and inline attachment references unless the user explicitly
wants them removed. Protect full-note writes with the current `hash` via
`--base`:

```bash
bear show <note-id> --format json --fields hash,content
printf "%s" "$NEW_CONTENT" | bear write <note-id> --base <hash> --format json
```

Without `--base`, `write` is unconditional and can overwrite changes made in
Bear or another client.

## Organize Notes

Tag commands:

```bash
bear tags list --format json
bear tags list <note-id> --format json
bear tags add <note-id> work "work/meetings" --format json
bear tags remove <note-id> draft --format json
bear tags rename --from draft --to published --format json
bear tags delete --name "work/old" --format json
```

`tags rename` and `tags delete` affect all notes. Ask for explicit confirmation
before running them. Use `--force` for tag merges only when the user has approved
the merge.

Pin commands:

```bash
bear pin list --format json
bear pin list <note-id> --format json
bear pin add <note-id> global work --format json
bear pin remove <note-id> global --format json
```

Pin operations are atomic for tag-specific pins: if any target tag does not
exist, no pins are applied or removed.

Location commands:

```bash
bear trash <note-id> --format json
bear archive <note-id> --format json
bear restore <note-id> --format json
```

`trash` is a soft delete, `archive` hides a note from active notes, and
`restore` returns a trashed or archived note to active notes. Identify the note
clearly before moving it.

## Attachments

Use attachment commands when the user asks to inspect, add, export, or delete
files attached to a Bear note:

```bash
bear attachments list <note-id> --format json
bear attachments add <note-id> --filename photo.jpg --format json < photo.jpg
bear attachments save <note-id> --filename photo.jpg > photo.jpg
bear attachments save <note-id> --filename photo.jpg --format json
bear attachments delete <note-id> --filename photo.jpg --format json
```

`attachments save` writes raw bytes to stdout by default; redirect it to a file.
Use JSON mode when the caller needs base64 data instead of a file.

## Open Bear Or Use MCP

Open a note in the Bear app only when the user asks for UI navigation or manual
editing:

```bash
bear open <note-id> --format json
bear open --title "Mars" --header "Moons" --edit --format json
bear open <note-id> --new-window --format json
```

`open` brings Bear to the foreground. Treat it as a visible local side effect.

`bear mcp-server` exposes an MCP server over stdio with tools mirroring the CLI.
Use it only when the user asks to configure an MCP-aware client or a persistent
tool interface; prefer the CLI for one-off Bear tasks.

## Validation

After a mutating command, run a targeted verification:

- `create`: inspect the returned ID with `show` or `cat`.
- `append`, `edit`, `write`: read the changed note or use `search-in` for the
  changed text; for `write`, include the resulting `hash` when useful.
- `tags add/remove`: run `tags list` for the note.
- `tags rename/delete`: run `tags list` globally, and spot-check affected notes
  if the user requested a broad change.
- `pin add/remove`: run `pin list` for the note.
- `trash`, `archive`, `restore`: run `show --fields id,title,location` or a
  bounded `list --location all`.
- `attachments add/delete`: run `attachments list`.
- `attachments save`: verify the destination file exists and has a plausible
  size when saved to disk.

Report the command class used and the observed result. Do not paste full private
note content unless the user asked for the raw content.

## Stop Rules

Stop when the Bear task is complete, the relevant command result has been
validated, and any unperformed broader Bear operations are clearly outside the
request.

If a requested operation would overwrite a full note, merge tags globally, delete
attachments, move notes to trash, or expose a broad set of private notes, narrow
the target and confirmation before running the command.
