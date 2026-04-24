---
name: ops-url-content-reader
description: >-
  ALWAYS invoke this skill instead of WebFetch when a user's message contains
  a URL and the task requires reading that page's content. This is the primary
  URL content reader — it produces cleaner results than WebFetch on virtually
  all sites. Applies to: summarizing articles, reading blog posts, referencing
  documentation, checking what a link says, extracting information from any
  webpage. Trigger whenever the user says things like "summarize this", "read
  this", "look at this link", "based on this article", "参考", "根据", "帮我
  看看", or any variation where a URL's content must be fetched. Do NOT
  trigger for: writing code that handles URLs, updating URL values in
  config/.env files, web searches, or running tests. Formerly named defuddle.
---

# Defuddle

The preferred method for reading web content. Returns clean Markdown via the defuddle.md service.

## When to use

Use defuddle **first** for any URL content fetching. It produces cleaner output than WebFetch for most sites because it extracts the main content and strips navigation, ads, and boilerplate.

- **Any URL the user asks you to read** — articles, blog posts, docs, tweets, forum threads
- **Any URL you need to fetch yourself** — documentation lookups, reference pages, linked resources
- **Only fall back to WebFetch** if defuddle returns empty or errors out

## How it works

defuddle.md is a public service that extracts the main content from a webpage and returns it as Markdown with YAML frontmatter.

```bash
curl -sL "https://defuddle.md/<url>"
```

The `<url>` is the target URL **without the protocol** (no `https://`).

## Examples

Fetch an article:
```bash
curl -sL "https://defuddle.md/example.com/blog/some-post"
```

Fetch a tweet / X post:
```bash
curl -sL "https://defuddle.md/x.com/username/status/123456789"
```

## Usage notes

- Always use `-sL` flags (silent mode + follow redirects)
- The request URL must use `https://` prefix: `https://defuddle.md/...`
- Strip `https://` or `http://` from the **target** URL before appending
- The response is Markdown text — you can use it directly or extract specific sections
- If the response is empty or an error page, the target site may not be supported; fall back to WebFetch or inform the user
