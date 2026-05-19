---
name: ops-url-reader
description: >-
  Read the main content of a specific webpage URL when the user asks to summarize, inspect, cite, reference, or extract facts from that URL, including "read this", "look at this link", "based on this article", or equivalent reference requests. Owns URL retrieval safety for skills that need webpage content: use defuddle.md only for public pages, choose one authorized fallback when extraction fails, and avoid broad search or private/login-gated URLs.
---

# URL Reader

## Goal

Read the main content of a specific webpage URL and use only the relevant extracted content to answer the user's request.

## Success Criteria

A good result:

- Extracts enough page body content to answer the user.
- Distinguishes article/content text from metadata, navigation, ads, and boilerplate.
- Cites or names the original URL when making factual claims from the page.
- Clearly reports extraction failure and uses the smallest useful fallback when the page cannot be read.

## Constraints

Use this for concrete URLs the user wants read, summarized, inspected, cited, or extracted. Do not use it as a broad web search tool for finding pages.

Other skills that need article or webpage body content should route URL retrieval through this skill or an explicitly authorized domain-specific tool instead of duplicating URL privacy, extraction, and fallback rules.

Prefer dedicated tools or skills when available for a domain, such as OpenAI docs, GitHub PRs/issues, local browser testing, app connector data, or code/test execution. Use this skill only for raw public webpage main-content extraction.

Do not send private, login-gated, intranet, token-bearing, or sensitive URLs to `defuddle.md`. Ask for pasted content or use an authorized local/browser/app method when the URL cannot safely be sent to a public extraction service.

## Retrieval Budget

Default to one `defuddle.md` extraction for public pages. If it returns empty content, an obvious error page, or content that is visibly incomplete for the user's question, choose one small authorized fallback. Continue only when:

- the core question is still unanswered
- a required fact, date, owner, parameter, or source is missing
- the user asked for exhaustive coverage or comparison
- the specified URL must be read and the first extraction failed

Stop once the relevant content or facts are available. Do not fetch again just to improve phrasing, add decorative examples, or support nonessential wording.

Fallback choices, in order:

1. Use a more specific available tool or skill when the domain has one.
2. Use direct public-page retrieval only when the URL is not private, login-gated, token-bearing, or sensitive.
3. Use an authorized local/browser/app method when the page depends on the user's session or private access.
4. Ask the user for pasted content when no safe authorized retrieval path exists.

Do not chain multiple fallbacks unless a required fact is still missing and the next fallback is safe for the URL class.

## Defuddle Command

`defuddle.md` is a public service that extracts the main content from a webpage and returns Markdown with YAML frontmatter.

```bash
curl -sL "https://defuddle.md/<url>"
```

The request URL uses `https://defuddle.md/...`. Strip `https://` or `http://` from the target URL before appending it.

Examples:

```bash
curl -sL "https://defuddle.md/example.com/blog/some-post"
curl -sL "https://defuddle.md/x.com/username/status/123456789"
```

Use `-sL` for silent mode and redirect following.

## Output

Answer in the shape the user requested: summary, extraction, fact check, reference, or synthesis. Name the original URL and the retrieval path used when making factual claims. Do not dump the full extracted Markdown unless the user asks for raw content or excerpts.

If extraction fails, state what was tried, what failed, and the smallest useful next step.

## Stop Rules

Stop when the extracted content is enough to answer the user's core request. Do not repeatedly retry the same extraction method. If key evidence is missing after the allowed fallback, name the gap and ask for or propose the smallest missing source.
