# Mode Presets And Construction

Read at the Mode decision point: after Scout, before Bake. Adopt a preset only when its work-unit type, evidence standard, verification target, and stop rule all fit the scouted task; a mismatch on any one means construct a Mode. Record the chosen Mode's four properties plus its skeleton in the blueprint `Mode` field — Bake, Structure, and Integrate read them from there, not from this file.

Each preset states its own anti-collapse rule: the sentence that says what is *not* a work unit under that Mode. Those sentences are the reason the preset is not a label.

Each preset's four bullets carry the five blueprint properties: `Scout` states the evidence standard, `Bake` the work-unit type, `Structure` the skeleton and the verification target, `Done` the stop rule. Copy them into the blueprint `Mode` field under those five names.

## Review / Audit

Use for code reviews, security audits, behavioral parity checks, risk hunts, and "find anything wrong" requests.

- Scout for changed or suspicious evidence roots, systemic risk, contracts, and not-a-bug items. Treat unbounded audits as `open-discovery`. Coarse labels are inventory seeds, not units, until split to single evidence roots.
- Bake one `WORK_UNIT` per independent evidence root (caller tree, interface or contract surface, state machine, behavior path, or review dimension). A module or feature path is a unit only when it has a single evidence root; otherwise split by root.
- Structure as `review each unit -> adversarially verify every material finding -> completeness critic -> report`.
- Done means every reported material finding survived independent refutation, skipped scope is named, and positive absence claims cover only roots that were inventoried and probed.

## Research

Use for broad or current research where claims need sources and cross-checking.

- Scout for source modalities, authority rules, recency needs, and claim categories.
- Bake one unit per concrete source family, jurisdiction, time window, claim category, or falsifiable hypothesis — each with named sources, corpora, or search operators. A theme phrase without those anchors is not a unit.
- Structure as `gather claims -> dedup claims -> independently verify load-bearing claims -> cited synthesis`.
- Done means supported, refuted, and unverified claims are separated, and the final answer does not rest on unchecked claims.

## Decision

Use for architecture choices, trade-offs, irreversible plans, prioritization, and recommendations that should survive attack.

- Scout for constraints, decision criteria, candidate positions, and disqualifiers.
- Bake mutually exclusive whole candidates, not analysis facets. Enforced by Unit Atomicity's `candidate-position` split rule.
- Structure as `candidate proposals -> candidate x critique-lens gauntlet -> judge panel -> ruling`.
- Done means each serious candidate has been attacked under each named lens by that lens's own owner, not merely discussed in a shared review. Enforced by the Topology Floor `skeptic` clause.

## Understand / Map

Use for mapping a large codebase, unfamiliar system, document set, or process.

- Scout for major subsystems, entry points, data/control flow, and cross-cutting concerns.
- Bake one unit per subsystem or source cluster only when that cluster is a single deep-read root; split denser clusters. Always include a completeness critic for missed major units.
- Structure as `discover -> completeness critic -> deep-read units -> synthesize map`.
- Done means the synthesis covers major units, relationships, reading order, and named gaps. The deliverable is a map with named gaps, not a finding list; if the run also emits material defect or risk findings, those findings need the Review/Audit verification path.

## Migration / Sweep

Use for broad mechanical changes, repeated inspections, or site-by-site remediation.

- Scout for every candidate site and the invariant each site must preserve. Unknown site sets are `open-discovery` until inventory exists.
- Bake one unit per site, or one homogeneous batch of sites that share the same invariant and the same verification command. Record each batch under `LIMITS.batching` — never as a coverage gap.
- Structure as `discover sites -> transform or inspect each site or batch with disjoint ownership -> verify each -> summarize`.
- Done means applied/verified, failed, skipped, and kept-for-human-attention sites are separated.

## When To Construct A New Mode

Construct rather than adapt a preset when any of these hold:

- The natural work unit is not files, sources, candidates, subsystems, sites, or another preset unit type.
- The load-bearing evidence is not captured by the preset's scout requirements.
- The verification target is unusual: narratives, event timelines, contracts, personas, generated artifacts, policies, constraints, or another domain-specific object.
- The stop rule is domain-specific and cannot be reduced to confirmed findings, verified claims, candidate ruling, mapped subsystems, or applied sites.
- Combining presets would blur ownership, or would create a shared review where a per-object gauntlet is needed.

## Constructed Mode Template

Define all nine fields before Bake:

- `Mode name`: a short task-shaped name.
- `Why presets do not fit`: the specific mismatch that would corrupt coverage, verification, or stopping.
- `Work unit type`: what the team should split over.
- `Scout requirements`: what must be known before bake.
- `Context pack fields`: any fields beyond the standard pack.
- `Skeleton`: stage order, pipeline/barrier points, and synthesis owner.
- `Verification matrix`: what gets checked, by which lenses or adversaries, and the pass threshold.
- `Stop rule`: what evidence proves the team is done.
- `Red flags`: how this Mode is most likely to collapse into a weak generic fan-out — one per axis the Mode leaves to judgment.

A worked shape, for calibration only — do not force a task toward it. **Incident Reconciliation**: reconcile conflicting incident reports, postmortems, audit narratives, or stakeholder accounts. Unit type is one narrative, claim cluster, timeline segment, or disputed point; scout for event claims, timestamps, actors, disputed facts, and evidence strength; skeleton is `extract claims -> build contradiction matrix -> verify load-bearing facts -> synthesize reconciled account`; done means every public claim is supported, contradicted, or explicitly unresolved, with narrative conflicts named rather than smoothed over.
