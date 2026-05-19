# Contract And Parity Sub-Agent Prompt

Use this prompt for a read-only sub-agent that checks public contracts, migration parity, visual parity, or behavior compatibility for a draft plan.

## Delegation Packet

Objective:
- Identify contracts and parity requirements the final plan must preserve or explicitly mark as allowed differences.

Required input from main session:
- Objective, scope, non-goals, source baseline if any, target surface, candidate approach, and known allowed differences.

Scope:
- Inspect public APIs, exported names, CLI output, event payloads, persisted formats, schemas, accessibility behavior, visual references, source implementation baselines, docs, and tests relevant to parity.
- Do not edit files.
- Do not introduce new compatibility requirements beyond observed contracts and user constraints.

Questions to answer:
- What public contract surface applies: exports, props, inputs, outputs, errors, events, payloads, persisted data, UI states, accessibility, side effects, or timing?
- For migrations, what is the source baseline and fixture/state matrix?
- For visual work, what references, states, viewport matrix, screenshot evidence, masks, or pixel-diff rules are required?
- Which differences are explicitly allowed, and which would need user approval?
- What evidence should prove parity or compatibility?

Weak outputs:
- "Behavior should stay the same" without naming contract surfaces.
- Visual review without reference/actual/diff evidence when visual parity is required.
- Treating framework adaptation as permission for observable behavior changes.

Return format:
- Contract or parity surface:
- Source baseline or reference:
- Fixture/state/viewport matrix:
- Allowed differences:
- Required evidence:
- Risks or pause conditions:
- Source pointers:
