# english-coach

Claude Code plugin: every time you submit a prompt, the English you should have
written (with up to 3 short notes) is shown to you before Claude starts
responding. English prompts are copy-edited; prompts in any other language are
translated into the natural English prompt you should have sent. The suggestion
is **display-only** — it is delivered via the hook `systemMessage` field, which
the model never sees, so it adds zero tokens to your conversation context.

## How it works

- `hooks/hooks.json` registers a `UserPromptSubmit` hook running
  `scripts/improve-prompt.ts` (Bun).
- The script skips non-candidates instantly: prompts longer than 2000 chars,
  slash/bash/memory input (`/` `!` `#`), English prompts shorter than 15 chars,
  with fewer than 4 words, or mostly non-letter content (pasted code, logs,
  IDs). Non-English input (3+ non-ASCII letters) is let through down to 5 chars.
- For candidates it runs a one-shot nested `claude -p` (model `haiku` by
  default) with a coach system prompt, then emits `{"systemMessage": ...}`. The
  model detects the language and either copy-edits (English) or translates (any
  other language) — nothing is tied to one source language. The user prompt is
  wrapped in `<prompt-to-edit>` tags and treated as data, so instructions inside
  it are not executed.
- The nested call runs in an empty temp workdir (`$TMPDIR/english-coach-workdir`)
  so it never inherits the current project's CLAUDE.md, AGENTS.md, or
  auto-memory — that context made startup slow enough to blow the hook timeout.
- For English input, if it is already good (`ALREADY_GOOD`) or the nested call
  fails, the hook stays silent. Translations always show (there is no
  `ALREADY_GOOD` for them).
- On English input the coach makes minimal edits — real errors and clearly
  unnatural phrasing only, watching high-frequency learner errors (tense,
  agreement, articles, plurals, countability). On non-English input it writes
  the idiomatic English a fluent developer would send. Either way it orders
  notes by learning value. A deterministic backstop suppresses English rewrites
  that differ from the original only in punctuation, casing, or whitespace;
  translations never match it, so they are never suppressed.

## Latency and cost

The hook is synchronous: expect roughly 5–10 s before Claude starts on each
coached prompt (API congestion can occasionally push this higher). Each
improvement is one small haiku call billed to your Claude account/limits.
Hook timeout is 60 s; on timeout the prompt proceeds without a suggestion.

The nested call sets `"alwaysThinkingEnabled": false` — haiku's default
thinking added ~20 s per call. Without thinking haiku needs the format
locked hard, which is why the system prompt carries a worked example; edit
it carefully.

## Requirements

- [Bun](https://bun.sh) on `PATH` — the hook script runs via `#!/usr/bin/env bun`.
  Claude Code does not ship a runtime for hooks; they execute in your shell
  environment, so the hook fails on machines without Bun.
- `claude` CLI logged in (the nested improvement call reuses your auth).

## Configuration

- `ENGLISH_COACH_MODEL` — model for the nested call (default `haiku`).

## Recursion guards

The nested call sets `ENGLISH_COACH_NESTED=1` (the hook exits early when it
is present) and passes `disableAllHooks` in `--settings`. Do not use `--bare`
instead: bare mode never reads OAuth/keychain credentials — it only accepts
`ANTHROPIC_API_KEY` or an `apiKeyHelper` that returns a real API key, and a
subscription OAuth token is rejected ("Invalid API key").

## Install / uninstall

Distributed via the `plimeor` plugin marketplace in the agent-skills repo:

```bash
claude plugin marketplace add plimeor/agent-skills
claude plugin install english-coach@plimeor
```

Installs are copied into `~/.claude/plugins/cache/`, so repo edits do not
apply until `claude plugin update english-coach@plimeor`. For local development, add
the marketplace from a checkout (`claude plugin marketplace add
~/Documents/agent-skills`) so updates pull local changes without pushing.

Disable with `claude plugin disable english-coach`; remove with
`claude plugin uninstall english-coach`.
