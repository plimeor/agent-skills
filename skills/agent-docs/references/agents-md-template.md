# AGENTS.md Template (annotated)

Reference for the `agent-docs` skill. Read this when creating a new AGENTS.md or
restructuring an existing one. The HTML comments are maintainer notes designed to
travel with the file — Claude Code strips block-level HTML comments from memory
files before injection (documented in its memory docs), so they cost nothing
there. Other harnesses, like Codex CLI, read AGENTS.md raw: when non-Claude
agents are primary consumers, keep committed comments terse or leave the notes
in this template. Every rule bullet below is a placeholder from a fictional
project; replace all of them.

---

```markdown
<!-- ==========================================================
HOW TO USE (maintainer notes; stripped before injection).

Philosophy this template encodes:
1. AGENTS.md is the ONLY durable agent-facing artifact. Plans /
   requirements / tasking docs are deleted when work completes;
   durable residue is distilled here as one-line earned rules.
   There is no separate decision ledger — decisions live here as
   current-state rules; git history of this file is the audit trail.
2. Every line must pass FOUR admission tests:
   - Earned: traceable to an observed trigger — an explicit user
     or team decision, the same mistake twice, a review-caught
     miss, a re-typed correction, or context a new teammate would
     genuinely need. Never speculative.
   - Non-derivable: the agent could NOT reconstruct it by reading
     the code — official guidance says to leave derivable content
     out (ETH Zurich 2602.11988 measured why: redundancy hurts).
   - Universal: it applies to essentially every session at this
     scope. Conditional content -> nested AGENTS.md, skill, linked doc.
   - Removal test: "Would removing this cause the agent to make
     mistakes?" If not, cut it.
3. Budget: start 30-50 lines; steady state 60-150; ceiling ~200.
   Bloat causes silent non-adherence, not an error.
4. Never commit LLM-generated content unedited (/init output is a
   draft — LLM-generated context files measured net-negative on
   task success, ETH 2602.11988; hand-edited files helped).
5. This file is advisory context, not enforcement. Must-happen
   behavior goes to CI; linter-enforceable style goes to the
   linter config, never prose here.

Interop: this file is canonical. CLAUDE.md contains one line:
    @AGENTS.md
plus an optional Claude-specific section, or symlink it
(ln -s AGENTS.md CLAUDE.md) when nothing Claude-specific exists.

Provenance: date each earned rule in an adjacent HTML comment on
its own line, e.g. <!-- added 2026-07 after prod-migration incident -->,
so the audit knows why it exists — free in Claude Code, terse
everywhere else (non-Claude agents read comments raw).
=========================================================== -->

One sentence on what this project is and its stack with versions.
<!-- e.g. "Next.js 14 e-commerce app (App Router, TypeScript strict,
Prisma, Stripe)". One line only. NOT an architecture overview —
overviews are measured dead weight (ETH 2602.11988: no navigation
benefit; Augment: -25% completeness from exploratory reading). -->

## Critical rules

<!-- 3-7 items max, at the top of the file (earlier lines carry
more weight in practice; emphasis dilutes if overused). Every
NEVER must be paired with a concrete DO alternative — warning-only
rules measured 20% less complete output (Augment). If a rule here
is zero-tolerance, ALSO enforce it with CI; prose alone is
probabilistic. -->

- NEVER run `npm run build` during a session — it swaps `.next/` to
  production assets and kills hot reload. Use `npm run dev`.
- NEVER generate database migrations unless explicitly asked;
  propose the schema change and stop.
- NEVER commit `.env*` files or secrets. Config docs: link, don't paste values.

## Commands

<!-- Highest-leverage section: naming a tool massively increases
adoption (ETH study: `uv` used 1.6x/instance when named vs <0.01
unnamed — ~160x, measured for that one tool). Name tools
NEGATIVELY and exactly — agents default to the ecosystem-standard
tool otherwise. Exact commands with flags; one line each on what
it does when non-obvious. Agents will actually execute checks
listed here before finishing. -->

- Package manager: `pnpm` (not npm, not yarn)
- Dev server: `pnpm dev` (port 3000)
- Typecheck: `pnpm typecheck`
- Lint: `pnpm lint --fix`
- All tests: `pnpm test`
- One test file: `pnpm vitest run <path>`
- Before committing: `pnpm lint && pnpm test`

## Conventions

<!-- ONLY deltas from language/framework defaults the model already
knows. One real code example beats three paragraphs of prose. If a
linter can enforce it, put it in the linter config and delete the
line here. -->

- Named exports only; no default exports.
- Errors: throw `AppError` from `src/lib/errors.ts`; never throw strings.
- Server data access goes through repositories in `src/db/repos/` —
  never call Prisma client directly from route handlers.

## Architecture boundaries

<!-- Max ~10 lines. Boundaries and non-obvious ownership, NOT a
directory tour (file-by-file descriptions are measured dead
weight — ETH 2602.11988 — and go stale). Prefer pointers (path
or file:line) over copied snippets. -->

- API handlers: `src/api/handlers/`; shared HTTP client with retry
  middleware: `src/lib/http.ts` — use it, don't instantiate clients.
- `src/generated/` is codegen output — never edit by hand;
  regenerate with `pnpm codegen`.
- Payments logic is isolated in `src/billing/` — changes there
  require the test suite in `src/billing/__tests__/` to pass.

## Testing

- Runner: Vitest (not Jest). Integration tests need
  `docker compose up -d db` first.
- New logic in `src/billing/` requires a regression test in the
  same PR.

## Git & PR etiquette

<!-- Repo etiquette the agent can't guess: branch naming, commit
format, PR expectations. -->

- Branch: `feat/<slug>` or `fix/<slug>` off `main`.
- Conventional commits (`feat:`, `fix:`, `chore:`).
- PR title: `[web] <Title>`; run `pnpm lint && pnpm test` before
  pushing.

## Decisions & gotchas (earned)

<!-- The distillation target. When ephemeral work docs (plan /
requirements / tasking) are deleted at completion, any durable,
non-derivable residue lands here as a one-line current-state rule
with a one-line WHY. Superseded rules are EDITED IN PLACE or
deleted, never appended-to — git history is the ledger. Date via
HTML comment. If this section outgrows ~15 lines, promote clusters
to a nested AGENTS.md or a skill. -->

- Product images live in Cloudinary, not the repo — upload via
  `pnpm upload-asset`.
  <!-- added 2026-03: agents kept committing binaries -->
- Stripe webhooks must verify signatures via `verifyStripeSig()`;
  raw body required, so the route disables the JSON body parser.
  <!-- added 2026-05: incident — parsed body broke signature check -->
- We stay on Prisma 5.x until the JSON-protocol perf regression is
  fixed upstream — do not bump.
  <!-- added 2026-06; recheck quarterly. The pin and its why are the
  rule; a bare version number alone would be prohibited trivia. -->

## Deeper references

<!-- Progressive disclosure: pointers, not copies. Files linked
from AGENTS.md get 90%+ agent discovery; orphan docs folders get
<10%. Anything procedural or sometimes-relevant lives out here or
in a skill, not above. -->

- Deploy runbook: `docs/deploy.md`
- Billing domain rules: `src/billing/AGENTS.md`
- DB schema conventions: `docs/schema-conventions.md`

<!-- ==========================================================
MAINTENANCE CONTRACT (for the humans/skill governing this file):
- Add: only on the earned triggers (see admission tests above).
  Additions go through the same PR that changes the convention
  when possible.
- On every add: scan for an existing rule on the same topic and
  resolve conflicts in the same edit — contradictions fail silently
  (the model picks one arbitrarily and never flags it).
- Prune: periodic per-line audit: still true? exercised recently?
  agent already does it without the rule? linter/CI could own it?
  If any answer says so, delete or move.
- Diagnostic: a rule that keeps being violated means the FILE IS
  TOO LONG (prune) or phrasing is ambiguous (rewrite) — not that
  you need another rule or more emphasis.
- Validate edits empirically: behavior must actually shift.
- Review the whole file after major model releases (rules written
  for today's models can constrain tomorrow's).
=========================================================== -->
```

---

## Section skeleton at a glance

| Section | Budget | Content class |
|---|---|---|
| One-line project statement | 1 line | what + stack with versions; never an overview |
| Critical rules | 3–7 bullets | zero-tolerance NEVERs, each paired with a DO |
| Commands | ~7 bullets | exact commands, tools named negatively |
| Conventions | a few bullets | deltas from defaults only; one real example beats prose |
| Architecture boundaries | ≤10 lines | ownership and boundaries as pointers, no directory tour |
| Testing | 2–4 bullets | runner, single-test command, required setup |
| Git & PR etiquette | 2–4 bullets | branch/commit/PR conventions |
| Decisions & gotchas (earned) | ≤15 lines | distillation target; one-line current-state rules + one-line why |
| Deeper references | pointers only | linked docs, nested AGENTS.md, runbooks |
