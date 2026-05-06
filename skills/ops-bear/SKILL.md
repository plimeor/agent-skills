---
name: ops-bear
description: >-
  Use Bear App's local `bear` / `bearcli` command-line interface to read, search, create, append, edit, overwrite, tag, pin, archive, trash, restore, open, or manage attachments for Bear notes on this Mac. Use whenever the user mentions Bear App, Bear notes, Bear CLI, `bear`, `bearcli`, `bear help`, the local Bear database, Bear tags, pins, attachments, note capture, updating/retrieving notes from Bear, Bear MCP server setup, or checking this skill against current local CLI behavior. Do not use for Obsidian, generic Markdown files, web articles, or cloud note services; use the relevant local skill or tool instead.
---

# Bear CLI

## Goal

Use Bear's local CLI to operate on Bear notes while preserving note data and making mutations auditable.

The CLI reads and writes the local Bear database in place. Treat Bear content as private local user data: retrieve only the fields needed for the request, avoid broad dumps, and verify mutations with the smallest useful follow-up read.

If the user asks whether this skill is still accurate, or asks to update the skill against the local CLI, follow [evaluate.md](evaluate.md).

## Compatibility

Requires Bear App installed on macOS. Prefer invoking `bear`; the underlying binary may be named `bearcli`.

If the user has asked to use Bear and `bear` is not on `PATH`, make the bundled CLI discoverable when Bear is installed:

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

If neither `bear` nor `/Applications/Bear.app/Contents/MacOS/bearcli` exists, report that Bear CLI is unavailable and stop unless the user wants installation help.

## Start Bear First

Before any Bear CLI command or `bear mcp-server` operation, make sure the Bear app is running. The CLI operates on Bear's local database; running it while the app is closed can leave the agent working against stale local state and increase the risk of note version conflicts.

Use a background launch so ordinary CLI tasks do not unexpectedly steal focus:

```bash
if ! pgrep -x Bear >/dev/null; then
  open -g -a Bear
  for _ in 1 2 3 4 5 6 7 8 9 10; do
    pgrep -x Bear >/dev/null && break
    sleep 0.5
  done
fi
pgrep -x Bear >/dev/null
```

If Bear cannot be launched or the process check still fails, report that Bear is not running and stop before reading or mutating notes.

## Load Bear AGENTS Context

Before reading any requested file, note, or attachment content through this skill, first try to find and read an `AGENTS` note in Bear. Treat it as local operating context for the requested read. If no relevant `AGENTS` note is found, continue with the user's requested read.

```bash
bear search AGENTS --limit 10 --format json --fields id,title,tags,modified
bear cat <agents-note-id> --format json
```

Prefer an exact `AGENTS` title match when the search returns multiple notes. If there is no exact match, use the closest project- or task-relevant `AGENTS` note only when its title or tags make that relevance clear.

## Operating Rules

- Prefer `--format json` for read commands when output will be parsed, summarized, or used by another command. Default TSV has no header.
- Do not add `--format json` to mutating commands. They are silent on success and use the exit code as the success signal.
- Prefer note IDs from `list`, `search`, or `create` over case-insensitive `--title` lookups when mutating notes.
- Bound broad reads with `--limit`, `--fields`, `--count`, and specific Bear search syntax.
- Use `cat` for raw note content and `show` for structured metadata.
- `--fields all` excludes content; use `--fields all,content` only when the note body is needed.
- Use stdin for long or multiline content instead of forcing fragile shell escaping through `--content`.
- Use `--no-update-modified` only when the user explicitly wants to preserve the note's modification timestamp.
- Locked or encrypted notes may expose metadata but reject content reads.
- Mutating commands should be tied to a direct user request. Read enough current state first to identify the target note and preserve title, tags, attachments, and concurrent edits.

## Output And Errors

Common read output formats:

- `--format json`: structured JSON for read commands and JSON error objects.
- `--format csv`: RFC 4180 CSV with a header row.
- default TSV: tab-separated output with no header.

Useful JSON shapes:

- `list`, `search`, `tags list`, `pin list`, `attachments list`, `search-in`: arrays.
- `show`, `create`: one object.
- `cat`: `{"content":"..."}`.
- `--count`: `{"count":N}`.
- errors from commands that accept `--format json`: `{"error":{"code":"...","message":"..."}}`.

Mutating commands such as `append`, `edit`, `overwrite`, `archive`, `restore`, `trash`, `open`, `tags add/remove/rename/delete`, `pin add/remove`, and `attachments add/delete` produce no stdout on success and do not accept `--format`.

Exit codes are `0` for success, `1` for business errors, and `64` for usage errors. Empty `list` or `search` results are still success: `[]` in JSON mode.

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

Bear search supports text terms, exact phrases, negation, tags, dates, created dates, task status, title-only search, pinned notes, content filters such as `@images` / `@files` / `@attachments` / `@code`, state filters such as `@locked`, and link filters such as `@wikilinks` and `@backlinks`. Use `--query` when the query starts with `-`.

## Create And Edit Notes

Use `create` for new notes. Capture the returned ID for follow-up commands.

```bash
bear create "My Note" --content "Body text" --tags "work,draft" --format json --fields id,title,tags,hash
printf "%s" "$CONTENT" | bear create "My Note" --format json --fields id,title,tags,hash
```

When a title is provided, Bear auto-generates the heading. If `--content` starts with a matching heading, Bear strips it to avoid duplication. Prefer `--tags` for tag placement because Bear inserts tags according to the user's Bear settings.

Use `append` for additive updates:

```bash
bear append <note-id> --content "New paragraph"
printf "%s" "$CONTENT" | bear append <note-id> --position end
bear append --title "Mars" --content "Update" --position beginning
```

Use `edit` only for exact string replacement or insertion. Run `search-in` first when the target string might be ambiguous.

```bash
bear search-in <note-id> --string "TODO" --format json
bear edit <note-id> --find "TODO" --replace "DONE"
bear edit <note-id> --find "## Notes" --insert-after "\nNew line"
bear edit <note-id> --find "## Notes" --insert-before "Intro paragraph\n\n"
bear edit <note-id> --find "cat" --replace "dog" --all --word
```

Use `overwrite` only when the user wants to replace the whole note. Preserve the first heading, tags, and inline attachment references unless the user explicitly wants them removed. Protect full-note writes with the current `hash` via `--base`:

```bash
bear show <note-id> --format json --fields hash,content
printf "%s" "$NEW_CONTENT" | bear overwrite <note-id> --base <hash>
```

Without `--base`, `overwrite` is unconditional and can overwrite changes made in Bear or another client. Use `--force` only after the user explicitly approves removing attachments that the safety gate reports would be dropped.

## Organize Notes

Tag commands:

```bash
bear tags list --format json
bear tags list <note-id> --format json
bear tags add <note-id> work "work/meetings"
bear tags remove <note-id> draft
bear tags rename --from draft --to published
bear tags delete --name "work/old"
```

`tags rename` and `tags delete` affect all notes. Ask for explicit confirmation before running them. Use `--force` for tag merges only when the user has approved the merge.

Pin commands:

```bash
bear pin list --format json
bear pin list <note-id> --format json
bear pin add <note-id> global work
bear pin remove <note-id> global
```

Pin operations are atomic for tag-specific pins: if any target tag does not exist, no pins are applied or removed.

Location commands:

```bash
bear trash <note-id>
bear archive <note-id>
bear restore <note-id>
```

`trash` is a soft delete, `archive` hides a note from active notes, and `restore` returns a trashed or archived note to active notes. Identify the note clearly before moving it.

## Attachments

Use attachment commands when the user asks to inspect, add, export, or delete files attached to a Bear note:

```bash
bear attachments list <note-id> --format json
bear attachments add <note-id> --filename photo.jpg < photo.jpg
bear attachments save <note-id> --filename photo.jpg > photo.jpg
bear attachments save <note-id> --filename photo.jpg --format json
bear attachments delete <note-id> --filename photo.jpg
```

`attachments save` writes raw bytes to stdout by default; redirect it to a file. Use JSON mode when the caller needs base64 data instead of a file.

## Open Bear Or Use MCP

Open a note in the Bear app only when the user asks for UI navigation or manual editing:

```bash
bear open <note-id>
bear open --title "Mars" --header "Moons" --edit
bear open <note-id> --new-window
```

`open` brings Bear to the foreground. Treat it as a visible local side effect.

`bear mcp-server` exposes an MCP server over stdio with tools mirroring the CLI. Use it only when the user asks to configure an MCP-aware client or a persistent tool interface; prefer the CLI for one-off Bear tasks.

## Validation

After a mutating command, run a targeted verification:

- `create`: inspect the returned ID with `show` or `cat`.
- `append`, `edit`, `overwrite`: read the changed note or use `search-in` for the changed text; for `overwrite`, include the resulting `hash` when useful.
- `tags add/remove`: run `tags list` for the note.
- `tags rename/delete`: run `tags list` globally, and spot-check affected notes if the user requested a broad change.
- `pin add/remove`: run `pin list` for the note.
- `trash`, `archive`, `restore`: run `show --fields id,title,location` or a bounded `list --location all`.
- `attachments add/delete`: run `attachments list`.
- `attachments save`: verify the destination file exists and has a plausible size when saved to disk.

Report the command class used and the observed result. Do not paste full private note content unless the user asked for the raw content.

## Stop Rules

Stop when the Bear task is complete, the relevant command result has been validated, and any unperformed broader Bear operations are clearly outside the request.

If a requested operation would overwrite a full note, merge tags globally, delete attachments, move notes to trash, or expose a broad set of private notes, narrow the target and confirmation before running the command.
