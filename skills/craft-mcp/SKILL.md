---
name: craft-mcp
description: Correct, call-efficient use of the Craft MCP tools (craft_read/craft_write). Use whenever a task touches a Craft space — reading, searching, creating, editing, or organizing Craft documents, notes, daily notes, tasks, or links — and especially when asked to find references/backlinks between notes or when an operation looks like it needs many MCP calls. Not for other note apps (Obsidian, Bear, Notion) or local markdown files.
---

# Craft MCP

Craft MCP is two CLI-style tools — `craft_read` and `craft_write`, each running `cmd1; cmd2; ...` batches in a single call — plus `blocks_revert` for undo. You can get correct results from them without this skill; what it encodes is what live experiments revealed and the tool descriptions don't: where calls get wasted, which parts of a response to trust, and which capabilities only exist behind the JSON payload format. Claims here are experiment-verified unless marked otherwise.

## Call discipline

Every MCP call is metered and rate-limited; commands inside a call are nearly free. Plan the call graph before touching the tools — which IDs you hold, which you must fetch, which commands are independent — then batch the independent ones.

Batches run sequentially and are not transactional: execution stops at the first failing command and earlier commands stay applied. Order dependent writes accordingly (e.g. delete a folder's documents before the folder) and recover by re-issuing only the remainder. Transient transport errors occur even on valid batches — retry the same batch once before splitting it. If rate-limited, consolidate and back off; limit specifics are unpublished.

Four patterns waste calls and are never needed:

- paging `documents list` to find a title — `search` resolves titles in one call
- one-command-per-call loops over batchable items
- re-reading a document to verify your own write — the write response already carries the diff
- verifying fresh writes through `search` — the index lags by minutes

## IDs

Documents are addressed by **rootBlockId**; the documentId inside a Craft URL is a different ID that fails with "Block not found". `documents resolve-link <url>` converts. `blocks get` accepts any block ID, not just roots — fetch the one block you need. Same-title duplicates are common in imported spaces, some of them empty stubs: before editing "the" document with a title, disambiguate by Modified timestamp and a content probe — a read returning only `<pageTitle>` is the stub.

## Trusting what comes back

- Help exists on the read side only. `craft_write` returns no usage at any level — top-level `--help` comes back as fake success, command-level as internal markers. Learn write syntax from the tool description, from `blocks learn <topic> <topic>` (craft_read; batch the topics), and from errors: an unknown command fails with the real command list.
- A command honors exactly the flags its own usage lists; anything else is silently accepted and dropped, and the success response won't tell you. Verified drops: `documents list --filter`, `tasks list --filter`, `documents create --markdown`, `search --format json` (while `folders list --filter` is real — its usage lists it). Filter results locally rather than invent flags. The converse also holds: output that looks unfiltered may be genuinely unfiltered data (a mass-imported space makes every doc "recently modified"), so before declaring a flag dead, run a probe whose honored result must differ — a future-date filter must return nothing.
- A single-command write call returns the authoritative diff — every new block's ID, JSON, and markdown — plus `revertInfo`. A multi-command write call returns only a summary. Writes whose new IDs you need next, or that you may want to undo, go one command per call; mechanical bulk edits go batched.
- Within a write response, only `diff.after` for your own blocks is authoritative. The surrounding `context` rendering is not: it can show cross-document links as `invalid:out_of_scope` and table cells as empty while the real data is intact.

## Search

The index covers display text only — block text, titles, and the rendered text of links. It does not index URLs or block IDs, so you cannot search by link target. `--include` terms AND together and accept quoted phrases; `--regexp` is RE2 (`(?i)` works); both repeat. Scope with `--document`, `--location unsorted|trash|templates|daily_notes`, `--folder`, and created/modified/daily-note date ranges (`--location` excludes `--folder`; `--document` combines with neither).

Result sets return whole — hundreds of matches in one response — so a broad term over a large space can overflow a tool-result limit; make terms selective before searching wide. Snippets wrap matches in `**…**` (highlighting, not source formatting) and truncate: fetch the block before quoting its content. The index lags writes by minutes, new documents at the slow end; when recency matters, `documents list --modified-after <date>` is current.

## Content languages: markdown and JSON

`blocks add` and `blocks update` take `--markdown` or `--json`. They are not alternatives at the same level — **markdown is the content language, JSON is the structure language** — and JSON text blocks still carry their content as a `markdown` field, so inline formatting is always markdown's job.

**Markdown**: one string, blank line = new block; the fastest path for body content, and it expresses more than the obvious — headings `#`–`####` (which are *styles on flat blocks*, never hierarchy), lists, `- [ ]` todos, `+ toggle` headers with children as two-space-indented list items, `> quote`, `<callout>`, full tables (data round-trips), code fences (the language tag gets dropped), `***` separators, and inline links `[x](block://<id>)` / `[x](date://YYYY-MM-DD)` / https, which compile into real link attributes. Newlines must be actual newline characters, never the two characters `\n`.

**JSON**: a typed envelope per block — `{"type": …, …typed fields}`, single object or array — and the only way to express:

- **hierarchy**: `{"type":"page","markdown":"Title","content":[…]}` creates a subpage with its whole subtree in one call. When markdown "can't do it", this is usually the answer — never conclude the MCP lacks the capability before checking the JSON path.
- **typed fields markdown drops or lacks**: code `language`, `richUrl` link cards (url/title/description/layout), `lineStyle` variants, media blocks (image/video/file with url, altText, size, layout).
- **styling**: `textStyle` (caption, card + cardLayout), `font`, `textAlignment`, block color/decorations.
- **surgical updates**: partial typed updates change one field without re-sending content, and an update array addresses many blocks by id in one command.

Bare inline JSON works in the command string. Field tables for all block types, inline-attribute shapes, and the REST-side structures live in `references/block-json.md` — read it before composing payloads; `blocks learn` covers the same ground but costs a call.

## Playbook

Call budgets assume the batching discipline above.

**Resolve a title → document (1 call).** `search --include "<title>"` — the root-block match carries the rootBlockId.

**Backlinks — "what references doc X" (2 calls).** There is no backlink command; the workaround stands on links being indexed by their display text, which is the target's live title (rename-safe: old titles drop out of the index).

1. `search --include "<X's exact current title>"` → candidate blocks; common-word titles need extra terms or scope filters.
2. One batched call of `blocks get <blockId>` per candidate. A candidate is a real reference **only if** its markdown contains `block://<X's rootBlockId>` — everything else is a plain-text mention. Report links and mentions separately; unverified search hits are not backlinks.

Two recall limits, both disclosable: links whose display text was customized escape step 1 entirely (the only complete fallback is a space-wide sweep — name its cost first), and daily notes are referenced as `date://YYYY-MM-DD` with free-form display text, so search several date renderings and verify `date://` instead.

**Outgoing links (1–2 calls).** `blocks get <root> --depth -1`; collect `block://` and `date://` targets from the markdown. Target titles come from one batched `blocks get` per target.

**Read a document (1 call).** Depth defaults to 3; `--depth -1` for full nesting; `--fetchMetadata` for per-block timestamps and clickable links. Over 50 direct children paginate via a cursor; `CURSOR_INVALID` means the data changed — retry without it.

**Create a note (3 calls).** create → resolve-link → one `blocks add` carrying the entire body. The response returns every block's ID, so nothing needs re-reading.

**Edit (2 calls typical).** One `blocks get` for state and IDs, one batched write. `blocks update --markdown` with several blocks: the first replaces the target, the rest insert after it. Renaming a document is `blocks update` on its rootBlockId — there is no `documents rename`. `blocks move` restructures without changing IDs.

**Undo (1 call).** `blocks_revert` with the `revertInfo` from a single-command write response reverts it while the blocks remain untouched (stamp-guarded), and its response carries a fresh `revertInfo` that redoes. Batched writes return no `revertInfo` — undo those by hand.

**Daily notes (1 call).** `blocks get --date today` / `blocks add --date <date> --markdown …` — date addressing skips resolve-link. Space and requester timezones can differ (`connection info` shows both); check before trusting "today". Dates everywhere accept `YYYY-MM-DD` and `today|tomorrow|yesterday`.

**Folders (1–2 calls).** `folders list --filter <regex>` finds the folder; `documents create --folder <id>` files a new doc directly; `documents list --folder <id>` and `search --folder <id>` scope to it, subfolders included; `folders create/update/move/delete` manage the tree; `documents move` relocates docs.

**Tasks (1–2 calls).** `tasks list --scope active|upcoming|inbox|logbook|document|all` — `all` includes every in-document `- [ ]` block; filtering is local. `tasks add --markdown … [--schedule <date>] [--deadline <date>]` creates inbox tasks, but the response carries no task ID — recover it from the next `tasks list` before `tasks update/delete`. Todos that belong inside a document or daily note are `- [ ]` blocks added there.

**Delete and recovery.** `documents delete --document <id>` soft-deletes to trash (auto-purge ≈30 days); restore with `documents move`; blocks in trashed documents are immutable until then. Confirm with the user before deleting anything they did not explicitly ask to remove.

**Space-wide sweeps (link graph, orphans, audits).** ~1 call per 8–10 documents even fully batched. State the estimated call count and get a go-ahead first; reuse what the session already fetched.

## Unverified corners

Collections, whiteboards, comments, and styling explorers exist in the CLI but were not exercised here — pull their real contract first (`collections schema`, `blocks learn`, read-side usage) rather than guessing flags. The MCP wraps the Craft Space API (https://connect.craft.do/api-docs/space), useful for semantics the CLI omits — per those docs, collection relations are two-way and auto-synced (set one side only), while some REST capabilities (per-document context search, file upload) have no CLI command at all, so don't hunt for flags exposing them. Where the docs and observed MCP behavior disagree, trust the observation.
