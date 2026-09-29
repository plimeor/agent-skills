---
name: agent-team
description: "Use when work splits into two or more independent parallel sub-agent tracks — exhaustive review or audit, inventorying an unknown-size surface, broad research needing cross-checked claims, codebase mapping, migration or sweep work, adversarial critique of a decision — or when the user asks to fan out, run a team, or cross-check work across independent agents. Near miss: a single bounded sub-agent task, work the main agent can finish in a handful of tool calls, and overlapping mutators without disjoint ownership or isolation."
---

# Agent Team

Delegate team-shaped work to sub-agents and integrate what returns as evidence rather than truth. Delegation is assumed authorized. The judgment this skill owns is how the team is split, which returned claims need independent verification before they enter the answer, and when the observed evidence calls for more lanes.

The outcome is one synthesized result in which every material claim carries its verification status and every inspected or skipped part of the scope is named. Every run goes through Scout, Mode, Bake, Structure, Launch, and Integrate, and passes the three hard gates.

The value comes from disciplined shape, not agent count. A broad fan-out without a blueprint is a parallel dump; a small team with complete scout evidence, named evidence roots, shared context, and targeted independent verification can be stronger than a larger unstructured fan-out.

## The Delegation Contract

Governs every sub-agent in the run.

### When A Delegation Earns Its Cost

A sub-agent has real overhead: duplicated setup context, a coordination round-trip, and report synthesis. It pays off when:

- The subtask is a genuinely independent, sizeable track: noisy exploration — many file reads, large logs, wide searches — where only a compact result matters to the main thread.
- A focused prompt, an independent perspective, or a narrower tool/permission boundary improves reliability.
- The main agent can keep moving on the critical path while the sub-agent works.

Keep the work local when it fits in a handful of tool calls, when the next step is a blocking decision the main agent must make now, or when the subtask is too vague to be given a stop condition. A delegation with no stop condition is not a delegation, it is a leak. When one sub-agent can cover a set of named roots, use one rather than several.

### The Packet

Each sub-agent receives a concrete packet carrying only the context it needs. Padding it with the main thread's full history reintroduces the noise you delegated to escape.

```markdown
Objective:
[One concrete outcome.]

Context:
[Minimal background, relevant constraints and decisions — not the whole conversation.]

Scope:
- Owns: [named evidence roots — files / modules / sources / candidates / sites]
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
[Only the fields the main thread will consume, accounted per named root — findings or result | evidence with source pointers | what was inspected | files changed | verification run | unknowns. Distilled, never a raw transcript. Evidence with source pointers is not optional: an unverifiable claim is not a result.]

Stop condition:
[What counts as done, plus any time or depth limit.]
```

For a verifier, include a **rubric**. An agent asked only to "check if this is good" produces the appearance of quality control without signal — give it the concrete claims to attack and the criteria to check against.

The packet is assembled from the context pack: `Objective` and `Context` from `SHARED` and `NOT_A_BUG`, `Scope` and `Tool and permission boundary` from that agent's `WORK_UNIT`, `Return format` from `OUTPUT_CONTRACT`, limits from `LIMITS`. Packet `Verification` is what the agent runs on its own work; it is never the independent check, which `VERIFY_MATRIX` owns.

### While Sub-Agents Run

Do not re-do delegated work locally while a sub-agent is still responsible for it; that throws away the context isolation you delegated for, and risks two conflicting versions. While it runs, work a different part of the task, prepare integration scaffolding that does not depend on the result, or wait if the result is the next blocker. Waiting beats duplicating.

### Receive Reports As Evidence

Every claim a sub-agent returns enters as `reported`. Before routing it, check: did the agent stay in scope, account for each named root, give concrete evidence and source pointers, run the requested verification, and surface assumptions or conflicts?

A claim's status moves to `verified`, `refuted`, or `unresolved` only through an independent lane — an agent other than the one that produced it. A claim that no lane checked stays `unverified`.

If a report is weak, ask one focused follow-up or dispatch a bounded replacement packet. Take the work local only when the agent failed outright and it blocks the critical path.

## Hard Gate: Blueprint Before Launch

Activation: before spawning any sub-agent except scout.

Required artifact: an internal or user-visible blueprint with these fields:

- `Objective`: the single outcome the team is serving.
- `Mode`: the named task shape, recorded with all five of its properties — work-unit type, evidence standard, skeleton, verification target, and stop rule (see Mode).
- `Coverage Shape`: `closed-surface | open-discovery` (see Scout).
- `Scout Evidence`: the concrete work-list or inventory, shared risks or invariants, not-a-bug list, constraints, and unknowns.
- `Context Pack`: the baked material every relevant packet receives.
- `Structure`: stages, pipeline/barrier choices, `VERIFY_MATRIX` floor lanes with owners, the escalation triggers the run watches, and the synthesis owner.
- `Launch Gate`: work units with named roots, disjoint ownership, edit isolation when needed, parent relay boundary, caps, batching, escalation cap, stall limits, and stop criteria.

Prohibited substitutes: an agent count; a list of vague angles; "have several agents look around"; subsystem labels treated as discovery units; independent packets that each rediscover scope; a run begun without a blueprint because the task felt small.

Incomplete behavior: scout locally or with a single scout agent until the blueprint is specific enough. If a critical scope fact remains unavailable and affects the topology, ask one focused question or return a plan-only blueprint with the missing fact named.

## Scout

Scout discovers the shape of the work before the team is formed. It is not duplicate evidence; it is the orchestrator's job to determine what the agents should not waste effort rediscovering.

Required scout evidence, each material item tagged `observed | user-stated | inferred | unknown`:

- Work-list candidates: files, modules, sources, candidate decisions, subsystems, sites, or hypotheses — refined to named evidence roots before bake when coverage is open.
- Shared risk or invariant: the one or two facts most likely to drive real findings or failures.
- Not-a-bug list: authorized translations, accepted deferrals, known limitations, and things agents must not report.
- Boundaries: what is in scope, what is out of scope, and whether any agent may edit.
- Unknowns: facts that would change the Mode, topology, or stop rule.

`SHARED` and `NOT_A_BUG` may be empty or unknown; do not invent them to fill the blueprint. If an `unknown` would change `Mode`, `WORK_UNITS`, `VERIFY_MATRIX`, or the stop rule, scout further, ask one focused question, or carry it as an explicit residual gap.

### Coverage Shape And Cardinality

After the first scout pass, classify coverage shape:

- `closed-surface`: the inspect or edit list is already pinned — named files, symbols, sites, candidates, or a fixed change set.
- `open-discovery`: size is unknown — inventory hunts, unbounded audits, full-cone risk sweeps, or "find anything" over a surface whose members are not yet listed. Subsystem, folder, or epic labels are inventory seeds, not evidence roots. Run inventory until candidate surfaces, symbols, sites, or evidence roots are listed, or record a named sample in `LIMITS`.

Mixed tasks: if any in-scope substream is `open-discovery`, record overall Coverage Shape as `open-discovery` and apply inventory plus completeness routing to every open substream. Closed substreams bake from their pinned lists.

When scout finds no real work-list, keep the task local. If inventory is incomplete, keep scouting, sample with an explicit `LIMITS` cap and completeness routing, or return a plan-only blueprint — do not launch over a fabricated root list.

## Mode

Mode is a task-shape constructor, not a closed enum and not a label. Determine it after scout and before bake. It fixes what evidence is required, what work units mean, which skeleton to use, which returned claims must be verified and which conditions escalate, and what "done" means.

Read `references/modes.md` before naming the Mode. It holds the preset catalogue (Review/Audit, Research, Decision, Understand/Map, Migration/Sweep), the specific mismatches that require constructing a new Mode, and the constructed-Mode template. Copy the chosen Mode's five properties into the blueprint `Mode` field; Bake, Structure, and Integrate read them from there. A Mode named without those five properties recorded does not satisfy the Blueprint gate.

Mode is doing real work only when both hold:

- Changing the Mode name would change the required evidence, work units, skeleton, verification target, or stop rule. If it would not, Mode is a label and the blueprint is incomplete.
- No preset was adopted whose work-unit type, evidence standard, verification target, or stop rule the scouted task fails to match. A mismatch on any one of the four means construct a Mode instead of forcing the fit.

For compound tasks, compose a Mode only where composition changes the skeleton or verification target. Otherwise name one primary Mode and bake the secondary concern into `SHARED` or `VERIFY_MATRIX` — unless folding it in would blur ownership or replace a per-candidate critique with a shared review, in which case construct a Mode instead. A decision buried in `SHARED` is not a baked secondary concern; it is an unsplit `candidate-position` surface.

## Bake

Bake turns scout evidence into a context pack. An agent should never have to rediscover which files, sources, candidates, or risks matter, or what the systemic risk is. If it does, the packet is under-specified.

Required context pack fields:

- `WORK_UNITS`: one entry per packet, each with `id`; `evidence_roots` — one or more named roots, each with its type, one of `interface-surface | caller-tree | state-machine | behavior-path | review-dimension | site-or-batch | candidate-position | source-family | mode-defined`; `inspect_type` — the one claim or inspect type; scope; required files or sources; ownership boundary; in-scope/out-of-scope notes; and `edit`: `none | owned-paths | isolated`.
- `SHARED`: objective, systemic risk, invariants, evidence standard, and terms of success.
- `NOT_A_BUG`: known accepted behavior, authorized deferrals, false-positive traps, and exclusions.
- `OUTPUT_CONTRACT`: required fields each agent returns per named root, including evidence, what was inspected, findings or result, confidence, gaps, and what it did not inspect.
- `VERIFY_MATRIX`: two parts. Floor rows — `lane_id`; `role`: `probe | skeptic | completeness | critique-lens | judge`; owner; target; lens — for the probes and for the Mode's must-verify claims. Trigger rows — the observable condition, the lane role it adds, and its target — for the Mode's escalation conditions. Topology Floor is checked against this matrix.
- `LIMITS`: `max_rounds`, `escalation_cap` (a claim escalates at most once; a conflict that survives its escalation is labeled `unresolved`), `max_stalls`, caps, sampling, top-N cutoffs, parent relay boundary, and when used `batching` entries each with `size`, `grouping key`, `verification command`, and `rationale`.

Prohibited substitutes: "review this area", "research this topic", "find issues here", or any packet whose boundary is a theme without named roots, sources, hypotheses, or candidate positions.

Incomplete behavior: refine the scout or regroup units before launch. A cross-cutting invariant spanning units belongs to a named sub-agent owner or a `VERIFY_MATRIX` row with required evidence; without that owner, the blueprint is incomplete.

## Hard Gate: Unit Atomicity

Activation: after Bake candidate units exist and before Launch, for every `WORK_UNIT`; again when a unit's report returns.

Required evidence per unit: exactly one `inspect_type`; every evidence root named from scout or inventory; an `OUTPUT_CONTRACT` that accounts for each named root separately.

Mandatory split — any hit means the blueprint is incomplete until the unit is split:

- Two or more incompatible evidence methods required inside one packet (for example static reference-graph absence vs dynamic or reflective invocation proof).
- A primary workflow mixed with unrelated cross-cutting infrastructure in the same packet.
- Decision work split into analysis angles, facets, or criteria rather than mutually exclusive whole candidates — one `candidate-position` unit per candidate.
- Mutators whose ownership overlaps without `isolated` edits.

A packet carries one or more roots named from inventory, and its report accounts for each. Homogeneous Migration/Sweep sites share one packet only as a batch with the same invariant, the same transform or inspect action, and the same verification command, recorded under `LIMITS.batching`.

Return-time split: a root whose report is empty, evidence-free, or a bare "nothing found" without what was inspected is re-dispatched as its own unit (one escalation, counted against `escalation_cap`) or named a coverage gap.

Prohibited substitutes: a coarse label (subsystem, folder, epic) standing in for roots when finer roots are listed or listable; roots left for the agent to discover inside a label; a per-root "nothing found" with no inspected evidence; intentional homogeneous batches labeled as gaps or caps.

Independence has two parts: probes do not share deep-inspect scope over the same root, and a verifier is never the agent that produced the claim it checks.

## Structure

Structure chooses the topology that turns the context pack into trustworthy results.

Default to a pipeline: each unit flows through its stages independently, so one unit's claims are routed and verified while another is still being inspected. Use a barrier only when the next stage genuinely needs the full previous set: dedup across all findings, early-exit on zero, compare findings or candidates against each other, check completeness, or synthesize a global result.

Returned claims are routed by the role they play in the final answer:

- **Must-verify**: the claims the Mode's verification target names, plus every claim the final answer cites as a reason for its conclusion, decision, or ruling. Each needs an independent lane before it enters as confirmed.
- **Labeled**: every other claim enters the answer carrying its status.
- **Escalated**: when a Mode trigger's condition is observed, the lane it names is added. Across all Modes, reports that conflict on a claim trigger a targeted verifier, and a claim touching a stakes marker — an irreversible action, a public or shared contract, security, or persisted data — triggers an additional independent lens.

The parent settles a conflict decidable by one direct mechanical observation — a file exists, a symbol is defined, a command prints a value — by citing that observation verbatim; every other conflict goes to a targeted verifier.

`skeptic` and `critique-lens` lanes are read-mostly by default. A lane that finds a defect returns `fail` plus a concrete fix list for a bounded fix-pass owner rather than fixing it itself; `VERIFY_MATRIX` may name a verifier as its own fixer, but that fix then needs its own verification row. A fix no lane checked is an unverified change, not a resolved finding.

## Hard Gate: Topology Floor

Activation: before Launch, and again before Integrate, for every run whose answer will contain findings, load-bearing claims, candidate rulings, maps of unknown-size systems, or an inventory-style list.

Before Launch, `VERIFY_MATRIX` must hold:

- `probe`: one probe or transform lane per `WORK_UNIT`, or per Decision candidate that needs a proposal.
- Floor lanes: a named independent owner for each class of claim the Mode's verification target requires checking.
- Trigger rows: every escalation condition the Mode names, each with the lane role it adds.

Before Integrate:

- Every must-verify claim has been through an independent lane.
- Every trigger whose condition was observed has run its lane, or is named a gap.
- Every watched trigger has its observed value recorded — for example, how many Decision candidates survived the first critique round.

Agent count follows from units plus floor lanes plus fired triggers — never from probe count alone, and never from a preferred headcount.

Prohibited substitutes:

- A roster whose rows are all `role: probe` on work with must-verify claims.
- The parent's own reading or lookup standing in for a floor or trigger lane.
- One shared verify packet that does not target each must-verify claim.
- A must-verify claim delivered under an `unverified` label in a result presented as complete.
- A claim the answer cites as a reason, routed as label-only.
- A trigger declared unfired without its observed value.
- On Decision work: one shared review spanning candidates; and, once the per-lens trigger fires, one reviewer carrying several lenses.

Incomplete behavior: add the missing lanes, narrow the objective so the claims are out of scope, or mark the result incomplete with the unverified must-verify claims named.

## Launch

Launch only after Blueprint Before Launch, Unit Atomicity, and Topology Floor pass.

Before spawning, confirm:

- Agent count is stated per Topology Floor.
- Packets are disjoint, or every mutator's `edit` value is `owned-paths` or `isolated` with the boundary named.
- Every packet receives the relevant baked context.
- Cross-cutting concerns have an owner.
- The parent relay boundary assigns every substantive work unit, evidence hunt, edit, and verification lane to a sub-agent or names it out of scope.
- Caps, sampling, batching, and skipped work are named in `LIMITS`.
- Stop, stall, and escalation limits are set.

Dispatch independent packets in the same turn so they run concurrently. After launch the parent owns relay and control: status updates, the coordination record, claim routing and conflict settlement as Structure defines them, blocker relay, cap enforcement, and the final synthesis.

A new necessary work item after launch becomes one of: a bounded sub-agent packet, a focused question, or an explicit gap.

## Stall And Stop

Stall signals: the same blocker appears twice without new evidence; agents expand scope while convergence evidence stays flat; verifiers repeat generic feedback; reports contradict with no new evidence; the coordination record grows as a transcript rather than a control surface.

When stalled, narrow the task, ask one focused follow-up, dispatch a smaller packet, or stop with the gap named — inside the rounds, escalation cap, and stall counts already set in `LIMITS`.

## Integrate

Synthesize one result from sub-agent evidence. The final answer is a synthesis rather than a pasted bundle, and every material claim traces to returned evidence or an explicit gap.

The final synthesis must include, in the user's requested format:

- Whether the run is complete or incomplete. Incomplete is valid; a polished clean result over unexamined scope is not.
- The conclusion, decision, or confirmed findings.
- The load-bearing set: each claim the conclusion cites as a reason, with its evidence and status.
- Coverage: which named roots, candidates, sources, or sites were inspected.
- Verification: each material claim's status (see Receive Reports As Evidence), plus the watched triggers with their observed values and which fired. Tracing to a probe's returned evidence is not verification.
- Gaps and limits: skipped scope, caps, sampling, batching, failed agents, uncertainty, and why the team stopped.

Positive absence claims (no issues, safe to proceed, fully covered) require a closed inspect list. Unexamined surface stays in gaps — never folded into a clean conclusion. A write-up that implies full coverage without roots and gaps is incomplete.

Resolve every conflict explicitly — through Structure's routing, a narrowed or focused question, or an `unresolved` label. Equivalent verifier loops are stall signals, not conflict resolution.

Before delivering, reconcile the run against the blueprint: every substantive work unit, evidence hunt, edit, and verification lane after launch stayed inside the relay boundary, and Topology Floor's before-Integrate checks hold. A failure here means the result is incomplete until the blueprint, verification, or synthesis is tightened.
