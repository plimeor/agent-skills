---
name: reconsider
description: "Use before finalizing a non-trivial answer, recommendation, review, or decision to reconsider it and raise its quality, especially when shallow reasoning, context inertia, false framing, overconfidence, unfit analogy transfer, or an obvious-but-missed defect could distort the result. Trigger especially before applying external evidence, familiar frameworks, or comparisons to the user's specific request, and when the user asks to reconsider, double-check, take a second look, or sanity-check an answer."
---

# Reconsider

## Goal

Produce answers that survive scrutiny before they are delivered. The answer should address the current question, resist stale context and misleading frames, separate evidence from inference, and expose uncertainty when it changes the decision.

This improves judgment before responding; it is not permission to expand the user's requested work.

## Success Criteria

A good reconsider pass:

- Answers the current request, not an older thread goal or the assistant's momentum.
- Distinguishes observed facts, source-supported conclusions, memory-derived clues, inferences, and value judgments when trust depends on the distinction.
- Finds the most likely failure mode before output: missing decisive evidence, false premise, overconfident claim, ignored counterexample, wrong scope, or contradiction.
- Surfaces the strongest decision-relevant conclusion before lower-cost mitigations, workarounds, or compromise paths.
- Uses external evidence, tools, or independent scrutiny when intrinsic self-correction would be too weak.
- Keeps the final answer no larger than the user's request requires.

## When To Use

Use this skill for non-trivial explanations, recommendations, critiques, decisions, final answers after long work, and when the user asks for careful thought, skepticism, reconsideration, a second look, sanity checking, or an answer that can withstand scrutiny.

Consider independent scrutiny when:

- the conversation context is large, compressed, or full of previous attempts
- the main agent has already drafted a conclusion and may be anchored to it
- the user explicitly asks for deep consideration, careful scrutiny, or a second look
- a wrong answer would materially affect code, public claims, operational decisions, money, safety, or user trust
- the answer depends on interpreting ambiguous or conflicting evidence

Skip this skill for one-line factual answers, simple commands, mechanical formatting, or tasks already covered by a more specific deterministic validation workflow.

## Evidence Ladder

Use the strongest evidence needed for the answer's risk:

1. User-provided facts.
2. Memory or prior thread context.
3. Current local files, command output, logs, screenshots, or tool results.
4. Current authoritative external sources.
5. Authorized independent review from a subagent or separate session.

Treat memory and prior context as clues, not proof, unless verified this turn. If a fact could have changed and correctness matters, refresh it from the most direct source; if refresh is impossible or out of scope, label the claim unverified and state what would change the conclusion.

## Pre-Answer Gate

Before answering, run this pass:

1. **Reset the request.** Identify what the user is asking now. Drop older goals and prior drafts that are not part of the latest request.
2. **Choose verification level.** Decide whether the answer only needs local sanity checking, source/tool verification, or independent scrutiny. When a wrong answer is high-cost or context-inertia risk is high, restating the draft's own reasoning or asserting confidence does not count as verification; use external evidence, a tool result, or independent scrutiny.
3. **Locate evidence.** Mark which claims come from observed facts, cited sources, memory, user statements, or inference.
4. **Challenge the frame.** Check whether the question assumes an unproven fact, imports stale context, or forces a false binary.
5. **Attack the answer.** Ask one to three targeted challenge questions against the most likely failure mode:
   - Am I leading with a cheaper compromise while a stronger evidence-backed conclusion should come first?
   - Am I preserving prior work, current implementation, or conversational momentum instead of answering the current question?
   - Am I hiding uncertainty or judgment strength behind pragmatic wording?
6. **Tighten output.** Remove generic background, decorative options, and claims that do not help answer the current request.

## Independent Scrutiny

When context is large or inertia risk is high, prefer an independent challenger before finalizing. Use `agent-handoff` to delegate the challenger; if it is not worth the overhead, run the same challenge locally and record the skip reason only when it affects confidence.

When a sub-agent is used, isolate it from the main thread's conversation where the host supports it, so the subagent receives the normal system and project context plus the task packet, but not the main thread's full conversation history or draft bias. Do not describe this as a completely clean context: global instructions, project rules, workspace state, and tool definitions may still be visible.

Give the subagent only:

- the current user question
- the minimum evidence needed to evaluate the answer
- the intended output contract
- the specific failure modes to look for

Avoid giving the subagent the main agent's conclusion unless the task is explicitly to review a draft. For draft review, ask it to identify unsupported claims, stale assumptions, missing evidence, false frames, and the strongest counterargument.

Use a separate `codex exec --ephemeral` or equivalent isolated run only when a stricter blind review justifies the added cost and lost session affordances.

## Output

The final answer should usually be direct prose. Do not show long chain-of-thought. Show the result of the check only when it helps the user trust the answer:

- `Observed:` facts inspected in this turn.
- `Inference:` conclusions drawn from those facts.
- `Unknown:` missing facts that could change the answer.
- `Recommendation:` the chosen path and why.
- `Scrutiny:` what an independent subagent or separate check challenged, if one was used.

If the frame was wrong, correct it briefly before answering. If the answer is uncertain, lower confidence instead of smoothing over the gap.

When a high-cost conclusion and a compromise path both exist, state the conclusion first, then label the compromise path and its tradeoffs separately.

## Stop Rules

Stop when:

- the current request is separated from stale context
- evidence and assumptions are clear enough for the answer's risk level
- the strongest obvious objection has been handled or disclosed
- independent scrutiny was used or explicitly skipped with reason when context inertia risk is high
- the output is no larger than the request requires

Do not keep searching, caveating, or spawning agents after the answer is sufficiently defensible.
