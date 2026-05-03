---
name: ops-codex-session-maintenance
description: >-
  Maintain local Codex Desktop/App state when Codex feels slow, session history
  is heavy, logs or worktrees are large, or the user asks to inspect, archive,
  clean up, rotate, hand off, reset, or speed up Codex sessions. Use for
  inspect-first, backup-first local state maintenance: measure hotspots, create
  handoffs for useful long sessions, archive stale sessions/worktrees, rotate old
  logs, prune clearly dead project paths only after backup and confirmation, and
  report concrete verification. Do not use for application code performance,
  model prompt tuning, live conversation compaction, process killing, automation
  scheduling unless requested, or deleting user data.
---

# Codex Session Maintenance

## Goal

Keep local Codex state lightweight, recoverable, and explainable.

The operating model:

- Chats are for execution.
- Handoff docs are for reusable memory.
- Archives are for history.
- Fresh threads are for speed.

## Success Criteria

A good maintenance pass:

- Identifies the main local hot spots before proposing cleanup.
- Leaves live, current, pinned, dirty, ambiguous, and user-data state untouched
  unless the user explicitly confirms a safe action.
- Creates backups or manifests before any confirmed mutation.
- Produces handoff docs before archiving useful long sessions.
- Verifies completed actions with exact commands or checks.
- Reports what changed, what was not touched, and what residual risk remains.

## Hard Constraints

Treat local Codex state as user data.

For `inspect`, never mutate files. For `cleanup`, first report proposed actions
and get confirmation.

If Codex is running, inspect only. Do cleanup after the app is closed so local
state and databases are not touched from two places.

Never delete sessions, logs, worktrees, config, databases, memories, skills,
plugins, or automations unless the user explicitly asks for deletion after a
backup exists.

Do not archive pinned, current, recent, useful-without-handoff, or ambiguous
sessions. Do not move dirty or externally registered git worktrees unless the
user confirms the exact worktree and safe move method.

## Modes

- `inspect`: run inventory, report hot spots, and stop.
- `cleanup`: inspect, propose actions, confirm Codex is closed, create backup or
  manifest, execute confirmed moves only, then verify.
- `handoff`: identify useful long sessions, create handoff docs and starter
  prompts, then ask before archiving.
- `automation`: design the repeatable maintenance contract only; do not schedule
  anything until the user confirms.

## Evidence Budget

Start with one broad inventory:

- `$CODEX_HOME`, falling back to `~/.codex` when unset
- top-level size inventory
- process list for Codex and common dev servers
- session, archive, worktree, log, config, memory, skill, plugin, and automation
  paths

Deep-dive only into the top hot spots or paths above obvious thresholds. Read
metadata first: path, size, modified time, git status, manifest/config
parseability, and database integrity when relevant.

Do not read session JSONL contents unless creating a handoff. Search again only
when a proposed mutation depends on missing facts, paths conflict, state looks
ambiguous, or the user asks for comprehensive cleanup.

## Useful Checks

```bash
CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
du -sh "$CODEX_HOME"/* 2>/dev/null | sort -h
find "$CODEX_HOME/sessions" -type f -name '*.jsonl' -size +10M -print 2>/dev/null
find "$CODEX_HOME/log" -type f -size +50M -print 2>/dev/null
find "$CODEX_HOME/worktrees" -mindepth 1 -maxdepth 1 -type d -mtime +10 -print 2>/dev/null
ps aux | rg -i '[c]odex'
ps aux | rg -i 'node|bun|vite|next|webpack|tsx'
```

Do not kill processes automatically. Report candidates with command, PID, age,
and why they look relevant.

Common directories:

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

On Windows, watch for duplicate path forms such as `C:\...` and `\\?\C:\...`.
Normalize only when you can prove both forms refer to the same location.

## Cleanup Policy

Prefer archiving or rotating over deleting. Back up important files before
cleanup.

Create a timestamped backup outside the active state tree, for example:

```text
~/.codex-maintenance/backups/YYYYMMDD-HHMMSS/
```

Back up small important state before changing anything: config files, global
state or session indexes, local databases, memories, skills, plugins,
automations, and manifests that map sessions, projects, or worktrees.

For large session files or worktrees, a manifest plus archive move is usually
better than a duplicate copy. The manifest should include original path, size,
modified time, and planned destination.

If a database is present and `sqlite3` is available, verify it before and after:

```bash
sqlite3 path/to/state.sqlite 'PRAGMA integrity_check;'
```

Stop if the database cannot be opened or the integrity check fails.

Propose pruning clearly dead project paths only after backup. Execute config
changes only after confirmation. Preserve unknown entries and report them
instead of guessing.

## Handoff Docs

Before archiving a long session that still matters, create a concise handoff:

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

Preserve decisions, current state, evidence, and the next prompt. Do not turn
handoffs into transcripts.

## Archive Candidates

Sessions from the last 7-10 days are usually too recent to archive, but age is
only a heuristic. Keep pinned, current, ambiguous, or useful sessions. Archive
old non-pinned sessions only by moving them to the archived-session location and
recording the original path in a manifest. Do not edit session JSONL contents as
a cleanup tactic.

For worktrees, inspect each candidate with `git status --short` when it is a git
repository. Keep dirty worktrees unless the user confirms a specific archive
action. If a directory is a registered git worktree, prefer the repository's safe
worktree move mechanism; stop if you cannot verify it.

For logs, rotate oversized old logs by moving them to an archive folder. Leave
the active log path available so Codex can recreate fresh logs. Do not truncate a
log while Codex is running.

## Validation

For `inspect`, report commands and observed sizes/processes, and state that no
files changed.

For `cleanup`, verify backup exists, manifest entries match moved paths, config
parses if config changed, databases open if touched or nearby, dirty worktrees
were not moved, and before/after sizes or counts changed as expected.

For `handoff`, verify the handoff file exists and includes `Goal`, `Current
State`, and `Restart Prompt`.

For `automation`, do not claim scheduling verification unless the user approved
scheduling and it actually happened.

## Output

Report in this shape:

```markdown
## Codex Session Maintenance

Mode:
- [inspect / cleanup / handoff / automation]

Observed hot spots:
- [path] - [size / age / reason]

Proposed actions:
- [only for actions not yet confirmed]

Completed actions:
- [what was archived, rotated, pruned, or left unchanged]

Not touched:
- [live, pinned, dirty, ambiguous, or out-of-scope state]

Backups and manifests:
- [backup path, manifest path, or "not created because this was inspect-only"]

Verification:
- [commands/checks actually run and results]

Residual risk:
- [anything left for the user to decide]
```

## Stop Rules

Stop and ask for confirmation when Codex is running and the next step would
mutate local state; a candidate session appears pinned, current, or important but
lacks a handoff; a worktree is dirty or externally registered; a database
integrity check fails; cleanup would delete rather than archive; or the target
Codex state directory cannot be identified confidently.
