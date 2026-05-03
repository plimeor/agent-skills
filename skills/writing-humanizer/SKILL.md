---
name: writing-humanizer
description: >
  Humanize Chinese or English drafts while preserving the original artifact,
  meaning, structure, factual claims, and technical boundaries. Use when the user
  asks to make writing less AI-like, more human, more natural, 去 AI 味, 像人写的,
  自然一点, 不像 AI 写的, 人味一点, or when a draft feels over-polished, too
  symmetrical, generic, translated, or detached from the author's real judgment.
  Do not use this as an AI-word blacklist, synonym-replacement pass,
  fact-expansion pass, or request to make technical writing casually chatty.
---

# Writing Humanizer

## Goal

Make the draft sound authored and situated while preserving the original
artifact, meaning, evidence, and boundary.

Humanizing is not synonym replacement or removal of forbidden words. Human
writing is defined by fit: a real speaker, talking to a real reader, under a real
purpose, with selective evidence and lived judgment.

## Success Criteria

A good rewrite:

- sounds like the same author
- keeps the original argument and factual claims
- preserves useful density and technical precision
- makes each changed sentence's job clearer
- adds grounding only where needed and supported
- removes mechanical smoothness without becoming generic or chatty

## Constraints

Preserve the requested artifact type, genre, length, outline, factual claims,
citations, links, code, diagrams, frontmatter, file paths, and technical terms
unless the user asks to change them.

Do not add new claims, examples, sources, sections, metrics, publication context,
or a more promotional/casual tone just to sound human.

Add grounding only from the provided text, author-known context, or explicitly
cited sources. If grounding is missing, keep the claim more general, ask for the
smallest missing fact, or mark the assumption.

## Evidence And Retrieval Budget

Default to the user-provided draft and nearby provided context.

Read external sources only when the user requests fact checking or citations,
provides a specific source to use, or the rewrite would otherwise require an
unsupported factual claim.

Do not search to improve phrasing, add decorative examples, or make the draft
sound more authoritative.

## Diagnosis Signals

Use these dimensions to diagnose sentences or passages that feel generated. Do
not force a five-part analysis for every sentence unless the user explicitly asks
for sentence-level review.

1. **Speaker**: who is saying this, and from what position?
2. **Reader**: what does the intended reader know, need, doubt, or resist here?
3. **Purpose**: what job does this sentence do in the paragraph?
4. **Grounding**: what observation, example, consequence, or choice makes it
   true?
5. **Voice**: does it sound like this author, or like a generic explainer?

Common AI-smell patterns:

- **No real speaker**: general rule or balanced conclusion with no authorial
  responsibility. Repair by restoring what the author chooses, refuses, tried,
  believes, or doubts.
- **No real reader**: explanation is too much, too little, or in the wrong order.
  Repair by adding the definition, reason, example, transition, contrast, or
  consequence needed at that point.
- **No selection**: prose lists all reasonable points instead of showing what the
  author decided to include or exclude. Repair by making priority visible.
- **No ground**: plausible conclusion floats above experience. Repair with what
  happened, failed, changed, cost something, or can be verified.
- **Too much symmetry**: balanced pairs, rule-of-three rhythm, repeated openings,
  identical category blocks, or mechanical contrast. Repair by varying rhythm and
  letting priority lead.
- **Fake intimacy**: cute, vivid, emotional, or conversational phrases that do
  not match the author's normal density. Repair by making the phrase quieter.

## Decision Rules

If the user asks for editing, edit directly and keep the final note brief.

If missing audience, author stance, source context, or publication context would
materially change the rewrite, ask one narrow question. Otherwise make the
smallest reasonable assumption and continue.

Use sentence-level diagnosis for reviews, short excerpts, or recurring local
problems. Use document-level passes for whole drafts.

Fix the dominant one to three smell patterns first. Stop before polishing the
draft into a different voice.

## Editing Heuristics

- Convert abstract claims into situated claims.
- Convert general rules into author choices.
- Convert balanced summaries into prioritized judgments.
- Convert vague improvement language into visible consequences.
- Convert mechanical transitions into real logical turns.
- Convert decorative personality into plain authorial stance.
- Convert repeated structures into varied paragraph rhythm.

Keep a sentence even if it contains abstract language when the abstraction is the
topic, the term is used consistently, surrounding sentences ground it, or
removing it would weaken precision.

Delete a sentence only when it repeats, smooths, praises, summarizes, balances,
or announces importance without adding logic or evidence.

## Output

When editing a file directly:

- make the edits
- briefly name the main smell patterns removed
- mention core terms, structure, or protected elements intentionally preserved
- mention concrete validation performed

When reviewing without editing, use a compact table and list only the highest
impact passages:

| Location | Cause | Why It Feels Generated | Suggested Rewrite |
|---|---|---|---|

Keep comments tied to exact sentences or passages. Do not use “AI味” as a
substitute for diagnosis.

## Validation

For file edits, inspect the diff for meaning preservation. Check protected
elements when present: frontmatter, headings, links, citations, code blocks,
diagrams, file paths, commands, schema fields, and technical terms.

For Markdown/docs edits, run `git diff --check -- <file>` when available and
relevant. If validation cannot run, say why and name the next best check.

## Stop Rules

Stop after the requested pass. Do not broaden into structural rewrite, fact
checking, citation work, translation, SEO, publishing advice, or style-system
redesign unless the user asks.

If the text is already authorial enough, say what was preserved and make only
minimal edits or no edit.
