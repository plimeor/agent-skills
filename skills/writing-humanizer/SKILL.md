---
name: writing-humanizer
description: >
  Humanize Chinese or English drafts from first principles, especially Chinese
  technical essays, reflective notes, blog posts, and documentation that feel
  generated, over-polished, too symmetrical, or detached from the author's real
  judgment. Use this skill whenever the user asks to make writing "less AI",
  "more human", "more natural", "去 AI 味", "像人写的", "自然一点", "不像 AI 写的",
  "读起来怪", "人味一点", or to polish AI-generated writing without changing the
  core meaning. This skill prioritizes author intent, reader fit, sentence
  function, evidence, and voice over third-party AI-word checklists.
---

# Writing Humanizer

Use this skill to make a draft sound authored rather than generated.

Do not treat humanizing as synonym replacement or removal of forbidden words. Human writing is not defined by the absence of AI vocabulary. It is defined by fit: a real speaker, talking to a real reader, under a real purpose, with selective evidence and lived judgment.

## First Principles

A sentence sounds human when it has a clear reason to exist.

For every sentence, recover five things:

1. **Speaker**: who is saying this, and from what position?
2. **Reader**: what does the intended reader know, need, doubt, or resist here?
3. **Purpose**: what job does this sentence do in the paragraph?
4. **Grounding**: what observation, example, consequence, or choice makes it true?
5. **Voice**: does it sound like this author, or like a generic explainer?

If a sentence cannot answer at least purpose plus one of speaker, reader, or grounding, it is probably filler.

## What Creates AI Smell

AI smell usually comes from a mismatch between the sentence and the writing situation.

### 1. No Real Speaker

The sentence declares a general rule, principle, or balanced conclusion, but nobody seems to be taking responsibility for it.

Fix by recovering the speaker's actual stance:

- what the author chooses
- what the author refuses
- what the author has tried
- what the author now believes
- what the author is still unsure about

### 2. No Real Reader

The sentence explains too much, too little, or in the wrong order because it is written for an abstract audience.

Fix by asking what this reader needs at this exact point:

- a definition
- a reason
- an example
- a transition
- a contrast
- permission to skip detail
- a concrete consequence

### 3. No Selection

The prose lists all reasonable points instead of showing what the author actually decided to include or exclude.

Fix by making choices visible:

- keep the strongest point
- delete the polite extra point
- merge repeated claims
- move optional material out of the main line
- explain why this point matters now

### 4. No Ground

The sentence sounds plausible but floats above experience. It uses conclusion words without showing the observation that earned them.

Fix by adding or restoring grounding:

- what happened
- what failed
- what changed
- what cost appeared
- what the author noticed
- what the reader can verify

### 5. Too Much Symmetry

The paragraph is organized more neatly than thought usually is: balanced pairs, rule-of-three rhythm, repeated openings, identical category blocks, or mechanical contrast.

Fix by varying the rhythm and allowing priority:

- make one point primary
- shorten or delete weaker parallels
- break repeated sentence shapes
- remove decorative labels
- let the order follow the reader's question, not the template

### 6. Fake Intimacy

The text tries to sound human through cute, vivid, emotional, or conversational phrases that do not match the author's normal density.

Fix by making the phrase quieter. Human does not mean chatty. It means situated.

## Rewrite Rules

Use the smallest edit that restores fit.

### Preserve

- the core claim
- the author's stance
- technical precision
- concrete examples
- useful terminology
- links, citations, code, diagrams, frontmatter, and file paths
- the existing outline unless structure is part of the problem

### Change

- unclear subjects
- abstract noun piles
- rule-like declarations
- ornamental transitions
- repeated contrast frames
- over-balanced categories
- endings that only restate the title
- phrases that pretend to be personal but feel pasted on

### Delete

Delete a sentence when it only:

- announces that something is important
- repeats the previous sentence in broader words
- smooths a transition without adding logic
- praises, summarizes, or balances without evidence
- exists because a template expected a conclusion

### Keep

Keep a sentence even if it contains abstract language when:

- the abstraction is the topic
- the term is used consistently
- the surrounding sentences ground it
- removing it would make the argument less precise

## Practical Workflow

1. **Read once for intent**: identify the piece's purpose, reader, speaker, and central vocabulary.
2. **Read sentence by sentence**: mark sentences that lack speaker, reader fit, purpose, grounding, or voice.
3. **Name the cause**: do not say only "AI味"; name the failure, such as no speaker, no ground, too symmetrical, fake intimacy, or generic transition.
4. **Rewrite locally**: fix the smallest unit that creates the smell.
5. **Scan for repetition**: after local edits, search for repeated sentence shapes and repeated thesis language.
6. **Verify preservation**: confirm that meaning, evidence, structure, links, and technical terms survived.

## Editing Heuristics

- Convert abstract claims into situated claims.
- Convert general rules into author choices.
- Convert balanced summaries into prioritized judgments.
- Convert vague improvement language into visible consequences.
- Convert mechanical transitions into real logical turns.
- Convert decorative personality into plain authorial stance.
- Convert repeated structures into varied paragraph rhythm.

## Output Contract

When editing a file directly:

- make the edits
- briefly name the main smell patterns removed
- mention any core terms intentionally preserved
- mention how you verified the result

When reviewing without editing:

Use a compact table:

| Location | Cause | Why It Feels Generated | Suggested Rewrite |
|---|---|---|---|

Keep comments tied to the exact sentence. Do not use "AI味" as a substitute for diagnosis.

## Quality Bar

A good rewrite:

- sounds like the same author
- keeps the original argument
- preserves useful density
- makes the sentence's job clearer
- adds grounding only where needed
- removes mechanical smoothness
- leaves the draft less generated, not more generic

A failed rewrite:

- follows a checklist of AI words
- swaps synonyms without changing sentence function
- removes all abstraction and weakens the argument
- turns technical writing into casual chat
- invents personality the author did not show
- over-edits local wording while missing repeated document-level patterns
