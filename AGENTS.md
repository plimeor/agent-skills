# Project: Agent Skills

## Structure

- `skills/` contains one directory per skill.
- Each skill directory must contain a `SKILL.md` entrypoint.
- The skill directory name and the `name:` field in `SKILL.md` frontmatter must match exactly.
- `README.md` is the public index. Update it whenever a skill is added, removed, or renamed.

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
- Keep frontmatter `description:` focused on trigger conditions and near-miss exclusions, not marketing copy or internal rationale.

## Verification

After adding, removing, or renaming skills:

- Run `rg --files -g 'SKILL.md'`.
- Check that each `SKILL.md` frontmatter `name:` equals its parent directory.
- Search for stale old names and confirm any remaining hits are intentional aliases.
