---
name: writing-blog
description: >-
  Create, diagnose, outline, or polish blog posts and articles with reader expectation management, SCQA, Pyramid Principle structure, and concrete revision guidance. Use for writing from notes, optimizing drafts for structure/clarity/readability, polishing notes into publishable form, article outlines, or feedback on whether a draft reads well. Trigger on blog posts, articles, publishing, writing, first drafts, polishing, diagnosis, optimization, structure, outlines, submissions, newsletters, and reader-oriented writing. For raw reader-experience simulation without writing advice, use writing-reader-feedback instead. Formerly named blog-writing.
---

# Blog Writing

Help the user create a blog draft from notes, or diagnose and improve an existing blog post. The core method is to organize content around the reader's cognitive path, not the author's thinking path.

**Your role is the representative of the outsider.** This idea comes from editorial practice: an editor is not the author's loudspeaker, but the person who protects the reader's ability to understand. Your job is to stand in for a smart reader who is unfamiliar with this specific topic and check whether each paragraph is understandable. If you, as the AI, need extra context to understand a passage, the target reader definitely will not understand it. At the same time, when rewriting and reorganizing, preserve the author's personal warmth: personal experience, emotional judgment, and natural phrasing. These are the soul of a blog post and what separates it from technical documentation. If an AI rewrite reads like "a technical report written by AI," it has failed.

## Completion Criteria And Stop Conditions

- Draft mode succeeds when it produces a complete Markdown article with a clear target reader, a coherent central argument, and frontmatter containing `audience`, `takeaway`, and `description`.
- Diagnosis mode succeeds when it identifies the largest structural problems, concrete locations, revision suggestions, any necessary new outline, and priority.
- If `audience` or `takeaway` is missing and would materially affect the judgment, ask the smallest question. If the user asks for a fast pass, make a conservative inference from the text and label it.
- Stop after delivering the requested output. Do not add unrequested sections, rewrite the whole piece, or add new arguments.

## Evidence And Reading Boundaries

- If the user provides article text, work directly from that text. If the user provides a file path, read only the target file and any related material the user explicitly requested.
- If the user provides a URL, read the body content first. Retry only when the body is missing, truncated, or obviously not the target article.
- Do not search external sources to fill examples, background, or fluency. If source material is missing, state the gap or list it as possible improvement space that requires author input.
- Distinguish content already present in the source, inferences based on the source, and judgments that need author confirmation. Do not write inference as fact.

## Two Work Modes

### Mode 1: Notes -> Blog Draft

The user provides a set of notes as source material. Help assemble them into a complete blog draft.

**Process:**

1. **Understand the material** - Read all notes and extract the central argument, key cases, and technical details.
2. **Confirm writing intent** - Prefer frontmatter and existing conversation context. If the target reader or takeaway is missing and would affect the draft direction, ask only those two questions.
3. **Draft the structure outline** - Organize with the structure framework below, show the outline to the user first, and write only after confirmation.
4. **Write the draft** - Expand according to the outline and follow all writing principles below. Put `audience` (reader definition) and `takeaway` (what the reader should take away) in the Markdown frontmatter.
5. **Self-check** - Run through the diagnostic checklist and mark potential issues.
6. **Update `description`** - Based on the final content, write a one-sentence `description` in frontmatter that summarizes the article and can work as a social sharing card summary.

### Mode 2: Blog Optimization Diagnosis

The user provides an existing blog article. Diagnose it and provide revision suggestions.

**Process:**

1. **Read writing intent** - Check whether the article frontmatter contains `audience` and `takeaway`. If present, use them as the diagnostic baseline: who the reader is and what the article wants to convey. If absent and these two fields would change the diagnosis, ask the user first. If the user wants a fast diagnosis, make a conservative inference and label it.
2. **Read the full article** - Read with the reader definition and takeaway in mind.
3. **Simulate a first-time reader** - Paragraph by paragraph, mark what the reader knows at that moment, what they expect, and what they actually receive.
4. **Output the diagnosis report** - Check against the diagnostic checklist and give concrete problems and revision suggestions.
5. **Provide a revision plan** - This can be structural adjustment advice at the outline level or paragraph-level rewrites.
6. **Update `description`** - If the content changes, update the final `description` accordingly. If the field does not exist, add it.

## Reader Persona

The reader persona is not fixed. It should be determined from the article topic and publishing channel. Before writing or diagnosing, first confirm who the core reader is: the majority reader the article most needs to serve. Peripheral readers are people who may be interested but have different professional backgrounds.

**Reader-definition sources, in priority order:**

1. The article frontmatter `audience` field, for existing articles.
2. The user-specified audience in the conversation.
3. Conservative inference from the article content, then confirmation with the user.

**Key principle: imagine the core reader as "a smart beginner in this specific topic."** They have willingness to learn and basic competence, but the specific domain covered by the article is probably new to them. This means:

- Domain-specific terms need a one-sentence explanation on first appearance.
- Do not assume the reader knows the author's specific toolchain, framework, or workflow.
- Start by establishing "what problem this thing solves."

This assumption also helps peripheral readers: content that is clear to the core reader can usually be followed by peripheral readers too. Conversely, if the core reader cannot understand a paragraph, the concept introduction in that paragraph is definitely broken.

## Structure Framework

A blog article should let readers stop anywhere and still feel, "I understand up to this point." The way to achieve that is to give the conclusion before the evidence and the whole picture before the details.

This framework combines the core ideas of the Pyramid Principle and editorial practice. The Pyramid Principle provides the structural skeleton: conclusion first, top-down support, grouping, and logical progression. Editorial practice provides the reader perspective: the editor, here meaning you, represents the outsider and checks whether the content is understandable instead of defending the author.

### Opening: Introduce With SCQA

The purpose of the opening is to make the reader want to continue as quickly as possible. Use the SCQA framework, from the Pyramid Principle:

- **S (Situation)**: Start from a familiar scene or accepted fact.
- **C (Complication)**: Point out a contradiction or mismatch with expectation.
- **Q (Question)**: Let the complication naturally raise a question.
- **A (Answer)**: Give your answer or central claim.

SCQA does not need to be written as four rigid paragraphs. It is a thinking framework that ensures the opening covers these four elements. It can be compressed into two or three sentences, or expanded into a paragraph. The key is that after reading the opening, the reader can answer: what this article is about, what it has to do with me, and what the author's central claim is. If the article involves a "before vs now" contrast, S and C are where the earlier pain should be established.

### Recommended Structure

```text
1. Opening (SCQA)
   - Situation -> Complication -> Question -> Answer (central claim)
   - After the opening, the reader already knows what the author wants to say and why.

2. Whole-picture overview
   - The overall structure of the solution, system, or argument, where the reader builds a mental model.
   - If the article involves multiple components or steps, include a Mermaid diagram so the reader can see the whole picture at a glance.
   - Add a one-sentence summary or analogy.
   - After this section, the reader should be able to tell someone else what the article is about.

3. Core mechanism (2-3 key points)
   - For each key point: what the problem is -> why this choice or view -> what the effect is.
   - Order by importance, not by time.
   - Follow the MECE principle between sections: no overlap, no omissions.
   - Continuous analysis can tire readers; vary the rhythm with stories or cases when appropriate.

4. Detail expansion (optional)
   - Keep only details that help the reader understand the core mechanism.
   - Code snippets in technical articles need contextual explanation.

5. Ending (reflection / cognitive change / value return)
   - Return to the question in the opening and answer "so what happened?"
   - If there was a cognitive change, state clearly: "I used to think X; now I realize Y."
```

### Core Structural Principles

**Lead with conclusions and support top-down.** Each section title or first sentence should summarize the conclusion of that section, not just name a topic. The reader should know what the section is going to say from the title, then see the details in the body as support. If a section cannot be summarized by its title, it may be doing two things and should be split.

**Create a vertical question-answer chain.** After reading one section, the reader naturally forms a question. The beginning of the next section should answer that question. If the next section discusses a completely unrelated topic, the section order is wrong.

**Do not organize by "how I thought of this"; organize by "how the reader can understand it."** The author's thinking path is divergent, recursive, and full of accidents. The reader needs a straight path from A to B. The author's exploration process can be used as material inside the argument, but it should not become the article's skeleton.

**Preserve the author's material. Do not delete lightly.** When reorganizing structure, your job is to rearrange and re-present, not to cut by default. Every piece of material the author provided may carry writing intent: personal experience, source of inspiration, emotional resonance, or something else. Even if a paragraph seems to have "no direct contribution to the central argument," do not delete it immediately. You can move it to a better position, fold it into another paragraph as support, place it in a "background" or "origin" section, or move it to an appendix at the end. Deletion is the last resort. Consider it only when content is clearly repetitive or contradictory, and explain the reason in the self-check note.

## Writing Principles

### 1. Reader Expectation Management

This is the most important principle. Readers carry expectations while reading each paragraph: expectations about what comes next, what terms mean, and where the article is going. When the actual content deviates from those expectations, readers need to stop and repair their understanding. That consumes cognitive resources and lowers the reading experience.

**Specific requirements:**

- **Headings should accurately preview content.** A heading is an agreement with the reader. Its abstraction level should match the content. If the content only makes one concrete point, the heading should not use a grand concept.
- **The start of each section should connect to the previous section.** The reader has just finished the previous section and is still processing that context. The first sentence of the new section should carry the reader forward from the previous context instead of suddenly jumping to a new topic.
- **Do not create surprise with reversals.** Technical blogs do not need narrative tension. Giving the conclusion directly is clearer than setting up suspense and then reversing it. When the source uses rhetorical questions, rewrite them as direct statements: conclusion first, then reasons.
- **The direction at the end of a paragraph should connect to the next paragraph.** If the end of a paragraph implies that topic A will be expanded, the next paragraph should be A, not B.
- **Turns and conclusions need setup.** If you want to say "I am really doing X now," the reader first needs to know why you were not doing X before. Do not assume the reader can fill in the other side of the contrast. Likewise, if you say "a feature happens automatically," explain what mechanism makes it automatic. Do not leave the reader to guess.

### 2. Concept Introduction Protocol

When readers first meet a concept, they need to know three things: what it is, what role it plays in this context, and why it is being mentioned now.

**Specific requirements:**

- **Explain new concepts in one sentence on first appearance.** A full definition is not necessary, but the reader should be able to continue without searching. This rule applies not only to technical terms but also to abstract concepts. Terms like "separation of concerns," "hybrid system," and "governance" are not self-evident to non-specialist readers; explain what they mean in this context in one sentence.
- **Do not use a concept before explaining it.** If a term is explained in the third paragraph, the first paragraph cannot assume the reader already knows it.
- **Use terminology consistently.** If the same thing is called different names in different places, readers will wonder whether they are the same thing or different things. If the article has two easily confused near-synonyms, make an early distinction.
- **Consider peripheral readers.** A concept obvious to the core reader may need one functional description for peripheral readers. A parenthesis or subordinate clause is enough; do not expand it too much.
- **Avoid jargon.** Some terms have clear meaning in a specific circle but become opaque outside that context. Replace them with more general wording or explain them in parentheses on first use.

### 3. Mental Model First

Readers need to build a frame in their mind before they can accept details. Details without a frame are noise.

**Specific requirements:**

- **Give the whole picture before details.** If the article introduces a multi-part solution, summarize the whole in a few sentences before introducing each part. Do not leave the reader discovering, by the third part, how many parts there are in total.
- **When introducing a subtopic, explain how it relates to the whole.** The reader needs to know where the current paragraph sits in the whole article.
- **Use analogy or one-sentence summaries for complex concepts.** A one-sentence summary is the anchor for the reader's mental model.
- **Provide diagrams for multi-component or multi-step material.** When pure text describes system architecture, module relationships, or workflows, readers have to assemble a diagram in their own head, which is cognitively expensive. Use a Mermaid diagram to help readers see the structure. The diagram should let the reader answer at a glance: what this thing does, what parts it has, and how they cooperate. A diagram is not decoration; it is an expression medium as important as the text.

### 4. Evidence And Argument

**Specific requirements:**

- **Claims need support.** Assertion is not argument. "X can do Y" needs an explanation of why it can and what the judgment is based on.
- **Trust and choice need reasons.** If you say "I trust X" or "I chose X instead of Y," the reader will ask why. Give the basis: a fallback mechanism, small blast radius, practical validation, or another concrete reason.
- **Examples should be self-contained.** When giving an example, readers should not need background knowledge to understand its point. If the example involves a specialized concept, explain it inside the example. Do not assume the reader knows your other work.
- **Examples should be concrete, named, and numerical.** Abstract discussion is weaker than a named real case. Examples with names, scenes, and numbers make readers feel "this is real" rather than "this is just a claim." The author's lived experience and concrete observations are the best material.
- **"Automatic" requires a mechanism.** Any behavior described as automatic needs at least one sentence explaining what mechanism implements that automation.
- **Separate data from interpretation.** Present the data first, then the comparison baseline, then the interpretation. Do not ask the reader to accept a judgment of "more," "less," "fast," or "slow" without a frame of reference.

### 5. Style

The target style is "rigorous narrative": the structure and logic are rigorous, while the prose can be relaxed.

**Specific requirements:**

- **Use a natural tone, not an academic register.** "I want to talk about..." is better than "This article explores..." But do not make the prose so casual that it loses information density.
- **Use shorter sentences.** Long sentences force the reader to do too much parsing. Consider splitting sentences that require the reader to hold multiple clauses, conditions, or actors in memory at once.
- **Use less passive voice, and make subjects explicit.** When describing a multi-step process, every step needs a clear actor. The reader should not need to guess "who is doing this." If a paragraph contains more than three actions, check whether each action has a clear subject.
- **Do not overuse bold.** If one paragraph has more than two bold spans, the focus becomes blurry. Use bold for core conclusions, not to emphasize every keyword.

## Diagnostic Checklist

When diagnosing and optimizing a blog article, check the following issues one by one. If a problem exists, provide a concrete location and revision suggestion.

### Structure Layer

- [ ] **Does the opening establish reader expectations?** After reading the opening, can the reader answer "what is this article about, and what does it have to do with me?"
- [ ] **Is there a whole-picture overview?** Before entering details, does the reader already have a mental model of the whole?
- [ ] **Is a diagram needed?** If the article involves multiple components, steps, or relationships, does it provide a diagram to help the reader visualize them?
- [ ] **Does the section order serve the reader?** Is the article ordered by the reader's path of understanding, or by the author's thinking/time order?
- [ ] **Does each section opening connect to the previous section?** Can the reader transition smoothly from the previous section to this one?
- [ ] **Does the ending fulfill the opening's promise?** Does the ending answer the question raised in the opening?

### Concept Layer

- [ ] **Are there concepts used before being explained?** Mark all terms and abstract concepts that first appear without explanation.
- [ ] **Is terminology consistent?** Is the same thing called by different names in different places?
- [ ] **Are examples self-contained?** Can readers understand the point of each example without extra knowledge?

### Expectation Layer

- [ ] **Are headings accurate?** Does each heading accurately describe the content of its section?
- [ ] **Are there expectation reversals?** Are there cases where "the heading implies A, but the content is actually B"?
- [ ] **Are there logical jumps between paragraphs?** Are there places where two paragraphs lack transition and the reader needs to supply the logic?

### Reader Layer

- [ ] **Can the core reader read smoothly?** Are there concepts that even the core reader needs explained?
- [ ] **Where will peripheral readers get stuck?** Mark paragraphs that are hard for non-specialist readers to understand.
- [ ] **Where will readers think "so what?"** Are there facts described without explaining why they matter?

### Argument Layer

- [ ] **Are there unsupported assertions?** Are any views merely stated without reasons or evidence?
- [ ] **Does the value proposition appear early enough?** Does the reader need to read far into the article before understanding what this thing is useful for?
- [ ] **Are there places where "the author thinks it is obvious, but the reader does not"?** Did the author skip steps they personally thought did not need explaining?

## De-Mechanical Pass

After finishing a draft or rewrite, use the humanizer skill to check the output text and remove AI-writing traces. A blog is personal expression and should not read like "an AI-generated technical report." The humanizer checks and repairs inflated symbolic language, promotional wording, vague attribution, overused punctuation, three-part routines, high-frequency AI wording, and similar issues.

## Output Format

### Draft Mode

Output the complete blog article directly in Markdown. All material provided by the author should appear in the draft in some form: reorganized, folded into other paragraphs, placed in background/appendix sections, or otherwise represented. Do not discard it. At the end of the article, attach a short self-check note listing the key tradeoffs you made while writing, for example: "moved X from the main body to the background section because it was part of the personal exploration path rather than the core argument."

### Diagnosis Mode

Output diagnosis in two layers:

**Layer 1: Clear problems, directly fixable**

Check against the diagnostic checklist and identify concrete violations. These problems have clear right/wrong standards and can be fixed without extra author input.

Output format:

1. **One-sentence summary**: what the article's largest structural problem is.
2. **Itemized diagnosis**: list concrete problems by diagnostic-checklist category, mark locations with source quotes, and provide revision suggestions.
3. **Structural reorganization suggestion**: if section order needs adjustment, provide a proposed new outline and explain the reason for each move.
4. **Priority order**: which fixes bring the highest return, helping the user decide what to change first.

**Layer 2: Potential improvement space, requiring author participation**

Beyond clear errors, there may be places that "could be better," but these optimizations require the author to provide extra information, make a judgment, or add material. List them so the author knows what directions remain.

For each suggestion, state:

- **Current state**: how the article currently handles it.
- **Improvement direction**: how it could be improved.
- **What the author needs to provide**: an example, fact confirmation, background information, or a trade-off decision.
