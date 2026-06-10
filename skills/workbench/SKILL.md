---
name: workbench
description: >-
  Set up and run a self-contained autonomous-loop workbench for long-horizon, multi-session tasks: a numbered document directory with a loop driver, plan, decision table, ledger, and one evidence doc per iteration, so a fresh agent with zero context can orient, advance one gate, and stop cleanly at human approval gates. Use when a task spans multiple sessions or checkpoints, when setting up unattended iteration, or when resuming a long-running project. Do not use for tasks finishable in one session — do those directly.
---

# Workbench

## Outcome

The workbench directory is the single hand-off. A fresh agent with no prior context must be able to orient from its files alone, execute exactly one open gate, emit auditable evidence, and either continue or stop cleanly at a human gate. Decisions are never re-litigated, unverified claims never pass as verified, and the loop never does silent work.

## Activation

- Task finishable in one session → no workbench; this skill does not apply.
- Task spans sessions → full loop workbench from the first file. There is no lighter starter mode that upgrades later; the loop IS the default shape.

## Modes

Autonomous loop is the default: iterate continuously, stopping only at human gates and stop conditions. Manual mode is entered only when the user asks for it (e.g. "manual", "手动", "one step at a time", or as an invocation argument) and changes pacing and authority ONLY:

- propose the selected gate and wait for a go-ahead before executing;
- run exactly one iteration per go-ahead, then yield after the record step.

Everything else — directory, artifacts, honesty labels, evidence rules, gate protocol, no self-certification — is identical in both modes. Record the active mode in the cursor; switching is per-request and reversible.

## Directory

`docs/workbench/<YYYYMMDD>-<task>/` (follow the repo's existing convention if one exists), flat, numbered:

```
00-loop.md       driver: loop algorithm, gate protocol, scope fences, cursor
01-plan.md       the goal and approach — the workbench's reason to exist
02-decisions.md  decision table with stable IDs
03-ledger.md     per-iteration ledger + open-gate checklist
04+              one numbered evidence doc per iteration, NN-kebab-name.md
```

Self-containment rule: if the plan already lives elsewhere (e.g. a repo `docs/plans/` convention), move it in as `01-plan.md` when the workbench is created. A fresh agent must need nothing outside the directory and the repo itself.

`00-loop.md` carries, written BEFORE the loop starts: the required read order; the cursor (current checkpoint, next single action, settled items that must not be reopened); exit criteria per checkpoint split into agent-closeable vs human gate; a boundary declaration stating once what the workbench does NOT authorize; and a named list of stop conditions. Other docs reference these instead of restating them.

## The loop — one iteration

1. **Orient.** Read `00-loop.md`, the ledger, and the highest-numbered evidence doc. Do not act from memory; the docs are authoritative over any recalled state.
2. **Select.** Pick the single lowest-risk open gate within the current checkpoint. Never jump checkpoints. Classify the owner: agent-executable, or requires human / external resources (then the action is "assemble and hand off", not "attempt it").
3. **Execute** within the scope fences.
4. **Record.** Write the evidence doc at the next free number: status header (task / date / status), evidence as command + output, what closed, what remains. Then update the ledger and cursor, and backfill any model or decision adjustment into EXISTING decision IDs — adjustments never become new documents.
5. **Evaluate.** All exit criteria of the current checkpoint met → write the checkpoint exit report and STOP for human sign-off. A stop condition or human-gate item hit → STOP with a decision request. Otherwise loop.

No silent work: every iteration produces exactly one numbered evidence doc plus a ledger update — including iterations that only discover a blocker.

## Gate protocol

Two gate classes, declared per item in the exit criteria:

- **Machine gates** — deterministic, reproducible checks (tests pass, exit codes, match counts, byte-identical outputs). The agent self-certifies these and proceeds.
- **Human gates** — checkpoint exits, scope/boundary changes, anything the plan marks "needs approval", and any capability the agent lacks. The agent assembles the evidence, lists what is closed and what remains open with owners, and STOPS. It never self-certifies a human gate and never fabricates the missing result.

Approval exists in exactly one form: a dated verbatim quote of the user in the decision table. "They probably approved this" does not satisfy the gate.

A stop report contains: which gate is blocking, what evidence is closed (with pointers), what remains open (with honesty labels and owners), and the exact decision or action requested.

## Honesty labels

Every claim in every doc carries one label, uniformly:

`Observed` (the check ran; command + output recorded) | `Inferred` (engineering reasoning) | `Recommended` (target state) | `Needs approval` | `Blocked` | `Not run`

- Evidence = a command plus its output. An assertion without a reproducible command is not evidence.
- `Not run` / `Blocked` items may never be presented, summarized, or counted as verified — this rule is itself a gate.
- Once a golden value (hash, frozen output, approved figure) is recorded, reuse it by reference; never re-derive it as new progress.

## Document roles

Roles are typed and never mixed:

- **Plan** — intent; becomes history once execution starts. At close, reconcile it with the frozen outcomes, including reversed decisions.
- **Decision table** — authority. Sequential IDs, never renumbered or reused. A row's meaning is never silently changed: supersede with a new row or annotate with a date.
- **Evidence docs** — append-only records of what happened; never retro-edited, even when later proven incomplete. Corrections are new docs.
- **Ledger** — the only cursor. Re-emitted every iteration: per-axis verdicts and the open-gate checklist, each item marked closed/open with an evidence pointer.
- Workbench docs are never public interface contracts. When the deliverable's permanent home materializes (a package README, code docs), migrate the stable contract there and keep pointers; declare this destination in `00-loop.md` up front.

## Sprawl and consolidation — a pair

Per-iteration evidence docs are the loop's audit trail: let them accumulate during a burst of iterations. At a checkpoint exit, or when orientation cost grows noticeably, consolidate: fold iteration reports into thematic evidence docs plus a checkpoint exit report, delete the originals, rewrite every pointer, record the consolidation in the ledger. Prohibiting sprawl kills the audit trail; skipping consolidation buries the cursor. The pattern requires both halves.

## Closing

At the final exit: consolidate, write the final-state doc, reconcile the originating plan, distill cross-task conclusions to the memory layer (the workbench is per-task and disposable; never duplicate the same fact across workbench, memory, and project conventions), set the `00-loop.md` status to closed, and stop touching the directory.

## Self-review

Before yielding any iteration, check: did this iteration produce its numbered doc and ledger update? Could a reader mistake an `Inferred`/`Not run` claim for `Observed`? Is there a decision made this iteration without a table row? Does the cursor name the exact next action and the settled items not to reopen? Was any human gate treated as passed without a dated quote? Any yes means the iteration is not done.
