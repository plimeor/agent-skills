# Agent Skills

Personal skills and workflows for Codex and GPT agents.

## Installation

```bash
npx skills add plimeor/agent-skills
```

Install a single skill:

```bash
npx skills add plimeor/agent-skills --skill url-reader
```

## Project Structure

- `skills/<skill-name>/SKILL.md`: each skill has its own directory, and `SKILL.md` is the entrypoint.
- The `name:` field in `SKILL.md` frontmatter must match the parent directory name exactly.
- `README.md` is the public index. Update it whenever a skill is added, removed, or renamed.

## Skills

Skills are grouped by primary mode.

### Code

- [code-plan](skills/code-plan/SKILL.md): Write tiered, evidence-backed coding plans with objective, scope, proposed approach, ordered work, acceptance, regression evidence, verification, risks, pause conditions, stop conditions, and `design twice` follow-up review for completed plans.
- [code-review](skills/code-review/SKILL.md): Review plan drafts, specs, diffs, and implementation shapes through APOSD-style complexity, contract, test, implementation-fit, and synthesis lenses.
- [code-scope-gate](skills/code-scope-gate/SKILL.md): Cross-workflow scope triage before planning, coding, debugging, review, or automation; separate requested outcomes from candidate implementations, delete unnecessary scope, and choose the next authorized action.
- [code-test-strategy](skills/code-test-strategy/SKILL.md): Test-strategy gate for coding tasks; avoid test-driven production complexity, premature tests, and implementation-detail tests.

### Decision

- [reconsider](skills/reconsider/SKILL.md): Reconsider a non-trivial answer before finalizing; challenge stale context, premature compromise, hidden uncertainty, and context-inertia risk to raise answer quality.

### Meta

- [context-engineering](skills/context-engineering/SKILL.md): Route durable rules and context to the right layer — task, project, skill, tooling, MCP, or global — and produce the smallest directly applicable edit.
- [meta-gpt-prompt-maintenance](skills/meta-gpt-prompt-maintenance/SKILL.md): Maintain and upgrade GPT-oriented prompt artifacts, including SKILL.md, AGENTS, system/developer prompts, agent workflows, evals, and grader prompts.
- [meta-subagent-orchestration](skills/meta-subagent-orchestration/SKILL.md): Decide whether and how to use authorized sub-agents, then coordinate delegation, non-overlap, report verification, and integration.

### Ops

- [ops-bear](skills/ops-bear/SKILL.md): Read, search, create, edit, organize, and open Bear notes through the local Bear App CLI.
- [codex-session-maintenance](skills/codex-session-maintenance/SKILL.md): Maintain local Codex session state: inspect and back up first, then archive old sessions/worktrees, rotate logs, and generate handoffs.
- [url-reader](skills/url-reader/SKILL.md): Extract main content from public URLs with centralized URL safety, defuddle.md extraction, and one authorized fallback path.

### Writing

- [writing-blog](skills/writing-blog/SKILL.md): Create and improve blog posts with the SCQA method.
- [writing-blog-illustration](skills/writing-blog-illustration/SKILL.md): Generate illustration prompts for blog posts, especially workflow, architecture, and abstract-concept visuals.
- [writing-humanizer](skills/writing-humanizer/SKILL.md): Reduce AI-writing traces so generated docs and drafts read more naturally and human-authored.
- [writing-reader-feedback](skills/writing-reader-feedback/SKILL.md): Simulate a specified reader reading an article section by section and report raw reading-experience feedback.
