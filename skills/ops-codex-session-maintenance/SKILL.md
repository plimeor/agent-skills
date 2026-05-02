---
name: ops-codex-session-maintenance
description: >-
  Optimize and maintain local Codex sessions when Codex Desktop or the Codex app
  feels slow, session history is heavy, logs or worktrees are large, or the user
  asks to clean up, archive, speed up, reset, or keep Codex sessions healthy. Use
  this skill for inspect-first maintenance: backup important state, create handoff
  docs, archive old sessions and worktrees, rotate logs, prune dead project paths,
  and verify local Codex state. Do not use for code performance optimization,
  model prompt tuning, or deleting user data.
---

# Purpose

Keep Codex responsive by keeping active local state small without losing
recoverability.

The operating model:

- Chats are for execution.
- Handoff docs are for reusable memory.
- Archives are for history.
- Fresh threads are for speed.

# Safety Invariants

- Treat local Codex state as user data.
- Inspect before changing anything. Report the hot spots and proposed action
  before moving files.
- If Codex is running, inspect only. Do cleanup after the app is closed so local
  state and databases are not being touched from two places.
- Back up important files before cleanup.
- Prefer archiving or rotating over deleting.
- Never delete sessions, logs, worktrees, config, databases, memories, skills,
  plugins, or automations unless the user explicitly asks for deletion after a
  backup exists.
- Do not archive pinned, current, recent, or ambiguous sessions.
- Do not move dirty or externally registered git worktrees unless the user
  confirms the exact worktree and the move method is safe.

# Default Scope

Do:

1. Locate Codex local state.
2. Measure what is actually large.
3. Back up important state.
4. Create handoff docs for still-useful long sessions.
5. Archive stale sessions and worktrees.
6. Rotate large old logs.
7. Prune config entries that point to paths that no longer exist.
8. Verify the result and report what changed.

Do not automatically:

- Create a weekly script or automation unless the user asks for automation.
- Rewrite global rules, prompts, skills, or memories.
- Compact live conversations by editing their contents.
- Kill background processes. Identify heavy processes and let the user decide.

# Workflow

## 1. Define The Maintenance Mode

Classify the request before touching files:

- `inspect`: The user asks what is slow, heavy, or taking space.
- `cleanup`: The user asks to clean up, archive, speed up, optimize, or make
  Codex faster.
- `handoff`: The user wants to restart long sessions in fresh chats.
- `automation`: The user asks for recurring weekly maintenance.

For `inspect`, stop after the report. For `cleanup`, continue only after backup
and after confirming Codex is not running. For `handoff`, create docs and starter
prompts before archiving any useful session. For `automation`, first design the
repeatable maintenance contract; do not schedule it until the user confirms.

## 2. Locate Local State

Prefer discovered paths over hard-coded assumptions.

Check:

- `$CODEX_HOME`, falling back to `~/.codex` when unset.
- Session and archived-session directories.
- Worktree and archived-worktree directories.
- Logs.
- Config files.
- Local state databases such as `*.db`, `*.sqlite`, or `*.sqlite3`.
- Memories, skills, plugins, and automations.

Common directories include:

```text
$CODEX_HOME/sessions
$CODEX_HOME/archived_sessions
$CODEX_HOME/worktrees
$CODEX_HOME/archived_worktrees
$CODEX_HOME/log
$CODEX_HOME/memories
$CODEX_HOME/skills
$CODEX_HOME/plugins
$CODEX_HOME/automations
```

On Windows, also watch for duplicate path forms such as normal `C:\...` paths
and extended `\\?\C:\...` paths. Normalize only when you can prove both forms
refer to the same location.

## 3. Inspect Hot Spots

Measure before proposing cleanup.

Useful checks:

```bash
CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
du -sh "$CODEX_HOME"/* 2>/dev/null | sort -h
find "$CODEX_HOME/sessions" -type f -name '*.jsonl' -size +10M -print 2>/dev/null
find "$CODEX_HOME/log" -type f -size +50M -print 2>/dev/null
find "$CODEX_HOME/worktrees" -mindepth 1 -maxdepth 1 -type d -mtime +10 -print 2>/dev/null
```

Also inspect running processes:

```bash
ps aux | rg -i '[c]odex'
ps aux | rg -i 'node|bun|vite|next|webpack|tsx'
```

Do not kill processes automatically. Report candidates with command, PID, age,
and why they look relevant.

## 4. Back Up First

Create a timestamped backup outside the hot active state tree, for example:

```text
~/.codex-maintenance/backups/YYYYMMDD-HHMMSS/
```

Back up small but important state before changing anything:

- Config files.
- Global state or session indexes.
- Local state databases.
- Memories.
- Skills.
- Plugins.
- Automations.
- Any manifest that maps sessions, projects, or worktrees.

For large session files or worktrees, a manifest plus archive move is usually
better than a full duplicate copy. The manifest should include original path,
size, modified time, and planned destination.

If a database is present and `sqlite3` is available, verify it before and after:

```bash
sqlite3 path/to/state.sqlite 'PRAGMA integrity_check;'
```

Stop if the database cannot be opened or the integrity check fails.

## 5. Create Handoff Docs

Before archiving a long session that still matters, create a handoff document.

Use this structure:

```markdown
# Codex Handoff: [short task name]

## Goal
- [What this session was trying to accomplish]

## Current State
- [What is done]
- [What remains]

## Decisions
- [Stable decisions worth preserving]

## Files And Artifacts
- [Important paths, branches, PRs, docs, or generated outputs]

## Commands And Results
- [Commands that matter and their observed results]

## Risks Or Blockers
- [Anything the next session must not miss]

## Restart Prompt
[A ready-to-paste prompt for a fresh Codex session]
```

Keep handoffs concise. Do not turn them into transcripts. Preserve decisions,
current state, evidence, and the next prompt.

## 6. Archive Stale State

Sessions:

- Keep sessions from the last 7-10 days by default.
- Keep pinned, current, or ambiguous sessions.
- Archive old non-pinned sessions by moving them to the archived-session
  location and recording the original path in a manifest.
- Do not edit session JSONL contents as a cleanup tactic.

Worktrees:

- Inspect each candidate with `git status --short` when it is a git repository.
- Keep dirty worktrees unless the user confirms a specific archive action.
- If a directory is a registered git worktree, prefer the repository's safe
  worktree move mechanism. If you cannot verify that, stop and ask.
- Archive stale clean Codex worktrees by moving them to the archived-worktree
  location and recording a manifest entry.

Logs:

- Rotate oversized old logs by moving them to an archive folder.
- Leave the active log path available so Codex can recreate fresh logs.
- Do not truncate a log file while Codex is running.

Config:

- Remove project paths only when the path clearly no longer exists and the
  config was backed up.
- Preserve unknown entries and report them instead of guessing.

## 7. Verify

After cleanup, verify:

- Config still parses.
- State databases still open.
- Active session size dropped.
- Archived session count or size increased by the expected amount.
- Large logs were moved and Codex can recreate fresh logs.
- No broken or duplicate project paths remain in the cleaned config.
- Dirty worktrees were not moved accidentally.

Report exact commands that were run and their observed results. Never claim a
test, parse check, database check, or size reduction that was not actually run.

# Output Contract

When this skill triggers, report in this shape:

```markdown
## Codex Session Maintenance

Mode:
- [inspect / cleanup / handoff / automation]

Observed hot spots:
- [path] - [size / age / reason]

Backups:
- [backup path or "not created because this was inspect-only"]

Actions:
- [what was archived, rotated, pruned, or left unchanged]

Verification:
- [commands/checks actually run and results]

Residual risk:
- [anything left for the user to decide]
```

# Stop Rules

Stop and ask for confirmation when:

- Codex is running and the next step would mutate local state.
- A candidate session appears pinned, current, or important but lacks a handoff.
- A worktree is dirty or appears to be registered externally.
- A database integrity check fails.
- The cleanup would delete rather than archive.
- The target Codex state directory cannot be identified confidently.
