---
name: ops-url-reader
description: >-
  Primary URL content reader for tasks that need a webpage's main content.
  Use when a user asks to summarize, read, inspect, reference, or extract facts
  from a URL, including "read this", "look at this link", "based on this
  article", "参考", "根据", or "帮我看看". Prefer this skill over generic
  WebFetch for content extraction; fall back only when defuddle returns empty or
  errors. Exclude URL string edits in code/config, web searches, and test
  execution.
---

# Defuddle

The preferred method for reading web content. Returns clean Markdown via the defuddle.md service.

## Outcome

Success means you extract enough clean page content to answer the user's request, or clearly state that extraction failed and choose the smallest useful fallback. Stop once the relevant content or facts are available; do not fetch again just to improve phrasing.

## When to use

Start with defuddle for URL content fetching. It produces cleaner output than WebFetch for most sites because it extracts the main content and strips navigation, ads, and boilerplate.

- **Any URL the user asks you to read** — articles, blog posts, docs, tweets, forum threads
- **Any URL you need to fetch yourself** — documentation lookups, reference pages, linked resources
- **Fallback**: use WebFetch only when defuddle returns empty content or errors

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

## Usage Notes

- Use `-sL` flags (silent mode + follow redirects)
- The request URL must use `https://` prefix: `https://defuddle.md/...`
- Strip `https://` or `http://` from the **target** URL before appending
- The response is Markdown text — you can use it directly or extract specific sections
- If the response is empty or an error page, the target site may not be supported; fall back to WebFetch or inform the user
