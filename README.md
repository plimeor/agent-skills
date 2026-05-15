# Agent Skills

Personal skills and workflows for Codex and GPT agents.

## Installation

```bash
npx skills add plimeor/agent-skills
```

Install a single skill:

```bash
npx skills add plimeor/agent-skills --skill ops-url-reader
```

## Project Structure

- `skills/<skill-name>/SKILL.md`: each skill has its own directory, and `SKILL.md` is the entrypoint.
- The `name:` field in `SKILL.md` frontmatter must match the parent directory name exactly.
- `README.md` is the public index. Update it whenever a skill is added, removed, or renamed.

## Skills

Skills are grouped by primary mode.

### Code

- [code-plan](skills/code-plan/SKILL.md): Clarify ambiguous coding goals and write complete, measurable Goal contracts with intent, scope, acceptance results, validation loops, and stop conditions.
- [code-scope-gate](skills/code-scope-gate/SKILL.md): Scope gate before coding; prevent over-implementation and converge on the smallest correct change.
- [code-standards-gate](skills/code-standards-gate/SKILL.md): Review specs, diffs, and implementation boundaries against personal code standards, with emphasis on public contracts, persisted state, and unnecessary abstractions.
- [code-test-strategy](skills/code-test-strategy/SKILL.md): Test-strategy gate for coding tasks; avoid test-driven production complexity, premature tests, and implementation-detail tests.

### Decision

- [decision-look-before-leap](skills/decision-look-before-leap/SKILL.md): Look-before-you-leap check before answers, recommendations, or decisions; use independent subagent scrutiny when context-inertia risk is high.

### Knowledge

- [knowledge-project-docs-maintenance](skills/knowledge-project-docs-maintenance/SKILL.md): Maintain project docs layering, language, naming, and living-spec cleanup strategy.

### Meta

- [meta-code-standards-calibration](skills/meta-code-standards-calibration/SKILL.md): Calibrate code-standards-gate against human PR/MR reviews and decide whether rules belong in a global skill, project rules, tooling, or local context.
- [meta-context-engineering-global](skills/meta-context-engineering-global/SKILL.md): Context engineering for global rules files, focused on rules that remain valid across tasks, projects, and sessions.
- [meta-context-engineering-project](skills/meta-context-engineering-project/SKILL.md): Project-level context engineering for repo-local rules, task context packing, and project-specific drift diagnosis.
- [meta-gpt-prompt-maintenance](skills/meta-gpt-prompt-maintenance/SKILL.md): Maintain and upgrade GPT-oriented prompt artifacts, including SKILL.md, AGENTS, system/developer prompts, agent workflows, evals, and grader prompts.
- [meta-subagent-orchestration](skills/meta-subagent-orchestration/SKILL.md): Orchestrate focused sub-agents for parallel investigation, delegated implementation, and verification while keeping the main agent responsible for integration.

### Ops

- [ops-bear](skills/ops-bear/SKILL.md): Read, search, create, edit, organize, and open Bear notes through the local Bear App CLI.
- [ops-codex-session-maintenance](skills/ops-codex-session-maintenance/SKILL.md): Maintain local Codex session state: inspect and back up first, then archive old sessions/worktrees, rotate logs, and generate handoffs.
- [ops-url-reader](skills/ops-url-reader/SKILL.md): Extract main content from arbitrary URLs through defuddle.md.

### Writing

- [writing-blog](skills/writing-blog/SKILL.md): Create and improve blog posts with the SCQA method.
- [writing-blog-illustration](skills/writing-blog-illustration/SKILL.md): Generate illustration prompts for blog posts, especially workflow, architecture, and abstract-concept visuals.
- [writing-humanizer](skills/writing-humanizer/SKILL.md): Reduce AI-writing traces so generated docs and drafts read more naturally and human-authored.
- [writing-reader-feedback](skills/writing-reader-feedback/SKILL.md): Simulate a specified reader reading an article section by section and report raw reading-experience feedback.
