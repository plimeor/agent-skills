# Project: Agent Skills

## Structure

- `skills/` contains one directory per skill.
- Each skill directory must contain a `SKILL.md` entrypoint.
- The skill directory name and the `name:` field in `SKILL.md` frontmatter must match exactly.
- `README.md` is the public index. Each skill entry must describe the current user-visible purpose of that skill. Update it whenever a skill is added, removed, renamed, or its functional behavior changes.

## Naming Convention

Skill names should be readable, intuitive, and easy to invoke. Prefer the shortest name that clearly describes the reusable job.

Mode prefixes can help with scanning and disambiguation when they make the name clearer:

- `code-*`: Coding, debugging, review, refactoring, and testing
- `knowledge-*`: Knowledge management, summarization, synthesis, and durable documentation
- `writing-*`: Blog posts, articles, and expression refinement
- `decision-*`: Decisions, trade-offs, prioritization, and option comparison
- `meta-*`: Prompt, AGENTS, SKILL, and context architecture
- `ops-*`: Local environment, automation, release, CI, and tooling

Choose the name by the user's natural trigger phrase and the skill's primary reusable job. Use a prefix when it improves recognition or prevents ambiguity; prefer an unprefixed name when that is clearer.

## Editing Rules

- Keep one source of truth for a skill name: directory name plus matching frontmatter `name:`.
- Do not keep duplicate old-name directories after a rename.
- Do not include alias text in skill descriptions. After a rename, the new name is the only name; do not list old names or trigger phrases that point at prior names.
- Write new `SKILL.md` files in English. Do not migrate existing non-English skills unless the user explicitly asks.
- Keep `SKILL.md` focused on the reusable workflow. Put large examples, references, or scripts in bundled resources only when they are actually needed.

## Prompt Guidance

- For `SKILL.md` prompts, define the outcome, constraints, success criteria, and stop rules before adding process.
- Prefer short decision rules over step-by-step procedure unless the order is required for correctness.
- Use absolute terms like `always`, `never`, `must`, and `only` only for true invariants: safety, irreversible actions, exact output contracts, or tool syntax.
- Keep frontmatter `description:` focused on routing: trigger conditions and near-miss exclusions only.
- Put behavior contracts, output formats, validation rules, workflow details, examples, internal rationale, and historical framing in the `SKILL.md` body or bundled resources, not in frontmatter `description:`.

## Skill Authoring Hard Gates

When creating or materially updating a `SKILL.md`, extract the user's hard requirements before drafting reusable instructions. A hard requirement is any condition that changes whether the skill output is acceptable, complete, safe, or faithful to the user's stated bar.

Hard requirements belong in enforceable structure, not only in prose, examples, or advisory language. Enforce each one at the fewest points that actually bind — a named gate, an output-contract field, a self-review check, or a stop rule, singly or in combination — chosen for where an executor would otherwise skip it. State a requirement's normative form once and reference it by a short name elsewhere; do not replicate the same clause across gate, output, self-review, and stop rules by default. Repeat an enforcement point only when that specific point would otherwise fail to bind, never as a uniform authoring rule. <!-- 2026-07-11: earned — four-point replication mandate removed; single-point enforcement is the default and verbatim duplication across sections is a defect, per user decision -->

When a gate is the right structure, give it an activation condition, required evidence or fields, prohibited substitutes, and incomplete or pause behavior, and name the weak substitutes that do not satisfy it. Missing required evidence means the generated artifact is incomplete until the evidence, waiver, or user decision is present.

Never gate on a self-assessed resource condition — budget, token cost, context size, "scope too large". Such conditions are unfalsifiable and act as silent escape hatches. When a contract cannot be met, the skill fails loudly: name the unmet remainder and return the decision to the user, who owns resource trade-offs through scoping. <!-- 2026-07-07: earned — budget escape hatch removed from code-review Coverage after user correction -->

Before finishing a skill, run an adversarial check: `Could an agent follow this skill and skip the user's hard requirement while still sounding compliant?` A yes answer means the requirement needs a stronger gate, output field, self-review check, or stop rule.

When the requirement is a decomposition — a fan-out, a critique matrix, a multi-lens review — a conservative executor collapses it down whatever axis the skill leaves to judgment, and each tightening only pushes the collapse to the next-softest axis. (`agent-team` ran this gauntlet: dropped the adversarial pass entirely → split the question into analysis angles instead of competing candidates → ran one shared review instead of per-candidate → collapsed the distinct lenses into one reviewer.) Name the matrix on every load-bearing axis and add a red flag per collapse mode. Stop when the residual axis is low-value — be stakes-proportional, not count-maximal.

## Verification

After adding, removing, renaming, or changing the functional behavior of a skill:

- Run `rg --files -g 'SKILL.md'`.
- Check that each `SKILL.md` frontmatter `name:` equals its parent directory.
- Check that `README.md` lists the current skills and describes their current user-visible purpose.
- For renames, search for stale old names and remove any remaining hits.
