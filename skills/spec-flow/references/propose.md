# propose — grill, then write the plan with its spec changes

Read with `SKILL.md`, whose Spec and Plan contracts define what gets written; this file holds the steps, the stops, and the two templates `propose` writes.

## Stops

- Each round of the interview.
- An idea that runs into a Non-goal, a `Rejected` decision, or an option a live record turned down: say so and ask whether the user is reopening it before going further.

Not a stop: pausing between the spec change files and `plan.md` to ask whether to continue. Both are written in one go.

## Steps

**1. Ground.** Look widely before asking or writing anything; what the idea depends on is often somewhere the request does not mention.
- Read the overview.
- List `docs/specs/` and `docs/decisions/` (the live set, not `superseded/`) and open every file that could bear on the idea, including ones the request does not name. Read each spec the idea touches in full, scenarios included.
- List `docs/plans/`. Another plan that changes the same spec is a conflict in the making: raise it with the user in the first round of the interview.
- Look in `docs/archive/` for earlier plans on the same feature, found by the feature's name in their `Specs:` list; they hold the reasons behind its current shape.
- Read the code that implements the feature.

**2. Grill.** Interview the user until there is a shared understanding of what is being built.
- Treat the idea as a design tree: each decision branches into the decisions that hang off it.
- Work in rounds. The frontier is every decision above the promise line whose prerequisites are settled. Ask the whole frontier in one round, numbered, each question with a recommended answer. A question that depends on another still open in this round waits for a later round.
- Ask through the host's built-in question tool when it has one (such as `AskUserQuestion` in Claude Code).
  - Each decision becomes one question; the recommended answer is the first option, marked as recommended, and the realistic alternatives are the other options.
  - Where leaving the matter to the implementation is a real choice, it is one of the options.
  - When the tool limits how many questions one call carries, split the round across consecutive calls.
  - A decision whose answer cannot be reduced to a few options is asked in plain text in the same round. Without such a tool, ask in plain text.
- Three kinds of question, three owners. The frontier holds only the second kind.
  - Facts are the agent's: anything answerable from the code, the specs, or the environment is looked up, not asked.
  - Decisions above the promise line are the user's: each is put to them.
  - Details below the promise line are the implementer's: the agent settles them while coding and writes them nowhere but the code and tests.
  - An answer of "leave it to the implementation" produces no plan text, unless silence would mislead a reader of the related requirement; then that requirement closes with an unspecified clause.
- Scope boundaries are decisions like any other. Where neighbouring work could reasonably be part of this plan (a related case, an adjacent module the change passes through, a follow-up the user mentioned), ask whether it is in. The answers that come back "no" or "later" are the plan's Out of scope; nothing else is.
- The interview ends when the frontier is empty, with no branch left silently assumed, and the user confirms the shared understanding.

**3. Write the plan directory** from what the interview settled, spec change files and `plan.md` in one go.
- Spec change files come first: one per affected spec, stating the promises being made, each sentence passing the promise test for the spec's type. A MODIFIED entry is the existing requirement block copied whole from the spec and then edited. Before writing, count the merged result against the spec budget; when it would not fit, the file carries the REMOVED entries that make it fit, each with its reason, and the report names them.
- Then `plan.md`. What changes lists the requirement names; the content stays in the change files. Design is written only when the plan contract calls for it; its decisions record what the interview chose and what it turned down.
- A question that would change the requirements, the approach, or the tasks goes back to the user. It does not become an open question in the plan.

**4. Report** the plan's path and a short summary: what changes, which specs are affected, what is out of scope. The plan is ready for implementation once the user approves it.

## Templates

### Plan — `plan.md`

```markdown
# <Feature or change>

## Why

## What changes
- `<feature>` › <Requirement name>: added | modified | removed — <reason, for a removal>

Specs:
- `<feature>` (new | modified)

## Out of scope
- <work someone would expect here, left out> — <why, or where it goes instead>

## Design

### Decisions
- <choice> — because <reason>. Turned down: <alternative>, because <reason>.

### Risks
- [<risk>] → <mitigation>

### Open questions

## Tasks

### 1. <group>
- [ ] 1.1 <task>; verified by <test, command, or observable behavior>
```

### Spec change file — `specs/<feature>.md`

```markdown
# <Feature> — spec changes
Type: feature | api | format

## Purpose

## ADDED Requirements

### Requirement: <name>
The system SHALL <one rule>.

#### Scenario: <name>
- **WHEN** <condition>
- **THEN** <expected outcome>

## MODIFIED Requirements

### Requirement: <existing name>
<full updated requirement and all its scenarios>

## REMOVED Requirements

### Requirement: <existing name>
**Reason**: <why it is removed>
```
