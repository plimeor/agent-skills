---
name: writing-blog-illustration
description: "Generate an English image-model prompt for a blog or article illustration. Use when the user asks for an illustration, image, infographic, concept diagram, system-architecture visual, or comparison visual for a blog or article. Near miss: this returns a text prompt, not an image; if the user wants an image created or edited directly, use image generation unless they explicitly want the prompt."
---

# Blog Illustration Prompt Generator

## Goal

Generate one ready-to-use English prompt for an image model to create a blog/article illustration.

## Core Constraints

The prompt itself must be written in English, regardless of the conversation language. Use Chinese labels only when the user explicitly requests Chinese text inside the image.

Return a prompt for the user's preferred image generation model. If the user asks the assistant to directly generate or edit an image, hand off to image generation instead of returning only a prompt.

## Default Style

Use this house style unless the user asks for a more serious, technical, editorial, realistic, minimal, or non-character-driven direction:

- Cartoon infographic: a hybrid of illustration and information graphics, not a formal architecture diagram or corporate clip art. No UML, swimlanes, database cylinders, or other formal diagram conventions unless the user asks for them.
- White background with soft pastel color-coded zones.
- Cute characters with personality, visually distinct from each other. Each abstract concept becomes a concrete metaphor. Avoid generic robots, gear icons, floating screens, and "AI" badges.
- Simple faces, thin rounded arrows, clean white space, and charming but not childish proportions.
- Short English labels by default.
- 16:9 aspect ratio, high quality, clean edges, no blur, no gradients, no glossy 3D.
- Soft pastel palette: baby blue, lavender/pink, warm cream/yellow, sage green.

Regardless of style: the prompt-generator boundary holds, and the prompt still lists what to avoid — including "AI" badges or labels when the context already makes this clear.

## Evidence And Retrieval

Use the user's provided text, article draft, title, notes, screenshot, or conversation as the source of truth. Do not invent product facts, metrics, customers, roadmap claims, or architecture details.

If the user provides a URL and its contents are needed, use `url-reader` or an explicitly authorized domain-specific/local method to retrieve the body content.

If the user provides a file, screenshot, or named article and its contents are needed, read only enough to identify the visual thesis, components, relationships, and required labels.

Stop reading once the core visual structure and labels are clear. Do not search or elaborate just to make the scene sound richer.

## Design Decisions

### Content Fit

Derive three to six visual anchors from the source: actors, concepts, stages, or contrasts. If the content has more than six distinct elements, suggest a split, or compress to the most important three to six anchors when the user insists on one image. An overloaded composition is worse than two images.

### Metaphor Choice

Function drives form. Name what the element *does*, then pick a character or object whose defining behavior is that verb. Deriving the metaphor from the element's category or product name instead is what produces generic icon art. The register is whimsical and concrete, never corporate: a connector weaves like a spider, an auditor prunes like a gardener.

Return one coherent metaphor set by default. Offer alternatives only when the metaphor would materially change the article's stance, the user's intent is under-specified in a way that changes visual meaning, or the user asks to brainstorm.

### Layout Choice

Choose the layout from the relationship structure:

- `Z-flow`: sequential processes with three or four stages.
- `Hub-and-spoke`: one central concept with related elements.
- `Layered bands`: systems with distinct tiers or phases.
- `Scattered/organic`: loose associations; use sparingly.

If an element deliberately breaks the pattern, place it outside the organized zones with dashed or softer connections.

### Labels

Keep labels short, usually two to four words. List exact label text and placement inside the prompt: above, below, inside, top-left zone, beside the character, or along an arrow.

## Output

One English prompt, around 200-400 words unless the user asks for a different format, containing:

1. Style declaration.
2. Layout overview.
3. Zone-by-zone or component-by-component visual description.
4. Special elements that break the main pattern.
5. Text labels and placement.
6. Style constraints and things to avoid.
7. Technical specs such as aspect ratio and quality.

## Stop Rules

If enough context exists, output the prompt directly. Ask one narrow question only if the missing answer changes visual meaning, audience, label language, or image format.

Stop after the prompt unless the user asks for explanation or direct image generation.
