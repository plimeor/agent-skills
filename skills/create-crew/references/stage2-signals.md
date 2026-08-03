# Stage 2 — Signal extraction

## Inputs

- `cleaned/` for sessions with `status: kept`
- `census/census-list.json` for low-intervention sessions

## Outputs

- `signals/<file>.md` (one per kept session)
- `signals-manifest.md`
- `census/census.md`
- `signals/_open-schema/` (control sample)

Field labels are fixed. Prose is in the corpus language. Quoted user speech is never translated.

## 2A. Main extraction

Goal: thinking patterns, judgment preferences, decision habits. Prefer the user's words and their reactions to agent output. Tool stdout and full file dumps are low signal.

Hard rule: every key interaction quotes the user verbatim with a turn number (`User [n]: "…"`). No invented turn numbers. No paraphrase in place of a quote.

```markdown
# Session signals: <file>

**Session**: <source> / <session_id> / <intervention> / <title> / <project>
**Initial user intent**: <one or two sentences>
**Key interactions and feedback trace**:
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

Value is a heuristic (density, clarity of corrections, completeness of rulings). High intervention is not high value by itself. High value is not a role candidacy signal; Stage 3 elevation decides what enters the Role index.

Dispatch in parallel batches of 20–30 sessions. Each worker receives only its own cleaned paths. Failures re-dispatch. Need tool detail → `pipeline.ts tool-detail`. See `dispatch.md`.

## 2B. Open-schema control

The main template assumes an adjudicating Owner. That frame biases clustering. Control:

1. `sample --run <run> --n 15 --seed 42 --pool kept`
2. For each sample session, a worker that has not seen the main template answers only:  
   - What help did the user want?  
   - What role did the user play, and what actions?  
   - Key moments (quote one line each)?  
3. Write `signals/_open-schema/<file>.md`
4. In `signals-manifest.md`, state convergence and divergence with the main template. Divergences pass into Stage 3 residuals unchanged.

## 2C. Delegation census

Low-intervention sessions are positive evidence of safe delegation. Friction shows seize; census shows release. Stage 3 ranks both equally.

Light annotation per census session:

```markdown
- `<file>`: task type=<one line>; outcome=completed|abandoned|n/a; closing=<last user line or none>
```

`census/census.md` ends with:

1. Delegation whitelist (recurring completed task types)  
2. Counts: sessions, distinct types, types with ≥2 sessions  
3. Explicit thin/empty census note when absorb claims cannot rest on census  

A crew whose absorb lines ignore a non-empty census fails Stage 3.

## 2D. Manifest

1. Value counts and source distribution (reconcile with `stats`)  
2. Cross-session high-frequency patterns with supporting session counts  
3. Full session table  
4. High-value rationales  
5. Open-schema control conclusions  

Completion: `signalsWritten` equals kept count.
