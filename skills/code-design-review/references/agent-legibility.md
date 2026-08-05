# Agent Legibility Review Reference

Axis question: can the newest maintainer — a coding agent with no institutional memory and a bounded context window, or a human reading cold — operate here safely and verify its own work?

Sources: emerging practice, 2024–2026; e.g. Stack Overflow, *Building shared coding guidelines for AI (and people too)* — https://stackoverflow.blog/2026/03/26/coding-guidelines-for-ai-agents-and-people-too/

## Core Model

- An agent is a maintainer with extreme versions of ordinary human limits: zero memory of past decisions, a hard working-set budget, and reliable obedience only to what is machine-checked. Design that serves it serves cold human readers too — this axis contradicts none of the others; it re-weights them toward explicitness and verifiability.
- What an agent actually obeys is what fails a check: types, tests, linters, build gates. A prose convention without enforcement is a suggestion.

## Principles

- **Machine-checkable contracts over prose conventions.** Every convention that matters should have a type, test, or lint rule that fails when violated. Ask which of the repo's stated rules would actually stop a wrong change.
- **Tests are the executable spec.** To the newest maintainer, a behavior without a test is undefined behavior — nothing marks it as intended, so nothing prevents its loss. Tests assert public behavior, not implementation details, or the spec they encode is the wrong one.
- **Self-verification is a design property.** After a change, one discoverable command should answer pass or fail. A repo whose correctness is judged by tribal knowledge or manual poking cannot be safely maintained by an agent — or by a new hire.
- **Greppable, boring, explicit.** Searchable names (no dynamically constructed identifiers), one concept one name, behavior visible at the point of use, no action at a distance via reflection, metaprogramming, or implicit registration. Cleverness that compresses text expands the working set.
- **Context is a budget.** The knowledge needed to change a surface should fit in a bounded neighborhood: the file, its imports, and written-down local rules (`AGENTS.md`, `CLAUDE.md`). Ask what must have been read to make this change without breaking an unstated rule — every unwritten rule is an unknown-unknown planted for the next maintainer.

## Weak Substitutes To Reject

- "It's documented in the wiki" — off-repo knowledge is invisible to the newest maintainer.
- "The team knows" — institutional memory is not a contract.
- Conventions enforced by reviewer vigilance instead of tooling.
