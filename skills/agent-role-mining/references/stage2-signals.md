# Stage 2 — Signal Extraction

Input: `cleaned/` (only sessions with `status: kept` in the manifest) plus `census/census-list.json`.
Output: `signals/<file>.md` (same name as the cleaned file), `signals-manifest.md`, `census/census.md`, `signals/_open-schema/` (control group).

Field labels are fixed so downstream stages can rely on them. Everything filled in around them is written in the corpus's own language, and **quoted user speech is never translated** — a translated quote is no longer evidence.

## 2A. Main extraction (one file per kept session)

Goal: extract signals that reveal the user's **thinking patterns, judgment preferences, and decision habits**. Tool stdout and full file contents carry almost no persona information — look only at the user's own words and at the user's reactions to agent output.

Hard rule: **every key interaction must quote the user verbatim with a turn number** (`User [n]: "…"`). Paraphrase may not stand in for quotation, and turn numbers may never be invented. The credibility of a signal file rests entirely on being traceable — downstream Stage 3 uses those turn numbers to check the original text in `cleaned/`.

Template for each signal file:

```markdown
# Session signals: <file>

**Session**: <source> / <session_id> / <intervention> / <title> / <project>
**Initial user intent**: <one or two sentences>
**Key interactions and feedback trace**: (User [n] + verbatim quote; selected)
- User [n]: "<verbatim>" — one line of context
**Recurring feedback patterns**:
- Highly sensitive / likely to be pressed on:
- Relatively tolerant / likely to be let go:
- Common correction preferences:
**Directions the user explicitly rejected or corrected**:
**Signals that the user considers it finished** / **signals they must rule on personally**:
**Value**: High|Medium|Low
**Value rationale**: <one sentence>
```

Value-rating criteria (heuristic, not ground truth): signal density, clarity of corrections, completeness of decision rulings. High intervention ≠ high value (example: a research session unrelated to coding can be high-intervention and low-value).

Batching: dispatch subagents in batches of 10–15 sessions in parallel; each subagent receives only a list of cleaned file paths, never another session's conclusions (avoids cross-contamination). Failures must be re-dispatched, never silently missing. Dispatch mechanics — timeouts, success criteria, failure typing — are in `references/dispatch.md`.

## 2B. Open-schema control group (anti-circularity control)

The template above presupposes an "adjudicating Owner" frame (feedback / rejection / ruling). **Extract with a preset frame, then cluster the extractions, and part of the resulting shape is an echo of the template.** The control group measures that bias:

1. `bun pipeline.ts sample --run <run> --n 15 --seed 42 --pool kept` for a deterministic sample.
2. For each session in the sample, dispatch a subagent that **has not read the main template** and answers only three open questions (with no dimension list given):
   - What kind of help was the user asking the agent for in this session?
   - What role did the user play, and what kinds of actions did they take?
   - What key moments occurred (turns, conflicts, decisions)? Quote one line for each.
3. Write results to `signals/_open-schema/<file>.md`.
4. Add an "open-schema control" section at the end of `signals-manifest.md`: where the control-group shapes **converge with and diverge from** the main-template shapes. Divergence axes must be carried into Stage 3 unchanged (they are a likely source of residual roles).

## 2C. Delegation census (the excluded low-intervention sessions)

Low-intervention sessions dropped by the funnel are positive evidence of **what can already be safely delegated** — looking only at friction material biases the role definitions toward control. Annotate each session in `census/census-list.json` **lightly** (no full signal extraction; three lines each):

```markdown
- `<file>`: task type=<one line>; outcome=completed|abandoned|n/a; closing=<user's last line, or none>
```

Aggregate into `census/census.md`, ending with a summary of **which task types were repeatedly delegated successfully**. That list is the main evidence source for each role's "absorbs autonomously" boundary and for the Act delegation whitelist in Stage 3.

## 2D. signals-manifest.md

Structure:

1. Counts: number of high/medium/low value, distribution by source (must reconcile with `inventory/stats.json`).
2. Cross-session high-frequency feedback patterns: highly sensitive / relatively tolerant / correction preferences / can-end vs. must-rule (each annotated with the number of supporting sessions).
3. Full table: value, intervention, source, session, user turns, intent summary, signal file link.
4. Per-session "value rationale" for each high-value session.
5. Open-schema control conclusions (see 2B).

Completion check: `bun pipeline.ts stats --run <run>` must report `signalsWritten` equal to the kept count. Every missing one gets re-dispatched; "basically all covered" is not acceptable.
