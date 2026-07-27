# Blog Diagnosis

Use this reference when the user asks for article critique, review, diagnosis,
structure feedback, readability feedback, or whether a draft reads well.

## Scope

Report the largest fixable problems, not every problem. Do not produce a full
rewrite unless the user asks for one.

## Diagnostic Workflow

1. Read writing intent from `audience`, `takeaway`, conversation context, or a
   conservative labeled inference.
2. Read the full article with the core reader in mind.
3. Simulate a first-time reader at the article level: what they know, what they
   expect next, and where the article breaks that expectation.
4. Check the layers below and report only problems that appear.

## Diagnostic Checklist

### Structure Layer

- Does the opening let the reader answer what the article is about and why it
  matters?
- Does the article give the whole picture before details?
- Is a diagram needed for components, steps, relationships, architecture, or
  workflow?
- Does section order follow the reader's understanding path rather than the
  author's thinking or time order?
- Does each section opening connect to the previous section?
- Does the ending fulfill the opening's promise?

### Concept Layer

- Are concepts used before being explained?
- Is terminology consistent?
- Are near-synonyms distinguished early enough?
- Are examples self-contained?
- Do peripheral readers need a short functional explanation?

### Expectation Layer

- Do headings accurately preview their sections?
- Does the article create surprise through reversals where direct conclusion
  would be clearer?
- Do paragraph endings set up the next paragraph correctly?
- Are transitions missing where the reader must supply logic?

### Reader Layer

- Can the core reader read smoothly?
- Where will peripheral readers get stuck?
- Where will readers think "so what?"
- Where does the article enter details before motivation exists?

### Argument Layer

- Are claims supported?
- Are trust and choice explained with concrete reasons?
- Are examples named, concrete, and specific enough when specificity is needed?
- Does any claim about automatic behavior explain the mechanism?
- Are data, baseline, and interpretation separated?

## Output Shape

Return diagnosis in two layers.

### Layer 1: Clear Problems, Directly Fixable

1. One-sentence summary of the largest structural or readability problem.
2. Itemized findings grouped by the relevant checklist layer. Each finding
   should include a location, reader impact, and revision suggestion.
3. Structural reorganization suggestion at outline or paragraph level when
   section order or paragraph flow needs adjustment.
4. Priority order for the highest-return fixes.

### Layer 2: Potential Improvement Space

Use this layer only for improvements that require author input, factual
confirmation, examples, or value decisions.

For each item, state:

- Current state
- Improvement direction
- What the author needs to provide
