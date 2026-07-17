---
name: agent-team
description: "Use when a task needs two or more non-conflicting sub-agents for parallel coverage, independent verification, exhaustive review or audit, broad research, codebase mapping, migration or sweep work, or adversarial critique of a decision. Also use when the user asks to fan out, delegate to several agents, run a team, or cross-check work with multiple independent agents. Near miss: use agent-handoff for one indivisible delegation. Do not use for a single atomic task or for overlapping mutators without disjoint ownership or isolation."
---

# Agent Team

Run a team only after the task has been compiled into an orchestration blueprint. The main agent scouts the real shape of the work, selects or constructs a Mode, bakes shared context into every packet, structures the topology, launches bounded sub-agents, relays progress, routes gaps or conflicts, and synthesizes one result from returned evidence.

The team's value comes from disciplined shape, not agent count. A broad fan-out without a blueprint is a parallel dump; a small team with complete scout evidence, atomic work units, shared context, and independent verification can be stronger than a larger unstructured fan-out. A small team is never justified by coarse labels that hide multiple evidence roots; it is justified when the scouted surface is small, or when a larger surface is explicitly sampled or capped in `LIMITS` with the Topology Floor completeness lane named.

Delegation is assumed authorized. Each member's packet, return format, stop condition, and report-as-evidence contract follows `agent-handoff`; this skill governs the team blueprint and verification topology.

## Hard Gate: Blueprint Before Launch

Activation: every `agent-team` use before spawning more than one sub-agent.

Required artifact: create an internal or user-visible blueprint with these fields:

- `Objective`: the single outcome the team is serving.
- `Mode`: the task shape that determines scout evidence, bake fields, skeleton, and stop rule.
- `Coverage Shape`: `closed-surface` or `open-discovery` (see Scout).
- `Scout Evidence`: the concrete work-list or inventory, shared risks or invariants, not-a-bug list, constraints, and unknowns.
- `Context Pack`: the baked material every relevant packet receives.
- `Structure`: stages, pipeline/barrier choices, verification matrix (including topology-floor lane owners), completeness pass, and synthesis owner.
- `Launch Gate`: atomic work units, topology floor, disjoint ownership, edit isolation when needed, parent relay boundary, caps, batching, stall limits, and stop criteria.

Prohibited substitutes: an agent count, a list of vague angles, "have several agents look around", subsystem labels treated as discovery units, or independent packets that each rediscover scope.

Incomplete behavior: scout locally or with a single scout agent until the blueprint is specific enough. If a critical scope fact remains unavailable and affects the topology, ask one focused question or return a plan-only blueprint with the missing fact named.

## Scout

Scout discovers the shape of the work before the team is formed. It is not duplicate evidence; it is the orchestrator's job to determine what the agents should not waste budget rediscovering.

Required scout evidence:

- Work-list candidates: files, modules, sources, candidate decisions, subsystems, sites, or hypotheses — refined to inventory surfaces before bake when coverage is open.
- Shared risk or invariant: the one or two facts most likely to drive real findings or failures.
- Not-a-bug list: authorized translations, accepted deferrals, known limitations, and things agents must not report.
- Boundaries: what is in scope, what is out of scope, and whether any agent may edit.
- Unknowns: facts that would change the Mode, topology, or stop rule.

Mark each material scout item as `observed`, `user-stated`, `inferred`, or `unknown`. `SHARED` and `NOT_A_BUG` may be empty or unknown; do not invent them to fill the blueprint. If an `unknown` would change `Mode`, `WORK_UNITS`, `VERIFY_MATRIX`, or the stop rule, scout further, ask one focused question, or carry it as an explicit residual gap. Launch requires named coverage status for topology-shaping unknowns.

### Coverage Shape And Cardinality

After the first scout pass, classify coverage shape:

- `closed-surface`: the inspect or edit list is already pinned — named files, symbols, sites, candidates, or a fixed change set. Cardinality follows that pinned list after unit atomicity checks.
- `open-discovery`: size is unknown — inventory hunts, unbounded audits, full-cone risk sweeps, or "find anything" over a surface whose members are not yet listed. Subsystem, folder, or epic labels are **not** work units. Run inventory until candidate surfaces, symbols, sites, or evidence roots are listed; derive cardinality from inventory length, or from a named sample recorded in `LIMITS`.

Mixed tasks: if any in-scope substream is `open-discovery`, record overall Coverage Shape as `open-discovery` and apply inventory plus completeness rules to every open substream. Closed substreams still bake from their pinned lists and keep pinned cardinality.

When the work-list is unknown, scout first and derive cardinality from the inventory result — not from a preferred headcount or a handful of logical areas. When scout finds no real work-list, keep the task local or use `agent-handoff`.

## Mode

Mode is a task-shape constructor, not a closed enum and not a label. Determine the Mode after scout and before bake. It determines what evidence is required, what work units mean, which skeleton to use, which outputs need verification, and what "done" means.

Preset Modes are templates for common task shapes. Use a preset only when its work-unit type, evidence standard, verification target, and stop rule fit the scouted task. When no preset fits, construct a new Mode that matches the task's natural unit, evidence, verification target, and stop rule.

Mode construction is required when any of these are true:

- The natural work unit is not files, sources, candidates, subsystems, sites, or another preset unit type.
- The load-bearing evidence is not captured by the preset's scout requirements.
- The verification target is unusual: narratives, event timelines, contracts, personas, generated artifacts, policies, constraints, or another domain-specific object.
- The stop rule is domain-specific and cannot be reduced to confirmed findings, verified claims, candidate ruling, mapped subsystems, or applied sites.
- Combining presets would blur ownership or create a shared review where a per-object gauntlet is needed.

For compound tasks, compose a Mode only where composition changes the skeleton or verification bar. Otherwise name one primary Mode and bake the secondary concern into `SHARED` or `VERIFY_MATRIX`.

### Constructing A New Mode

When constructing a Mode, define it before bake with:

- `Mode name`: a short task-shaped name.
- `Why presets do not fit`: the specific mismatch that would corrupt coverage, verification, or stopping.
- `Work unit type`: what the team should split over.
- `Scout requirements`: what must be known before bake.
- `Context pack fields`: any fields beyond the standard pack.
- `Skeleton`: stage order, pipeline/barrier points, and synthesis owner.
- `Verification matrix`: what gets checked, by which lenses or adversaries, and the pass threshold.
- `Stop rule`: what evidence proves the team is done.
- `Red flags`: how this Mode is most likely to collapse into a weak generic fan-out.

### Review / Audit

Use for code reviews, security audits, behavioral parity checks, risk hunts, and "find anything wrong" requests.

- Scout for changed or suspicious evidence roots, systemic risk, contracts, and not-a-bug items. Treat unbounded audits as `open-discovery`.
- Bake one `WORK_UNIT` per independent evidence root (caller tree, interface or contract surface, state machine, behavior path, or review dimension). A module or feature path is a unit only when it has a single evidence root; otherwise split by root.
- Structure as `review each unit -> adversarially verify every material finding -> completeness critic -> report`.
- Done means every reported material finding survived independent refutation, and skipped scope is named.

### Research

Use for broad or current research where claims need sources and cross-checking.

- Scout for source modalities, authority rules, recency needs, and claim categories.
- Bake one unit per concrete source family, jurisdiction, time window, claim category, or falsifiable hypothesis — each with named sources, corpora, or search operators. A theme phrase without those anchors is not a unit.
- Structure as `gather claims -> dedup claims -> independently verify load-bearing claims -> cited synthesis`.
- Done means supported, refuted, and unverified claims are separated, and the final answer does not rest on unchecked claims.

### Decision

Use for architecture choices, trade-offs, irreversible plans, prioritization, and recommendations that should survive attack.

- Scout for constraints, decision criteria, candidate positions, and disqualifiers.
- Bake mutually exclusive whole candidates, not just analysis facets.
- Structure as `candidate proposals -> candidate x critique-lens gauntlet -> judge panel -> ruling`.
- Done means each serious candidate has been attacked by its own lenses, not merely discussed in a shared review.

### Understand / Map

Use for mapping a large codebase, unfamiliar system, document set, or process.

- Scout for major subsystems, entry points, data/control flow, and cross-cutting concerns.
- Bake one unit per subsystem or source cluster only when that cluster is a single deep-read root; split denser clusters. Always include a completeness critic for missed major units.
- Structure as `discover -> completeness critic -> deep-read units -> synthesize map`.
- Done means the synthesis covers major units, relationships, reading order, and named gaps. The deliverable is a map with named gaps, not a finding list; if the run also emits material defect or risk findings, those findings need the Review/Audit verification path.

### Migration / Sweep

Use for broad mechanical changes, repeated inspections, or site-by-site remediation.

- Scout for every candidate site and the invariant each site must preserve. Unknown site sets are `open-discovery` until inventory exists.
- Bake one unit per site, or one homogeneous batch of sites that share the same invariant and the same verification command. Record each batch under `LIMITS.batching` (fields defined in Bake) — never as a coverage gap.
- Structure as `discover sites -> transform or inspect each site or batch with disjoint ownership -> verify each -> summarize`.
- Done means applied/verified, failed, skipped, and kept-for-human-attention sites are separated.

### Example Constructed Mode: Incident Reconciliation

Use when the task is to reconcile conflicting incident reports, postmortems, audit narratives, or stakeholder accounts into a grounded account.

- Scout for source narratives, event claims, timestamps, actors, disputed facts, evidence strength, and publication constraints.
- Bake one unit per narrative, claim cluster, timeline segment, or disputed point.
- Structure as `extract claims -> build contradiction matrix -> verify load-bearing facts -> synthesize reconciled account`.
- Done means every public claim is supported, contradicted, or explicitly unresolved; narrative conflicts are named rather than smoothed over.

## Bake

Bake turns scout evidence into a context pack. An agent should never have to rediscover which files, sources, candidates, or risks matter. If it does, the packet is under-specified.

Required context pack fields:

- `WORK_UNITS`: concrete atomic units with id, primary evidence root, claim or inspect type, scope, required files or sources, ownership boundary, in-scope/out-of-scope notes, and edit permission.
- `SHARED`: objective, systemic risk, invariants, evidence standard, and terms of success.
- `NOT_A_BUG`: known accepted behavior, authorized deferrals, false-positive traps, and exclusions.
- `OUTPUT_CONTRACT`: required fields each agent returns, including evidence, inspected scope, findings or result, confidence, gaps, and what it did not inspect.
- `VERIFY_MATRIX`: the lane roster for the run — probe owners; which findings, claims, candidates, or units are independently checked, by whom, and with what lens; plus completeness and judge lanes when Topology Floor requires them.
- `LIMITS`: max rounds, caps, sampling, top-N cutoffs, stall conditions, parent relay boundary, and when used `batching` entries each with `size`, `grouping key`, `verification command`, and `rationale`.

Prohibited substitutes: "review this area", "research this topic", "find issues here", or any packet whose boundary is a theme without files, sources, hypotheses, or candidate positions.

Incomplete behavior: refine the scout or split/merge work units before launch. A cross-cutting invariant spanning units belongs to a named sub-agent owner or verifier with required evidence; without that owner, the blueprint is incomplete.

## Hard Gate: Unit Atomicity

Activation: after Bake candidate units exist and before Launch, for every `WORK_UNIT`.

Required evidence per unit:

- One primary evidence root (one interface or contract surface, one caller or dependency tree, one state machine, one site or homogeneous site batch, one candidate position, one source family, or another Mode-defined root).
- One primary claim or inspect type.
- A deep-inspect or transform scope one agent can finish without dropping a named sub-surface already visible in scout or inventory — except where homogeneous batching is explicitly allowed below.

Mandatory split — any hit means the blueprint is incomplete until the unit is split, or the unsplit remainder is an explicit `LIMITS` coverage gap/cap (not batching):

- Two or more sibling entry points each with their own interface or contract surface and independent caller or dependency tree.
- A container that already names multiple independently inventoryable sub-surfaces with different evidence roots.
- A primary workflow mixed with unrelated cross-cutting infrastructure in the same packet.
- Two or more incompatible evidence methods required inside one packet (for example static reference-graph absence vs dynamic or reflective invocation proof).
- Heterogeneous inventory items merged solely to reduce agent count.

Merge is allowed when either:

1. Same evidence root, same claim or inspect type, and splitting would not yield an independent material inspect; or
2. Homogeneous site batching for Migration/Sweep: same invariant, same transform or inspect action, and same verification command across every site in the batch. Record each batch under `LIMITS.batching` (fields defined in Bake) — never as a coverage gap.

"Same directory", "same epic", or "feels related" is not enough for either merge path.

Prohibited substitutes: treating non-overlapping directories as atomic units; using subsystem labels as `open-discovery` units when finer surfaces are listed or listable; labeling intentional homogeneous batches as gaps/caps.

Independence means non-overlapping deep-inspect scope under one evidence root — not merely disjoint ownership on a map.

## Structure

Structure chooses the topology that turns the context pack into trustworthy results.

Default to a pipeline: each unit flows through its stages independently, such as find then verify, so one unit can be verified while another is still being inspected. Use a barrier only when the next stage genuinely needs the full previous set: dedup across all findings, early-exit on zero, compare findings against each other, run a completeness critic, or synthesize a global result.

Every Structure must specify:

- Stages and owners.
- Which stages run in parallel and which are barriers.
- The verification rule for material findings, claims, or candidates.
- The completeness check.
- Topology-floor lane owners: probe units, skeptic or critique lanes, completeness lane, and judge or synthesis-only roles when required.
- The final synthesis contract.

Verification is adversarial by default. A material finding that no independent agent tried to refute is a hypothesis, not a result. For high-stakes claims, use several skeptics or distinct lenses and require the stated threshold to pass.

## Hard Gate: Topology Floor

Activation: before Launch, for every team that will emit material findings, load-bearing claims, candidate rulings, maps of unknown-size systems, or an inventory-style list.

Required accounting lives in blueprint `Structure` and packet `VERIFY_MATRIX`:

- `probe_units`: one probe or transform packet per atomic `WORK_UNIT` (or per Decision candidate proposal lane). Homogeneous Migration/Sweep batches count as one probe unit each.
- `skeptic_lanes`: at least one named independent owner when material findings or load-bearing claims are expected to enter the final answer.
  - Decision Mode satisfies this through the candidate × critique-lens gauntlet, not a shared parent skim.
  - Understand/Map satisfies this when the deliverable is only a map with named gaps and the completeness critic is a named owner; if the run also reports material defects or contested risk claims, those claims need an independent skeptic lane.
  - Research satisfies this through independent verification of load-bearing claims.
- `completeness_lane`: a named owner when coverage shape is `open-discovery`, when the work-list is sampled or capped, or when the Mode skeleton requires a completeness critic.

Agent count follows from atomic `WORK_UNITS` plus required skeptic, completeness, critique, and judge lanes — never from probe count alone, and never from a preferred headcount.

Prohibited substitutes: parent self-check standing in for a skeptic or completeness owner; empty `VERIFY_MATRIX` on material-claim work; probe-only fan-out that silently drops verification or completeness.

Incomplete behavior: add the missing named lanes, narrow the objective so material claims are out of scope, or mark the corresponding claims/scope as unverified or incomplete in the final synthesis.

## Launch

Launch only after the gates pass.

Before spawning, confirm:

- Unit Atomicity and Topology Floor gates pass.
- Agent count is explained as probe units plus skeptic/completeness/critique/judge lanes.
- Packets are disjoint, or mutators have explicit isolation and ownership.
- Every packet receives the relevant baked context.
- Cross-cutting concerns have an owner.
- Parent relay boundary assigns every substantive work unit, evidence hunt, edit, and verification lane to a sub-agent or names it out of scope.
- Caps, sampling, batching, and skipped work are named in `LIMITS`.
- Stop and stall rules are set.

Dispatch independent packets in the same turn so they run concurrently. After launch, the parent process owns relay and control: status updates, the coordination record, blocker relay, cap enforcement, conflict routing, and synthesis shell preparation from returned reports. Local tool work is limited to those coordination duties and final synthesis after evidence returns.

A new necessary work item after launch becomes one of: a bounded sub-agent packet, a focused question, or an explicit gap.

## Integrate

Synthesize one result from sub-agent evidence. The final answer is a synthesis rather than a pasted bundle, and every material claim traces to returned evidence or an explicit unverified gap.

The final synthesis must include, in the user's requested format:

- The conclusion, decision, or confirmed findings.
- The evidence that supports each material claim.
- Coverage: what units, candidates, sources, or slices were inspected.
- Verification: what was independently checked, refuted, confirmed, or left unverified.
- Gaps and limits: skipped scope, caps, batching, failed agents, uncertainty, and why the team stopped.

Resolve conflicts explicitly. Contradictory reports resolve through a narrowed question, one targeted verifier, a focused question, or an unresolved-gap label. Equivalent verifier loops and parent-local investigation are stall signals, not conflict resolution.

## Stall And Stop Rules

Set limits before loops start: max follow-up rounds, max verify/repair loops, and max stall count.

Stall signals:

- The same blocker appears twice without new evidence.
- Agents expand scope while convergence evidence stays flat.
- Verifiers repeat generic feedback.
- Reports contradict with no new evidence.
- The coordination record grows as a transcript rather than a control surface.

When stalled, narrow the task, ask one focused follow-up, dispatch a smaller packet, or stop with the gap named. Completion depends on covered and confirmed requested scope, with gaps named.

## Self-Review Before Final

Before delivering the result, check:

- Could any agent have skipped scout evidence and still sounded compliant?
- Could the Mode label be changed without changing required evidence, structure, or stop rule? If yes, Mode was not doing real work.
- Did scout evidence suggest a constructed Mode, but the team forced the task into a preset anyway?
- Did any packet force an agent to rediscover its own scope or systemic risk?
- Did any cross-cutting invariant lack an owner?
- Does the parent relay boundary account for every substantive work unit, evidence hunt, edit, cleanup, and verification lane after launch?
- Did any material claim reach the final answer without independent verification or an explicit "unverified" label?
- Were caps, sampling, batching, failed agents, or skipped scope silent?
- Is the final answer a synthesis rather than pasted reports?

If any answer fails, the artifact is incomplete until the blueprint, verification, or final synthesis is tightened.

Unit Atomicity, Coverage Shape cardinality, and Topology Floor are enforced at their gates above — do not re-litigate them here unless a gate was skipped.

## Red Flags

- Launching before Scout, Mode, Bake, and Structure are explicit enough to audit.
- Picking an agent count before deriving atomic work units or verification needs.
- Treating Mode as a label or closed enum with no effect on evidence, work units, skeleton, verification, and stop rule.
- Forcing a novel task into the closest preset when its work-unit type, verification target, or stop rule does not fit.
- Vague work units with overlapping edit rights or unclear ownership.
- Coarse units that fail Unit Atomicity: sibling evidence roots merged, mega containers with named sub-surfaces, or primary workflow mixed with unrelated cross-cuts.
- Open-discovery cardinality taken from subsystem or folder labels instead of inventory surfaces.
- Heterogeneous inventory merged only to cut agents, or homogeneous batches mislabeled as coverage gaps.
- Probe-only fan-out with no named skeptic or completeness owner when material claims or open coverage require them.
- A cross-cutting invariant split across agents with no owner.
- Parent-local tool work after launch produces new task evidence outside the relay boundary.
- A post-launch work item has no bounded packet, focused question, or explicit gap label.
- Findings accepted without an independent refutation pass.
- Decision work units are research angles rather than mutually exclusive candidates.
- Candidate critique collapses into one shared review rather than a candidate x lens gauntlet.
- A barrier where a pipeline would do.
- Discovery stopped after one round on an unknown-size problem.
- Silent top-N caps, sampling, batching, skipped retries, or failed agents.
- Reports pasted into the main context with no synthesized result.
