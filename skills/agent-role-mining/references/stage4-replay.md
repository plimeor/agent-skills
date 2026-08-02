# Stage 4 — Boundary Validation

## First principles

Up to this point `roles.md` has been **explained** by history. Stage 4 **tests** it.

What must be true for the catalog to be useful on an unknown harness:

- When a session looks like role R's **trigger**, the catalog's **escalate / absorb** lines should match what the Owner actually did.
- That test does not require spinning up multiple agents in one session.
- Most harnesses cannot host multi-agent dialogue anyway; validating "a role pipeline runs" would measure a runtime the user may never have.

So Stage 4 has two paths:

| Path | Required? | Question it answers |
|---|---|---|
| **Primary — boundary check** | **Yes** (before claiming validity) | Do triggers and absorb/escalate lines fit real sessions? |
| **Optional — pipeline stress test** | No | If you instantiate multi-role orchestration, how does it behave blind? |

Optional results never replace the primary path. Optional metrics must not be written into `roles.md` known-limits as if they were catalog validity.

Results go in `validation/`.

## 4A. Sampling

**Decide which question this round answers.** Mixing descriptive magnitude with A/B delta in one number supports no conclusion.

| | **Descriptive** | **Comparative (A/B)** |
|---|---|---|
| Question | Roughly how well do these boundaries fit? | Did changing §N improve fit? |
| Sample | **≥5 sessions**, different shapes (at minimum: one batch-adjudication, one design/shaping, one execution/repair) | Every session scored **once, with both versions in the same pass** |
| Output | Magnitude of primary metrics + per-session records | Delta only after clearing the noise floor |

### A comparison scores both versions in one pass, or it is confounded

Escalation accuracy is a ratio over ground truth — how many points the user really intervened at. Ground truth belongs to the session, not to the version. Scoring two versions independently lets the scorer count interventions twice differently; that disagreement lands in the denominators.

Give one scorer the session and both versions' predictions; **count ground truth once**; score both against it.

**Sample size does not fix systematic scorer disagreement.** If a version-independent quantity differs across two batches by a meaningful fraction of the total, the comparison is confounded — do not read the delta.

**Measure the noise floor on this corpus; never assume one.** Below it, no difference is a conclusion — including "the change did nothing".

`user-turns/<file>.md` isolates user turns; the first is marked `(INITIAL)`.

### Stage ordering (independent chain vs open-schema)

If one round includes both an **independent-chain rerun** (re-deriving roles from scratch) and an **open-schema control**: **independent rerun first.** Reversed, independence is void.

---

## 4B. Primary path — boundary check

Harness-agnostic. No multi-agent runtime required.

For each selected session:

1. Read only what a deployer would mount: role list, **triggers**, **absorbs**, **escalates**, shared constraints. Do not require prompt skeletons or orchestration sections.
2. From the session's **INITIAL** user turn (and phase signals visible without later turns), judge:
   - Which role(s) **should trigger**
   - Which later Owner interventions (from full `user-turns/`) fall under **escalate** vs **absorb** under the catalog
3. Compare predictions to the real intervention trace.
4. Record mismatches: missed trigger, wrong role, false escalate, missed escalate, absorb that the Owner actually seized.

**Who may read what**

- The judge that assigns triggers/boundaries from INITIAL only must **not** see later user turns while predicting.
- The scorer that compares to reality **may** read the full `user-turns/` file.
- Give validators `roles.md` only — never `roles-evidence.md` or `roles-method.md` (provenance and residuals leak identity and prior conclusions).

Structural isolation still applies when the validator is an agent with tools: put only readable material in its working directory; real copies, not symlinks that escape via `../`. Isolation proof: inspect **path arguments of tool calls**, not path-like strings in log prose (`roles.md` text will false-positive).

### Primary metrics (per session → `validation/boundary-<file>.md`)

1. **Trigger fit** — did the catalog's trigger fire on the sessions where that judgment function was actually in play? Misses and false fires, with short evidence.
2. **Escalation accuracy** — catalog escalate points vs real Owner intervention points:
   - **precision:** of predicted escalations, fraction the Owner really cared about or seized (low → chatty catalog)
   - **recall:** of real interventions, fraction the catalog marks as escalate (low → overreach risk)
3. **Absorb / friction read** (lightweight):
   - real turns classed as `absorbable` | `real Owner decision` | `friction correction` | `dialogic`
   - anger points: would the stated boundary have forbidden the failure mode? `preventable` | `not` | `uncertain`
   - **dialogic is not a turn-savings target**

### Leak and contamination (primary path)

1. **Provenance in `roles.md`** voids the round — run `lint-roles` first; `session-id` and `turn-ref` must be zero.
2. **Same-sample re-test after editing clauses from that sample** is training-set test — use a different batch; report old and new separately if both matter.
3. **Contamination audit at scoring:** predictions that could only come from later turns or repo state are excluded from precision/recall; report with and without. Labeled contamination is useful; unlabeled is poison.

### Same-input noise floor

Required each round: either rerun the same catalog on the same sessions twice, or compare a version-independent quantity (real intervention counts) across batches — difference is the floor. **Deltas below the floor are not conclusions.**

---

## 4C. Optional path — pipeline stress test

Only when the user (or a harness under test) actually cares about multi-role instantiation. **Skip by default.**

For each selected session:

1. Instantiate roles from skeletons / collaboration hints in `roles.md` *if present*.
2. Give the runtime only the **INITIAL** user turn (plus background already in that turn).
3. Run until it demands Owner input; record escalations, questions, absorbed work.
4. Compare to real `user-turns/`.

**Additional leak path:** the repository may already contain this session's output. Bar the stress-test agent from project source; background only from INITIAL.

Stress-test metrics may reuse escalation precision/recall and friction labels, stored as `validation/pipeline-<file>.md`. They answer "how does *this orchestration* behave," not "is the catalog valid."

If skeletons or orchestration sections are missing, **do not invent a pipeline to stress-test** — the optional path is simply N/A; the primary path still stands.

Dispatch mechanics (timeouts, re-dispatch, success checks): `references/dispatch.md`.

---

## 4D. Aggregation and write-back

`validation/summary.md`:

- Primary: trigger fit + escalation precision/recall + absorb/friction summary + noise floor note
- Optional (if run): pipeline stress-test metrics, clearly labeled **optional / harness-specific**
- Conclusions tied to catalog fields, not to a fantasy runtime

Reading guide (primary):

- Low recall → escalate definition missing an axis → fix Stage 3 boundaries
- Low precision → absorb too narrow or escalate too broad → tighten triggers / absorb
- Poor trigger fit → role list or trigger wording wrong → fix Stage 3, do not paper over with orchestration
- High `dialogic` share → confirm dialogic roles do not promise turn reduction in `roles.md`

Write-back:

- Metrics and per-session records → **`roles-method.md`**
- **`roles.md` changes in exactly two places:** clauses the **primary** path falsified, and known-limits numbers from the **primary** path
- Optional pipeline numbers stay in `roles-method.md` only
- Re-run `lint-roles` after write-back
- Next Stage 4 round: different session batch

Until the primary path has completed, known-limits must say boundary check was not run. Completing only the optional path does **not** clear that line.
