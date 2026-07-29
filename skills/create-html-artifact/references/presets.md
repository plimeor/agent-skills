# Identity Presets

Three verified identities on top of the injected base system. Each is a complete, safe choice: one `@import` line plus one token override block, pasted at the top of the fragment's `<style>`. The base system's layout, rhythm, and element styles keep working — a preset only re-points tokens.

Pick by subject, not at random. If none fits and no stronger direction exists (user words, project system, a confident editorial read), stay on the base system's defaults — they are designed to stand on their own.

## How to apply

```html
<style>
  @import url('<the preset's fonts URL>');
  :root { /* the preset's token block */ }
  :root[data-theme="dark"], /* keep dark values via the pattern below */
  /* page-specific styles follow */
</style>
```

Override dark values inside both `@media (prefers-color-scheme: dark)` and `:root[data-theme="dark"]` when a preset specifies them; otherwise the base dark palette continues to apply.

## 1. Editorial — essays, reports, announcements, long-form reading

Fraunces (a warm, characterful serif) for display, Source Sans 3 for body. Reads authored, not templated.

```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..700&family=Source+Sans+3:wght@400..700&display=swap');
:root {
  --font-display: "Fraunces", Georgia, serif;
  --font-body: "Source Sans 3", system-ui, sans-serif;
  --accent: #7a4a39;      /* warm sienna */
  --accent-ink: #ffffff;
}
@media (prefers-color-scheme: dark) { :root { --accent: #cf9b8a; --accent-ink: #2e1712; } }
:root[data-theme="light"] { --accent: #7a4a39; --accent-ink: #ffffff; }
:root[data-theme="dark"]  { --accent: #cf9b8a; --accent-ink: #2e1712; }
```

## 2. Technical — dashboards, tools, demos, developer docs

IBM Plex Sans + IBM Plex Mono. Neutral, precise, engineered; the mono face carries data and code with the same voice.

```css
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
:root {
  --font-display: "IBM Plex Sans", system-ui, sans-serif;
  --font-body: "IBM Plex Sans", system-ui, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, monospace;
  --accent: #2f6f5e;      /* deep teal */
  --accent-ink: #ffffff;
}
@media (prefers-color-scheme: dark) { :root { --accent: #7fc0ab; --accent-ink: #0e2620; } }
:root[data-theme="light"] { --accent: #2f6f5e; --accent-ink: #ffffff; }
:root[data-theme="dark"]  { --accent: #7fc0ab; --accent-ink: #0e2620; }
```

## 3. Humanist — product pages, guides, anything people-facing and warm

Bricolage Grotesque (expressive display grotesque) for headings, Source Serif 4 for body. Friendly without being soft.

```css
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..700&family=Source+Serif+4:opsz,wght@8..60,400..600&display=swap');
:root {
  --font-display: "Bricolage Grotesque", system-ui, sans-serif;
  --font-body: "Source Serif 4", Georgia, serif;
  --accent: #4a5899;      /* muted indigo */
  --accent-ink: #ffffff;
}
@media (prefers-color-scheme: dark) { :root { --accent: #a3b0e8; --accent-ink: #1a2145; } }
:root[data-theme="light"] { --accent: #4a5899; --accent-ink: #ffffff; }
:root[data-theme="dark"]  { --accent: #a3b0e8; --accent-ink: #1a2145; }
```

## Adjusting a preset

Safe adjustments, in order of preference:

1. **Accent hue** — shift toward the subject's world (a finance report toward slate, a gardening guide toward moss). Keep light-theme accents dark enough for text on `--bg` (aim for obvious legibility, not vibrancy) and provide the matching dark-theme value.
2. **Neutrals** — bias `--bg`/`--ink` slightly toward the accent's hue; never move to pure grey.
3. **Display face only** — swap the display family for another Google Fonts face that fits the subject; keep the body face from the preset.

Do not mix token blocks from two presets, and do not adjust more than accent + neutrals unless a stronger direction (user words, project system) calls for it.
