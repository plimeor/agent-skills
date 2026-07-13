# english-coach

Claude Code plugin: every time you submit an English prompt, an improved
version (with up to 3 short notes on the fixes) is shown to you before Claude
starts responding. The improved prompt is **display-only** — it is delivered
via the hook `systemMessage` field, which the model never sees, so it adds
zero tokens to your conversation context.

## How it works

- `hooks/hooks.json` registers a `UserPromptSubmit` hook running
  `scripts/improve-prompt.ts` (Bun).
- The script skips non-candidates instantly: prompts shorter than 15 chars or
  longer than 2000, slash/bash/memory input (`/` `!` `#`), prompts containing
  CJK characters, fewer than 4 words, or mostly non-letter content.
- For English prompts it runs a one-shot nested `claude -p` (model `haiku` by
  default) with a copy-editor system prompt, then emits
  `{"systemMessage": ...}`. The user prompt is wrapped in `<prompt-to-edit>`
  tags and treated as data, so instructions inside it are not executed.
- The nested call runs in an empty temp workdir (`$TMPDIR/english-coach-workdir`)
  so it never inherits the current project's CLAUDE.md, AGENTS.md, or
  auto-memory — that context made startup slow enough to blow the hook timeout.
- If the English is already good (`ALREADY_GOOD`) or the nested call fails,
  the hook stays silent.
- The coach makes minimal edits — real errors and clearly unnatural phrasing
  only, watching the high-frequency errors of Chinese native speakers (tense,
  agreement, articles, plurals, countability) — and orders notes by learning
  value. A deterministic backstop in the script suppresses rewrites that
  differ from the original only in punctuation, casing, or whitespace.

## Latency and cost

The hook is synchronous: expect roughly 5–10 s before Claude starts on each
English prompt (API congestion can occasionally push this higher). Each
improvement is one small haiku call billed to your Claude account/limits.
Hook timeout is 60 s; on timeout the prompt proceeds without a suggestion.

The nested call sets `"alwaysThinkingEnabled": false` — haiku's default
thinking added ~20 s per call. Without thinking haiku needs the format
locked hard, which is why the system prompt carries a worked example; edit
it carefully.

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
