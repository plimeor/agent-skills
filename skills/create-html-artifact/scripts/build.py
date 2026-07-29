#!/usr/bin/env python3
"""Wrap a body-content HTML fragment into a complete, self-contained document.

Injects the document skeleton (doctype/html/head/body), a minimal CSS reset,
and — when the fragment contains mermaid blocks — an inlined mermaid bundle
plus a theme-aware init snippet. The output renders fully offline from file://.

Usage:
    python3 build.py fragment.html -o page.html [--title "Page title"] [--lang en]

The input must be a body fragment (content plus its own <style>/<script>),
never a complete document — the skeleton is this script's job.
"""

import argparse
import os
import pathlib
import re
import sys
import urllib.request

MERMAID_URL = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"
MERMAID_CACHE = pathlib.Path.home() / ".cache" / "create-html-artifact" / "mermaid.min.js"

RESET_CSS = """\
*, *::before, *::after { box-sizing: border-box; }
:root { color-scheme: light dark; }
html { -webkit-text-size-adjust: 100%; }
body { margin: 0; min-height: 100vh; -webkit-font-smoothing: antialiased; }
img, picture, video, canvas, svg { display: block; max-width: 100%; }
input, button, textarea, select { font: inherit; }
p, h1, h2, h3, h4, h5, h6 { overflow-wrap: break-word; }\
"""

MERMAID_INIT = """\
(function () {
  var t = document.documentElement.dataset.theme;
  var dark = t === "dark" || (t !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  mermaid.initialize({ startOnLoad: true, theme: dark ? "dark" : "default" });
})();\
"""


def fail(msg):
    print(f"error: {msg}", file=sys.stderr)
    sys.exit(1)


def mermaid_js(cli_path):
    """Return the mermaid bundle text from CLI arg, env, cache, or a one-time download."""
    candidates = [cli_path, os.environ.get("CREATE_HTML_ARTIFACT_MERMAID"), MERMAID_CACHE]
    for c in candidates:
        if c and pathlib.Path(c).is_file():
            return pathlib.Path(c).read_text(encoding="utf-8")
    try:
        with urllib.request.urlopen(MERMAID_URL, timeout=60) as r:
            js = r.read().decode("utf-8")
    except OSError as e:
        fail(
            f"fragment uses mermaid but no bundle is available: download from {MERMAID_URL} "
            f"failed ({e}) and no local copy found (--mermaid-js, $CREATE_HTML_ARTIFACT_MERMAID, "
            f"or {MERMAID_CACHE}). Do not substitute a CDN <script> tag — that breaks the "
            f"offline contract. Provide a local bundle or restore network access, then rebuild."
        )
    MERMAID_CACHE.parent.mkdir(parents=True, exist_ok=True)
    MERMAID_CACHE.write_text(js, encoding="utf-8")
    return js


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
    p.add_argument("--mermaid-js", help="path to a local mermaid IIFE bundle")
    args = p.parse_args()

    fragment = args.fragment.read_text(encoding="utf-8")
    if re.search(r"<!doctype|<html\b|<head\b|<body\b", fragment, re.I):
        fail("input must be a body fragment; the skeleton (doctype/html/head/body) is injected here")

    title = args.title or derive_title(fragment, args.output)
    scripts = ""
    if re.search(r"""class\s*=\s*["'][^"']*\bmermaid\b""", fragment):
        bundle = mermaid_js(args.mermaid_js).replace("</script", "<\\/script")
        scripts = f"\n<script>\n{bundle}\n</script>\n<script>\n{MERMAID_INIT}\n</script>"

    doc = f"""<!doctype html>
<html lang="{args.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<style>
{RESET_CSS}
</style>
</head>
<body>
{fragment.strip()}{scripts}
</body>
</html>
"""
    args.output.write_text(doc, encoding="utf-8")
    print(f"wrote {args.output} ({args.output.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
