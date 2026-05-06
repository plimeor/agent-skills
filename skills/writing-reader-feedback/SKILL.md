---
name: writing-reader-feedback
description: >-
  Simulate a specified reader persona reading an article section by section and report raw reading-experience feedback, not writing advice. Use when the user asks how a specific audience would experience a draft, whether readers can understand it, or wants reader role-play. Trigger on reader simulation, reader feedback, reader perspective, whether readers can understand a piece, reading experience, or testing how a target reader reacts. For general writing improvement, draft polishing, or structural optimization, use writing-blog instead. Formerly named blog-feedback.
---

# Writing Reader Feedback

## Goal

Simulate a real reader reading an article in order, section by section, with the background and knowledge state specified by the user. The task is not to give writing advice. The task is to record what happens in the reader's mind: expectations, confusion, expectation shifts, lack of interest, emotional reaction, and motivation to continue.

The deliverable is a reading-experience report that records the reader's experience at each section.

Use the user's primary language for the report unless they ask for another language.

## Success Criteria And Stop Condition

Success means covering every reading unit in article order, recording the reader's current expectations, confusion, emotion, and motivation to continue, then ending with an overall impression.

Stop after the full article has been read and the overall impression has been reported. Do not turn the output into writing advice, a revision plan, fact checking, or polishing unless the user separately asks for that.

## Evidence And Reading Boundaries

- If the user provides article text directly, use that text.
- If the user provides a file path, read only the target file.
- If the user provides a webpage URL, use `ops-url-reader` or `WebFetch` to get the body content. Retry only when the body is missing, truncated, or obviously not the target article.
- Do not search external sources to fill in missing background for the reader. Missing reader background should appear as confusion, misunderstanding, or lack of interest, not be silently repaired.
- If the article cannot be read, state the blocker and ask the user for the text or a usable source.

## Workflow

### 1. Get The Article

The user may provide a file path or webpage URL:

- **File path**: read the target file.
- **Webpage URL**: use `ops-url-reader` or `WebFetch` to extract the body text.

### 2. Establish The Reader Persona

Use reader-definition sources in this priority order:

1. Reader background specified by the user in the conversation.
2. The article frontmatter `audience` field.
3. A conservative inference from the article context.

For any source, identify:

- **Professional background**: field and technical level.
- **Topic familiarity**: completely new, has heard of it, or has practical experience.
- **Reading scenario**: casually opened from a feed, actively searched in a technical community, received from a friend, or another relevant scenario.

Ask one narrow question only when missing reader information would materially change the feedback. Otherwise state the assumption and continue.

After confirming the persona, write down what this reader knows and does not know. Use that list as the baseline for the whole simulation.

### 3. Split The Article

First scan only the heading structure. Do not read the full body yet. Find the smallest heading level present; if the article has both h2 and h3 headings, split by h3.

Splitting rules:

- Split into reading units by the smallest heading level.
- Treat the opening text before the first heading as its own unit.
- If a section is longer than 15 lines, split it further by paragraph.

Record the section list, then begin reading section by section.

### 4. Read Section By Section

Read one section at a time. Read the current line range, immediately write the reader feedback for that section, then move to the next section.

Do not use later content to repair earlier experience. If you read the whole article at once, you already know what comes later and can no longer honestly report "at this point I expected the next section to explain X." If the full article is already in context, still simulate first-pass reading: for each section, only use what the reader could know, guess, misunderstand, or expect at that point.

After each section, ask:

- What new concept did this section introduce? Would this reader know it?
- What do I expect the next section to cover?
- Did the actual direction break my expectation?
- Is any subject, actor, or premise omitted?
- Do I want to keep reading right now? If not, why?
- How dense is this section? Which sentences force me to pause?

### 5. Output Shape

Start with a concise reader model:

```markdown
## Reader Model
- Background:
- Topic familiarity:
- Reading scenario:
- Knows:
- Does not know:
```

For each section, use this shape:

```markdown
## <section title or "Opening"> (L<start>-L<end>)

<sentence-level reader reactions>
```

Cover these dimensions when they occur:

- **Expectation**: what I expected the next section to cover.
- **Expectation shift**: what the section actually did and how it differed.
- **Confusion**: words or concepts I do not understand.
- **Lack of interest**: why I do not currently want to understand this part.
- **Missing context**: the text assumes I know X, but I do not.
- **Missing subject**: who is acting here - a person, agent, system, or something else?
- **Cognitive load**: the information is dense enough that I need to pause.
- **Emotion**: curiosity, agreement, doubt, impatience, irritation, excitement, or wanting to close the page.
- **Look-back impulse**: what I want to reread.
- **Active guessing**: what I have to guess because the article did not explain it.
- **Visual expectation**: where I expect a diagram, example, or code.

Within each section, record sentence-level reactions for sentences that create a real cognitive event. Smooth sentences can be noted briefly or skipped. Focus on friction.

### 6. Overall Impression

After finishing the article, add an overall impression:

- **Main value**: what I remember after reading.
- **Main confusion**: what remains unresolved.
- **Expectation management**: where the article helped me form the right expectation, or whether I kept revising my expectation throughout.
- **Information gaps**: what I still need in order to fully understand the article.

## Discipline

Stay faithful to the reader persona. It is better to be too confused than too understanding. You, as the AI, may know a lot, but the simulated reader may not. If the article does not explain a concept and the reader background does not include it, the reader does not understand it. Do not complete the author's logic silently. If the reader has to guess, that guess is friction.

Use the reader's plain voice, not an analyst's voice. The feedback should be direct, colloquial, and sometimes blunt:

- "I do not understand this."
- "I do not care about this right now."
- "Wasn't the previous section about X? Why are we suddenly on Y?"
- "So what?"
- "This is getting annoying."

A reader can be impatient, irritated, or ready to close the page. If the whole report sounds polite and analytical, it is no longer a reader simulation; it is a review.

"I do not care" matters more than "I do not understand." Sometimes the problem is not comprehension but motivation: the setup is weak, confusion has built up, or the article moves into details before the high-level shape is clear. Record that directly.

Expectation tracking is the core capability. After each section, state what the reader expects next. If the actual content diverges, record the divergence. This reveals structural problems more clearly than wording comments.
