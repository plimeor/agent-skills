---
name: agent-handoff
description: "Hand one bounded unit of work to a single sub-agent with a clean contract — the task packet (objective, scope and ownership, tool boundary, return format, stop condition) — and treat the returned report as evidence to verify rather than truth. Use whenever delegating a single indivisible task to one sub-agent: an independent challenger before finalizing, a focused investigation, a bounded implementation slice, a verifier with a rubric. Delegation is assumed authorized — the only question is whether the handoff is worth its overhead and whether the contract is tight enough to trust the result. Near miss: use agent-team when decomposing a problem into multiple parallel sub-agents that must not conflict; this skill owns the per-delegation contract that agent-team reuses for each of its members. Do not use to add a coordination round-trip to work the main agent should simply do itself."
---

# Agent Handoff

Hand a single bounded unit of work to one sub-agent and integrate the result back, to protect the main agent's context and attention — not to look busy. A clean handoff buys two things: **context protection** (the sub-agent absorbs noisy exploration and returns a compact result) and **specialization** (a focused prompt or a restricted tool set is more reliable than the main agent doing it inline).

Delegation is assumed authorized: spawn when the work fits. The only judgment this skill owns is whether a handoff is worth its overhead, and how to make the contract tight enough that what comes back is trustworthy.

This skill owns the **per-delegation contract**. `agent-team` reuses it for each agent it fans out, so the packet, return format, and report-as-evidence rules below apply equally to one handoff or to one member of a team.

## When A Handoff Earns Its Cost

A handoff has real overhead: duplicated setup context, a coordination round-trip, and report synthesis. It pays off when:

- The subtask needs noisy exploration — many file reads, large logs, wide searches — but only a compact result matters to the main thread.
- A focused prompt or a narrower tool/permission boundary improves reliability.
- The main agent can keep moving on the critical path while the sub-agent works.

Keep the work local instead when the round-trip would cost more than it saves, when the next step is a blocking decision the main agent must make now, or when the subtask is too vague to be given a stop condition. A handoff with no stop condition is not a delegation, it is a leak.

## The Packet

Each handoff is a concrete packet carrying only the context the agent needs. Padding it with the main thread's full history reintroduces the noise you delegated to escape.

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
- Keep changes minimal and consistent with existing patterns.
- If blocked, report the blocker instead of expanding scope.
- Return distilled findings, not a raw transcript or large file dumps.

Verification:
[Commands, checks, source requirements, or "read-only investigation".]

Return format:
- Summary
- Decision-relevant findings
- Evidence observed (with source pointers / file paths)
- Files changed, if any
- Commands or sources checked
- Risks, conflicts, or unknowns
- Recommended next step

Stop condition:
[What counts as done, plus any time or depth limit.]
```

For a verifier, include a **rubric**. An agent asked only to "check if this is good" produces the appearance of quality control without signal — give it the concrete criteria to check against.

## While The Sub-Agent Runs

Do not re-do the delegated work locally while the sub-agent is still responsible for it; that throws away the context isolation you delegated for, and risks two conflicting versions. While it runs, work a different part of the task, prepare integration scaffolding that does not depend on the result, or wait if the result is the next blocker. Waiting beats duplicating.

## Receive The Report As Evidence

Treat the return as evidence, not truth. Before integrating, check: did the agent stay in scope, give concrete evidence and source pointers, run the requested verification, and surface assumptions or conflicts?

Verify proportionally — spot-check the high-impact claims, re-run the smallest relevant check, and lean harder on anything that changes a decision. If the report is weak, ask one focused follow-up rather than silently redoing the whole task; only take it local if the agent failed and the work is on the critical path.

## Red Flags

- Delegating, then immediately repeating the same exploration locally.
- A packet with no stop condition, or a verifier with no rubric.
- Pasting the sub-agent's transcript into the main context instead of its distilled findings.
- Trusting a claim that arrives with no evidence pointer.
