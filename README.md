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

- [code-design-review](skills/code-design-review/SKILL.md): Assess whether a design holds up against modern software-engineering principles across four lenses — complexity and cognitive load (APOSD), change economics (coupling/cohesion, abstraction timing, deletability), boundary correctness (parse-don't-validate, functional core / imperative shell), and agent legibility (machine-checkable contracts, tests as spec) — mapping each concern to a concrete surface, reader task, symptom, and cause; delivers a verdict with impact-ranked concerns and a named examined/unexamined boundary, as a consulting judgment rather than a coverage-accounted merge gate.
- [code-lean](skills/code-lean/SKILL.md): Force the smallest correct coding change: YAGNI, deletion before addition, standard library/native/existing project capability first, no unrequested abstractions, explicit quality boundaries, simplification comments with upgrade triggers, and one runnable check for non-trivial logic.
- [code-plan](skills/code-plan/SKILL.md): Write tiered, evidence-backed coding plans with objective, scope, ambiguous intended scope, proposed approach, ordered work, acceptance, regression evidence, verification, risks, pause conditions, and stop conditions, with a bounded code-lean review on non-mechanical plans and an automatic design-twice adversarial pass before every plan is delivered.
- [code-review](skills/code-review/SKILL.md): Review plan drafts, specs, diffs, and implementation shapes for direction soundness, premise validity, high-potential preservation, boundary clarification, alternatives, APOSD-style complexity, contracts, tests, implementation fit, and synthesis; coverage reads everything in scope breadth-first and drills into flagged units, and the report delivers a coverage manifest plus root-cause-aggregated findings whose locators and evidence can be independently followed.
- [code-test-strategy](skills/code-test-strategy/SKILL.md): Test-strategy gate for coding tasks; avoid test-driven production complexity, premature tests, and implementation-detail tests.

### Decision

- [reconsider](skills/reconsider/SKILL.md): Reconsider a non-trivial answer before finalizing; challenge stale context, premature compromise, hidden uncertainty, and context-inertia risk to raise answer quality.

### Design

- [create-html-artifact](skills/create-html-artifact/SKILL.md): Produce a single portable local HTML file as the final deliverable: author a body fragment, then a bundled build script injects the document skeleton, CSS reset, and mermaid rendering (pinned CDN tag) — local assets inline, libraries and fonts from CDN, opens straight from disk, no publishing or hosting — with design guidance covering treatment calibration, typography, dual themes, layout, copy, and editorial direction, plus a fluid-motion reference for interactive artifacts.

### Meta

- [create-crew](skills/create-crew/SKILL.md): From local Claude Code / Grok session history, build a complete deployable **crew** skill (judgment Specs plus dual-branch `runtimes.md` for Orca vs portable fielding); evals follow skill-creator (live LLM on `evals/evals.json`, optional installed-crew blind predict/score on real sessions).
- [agent-team](skills/agent-team/SKILL.md): Delegate to sub-agents on one of two paths. A single bounded handoff gets the delegation contract — cost test, task packet, stop condition, report-as-evidence. A team is first compiled through Scout, Mode, Bake, Structure, and Launch: select a preset Mode or construct a task-specific one from scout evidence, classify closed-surface vs open-discovery coverage, bake atomic evidence-root work units with probe plus skeptic/completeness topology, and synthesize one verified result. Unit Atomicity decides which path a task is on.

### Ops

- [url-reader](skills/url-reader/SKILL.md): Extract main content from public URLs with centralized URL safety, defuddle.md extraction, and one authorized fallback path.

### Writing

- [writing-blog](skills/writing-blog/SKILL.md): Create, diagnose, outline, rewrite, or polish blog posts and articles; routes to one of four work modes (draft-from-notes, diagnosis, rewrite/polish, outline), each with its own reference for structure (SCQA openings, reader-path ordering), diagnosis checklist, and prose cleanup.
- [writing-humanizer](skills/writing-humanizer/SKILL.md): Reduce AI-writing traces so generated docs and drafts read more naturally and human-authored.
- [writing-reader-feedback](skills/writing-reader-feedback/SKILL.md): Simulate a specified reader reading an article section by section and report raw reading-experience feedback.

## Plugins

Claude Code plugins, distributed through this repo's plugin marketplace (`plimeor`).

- [english-coach](plugins/english-coach/README.md): On every prompt, shows the English you should have written — copy-edits English, translates other languages — with short fix notes before Claude responds. Display-only via the hook `systemMessage` channel — never enters Claude's context.
