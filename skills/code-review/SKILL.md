---
name: code-review
description: "Review concrete code plan drafts, specs, diffs, and implementation shapes, including parity audits of an implementation against an authoritative source or reference implementation. Use for code-review requests, exhaustive or line-by-line review requests, parity/alignment/completeness audits, serious code-plan design critique, and judging whether a proposed direction is sound. Near miss: use code-plan to create or revise plans; use code-design-review for a lightweight principles-only design assessment."
---

# Code Review

Perform an adversarial review of the change. Look for opportunities to **reduce layers** (pass-through wrappers, single-use abstractions), **remove unnecessary complexity** (code-judo: restructurings that delete branches/modes/helpers, not rearrange them), and **increase reliability** (correctness, contract, state, concurrency, migration risk). For plan and spec reviews, judge the chosen direction before acceptance or test details: whether it solves the stated problem, rests on valid premises, assigns ownership to the right layer, fits observed constraints, preserves the highest-value intended outcome, and beats credible root-cause or lower-scope alternatives. A lower-scope alternative only beats the proposed route when it preserves the stated outcome or evidence shows the removed surface is unrequested, unauthorized, speculative, constraint-breaking, or not worth its complexity. Honor repo-wide policies (`AGENTS.md`, `CONTRIBUTING.md`, ADRs) as hard constraints. Verify what you can. Keep the original goal fixed; challenge the proposed route when evidence shows a better route to that same goal.

## Coverage

The user circumscribes the review scope — a diff, a file set, a plan, an authoritative source to compare against. Within that scope, reading is exhaustive, never sampled: every changed line of a diff, every section of a plan, every compared surface of a parity audit gets read before the review closes. Risk weighting orders the work and decides how deep to drill; it never decides whether something gets read.

Partition the scope into natural cohesive units, derived mechanically from the source's own structure — files (or hunk groups per file) for a diff, sections/decisions/requirements for a plan or spec, components/screens/endpoints for a parity audit. A well-partitioned scope has roughly 10–50 top-level units; when mechanical enumeration produces more, coarsen by one structural level rather than dropping anything. Units structure the work and the coverage account; they are not the granularity of findings or of bookkeeping.

Review in two phases. **Breadth first**: read every unit, noting where risk concentrates or defects surface. **Depth second**: drill only into the flagged units, decomposing them as finely as the evidence demands — individual branches, handlers, payloads, state writes, copy/style elements — and chasing each suspect element down. Atomic-level scrutiny is triggered by evidence, not applied uniformly across the scope.

When the scope exceeds one pass, split it across sub-agents by unit — partition the scope, never sample it — and state the coverage plan first (N units, M slices) so the fan-out is visible before it starts. "Reviewed" is an observation claim: make it only when the coverage account shows everything in scope read, or every gap named with its blocker.

## Traceability

The report must let the reader verify two things without access to the review process: what the review actually read, and what each finding rests on.

**Coverage account.** A short manifest of what was read — files with line ranges, document sections, compared surfaces — and what was not, each unread item named with its blocker (a source that cannot be read, an artifact that is unavailable, a judgment needing information only the user holds). A partial review presents itself as partial. For a parity audit the manifest lists each compared surface with its verdict — aligned, authorized divergence, or defect — since that matrix is the deliverable itself.

**Finding evidence.** Every finding cites the concrete locators it rests on — file plus symbol/line, diff hunk, document section, or for parity work the source/target pair, including an explicitly missing side — plus the observed evidence and what was checked to reach the verdict. A claim of alignment or divergence names both sides compared. A finding whose locator cannot be independently followed is not deliverable.

**Delegation.** Sub-agent task packets carry their assigned units; reviewers return findings with locators plus the list of what they read, and synthesis merges the read-lists into the one coverage account. A sub-agent's silence is valid only when its read-list shows its whole slice was read with nothing to report. A reviewer that finds material outside its slice reports it with locator and discovery reason rather than silently absorbing or ignoring it.

**Reversals.** A finding refuted or withdrawn during synthesis is reported as refuted with the evidence that overturned it, not silently dropped.

## Attribution

Distinguish **NEW** (introduced or made materially worse by this change) from **PRE-EXISTING** (already true on the base branch). Compare against base — read the unchanged file or check blame, not just the diff hunks. When the change replaces or deletes code, enumerate the guards and preconditions the old surface enforced — not just which capabilities it kept — and confirm each survives; an action that stays present but loses the predicate that gated it is invisible in a structural diff. Report PRE-EXISTING only when the change touches the same surface and it blocks the intended outcome, the change makes it worse, or the user asked for a broader audit. Tag every finding `[NEW]` or `[PRE-EXISTING]`; if uncertain, say so rather than defaulting to NEW. Attribution presumes a base to diff against; in a parity audit the per-surface verdict (aligned / authorized divergence / defect) carries this role — don't force NEW/PRE-EXISTING tags where no base exists.

## Plan-Direction Gate

Activate this gate when reviewing a plan, spec, proposed implementation approach, migration design, or any request asking whether an approach is right, wrong, best, optimal, or worth doing.

Required evidence before judging plan quality:

- Target outcome and explicit constraints from the prompt, repo evidence, linked issue, or local project rules.
- The plan's highest-value intended outcome: the user-visible capability, product value, reliability gain, or strategic option the plan is trying to preserve.
- The plan's chosen strategy and ownership point: data source, state write, shared contract, call boundary, persistence/schema boundary, or presentation layer.
- A checked logic chain from problem → decision point/root cause → proposed change → intended effect.
- Credible alternatives within the same authorized goal, especially earlier fix points, existing local owners, smaller-scope routes, and deletion of unnecessary layers; each smaller or deletion route carries the High-Potential Preservation Gate fields.
- A bounded optimality judgment: best-supported under observed constraints, adequate but suboptimal, wrong/unsupported, or unjudged without named evidence or a user decision.

Prohibited substitutes:

- Acceptance criteria, test coverage, rollout steps, milestone structure, extra documentation, or clearer wording do not satisfy this gate unless they also support the direction judgment.
- A plan that proves the proposed path can work does not satisfy this gate unless the review also checks whether it is the right path for the stated problem and constraints.
- "Could be cleaner" does not satisfy this gate without naming the violated invariant, extra complexity accepted, or better owner/fix point.

Incomplete behavior:

- If missing evidence materially affects the direction judgment, state the missing evidence as an open question and mark the direction unjudged rather than validating it indirectly.
- If the missing evidence is the boundary between intended scope and candidate implementation, mark the boundary question or pause condition; do not convert the ambiguity into a cut/defer recommendation.
- If the proposed plan is acceptable only as a compromise, state the invariant it sacrifices, the risk it accepts, the constraints it depends on, and the stop condition.

## High-Potential Preservation Gate

Activate this gate when reviewing a plan/spec and a complex, ambiguous, or underspecified component appears to carry material value for the stated outcome, or when a finding would remove, defer, or downgrade a user-visible capability.

Before recommending that the component be removed or downgraded, classify it:

- **Unnecessary scope**: not required for the requested outcome, speculative future flexibility, duplicate ownership, or complexity without current value. Cut or defer it.
- **Under-specified core capability**: plausibly necessary for the high-value version of the requested outcome, but missing boundaries, ownership, evidence, invariants, assumptions, or success criteria. Preserve the intent; require clarification, de-risking, or a learning slice before deletion.
- **Risky or unauthorized boundary change**: changes public behavior, shared contracts, persistence, schema, security, deployment, or cross-module ownership without authorization. Pause, ask for authorization, or propose the best local alternative.

Required fields for any direction-level finding that cuts, narrows, defers, or replaces a major plan element:

- `Classification`: unnecessary scope / under-specified core capability / risky unauthorized boundary change.
- `Evidence`: the observed constraint, missing authorization, failed assumption, value mismatch, or existing owner that supports the classification.
- `Preserved outcome`: what the recommended path still delivers for the user's stated goal.
- `Lost outcome`: what the cut or downgrade gives up; state `none` only when no material user-visible value is lost.
- `Preservation path`: what would need to be clarified, proven, constrained, or tested to keep the high-potential version.
- `Smallest correction`: keep, clarify, de-risk, localize, defer, or drop.

Prohibited substitutes:

- "Smaller", "simpler", "clearer", or "less risky" do not justify a cut unless the review names the user-visible outcome preserved and the evidence that the lost surface is not required.
- Ambiguity is not evidence for cutting when the component is plausibly core to the requested outcome; when intended scope is unclear, the correction is boundary clarification, not a cut or defer; acceptance criteria, rollout steps, tests, or wording cleanup do not replace that clarification.

Incomplete behavior:

- If a lower-scope path would sacrifice a plausible requested outcome, mark the direction unjudged or acceptable only as a compromise until evidence or a user decision resolves the tradeoff.
- For reversible high-upside uncertainty, prefer a minimum learning plan, assumption test, prototype, or checkpoint that preserves the target outcome over a minimum feature plan that lowers the ceiling.

## Bar

Escalate every issue that could cause incorrect behavior, a broken contract, corrupted or inconsistent state, a test failure, or a misleading result. Below that floor, an observation that would not change the merge decision or the follow-up plan is at most a brief note, not a finding. Each finding names a concrete surface, the impact, and the smallest correction.

**Root-cause aggregation.** When several candidate findings share one cause — the same wrong premise, the same missing contract, the same mistake repeated across sites — trace the symptoms upward and deliver one root-cause finding with the instances listed under it, not a set of sibling fine-grained findings. The correction targets the cause; the instance list proves its extent.

The Bar filters what is escalated, never what is examined: Coverage decides what gets read, and escalation is a severity decision made after investigation — never a license to skip reading. Filter on severity and merge-relevance, not on your own confidence. Investigate fully, then decide what to escalate: surface a plausible correctness/contract/state issue even when you are unsure of it — flag the uncertainty and name what would confirm it — rather than dropping it silently. Do not suppress a genuine low-severity finding to keep the count down; report it at its true severity and order it last.

Severity: **blocker** (correctness/contract/state), **raise** (real issue, follow-up acceptable), **nit** (small polish). Order by severity. Split atomic findings when surface or correction differs; merge only exact duplicates and shared-root-cause instances. If nothing clears the floor, say so and name residual risk.

For draft-plan reviews, corrections are plan changes (revised approach, added context, stronger non-goal, checkpoint, user decision).

## Lenses

Most reviews are inline — apply whichever lenses fit the change. When the scope exceeds one pass or risk concentrates (multi-file, public API/CLI/schema/migration/persistence), dispatch focused sub-agents using the lens descriptions below as their prompts (consult `agent-team` first), partitioning the units so every one lands in some finder's slice — partition the scope, never sample it; task packets and the join-back follow the Traceability delegation rules. Sub-agents stay read-only, apply the attribution rule, and return concrete candidates with source pointers plus the read-list for their slice; silence is valid only when that read-list shows the whole slice read with nothing to report. A finder's job is coverage, not filtering: it reports every candidate it finds, including uncertain and low-severity ones, each with a confidence level and estimated severity; filtering against the Bar and root-cause aggregation happen in the main review and the synthesis critic, not in the finder.

**Design shape.** Shallow interfaces, information leakage, tactical patches adding branches/modes/fallbacks without reducing underlying complexity, weak ownership boundaries, error handling that should be removed by design, layers that only forward calls. Use APOSD vocabulary — every design finding names reader task + symptom (change amplification / cognitive load / unknown-unknown) + cause (dependency / obscurity). Reject "cleaner" / "more DRY" / "add comments" without that mapping.

**Contract surface.** Public/shared contracts: API, CLI, schemas, persisted state, generated artifacts, wrappers, migrations. New capability promises, silent rewrites/repairs/normalizations on parse, wrappers that reinterpret upstream contracts, missing collision checks on derived identities (paths/routes/cache keys/external refs), undocumented changes to behavior/imports/CLI output/event payloads/errors/timing, migrations that drop source baseline or fixture matrix, rewrites that keep an action but silently drop the precondition that gated it (permission / verification / risk-control / validation / enable-disable predicate). Don't invent compatibility requirements beyond observed contracts.

**Test validation.** Regression evidence. Behavior that could regress without coverage, tests that assert private state / call order / component names instead of public behavior, mocks of things that should be real, production-only seams added for testability, plans that prove the new path while leaving existing behavior unprotected. Don't report coverage gaps in untouched code.

**Implementation fit.** Fit with the local codebase. New helpers/wrappers/adapters that duplicate existing owners, single-use abstractions, wrong-layer logic, near-copy variants, broad find-and-replace that scatters one behavior, options/branches/files for future flexibility, calls to nonexistent or bypassed helpers. Don't propose adjacent refactors unless they are the smallest correction.

**Synthesis critic.** Dispatch when risk is high or evidence conflicts. Different role: challenges the draft findings, doesn't produce new candidates. Probes: evidence real and locators independently followable, attribution correct against base, PRE-EXISTING justified, set clears the bar (drop low-value / excess nits), no bad duplicates/splits/severity, root-cause aggregation done (symptoms sharing a cause merged and traced upward, not left as sibling nits), APOSD findings name reader-task/symptom/cause not slogans, severe sub-agent candidates not silently dropped, the coverage account complete (re-derive the unit partition independently from the source structure and diff it against the manifest — gaps are findings, not footnotes), every refutation or withdrawal reported with its evidence rather than silently dropped. Returns per challenge: target finding (or missing area), issue, evidence, action (keep / drop / retag / reword / reorder / verify / surface in judgment).

## Output

User's primary language for prose; keep code symbols, paths, errors original. Return: coverage account (what was read — files with line ranges, sections, compared surfaces — and what was not, with blockers; for parity reviews the per-surface verdict matrix) → findings, with root-cause and direction findings first and their instances nested under them, each citing its locators, severity-tagged, and prefixed `[NEW]`/`[PRE-EXISTING]` (or carrying the per-surface verdict in a parity audit) → open questions that materially change the decision → short overall judgment (note blocked/unreviewed surfaces). For plan/spec reviews, the findings section starts with direction, premise, ownership, and logic-chain issues when present, ahead of acceptance/test findings of equal or lower severity. The overall judgment names the direction verdict: best-supported, adequate but suboptimal, wrong/unsupported, or unjudged; if the plan's high-value version is plausible but under-specified, name it as under-specified rather than downgrading the verdict to a smaller plan by default. No edits, commits, or pushes without separate authorization.

## Stop Rules

Finish any review only after its final deliverable closes the coverage account — everything in scope read, or each unread item named with its blocker — and every finding's locators can be independently followed from the report alone. For changes that replace or delete code, also require the guard/precondition survival check (Attribution) to have been run, not just a capability comparison. For plan/spec reviews, also require the Plan-Direction Gate to have a stated verdict, the High-Potential Preservation Gate to be satisfied for every major cut/defer/narrowing recommendation and every other cut/defer/narrowing finding to carry at least its `Classification`, material open questions to be named, and acceptance/test observations not to displace a more important direction judgment. If a plausible high-value outcome depends on unresolved intended-scope evidence, stop with the boundary question, assumption test, learning slice, or user decision needed; do not finish by silently lowering the plan ceiling. For diff/code reviews, also require attribution, severity, and residual risk to be clear. A review that cannot close its scope ends by naming the uncovered set and what closing it requires — never by presenting partial coverage as complete. If verification is unavailable or out of scope, state the next-best evidence used.
