# Project: Agent Skills

## Structure

- `skills/` contains one directory per skill.
- Each skill directory must contain a `SKILL.md` entrypoint.
- The skill directory name and the `name:` field in `SKILL.md` frontmatter must match exactly.
- `README.md` is the public index. Each skill entry must describe the current user-visible purpose of that skill. Update it whenever a skill is added, removed, renamed, or its functional behavior changes.

## Naming Convention

Use the prefix that matches the skill's primary mode:

- `code-*`: Coding, debugging, review, refactoring, and testing
- `knowledge-*`: Knowledge management, summarization, synthesis, and durable documentation
- `writing-*`: Blog posts, articles, and expression refinement
- `decision-*`: Decisions, trade-offs, prioritization, and option comparison
- `meta-*`: Prompt, AGENTS, SKILL, and context architecture
- `ops-*`: Local environment, automation, release, CI, and tooling

Choose by primary mode, not by secondary capability. For example, a skill that reads URLs to support article feedback is still `ops-*` if its reusable job is URL content extraction.

## Editing Rules

- Keep one source of truth for a skill name: directory name plus matching frontmatter `name:`.
- Do not keep duplicate old-name directories after a rename.
- Preserve old names only as alias text in descriptions when useful for trigger continuity.
- Write new `SKILL.md` files in English. Do not migrate existing non-English skills unless the user explicitly asks.
- Keep `SKILL.md` focused on the reusable workflow. Put large examples, references, or scripts in bundled resources only when they are actually needed.

## Prompt Guidance

- For `SKILL.md` prompts, define the outcome, constraints, success criteria, and stop rules before adding process.
- Prefer short decision rules over step-by-step procedure unless the order is required for correctness.
- Use absolute terms like `always`, `never`, `must`, and `only` only for true invariants: safety, irreversible actions, exact output contracts, or tool syntax.
- Keep frontmatter `description:` focused on routing: trigger conditions, near-miss exclusions, and short alias continuity when useful.
- Put behavior contracts, output formats, validation rules, workflow details, examples, internal rationale, and historical framing in the `SKILL.md` body or bundled resources, not in frontmatter `description:`.

## Skill Authoring Hard Gates

When creating or materially updating a `SKILL.md`, extract the user's hard requirements before drafting reusable instructions. A hard requirement is any condition that changes whether the skill output is acceptable, complete, safe, or faithful to the user's stated bar.

Hard requirements belong in enforceable structure, not only in prose, examples, or advisory language. Each applicable hard requirement should appear in:

- A named gate section with activation condition, required evidence or fields, prohibited substitutes, and incomplete or pause behavior.
- The output contract as required fields or required artifacts.
- A self-review check that tests whether an agent could skip the requirement while sounding compliant.
- Stop rules that require the relevant evidence before completion.

Acceptance and quality gates should name weak substitutes that do not satisfy the gate. Missing required evidence means the generated artifact is incomplete until the evidence, waiver, or user decision is present.

Before finishing a skill, run an adversarial check: `Could an agent follow this skill and skip the user's hard requirement while still sounding compliant?` A yes answer means the requirement needs a stronger gate, output field, self-review check, or stop rule.

## Verification

After adding, removing, renaming, or changing the functional behavior of a skill:

- Run `rg --files -g 'SKILL.md'`.
- Check that each `SKILL.md` frontmatter `name:` equals its parent directory.
- Check that `README.md` lists the current skills and describes their current user-visible purpose.
- For renames, search for stale old names and confirm any remaining hits are intentional aliases.
