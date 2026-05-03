---
name: knowledge-obsidian-attachment-janitor
description: >-
  Plan and safely execute cleanup of an Obsidian vault's Attachments folder:
  identify unreferenced attachments for deletion, rename referenced attachments
  to date-prefixed descriptive filenames, and verify embeds after confirmed
  changes. Use when the user mentions attachment cleanup, unused images,
  Obsidian attachments, renaming attachments, "附件清理", "整理附件", "清理图片",
  or "附件重命名". Requires an explicit delete/rename plan before any destructive
  action. Formerly named obsidian-attachment-janitor.
---

# Obsidian Attachment Janitor

## Goal

Clean up and organize files in an Obsidian vault's `Attachments/` folder without
breaking embeds or touching unrelated vault content.

## Success Criteria

A good result:

- Produces a concrete `Delete / Rename / Skip` plan before any destructive
  action.
- Deletes only attachments with no detected reference form.
- Renames only attachments with enough evidence for a date and a short
  descriptive filename.
- Waits for explicit user confirmation before deleting or renaming.
- Verifies confirmed changes by scanning for broken embeds and reports counts
  and blockers.

## Constraints

Treat deletion and rename as destructive or externally visible vault changes.
Do not delete or rename files before explicit confirmation.

Leave unrelated vault organization, note content, frontmatter, and
non-attachment files alone. If reference status, date, or description is
uncertain, put the item in `Skip`.

Use `path=` for Obsidian CLI operations; do not use `file=`. The `file=`
parameter resolves like a wikilink and fails on filenames with special
characters such as spaces, `@`, underscores, or hashes.

## Naming Convention

```text
YYYY-MM-DD description.ext
```

- **Date prefix**: use the referencing note's `YYYY-MM-DD` filename prefix.
  Ignore time suffixes like `1230` in `2026-03-09 1230 ...`.
- **Description**: use a short English kebab-case phrase based on the embedding
  context. Keep it under five words.
- **Extension**: preserve the original extension.

When the same note embeds multiple attachments, differentiate by what each one
depicts, not by index number. Use the attachment timestamp only when the filename
contains a clear `YYYY-MM-DD` timestamp and it conflicts with the note date;
otherwise use the referencing note date.

Example: a note named `2026-03-09 1230 让 AI 接管笔记维护.md` embeds four
images.

| Original | New |
|---|---|
| `Gemini_Generated_Image_5tv8tg5tv8tg5tv8.png` | `2026-03-09 ai-note-maintenance-cover.png` |
| `Gemini_Generated_Image_fdvb4qfdvb4qfdvb.png` | `2026-03-09 agent-system-overview.png` |
| `CleanShot 2026-03-09 at 20.40.27@2x.png` | `2026-03-09 pr-diff-screenshot.png` |
| `CleanShot 2026-03-10 at 23.45.40@2x.png` | `2026-03-10 sentinel-report-screenshot.png` |

## Evidence Budget

First scan all attachment filenames and Markdown references in the vault.
Include Obsidian embeds, Markdown image links, normal Markdown links, URL-encoded
paths, and raw filename/path mentions when checking whether an attachment is
referenced. Exclude `.agents/skills/` documentation examples.

For rename descriptions, read the embed line, surrounding paragraph, and nearest
heading first. Read the full referencing note only when local context is
insufficient. Do not inspect unrelated notes once reference status and rename
context are sufficient.

## Planning Rules

Build three lists:

1. `Delete`: attachments with no detected reference form. Include path, size, and
   evidence reason.
2. `Rename`: referenced attachments with a reliable date and description. Include
   old path, new name, referencing note, and evidence phrase.
3. `Skip`: attachments kept as-is. Include path and reason, such as undatable,
   already named well, multiple conflicting references, unclear reference status,
   or insufficient context.

For multiple references, prefer the most specific embedding context. If dates or
ownership conflict, skip unless one source clearly owns the attachment. If two
files would receive the same name, make descriptions more specific rather than
adding index numbers.

## Execution Rules

Wait for explicit user confirmation before executing anything.

Use the Obsidian CLI for confirmed operations because it updates references:

```bash
obsidian delete path="Attachments/filename.png" permanent
obsidian rename path="Attachments/old-name.png" name="new-name.png"
```

Before execution, confirm the CLI is available, the target vault is correct, and
the command paths match the approved plan.

## Output

Before execution, show:

- `Delete`: path, size, evidence reason
- `Rename`: old path, new name, referencing note, evidence phrase
- `Skip`: path, reason

After execution, report deleted count, renamed count, skipped count, and broken
embed scan result.

## Stop Rules

Stop after the plan is delivered and wait for confirmation. After confirmed
changes, stop after verification and the summary report. Do not continue into
broader vault cleanup, note rewriting, metadata repair, or attachment taxonomy
work unless the user explicitly asks.
