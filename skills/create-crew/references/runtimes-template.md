# Runtimes

Fielding contract for the mounted crew. Judgment stays in `SKILL.md` and `roles/`; this file only says how to run workers under the current harness.

Copy into the package as `skill/runtimes.md`. Do not thin either branch for the builder machine. Selection happens when the user invokes crew.

## Select

Run `orca status --json`. If Orca is installed and the runtime reports ready, use **Orca**. Otherwise use **Portable**.

## Orca

- **Lead** is the main session: route, field roles, synthesize. Do not hand routing to a child.
- **Field a role** as an isolated worktree worker or a supervised worker. Inject Owner constraints from `SKILL.md` plus that role Spec only — not the full Role index tree.
- **Absorbs**: the worker finishes through `worker_done` without Owner.
- **Escalates**: use orchestration escalation or a decision gate. The worker must not self-decide Owner-owned matters.
- **Evaluation combos**: start partner roles in parallel, then barrier at the lead for synthesis.
- **Non-role help** from a worker: orchestration ask / reply to the lead. Do not invent a shared dump directory.
- **Full handoff** (new worktree, stop supervising) only when the user explicitly transfers ownership. That is not the default crew path.
- Prefer the live `orca-cli` and `orchestration` skill guides over memorized flags.

## Portable

- **Lead** creates a private root for this fielding only, under the current session cwd:

  `<session-cwd>/.crew-dispatch/<invocation-id>/`

  `invocation-id` is opaque and unique. Pass the absolute path as `DISPATCH_ROOT` in each worker brief. Never use a fixed global folder shared across sessions.

- **Worker** writes only:

  `<DISPATCH_ROOT>/<role-id>-<slug>.md`

  The worker must not read or list other invocations under `.crew-dispatch/`.

- Worker reports a `Dispatch requests (for lead only)` table (path under `DISPATCH_ROOT`, purpose, suggested type). The lead may refuse; results return via the lead. The lead deletes this invocation’s root when the crew turn ends.
