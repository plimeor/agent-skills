# AGENTS.md Template (annotated)

Reference for the `agent-docs` skill. Read this when creating a new AGENTS.md or
restructuring an existing one. The section comments are authoring notes: Claude Code
strips block-level HTML comments from memory files before injection, but Codex CLI
and others read AGENTS.md raw, so keep whatever you commit terse and leave the rest
here. Every rule bullet is a placeholder from a fictional project; replace all of them.

The admission tests, the budget, and the edit contract live in the skill, not here —
this reference carries file shape only.

---

```markdown
<!-- ==========================================================
AGENTS.md is canonical. CLAUDE.md holds one line, @AGENTS.md,
plus an optional Claude-specific section — or is a symlink
(ln -s AGENTS.md CLAUDE.md) when nothing Claude-specific exists.

Every rule here is earned and current-state. Date each one in an
adjacent HTML comment on its own line, in the form shown beside
the earned rules below. Supersede by editing in place or by
deleting, never by appending a correction next to the old rule;
git history of this file is the ledger.
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
with a one-line WHY. If this section outgrows ~15 lines, promote
clusters to a nested AGENTS.md or a skill. -->

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
