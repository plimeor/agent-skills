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

- [code-design-review](skills/code-design-review/SKILL.md): Assess whether a design holds up against modern software-engineering principles across four lenses — complexity and cognitive load (APOSD), change economics (coupling/cohesion, abstraction timing, deletability), boundary correctness (parse-don't-validate, functional core / imperative shell), and agent legibility (machine-checkable contracts, tests as spec) — mapping each concern to a concrete surface, reader task, symptom, and cause; delivers a verdict with impact-ranked concerns and a named examined/unexamined boundary, as a consulting judgment rather than a coverage-accounted merge gate.
- [code-review](skills/code-review/SKILL.md): Review plan drafts, specs, diffs, and implementation shapes for direction soundness, premise validity, high-potential preservation, boundary clarification, alternatives, APOSD-style complexity, contracts, tests, implementation fit, and synthesis; coverage reads everything in scope breadth-first and drills into flagged units, and the report delivers a coverage manifest plus root-cause-aggregated findings whose locators and evidence can be independently followed.
- [spec-flow](skills/spec-flow/SKILL.md): Manage a repo's plans, specs, and architecture doc through nine operations — `init` scaffolds the `docs/` layout (overview, architecture, specs, plans, archive, decisions) and conventions block; `propose` grills the user in rounds on the decisions above the promise line and the design decisions with real alternatives, leaves the remaining details to the implementer, then writes the plan top-down without pausing for approval: `plan.md` for goal and scope; for a change that alters the structure, a `skeleton.md` (each unit's responsibility, what it owns, its interface as code, its dependencies and current callers; at most three paths through the units, the first being the walking skeleton; invariants; and the entries it adds to or changes in `docs/architecture.md`), reviewed by `skeleton-review` before anything below it is written; a technical design (inline up to 100 lines, else `design.md`, split into `design/` past 800 lines) for flows inside units, external contracts, migration, rollout, decisions, and test scope; spec change files extracted from all three and checked by `spec-review`; and tasks whose first group wires the walking skeleton end to end, with questions owned outside the conversation recorded as blocking open questions with an owner and date; `skeleton-review` runs up to three rounds of `code-design-review`, structural checks (units defined by what they own, one owner per piece of state, no dependency cycles, every path step backed by an interface, a budget of 150 lines), one alternative compared for the decision the skeleton rests on most, and a static pre-check of the walking skeleton against the current code (named symbols exist, every caller of a changed interface is found, types line up along the first path, new dependencies obey the repo's rules), fixing findings it can and stopping for the user only on decisions they own or blocking findings left after round three; `spec-review` checks spec change files against the spec contract in up to three rounds inside `propose` and once, report-only, inside `verify`; `verify` reviews the code against plan, skeleton, design, spec, and the architecture invariants, treats a gap in the spec as no finding, and returns a `Ready to archive` / `Not ready` verdict, with unanswered blocking questions and broken invariants counting as `Not ready`; `archive` merges the spec changes into `docs/specs/` and the skeleton's architecture changes into `docs/architecture.md`, then moves `plan.md`, the skeleton, the design, and attachments to the dated archive; `decide` writes decision records that pass a three-part gate, keeps Accepted and Rejected records live with replaced ones in `docs/decisions/superseded/`, and consolidates by topic to keep the live set around 20–30; `tidy` brings existing specs and the live decision set back within their contracts on request, proposing each spec's cuts for the user to choose before rewriting it; `architecture-review` builds `docs/architecture.md` from the code and keeps it true to it — a top-level codemap, invariants, and cross-cutting concerns only, entries corrected to the code, invariants added only when the user confirms them, and broken invariants reported as suspected violations. A spec records promises, not behavior or structure: every sentence passes the test "if this changed, would users be owed a fix or a migration note"; a `Type:` line (`feature`, `api` for interfaces code outside the project calls, `format`) sets where that line lies; details below it may live in the design, which is archived as history, but never in a spec; scenarios are key examples, written only where a rule would be misread without them, with everything else in the tests, which name the requirements they cover; what is left open is silence, or one unspecified clause on the rule it qualifies. Specs live flat or in area subdirectories (`quick-buy/entry`). A budget of twenty requirements is enforced: a spec over budget after a merge makes `verify` return `Not ready` and stops `archive` until the user chooses the cuts. Length past about 300 lines is a signal that `verify` and `tidy` report, not a limit. Plans list requirement names in What changes without restating the change files, with no line cap, and keep Why to two sentences and five bullets. Code is authoritative over specs and the architecture doc except where it breaks a guarantee users rely on or a stated invariant, which is reported as a suspected bug.

### Design

- [create-html-artifact](skills/create-html-artifact/SKILL.md): Produce a single portable local HTML file as the final deliverable: author a body fragment, then a bundled build script injects the document skeleton, CSS reset, and mermaid rendering (pinned CDN tag) — local assets inline, libraries and fonts from CDN, opens straight from disk, no publishing or hosting — with design guidance covering treatment calibration, typography, dual themes, layout, copy, and editorial direction, plus a fluid-motion reference for interactive artifacts.

### Meta

- [create-crew](skills/create-crew/SKILL.md): From local Claude Code / Grok session history, build a complete deployable **crew** skill (judgment Specs plus dual-branch `runtimes.md` for Orca vs portable fielding); evals follow skill-creator (live LLM on `evals/evals.json`, optional installed-crew blind predict/score on real sessions).
- [agent-team](skills/agent-team/SKILL.md): Run team-shaped work — exhaustive audits, open-discovery inventories, cross-checked research, codebase maps, sweeps, adversarial decision critique — across sub-agents, leaving orchestration mechanics to the model and holding the result to four gates: coverage over named evidence roots with per-root returns, independent verification of every claim the answer relies on or presents as confirmed, one unit and one critic per decision candidate, and isolated mutators. The synthesis names coverage, verification status, and gaps. Single bounded delegations stay with the caller.
- [entry-docs](skills/entry-docs/SKILL.md): Author, refactor, or diagnose `AGENTS.md` / `CLAUDE.md` and `README.md` as complementary entrypoints — agents get a minimal every-request `AGENTS.md` with progressive disclosure, plus a `CLAUDE.md` only where Claude Code needs one; humans get a short cognitively-funneled README that can keep them out of the source.

### Ops

- [url-reader](skills/url-reader/SKILL.md): Extract main content from public URLs with centralized URL safety, defuddle.md extraction, and one authorized fallback path.

### Writing

- [writing-blog](skills/writing-blog/SKILL.md): Create, diagnose, outline, rewrite, or polish blog posts and articles; routes to one of four work modes (draft-from-notes, diagnosis, rewrite/polish, outline), each with its own reference for structure (SCQA openings, reader-path ordering), diagnosis checklist, and prose cleanup.
- [writing-reader-feedback](skills/writing-reader-feedback/SKILL.md): Simulate a specified reader reading an article section by section and report raw reading-experience feedback.
