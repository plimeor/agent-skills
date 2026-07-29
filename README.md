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

### Design

- [create-html-artifact](skills/create-html-artifact/SKILL.md): Produce a single portable local HTML file as the final deliverable: author a body fragment, then a bundled build script injects the document skeleton, CSS reset, and mermaid rendering by default (CDN tag, with an opt-in fully-inlined offline mode) — local assets inline, CDN resources allowed, opens straight from disk, no publishing or hosting — with design guidance covering treatment calibration, typography, dual themes, layout, copy, and editorial direction.

### Knowledge

- [craft-mcp](skills/craft-mcp/SKILL.md): Correct, call-efficient use of the Craft MCP tools (craft_read/craft_write): batching to cut MCP calls, the rootBlockId model, verified search-index behavior, the markdown-vs-JSON content model (subpages, typed blocks, block field reference), and a workaround playbook for missing capabilities such as backlink lookup.
- [agent-docs](skills/agent-docs/SKILL.md): Own durable and ephemeral agent context: AGENTS.md/CLAUDE.md is the single persistent collaboration artifact, with rules routed to the lowest layer that holds them (project rules, nested package files, skills, tool config, MCP, global) and admitted only when earned, non-derivable from code, and load-bearing. Working docs live in `.agentdocs/` and are distilled-then-deleted when work completes; owns document placement and lifecycle, not plan or task-graph content quality.

### Meta

- [meta-gpt-prompt-maintenance](skills/meta-gpt-prompt-maintenance/SKILL.md): Rebuild existing GPT prompt artifacts from current requirements, starting with the smallest prompt and tool set, removing or refreshing stale context, clarifying authorization, and adding guidance only for demonstrated gaps.
- [agent-team](skills/agent-team/SKILL.md): Delegate to sub-agents on one of two paths. A single bounded handoff gets the delegation contract — cost test, task packet, stop condition, report-as-evidence. A team is first compiled through Scout, Mode, Bake, Structure, and Launch: select a preset Mode or construct a task-specific one from scout evidence, classify closed-surface vs open-discovery coverage, bake atomic evidence-root work units with probe plus skeptic/completeness topology, and synthesize one verified result. Unit Atomicity decides which path a task is on.

### Ops

- [codex-session-maintenance](skills/codex-session-maintenance/SKILL.md): Maintain local Codex session state: inspect and back up first, then archive old sessions/worktrees, rotate logs, and generate handoffs.
- [url-reader](skills/url-reader/SKILL.md): Extract main content from public URLs with centralized URL safety, defuddle.md extraction, and one authorized fallback path.

### Writing

- [writing-blog](skills/writing-blog/SKILL.md): Create, diagnose, outline, rewrite, or polish blog posts and articles; routes to one of four work modes (draft-from-notes, diagnosis, rewrite/polish, outline), each with its own reference for structure (SCQA openings, reader-path ordering), diagnosis checklist, and prose cleanup.
- [writing-blog-illustration](skills/writing-blog-illustration/SKILL.md): Generate illustration prompts for blog posts, especially workflow, architecture, and abstract-concept visuals.
- [writing-humanizer](skills/writing-humanizer/SKILL.md): Reduce AI-writing traces so generated docs and drafts read more naturally and human-authored.
- [writing-reader-feedback](skills/writing-reader-feedback/SKILL.md): Simulate a specified reader reading an article section by section and report raw reading-experience feedback.

## Plugins

Claude Code plugins, distributed through this repo's plugin marketplace (`plimeor`).

- [english-coach](plugins/english-coach/README.md): On every prompt, shows the English you should have written — copy-edits English, translates other languages — with short fix notes before Claude responds. Display-only via the hook `systemMessage` channel — never enters Claude's context.
