---
name: writing-blog-illustration
description: >-
  Generate English image-model prompts for blog or article illustrations in a
  colorful cartoon infographic style. Use when the user asks for an illustration
  prompt, image prompt, concept diagram prompt, system-architecture visual
  prompt, comparison visual prompt, or blog/article 配图提示词, including "画图",
  "插图", "图片提示词", "配图", "illustration", "infographic", or "image prompt".
  This skill returns text prompts, not generated images; if the user asks Codex
  to directly create or edit a bitmap image, use image generation instead unless
  they explicitly want a prompt. Formerly named blog-illustration.
---

# Blog Illustration Prompt Generator

## Goal

Generate one ready-to-use English prompt for an image model to create a
blog/article illustration.

## Success Criteria

A good result:

- Returns one text prompt, not an image.
- Keeps the prompt around 200-400 words unless the user asks for a different
  format.
- Names the intended visual outcome, layout, metaphors, labels, style
  constraints, and technical specs.
- Uses concrete visual anchors from the user's content without inventing product
  facts, metrics, customers, roadmap claims, or architecture details.
- Stops after the prompt unless the user asks for explanation or direct image
  generation.

## Core Constraints

The prompt itself must be written in English, regardless of the conversation
language. Use Chinese labels only when the user explicitly requests Chinese text
inside the image.

Return a prompt for the user's preferred image generation model. If the user
asks Codex to directly generate or edit an image, hand off to image generation
instead of returning only a prompt.

## Default Style

Use this house style unless the user asks for a more serious, technical,
editorial, realistic, or non-character-driven direction:

- Cartoon infographic: a hybrid of illustration and information graphics, not a
  formal architecture diagram or corporate clip art.
- White background with soft pastel color-coded zones.
- Cute characters with personality. Each abstract concept becomes a concrete
  metaphor. Avoid generic robots, gear icons, floating screens, and "AI" badges.
- Simple faces, thin rounded arrows, clean white space, and charming but not
  childish proportions.
- Short English labels by default.
- 16:9 aspect ratio, high quality, clean edges, no blur, no gradients.
- Soft pastel palette: baby blue, lavender/pink, warm cream/yellow, sage green.

## Evidence And Retrieval Budget

Use the user's provided text, article draft, title, notes, screenshot, or
conversation as the source of truth.

If the user provides a URL, file, screenshot, or named article and its contents
are needed, read only enough to identify the visual thesis, components,
relationships, and required labels.

Stop reading once the core visual structure and labels are clear. Do not search
or elaborate just to make the scene sound richer.

## Design Decisions

### Content Fit

Derive three to six visual anchors from the source: actors, concepts, stages, or
contrasts. If the content has more than six distinct elements, default to
suggesting a split or compress the prompt to the most important three to six
anchors when the user insists on one image.

### Metaphor Choice

Function drives form. A connector might become a spider weaving silk; a cleaner
or auditor might become a gardener pruning branches; an observer might become an
owl; a scheduler might become a conductor.

Return one coherent metaphor set by default. Offer alternatives only when the
metaphor would materially change the article's stance, the user's intent is
under-specified in a way that changes visual meaning, or the user asks to
brainstorm.

### Layout Choice

Choose the layout from the relationship structure:

- `Z-flow`: sequential processes with three or four stages.
- `Hub-and-spoke`: one central concept with related elements.
- `Layered bands`: systems with distinct tiers or phases.
- `Scattered/organic`: loose associations; use sparingly.

If an element deliberately breaks the pattern, place it outside the organized
zones with dashed or softer connections.

### Labels

Keep labels short, usually two to four words. List exact label text and placement
inside the prompt: above, below, inside, top-left zone, beside the character, or
along an arrow.

### Style Adaptation

Honor user requests for a serious, technical, editorial, minimal, or
non-character style. Preserve the prompt-generator boundary even when style
changes.

## Output

The final prompt should contain:

1. Style declaration.
2. Layout overview.
3. Zone-by-zone or component-by-component visual description.
4. Special elements that break the main pattern.
5. Text labels and placement.
6. Style constraints and things to avoid.
7. Technical specs such as aspect ratio and quality.

## Things To Avoid

- Labels longer than two to four words.
- Generic characters that all look alike.
- "AI" badges or labels when the context already makes this clear.
- UML, swimlanes, database cylinders, or formal diagram conventions unless the
  user explicitly asks for them.
- Overloaded compositions.
- Decorative gradients or glossy 3D effects.

## Stop Rules

If enough context exists, output the prompt directly. Ask one narrow question
only if the missing answer changes visual meaning, audience, label language, or
image format.

Before finalizing, check that the prompt is one usable English prompt, fits the
word budget, has short labels, includes layout/style/technical specs, avoids
invented facts, and does not directly generate an image.
