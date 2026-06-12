---
name: workbench
description: >-
  Set up, resume, or repair a compact active execution workbench for long-horizon,
  multi-session or checkpointed work. Use when a task needs durable handoff,
  unattended iteration, human gates, auditable evidence, or active-vs-archive
  routing that keeps a current packet separate from stale historical context.
  Do not use for one-session tasks, ordinary plans/reviews/audits, one-session
  bug fixes, direct code edits, or simple docs cleanup; complete those directly.
---

# Workbench

## Outcome

The active execution packet is the single handoff. A fresh agent with no prior context can orient from the active files alone, execute exactly one open gate, emit auditable evidence, and either continue or stop cleanly at a human gate. Historical evidence remains traceable, but it does not compete with the current entrypoint. Decisions are not re-litigated, unverified claims do not pass as verified, and the loop does not do silent work.

## Activation

Activate only when at least one condition is true:

- the task is expected to span multiple sessions or checkpoints;
- a future agent must resume from files without chat history;
- unattended iteration needs gates, evidence, and stop rules;
- an existing workbench, plan, or evidence set has stale historical context in the default route and needs an active packet plus archive map.

Complete the work directly when it is completable and verifiable now: one-session coding tasks, audits, reviews, simple plans, single-doc cleanup, ordinary handoff notes, or direct edits. If direct work becomes multi-session, open the full loop then; there is no lighter starter mode.

## Modes

Autonomous loop is the default: run complete iterations continuously, stopping only at human gates and stop conditions. Manual mode is entered only when the user asks for it (for example, "manual", "手动", "one step at a time", or an invocation argument) and changes pacing only:

- propose the selected gate and wait for a go-ahead before executing;
- run exactly one iteration per go-ahead, then yield after the record step.

Everything else - active packet, artifacts, honesty labels, evidence rules, gate protocol, and no self-certification - is identical in both modes. Record the active mode in the cursor; switching is per-request and reversible.

## Lifecycle Intake

Before creating, resuming, or repairing a workbench, classify the packet state:

- **New active packet** - no current packet exists; create one from the approved intent.
- **Continue existing** - the active packet has a clear cursor, current authority, open gate, and verification route; use it as-is.
- **Consolidate** - the active packet is current but too many same-objective evidence docs obscure the cursor; consolidate within the active packet.
- **Archive plus new active packet** - stale drivers, old phases, failed loops, or preserved wording sit in the default route; move them under `archives/` and create a small current packet.
- **Close or archive only** - the work is done, abandoned, or historical; close the active loop and keep lookup routes.

A takeover packet created from existing files or a current user request starts as `Needs approval`. The first execution iteration does not start until the decision authority records `D00` with an ISO date, timezone when relevant, and a verbatim user approval quote for the new active loop. Self-authored boundaries, gate classes, stop conditions, or archive routes are drafts until that row exists.

Consolidation is for same-objective evidence where the original wording does not need to remain inspectable. Archive routing is for stale instructions, failed drivers, superseded packets, human approvals, or historical wording that must remain intact.

## Active Packet Contract

Choose one active packet root. Follow the repo's existing convention if one exists; if none exists, use `docs/workbench/<YYYYMMDD>-<task>/`.

The packet is valid by roles, not filenames. Every role has one clear home. A file may host multiple small roles only under explicit headings; a large role may split only when the entry file names every part.

Required roles:

- **Entry/cursor** - current checkpoint, next single action, minimum active read set, gate protocol, active mode, stop conditions, and evidence-ID reservation.
- **Intent authority** - user-approved plan, stable contract, or confirmed transcript pointer.
- **Boundary and gate contract** - scope fences, exit criteria, machine gates, human gates, and ownership.
- **Execution ledger** - current status, open gates, closed gates, evidence pointers, and append-only iteration history.
- **Verification contract** - required checks, thresholds, environment blockers, freshness expectations, and whether prior or archive evidence can satisfy each gate.
- **Decision authority** - either the owning decision table or a pointer index to that table; never copied decision rows.
- **Evidence stream** - append-only, numbered, machine-sortable evidence records.
- **Archive map** - historical lookup route, or explicit `Archive route: none`.
- **Artifacts store** - oversized outputs cited by path.

Fallback file map when no repo convention exists:

```
docs/workbench/<YYYYMMDD>-<task>/
  00-current-loop.md      -> Entry/cursor
  01-intent.md            -> Intent authority
  02-boundaries.md        -> Boundary and gate contract
  03-ledger.md            -> Execution ledger
  04-verification.md      -> Verification contract
  05-decisions.md         -> Decision authority or pointer index
  06-archive-map.md       -> Archive map
  10+ or evidence/        -> Evidence stream
  artifacts/              -> Artifacts store
```

Archive packet follows the repo's workbench convention. Default:

```
docs/workbench/archives/<old-task-or-packet>/
```

The active packet owns current routing. Archive paths keep historical traceability and are not part of the default fresh-agent read set.

## Authorship And Approval

The human owns intent. The plan or intent file is authored by the user, transcribed from their words and confirmed, or points to an already-stable contract. The agent derives the active loop from that intent: read set, exit criteria, gate classes, boundary declaration, stop conditions, and archive routing.

That derived loop is a human gate. Iteration starts only after `D00` records the user's dated verbatim approval. Thereafter the cursor and ledger are agent-writable every iteration; authority sections - intent, boundaries, gate classes, exit criteria, stop conditions, verification thresholds, and archive routing - change only through a human gate.

When repairing or replacing an existing packet, summarize only currently authorized facts in the new active packet. Stale claims enter as cited historical evidence, decision IDs, or `Needs approval` inferences. Promote them to current authority only through a decision row or current evidence that the verification contract accepts.

## Archive Routing

The archive map is a lookup table, not a summary. It points from current needs to exact historical targets without restating old decisions, checklists, evidence excerpts, or obsolete instructions.

Each archive-map row records:

- current need or gate;
- exact target: file path plus section, decision ID, evidence doc ID, command name, or line range;
- historical fact the target can answer;
- current authority that may import or reject the fact;
- when to read it;
- when to stop reading;
- whether the target may close a current gate, and under what freshness rule.

An archive read requires an exact target. A directory, archived driver name, phase packet, or broad search need is insufficient. If the archive map says `Archive route: none`, archive files are out of scope until a human gate changes the map.

Search active files and current repo sources first. When using `rg`, exclude the archive path, defaulting to `docs/workbench/archives/**`, until the archive map authorizes an exact target.

Archived evidence can explain history. It closes a current gate only when the verification contract explicitly accepts it as fresh enough, or current evidence revalidates it. Archive-derived claims become current status only after the ledger cites a current evidence record or the decision authority imports them.

Preserve archive wording when exact historical text matters. Put archive status in the archive map or a parent index; prepend banners to archived files only when the user has approved changing the preserved text.

## The Loop - One Iteration

1. **Orient.** Read the entry/cursor and its exact minimum active read set. Read archived material only through an archive-map row with an exact target. Do not act from memory; active packet roles own current routing.
2. **Select.** Pick the single lowest-risk open gate within the current checkpoint. Never jump checkpoints. Classify the owner: agent-executable, human, or external resource. For non-agent gates, assemble evidence and hand off.
3. **Reserve.** Reserve the next evidence ID in the cursor or ledger before execution. A fresh agent must see which record is in progress after interruption.
4. **Execute.** Work within the scope fences and gate owner.
5. **Record.** Write the evidence record at the reserved ID: status header, observed sources with reproducible pointers, iteration delta, what closed in this iteration, and newly discovered remaining work. The evidence record does not own current status; it points to the ledger. Then update the ledger and cursor. The cursor advances only after the ledger line cites the exact evidence record or a named exception.
6. **Evaluate.** All exit criteria for the current checkpoint met -> consolidate if needed, write the checkpoint exit report, and stop for human sign-off. A stop condition or human-gate item hit -> stop with a decision request. Otherwise, self-review and continue.

Autonomous mode may run multiple iterations only after each previous iteration has completed record, ledger, cursor, and self-review steps.

No silent work: every iteration produces exactly one numbered evidence record plus a ledger update, including iterations that only discover a blocker. Two exceptions exist: re-confirming an already-documented blocker with no new observation records a dated one-line ledger entry pointing at the existing blocker record; a consolidation iteration produces the consolidated docs it folds into instead of the single evidence record.

## Gate Protocol

Declare every exit item as one of two gate classes:

- **Machine gates** - deterministic, reproducible checks such as tests, exit codes, match counts, byte-identical outputs, or schema validation. The agent self-certifies these only with evidence.
- **Human gates** - checkpoint exits, scope or boundary changes, any item marked `Needs approval`, and any capability the agent lacks. The agent assembles evidence, lists closed and open items with owners, and stops.

Approval exists in exactly one form: a decision row with ISO date, timezone when relevant, and a verbatim user quote. "They probably approved this" does not satisfy the gate.

A stop report contains: blocking gate, closed evidence pointers, open items with honesty labels and owners, and the exact decision or action requested. Stop reports and checkpoint exit reports may re-list the open items they put before the human; they are the exception to the no-re-listing rule.

Each verification-gated item states the required source or command, expected evidence, whether prior or archive evidence is acceptable, freshness requirement, and `Blocked` / `Not run` fallback label.

## Honesty Labels And Evidence

Every claim in every doc carries one label:

`Observed` (the check ran; source and result recorded) | `Inferred` (engineering reasoning) | `Recommended` (target state) | `Needs approval` | `Blocked` | `Not run`

Evidence is an observed source plus a reproducible pointer: command output with exit code, file path plus line range, screenshot or artifact path, tool output, or external result with timestamp. A bare assertion is not evidence.

Inline output is the decisive excerpt - at most about 20 lines plus the exit code. Longer output is written once to `artifacts/` and cited by path.

`Not run` and `Blocked` items may never be presented, summarized, or counted as verified. Once a golden value such as a hash, frozen output, or approved figure is recorded, reuse it by reference; never re-derive it as new progress.

## Document Authority

- **Intent authority** owns the task's approved goal and approach. Mid-loop approach changes are decision rows, not plan edits; the plan is rewritten only at a human-approved replan gate and final reconciliation.
- **Decision authority** owns decisions. Sequential IDs are never renumbered or reused. At any time exactly one row per question is active. Superseding stamps the old row `superseded by Dnn` in the same edit; status stamps are the only edit existing rows accept. Failed approaches are settled decisions. Reopening a settled row requires new `Observed` evidence contradicting its recorded basis, cited in the superseding row, and a human gate when the row carries human approval.
- **Decision pointers** are allowed. A new active packet may point to an existing owning table, or move the whole table while preserving IDs, dates, statuses, and supersession. It does not copy selected rows into a second authority.
- **Execution ledger** owns current status. It has exactly one current-state block plus append-only history lines. Evidence docs record iteration deltas; they do not own current open/closed status.
- **Evidence records** are append-only records of what happened. Corrections are new records opening with `Supersedes: NNN-name.md`; the superseded record receives only one permitted retro-edit: `SUPERSEDED by NNN - do not cite as current authority`. Deletion at consolidation is the sole exception to append-only.
- **Archive map** owns historical lookup routing. It does not summarize archived authority.
- **Workbench docs** are not public interface contracts. When the deliverable's permanent home materializes, such as a package README or code docs, migrate the stable contract there and keep pointers.

One home per fact: gate status lives only in the ledger, the cursor only in the active loop, decisions only in the decision authority, intent only in the intent authority, verification thresholds only in the verification contract, and archive routing only in the archive map. Every other doc cites IDs or paths instead of restating content.

## Write Regimes

Every doc lives in exactly one regime:

- **Append-only** - evidence records and ledger history lines. Growth is allowed here because orientation never loads the full set.
- **Rewrite-in-place** - entry/cursor, ledger state block, decision-row status stamps, and intent at its gates. A correction rewrites the affected current lines; amendment markers such as `UPDATE:`, `CORRECTION:`, `Revised:`, or dated addenda do not appear in these docs.

When a finding is promoted from evidence into intent, decision, verification, or ledger authority, the fact's home moves with it. Later docs cite the authority row, not the original passage.

## Consolidation And Archive Split

Per-iteration evidence is the audit trail during active work. Consolidation triggers are mechanical: at every checkpoint exit, and whenever more than 8 evidence records have accumulated since the last consolidation. The next iteration is then a consolidation iteration before any new gate is selected.

To consolidate, fold iteration records into thematic evidence docs plus a checkpoint exit report, re-derive from original records, remove the originals from the active read path, rewrite active pointers, and record the old-to-new mapping in the ledger. Append-only history lines and stamped decision rows keep their original pointers, resolved through that mapping.

Deleting originals during consolidation requires reliable durable history, such as git. If durable history is unavailable or uncertain, move originals to archive or preserve a manifest before removing them from the active path.

A summary may exist only where the records it covers are gone from the active path. Keep summary-plus-originals only when originals are archived and routed by the archive map.

Use archive split, not consolidation, when the problem is stale historical authority in the default route: stale drivers, multiple competing phases, preserved wording, failed loops, or a current objective that can be stated in a much smaller packet with archive lookups.

## Closing

At final exit: consolidate or archive as needed, write the final-state doc, reconcile the originating intent, move stable contracts to their permanent project home, set the active loop status to closed, and stop touching the directory. Memory receives retrieval cues and reusable lessons only; it does not duplicate workbench authority or project contracts.

## Self-Review

Required confirmations - any `no` means the iteration is not done:

- Did the iteration produce its numbered evidence record and ledger update, or a named exception?
- Does the active loop name the exact next action, active mode, minimum read set, and stop conditions?
- Does the ledger cite exact evidence for every current closed gate?
- Is every active decision represented by exactly one authority row or one pointer to the owning table?
- If the loop is new or repaired, does `D00` contain dated verbatim human approval before execution?
- If archive material was used, did the archive map name the exact target and current authority that imported it?
- If archive evidence closed a current gate, did the verification contract allow that freshness rule or did current evidence revalidate it?
- If more than 8 evidence records are unconsolidated, does the cursor name consolidation as the next action?

Defect checks - any `yes` means the iteration is not done:

- Could a reader mistake an `Inferred`, `Not run`, or archived claim for `Observed` current evidence?
- Did a human gate get treated as passed without a dated verbatim quote?
- Did a search or read bypass the archive map and treat `archives/` as default context?
- Did any doc restate a fact whose home is elsewhere instead of citing its ID or path?
- Do two active decision rows answer the same question?
- Does a rewrite-in-place doc contain amendment markers or stale alternatives?
- Does an evidence record claim current status instead of recording only iteration delta and ledger pointers?
- Does any doc paste more than about 20 consecutive output lines instead of citing an artifact?
- Did intent, boundaries, gate classes, verification thresholds, or archive routing change outside a human gate?
