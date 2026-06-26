---
name: agentic-document-workflow
description: >-
  Capture, route, and maintain the structured documents produced while collaborating with an AI — requirements, plans, tasking, decisions, and the execution cursor — so collaboration knowledge compounds across sessions instead of evaporating in chat history. Use when creating, placing, linking, promoting, superseding, archiving, indexing, or materially editing one of these docs, including checking nearby older docs for keep/reduce/archive/supersede/delete-candidate handling. Near miss: use code-plan to draft a plan's engineering content, and code-tasking to turn a plan into ordered tasks; this skill owns the document system those artifacts live in, not their content quality.
---

# Agentic Document Workflow

## Outcome

The collaboration document set is a context substrate: a fresh agent or a future you can orient from the files alone, every doc has exactly one home and one owner, stable outcomes outlive the task that produced them, overturned docs of any type remain inspectable as history, and each session makes the set richer rather than noisier. Chat history is not the record; the dated, front-mattered, linked, indexed, archived docs are.

This skill owns the SYSTEM — doc types, ownership boundaries, front matter, naming, routing, index, version control, lifecycle, promotion, supersession, archive, content selection, and bounded maintenance observation. It does not own the engineering quality of a plan (code-plan) or the task graph (code-tasking). Those producers emit a doc; this skill places, links, ages, supersedes, and retires it.

## Activation

Activate when the user is doing any of: creating or materially editing a requirement, plan, tasking, or decision doc for AI collaboration; deciding which doc type a piece of work belongs to, or where it lives; linking a doc to its source(s) and dependents, or updating those links; promoting a stable outcome from a plan/tasking into the decision record; superseding a prior doc of any type with a new one; archiving completed work and keeping a lookup route to it; setting up, repairing, or linting the document system for a project.

Complete the work directly and skip this skill when it is one-shot, one-session, and needs no durable record: a quick clarification, a direct code edit, a throwaway note. If a direct task later needs to compound, open the workflow then.

## Doc Types And Ownership

Each type owns a specific altitude and forbids the others' content. One home per authority-bearing claim; the rest cite it and may carry only short contextual summaries that do not become authority.

- **Requirement** — goals, scope, non-goals, UX expectations, acceptance criteria, product constraints. A dated incremental record, not a single living requirements file. Owns: what and why. Forbids: implementation plans, task breakdowns, execution status, long-term decisions.
- **Plan** — recommended implementation approach, ownership boundaries, prerequisites, phase breakdown, risks, verification strategy, stop condition. Derived from one or more requirements. Owns: how, in what order, with what risk. Forbids: detailed agent task status, command transcripts, durable decisions.
- **Tasking** — concrete tasks, dependency relationships, parallel groups, handoff boundaries, expected verification, execution status. Derived from an accepted plan. Owns: the execution graph. Forbids: product truth, stable architecture.
- **Decision** — a stable conclusion that outlives the task that produced it: chosen direction, rejected alternatives with reasons, the reasoning, the non-goals. Owns: durable authority. Forbids: source-code contracts, public API/schema — those live next to the implementation. A decision is never silently edited or deleted; it is superseded (see Supersession Gate).
- **Cursor** — the active execution pointer only: current goal, scope in/out, next step, verification state, blockers, stop condition. Compact and rewritten as the task moves. Forbids: full requirements, full plans, full task graphs — those are cited, not duplicated. The cursor is not front-mattered like the other types; it is a single rewrite-in-place file.
- **Archive** — cold storage: command output, verification notes, approval records, failed attempts, old execution packets. Provides evidence, never current authority. Reading it does not add it to the default read set.

## Front Matter

Every Requirement, Plan, Tasking, and Decision carries YAML front matter at the top of the file. Front matter is the machine-readable status surface: the index, lint, and supersession checks read it; humans read the body. A doc without valid front matter is not a doc of its type — it is an undated note and fails the Required Context Gate.

The body does not echo what front matter already records — `date`, `status`, `supersedes`, `superseded_by`. Restating these in prose is duplication that drifts out of sync whenever the front matter updates; the front matter is the single source for them. When the body needs to point at one (most often explaining why a prior doc is overturned), cite the upstream path inline rather than repeating its status or date.

```yaml
---
date: 2026-06-19
status: active               # draft | active | completed | superseded | archived
supersedes: <path>           # present only when this doc replaces a prior one
superseded_by: <path>        # present only when this doc has been replaced
---
```

Type is read from the directory and filename suffix; it is not a front-matter field. Same-altitude cross-links, derivation lineage, and any other relationships go in the body prose, not in front matter — for example a plan writes "来源需求：requirements/2026-06-17-foo.md" inline.

Status lifecycle by type:

- **Requirement / Plan / Tasking**: `draft` → `active` → `completed` → (`archived`). Can branch to `superseded` at any point when replaced.
- **Decision**: `draft` → `active` → `superseded` only. A decision never becomes `completed` or `archived` on its own — authority does not expire, it is only overturned by a newer decision. `archived` applies only when the decision is no longer referenced and is moved to cold storage.

## Naming And Placement

Follow the repo's existing convention if one exists. Default layout (mirrors anchor):

```
docs/
  requirements/                    YYYY-MM-DD-<slug>-requirement.md
  plans/                           YYYY-MM-DD-<slug>-plan.md
  tasking/                         YYYY-MM-DD-<slug>-tasking.md
  agent/current.md                 active cursor (no front matter; rewrite-in-place)
  decisions/                       NNN-<slug>.md   (sequential, never renumbered)
  archive/                         YYYY-MM-DD-<slug>-{baseline,validation,...}.md
  index.md                         one-line-per-doc routing index (required)
```

Date-prefixed incremental records for requirements, plans, tasking, archive. Sequential, zero-padded, never-renumbered prefixes for decisions — the prefix is part of the filename and is how a decision is cited; it must stay stable across its whole lifetime, including after supersession.

`index.md` is required, not optional. It is one line per doc: path, type, one-sentence purpose, current status (read from front matter). It is the routing substrate: to find where a fact lives, read the index first, then drill into the specific doc. Do not grep the whole set as a first move.

## Version Control Policy

All docs — including the cursor and tasking packets — are tracked in version control. Do not gitignore `agent/current.md`, `tasking/`, or any other workflow path. Tracking is load-bearing: cross-session handoff breaks without a committed cursor, the Supersession Gate's "preserve old body verbatim" relies on durable history, and archive consolidation that deletes originals is only safe because git holds the full history.

The cursor rewrites in place every iteration; that churn is intentional, not noise to suppress — it is the cost of the cursor being the single current pointer. Commit it like any other doc.

If a project genuinely cannot track these files (for example, a throwaway sandbox with no repo), say so explicitly in the project's workflow setup note; do not silently gitignore, because silent ignore makes cross-session handoff fail with no warning.

## Lifecycle And Flow

Work flows downhill and promotes uphill:

```
Requirement → Plan → Tasking → (execution) → Decision
                                                    ↓
                                                 Archive
```

- **Downhill derivation.** A plan cites its source requirement(s); a tasking cites its source plan and requirement. Derivation is by reference (path, inline in the body), never by copy. When two docs disagree, the upstream doc is the authority for its altitude; fix the downstream doc, not the reverse.
- **Promotion.** When a plan or tasking produces a conclusion that outlives the task — a chosen architecture, a rejected approach, a binding rule — promote it to a Decision record. Keep the plan/tasking as context for how the decision was reached; the Decision is the durable authority.
- **Supersession.** A newer doc explicitly replaces an older doc at the same altitude for the same question. Applies to any type: a Decision overturned, a Requirement redefined, a Plan obsoleted by a new plan. The old body is preserved, not deleted; the new doc is authority. See the Supersession Gate.
- **Archive.** Completed evidence and old execution packets move to archive. Keep a short pointer in the cursor or index, never the full body. Archive is traceable but not in the default read path.
- **Cursor is ephemeral authority.** It points to the active requirement, plan, tasking, and open decisions. It is rewritten in place as the task moves; it is never the store of full content.

## Operations

- **Capture.** Classify the moment (requirement / plan / tasking / decision / archive), create the doc at the right altitude, in the right place, with the right date, valid front matter, and status; pass the Content Selection Gate before adding body content; cite upstream docs inline where it derives from them; add its line to `index.md`; point any downstream docs that should cite it; and complete the Maintenance Observation Gate for the bounded related set. If the work does not fit a type, name what is missing rather than forcing it into the wrong home.
- **Maintain.** Keep cross-links, front-matter status, and `index.md` current as docs are added, promoted, superseded, archived, reduced, or marked as follow-up. Every routing or status change lands with its index update in the same edit, and every material content/routing/status change carries a bounded maintenance observation.
- **Query.** Read `index.md` and the cursor first, then drill into the specific doc. Do not grep the whole set as a first move.
- **Lint.** Periodically detect: front-matter errors (missing/invalid status, directory and filename suffix disagreeing about type, `supersedes` without matching `superseded_by`), orphans (no inbound links, not in index), stale links (target moved, archived, or superseded without forward pointer), contradictions (two `active` docs at the same altitude answer the same question), decisions still buried in a plan that should be promoted, and broken supersession chains. Lint findings are new Capture or Maintain work, not silent edits.

## Maintenance Observation Gate

Activate on every material create, update, move, promote, supersede, archive, or routing/status edit in the document set. Spelling-only and formatting-only edits do not require a corpus check, but they still must not hide a known lifecycle problem in the touched doc.

The observation is bounded by the routing surface, not the whole repository. Inspect: `index.md`; the cursor if present; the touched doc(s); upstream/downstream docs named by inline links, front matter, cursor, or index; same-question candidates surfaced by the index; and affected directory peers only when the index is missing, stale, or visibly incomplete. Use wider search only to repair broken routing or answer a concrete stale-link question, not as the first move.

The work is incomplete until a compact observation exists in the place appropriate to the operation: the cursor for active work, `index.md` for routing/status changes, the touched doc when the lifecycle note is durable context, or the final/task note when no durable edit is needed. The observation records:

- `operation`: create / update / move / promote / supersede / archive / route, plus touched path(s);
- `observed_set`: the concrete paths inspected, including absent required paths such as a missing cursor or index;
- per materially related doc: `classification`, `reason`, and `action` (`applied`, `deferred`, or `blocked`);
- whether front matter, cursor, links, or `index.md` changed.

If no materially related prior doc is found, record the `observed_set` and that no lifecycle action was found. Silence is not evidence that the observation happened.

Allowed classifications:

- `keep` — current, scoped, routed, and not duplicative authority.
- `record` — valuable context exists but its route, owner, status, source, or evidence pointer needs to be recorded.
- `reduce` — content has value but duplicates authority, overstates code-derived facts, or belongs as a short pointer.
- `archive` — cold evidence or completed execution context should leave the default read path while retaining a route.
- `supersede` — a newer same-altitude doc replaces current authority and must pass the Supersession Gate.
- `delete-candidate` — non-authoritative, certainly wrong, redundant, generated, or valueless material is a candidate, not an action; removal requires deletion to be in the current authorized scope or a focused user approval, with routes, links, and recovery path handled.
- `follow-up` — real maintenance work is outside the current authorization or too large for the current edit.

Weak substitutes that do not satisfy the gate: "checked related docs" with no paths; a blanket "all keep" with no per-doc reason; repo-wide grep before reading the index and cursor; deleting front-mattered workflow history as cleanup; marking a decision, approval, or requirement-source record as disposable because it is old; or deferring a stale active doc without a route to the follow-up.

Stop and ask the user before deleting or rewriting any front-mattered doc that carries unique history, human approval, requirement source, or decision rationale. For such docs, normal lifecycle outcomes are `keep`, `reduce`, `archive`, or `supersede`, not direct deletion.

## Required Context Gate

Activate when creating or promoting any doc.

The doc is incomplete until it has: valid YAML front matter with at least `date` and `status`; its status matching its actual lifecycle stage (`draft` until it is real authority, `active` once it is); its filename matching its directory's type convention; an inline citation of upstream docs for derived types (plan ← requirement, tasking ← plan + requirement); and its one-line entry in `index.md`.

Weak substitutes that do not satisfy the gate: an undated note; a doc with no front matter; a doc whose directory and filename suffix disagree about type; a derived doc that restates its source instead of citing it; a promotion that copies a conclusion into the decision record while leaving the plan as if still authoritative; a new doc whose index line is missing or added in a later edit.

## Content Selection Gate

Activate when creating or materially updating durable doc content.

The body is a context budget for future humans and agents. It records durable context that is not reliably recoverable from the codebase, command history, generated reference, schemas, tests, or logs alone: requirement source, user intent, constraints, approvals, non-goals, rationale, rejected alternatives, trade-offs, confidence, revisit triggers, current execution state, and the interpretation of evidence.

Directly observable implementation facts are cited, not copied into prose as authority. Use stable source pointers such as file paths, symbols, test names, issue/PR IDs, commands, source URLs, or archive IDs. A short contextual summary is allowed when it helps orientation, but it must point to the canonical authority and must not become a second source of truth. Source-code contracts, public API/schema, and runtime behavior live next to the implementation; workflow docs record why the contract exists, which requirement or decision produced it, and when it should be revisited.

Bulk evidence stays out of the default read path. Archive raw output only when it is not reproducible, proves an approval or validation result, explains a rejected path, or prevents repeated work. Otherwise record the command/source and the short observed result.

The content is incomplete until every new or changed authority-bearing claim has one home at the right altitude, directly recoverable facts have source pointers, and non-recoverable context is recorded without filler.

Weak substitutes that do not satisfy the gate: a directory tour that repeats what `find` or `rg --files` can show; a prose copy of class names, routes, schema fields, or file layout as if it were authority; raw transcripts in active docs; a decision conclusion without rationale or rejected alternatives; a requirement with no source; evidence with no pointer; or stuffing full plan/tasking bodies into the cursor.

## Promotion Gate

Activate when a plan or tasking conclusion is being recorded as durable.

The promotion is incomplete until: the Decision record carries the chosen direction, the rejected alternatives with reasons, the non-goals, and a back-reference to the plan/tasking that produced it (inline in the body); the source plan/tasking is marked as context for the decision, not as authority; any source-code or public-contract aspect is also recorded next to the implementation; the decision's front matter is `active`; and `index.md` carries the new decision line.

Weak substitutes: promoting only the conclusion without the rejected alternatives; leaving the decision living in the plan and citing the plan as authority; or treating a still-open question as settled.

## Supersession Gate

Activate when a newer doc must replace a prior doc at the same altitude for the same question. This is type-uniform: a Decision may be overturned by a newer Decision, a Requirement redefined by a newer Requirement, a Plan obsoleted by a newer Plan, a Tasking replaced by a newer Tasking. The mechanism is identical across types.

Supersession is explicit, bidirectional, body-preserving, and chain-complete. The old doc is never edited in content and never deleted; only its front matter changes. Both stamps must land in the same edit:

- the new doc's front matter carries `supersedes: <path>`, `status: active` (or `draft` if still pending approval), and the body records the reason the prior is overturned;
- the old doc's front matter is stamped `superseded_by: <path>`, `status: superseded`.

The supersession is incomplete until:

- the old body is preserved verbatim — only the front-matter status and the `superseded_by` pointer are added;
- at any time exactly one doc per question is `active` authority (the newest non-superseded one); superseded docs are history, not authority;
- the superseding doc records new evidence or reasoning contradicting the prior basis, cited by path or evidence id — supersession is not a preference change, it is a correction;
- when the superseded doc carried human approval (most commonly a Decision, but also a Requirement the user signed off on), the supersession is a human gate until the new approval is recorded;
- `index.md` reflects the status flip (old line marked superseded, new line added) in the same edit.

Chain integrity is invariant: every `supersedes` has a matching `superseded_by`, the chain is acyclic, and it terminates in exactly one `active` doc. Lint verifies this. A broken or one-directional link fails the gate.

Weak substitutes that do not satisfy the gate: deleting the old doc; editing the old body to match the new conclusion; adding only the new doc with no back-link, or only a forward link with no `superseded_by` on the old; restating the supersession as "updated" without preserving the prior; superseding without new evidence so the change reads as a mood swing; or applying supersession to only Decisions while leaving obsolete requirements or plans lying around as if still current.

## Archive Gate

Activate when moving completed work to archive.

The move is incomplete until: a forward pointer exists in the cursor, index, or a parent doc (an archive target with no inbound route is an orphan); the archived doc's front matter is `status: archived` with a date; nothing in the default read set still treats it as current authority; and its `index.md` line is updated in the same edit.

Note: supersession and archive are different operations. A superseded doc stays in its home directory with its stamp — it is recent, revisitable history. Archive is cold storage for work no longer in the read path. Do not archive a superseded doc unless it is also no longer referenced; if it is, update every inbound pointer first.

Weak substitutes: moving a doc to archive and leaving dangling links; archiving without a date or without the `archived` status; keeping a full copy of the archived body in the cursor; or treating supersession as a reason to delete.

## Self-Review

Required confirmations — any `no` leaves the work incomplete:

- Does every doc created or moved own exactly one altitude, and cite rather than restate its source?
- Does every authority-bearing claim have one canonical home at its altitude, with other docs citing it rather than becoming parallel authority?
- Does every material doc change include a Maintenance Observation Gate record with inspected paths, classifications, reasons, and action/defer/block status?
- Does new or changed body content pass the Content Selection Gate: source pointers for recoverable facts, and durable intent/source/rationale/constraint/trade-off/approval/revisit context when applicable?
- Does each derived doc cite its upstream source by path inline in the body?
- Does every Requirement, Plan, Tasking, and Decision carry valid front matter with at least `date` and `status`?
- Does the front-matter `status` match the doc's actual lifecycle stage — `draft` until it is real authority, `active` once it is?
- Was a stable outcome promoted to a Decision rather than left buried in a plan?
- Does the cursor point to the active docs without duplicating their full bodies?
- Does every archived doc have a forward pointer from the default read set?
- Is `index.md` current with every routing or status change made in this session, in the same edit as the change?
- For every supersession, on any type: is the old body preserved, both stamps present in the same edit, exactly one `active` doc, and new contradicting evidence cited?

Defect checks — any `yes` leaves the work incomplete:

- Could a doc at one altitude be mistaken for authority at another (e.g., a plan treated as a decision, or a superseded doc of any type still cited as current)?
- Does any doc restate a fact whose home is elsewhere instead of citing it?
- Does any doc turn recoverable implementation detail into prose authority instead of citing the source and recording only the decision-relevant interpretation?
- Did a material doc change skip the bounded maintenance observation, omit the observed paths, or classify related docs with no reason?
- Did a cleanup action delete, rewrite, or hide front-mattered history, approval, requirement source, or decision rationale instead of reducing, archiving, or superseding it?
- Is there a stale, duplicate, overgrown, or wrongly authoritative related doc that was observed but neither handled nor recorded as a follow-up?
- Does any doc echo its own front-matter `status`, `date`, `supersedes`, or `superseded_by` in the body instead of letting the front matter be the single source?
- Did a routing or status change (add / promote / supersede / archive) happen without updating the cursor and index in the same edit?
- Is a decision still living in a plan or tasking while the plan is cited as authority?
- Did a superseded or archived doc lose its forward pointer, get its body edited or deleted, or land only one of the two supersession stamps?
- Is there a `supersedes` without a matching `superseded_by`, an obsolete Requirement/Plan/Tasking left `active` when it has been replaced, or two `active` docs answering the same question?

## Stop Rules

Stop when the triggering doc exists at the right altitude, in the right place, dated, with valid front matter and matching status, linked to its source(s), reflected in `index.md`, passes the Content Selection Gate, and has a completed Maintenance Observation Gate record for the bounded related set; and — for supersession — both stamps landed in the same edit with the old body preserved. Stop and ask the user when the work does not fit any defined type, when a promotion or supersession would record an unresolved question as settled, when a supersession overturns a human-approved doc without new approval, when an archive move would orphan a still-cited doc, or when deleting/reducing a doc would remove unique history, approval, requirement source, or decision rationale without explicit authorization and a recovery route.

The content quality of a plan or tasking is a separate job: hand a plan draft to `code-plan` and a task graph to `code-tasking`; this skill places their output, it does not grade it.
