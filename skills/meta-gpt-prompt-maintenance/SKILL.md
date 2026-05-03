---
name: meta-gpt-prompt-maintenance
description: >-
  Maintain, audit, rewrite, or upgrade prompt artifacts for GPT-series models.
  Use when adapting existing prompts to current OpenAI GPT prompt guidance;
  polishing SKILL.md files, AGENTS instructions, system/developer prompts,
  product assistant prompts, reusable agent workflows, eval prompts, or grader
  prompts; or reducing legacy process-heavy prompt stacks into clearer
  outcome-first instructions. Do not use for ordinary prose editing,
  model-agnostic prompt advice, new skill creation from scratch, or deciding
  where durable context belongs before a target prompt artifact is chosen.
---

# GPT Prompt Maintenance

## Goal

Maintain prompt artifacts so GPT-series models receive clear, outcome-first
instructions with enough constraints, evidence guidance, validation, and stop
rules to complete the user's requested work without unnecessary process noise.

## Success Criteria

A good prompt-maintenance result:

- Preserves the target artifact's intent, audience, scope, and authorization
  boundary.
- Defines the outcome, success criteria, constraints, evidence or retrieval
  budget, output shape, validation expectations, and stop rules when they affect
  behavior.
- Removes or compresses legacy process-heavy instructions unless order is
  required for correctness.
- Reserves absolute words such as `always`, `never`, `must`, and `only` for true
  invariants: safety, exact output contracts, irreversible actions, required
  fields, or tool syntax.
- Keeps personality and collaboration guidance short enough to shape behavior
  without replacing the task goal.
- Makes model-specific claims only from user-provided guidance, official OpenAI
  documentation, or explicitly labeled inference.
- Reports what changed, what was validated, and what was intentionally left
  outside scope.

## Boundaries

Use this skill after there is a prompt artifact to maintain: a `SKILL.md`, rules
file, system/developer prompt, product prompt, agent workflow prompt, eval
prompt, grader prompt, or comparable reusable instruction block.

Use `skill-creator` instead when the main task is to create a brand-new skill,
design skill evals, benchmark a skill, or optimize skill triggering from scratch.

Use `meta-context-engineering-global` or `meta-context-engineering-project` when
the main question is where a rule belongs: global rules, project rules, a skill,
tooling, task context, or an external system. Use this skill once the prompt
artifact is selected or when the requested work is specifically GPT prompt
quality.

Use writing or editing skills for ordinary prose polishing. Do not turn blog
drafts, documentation prose, customer copy, or creative writing into prompt
maintenance unless the text is itself an instruction to a model.

Do not broaden the artifact's behavior, target model family, tool access,
external side effects, sync state, commits, deployment, or persistent
configuration unless the user explicitly asks.

## Evidence And Retrieval Budget

Read the target prompt artifact first. If the task mentions a current GPT model,
OpenAI prompt guidance, migration, or model-specific behavior, read the
user-provided guidance or current official OpenAI documentation before making
model-specific edits.

Continue retrieval only when:

- a required source artifact, prompt version, model target, or product surface is
  missing
- the prompt's current behavior depends on tool contracts, surrounding rules,
  code, or eval results
- the user asks for comprehensive coverage, batch migration, or comparison
- a model-specific recommendation would otherwise be unsupported

Stop retrieval once the core rewrite can be justified. Do not search again for
phrasing, decorative examples, or noncritical background.

When the source is a local file supplied by the user, prefer that file over
web search. Use official OpenAI sources for external refreshes unless the user
requests another source.

## Prompt Types

### Agent Or System Prompts

Optimize for role clarity, collaboration style, tool behavior, evidence
discipline, validation, and stop conditions. Keep personality short. Separate
how the assistant sounds from how it works.

For long-running or tool-heavy workflows, include a short user-visible preamble
rule when the host supports intermediate messages. For Responses API workflows
that replay assistant items manually, preserve `phase` values exactly when the
artifact controls replay behavior.

### Product Assistant Prompts

Define the user's visible outcome, what completion means, what actions are
allowed, and what the final answer should contain. Include fallback behavior for
missing evidence, unavailable tools, or unsupported requests.

For customer-facing text, define tone and length, but do not let tone
instructions obscure policy, evidence, or action boundaries.

### Agent Workflow Prompts

Prefer decision rules over fixed sequences. Keep required order only for fragile
operations, safety checks, exact tool syntax, validation integrity, or
irreversible side effects.

For coding agents, require concrete validation commands when available and an
explicit explanation when validation cannot run.

### Skill Prompts

For `SKILL.md`, keep frontmatter `description:` focused on trigger conditions,
near-miss exclusions, and routing. Put reusable workflow guidance in the body.

The body should start with outcome and constraints before process. Keep
references, large examples, scripts, and domain-specific details outside
`SKILL.md` when progressive disclosure would reduce context load.

When modifying existing skills, preserve name continuity and existing aliases
that still help triggering. Do not rename directories, update indexes, or sync
installed skills unless the user asked for those operations.

### Eval And Grader Prompts

Make the task, inputs, scoring criteria, and output schema explicit. Avoid
leaking expected answers into the prompt under test unless that is the purpose of
the eval. Keep grading rubrics atomic enough that pass/fail evidence is
inspectable.

## Audit Checklist

Before rewriting, identify which defects actually matter for the user's goal:

- missing or vague target outcome
- success criteria buried in process steps
- over-specified sequence where judgment would be better
- unbounded search, tool use, retries, or iteration
- unsupported claims about models, users, policy, product facts, or data
- broad `always` / `never` rules used for judgment calls
- personality text that is longer than the task contract
- formatting instructions that make simple answers too heavy
- no validation path for code, data, visual, or document outputs
- no stop condition after enough evidence is collected
- prompt content that changes the artifact's product behavior without
  authorization

Do not force every prompt into the same template. Add sections only when they
change behavior or make maintenance safer.

## Rewrite Rules

Preserve the artifact's requested behavior first. Improve clarity, ordering,
and enforceability without adding new product requirements, facts, capabilities,
tools, or obligations.

Use the shortest structure that covers the real risk:

```text
Role:
Goal:
Success Criteria:
Constraints:
Evidence:
Output:
Stop Rules:
```

For small prompts, this can be compressed into a few paragraphs. For durable
agent prompts, explicit headings are usually worth the space.

Convert brittle sequences into decision rules:

- Bad: first do A, then B, then C, then explain every step.
- Better: collect the minimum evidence needed to answer; continue only if a
  required fact is missing, sources conflict, or the user requested exhaustive
  coverage.

For retrieval, include a budget:

```text
Read the directly relevant source first. Make another retrieval call only when a
required fact, source, ID, date, parameter, or comparison target is missing.
Stop once the core answer can be supported.
```

For rewriting, summary, and customer-facing outputs, state what to preserve:

```text
Preserve the requested artifact, length, structure, genre, and factual claims.
Improve clarity and flow without adding new claims, extra sections, or a more
promotional tone unless explicitly requested.
```

For creative drafting, separate source-backed facts from allowed creative
wording. Use placeholders or labeled assumptions instead of inventing metrics,
customer names, roadmap status, capabilities, or dates.

For reasoning guidance, ask for concise rationale, checks, or evidence in the
final answer when useful. Do not ask the model to reveal hidden chain of
thought.

## Batch Maintenance

When maintaining multiple prompt artifacts, process each artifact on its own
terms. Do not collapse all artifacts into one common rewrite unless the user asks
for a shared template.

For each artifact:

- read the current file
- identify its task, audience, tools, risks, and near-miss exclusions
- decide which GPT prompt-guidance rules apply
- edit only the needed parts
- validate that local naming, schemas, or index rules still hold

If the user asks for independent review per artifact, create one worker per
artifact when available and aggregate their findings. If worker capacity is
limited, batch workers and record the batching constraint. Do not pretend a
single local pass was independent worker review.

## Validation

Choose validation that matches the artifact:

- For edited files, inspect the diff for accidental scope expansion.
- For `SKILL.md`, verify frontmatter `name:` matches the directory and that
  trigger descriptions are still focused on use and near-miss exclusions.
- For added, removed, or renamed skills, update the repo's public index if the
  repo has one, then run the repo's skill inventory and stale-name checks.
- For coding-agent prompts, include or run relevant test, typecheck, lint,
  build, or smoke-test commands when the prompt change is tied to code behavior.
- For visual or document prompts, render or inspect the artifact when feasible.
- For eval or grader prompts, test at least one should-pass and one should-fail
  case when practical.

If validation cannot run, say why and name the next best check.

## Output

For rewrite tasks, provide:

- changed files or rewritten prompt text
- concise summary of behavioral changes
- validation performed
- any intentionally excluded work

For review-only tasks, lead with findings ordered by impact, then give concrete
rewrite recommendations. Say that no files changed.

For batch work, summarize per artifact. Avoid hiding individual decisions behind
a generic theme.

## Stop Rules

Stop when the requested prompt artifacts are rewritten or reviewed, evidence and
validation status are stated, and out-of-scope improvements are separated.

Ask one narrow question only when missing information would change the target
artifact, model family, product behavior, authorization boundary, or validation
claim.

Do not keep optimizing wording after the prompt is already clear, scoped,
supported, and testable.
