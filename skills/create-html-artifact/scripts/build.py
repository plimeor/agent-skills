#!/usr/bin/env python3
"""Wrap a body-content HTML fragment into a complete, single-file document.

Injects the document skeleton (doctype/html/head/body), a minimal CSS reset,
and the mermaid library (CDN tag by default, --offline inlines it) plus a
theme-aware init snippet. The output renders from file:// as one portable file.

Usage:
    python3 build.py fragment.html -o page.html [--title "Page title"] [--lang en]
                     [--no-mermaid] [--offline] [--mermaid-js path]

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
  if (typeof mermaid === "undefined") return; /* offline and CDN unreachable: leave source visible */
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
            f"--offline requested but no mermaid bundle is available: download from {MERMAID_URL} "
            f"failed ({e}) and no local copy found (--mermaid-js, $CREATE_HTML_ARTIFACT_MERMAID, "
            f"or {MERMAID_CACHE}). Provide a local bundle, restore network for a one-time cache "
            f"download, or drop --offline to use the CDN tag instead."
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
    p.add_argument("--no-mermaid", action="store_true", help="omit the mermaid library")
    p.add_argument("--offline", action="store_true", help="inline the mermaid bundle instead of a CDN tag")
    p.add_argument("--mermaid-js", help="path to a local mermaid IIFE bundle (implies --offline)")
    args = p.parse_args()

    fragment = args.fragment.read_text(encoding="utf-8")
    if re.search(r"<!doctype|<html\b|<head\b|<body\b", fragment, re.I):
        fail("input must be a body fragment; the skeleton (doctype/html/head/body) is injected here")

    title = args.title or derive_title(fragment, args.output)
    scripts = ""
    if not args.no_mermaid:
        if args.offline or args.mermaid_js:
            bundle = mermaid_js(args.mermaid_js).replace("</script", "<\\/script")
            tag = f"<script>\n{bundle}\n</script>"
        else:
            tag = f'<script src="{MERMAID_URL}"></script>'
        scripts = f"\n{tag}\n<script>\n{MERMAID_INIT}\n</script>"

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
