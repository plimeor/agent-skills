---
name: meta-context-engineering-global
description: >-
  Review, prune, or rewrite global rules files such as global AGENTS.md or
  ~/.claude/CLAUDE.md. Use when deciding whether durable behavior rules belong in
  the global context layer across tasks, projects, and sessions; when diagnosing
  repeated collaboration friction; or when producing directly applicable
  global-rule edits. Exclude project-local AGENTS.md/CLAUDE.md setup, skill
  routing fixes, task context packing, and tooling enforcement. Formerly named
  context-engineering-global.
---

# Global Context Engineering

## Goal

Maintain the user's global rules file as a small, durable context layer for
behavior that should apply across tasks, projects, and sessions.

## Success Criteria

A good result:

- Classifies each candidate or existing rule as `global`, `project`, `skill`,
  `tooling`, `task context`, or `reject`.
- Preserves the user's original intent and scope.
- Proposes directly applicable text only for rules that belong in the global
  layer.
- Identifies insertion, replacement, deletion, or migration targets.
- Stops once the core classification and concrete edits are justified.

## Constraints

This skill covers global rules files only, such as `~/.claude/CLAUDE.md`, global
`AGENTS.md`, or equivalent files.

It does not cover repo-local `AGENTS.md` / `CLAUDE.md`, new-project context
setup, current-task context packing, session compaction, skill routing fixes, or
tooling enforcement. Route those to `meta-context-engineering-project` or a more
specific skill.

When the user explicitly asks to update, modify, or optimize a global rules file,
treat that as authorization to edit the requested file. Do not extend that
authorization to installation sync, manifests, lockfiles, commits, remote
services, project-local files, or other global state.

Treat `must`, `always`, `never`, and `only` as reserved for true invariants:
safety, exact output contracts, irreversible side effects, and required fields.
Preserve artifact intent, length, structure, and boundary unless the user asks
for a broader rewrite.

## Input Routing

For collaboration friction, classify the root cause before proposing global text:
global rule, project context, skill protocol, tooling, task evidence, or model
capability boundary.

For a proposed rule, read the current global rules file, classify each candidate,
then provide replacement text and insertion location only for candidates that
belong globally.

For an existing global file review, audit each rule as keep, shorten, delete, or
migrate. Provide a rewritten file only when the user asked for a rewrite.

For extraction from files, conversation history, or research, collect only the
requested context, extract global candidates, and classify them before proposing
edits.

## Evidence Budget

Read the directly relevant artifact first: the target global rules file,
candidate rule text, or user-provided friction evidence.

Fetch current external prompt guidance only when:

- the user asks to align with current model guidance
- the existing skill cites external standards and the task is to update or
  evaluate those standards
- the answer would otherwise rely on an unsupported factual claim about model
  behavior

Useful references when needed:

- `https://developers.openai.com/api/docs/guides/prompt-guidance?model=gpt-5.5`
- `https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices`
- `https://code.claude.com/docs/en/best-practices`

Stop retrieval once the core classification and proposed text are supported. Do
not search again for phrasing, examples, or nonessential background.

## Evaluation Rules

For each candidate rule, ask:

1. **Cross-task**: Does it hold across most task types?
2. **Cross-project**: Does it avoid repo, stack, team, or workflow specifics?
3. **Cross-session**: Is it worth loading in every future conversation?
4. **Non-obvious**: Would the model fail to infer it from the request, code, or
   local context?
5. **Observable**: Can violation be seen in output or actions?
6. **Non-redundant**: Does it differ from default model behavior and existing
   rules?
7. **Compact**: Is it the shortest effective expression?
8. **Motivated**: Does it explain why when motivation changes behavior?
9. **Outcome-bound**: Does it define result, success criteria, and stop
   conditions instead of piling on process?
10. **Consistent**: Does it avoid conflict with existing global rules?

Prefer rules that define outcomes, constraints, evidence behavior, final output
shape, or stopping conditions. Reject rules that are project-local, temporary,
tool-enforceable, redundant, or primarily a specialized workflow that belongs in
a skill.

## Validation

For read-only review, state which files or sources were read.

After edits, run the smallest relevant checks:

- Inspect the final diff for accidental scope expansion.
- Verify no project-local file, sync state, lockfile, commit, or remote state
  changed unless requested.
- When editing a skill, confirm the frontmatter `name:` still matches its parent
  directory.

If validation cannot run, say why and name the next best check.

## Output

Default output:

1. Key findings or classifications, ordered by impact.
2. Concrete global-rule edits, with replacement text and insertion location.
3. Non-global items and their correct layer.
4. Rejected or intentionally unchanged content.

Omit empty sections. For review requests, lead with findings. For rewrite
requests, include directly applicable text.

## Stop Rules

Stop when the requested classification, edit text, evidence status, and
non-global routing are clear.

Do not continue pruning, syncing, committing, installing, or improving adjacent
skills just because they look related. Ask one narrow question only when missing
information would change the target file, authorization boundary, or
classification result.
