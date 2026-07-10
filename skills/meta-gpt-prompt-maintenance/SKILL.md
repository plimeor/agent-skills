---
name: meta-gpt-prompt-maintenance
description: "Maintain, audit, or rewrite existing GPT prompt artifacts from a clean slate using current OpenAI guidance. Use when a system/developer prompt, AGENTS or rules file, SKILL.md, product-assistant prompt, agent workflow, eval prompt, or grader prompt has accumulated legacy instructions, stale context, redundant examples, broad style rules, or unclear authorization. Do not use for ordinary prose editing, model-agnostic prompt advice, creating a new skill, or deciding where durable instructions belong."
---

# GPT Prompt Maintenance

## Outcome

Rebuild a selected prompt from current requirements instead of editing legacy text in place. The result uses the smallest prompt and tool set justified by current invariants or observed evaluation gaps, and stale context is removed, refreshed, or explicitly unresolved.

Success means:

- current outcome, evidence, output, safety, and authorization requirements remain enforceable
- no instruction survives only because it existed before
- both starting and accumulated context receive a freshness audit
- required content takes priority over generic brevity, style, or formatting
- changes, validation, and unresolved evidence are reported

## Boundaries

Use this skill after the target prompt has been selected. Use `agent-docs` to decide where durable instructions belong and `skill-creator` for a new skill, skill eval design, benchmarking, or trigger optimization.

Treat the existing prompt as evidence of possible requirements and past failure modes, not as a template or preservation baseline. Limit edits to the selected artifact and repository-required metadata. Do not rename, sync an installed copy, or change runtime configuration unless requested.

Use only the `Use shorter prompts`, `Define autonomy and permissions clearly`, and `Personality and style` subsections of [OpenAI model guidance: Prompting best practices](https://developers.openai.com/api/docs/guides/latest-model#prompting-best-practices) as sources for this skill's reusable behavior. Do not import workflow guidance from other subsections of that page.

## Core Rules

### Start Minimal

Draft from a blank page using only current requirements. Add an instruction, tool, example, formatting rule, or style rule only when it protects a current invariant or an evaluation reveals a specific gap.

Expose only task-relevant tools and describe them concisely. Remove duplicated guidance, speculative safeguards, decorative examples, global templates, repeated phrasing, and contrastive `X, not Y` patterns that do not prevent an observed failure.

Minimal-first does not mean shortening the requested artifact. Preserve every required fact, decision, caveat, output field, and next action.

### Keep Context Fresh

Treat the static prompt and injected context as one model input. Audit both starting context and accumulated context, including conversation history, retrieved material, tool output, retry transcripts, completed work, and carried-forward summaries.

Retain only current information that can change the next decision or final answer. Remove superseded decisions, completed steps, stale facts, obsolete errors, old tool output, duplicate background, and context that encourages repeating finished work.

When a fact, rule, identifier, date, model behavior, or external state may have changed, refresh it from the closest authoritative source or mark it unresolved. Summarizing or compacting stale content does not make it fresh.

### State Autonomy Once

Use one compact policy adapted to the host:

- answer, explain, review, diagnose, or plan: inspect and report; do not implement unless requested
- change, build, or fix: make requested in-scope local changes and run non-destructive validation without asking first
- external writes, destructive actions, purchases, or material scope expansion: require confirmation

Name safe local actions when ambiguity would cause unnecessary approval checks. Do not repeat permission warnings throughout the prompt.

### Prioritize Required Content

Replace generic brevity instructions with priorities: lead with the conclusion; include required evidence, material caveats, decisions, and next actions; trim introductions, repetition, reassurance, and optional background first.

Use a lightweight task-specific outline instead of a global template. Make tone concrete and situational, such as direct and tactful, instead of broadly warm or empathetic.

## Hard Gates

### Gate 1 — Clean Slate

- **Activates:** every rewrite or upgrade.
- **Required evidence:** a current-requirements map sourced from the user request and current authoritative product, safety, tool, evidence, and output contracts. Existing prompt text is only a candidate source to classify.
- **Prohibited substitutes:** prior presence, old examples, comments, familiar wording, speculative usefulness, or backward compatibility with no current owner or requirement.
- **If unmet:** exclude unsupported legacy content. If its current status could materially change safety, authorization, or an exact contract, ask one narrow question or mark the artifact incomplete instead of preserving it by default.

### Gate 2 — Minimal First

- **Activates:** every rewrite and every proposed instruction, tool, example, formatting rule, or style rule.
- **Required evidence:** a minimal baseline plus a concise retention ledger linking every retained element or explicit rule group to a current invariant or a specific observed evaluation failure.
- **Prohibited substitutes:** fewer lines than the old prompt, a smaller diff, intuition that something may help, model-specific padding, or examples added just in case.
- **If unmet:** remove the unsupported element. Without representative evaluation, deliver only the invariant-backed baseline and label behavioral reliability unverified.

### Gate 3 — Context Freshness

- **Activates:** every maintenance task. Inspect embedded context in the target and any history, retrieval, tool output, retry state, or summary the host exposes or injects.
- **Required evidence:** a freshness report naming current context retained, stale or superseded context removed, sources refreshed, unresolved freshness, and observations of starting and accumulated context. If context is inaccessible, record that limitation explicitly.
- **Prohibited substitutes:** token or line counts, shorter summaries, compaction without source refresh, deduplication alone, or an unsupported claim that context is current.
- **If unmet:** refresh, remove, or label the uncertain context. If the uncertainty could change behavior, evidence, or authorization, pause for the missing source or user decision. Inaccessible context never counts as verified fresh.

### Gate 4 — Allowed Official Source

- **Activates:** every rewrite, every reusable OpenAI-derived rule, and every current or model-specific behavior claim.
- **Required evidence:** a source-scope record mapping reusable rules only to the three allowed subsections. A target-specific current claim also needs direct support from current official OpenAI documentation.
- **Prohibited substitutes:** workflow guidance from another subsection, model memory, third-party summaries, undated older guidance, unsupported generalization, or a user waiver.
- **If unmet:** omit the reusable rule or label the target-specific claim unverified. A waiver cannot expand the allowed reusable source scope or make a claim current.

## Workflow

1. Extract current requirements from the user request and current authoritative sources. Do not line-edit the old prompt.
2. Inventory starting and accumulated context; remove, refresh, or isolate stale material.
3. Write the smallest invariant-backed prompt and task-relevant tool set from a blank page.
4. Run representative evaluations when available. Add instructions only for observed failures, then rerun the affected case.
5. Inspect the result for scope expansion and run repository-required structural checks.

If evaluation is unavailable, keep the invariant-backed baseline, disclose the missing behavioral evidence, and do not add speculative guidance or claim reliability.

## Output Contract

Every result includes:

- changed files or rewritten text; for review-only work, impact/confidence-ordered findings and confirmation that no files changed
- the current-requirements map
- the retention ledger for every retained element or explicit rule group
- the context freshness report: retained, removed, refreshed, unresolved, starting-context observation, and accumulated-context observation
- the allowed-source scope record and verification status for current or model-specific claims
- validation run, observed results, unmet gates, waivers, and intentionally excluded work

## Self-Review And Stop

Before completion, check:

- would any instruction remain solely because it appeared in the old prompt?
- does every retained element or explicit rule group map to a current invariant or observed evaluation failure?
- did stale or superseded context survive through summary, compaction, replay, or copied examples?
- were starting and accumulated context both inspected or explicitly marked inaccessible?
- does every reusable OpenAI-derived rule come only from the three allowed subsections, and does every current or model-specific claim have direct official support?
- are autonomy rules stated once and response guidance limited to required content priorities?
- does the final report contain every active gate's evidence?

If any answer exposes a bypass, revise or report the artifact as incomplete.

Finish only when every active gate has its evidence or an allowed explicit waiver, the requested artifact is rewritten or reviewed, validation status is observed and reported, and the Output Contract is complete. Completion also requires the source-scope record to show that no reusable rule came from outside the three allowed subsections. A waiver never converts stale, inaccessible, or unverified context into verified current context.

Do not stop because of self-assessed token, context, time, or effort limits. If a gate cannot be met, name the exact missing evidence or decision. Ask one narrow question only when its answer changes behavior, authorization, the target artifact, or a validation claim. Stop wording optimization once the prompt is minimal, current, scoped, and testable.
