# Mode Presets And Construction

Read at the Mode decision point: after Scout, before Bake. Adopt a preset only when its work-unit type, evidence standard, verification routing, and stop rule all fit the scouted task; a mismatch on any one means construct a Mode. Record the chosen Mode's five properties in the blueprint `Mode` field — Bake, Structure, and Integrate read them from there, not from this file.

Each preset states its own anti-collapse rule: the sentence that says what is *not* a work unit under that Mode. Those sentences are the reason the preset is not a label.

Each preset's five bullets carry the five blueprint properties: `Scout` states the evidence standard, `Bake` the work-unit type, `Structure` the skeleton, `Verify` the verification routing, `Done` the stop rule. Copy them into the blueprint `Mode` field under those names.

`Verify` has three parts. **Must-verify** claims need an independent lane before they enter the answer as confirmed; a floor lane owns them from launch. **Labeled** claims enter carrying their status. **Escalate** lists observable conditions and the lane each adds once the condition is seen in returned evidence. The cross-Mode rules in SKILL.md Structure — cited reasons are must-verify, conflicts get a targeted verifier, stakes markers add a lens — apply on top of every preset.

## Review / Audit

Use for code reviews, security audits, behavioral parity checks, risk hunts, and "find anything wrong" requests.

- Scout for changed or suspicious evidence roots, systemic risk, contracts, and not-a-bug items. Treat unbounded audits as `open-discovery`. Coarse labels are inventory seeds, not roots, until split to single evidence roots.
- Bake units by inspect type over named evidence roots (caller tree, interface or contract surface, state machine, behavior path, or review dimension). A module or feature path is a root only when it has a single evidence root; otherwise name each root it contains.
- Structure as `review each unit -> route findings -> verify must-verify findings and fired triggers -> completeness check when open-discovery -> report`.
- Verify: must-verify — blocker-severity findings, findings the overall verdict relies on, and positive absence claims (closed inspect list; a completeness owner when coverage is `open-discovery`). Labeled — every other finding, with severity and confidence. Escalate — none beyond the cross-Mode rules.
- Done means every must-verify finding survived independent refutation, every other finding carries its status, skipped scope is named, and positive absence claims cover only roots that were inventoried and probed.

## Research

Use for broad or current research where claims need sources and cross-checking.

- Scout for source modalities, authority rules, recency needs, and claim categories.
- Bake units by inspect type over named source families, jurisdictions, time windows, claim categories, or falsifiable hypotheses — each with named sources, corpora, or search operators. A theme phrase without those anchors is not a unit.
- Structure as `gather claims -> dedup claims -> verify must-verify claims and fired triggers -> cited synthesis`.
- Verify: must-verify — claims the conclusion cites as reasons and figures stated as fact. Labeled — context claims, each with its source; single-source claims flagged. Escalate — a must-verify claim resting on a single source adds a verifier working from an independent source family.
- Done means verified, refuted, unresolved, and unverified claims are separated, and the conclusion rests only on verified claims.

## Decision

Use for architecture choices, trade-offs, irreversible plans, prioritization, and recommendations that should survive attack.

- Scout for constraints, decision criteria, candidate positions, and disqualifiers.
- Bake mutually exclusive whole candidates, not analysis facets — enforced by Unit Atomicity's `candidate-position` split rule. A proposer lane builds a candidate's strongest form only when the candidate needs construction or strengthening; candidates the user supplied fully formed go straight to critique.
- Structure as `candidate proposals where needed -> one independent critic per serious candidate -> per-lens gauntlet when escalated -> judge when critics conflict -> ruling`.
- Verify: must-verify — every serious candidate is attacked by its own independent critic; one shared review spanning candidates does not count. Escalate — when more than one candidate survives the first round without a disqualifying finding, when the decision is irreversible or touches a public or shared contract, security, or persisted data, or when the user asks for adversarial critique, run the candidate × critique-lens gauntlet with each lens under its own owner; when critics' conclusions conflict, add a judge.
- Done means each serious candidate was attacked by its own critic, every fired trigger ran, and the ruling records how many candidates survived the first round.

## Understand / Map

Use for mapping a large codebase, unfamiliar system, document set, or process.

- Scout for major subsystems, entry points, data/control flow, and cross-cutting concerns.
- Bake units by inspect type over named subsystems or source clusters, naming each deep-read root a dense cluster contains.
- Structure as `discover -> completeness check on the inventory when open-discovery -> deep-read units -> synthesize map`.
- Verify: must-verify — inventory completeness when coverage is `open-discovery`, since the map implies its major units are all present. Labeled — the map of a closed surface and in-unit detail, with named gaps. Escalate — any defect or risk claim the run emits routes through Review/Audit verification.
- Done means the synthesis covers major units, relationships, reading order, and named gaps. The deliverable is a map with named gaps, not a finding list.

## Migration / Sweep

Use for broad mechanical changes, repeated inspections, or site-by-site remediation.

- Scout for every candidate site and the invariant each site must preserve. Unknown site sets are `open-discovery` until inventory exists.
- Bake one unit per site, or one homogeneous batch of sites that share the same invariant and the same verification command. Record each batch under `LIMITS.batching` — never as a coverage gap.
- Structure as `discover sites -> transform or inspect each site or batch with disjoint ownership, running its verification command -> independent review of escalated sites -> summarize`.
- Verify: must-verify — each site or batch's verification command, returned as the command and its output. Escalate — sites where the command cannot observe the invariant, failed sites, and sites kept for human attention get an independent review.
- Done means applied/verified, failed, skipped, and kept-for-human-attention sites are separated.

## When To Construct A New Mode

Construct rather than adapt a preset when any of these hold:

- The natural work unit is not files, sources, candidates, subsystems, sites, or another preset unit type.
- The load-bearing evidence is not captured by the preset's scout requirements.
- The verification target is unusual: narratives, event timelines, contracts, personas, generated artifacts, policies, constraints, or another domain-specific object.
- The stop rule is domain-specific and cannot be reduced to confirmed findings, verified claims, candidate ruling, mapped subsystems, or applied sites.
- Combining presets would blur ownership, or would create a shared review where per-candidate critique is needed.

## Constructed Mode Template

Define all nine fields before Bake:

- `Mode name`: a short task-shaped name.
- `Why presets do not fit`: the specific mismatch that would corrupt coverage, verification, or stopping.
- `Work unit type`: what the team should split over.
- `Scout requirements`: what must be known before bake.
- `Context pack fields`: any fields beyond the standard pack.
- `Skeleton`: stage order, pipeline/barrier points, and synthesis owner.
- `Verification routing`: must-verify claims with their floor lanes, labeled claims, and escalation triggers — each an observable condition with the lane it adds.
- `Stop rule`: what evidence proves the team is done.
- `Red flags`: how this Mode is most likely to collapse into a weak generic fan-out — one per axis the Mode leaves to judgment.

A worked shape, for calibration only — do not force a task toward it. **Incident Reconciliation**: reconcile conflicting incident reports, postmortems, audit narratives, or stakeholder accounts. Unit type is one narrative, claim cluster, timeline segment, or disputed point; scout for event claims, timestamps, actors, disputed facts, and evidence strength; skeleton is `extract claims -> build contradiction matrix -> verify load-bearing facts -> synthesize reconciled account`; must-verify is every fact the reconciled account rests on, escalating to a targeted verifier wherever accounts contradict; done means every public claim is supported, contradicted, or explicitly unresolved, with narrative conflicts named rather than smoothed over.
