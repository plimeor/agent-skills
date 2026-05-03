---
name: code-evaluate-code-standards
description: >-
  Evaluate `code-standards-gate` against human PR/MR review evidence or explicit
  conversation-history corrections. Use when the user asks to benchmark, score,
  validate, calibrate, or improve the review skill; compare human findings with
  skill findings; diagnose missed review standards; or decide whether evidence
  belongs in `code-standards-gate`, project rules, tooling, or should stay local.
  Do not use for ordinary code review; use `code-standards-gate` for reviewing
  code directly.
---

# Evaluate Code Standards

## Goal

Evaluate `code-standards-gate` against human review evidence and recommend the
smallest durable improvement, without promoting sample-specific rules into
global skill behavior.

This skill replaces standalone standards extraction for review evidence. Use
`code-standards-gate` when the task is only to run a review.

## Success Criteria

A good evaluation:

- Normalizes human review evidence into atomic findings, or names the missing
  evidence.
- Runs the skill against the same review target, local commit, and requested
  boundary, or names the blocker.
- Normalizes skill findings at the same granularity as human findings.
- Classifies every human finding as `matched`, `partial`, `missed`,
  `not-reviewable`, or `out-of-scope`.
- Classifies every skill-only finding as `valid-extra`, `weak-extra`,
  `invalid-extra`, or `duplicate`.
- Diagnoses misses by failure type.
- Separates recommendations for `code-standards-gate`, project rules,
  tooling/checks, and keep-local evidence.

## Constraints

Keep all evaluation artifacts under a local workspace, for example:

```text
code-standards-gate-workspace/
  <case-id>/
    human-review/
    skill-run/
    comparison/
    iterations/
```

Do not write sample-specific findings into `code-standards-gate/SKILL.md` or
`code-standards-gate/sub-agent.md`. Use sample evidence only in evaluation
artifacts and iteration summaries.

Do not paste tokens into artifacts. If evaluating hosted review evidence, use an
authenticated `gh` / `glab` session or equivalent local credentials without
recording secrets.

Evaluation may recommend edits. Apply edits only when the user explicitly asks
to optimize or modify files.

## Required Inputs

Every evaluation needs:

- local project path
- review target: GitHub PR URL, GitLab MR URL, local review evidence, or
  conversation evidence
- branch/range when it is not obvious from PR/MR metadata
- current installed skill path, usually `~/.agents/skills/code-standards-gate`
- output directory for artifacts

Ask one narrow question only when a missing input changes target, risk,
authorization, or comparability.

## Evidence Budget

For PR/MR evidence, collect enough to identify the review target, changed files,
top-level comments/reviews, inline threads/discussions, resolution/outdated
state, and head/base commits.

Continue retrieval only when comments are truncated, the review target is
unclear, branch/head commit is missing, a human finding cannot be located, or the
user asked for exhaustive coverage.

Do not retrieve again for phrasing, background, or nonessential examples. Store
raw evidence first, then normalize it; if raw capture is impossible, record the
source and limitation.

For conversation-history corrections, collect the relevant user corrections,
concrete before/after examples, and explicit boundaries. If the relevant
conversation is not in context, ask for the excerpt or session pointer.

## Collection Recipes

For GitHub, collect PR metadata and review comments:

```bash
gh pr view "$PR_URL" \
  --json url,number,title,body,state,baseRefName,headRefName,baseRefOid,headRefOid,files,reviews,comments \
  > human-review/pr.json
```

Collect inline review threads with GraphQL:

```bash
gh api graphql \
  -F owner="$OWNER" \
  -F repo="$REPO" \
  -F number="$PR_NUMBER" \
  -f query='
query($owner: String!, $repo: String!, $number: Int!) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $number) {
      reviewThreads(first: 100) {
        nodes {
          id
          isResolved
          isOutdated
          path
          line
          originalLine
          startLine
          diffSide
          comments(first: 100) {
            nodes {
              id
              author { login }
              body
              createdAt
              updatedAt
              url
              path
              line
              originalLine
              diffHunk
              commit { oid }
            }
          }
        }
      }
    }
  }
}' > human-review/review-threads.json
```

If the PR has more than 100 threads, rerun with pagination rather than
truncating.

For GitLab:

```bash
glab api "projects/$PROJECT_ID/merge_requests/$MR_IID" > human-review/mr.json
glab api "projects/$PROJECT_ID/merge_requests/$MR_IID/discussions" --paginate > human-review/discussions.json
glab api "projects/$PROJECT_ID/merge_requests/$MR_IID/notes" --paginate > human-review/notes.json
glab api "projects/$PROJECT_ID/merge_requests/$MR_IID/changes" > human-review/changes.json
```

## Finding Shape

Normalize human review into `human-review/human-findings.md`:

```text
H01 title
- source: review thread/comment URL, comment ID, or conversation pointer
- file/line: path:line when available
- status: unresolved | resolved | outdated | discussion
- issue: what the reviewer objected to
- why: review principle behind the objection
- expected correction: smallest code/spec/test change implied by the comment
- category: contract | type-shape | persisted-state | parse-rewrite | wrapper | generated-output | tests | package | other
```

Normalize skill review into `skill-run/skill-findings.md` with the same atomic
shape and `S01` ids.

Do not normalize broad theme findings as one issue when they imply several
independent edits. Split them before scoring and note if the final synthesis lost
granularity.

## Run Skill Under Evaluation

Run from the local project path so rules, dependencies, and diff context are
real. Use the installed skill when testing actual Codex behavior.

For large or multi-surface diffs, use one isolated run per associated risk batch
when available. For small diffs, record why one run is sufficient. If local
branch state does not match the target head, create or checkout a matching
worktree and record the exact commit in `skill-run/run-metadata.md`.

The run output should preserve batch plan, raw batch finding count, final finding
count, dropped/merged finding reasons, inventory map, and stable finding ids.

## Compare Reviews

Create `comparison/mapping.md`.

Human finding statuses:

- `matched`: skill found the same issue with the same or stronger correction.
- `partial`: skill found the area but missed an important surface, reason, or
  correction.
- `missed`: skill did not find it.
- `not-reviewable`: human finding depends on private intent or unavailable
  context.
- `out-of-scope`: outside the requested review boundary.

Skill-only statuses:

- `valid-extra`: valid issue not present in human review.
- `weak-extra`: plausible but lower-confidence or lower-value issue.
- `invalid-extra`: incorrect, contradicted by code, or outside scope.
- `duplicate`: same issue as another skill finding.

Use compact tables:

```text
| Human ID | Skill ID | Status | Category | Notes |
|---|---|---|---|---|
| H01 | S03 | matched | persisted-state | Same field and same deletion correction. |
| H02 | S07 | partial | wrapper | Found URL rewrite but missed native-owner failure boundary. |
| H03 | - | missed | tests | No tests batch reviewed this failure path. |
```

```text
| Skill ID | Status | Category | Notes |
|---|---|---|
| S12 | valid-extra | package | Reproduced packed install failure. |
```

## Scoring

Score useful review replacement value, not raw finding count.

- `human atomic recall`: `(matched + 0.5 * partial) / reviewable human findings`
- `precision`: valid skill findings divided by all skill findings, with weak
  extras weighted as `0.5`
- `granularity`: final findings preserve atomic batch findings
- `batch discipline`: associated risk-ranked batches match the diff risk
- `actionability`: findings name concrete surface, evidence, why, and smallest
  correction

Use this summary:

```text
human_reviewable_findings:
matched:
partial:
missed:
not_reviewable:
out_of_scope:
skill_final_findings:
valid_extra:
weak_extra:
invalid_extra:
duplicates:
human_atomic_recall:
precision:
granularity:
batch_discipline:
actionability:
score_100:
```

Rough guide: `90+` close substitute on this PR/MR; `80-89` useful with a human
checker; `70-79` mechanism works but misses too much; `<70` needs improvement
before trust.

## Diagnose Misses

For every missed or partial human finding, classify the failure:

- `collection miss`
- `scope miss`
- `batch miss`
- `subagent miss`
- `synthesis miss`
- `standard miss`
- `guide miss`
- `tooling miss`

Do not edit `SKILL.md` for collection, scope, or tooling misses unless the skill
itself caused them.

## Recommend Placement

Use the smallest durable home:

- `code-standards-gate`: reusable cross-project review standards, batching,
  output granularity, or subagent guidance.
- Project rules: repo-specific recurring expectations.
- Tooling/checks: deterministic formatting, naming, schema, or test
  requirements.
- Keep local: one-off findings, weak signals, or implementation-specific
  lessons.

Do not treat every human comment as a reason to edit `code-standards-gate`.

Write `comparison/recommendations.md` with `Keep`, `Change`, `Do Not Add`,
`Placement`, and `Next Eval`.

## Iteration

Iterate only when the user asks to optimize. Snapshot current files under
`iterations/iteration-XX/before/`, apply the smallest generalizable edit, sync
the installed skill if the runner loads `~/.agents/skills`, rerun the same
evaluation, and compare against the previous iteration.

Stop when the target score is reached or the next change would be
sample-specific.

## Output

Minimum artifacts:

- `human-review/human-findings.md`
- `skill-run/skill-findings.md`
- `comparison/mapping.md`
- `comparison/score.md`
- `comparison/recommendations.md`

Final response should state the evaluation target, score, important misses,
recommended durable changes, validation performed, and any blockers.

## Stop Rules

Stop when the raw evidence, normalized findings, comparable skill run, mapping,
score, miss diagnosis, and placement recommendations are complete or blocked with
the blocker named.

Do not promote sample-specific rules. Do not continue searching, scoring, or
iterating after the core comparison can answer the user's request.
