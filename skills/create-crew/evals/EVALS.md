# Create-crew evals

Quality evals follow **skill-creator**: live LLM runs on realistic prompts, then grade verifiable expectations against real outputs. Prep builds inputs only; live predict/score decide quality.

## skill-creator model (what we use)

1. Cases live in `evals/evals.json` — prompts a real user would type, plus `expected_output` and `expectations`.
2. A live agent with create-crew runs each prompt (optional baseline: same prompt without the skill).
3. A grader checks each expectation with evidence from files and transcripts.
4. Failures drive skill edits; rerun.

skill-creator’s description-trigger loop (should_trigger query sets) is a **separate** product for optimizing frontmatter. create-crew quality evals do not use that loop.

## What we measure

| Target | Live question |
|---|---|
| **create-crew** | Does an agent following this skill build a real crew package / run a real crew eval when asked? |
| **crew package** (new run or installed) | On real sessions, does blind Spec use match Owner escalate behaviour? |

### Primary package eval ≠ Orca fielding

| Path | Uses Orca? | Gold |
|---|---|---|
| **Primary** (predict + score) | **No** | Specs (`SKILL.md` Owner/index, `roles/*`) |
| **Optional stress** | May (Select in `runtimes.md`) | Still Owner fit from Specs; harness defects → `runtimes.md` |

`runtimes.md` is not escalate/absorb gold on the primary path.

### Metric meanings (primary)

| Metric | Meaning |
|---|---|
| **trigger_fit** (0–1) | Did the predicted **Role index** seats match the *kind* of judgment the session needed? Routing quality, not escalate count. Invented ids are a fit failure. |
| **escalate_precision** (0–1) | Of predicted escalate points, what fraction match real Owner interventions / cares? High precision → few false Owner stops. |
| **escalate_recall** (0–1) | Of real Owner interventions, what fraction were anticipated by a predicted escalate? High recall → fewer missed Owner stops (harder from INITIAL-only). |

**Absorbs** (in each role Spec / Owner global lines): work the agent may **finish without Owner** under that seat. Not “everything agents do” — only clauses licensed by Absorbs (or thin Owner absorb lines). Eval `absorb_claims` should map to those clauses.

## Layout

```text
evals/
├── EVALS.md
├── evals.json
├── sessions/sample.json    # pinned ids for discover-mode prep
└── prompts/
    ├── predict.md
    └── score.md

scripts/
├── prep-crew-eval.ts       # units only
├── run-crew-eval-llm.ts    # live Grok batch predict|score
├── aggregate-crew-eval.ts
└── lib/grok-eval-parse.ts  # Grok CLI envelope → schema JSON
```

## Installed-crew package protocol

### 1. Prep (no LLM)

Discover (re-scan history):

```bash
bun scripts/prep-crew-eval.ts --crew-path ~/.agents/skills/crew --n 5 --workdir <out>
```

From an existing create-crew run (seeded fraction or count):

```bash
bun scripts/prep-crew-eval.ts --crew-path ~/.agents/skills/crew \
  --from-run <runDir> --fraction 0.5 --seed 42 --workdir <out>

bun scripts/prep-crew-eval.ts --crew-path ~/.agents/skills/crew \
  --from-run <runDir> --n 20 --seed 1 --workdir <out>
```

Use either `--n` or `--fraction`, not both. Default seed is `42`. Sampling is seeded shuffle of **kept** rows (not “first N of manifest”).

### 2. Live LLM batch (Grok CLI)

```bash
bun scripts/run-crew-eval-llm.ts --workdir <out> --phase predict --jobs 6
bun scripts/run-crew-eval-llm.ts --workdir <out> --phase score --jobs 6
```

- Idempotent: skips units that already have `prediction.json` / `score.json`.
- Executor: `grok` on PATH with `--json-schema`; parse handles CLI `text` envelopes.
- Does **not** call Orca or field multi-agent workers.

Manual per-unit sandboxes remain valid (`predict-sandbox` / `score-sandbox`).

### 3. Aggregate

```bash
bun scripts/aggregate-crew-eval.ts --workdir <out>
```

## create-crew skill cases (`evals.json`)

1. Read `evals/evals.json`.
2. For each chosen case, run a **live** agent with create-crew. Save outputs under a workspace such as `create-crew-workspace/iteration-N/<eval-name>/`.
3. Grade `expectations[]` (`passed` + `evidence`).
4. Installed-crew cases: resolve `name: crew` (`~/.agents/skills/crew`, `--crew-path`, …). If absent, stop per the expectation — no false green.
5. Package behaviour: prep → live predict → live score → aggregate.

## Expectations (examples)

- `skill/SKILL.md` has `name: crew`
- `skill/runtimes.md` has Select + Orca + Portable (package shape)
- Each completed unit has `score.json` with numeric `escalate_recall`
- Prep success is not a quality pass

## Optional stress path

Skip by default. When multi-role **fielding** under a harness is under test:

1. Pick a small multi-role combo (2–3 sessions with Evaluation combo partners).
2. INITIAL-only background; bar project sources that already contain the session outputs.
3. Run Select from `runtimes.md` (on a machine with Orca ready → Orca branch).
4. Field partners per Spec; score Owner fit from Specs still — harness failures go to `runtimes.md`, not role Specs.
5. Record narrative under the eval workdir or run `validation/` / method notes. Stress metrics never replace primary precision/recall.

## Pass

A case passes only after a live run when its expectations pass.  
A package aggregate passes only when `aggregate-crew-eval.ts` exits 0 on real `score.json` files.
