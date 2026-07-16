---
name: code-review
description: "Review concrete code plan drafts, specs, diffs, and implementation shapes, including parity audits of an implementation against an authoritative source or reference implementation. Use for code-review requests, exhaustive or line-by-line review requests, parity/alignment/completeness audits, serious code-plan design critique, and judging whether a proposed direction is sound. Near miss: use code-plan to create or revise plans."
---

# Code Review

Perform an adversarial review of the change. Look for opportunities to **reduce layers** (pass-through wrappers, single-use abstractions), **remove unnecessary complexity** (code-judo: restructurings that delete branches/modes/helpers, not rearrange them), and **increase reliability** (correctness, contract, state, concurrency, migration risk). For plan and spec reviews, judge the chosen direction before acceptance or test details: whether it solves the stated problem, rests on valid premises, assigns ownership to the right layer, fits observed constraints, preserves the highest-value intended outcome, and beats credible root-cause or lower-scope alternatives. A lower-scope alternative only beats the proposed route when it preserves the stated outcome or evidence shows the removed surface is unrequested, unauthorized, speculative, constraint-breaking, or not worth its complexity. Honor repo-wide policies (`AGENTS.md`, `CONTRIBUTING.md`, ADRs) as hard constraints. Verify what you can. Keep the original goal fixed; challenge the proposed route when evidence shows a better route to that same goal.

## Coverage

The user circumscribes the review scope — a diff, a file set, a plan, an authoritative source to compare against. Within that scope, coverage is exhaustive, never sampled. Before reviewing, enumerate the units the scope contains, deriving the list mechanically from the source material (diff hunk list, file listing, render/AST tree) — never from a mental model of what matters — and state the enumeration basis so the account is checkable. A unit is the smallest element that can independently diverge or fail: a changed hunk plus the contracts it touches for a diff; each render node, conditional branch, handler, request/payload, state write, asset, and copy/style element for a parity review. Closing a unit means reading every line it contains and recording an explicit verdict in the Unit Ledger (below): correct/aligned, authorized divergence, defect, or unreviewed (named, with reason). Risk weighting may order the work and add scrutiny above that floor; it never decides whether a unit enters the list or lowers the reading floor.

"Reviewed" is an observation claim: make it only with the account — N units enumerated, N closed. Scope size is a partitioning problem, never a stop reason: when the scope exceeds one pass, split it across sub-agents until every unit is closed, stating the coverage plan first — N units, M slices — so the fan-out is visible before it starts. A unit stays unreviewed only on an observable blocker — a source that cannot be read, an artifact that is unavailable, a judgment needing information only the user holds — each named with its blocker; a partial review presents itself as partial.

## Unit Ledger

The coverage account is delivered as a Unit Ledger: one row per enumerated unit, opened before review and completed as it proceeds. Each row carries an `ID` (unique and stable within the review), a `Subject` (what the unit is, specific enough to tell it from every other unit), a `Locator` (an independently usable pointer — file plus symbol/line or diff hunk, document section, AST/render node path, request/state surface, or for parity work the source/target pair, including an explicitly missing side), and, once closed, a `Verdict` and its `Evidence` or blocker. An ID is only a join key: a bare ID, an ID range, or a group/file label standing in for smaller units is not a coverage claim. Findings and uncovered sets cite `ID + Subject + Locator`, never a bare number, and never mint a parallel finding-numbering scheme; an ordering label added for readability must not collide with the unit-ID space.

The ledger scales to the review. A three-hunk diff is three inline rows; beyond a screenful of rows (roughly 30 units), or whenever work is delegated, the ledger is a Markdown/CSV/JSON file. Create that file the moment enumeration completes — before any unit is reviewed or any sub-agent dispatched — with every row opened as `ID + Subject + Locator` and an empty verdict, in a temporary/scratch directory outside the repository; never delete it, before or after delivery. Write verdicts and evidence back to the file as units close: the final report is a view of the file, never a from-memory reconstruction, and it links the file's absolute path and quotes its counts from it. A refuted or withdrawn finding keeps its row and ID — correct the verdict in place and note what refuted it, so every reversal stays traceable. Report size changes only where the ledger lives, never whether it is delivered — omitting or sampling it because it is large is not permitted. The complete ledger ships with the final report — not left in scratch notes, prompts, or sub-agent transcripts — with correct/aligned rows included even when they never surface as findings.

The final accounting must hold:

`enumerated units = ledger rows = unique IDs = reviewed rows + explicitly-unreviewed rows`

An ID is **broken** when it is duplicate (two rows share it), orphan (a result cites an ID with no row), undefined (a row lacks Subject or Locator), unresolved (a referenced ID maps to zero or more than one row), or renumbered (a row's ID changed after enumeration). The review's **identifier-integrity** checks — referenced by that name elsewhere in this skill — require zero broken IDs and that every ID used in any result, finding, uncovered set, or summary resolve to exactly one row. When the ledger is a file, run these checks mechanically against the file — count rows, count unique IDs, list empty verdicts — rather than asserting them from memory. A complete review additionally has zero unreviewed rows.

When work is delegated, the enumerator owns identity: each task packet carries its assigned rows in full (`ID + Subject + Locator`) plus a `Slice/owner`, reviewers return those canonical IDs with verdicts and evidence, and synthesis joins the results back into the one ledger without a replacement numbering scheme. A reviewer that finds an omitted unit proposes it with subject, locator, and discovery reason; only the enumerator appends its canonical row and updates the totals, and existing rows are never renumbered.

If a required field, verdict, evidence/blocker, or mapping is missing, mark that unit unreviewed and the review partial until the ledger is repaired. If the output channel cannot carry or link the complete ledger, name the exact undelivered rows as `ID + Subject + Locator` and return that delivery decision to the user rather than claiming complete coverage.

## Attribution

Distinguish **NEW** (introduced or made materially worse by this change) from **PRE-EXISTING** (already true on the base branch). Compare against base — read the unchanged file or check blame, not just the diff hunks. When the change replaces or deletes code, enumerate the guards and preconditions the old surface enforced — not just which capabilities it kept — and confirm each survives; an action that stays present but loses the predicate that gated it is invisible in a structural diff. Report PRE-EXISTING only when the change touches the same surface and it blocks the intended outcome, the change makes it worse, or the user asked for a broader audit. Tag every finding `[NEW]` or `[PRE-EXISTING]`; if uncertain, say so rather than defaulting to NEW. Attribution presumes a base to diff against; in a parity audit the per-unit verdict (aligned / authorized divergence / defect) carries this role — don't force NEW/PRE-EXISTING tags where no base exists.

## Plan-Direction Gate

Activate this gate when reviewing a plan, spec, proposed implementation approach, migration design, or any request asking whether an approach is right, wrong, best, optimal, or worth doing.

Required evidence before judging plan quality:

- Target outcome and explicit constraints from the prompt, repo evidence, linked issue, or local project rules.
- The plan's highest-value intended outcome: the user-visible capability, product value, reliability gain, or strategic option the plan is trying to preserve.
- The plan's chosen strategy and ownership point: data source, state write, shared contract, call boundary, persistence/schema boundary, or presentation layer.
- A checked logic chain from problem → decision point/root cause → proposed change → intended effect.
- Credible alternatives within the same authorized goal, especially earlier fix points, existing local owners, smaller-scope routes, and deletion of unnecessary layers; for each smaller or deletion route, name the outcome preserved, the outcome lost, and the evidence that any lost surface is outside scope or not worth keeping.
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
- Ambiguity is not evidence for cutting when the component is plausibly core to the requested outcome.
- Acceptance criteria, rollout steps, tests, or wording cleanup do not replace boundary clarification when the issue is unclear intended scope.

Incomplete behavior:

- If a lower-scope path would sacrifice a plausible requested outcome, mark the direction unjudged or acceptable only as a compromise until evidence or a user decision resolves the tradeoff.
- For reversible high-upside uncertainty, prefer a minimum learning plan, assumption test, prototype, or checkpoint that preserves the target outcome over a minimum feature plan that lowers the ceiling.

## Bar

Every unit's verdict lives in the ledger; the Bar decides only which closed units are escalated into narrative findings. Escalate every issue that could cause incorrect behavior, a broken contract, corrupted or inconsistent state, a test failure, or a misleading result. Below that floor, an observation stays a ledger verdict rather than a finding when it would not change the merge decision or the follow-up plan. Each finding names a concrete surface, the impact, and the smallest correction.

The Bar filters what is escalated, never what is examined or recorded: Coverage decides what gets reviewed, the ledger records every verdict, and escalation is a severity decision made after a unit is closed — never a license to skip a unit or drop it from the ledger. Filter on severity and merge-relevance, not on your own confidence. Investigate fully, then decide what to escalate: surface a plausible correctness/contract/state issue even when you are unsure of it — flag the uncertainty and name what would confirm it — rather than dropping it silently. Do not suppress a genuine low-severity finding to keep the count down; report it at its true severity and order it last.

Severity: **blocker** (correctness/contract/state), **raise** (real issue, follow-up acceptable), **nit** (small polish). Order by severity. Split atomic findings when surface or correction differs; merge only exact duplicates. If nothing clears the floor, say so and name residual risk.

For draft-plan reviews, corrections are plan changes (revised approach, added context, stronger non-goal, checkpoint, user decision). A correction that cuts or narrows a major plan element must satisfy the High-Potential Preservation Gate fields.

## Lenses

Most reviews are inline — apply whichever lenses fit the change. When the enumerated scope exceeds one pass or risk concentrates (multi-file, public API/CLI/schema/migration/persistence), dispatch focused sub-agents using the lens descriptions below as their prompts (consult `agent-team` first), partitioning the ledger so every unit lands in some finder's slice — partition the scope, never sample it; task packets and the join-back follow the Unit Ledger's delegation rules. Sub-agents stay read-only, apply the attribution rule, and return concrete candidates with source pointers plus a per-unit account of their slice; silence is valid only when that account shows every assigned row closed with nothing to report. A finder's job is coverage, not filtering: it reports every candidate it finds, including uncertain and low-severity ones, each with a confidence level and estimated severity; filtering against the Bar happens in the main review and the synthesis critic, not in the finder.

**Design shape.** Shallow interfaces, information leakage, tactical patches adding branches/modes/fallbacks without reducing underlying complexity, weak ownership boundaries, error handling that should be removed by design, layers that only forward calls. Use APOSD vocabulary ([references/aposd-complexity-review.md](references/aposd-complexity-review.md)) — every design finding names reader task + symptom (change amplification / cognitive load / unknown-unknown) + cause (dependency / obscurity). Reject "cleaner" / "more DRY" / "add comments" without that mapping.

**Contract surface.** Public/shared contracts: API, CLI, schemas, persisted state, generated artifacts, wrappers, migrations. New capability promises, silent rewrites/repairs/normalizations on parse, wrappers that reinterpret upstream contracts, missing collision checks on derived identities (paths/routes/cache keys/external refs), undocumented changes to behavior/imports/CLI output/event payloads/errors/timing, migrations that drop source baseline or fixture matrix, rewrites that keep an action but silently drop the precondition that gated it (permission / verification / risk-control / validation / enable-disable predicate). Don't invent compatibility requirements beyond observed contracts.

**Test validation.** Regression evidence. Behavior that could regress without coverage, tests that assert private state / call order / component names instead of public behavior, mocks of things that should be real, production-only seams added for testability, plans that prove the new path while leaving existing behavior unprotected. Don't report coverage gaps in untouched code.

**Implementation fit.** Fit with the local codebase. New helpers/wrappers/adapters that duplicate existing owners, single-use abstractions, wrong-layer logic, near-copy variants, broad find-and-replace that scatters one behavior, options/branches/files for future flexibility, calls to nonexistent or bypassed helpers. Don't propose adjacent refactors unless they are the smallest correction.

**Synthesis critic.** Dispatch when risk is high or evidence conflicts. Different role: challenges the draft findings, doesn't produce new candidates. Probes: evidence real, attribution correct against base, PRE-EXISTING justified, set clears the bar (drop low-value / excess nits), no bad duplicates/splits/severity, APOSD findings name reader-task/symptom/cause not slogans, severe sub-agent candidates not silently dropped, the coverage account closed (every enumerated unit carries a verdict; holes reported as findings, not acknowledged in passing), the enumeration re-derived independently from the source material and diffed against the working list (enumeration gaps are findings), the ledger passes its identifier-integrity checks (every referenced ID resolves to exactly one row; no broken IDs; no sub-agent renumbered its slice), every refutation or withdrawal recorded as an in-place verdict correction in the ledger rather than a silent drop, aligned/correct verdicts spot-checked adversarially rather than taken on faith. Returns per challenge: target finding (or missing area), issue, evidence, action (keep / drop / retag / reword / reorder / verify / surface in judgment).

## Self-Review

Before final output, check:

- Could this review sound useful while only strengthening acceptance, tests, rollout, or wording without judging the plan direction? If yes, the review is incomplete for a plan/spec request.
- Does every direction-level judgment cite observed evidence or explicitly mark the missing evidence?
- For every finding that cuts, defers, or narrows a plan element, did the review classify it as unnecessary scope, under-specified core capability, or risky unauthorized boundary change?
- Did the review treat fuzziness as a clarification or learning problem before treating it as scope to delete?
- If a plan has a plausible high-value version, did the review preserve that potential by naming the missing boundary, assumption, owner, or success criterion instead of collapsing it into a safer but weaker plan?
- Are direction, premise, ownership, or logic-chain findings ordered before acceptance/test findings of equal or lower severity?
- Does the review distinguish "best-supported under these constraints" from a theoretical global optimum?
- For changes that replace or delete code, did the review enumerate the guards/preconditions the old surface enforced and confirm each survives — not just that capabilities were kept?
- Does every completeness claim match the coverage account — nothing presented as reviewed beyond what was enumerated and closed?
- Is the complete Unit Ledger delivered (inline, appended, or named-and-linked) with every unit's Subject, Locator, and Verdict, so a reader can trace every unit from the report alone — not from scratch notes, prompts, or transcripts?
- Does the ledger pass its identifier-integrity checks — the accounting identity holds, every referenced ID resolves to exactly one row, and no broken IDs remain — checked mechanically against the ledger file when one exists?

## Output

User's primary language for prose; keep code symbols, paths, errors original. Return: coverage account (enumeration basis; units enumerated/reviewed/unreviewed; the complete Unit Ledger inline, appended, or named-and-linked by absolute path, with any identifier-integrity exceptions noted; uncovered rows by `ID + Subject + Locator`; for parity reviews the per-unit verdict matrix is the ledger) → findings (each cites `ID + Subject + Locator`, is severity-tagged, and is prefixed `[NEW]`/`[PRE-EXISTING]`, or carries the per-unit verdict in a parity audit) → open questions that materially change the decision → short overall judgment (note blocked/unreviewed surfaces). The complete ledger ships even when most rows are correct/aligned and never surface as narrative findings. For plan/spec reviews, the findings section starts with direction, premise, ownership, and logic-chain issues when present; findings that cut or narrow major plan elements include the High-Potential Preservation Gate fields. The overall judgment names the direction verdict: best-supported, adequate but suboptimal, wrong/unsupported, or unjudged; if the plan's high-value version is plausible but under-specified, name it as under-specified rather than downgrading the verdict to a smaller plan by default. No edits, commits, or pushes without separate authorization.

## Stop Rules

Finish any review only after its final deliverable contains or links the complete Unit Ledger and the ledger passes its identifier-integrity checks, run mechanically against the ledger file when one exists; a ledger file, once created, is never deleted. For plan/spec reviews, also require the Plan-Direction Gate to have a stated verdict, the High-Potential Preservation Gate to be satisfied for every major cut/defer/narrowing recommendation, material open questions to be named, and acceptance/test observations not to displace a more important direction judgment. If a plausible high-value outcome depends on unresolved intended-scope evidence, stop with the boundary question, assumption test, learning slice, or user decision needed; do not finish by silently lowering the plan ceiling. For diff/code reviews, also require the coverage account to be closed and attribution, severity, and residual risk to be clear. A review that cannot close its scope or deliver the ledger ends by naming the uncovered or undelivered set as `ID + Subject + Locator` and what closing it requires — never by presenting partial coverage as complete. If verification is unavailable or out of scope, state the next-best evidence used.
