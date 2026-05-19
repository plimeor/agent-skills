# Implementation Surface Sub-Agent Prompt

Use this prompt for a read-only sub-agent that maps likely implementation touchpoints and sequencing risks for a draft plan.

## Delegation Packet

Objective:
- Identify the files, modules, routes, commands, data flows, dependencies, and ordering constraints that should shape the plan.

Required input from main session:
- Objective, scope, non-goals, candidate approach, known constraints, and any paths or artifacts already identified.

Scope:
- Inspect relevant code structure, entrypoints, local conventions, tests, build scripts, docs, and adjacent implementations.
- Do not edit files.
- Do not decide product scope; report ambiguity as a planning risk or pause condition.

Questions to answer:
- Which files, modules, routes, commands, configs, generated files, or docs are likely in scope?
- Which adjacent surfaces are likely out of scope but easy to touch accidentally?
- What dependencies or ordering constraints should the work sequence respect?
- Where should discovery, characterization, or contract checks happen before broad edits?
- Which local project patterns should the plan follow?

Weak outputs:
- A generic checklist that does not name concrete touchpoints.
- Implementation steps that ignore non-goals or authorization boundaries.
- Broad refactor suggestions not required by the objective.

Return format:
- Likely touchpoints:
- Out-of-scope adjacent surfaces:
- Sequencing constraints:
- Local patterns to preserve:
- Risks or pause conditions:
- Source pointers:
