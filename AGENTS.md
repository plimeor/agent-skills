# Project: Agent Skills

Personal skills and workflows for coding agents such as Claude Code and Codex.

## Structure

- `skills/` contains one directory per skill.
- Each skill directory must contain a `SKILL.md` entrypoint.
- The skill directory name and the `name:` field in `SKILL.md` frontmatter must match exactly.
- `README.md` is the public index. Each skill entry must describe the current user-visible purpose. Update it whenever a skill is added, removed, renamed, or its functional behavior changes.

## Naming Convention

Skill names should be readable, intuitive, and easy to invoke. Prefer the shortest name that clearly describes the reusable job. Choose the name by the user's natural trigger phrase and the skill's primary reusable job.

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

## Verification

After adding, removing, renaming, or changing the functional behavior of a skill:

- Run `rg --files -g 'SKILL.md'`.
- Check that each `SKILL.md` frontmatter `name:` equals its parent directory.
- Check that `README.md` lists the current skills and describes their current user-visible purpose.
- Check that every `references/` or `subagents/` pointer in a `SKILL.md` resolves, and that every bundled file has at least one pointer.
- For renames, search for stale old names and remove any remaining hits.
