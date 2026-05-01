---
name: knowledge-obsidian-attachment-janitor
description: Clean up and organize an Obsidian vault's Attachments folder by planning deletion of unreferenced files and renaming referenced files with date-prefixed, descriptive names. Use when the user mentions cleaning up attachments, finding unused images, organizing files, renaming attachments, or says "附件清理", "整理附件", "清理图片", or "附件重命名". Formerly named obsidian-attachment-janitor.
---

# Obsidian Attachment Janitor

Clean up and organize attachments in the Obsidian vault. Two jobs:

1. Find and delete unreferenced attachments
2. Rename referenced attachments with consistent, searchable names

## Outcome

Success means the user first receives a concrete delete/rename/skip plan, no destructive action happens before explicit confirmation, and any confirmed changes are followed by a scan for broken embeds. Stop after reporting counts and any remaining blockers; leave unrelated vault organization alone.

## Naming convention

```
YYYY-MM-DD description.ext
```

- **Date prefix**: from the referencing note's filename. Extract the `YYYY-MM-DD` portion only (ignore time like `1230` in `2026-03-09 1230 ...`)
- **Description**: short English kebab-case phrase describing what the attachment is, based on the embedding context in the note. Keep it under 5 words.
- **Extension**: preserved from original

When the same note embeds multiple attachments, differentiate by what each one depicts, not by index number. Read the surrounding text to understand each attachment's role.

Example — a blog post note `2026-03-09 1230 让 AI 接管笔记维护.md` embeds 4 images:

| Original | New |
|---|---|
| `Gemini_Generated_Image_5tv8tg5tv8tg5tv8.png` | `2026-03-09 ai-note-maintenance-cover.png` |
| `Gemini_Generated_Image_fdvb4qfdvb4qfdvb.png` | `2026-03-09 agent-system-overview.png` |
| `CleanShot 2026-03-09 at 20.40.27@2x.png` | `2026-03-09 pr-diff-screenshot.png` |
| `CleanShot 2026-03-10 at 23.45.40@2x.png` | `2026-03-10 sentinel-report-screenshot.png` |

Notice the last one uses `2026-03-10` — the date comes from the attachment's own CleanShot timestamp when it differs from the note date and is clearly identifiable. Prefer the note's date when in doubt.

## Workflow

### Step 1: Build reference map

1. List all files in `Attachments/`
2. Search all `.md` files for `![[filename]]` embeds
   - **Exclude** `.agents/skills/` — documentation examples, not real references
   - Strip parameters: `![[file.png|300]]` → `file.png`, `![[file.png|alt text]]` → `file.png`
3. Result: a map of `attachment filename → [referencing note paths]`

### Step 2: Classify

- **Unreferenced**: zero references → candidate for deletion
- **Referenced, datable**: referencing note has `YYYY-MM-DD` in filename → candidate for rename
- **Referenced, undatable**: referencing note has no date prefix (e.g., `Private/Career/Portfolio/` notes) → skip rename, keep as-is

### Step 3: Generate rename plan

For each datable attachment:

1. Read the referencing note to understand the embedding context
2. Extract `YYYY-MM-DD` from the note filename
3. Generate a descriptive English kebab-case name
4. Check for naming collisions — if two files would get the same name, make descriptions more specific rather than adding numbers

Skip if the attachment already matches the convention.

### Step 4: Present plan

Show the user three lists:

1. **Delete** — unreferenced attachments with file sizes
2. **Rename** — `current name → new name` with the referencing note for context
3. **Skip** — attachments kept as-is with reason (undatable, already named well, etc.)

**Wait for explicit user confirmation before executing anything.**

### Step 5: Execute

Use the Obsidian CLI for both operations — it handles reference updates automatically.

For deletions:
```bash
obsidian delete path="Attachments/filename.png" permanent
```

For renames:
```bash
obsidian rename path="Attachments/old-name.png" name="new-name.png"
```

**Always use `path=` instead of `file=`** — the `file=` parameter resolves like a wikilink and fails on filenames with special characters (spaces, `@`, underscores, hashes).

### Step 6: Verify

Run a quick scan to confirm no broken embed references were introduced. Report summary: X deleted, Y renamed, Z skipped.
