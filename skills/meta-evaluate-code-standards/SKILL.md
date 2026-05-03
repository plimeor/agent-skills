---
name: meta-evaluate-code-standards
description: >-
  Evaluate and improve the code-standards-gate review skill against human PR/MR
  review evidence. Use when the user asks to benchmark, score, validate,
  calibrate, or iterate code-standards-gate; compare skill findings with human
  review comments; diagnose missed findings; or decide which reusable review
  rules should move into code-standards-gate, project rules, tooling, or stay
  local. Do not use this for ordinary code review; use code-standards-gate for
  reviewing code directly.
---

# Evaluate Code Standards

Use this skill to evaluate `code-standards-gate` against human review evidence
and decide the smallest durable improvement. The goal is not to maximize finding
count. The goal is to measure whether the skill finds the same kind of atomic,
actionable issues a strong human reviewer found, then identify which skill rule,
batch plan, subagent instruction, or placement decision should change.

This skill replaces standalone standards extraction for review evidence. When
the task is only to run a code review, use `code-standards-gate`. When the task
is to evaluate, calibrate, or improve that review skill, use this skill.

## Workspace

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

## Inputs

Every evaluation needs:

- local project path
- review target: GitHub PR URL, GitLab MR URL, or local review evidence
- branch/range to review, when it is not obvious from PR/MR metadata
- current installed skill path, usually `~/.agents/skills/code-standards-gate`
- output directory for artifacts

For GitHub, use an authenticated `gh` session. For GitLab, use `glab` with an
authenticated session or `GITLAB_TOKEN`. Do not paste tokens into artifact
files.

If the user asks to extract standards from conversation history instead of a
PR/MR, collect the relevant user corrections, concrete before/after examples,
and explicit boundaries. If the relevant conversation is not in context, ask for
the excerpt or session pointer before extracting.

## Collect Human Review Evidence

Use hosted review tools as the source of truth when available. Store raw output
first, then normalize it. Never compare directly from terminal output.

For GitHub, collect PR metadata and review comments:

```bash
gh pr view "$PR_URL" \
  --json url,number,title,body,state,baseRefName,headRefName,baseRefOid,headRefOid,files,reviews,comments \
  > human-review/pr.json
```

Collect inline review threads with GraphQL. Fill `OWNER`, `REPO`, and
`PR_NUMBER` from the PR URL or `pr.json`.

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
truncating. Record unresolved and outdated state, but do not automatically
discard outdated comments; sometimes they still reveal durable standards.

For GitLab, collect MR metadata, discussions, notes, and changed files:

```bash
glab api "projects/$PROJECT_ID/merge_requests/$MR_IID" \
  > human-review/mr.json

glab api "projects/$PROJECT_ID/merge_requests/$MR_IID/discussions" \
  --paginate \
  > human-review/discussions.json

glab api "projects/$PROJECT_ID/merge_requests/$MR_IID/notes" \
  --paginate \
  > human-review/notes.json

glab api "projects/$PROJECT_ID/merge_requests/$MR_IID/changes" \
  > human-review/changes.json
```

Normalize human review into atomic findings:

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

## Run code-standards-gate

Run the review from the local project path so local rules, dependencies, and
diff context are real. Use the installed skill, not only the repository copy,
when testing actual Codex behavior.

```bash
codex exec \
  --sandbox danger-full-access \
  --output-last-message "$CASE_DIR/skill-run/final-review.md" \
  "Use the installed skill code-standards-gate from ~/.agents/skills/code-standards-gate. Review $PROJECT_PATH for the same PR/MR diff. Do not edit files. Follow the skill exactly: plan batches by association and risk, launch exactly one independent subagent or isolated child session per batch, save each batch output under $CASE_DIR/skill-run/batches, preserve atomic findings, report raw count, final count, and dropped/merged findings, and include the final inventory map. Write the final output in the user's primary language."
```

If the local branch is not already checked out to the target head, first create
or checkout a local worktree that matches the PR/MR head commit. Record the
exact commit in `skill-run/run-metadata.md`.

The skill output should include:

- batch plan and subagent count
- one batch output per batch
- raw batch finding count
- final finding count
- dropped or merged finding reasons
- final inventory map
- final findings with stable ids

## Normalize Skill Findings

Create `skill-run/skill-findings.md` using the same atomic finding shape as
`human-findings.md`:

```text
S01 title
- source: skill final finding id and batch finding id
- file/line: path:line when available
- issue: what the skill objected to
- why: standard behind the objection
- expected correction: smallest code/spec/test change implied by the finding
- category: contract | type-shape | persisted-state | parse-rewrite | wrapper | generated-output | tests | package | other
```

Do not normalize broad theme findings as one issue if they imply several
independent edits. Split them before scoring, and note that the final synthesis
lost granularity.

## Compare Reviews

Create `comparison/mapping.md`.

For each human finding, assign one status:

- `matched`: skill found the same issue with the same or stronger correction
- `partial`: skill found the area but missed an important surface, reason, or correction
- `missed`: skill did not find it
- `not-reviewable`: human finding depends on private intent or context not present in the PR/MR, local repo, or comments
- `out-of-scope`: outside the requested review boundary

For each skill-only finding, assign one status:

- `valid-extra`: valid issue not present in human review
- `weak-extra`: plausible but lower-confidence or lower-value issue
- `invalid-extra`: incorrect, contradicted by code, or outside scope
- `duplicate`: same issue as another skill finding

Use this table:

```text
| Human ID | Skill ID | Status | Category | Notes |
|---|---|---|---|---|
| H01 | S03 | matched | persisted-state | Same field and same deletion correction. |
| H02 | S07 | partial | wrapper | Found URL rewrite but missed native-owner failure boundary. |
| H03 | - | missed | tests | No tests batch reviewed this failure path. |
```

Then summarize skill-only findings:

```text
| Skill ID | Status | Category | Notes |
|---|---|---|
| S12 | valid-extra | package | Reproduced packed install failure. |
| S18 | weak-extra | generated-output | Valid but likely follow-up, not PR-blocking. |
```

## Score

Score on useful review replacement value, not raw finding count alone.

Suggested scoring:

- `human atomic recall`: matched + 0.5 * partial, divided by reviewable human findings
- `precision`: valid skill findings divided by all skill findings, with weak extras weighted as 0.5
- `granularity`: final findings preserve atomic batch findings and do not collapse unrelated edits
- `batch discipline`: risk-ranked associated batches were created, and every batch had one independent subagent or isolated child session
- `actionability`: findings name concrete surface, evidence, why, and smallest correction

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
score_100:
```

As a rough guide:

- `90+`: close substitute for the human reviewer on this PR/MR
- `80-89`: useful with a human checker; likely catches most important issues
- `70-79`: mechanism works but misses too much or needs manual decomposition
- `<70`: not reliable enough; improve batch rules, subagent guide, or standards before trusting it

## Diagnose Misses

For every missed or partial human finding, classify the failure:

- `collection miss`: human comments were not collected or normalized correctly
- `scope miss`: skill reviewed the wrong diff, branch, file set, or local commit
- `batch miss`: files were grouped badly or reviewed in the wrong risk order
- `subagent miss`: the right batch existed but the reviewer did not inspect the relevant surface
- `synthesis miss`: batch found it but final review merged, dropped, or weakened it
- `standard miss`: `SKILL.md` lacks a reusable rule
- `guide miss`: `sub-agent.md` lacks operational instruction
- `tooling miss`: CLI/API/test execution needed to reveal the issue was not run

This diagnosis determines the optimization target. Do not edit `SKILL.md` for
collection, scope, or tooling misses unless the skill itself caused them.

## Recommend Placement

When review evidence suggests a lasting rule, recommend the smallest durable
home:

- `code-standards-gate`: reusable cross-project code review standards,
  batching rules, output granularity rules, or subagent guidance.
- Project rules: repo-specific recurring expectations that belong in `AGENTS.md`
  or equivalent project context.
- Tooling/checks: deterministic formatting, naming, schema, or test requirements
  that the repo can enforce mechanically.
- Keep local: one-off findings, weak signals, or rules that depend on the exact
  implementation.

Do not treat every human comment as a reason to edit `code-standards-gate`.
Global rules should be durable, transferable, and useful for future review
decisions.

## Recommend Optimizations

Write `comparison/recommendations.md` with:

```text
## Keep
- Rules or batch behavior that clearly improved recall.

## Change
- Minimal changes to SKILL.md or sub-agent.md.

## Do Not Add
- Sample-specific fields, exact file names, one-off PR details, or rules that only fit this case.

## Placement
- code-standards-gate:
- Project rules:
- Tooling/checks:
- Keep local:

## Next Eval
- The next command to run.
- Expected improvement.
- Stop condition.
```

Prefer small changes:

- batch planning rules before new review standards
- output granularity rules before more examples
- `sub-agent.md` operational guidance before expanding `SKILL.md`
- scoring/reporting changes before changing review taste

## Iterate Only When Asked

If the user says to optimize, run an iteration loop:

1. Snapshot current `SKILL.md` and `sub-agent.md` under `iterations/iteration-XX/before/`.
2. Apply the smallest generalizable edit.
3. Keep `SKILL.md` under the agreed line budget.
4. Sync the installed skill if the eval runner loads `~/.agents/skills`.
5. Run the same evaluation again.
6. Save outputs under `iterations/iteration-XX/`.
7. Compare against the previous iteration and the human review.
8. Stop when the target score is reached or the next change would be sample-specific.

Each iteration summary should record:

```text
changed_files:
skill_line_count:
sub_agent_line_count:
raw_batch_findings:
final_findings:
matched:
partial:
missed:
valid_extra:
invalid_extra:
score_100:
what_improved:
what_regressed:
next_target:
```

## Stop Rules

Stop when:

- raw human review evidence has been collected or the missing evidence is named
- human review has been normalized into atomic findings
- `code-standards-gate` has run against the same review target, or the blocker is named
- skill findings have been normalized at the same granularity as human findings
- each human finding has a matched, partial, missed, not-reviewable, or out-of-scope status
- skill-only findings have valid-extra, weak-extra, invalid-extra, or duplicate status
- misses are diagnosed by failure type
- recommendations distinguish skill changes, project rules, tooling, and keep-local evidence
- no sample-specific rule is promoted into a global skill recommendation
