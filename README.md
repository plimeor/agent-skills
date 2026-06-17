# Agent Skills

Personal skills and workflows for coding agents such as Claude Code and Codex.

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

- [code-lean](skills/code-lean/SKILL.md): Force the smallest correct coding change: YAGNI, deletion before addition, standard library/native/existing project capability first, no unrequested abstractions, explicit quality boundaries, simplification comments with upgrade triggers, and one runnable check for non-trivial logic.
- [code-plan](skills/code-plan/SKILL.md): Write tiered, evidence-backed coding plans with objective, scope, ambiguous intended scope, proposed approach, ordered work, acceptance, regression evidence, verification, risks, pause conditions, and stop conditions, with an automatic design-twice adversarial pass before every plan is delivered.
- [code-review](skills/code-review/SKILL.md): Review plan drafts, specs, diffs, and implementation shapes for direction soundness, premise validity, high-potential preservation, boundary clarification, alternatives, APOSD-style complexity, contracts, tests, implementation fit, and synthesis.
- [code-tasking](skills/code-tasking/SKILL.md): Turn an approved plan plus the real codebase into a leaf-first, dependency-ordered graph of atomic execution tasks for an iterative Goal-mode executor; locate the root-cause change, fuse a synchronized ripple into one no-green-partial task that edits the foundation incompatibly in place, order foundation before dependents, and give each task an anti-patch Definition of Done that names the forbidden shim and requires deleting the superseded path.
- [code-test-strategy](skills/code-test-strategy/SKILL.md): Test-strategy gate for coding tasks; avoid test-driven production complexity, premature tests, and implementation-detail tests.

### Decision

- [reconsider](skills/reconsider/SKILL.md): Reconsider a non-trivial answer before finalizing; challenge stale context, premature compromise, hidden uncertainty, and context-inertia risk to raise answer quality.

### Knowledge

- [workbench](skills/workbench/SKILL.md): Set up, resume, or repair a compact active workbench for long-horizon, multi-session or checkpointed work: loop entry, boundaries, gates, verification, decisions, numbered evidence, human-gate stops, and active-vs-archive routing. Avoid for one-session tasks; complete those directly.

### Meta

- [context-engineering](skills/context-engineering/SKILL.md): Route durable rules and context to the right layer — task, project, skill, tooling, MCP, or global — and produce the smallest directly applicable edit.
- [meta-gpt-prompt-maintenance](skills/meta-gpt-prompt-maintenance/SKILL.md): Maintain and upgrade GPT-oriented prompt artifacts, including SKILL.md, AGENTS, system/developer prompts, agent workflows, evals, and grader prompts.
- [subagent-delegation](skills/subagent-delegation/SKILL.md): Decide whether and how to use sub-agents under default user authorization unless explicitly prohibited, then coordinate delegation, non-overlap, report verification, and integration.

### Ops

- [ops-bear](skills/ops-bear/SKILL.md): Read, search, create, edit, organize, and open Bear notes through the local Bear App CLI.
- [codex-session-maintenance](skills/codex-session-maintenance/SKILL.md): Maintain local Codex session state: inspect and back up first, then archive old sessions/worktrees, rotate logs, and generate handoffs.
- [url-reader](skills/url-reader/SKILL.md): Extract main content from public URLs with centralized URL safety, defuddle.md extraction, and one authorized fallback path.

### Writing

- [writing-blog](skills/writing-blog/SKILL.md): Create and improve blog posts with the SCQA method.
- [writing-blog-illustration](skills/writing-blog-illustration/SKILL.md): Generate illustration prompts for blog posts, especially workflow, architecture, and abstract-concept visuals.
- [writing-humanizer](skills/writing-humanizer/SKILL.md): Reduce AI-writing traces so generated docs and drafts read more naturally and human-authored.
- [writing-reader-feedback](skills/writing-reader-feedback/SKILL.md): Simulate a specified reader reading an article section by section and report raw reading-experience feedback.
