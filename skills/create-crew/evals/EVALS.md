# Create-crew evals

Quality evals follow **skill-creator**: live LLM runs on realistic prompts, then grade verifiable expectations against real outputs. Prep scripts only build inputs or aggregate scores.

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
| **crew package** (new run or installed) | On real sessions, does blind use of the package match Owner escalate behaviour? |

## Layout

```text
evals/
├── EVALS.md
├── evals.json
├── sessions/sample.json    # pinned real session ids for package evals
└── prompts/
    ├── predict.md
    └── score.md
```

```bash
bun scripts/prep-crew-eval.ts --crew-path <crewDir> --n 5
bun scripts/aggregate-crew-eval.ts --workdir <evalRoot>
```

## Executor steps

1. Read `evals/evals.json`.
2. For each chosen case, run a **live** agent with create-crew. Save outputs under a workspace such as `create-crew-workspace/iteration-N/<eval-name>/`.
3. Grade `expectations[]` (`passed` + `evidence`).
4. Installed-crew cases: resolve a directory with `SKILL.md` `name: crew` (`~/.agents/skills/crew`, `--crew-path`, …). If absent, stop per the expectation.
5. Package behaviour on sessions: prep → blind predict agents → score agents → aggregate. Report numbers.

## Expectations

Checkable from artifacts and transcripts, for example:

- `skill/SKILL.md` has `name: crew`
- `skill/runtimes.md` has Select + Orca + Portable
- Each completed unit has `score.json` with numeric `escalate_recall`
- The answer does not treat prep success as quality success

## Installed crew

User: “用当前安装的 crew 跑 evals”.

Resolve the package, run the live protocol (or case `eval-installed-crew-live` in `evals.json`), report metrics or FAIL.

## Pass

A case passes only after a live run when its expectations pass.  
A package aggregate passes only when `aggregate-crew-eval.ts` exits 0 on real `score.json` files.
