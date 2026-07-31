---
name: agent-team
description: "Run a team of sub-agents under an orchestration blueprint: scout the surface, split it into atomic work units, dispatch them with baked context packets, have independent skeptic lanes attack every material claim, and synthesize one result with coverage and gaps named. Use for parallel coverage across independent evidence roots, inventorying an unknown-size surface, exhaustive review or audit, broad research needing cross-checked claims, codebase mapping, migration or sweep work, or adversarial critique of a decision — and whenever the user asks to fan out, delegate, run a team, or cross-check work across independent agents. Do not use for work the main agent should simply do itself, or for overlapping mutators without disjoint ownership or isolation."
---

# Agent Team

Delegate to sub-agents as a team compiled into an orchestration blueprint, and integrate what returns as evidence rather than truth. Delegation is assumed authorized. The judgment this skill owns is whether the work is worth delegating at all, how tight each contract must be, and what shape the team takes.

Every run goes through Scout, Mode, Bake, Structure, Launch, and Integrate, and passes the three hard gates. Work that does not justify that structure stays local.

The value comes from disciplined shape, not agent count. A broad fan-out without a blueprint is a parallel dump; a small team with complete scout evidence, atomic work units, shared context, and independent verification can be stronger than a larger unstructured fan-out. A small team is never justified by coarse labels that hide multiple evidence roots; it is justified when the scouted surface is small, or when a larger surface is explicitly sampled or capped in `LIMITS` with the Topology Floor completeness lane named.

## The Delegation Contract

Governs every sub-agent in the run.

### When A Delegation Earns Its Cost

A sub-agent has real overhead: duplicated setup context, a coordination round-trip, and report synthesis. It pays off when:

- The subtask needs noisy exploration — many file reads, large logs, wide searches — but only a compact result matters to the main thread.
- A focused prompt or a narrower tool/permission boundary improves reliability.
- The main agent can keep moving on the critical path while the sub-agent works.

Keep the work local instead when the round-trip would cost more than it saves, when the next step is a blocking decision the main agent must make now, or when the subtask is too vague to be given a stop condition. A delegation with no stop condition is not a delegation, it is a leak.

### The Packet

Each sub-agent receives a concrete packet carrying only the context it needs. Padding it with the main thread's full history reintroduces the noise you delegated to escape.

```markdown
Objective:
[One concrete outcome.]

Context:
[Minimal background, relevant constraints and decisions — not the whole conversation.]

Scope:
- Owns: [files / modules / sources / questions]
- May inspect: [paths / sources]
- Must not edit: [paths, or "anything outside ownership"]

Tool and permission boundary:
[Read-only / allowed commands / allowed tools.]

Execution rules:
- If blocked, report the blocker instead of expanding scope.
- [Anything else this task needs beyond the boundaries above.]

Verification:
[Commands, checks, source requirements, or "read-only investigation".]

Return format:
[Only the fields the main thread will consume — findings | evidence with source pointers | files changed | verification run | unknowns | next step. Distilled, never a raw transcript. Evidence with source pointers is not optional: an unverifiable claim is not a result.]

Stop condition:
[What counts as done, plus any time or depth limit.]
```

For a verifier, include a **rubric**. An agent asked only to "check if this is good" produces the appearance of quality control without signal — give it the concrete criteria to check against.

The packet is assembled from the context pack rather than written from scratch: `Objective` and `Context` from `SHARED` and `NOT_A_BUG`, `Scope` and `Tool and permission boundary` from that agent's `WORK_UNIT`, `Return format` from `OUTPUT_CONTRACT`, limits and caps from `LIMITS`. Packet `Verification` is what the agent runs on its own work; it is never the independent check, which `VERIFY_MATRIX` owns.

### While Sub-Agents Run

Do not re-do delegated work locally while a sub-agent is still responsible for it; that throws away the context isolation you delegated for, and risks two conflicting versions. While it runs, work a different part of the task, prepare integration scaffolding that does not depend on the result, or wait if the result is the next blocker. Waiting beats duplicating.

### Receive Reports As Evidence

Treat every return as evidence, not truth. Before integrating, check: did the agent stay in scope, give concrete evidence and source pointers, run the requested verification, and surface assumptions or conflicts?

Parent checks do not satisfy `VERIFY_MATRIX`. The parent spot-checks only after a skeptic lane returns, and only to resolve conflicts, judge whether that lane was substantive, or catch an obvious packet failure — never as the first or only check on a material claim.

If a report is weak, ask one focused follow-up or dispatch a bounded replacement packet. Take the work local only when the agent failed outright and it blocks the critical path.

## Hard Gate: Blueprint Before Launch

Activation: before spawning any sub-agent except scout.

Required artifact: an internal or user-visible blueprint with these fields:

- `Objective`: the single outcome the team is serving.
- `Mode`: the named task shape, recorded with all five of its properties — work-unit type, evidence standard, skeleton, verification target, and stop rule (see Mode).
- `Coverage Shape`: `closed-surface | open-discovery` (see Scout).
- `Scout Evidence`: the concrete work-list or inventory, shared risks or invariants, not-a-bug list, constraints, and unknowns.
- `Context Pack`: the baked material every relevant packet receives.
- `Structure`: stages, pipeline/barrier choices, verification matrix (including topology-floor lane owners), completeness pass, and synthesis owner.
- `Launch Gate`: atomic work units, topology floor, disjoint ownership, edit isolation when needed, parent relay boundary, caps, batching, stall limits, and stop criteria.

Prohibited substitutes: an agent count; a list of vague angles; "have several agents look around"; subsystem labels treated as discovery units; independent packets that each rediscover scope; a run begun without a blueprint because the task felt small.

Incomplete behavior: scout locally or with a single scout agent until the blueprint is specific enough. If a critical scope fact remains unavailable and affects the topology, ask one focused question or return a plan-only blueprint with the missing fact named.

## Scout

Scout discovers the shape of the work before the team is formed. It is not duplicate evidence; it is the orchestrator's job to determine what the agents should not waste budget rediscovering.

Required scout evidence, each material item tagged `observed | user-stated | inferred | unknown`:

- Work-list candidates: files, modules, sources, candidate decisions, subsystems, sites, or hypotheses — refined to inventory surfaces before bake when coverage is open.
- Shared risk or invariant: the one or two facts most likely to drive real findings or failures.
- Not-a-bug list: authorized translations, accepted deferrals, known limitations, and things agents must not report.
- Boundaries: what is in scope, what is out of scope, and whether any agent may edit.
- Unknowns: facts that would change the Mode, topology, or stop rule.

`SHARED` and `NOT_A_BUG` may be empty or unknown; do not invent them to fill the blueprint. If an `unknown` would change `Mode`, `WORK_UNITS`, `VERIFY_MATRIX`, or the stop rule, scout further, ask one focused question, or carry it as an explicit residual gap. Launch requires named coverage status for topology-shaping unknowns.

### Coverage Shape And Cardinality

After the first scout pass, classify coverage shape:

- `closed-surface`: the inspect or edit list is already pinned — named files, symbols, sites, candidates, or a fixed change set. Cardinality follows that pinned list after unit atomicity checks.
- `open-discovery`: size is unknown — inventory hunts, unbounded audits, full-cone risk sweeps, or "find anything" over a surface whose members are not yet listed. Subsystem, folder, or epic labels are **not** work units. Run inventory until candidate surfaces, symbols, sites, or evidence roots are listed; derive cardinality from inventory length, or from a named sample recorded in `LIMITS`.

Mixed tasks: if any in-scope substream is `open-discovery`, record overall Coverage Shape as `open-discovery` and apply inventory plus completeness rules to every open substream. Closed substreams still bake from their pinned lists and keep pinned cardinality.

Derive cardinality from the inventory result — never from a preferred headcount, from a handful of logical areas, from coarse labels when finer evidence roots are listable, or from a single discovery round on an unknown-size surface. When scout finds no real work-list, keep the task local. If inventory is incomplete, keep scouting, sample with an explicit `LIMITS` cap and a completeness lane, or return a plan-only blueprint — do not launch over a fabricated unit count.

## Mode

Mode is a task-shape constructor, not a closed enum and not a label. Determine it after scout and before bake. It fixes what evidence is required, what work units mean, which skeleton to use, which outputs need verification, and what "done" means.

Read `references/modes.md` before naming the Mode. It holds the preset catalogue (Review/Audit, Research, Decision, Understand/Map, Migration/Sweep), the specific mismatches that require constructing a new Mode, and the constructed-Mode template. Copy the chosen Mode's five properties into the blueprint `Mode` field; Bake, Structure, and Integrate read them from there. A Mode named without those five properties recorded does not satisfy the Blueprint gate.

Mode is doing real work only when both hold:

- Changing the Mode name would change the required evidence, work units, skeleton, verification target, or stop rule. If it would not, Mode is a label and the blueprint is incomplete.
- No preset was adopted whose work-unit type, evidence standard, verification target, or stop rule the scouted task fails to match. A mismatch on any one of the four means construct a Mode instead of forcing the fit.

For compound tasks, compose a Mode only where composition changes the skeleton or verification bar. Otherwise name one primary Mode and bake the secondary concern into `SHARED` or `VERIFY_MATRIX` — unless folding it in would blur ownership or replace a per-object gauntlet with a shared review, in which case construct a Mode instead. A decision buried in `SHARED` is not a baked secondary concern; it is an unsplit `candidate-position` surface.

## Bake

Bake turns scout evidence into a context pack. An agent should never have to rediscover which files, sources, candidates, or risks matter, or what the systemic risk is. If it does, the packet is under-specified.

Required context pack fields:

- `WORK_UNITS`: atomic units, each with `id`; `evidence_root` — the concrete root plus its type, one of `interface-surface | caller-tree | state-machine | behavior-path | review-dimension | site-or-batch | candidate-position | source-family | mode-defined`; `inspect_type` — the one claim or inspect type; scope; required files or sources; ownership boundary; in-scope/out-of-scope notes; and `edit`: `none | owned-paths | isolated`.
- `SHARED`: objective, systemic risk, invariants, evidence standard, and terms of success.
- `NOT_A_BUG`: known accepted behavior, authorized deferrals, false-positive traps, and exclusions.
- `OUTPUT_CONTRACT`: required fields each agent returns, including evidence, inspected scope, findings or result, confidence, gaps, and what it did not inspect.
- `VERIFY_MATRIX`: the lane roster for the run, one row per lane — `lane_id`; `role`: `probe | skeptic | completeness | critique-lens | judge`; owner; target (which findings, claims, candidates, or units); and lens. Topology Floor is checked against this roster.
- `LIMITS`: `max_rounds`, `max_verify_loops`, `max_stalls`, caps, sampling, top-N cutoffs, parent relay boundary, and when used `batching` entries each with `size`, `grouping key`, `verification command`, and `rationale`.

Prohibited substitutes: "review this area", "research this topic", "find issues here", or any packet whose boundary is a theme without files, sources, hypotheses, or candidate positions.

Incomplete behavior: refine the scout or split/merge work units before launch. A cross-cutting invariant spanning units belongs to a named sub-agent owner or a `VERIFY_MATRIX` row with required evidence; without that owner, the blueprint is incomplete.

## Hard Gate: Unit Atomicity

Activation: after Bake candidate units exist and before Launch, for every `WORK_UNIT`.

Required evidence per unit: exactly one `evidence_root`, exactly one `inspect_type`, and a deep-inspect or transform scope one agent can finish without dropping a named sub-surface already visible in scout or inventory — except where homogeneous batching is allowed below.

Mandatory split — any hit means the blueprint is incomplete until the unit is split, or the unsplit remainder is an explicit `LIMITS` coverage gap/cap (not batching):

- Two or more sibling entry points each with their own interface or contract surface and independent caller or dependency tree.
- A container or coarse label that already names multiple independently inventoryable sub-surfaces with different evidence roots.
- A primary workflow mixed with unrelated cross-cutting infrastructure in the same packet.
- Two or more incompatible evidence methods required inside one packet (for example static reference-graph absence vs dynamic or reflective invocation proof).
- Heterogeneous inventory items merged solely to reduce agent count.
- Decision work split into analysis angles, facets, or criteria rather than mutually exclusive whole candidates — one `candidate-position` unit per candidate.

Merge is allowed only when either:

1. Same evidence root, same inspect type, and splitting would not yield an independent material inspect; or
2. Homogeneous site batching for Migration/Sweep: same invariant, same transform or inspect action, and same verification command across every site in the batch. Record each batch under `LIMITS.batching` — never as a coverage gap.

"Same directory", "same epic", or "feels related" is not enough for either merge path.

Prohibited substitutes: non-overlapping directories treated as atomic units; subsystem or other coarse labels used as `open-discovery` units when finer surfaces are listed or listable; intentional homogeneous batches labeled as gaps/caps.

Independence means non-overlapping deep-inspect scope under one evidence root — not merely disjoint ownership on a map.

## Structure

Structure chooses the topology that turns the context pack into trustworthy results.

Default to a pipeline: each unit flows through its stages independently, such as find then verify, so one unit can be verified while another is still being inspected. Use a barrier only when the next stage genuinely needs the full previous set: dedup across all findings, early-exit on zero, compare findings against each other, run a completeness critic, or synthesize a global result.

Every Structure must specify stages and owners; which stages run in parallel and which are barriers; the verification rule for material findings, claims, or candidates; the completeness check; the `VERIFY_MATRIX` lane owners, including any `judge` lane the Mode skeleton names; and the final synthesis contract.

Verification is adversarial by default. A material finding that no independent agent tried to refute is a hypothesis, not a result. For high-stakes claims, use several skeptics or distinct lenses and require the stated threshold to pass.

`skeptic` and `critique-lens` lanes are read-mostly by default. A lane that finds a defect returns `fail` plus a concrete fix list for a bounded fix-pass owner rather than fixing it itself; `VERIFY_MATRIX` may name a verifier as its own fixer, but that fix then needs its own verification row. A fix no lane checked is an unverified change, not a resolved finding.

## Hard Gate: Topology Floor

Activation: before Launch, for every run that will emit material findings, load-bearing claims, candidate rulings, maps of unknown-size systems, or an inventory-style list.

The `VERIFY_MATRIX` roster, mirrored in blueprint `Structure`, must meet all three floors:

- `probe`: one probe or transform lane per atomic `WORK_UNIT`, or per Decision candidate proposal. Homogeneous Migration/Sweep batches count as one probe lane each.
- `skeptic` or `critique-lens`: at least one named independent owner when material findings or load-bearing claims are expected to enter the final answer.
  - Review/Audit satisfies this only when every material finding that will enter the final answer is itself the target of an independent refutation pass. A single pass over a bundled finding list without attacking each finding fails this floor. High-stakes claims use enough distinct lenses that a wrong yes cannot survive on one weak angle.
  - Decision Mode satisfies this only through the candidate × critique-lens gauntlet: every serious candidate is attacked under each named lens, and each lens has its own owner. One reviewer carrying several lenses, one shared review spanning candidates, and a parent skim all fail this floor.
  - Understand/Map satisfies it when the deliverable is only a map with named gaps and the completeness critic is a named owner; if the run also reports material defects or contested risk claims, those claims need an independent skeptic lane.
  - Research satisfies it through independent verification of each load-bearing claim.
- `completeness`: a named owner when coverage shape is `open-discovery`, when the work-list is sampled or capped, or when the Mode skeleton requires a completeness critic. Completeness judges returned evidence against the inventory or declared unit list, not a planned roster alone.

Agent count follows from atomic `WORK_UNITS` plus required skeptic, completeness, critique, and judge lanes — never from probe count alone, and never from a preferred headcount.

Prohibited substitutes: a roster whose rows are all `role: probe` on material-claim or open-discovery work; an empty `VERIFY_MATRIX`; the parent's own self-check standing in for a `skeptic` or `completeness` owner; one shared verify packet that does not target each material finding or claim.

Incomplete behavior: add the missing named lanes, narrow the objective so material claims are out of scope, or mark the corresponding claims and scope as unverified or incomplete in the final synthesis.

## Launch

Launch only after Blueprint Before Launch, Unit Atomicity, and Topology Floor pass.

Before spawning, confirm:

- Agent count is stated as probe lanes plus skeptic, completeness, critique, and judge lanes.
- Packets are disjoint, or every mutator's `edit` value is `owned-paths` or `isolated` with the boundary named.
- Every packet receives the relevant baked context.
- Cross-cutting concerns have an owner.
- Parent relay boundary assigns every substantive work unit, evidence hunt, edit, and verification lane to a sub-agent or names it out of scope.
- Caps, sampling, batching, and skipped work are named in `LIMITS`.
- Stop and stall rules are set.

Dispatch independent packets in the same turn so they run concurrently. After launch the parent owns relay and control only: status updates, the coordination record, blocker relay, cap enforcement, conflict routing, synthesis shell preparation from returned reports, and the final synthesis once evidence has returned. Parent-local tool work that produces new task evidence falls outside the relay boundary.

A new necessary work item after launch becomes one of: a bounded sub-agent packet, a focused question, or an explicit gap.

## Stall And Stop

Stall signals: the same blocker appears twice without new evidence; agents expand scope while convergence evidence stays flat; verifiers repeat generic feedback; reports contradict with no new evidence; the coordination record grows as a transcript rather than a control surface.

When stalled, narrow the task, ask one focused follow-up, dispatch a smaller packet, or stop with the gap named — inside the rounds and stall counts already set in `LIMITS`.

## Integrate

Synthesize one result from sub-agent evidence. The final answer is a synthesis rather than a pasted bundle, and every material claim traces to returned evidence or an explicit unverified gap.

The final synthesis must include, in the user's requested format:

- Whether the run is complete or incomplete. Incomplete is valid; a polished clean result over unexamined scope is not.
- The conclusion, decision, or confirmed findings.
- The evidence that supports each material claim.
- Coverage: what units, candidates, sources, or slices were inspected.
- Verification: what was independently checked, refuted, confirmed, or left unverified. A material claim no independent lane checked enters the final answer only under an explicit `unverified` label — tracing to a probe's returned evidence is not verification.
- Gaps and limits: skipped scope, caps, sampling, batching, failed agents, uncertainty, and why the team stopped.

Positive absence claims (no issues, safe to proceed, fully covered) require a closed inspect list. Unexamined surface stays in gaps — never folded into a clean conclusion. A write-up that implies full coverage without units and gaps is incomplete.

Resolve conflicts explicitly. Contradictory reports resolve through a narrowed question, one targeted verifier, a focused question, or an unresolved-gap label. Equivalent verifier loops and parent-local investigation are stall signals, not conflict resolution.

Before delivering, reconcile the run against the blueprint: every substantive work unit, evidence hunt, edit, cleanup, and verification lane that actually happened after launch was inside the relay boundary, and every lane the blueprint promised either ran or is named as a gap. Completion depends on the requested scope being covered and confirmed with gaps named; a failure here means the result is incomplete until the blueprint, verification, or synthesis is tightened.
