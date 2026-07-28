# Craft block JSON reference

Field-level detail for `blocks add --json` / `blocks update --json` payloads and for parsing `--format json` reads. Sources: the Craft Space API docs (https://connect.craft.do/api-docs/space) cross-checked by live MCP experiments; where they disagree, the MCP observation is stated and wins. `blocks learn <topic> <topic>` (craft_read) covers similar ground at the cost of a call.

## Three shapes to keep apart

- **Insert** (`blocks add --json`): one NewBlock object or an array. `id` is not required — the server assigns it and the response returns it (the API docs list `id` as required; that does not hold at the MCP layer).
- **Update** (`blocks update --json`): partial typed updates — only provided fields change. Every object in an array must include `id`; a single object may omit it when `--id` is passed.
- **Read** (`--format json`): text arrives as `text: {value, attributes[]}` and pages as `title: {value, attributes[]}`; on insert you write a `markdown` field instead, and any links in it compile into attributes.

## Structure model

Only `page` blocks nest through a `content[]` array. Everything else is a flat sibling sequence — toggles and list nesting are expressed by `indentationLevel` (0–5) on the *following sibling blocks*, not by containment. A "toggle with children" is one block with `listStyle:"toggle"` followed by siblings at `indentationLevel:1`.

## Shared fields

| Field | Values / shape |
|---|---|
| `listStyle` | `none` \| `bullet` \| `numbered` \| `toggle` \| `task` |
| `textStyle` | `body` \| `h1`–`h4` \| `caption` \| `card` \| `page` — styles on flat blocks, never hierarchy |
| `textAlignment` | `left` \| `center` \| `right` \| `justify` |
| `font` | `system` \| `serif` \| `rounded` \| `mono` |
| `indentationLevel` | integer 0–5 |
| `taskInfo` | `{state: todo\|done\|canceled}`, meaningful only with `listStyle:"task"` |
| `decorations` | MCP JSON shows string markers (`"quote"`, `"callout"`); the API docs additionally describe color objects (`#RRGGBB`) |
| `cardLayout` | `small` \| `square` \| `regular` \| `large`, with `textStyle:"card"` |

## Per-type: insert fields → updatable fields

| Type | Insert (beyond shared) | Updatable | Markdown relationship |
|---|---|---|---|
| `text` | `markdown` (required) | markdown, textStyle, textAlignment, font, indentationLevel, listStyle, decorations, taskInfo | fully expressible; `> `, `<callout>`, `<caption>` map to decorations/styles |
| `page` | `markdown` = title (required); `content[]` of NewBlock children — one call builds the subtree (verified) | title markdown, textStyle, textAlignment, font, cardLayout; content tree is NOT replaced wholesale via update | no markdown form at all |
| `code` | `rawCode` (required); `language` (bash, cpp, cs, css … yaml) | rawCode, language | fences create the block but drop the language tag (verified) |
| `richUrl` | `url` (required); `title`, `description`, `layout` (`small`\|`regular`\|`card`) | url, title, description, layout | a markdown link stays inline text; the card needs JSON |
| `line` | `lineStyle`: `strong`\|`regular`\|`light`\|`extraLight`\|`pageBreak` | lineStyle | `***` always yields `extraLight`; other styles need JSON (pageBreak renders back as `*******`) |
| `image` | `url` (required); `altText`, `size` (`fit`\|`fill`), `width` (`auto`\|`fullWidth`), `aspectRatio`, `mimeType`, `fileSize` | url, altText, size, width | — |
| `video` | `url` (required); same media fields | url, altText, size, width | — |
| `file` | `url` (required); `fileName`, `blockLayout` (`small`\|`regular`\|`card`) | url, fileName, blockLayout | — |
| `table` | markdown tables round-trip with data (verified); JSON read shape is `rows[][]` of `{value, attributes}`; some layouts are read-only (service errors hint) | markdown, sometimes not at all | markdown is the reliable write path |
| `collection` / `collectionItem` | block types exist, but rows are managed via `collections items-*` commands, not blocks update | — | — |
| `drawing` / `whiteboard` | `url` / none; contents via `whiteboards elements *` | — | — |

## Inline attributes (read path)

Entries in `text.attributes[]` / `title.attributes[]` carry `start`/`end` character offsets into `value`:

| Type | Extra fields | Markdown equivalent |
|---|---|---|
| `bold` / `italic` / `strikethrough` / `code` | — | `**x**` / `*x*` / `~~x~~` / `` `x` `` |
| `link` | `url` | `[x](https://…)` |
| `blockLink` | `blockId` | `[x](block://<rootBlockId>)` — verified round-trip |
| `dateLink` | `date` YYYY-MM-DD | `[x](date://YYYY-MM-DD)` — verified round-trip |
| `color` | `color` `#RRGGBB` | — |

Write links as markdown; parse them as attributes. The attribute view matters for backlink verification and wherever display text diverges from the target's title.

## REST shapes surfaced through other CLI commands

- **Tasks**: `title` (markdown), `location` `{type: inbox|dailyNote|document}` (+ `date` / `documentId`), `scheduleDate`, `deadline`, `state` (`done`, `cancelled`, active). The CLI's `tasks add` exposes markdown/state/schedule/deadline and creates inbox tasks; its response carries no task ID — recover IDs from `tasks list`.
- **Documents**: create/move take `destination` = `{destination: unsorted|templates}` or `{folderId}`; move cannot target trash — `documents delete` is the soft-delete and accepts multiple IDs.
- **Collection items**: `id`, `title`, `properties` validated against the collection schema (relations two-way, auto-synced — set one side only), optional nested `content[]`.
