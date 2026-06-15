---
name: subagent-delegation
description: >-
  Decide whether and how to use sub-agents, treating user authorization as granted by default unless the user explicitly prohibits delegation, then coordinate delegated work while preserving the main agent's context. Use when the user asks for orchestration, parallel agents, delegation, background workers, context isolation, or when another skill needs delegated research, review, implementation, or verification. Owns host-policy checks, delegation packets, non-overlap, report verification, and stop rules. Do not use to bypass tool policy, ignore explicit user prohibitions, or add coordination overhead to simple single-threaded tasks.
---

# Subagent Delegation

Coordinate sub-agents to protect the main agent's context and attention while completing the user's requested work, rather than to maximize the number of sub-agents. Delegate bounded work that can run independently, then integrate the returned evidence.

This skill is tool-neutral. "Sub-agent" may mean a worker, explorer, background agent, forked agent, delegated session, agent thread, or any equivalent capability provided by the current coding or agent tool.

This skill owns reusable sub-agent policy. Other skills may state that independent evidence, review, or verification would be useful, but they should defer the default user authorization gate, host/tool checks, delegation packet shape, non-overlap rules, report handling, and stop conditions to this skill.

Multi-agent work has real overhead: duplicated setup context, coordination messages, report synthesis, and more failure modes. Use sub-agents when they buy one of three things:

- Context protection: the subtask needs noisy exploration but only a compact result matters.
- Parallel coverage: independent subtasks can cover more ground than one context window.
- Specialization: a focused prompt or restricted tool set improves reliability.

If none of those apply, prefer a single agent.

## Authorization And Host Policy

Follow the current host and tool policy before applying any orchestration rule in this skill.

- Before any `spawn`, `message`, `resume`, or `wait` operation, classify delegation status as `explicitly requested`, `user-default-authorized`, `explicitly prohibited`, `host/tool blocked`, or `not worth overhead`.
- User authorization is granted by default. If the user has not explicitly prohibited sub-agents, delegation, parallel agents, background workers, or equivalent agent work, treat sub-agent use as user-authorized and decide by host/tool policy, task fit, cost, and side-effect boundaries.
- Do not require an explicit user request before using sub-agents. Lack of explicit delegation language is not evidence that delegation is unauthorized.
- If the user explicitly prohibits sub-agents or equivalent delegation, do not spawn, message, resume, or wait on sub-agents until the user changes that instruction.
- If host or tool policy blocks sub-agent calls, treat benefit signals as planning inputs only and keep the work local.
- Do not create external infrastructure, durable state, issue trackers, queues, files, commits, branches, or other side effects for coordination unless the user authorized that surface or the artifact already exists inside the requested work.
- If delegation would change a side-effect or authorization boundary beyond sub-agent use itself, ask one narrow question or keep that boundary local.
- If delegation is explicitly prohibited, host/tool blocked, or not worth the overhead, record the skip reason in the final output only when that reason affects user trust, coverage, or verification.

### Default User Authorization Gate

Activation condition: apply this gate before each proposed `spawn`, `message`, `resume`, or `wait` operation.

Required evidence or fields:

- Current user instructions contain no explicit prohibition against sub-agents, delegation, parallel agents, background workers, or equivalent agent work; or the user explicitly requested one of those modes.
- Current host and tool policy permits the requested sub-agent operation.
- The proposed delegation satisfies the use/not-use rules below.
- The delegation does not create external infrastructure, durable coordination state, commits, branches, deployments, or other side effects outside the requested work.

Prohibited substitutes:

- Treating silence as lack of user authorization.
- Treating "the user did not ask for sub-agents" as a reason to classify delegation as unauthorized.
- Hiding a cost or scope decision behind `not authorized`.
- Using default authorization to bypass host/tool policy or an explicit user prohibition.

Incomplete or pause behavior:

- If explicit user prohibition is present, keep the work local.
- If host/tool policy blocks the operation, keep the work local or use a permitted non-sub-agent workflow.
- If the sub-agent operation would create a separate side effect boundary, ask one narrow question before crossing that boundary.
- If only task fit or coordination cost is weak, classify the decision as `not worth overhead`, not `not authorized`.

## Core Principle

The main agent is the orchestrator and integrator.

It owns:

- The user's goal and constraints.
- Task decomposition and sequencing.
- The critical path.
- Cross-agent conflict detection.
- Final decisions, edits, synthesis, and verification.

Sub-agents own:

- Focused investigation or execution slices.
- Local evidence gathering.
- Bounded implementation within explicit ownership.
- Reports that compress their work into actionable findings.

Do not delegate a task and then redo it locally while the sub-agent is still responsible for it; that defeats context isolation and parallelism.

The main agent may verify returned work, but verification starts after the relevant report exists or at an explicit checkpoint. Until then, the main agent works only on non-overlapping tasks or waits.

## When To Use

Use this skill to decide whether to delegate, and to coordinate delegation when the user has not explicitly prohibited it and the current host/tool policy permits it. Delegation is worth considering when at least one of these is true:

- The user explicitly asks for sub-agents, parallel agents, orchestration, delegation, background workers, or context isolation.
- Another active skill requires an authorization-aware decision about independent research, review, implementation, or verification.
- The task naturally decomposes into independent research, analysis, review, or implementation slices.
- A subtask may produce large logs, search results, file reads, or exploratory context that should not pollute the main conversation.
- Multiple files, modules, systems, sources, or hypotheses can be investigated in parallel.
- The task benefits from a separate verifier, reviewer, test runner, or source checker.
- A subtask needs a narrower tool set or stricter permission boundary than the main agent.

Strong signals:

- Exploration would require reading roughly ten or more files.
- The task has three or more independent work items.
- A subtask will produce more raw context than the main agent should carry.
- Fresh, unbiased review matters.

## When Not To Use

Do not use sub-agents when:

- The user explicitly prohibited sub-agents, delegation, parallel agents, background workers, or equivalent agent work.
- Host or tool policy blocks the sub-agent operation.
- The task is small enough that delegation adds more coordination cost than value.
- The next step is a blocking critical-path decision that the main agent must make now.
- The subtask is vague, open-ended, or lacks a clear stop condition.
- Sub-agents would need to edit overlapping files or shared state without explicit ownership.
- The work requires continuous shared context between agents rather than final reports.

If the work needs shared evolving knowledge, use an existing shared artifact with explicit write rules, or ask before creating one.

## Pattern Selection

Choose the lightest coordination pattern that fits.

Treat these as coordination patterns, not permission to create infrastructure. Use existing host features first. Create queues, task boards, state files, or persistent agents only when they are authorized and clearly inside the requested work.

| Situation | Use |
|---|---|
| Short, focused subtasks with clear outputs | Orchestrator-subagent |
| Independent long-running slices that benefit from retained local context | Authorized agent team or persistent worker |
| Event-driven pipeline with many possible routes | Existing message bus or queue |
| Collaborative research where agents must build on each other's findings | Authorized shared state with write rules |
| Quality-critical output with explicit criteria | Generator-verifier |

If the same worker needs repeated follow-ups, consider resuming that worker or switching to an agent-team pattern instead of repeatedly spawning fresh agents with duplicated context.

If using shared state, define termination conditions before starting: time budget, max rounds, no-new-findings threshold, or a designated finisher. Without a stop rule, shared-state agents tend to duplicate work or loop.

## Workflow

### 1. Use A Minimal Coordination Record Only When Needed

The current agent is already the orchestrator. Do not create a ledger by default just because this skill is active.

Most tasks only need a brief mental model, a short visible orchestration note, or the tool's existing task list. A separate coordination record is useful only when it prevents confusion that would otherwise cost more context than the record itself.

Use a written coordination record when:

- Three or more sub-agents are running.
- Work spans multiple rounds or may need resumption.
- Several reports may conflict and need explicit reconciliation.
- Agents coordinate through an authorized or existing shared artifact instead of only final reports.
- The user asked for a visible orchestration plan.

Do not use a written coordination record when:

- One or two sub-agents are handling short bounded tasks.
- The main agent can remember the assignments without risk.
- The record would duplicate the delegation packets or returned reports.
- The user's goal is specifically to minimize main-context growth.
- The record would create a new file, task board, or durable state without authorization.

If a record is needed, keep it compact. Prefer an in-thread note or existing task-list feature unless the user authorized a durable artifact:

```markdown
Goal:
[Requested outcome.]

Constraints:
[User constraints, boundaries, non-goals.]

Critical path:
[What the main agent owns next.]

Delegations:
- [Agent/task]: scope, ownership, status, dependency, stop condition

Evidence returned:
- [Only decisions, pointers, and key findings; no raw dumps.]

Conflicts or unknowns:
- [Items needing integration or follow-up.]

Next decision:
[The next main-agent decision after reports return.]
```

Update the record only at delegation and report-return checkpoints. Do not use it as an excuse to copy sub-agent transcripts into the main context.

### 2. Define The Critical Path

Before spawning, resuming, or assigning any sub-agent, identify:

- What must be decided or done by the main agent next.
- Which work can proceed independently.
- Which work would block the next main-agent action.
- What evidence is needed before integration.

Keep the immediate blocker local. Delegate sidecar work only when the main agent can make progress without needing the result immediately.

### 3. Partition Work By Context, Not By Vibes

Split work according to the context each agent needs.

Good partitions:

- Separate modules or directories.
- Separate data sources or websites.
- Separate hypotheses.
- Separate review lenses, such as security, tests, API contract, performance, or documentation.
- Separate implementation areas with disjoint file ownership.

Bad partitions:

- Multiple agents solving the same whole task.
- Agents with overlapping edit rights.
- Agents asked to "research everything" or "find issues" with no boundary.
- Agents whose findings must constantly inform each other before either can proceed.

Cross-cutting concerns are not partitions. When one behavior or invariant has its definition and its enforcement in files that land in different partitions — a guard or permission check, feature flag, validation or error contract, auth boundary — splitting by module slices that thread across agents and leaves no owner for the whole of it. Give such a concern a single owner that follows it across partition boundaries, or keep an orchestrator coverage checklist reconciled against what each agent reports it did not inspect.

### 4. Write A Delegation Packet

Each sub-agent gets a concrete task packet. Include only the context it needs.

```markdown
Objective:
[One concrete outcome.]

Context:
[Minimal background, user constraints, relevant decisions.]

Scope:
- Owns: [files/modules/sources/questions]
- May inspect: [paths/sources]
- Must not edit: [paths/sources or "anything outside ownership"]

Tool and permission boundary:
[Read-only / allowed commands / allowed tools / approval requirements.]

Execution rules:
- You are not alone in this workspace.
- Do not revert or overwrite work by others.
- Keep changes minimal and consistent with existing patterns.
- If blocked, report the blocker instead of expanding scope.
- Return distilled findings, not raw transcripts or large file dumps.

Verification:
[Commands, checks, source requirements, or "read-only investigation".]

Return format:
- Summary
- Decision-relevant findings
- Evidence observed
- Source pointers or file paths
- Files changed, if any
- Commands or sources checked
- Risks, conflicts, or unknowns
- Recommended next step

Stop condition:
[What counts as done, plus any time/depth limit.]
```

For code edits, assign disjoint ownership. If disjoint ownership is impossible, use read-only agents first and keep edits local to the main agent.

When several packets are independent, dispatch them in the same turn so the sub-agents run concurrently; spawning them one at a time serializes work the partition already made parallel.

For verifier agents, include a rubric. A verifier asked only to "check if this is good" creates the appearance of quality control without useful signal.

### 5. Enforce The Non-Overlap Rule

After delegating, the main agent must not start doing the same subtask locally while the sub-agent is still running.

Allowed while waiting:

- Work on a different part of the task.
- Prepare integration scaffolding that does not depend on the delegated result.
- Read small files needed for the critical path.
- Draft a verification plan.
- Handle unrelated blockers.
- Wait if the delegated result is the next blocker.

Not allowed while waiting:

- Re-run the delegated investigation from scratch.
- Read the same large file set or source set assigned to the sub-agent.
- Implement the same file/module assigned to a worker.
- Preemptively fact-check every delegated claim before the report exists.
- Spawn another agent with the same task because the first result has not arrived yet.

Verification is still required, but it happens after the sub-agent returns or at an explicit checkpoint. The orchestrator should verify the returned report, not consume context recreating the entire delegated process in parallel.

If there is no non-overlapping useful work, wait. Waiting is better than polluting the main context with duplicated exploration.

### 6. Receive Reports As Evidence

Treat sub-agent output as evidence, not truth.

Check:

- Did the sub-agent stay within scope?
- Did it provide concrete evidence, file paths, commands, or sources?
- Did it run the requested verification?
- Are there conflicts with other reports or known constraints?
- Did it make assumptions that affect the final decision?
- Did it introduce scope creep or boundary changes?

Use proportional verification:

- Spot-check high-impact claims.
- Re-run only the relevant failing command or smallest reproducible check.
- Compare independent reports for contradictions.
- Verify changed code through targeted tests, lint, typecheck, build, or smoke checks.

If a report is weak, ask for a focused follow-up. Do not silently redo the whole task unless the sub-agent failed and the work is necessary for completion.

### 7. Track Stalls And Replan

Set limits before loops start:

- Maximum follow-up rounds for a sub-agent.
- Maximum verifier/generator repair loops.
- Maximum stall count before replanning or escalating.
- Fallback if the report remains insufficient.

Stall signals:

- The same blocker appears twice.
- A worker expands scope instead of converging.
- A verifier repeats generic feedback.
- Reports contradict each other and no new evidence is being added.

When stalled, update the ledger, narrow the task, ask one focused follow-up, or take the work local if it is now on the critical path. Do not keep spawning equivalent agents.

### 8. Integrate And Stop

Integrate only what satisfies the user's requested work.

Before final response:

- Resolve conflicts between reports.
- Apply or refine worker changes if needed.
- Run the smallest meaningful final verification.
- State what changed, what was checked, and what remains unverified.
- Do not finish with `not authorized` as the delegation reason unless an explicit user prohibition or host/tool block was actually observed; use `not worth overhead` for cost and fit decisions.
- Stop when the requested work is complete. Do not keep spawning agents just because capacity remains.

## Self-Review Check

Before reporting a delegation decision, check:

- Did I treat user silence as default authorization rather than as missing permission?
- If I did not delegate, is the reason explicit user prohibition, host/tool block, weak task fit, coordination cost, overlap risk, or a side-effect boundary?
- If I wrote `not authorized`, can I point to the explicit user prohibition or host/tool block? If not, relabel it as `not worth overhead` or ask the narrow boundary question.
- Did I avoid using default authorization to cross unrelated side-effect boundaries such as durable files, branches, commits, deployments, issue trackers, queues, or external infrastructure?

## Common Patterns

### Parallel Exploration

Use for codebase orientation, research, or diagnosis.

- Agent A investigates module or source A.
- Agent B investigates module or source B.
- Main agent continues on the critical path.
- Main agent synthesizes reports and decides the implementation or answer.

Require each explorer to return:

- The smallest useful summary.
- Evidence pointers.
- Unknowns.
- What it deliberately did not inspect.

### Worker Slices

Use for implementation only when ownership is clean.

- Worker A owns one module or file set.
- Worker B owns a different module or file set.
- Main agent avoids editing those owned areas while workers run.
- Main agent reviews diffs, resolves integration, and verifies.

Prefer read-only exploration before parallel edits when ownership is uncertain.

### Reviewer Or Verifier

Use when quality risk is high.

- Main or worker produces a result.
- Verifier checks against explicit criteria.
- Main agent uses verifier feedback to revise or accept.

The verifier must have a concrete rubric.

Limit verifier loops. If the generator cannot address the same feedback after the agreed limit, escalate, return the best result with caveats, or ask the user for a decision.

### Shared Artifact Handoff

Use when multiple agents need a durable handoff without dumping context into the main conversation.

- Use an existing artifact when available. Create a markdown task log, JSON state file, issue list, or task board only when the user authorized that durable surface.
- Define who can write which section.
- Prefer append-only notes for findings and explicit status fields for tasks.
- Require agents to write summaries and evidence pointers, not transcripts.
- Add a stop condition before agents start reading and reacting to each other's updates.

## Red Flags

Watch for these failure modes:

- The main agent delegates, then immediately repeats the same exploration locally.
- Sub-agents receive broad tasks with no stop condition.
- Multiple workers edit the same file or shared contract.
- A behavior or invariant is split across partitions and no agent owns the whole thread, so a dropped guard or contract falls through the seam.
- The orchestrator waits idly even though unrelated critical-path work is available.
- The orchestrator trusts a report with no evidence.
- The orchestrator asks for exhaustive verification when spot-checking the report would be enough.
- Reports are copied wholesale into the main context instead of summarized into decisions.
- The ledger grows into a second transcript.
- Verification loops have no maximum iteration count.
- Shared state has no owner, write rules, or stop condition.

## Minimal Orchestration Note

When this skill triggers, keep the visible orchestration note short unless the user asks for a full plan:

```markdown
Orchestration:
- Delegation status: [explicitly requested / user-default-authorized / explicitly prohibited / host/tool blocked / not worth overhead, with brief reason]
- Main thread: [critical-path work kept local]
- Delegated: [sub-agent tasks, with disjoint file ownership noted when any agents edit concurrently]
- Non-overlap: [what the main agent will not duplicate while agents run]
- Ledger: [where status/evidence will be tracked, if any]
- Integration: [how reports will be checked and merged]
```
