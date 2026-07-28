---
name: craft-mcp
description: Correct, call-efficient use of the Craft MCP tools (craft_read/craft_write). Use whenever a task touches a Craft space — reading, searching, creating, editing, or organizing Craft documents, notes, daily notes, tasks, or links — and especially when asked to find references/backlinks between notes or when an operation looks like it needs many MCP calls. Not for other note apps (Obsidian, Bear, Notion) or local markdown files.
---

# Craft MCP

Two tools drive everything: `craft_read` and `craft_write`. Each takes a CLI-style command string and runs `cmd1; cmd2; ...` batches in a single call. Every MCP call is metered and rate-limited; commands inside a call are nearly free. **The unit you optimize is the call, not the command.** Everything below was verified by live experiment on 2026-07-28 unless marked otherwise.

## Call discipline

Before touching the tools, plan the call graph: which IDs you already hold, which you must fetch, and which commands are independent of each other.

- Batch all independent same-tool commands into one call (7+ commands per call verified).
- A batch is sequential and **non-transactional**: it stops at the first failing command and earlier commands stay applied. Order writes so a mid-batch stop leaves a consistent state; recover by re-issuing only the remaining commands.
- Transient socket/transport errors happen even on valid batches; retry the identical batch once before splitting it.
- Rate-limit specifics are unpublished; the mitigation is the same as the cost rule — fewer, denser calls — plus backing off on errors instead of rapid retries.

These common moves are not acceptable substitutes for planning:

- Paging `documents list` to find one title — resolve titles with `search` instead.
- One-command-per-call loops over items you could batch.
- Reading a document back to verify a write — the write response already contains the diff.
- Verifying a fresh write via `search` — the index lags by minutes.

## ID model

- Documents are addressed by **rootBlockId**. The ID inside a Craft URL (its `documentId`) is a different ID and fails with "Block not found".
- Convert any pasted Craft URL first: `documents resolve-link <url>` (craft_read).
- `documents create` returns only a web URL, so create-and-populate is exactly 3 calls: create (write) → resolve-link (read) → one `blocks add` carrying the entire body (write).
- `blocks get` accepts *any* block ID, not just roots — fetch the one block you need, not the whole document.
- Duplicate titles are normal (imports leave same-title stubs, some empty). Before editing "the" document with a title, disambiguate candidates by Modified timestamp plus one batched content probe. An empty read (`<pageTitle>` only) means you probably have the stub.

## What the CLI actually honors

- Help works on the read side only: `craft_read --help` and read-side `<command> --help` return real usage. **craft_write returns no usage at any level** — top/entity-level `--help` comes back as fake success ("N commands executed") and action-level returns internal markers. Discover write syntax from the tool description, from `blocks learn <topic> <topic>` (craft_read; batch topics in one call), and from errors — unknown *commands* fail with the real command list.
- Unknown *flags* are **silently ignored**, and a success response does not mean your flags were honored. Verified ignored: `documents list --filter`, `tasks list --filter`, `documents create --markdown`, `search --format json`. If a filter seems to have no effect, it does not exist — filter results locally instead of retrying variants.
- Write responses depend on batch size. A single-command write call returns the full diff — every new block's ID, JSON, and markdown — plus `revertInfo` (undoable via blocks_revert until the blocks change again). A multi-command write call returns only a summary: no IDs, no diff, no revert. So: writes whose new IDs you need next, or that you may want to undo, go one command per call; mechanical bulk edits go batched.
- Cross-document links in write-response diffs can render as `invalid:out_of_scope`. That is the diff renderer masking targets outside the diff, not a broken link — confirm with `blocks get` only if it matters.

## Search: what is indexed

`search` matches **display text only**: block text, titles, and the rendered text of links. It does not index URLs or block IDs (`--regexp <uuid>` and `craftdocs://` both return nothing), so you cannot search by link target.

- `--include` terms AND together and accept quoted phrases; `--regexp` is RE2 (`(?i)` works); both repeatable.
- Scope with `--document` (repeatable), `--location unsorted|trash|templates|daily_notes`, `--folder`, and created/modified/daily-note date ranges. `--location` excludes `--folder`; `--document` combines with neither.
- Results carry the document rootBlockId, matching block IDs, a truncated snippet, and timestamps. Snippets wrap matches in `**…**` — that is highlighting, not source formatting, and it collides with real bold. Never quote snippets as document content; fetch the block.
- Result sets come back whole: 166 matches returned in one response with no cursor (the REST API's documented top-20 cap does not apply at the MCP layer). The cost is response size — a common single word over a large space produced a 57k-character response, enough to overflow a tool-result limit. Make terms selective (quoted phrases, extra `--include` terms, scope filters) before searching broad. If a "Next page:" cursor ever does appear, follow it to the end before treating a recall-critical sweep as complete.
- The index lags writes by minutes — roughly 2–10 in testing, new documents at the slow end. For recency questions use `documents list --modified-after <date>`, which is current.

## Playbook

Call budgets assume the batching discipline above.

**Resolve a title → document (1 call).** `search --include "<title>"` — the root-block match carries the rootBlockId. Resolve + read = 2 calls.

**Backlinks — "what references doc X" (2 calls).** There is no backlink command; this workaround works because a link's display text is the target's title and display text is indexed:

1. `search --include "<X's exact current title>"` → candidate blocks. Common-word titles need extra `--include` terms or scope filters to stay usable.
2. One batched call of `blocks get <blockId>` per candidate. A candidate is a real reference **only if** its markdown contains `block://<X's rootBlockId>`; everything else is a plain-text mention. Report links and mentions separately — presenting unverified search hits as backlinks is wrong (in live testing only 3 of 6 hits were real links).

Renames are safe: the index stores each link's *rendered* live title, and the old title drops out of the index entirely (verified by rename experiment) — always search the current title.

Blind spot: links with customized display text don't contain the title and escape step 1 (verified: custom text is stored verbatim and indexed as-is). The only complete fallback is scanning every document's markdown for `block://<X's id>` — a space-wide sweep (see below), so name its cost before running it.

Daily notes are referenced with `date://YYYY-MM-DD` links instead of `block://` (verified round-trip). Their display text is whatever the author left — locale-formatted dates, relative words, custom text — so title-style search recall is weak; for "what references this daily note", search several date renderings (`--regexp` helps) and verify `date://<the-date>` in the block markdown, or accept the sweep cost.

**Outgoing links of a doc (1–2 calls).** `blocks get <root> --depth -1`, collect `block://<id>` (documents/pages) and `date://<date>` (daily notes) targets from the markdown. Need target titles? Batch one `blocks get <id>` per target in a second call.

**Read a document (1 call).** Default depth is 3; `--depth -1` for full nesting; `--format json` for structure; `--fetchMetadata` for per-block timestamps and clickable links. More than 50 direct children paginate via a cursor ("Next page:" line). `CURSOR_INVALID` means the data changed — retry without the cursor.

**Create a note (3 calls).** create → resolve-link → one `blocks add` with the whole body as multi-block markdown (blank line = new block). The response returns every created block's ID, so no read-back. Markdown headings do not create subpages; nested pages need `--json {"type":"page","markdown":"Title","content":[...]}` — bare inline JSON works.

**Edit (2 calls typical).** One `blocks get` for current state and IDs, then one batched write. `blocks update --markdown` with multi-block markdown: the first block replaces the target, the rest insert after it. Rename a document = `blocks update` on its rootBlockId (there is no `documents rename`). `blocks move` restructures without changing IDs.

**Daily notes (1 call).** `blocks get --date today` / `blocks add --date today --markdown ...` — date addressing skips resolve-link entirely. Space timezone and requester timezone can differ (`connection info` shows both); check before trusting "today".

**Tasks (1–2 calls).** `tasks list --scope active|upcoming|inbox|logbook|document|all`; `all` covers every task block in the space, including in-document `- [ ]` blocks. Inbox tasks are standalone entities managed with `tasks add/update/delete`; in-document todos are ordinary blocks. No server-side task filtering exists — filter locally.

**Delete and recovery.** `documents delete --document <rootBlockId>` soft-deletes to trash (auto-purge ≈30 days); restore with `documents move`. Blocks inside trashed documents are immutable until restored. Confirm with the user before deleting anything they did not explicitly ask to remove.

**Space-wide sweeps (link graph, orphans, audits).** Even fully batched this costs ~1 call per 8–10 documents. State the estimated call count and get a go-ahead first; within a session, reuse what you already fetched instead of re-reading.

## Markdown-in-command gotchas

- Newlines inside `--markdown` must be actual newline characters, never the two characters `\n`. Blank lines split blocks.
- Toggle children must be indented list items ("  - child"), never flush-left text (per tool docs).
- Dates accept `YYYY-MM-DD` and `today|tomorrow|yesterday`.

## Unverified corners

Collections, whiteboards, comments, and styling (themes/washi/unsplash) exist in the CLI but were not exercised in these experiments. Before first use, pull the real contract (`collections schema`, `blocks learn`, read-side `--help`) instead of guessing flags — silent flag-dropping makes guessing expensive.

The MCP wraps the Craft Space API, documented at https://connect.craft.do/api-docs/space — useful for semantics the CLI help omits. Per those docs: collection relations are two-way and auto-synced (set one side only), and some REST capabilities (per-document context search with surrounding blocks, file upload) have no MCP command at all — don't hunt for flags that expose them. Note the docs and the MCP disagree in places (documented top-20 search cap vs observed full result sets); trust observed MCP behavior.
