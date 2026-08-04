# Stage 4 — Boundary validation

## Purpose

Stage 3 explains the crew from history. Stage 4 tests whether Spec triggers and absorb/escalate lines match real Owner behaviour.

| Path | Required | Question |
|---|---|---|
| Primary boundary check | Yes | Do Specs fit real interventions? |
| Pipeline stress test | No | How does multi-role fielding behave on a given harness? |

Stress metrics never substitute for primary. Stress numbers stay in `roles-method.md`.

Primary validates **judgment**. It does not grade whether Orca or Portable fielding is correctly implemented — that is `runtimes.md` contract text, not Owner boundary truth.

## Sampling

| Mode | Question | Sample | Output |
|---|---|---|---|
| Descriptive | Fit magnitude | ≥5 sessions covering batch, dialogic, and execution shapes | Metrics + per-session records |
| Comparative | Did a Spec change help? | Same sessions; both versions scored in one pass | Delta only above noise floor |

Ground truth (real intervention points) is counted once per session when comparing versions. Measure noise floor on this corpus. First user turn in `user-turns/` is `(INITIAL)`.

If both an independent re-derivation and an open-schema control run in one round, run the independent chain first.

## Primary path

No multi-agent runtime required. Orca is not required.

1. Validator may read only:  
   - `skill/SKILL.md` — **Routing and Role index only**, as a roster of legal ids  
   - `skill/roles/*.md`  
   Not method, evidence, full Depth, or **`runtimes.md`** as a source of escalate/absorb truth.

   Escalate/absorb truth comes from role Specs alone. This is what the primary path measures: whether the Specs, by themselves, predict where the Owner intervenes.
2. From **INITIAL** only, predict triggers and which later interventions Specs treat as escalate vs absorb.
3. Score against full `user-turns/`.
4. Log misses: wrong trigger, false escalate, missed escalate, Owner seized an absorb.

Isolation is structural (readable files only in the work directory). Prove isolation from tool path arguments, not from grepping log prose.

### Per-session metrics (`validation/boundary-<file>.md`)

1. Trigger fit  
2. Escalation precision and recall  
3. Turn classes: absorbable | real Owner decision | friction correction | dialogic  

Dialogic is not a turn-savings target.  
Contamination audit is mandatory; report metrics with and without contaminated items.  
Same Specs on the same sessions twice (or a version-independent quantity across batches) define the noise floor. Deltas below the floor are not conclusions.

Provenance inside the crew package voids the round. Re-testing clauses on the same sample used to edit them is invalid; use a new batch.

## Optional stress path

Skip by default. Run only when multi-role **fielding** under a harness is under test (not a substitute for primary metrics).

1. Small sample (2–3 sessions) with Evaluation combo partners.  
2. INITIAL-only background; bar project sources that already contain session outputs.  
3. Load `runtimes.md` **Select** — if Orca is ready, use the Orca branch; else Portable.  
4. Field partner roles per Specs; still judge Owner fit from Specs.  
5. Harness-only failures → fix `runtimes.md`; Spec misses → roles / index.  

Primary package eval scripts (`prep-crew-eval` + `run-crew-eval-llm`) do **not** run this path.

## Write-back

`validation/summary.md` holds the primary table and conclusions.

| Signal | Action |
|---|---|
| Low recall | Expand escalate in role Specs |
| Low precision | Expand absorb or tighten triggers |
| Poor trigger fit | Fix Role index and role Trigger fields |
| High dialogic share | Combos and roles must not promise turn reduction |

- Metrics narrative → `roles-method.md`  
- Falsified clauses → `skill/roles/<id>.md` and index/combos in `skill/SKILL.md`  
- Primary metrics / “boundary check not run” → `roles-method.md` only (never mount `skill/SKILL.md`)  
- Harness-only defects → `skill/runtimes.md` (not role Specs)

If primary has not completed, `roles-method.md` states that boundary check has not run.
