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

Install Claude Code plugins (marketplace name: `plimeor`; plugins do not go
through `npx skills add`):

```bash
claude plugin marketplace add plimeor/agent-skills
claude plugin install english-coach@plimeor
```

## Project Structure

- `skills/<skill-name>/SKILL.md`: each skill has its own directory, and `SKILL.md` is the entrypoint.
- The `name:` field in `SKILL.md` frontmatter must match the parent directory name exactly.
- `plugins/<plugin-name>/`: Claude Code plugins, with `.claude-plugin/plugin.json` as the entrypoint.
- `.claude-plugin/marketplace.json`: the plugin marketplace index.
- `README.md` is the public index. Update it whenever a skill or plugin is added, removed, or renamed.

## Skills

Skills are grouped by primary mode.

### Code

- [code-lean](skills/code-lean/SKILL.md): Force the smallest correct coding change: YAGNI, deletion before addition, standard library/native/existing project capability first, no unrequested abstractions, explicit quality boundaries, simplification comments with upgrade triggers, and one runnable check for non-trivial logic.
- [code-plan](skills/code-plan/SKILL.md): Write tiered, evidence-backed coding plans with objective, scope, ambiguous intended scope, proposed approach, ordered work, acceptance, regression evidence, verification, risks, pause conditions, and stop conditions, with a bounded code-lean review on non-mechanical plans and an automatic design-twice adversarial pass before every plan is delivered.
- [code-review](skills/code-review/SKILL.md): Review plan drafts, specs, diffs, and implementation shapes for direction soundness, premise validity, high-potential preservation, boundary clarification, alternatives, APOSD-style complexity, contracts, tests, implementation fit, synthesis, and exhaustive coverage backed by a delivered Unit Ledger that maps every review ID to its subject, locator, verdict, and evidence.
- [code-tasking](skills/code-tasking/SKILL.md): Turn an approved plan plus the real codebase into a leaf-first, dependency-ordered graph of atomic execution tasks for an iterative Goal-mode executor; locate the root-cause change, fuse a synchronized ripple into one no-green-partial task that edits the foundation incompatibly in place, order foundation before dependents, and give each task an anti-patch Definition of Done that names the forbidden shim and requires deleting the superseded path.
- [code-test-strategy](skills/code-test-strategy/SKILL.md): Test-strategy gate for coding tasks; avoid test-driven production complexity, premature tests, and implementation-detail tests.

### Decision

- [reconsider](skills/reconsider/SKILL.md): Reconsider a non-trivial answer before finalizing; challenge stale context, premature compromise, hidden uncertainty, and context-inertia risk to raise answer quality.

### Knowledge

- [agent-docs](skills/agent-docs/SKILL.md): Own durable and ephemeral agent context: AGENTS.md/CLAUDE.md is the single persistent collaboration artifact, with rules routed to the lowest layer that holds them (project rules, nested package files, skills, tool config, MCP, global) and admitted only when earned, non-derivable from code, and load-bearing. Working docs live in `.agentdocs/` and are distilled-then-deleted when work completes; owns document placement and lifecycle, not plan or task-graph content quality.

### Meta

- [meta-gpt-prompt-maintenance](skills/meta-gpt-prompt-maintenance/SKILL.md): Rebuild existing GPT prompt artifacts from current requirements, starting with the smallest prompt and tool set, removing or refreshing stale context, clarifying authorization, and adding guidance only for demonstrated gaps.
- [agent-handoff](skills/agent-handoff/SKILL.md): Hand one bounded unit of work to a single sub-agent with a clean contract — packet, return format, stop condition — and treat the report as evidence to verify. Owns the per-delegation contract that agent-team reuses for each member; delegation assumed authorized.
- [agent-team](skills/agent-team/SKILL.md): Compile and run a multi-subagent team through Scout, Mode, Bake, Structure, and Launch; select a preset Mode or construct a task-specific Mode from scout evidence, bake shared context into each packet, delegate substantive work to sub-agents, and synthesize one verified result. Defers the per-agent contract to agent-handoff.

### Ops

- [codex-session-maintenance](skills/codex-session-maintenance/SKILL.md): Maintain local Codex session state: inspect and back up first, then archive old sessions/worktrees, rotate logs, and generate handoffs.
- [url-reader](skills/url-reader/SKILL.md): Extract main content from public URLs with centralized URL safety, defuddle.md extraction, and one authorized fallback path.

### Writing

- [writing-blog](skills/writing-blog/SKILL.md): Create and improve blog posts with the SCQA method.
- [writing-blog-illustration](skills/writing-blog-illustration/SKILL.md): Generate illustration prompts for blog posts, especially workflow, architecture, and abstract-concept visuals.
- [writing-humanizer](skills/writing-humanizer/SKILL.md): Reduce AI-writing traces so generated docs and drafts read more naturally and human-authored.
- [writing-reader-feedback](skills/writing-reader-feedback/SKILL.md): Simulate a specified reader reading an article section by section and report raw reading-experience feedback.

## Plugins

Claude Code plugins, distributed through this repo's plugin marketplace (`plimeor`).

- [english-coach](plugins/english-coach/README.md): On every prompt, shows the English you should have written — copy-edits English, translates other languages — with short fix notes before Claude responds. Display-only via the hook `systemMessage` channel — never enters Claude's context.
