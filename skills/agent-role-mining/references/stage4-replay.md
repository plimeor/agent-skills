# Stage 4 — Forward Replay Validation

Purpose: up to this point `roles.md` has only been **explained** by history, never **tested** against it. Replay measures three quantities against real sessions, turning the role definitions from taxonomy into tested design. Results go in `validation/`.

## 4A. Sampling: two kinds of replay, an order of magnitude apart in resolution

**Decide first which question this round answers.** The two questions have completely different sample-size requirements, and mixing them produces a number that supports no conclusion at all.

| | **Descriptive replay** | **Comparative replay (A/B)** |
|---|---|---|
| Question | Roughly how well do these roles perform? | Did changing §N make it better? |
| Sample | **≥5 sessions**, covering different shapes (at minimum: one batch-adjudication, one design/shaping, one execution/repair) | Every session scored **once, with both versions in the same pass** — see below |
| Output | Magnitude of the three metrics + per-session records | The delta between versions, and only after clearing the noise floor |

### A comparison scores both versions in one pass, or it is confounded

**Never score the two versions independently.** Escalation accuracy and friction prevention are ratios over ground truth — how many points the user really intervened at, how many real friction points a session contained. Ground truth belongs to the session, not to the version, so a scorer counting it twice gives two different answers, and that disagreement lands directly in the denominators being compared.

So: give one scorer the session, both versions' predictions, and have it **count the ground truth once** and score both predictions against it. Version-independent quantities are then identical by construction, and the difference that remains is the effect.

**Sample size does not fix this.** Scorer disagreement about what counts as an intervention point is systematic, not random: it does not average out, so a bigger denominator buys nothing. The tell is comparing the same version-independent quantity across two batches — if the signed difference is a meaningful fraction of the total rather than near zero, the comparison is confounded and the numbers cannot be read, whatever the sample size.

**Measure the noise floor on this corpus, never assume one.** Below it no difference is readable in either direction — including "the change did nothing". Do not take noise as a conclusion and edit `roles.md` on it.

`user-turns/<file>.md` already isolates the user turns; the first one is marked `(INITIAL)`.

### Stage ordering (getting it backwards contaminates the control)

If one round includes both an **independent-chain rerun** (re-deriving roles from scratch with a different extractor or model) and an **open-schema control analysis**: **the independent rerun must come first.** Reversed, the independent chain has already seen the control's conclusions, its independence no longer holds, and both experiments are void.

## 4B. Replay method

For each selected session:

1. Instantiate the roles from the prompt skeletons in `roles.md`.
2. Give the role pipeline only the session's **INITIAL user turn** (plus necessary project background), and **none of the later user turns**.
3. Let the pipeline run until it decides Owner input is required, recording: which points it escalates to the Owner, what it asks, and what work it absorbs on its own.
4. Compare against the real session (all subsequent turns in `user-turns/` are the record of real Owner intervention).

Replay may be executed by subagents; the replaying subagent must not read the session's real subsequent turns (leak prevention). Only the comparison stage may read the full transcript. For dispatch mechanics — timeouts, re-dispatch, success criteria — see `references/dispatch.md`.

### Three leak paths; any one of them voids the round

"Don't read the later turns" is **not sufficient**. All three below have actually happened:

1. **If `roles.md` carries provenance, it is itself the leak source** — the replay agent **must** read it, and `session_id [turn]` directly exposes the identity and key moments of the session being replayed. Stage 3 §3.0 moves provenance out of `roles.md`; **run `lint-roles` before starting** (stage3 §3F) and confirm `session-id` and `turn-ref` are both zero.
   **Give the replay agent only `roles.md`, never `roles-evidence.md` or `roles-method.md`** — the first is the provenance table, the second holds the residual list and per-session replay records.
   > "I told it in the prompt not to look" is not a countermeasure — reachable material will be read. **Make isolation structural**: put only what should be read into the replay agent's working directory and leave the rest physically unreachable. Note that symlinks escape via `../`; use real copies.

2. **The repository may already contain this session's own output.** The nature of the corpus guarantees it: one session's output is the next session's input — landed code, written documents, updated guidelines are all sitting there. **The replay agent should be barred from reading project source**; where background is genuinely needed, give only what the INITIAL turn already contains.

3. **Re-testing on the same sample.** Clauses revised on the strength of last round's replay, checked again against the same sessions, is testing on the training set. **Use a different batch of sessions**; if the goal is to test whether last round's revision took effect, run and report the old batch and the new batch **separately**, never merged into one number.

### Isolation must be verified afterwards, and only one verification method is correct

Once structural isolation is in place, **prove it held** — from each replay agent's session log, extract **only the path arguments of tool calls** (the values of `file_path` / `path` / `pattern` / `cmd` / `command` / `glob`) and check for any access outside the working directory.

**Do not grep the log body for path-like strings.** `roles.md`'s own text contains project and directory names, so a replay agent merely restating a clause matches and every run reads as an escape (dispatch.md D5 covers the general form of this mistake). **The criterion is what it accessed, not what it mentioned.**

### Same-input rerun group

**Required every round**: run the same `roles.md` over the same sessions twice; the difference between the two results is this evaluation's noise floor. A cheaper check that needs no extra run: compare a version-independent quantity (real intervention points, real friction points) across the batches you already have — it must come out identical, and whatever it differs by is your floor. **A difference smaller than the noise floor may not be reported as a conclusion** — including as a conclusion that the change did nothing.

**Contamination audit is mandatory at scoring time**, not optional: check each prediction for content that could only come from later turns or from repository state; anything that hits **must be excluded from precision/recall**, and both figures — with and without that item — must be reported. **A labeled contaminated replay is useful; an unlabeled one is poison.**

## 4C. The three metrics

Each session produces `validation/replay-<file>.md`:

1. **Escalation accuracy**: the points where the role pipeline escalates to the Owner vs. the points where the user really intervened.
   - precision: of the points the pipeline escalated, the fraction where the user really did intervene or care (low = the roles are chatty and will annoy).
   - recall: of the real user intervention points, the fraction the pipeline flagged in advance as needing escalation (low = the roles will overreach or miss).
2. **Friction prevented**: for each anger point in the real session (overreach, false completion, fence-sitting, wrong reference…), judge whether executing under the role constraints would have prevented it entirely. Record as preventable / not preventable / uncertain.
3. **Participation-density reduction estimate**: classify each real user turn:
   - `absorbable`: the role system would have handled it (or the question never arises)
   - `real Owner decision`: a human should rule on it regardless
   - `friction correction`: caused by an agent behavior defect that the role constraints ought to prevent
   - `dialogic`: design back-and-forth — **not a savings target** (the value of a dialogic phase is per-turn quality, not turn count)

## 4D. Aggregation and write-back

`validation/summary.md`: a three-metric summary table plus conclusions. Reading guide:

- Low recall → the roles' "escalate to human" definition is missing an axis; go back to Stage 3 and fix it.
- Low precision → the roles are handing up absorbable work; tighten "absorbs autonomously".
- Low friction prevention → the role constraints are empty words; the prompt skeletons need hard boundaries that actually hold.
- Session shapes with a high `dialogic` share → verify that the "dialogic phases promise no turn reduction" caveat is honestly stated in `roles.md` and in overall expectations.

Write conclusions back: **metrics and per-session records go to `roles-method.md`**; **`roles.md` changes in exactly two places** — clauses the replay falsified, and the handful of numbers in the top "known limits" block (stage3 §3E). Replay data itself does not enter `roles.md`. Re-run `lint-roles` after write-back. Only then is the iteration complete. Use a different batch of sessions on the next Stage 4 round to avoid overfitting to one sample.
