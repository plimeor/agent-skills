#!/usr/bin/env python3
"""Wrap a body-content HTML fragment into a complete, single-file document.

Injects the document skeleton (doctype/html/head/body), a token-driven base
design system (reset, dual-theme palette, typography, core elements), and the
mermaid library (pinned CDN tag) with a theme-aware init snippet. Page styles
in the fragment come after the base and override it freely. The output opens
from file:// as one portable file.

Usage:
    python3 build.py fragment.html -o page.html [--title "Page title"] [--lang en]

The input must be a body fragment (content plus its own <style>/<script>),
never a complete document — the skeleton is this script's job.
"""

import argparse
import pathlib
import re
import sys

MERMAID_URL = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"

BASE_CSS = """\
/* Reset */
*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body { margin: 0; min-height: 100vh; -webkit-font-smoothing: antialiased; }
img, picture, video, canvas, svg { display: block; max-width: 100%; }
input, button, textarea, select { font: inherit; }
p, h1, h2, h3, h4, h5, h6 { overflow-wrap: break-word; }

/* Base design system: token-driven, dual-theme. Page styles come after and override freely. */
:root {
  color-scheme: light dark;
  --bg: #f7f7f5;
  --surface: #ffffff;
  --ink: #21252c;
  --ink-muted: #5c6470;
  --line: #e4e4e0;
  --accent: #39607a;
  --accent-ink: #ffffff;
  --font-display: var(--font-body);
  --font-body: system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-mono: ui-monospace, "SF Mono", "Cascadia Code", Menlo, Consolas, monospace;
  --radius: 6px;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #15181d;
    --surface: #1d222a;
    --ink: #e6e8eb;
    --ink-muted: #98a1ac;
    --line: #2b313a;
    --accent: #8ab2ce;
    --accent-ink: #10222e;
  }
}
:root[data-theme="light"] {
  --bg: #f7f7f5; --surface: #ffffff; --ink: #21252c; --ink-muted: #5c6470;
  --line: #e4e4e0; --accent: #39607a; --accent-ink: #ffffff;
}
:root[data-theme="dark"] {
  --bg: #15181d; --surface: #1d222a; --ink: #e6e8eb; --ink-muted: #98a1ac;
  --line: #2b313a; --accent: #8ab2ce; --accent-ink: #10222e;
}

body {
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.65;
}
main { max-width: 72ch; margin-inline: auto; padding: clamp(2rem, 6vw, 4rem) 1.25rem; }

h1, h2, h3, h4 {
  font-family: var(--font-display);
  line-height: 1.15;
  text-wrap: balance;
  margin: 2.2em 0 0.6em;
}
h1 { font-size: clamp(1.9rem, 1.4rem + 2.2vw, 2.6rem); letter-spacing: -0.02em; margin-top: 0; }
h2 { font-size: 1.45rem; letter-spacing: -0.01em; }
h3 { font-size: 1.15rem; }
p, ul, ol { margin: 0 0 1em; }
ul, ol { padding-left: 1.4em; }
li { margin-bottom: 0.3em; }
a { color: var(--accent); text-decoration-thickness: 1px; text-underline-offset: 0.2em; }
strong { font-weight: 600; }
small, .muted { color: var(--ink-muted); }
hr { border: 0; border-top: 1px solid var(--line); margin: 2.5rem 0; }

blockquote {
  margin: 1.5rem 0;
  padding: 0.2rem 0 0.2rem 1.1rem;
  border-left: 2px solid var(--accent);
  color: var(--ink-muted);
}
code { font-family: var(--font-mono); font-size: 0.875em; }
:not(pre) > code { background: var(--surface); border: 1px solid var(--line); border-radius: 4px; padding: 0.1em 0.35em; }
pre {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 1rem 1.2rem;
  overflow-x: auto;
  line-height: 1.55;
  margin: 1.5rem 0;
}
pre.mermaid { display: flex; justify-content: center; background: transparent; border: 0; }

table {
  display: block;
  width: fit-content;
  max-width: 100%;
  overflow-x: auto;
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;
  margin: 1.5rem 0;
}
th, td { padding: 0.55rem 0.9rem; border-bottom: 1px solid var(--line); text-align: left; }
th { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ink-muted); }

figure { margin: 1.5rem 0; }
figcaption { font-size: 0.875rem; color: var(--ink-muted); margin-top: 0.5rem; }
img { border-radius: var(--radius); }

button, .button {
  background: var(--accent);
  color: var(--accent-ink);
  border: 0;
  border-radius: var(--radius);
  padding: 0.55rem 1.1rem;
  font-weight: 500;
  cursor: pointer;
}
input, textarea, select {
  background: var(--surface);
  color: var(--ink);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 0.5rem 0.75rem;
}
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}\
"""

MERMAID_INIT = """\
(function () {
  if (typeof mermaid === "undefined") return; /* CDN unreachable: leave diagram source visible */
  var t = document.documentElement.dataset.theme;
  var dark = t === "dark" || (t !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  mermaid.initialize({ startOnLoad: true, theme: dark ? "dark" : "default" });
})();\
"""


def fail(msg):
    print(f"error: {msg}", file=sys.stderr)
    sys.exit(1)


def derive_title(fragment, output):
    m = re.search(r"<h1[^>]*>(.*?)</h1>", fragment, re.S | re.I)
    if m:
        title = re.sub(r"<[^>]+>", "", m.group(1)).strip()
        if title:
            return title
    return output.stem


def main():
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument("fragment", type=pathlib.Path, help="body-content fragment file")
    p.add_argument("-o", "--output", type=pathlib.Path, required=True, help="output .html path")
    p.add_argument("--title", help="document title (default: first <h1>, else output stem)")
    p.add_argument("--lang", default="en", help="html lang attribute (default: en)")
    args = p.parse_args()

    fragment = args.fragment.read_text(encoding="utf-8")
    if re.search(r"<!doctype|<html\b|<head\b|<body\b", fragment, re.I):
        fail("input must be a body fragment; the skeleton (doctype/html/head/body) is injected here")

    title = args.title or derive_title(fragment, args.output)
    doc = f"""<!doctype html>
<html lang="{args.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<style>
{BASE_CSS}
</style>
</head>
<body>
{fragment.strip()}
<script src="{MERMAID_URL}"></script>
<script>
{MERMAID_INIT}
</script>
</body>
</html>
"""
    args.output.write_text(doc, encoding="utf-8")
    print(f"wrote {args.output} ({args.output.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
