# Stage 3 — Role Inference

Input: `signals/` + `signals-manifest.md` + `census/census.md` + the open-schema control conclusions in `signals/_open-schema/`.
Output: `roles.md` (the deliverable: role definitions and usage only) + `roles-method.md` (method, residuals, limitations, validation record) + `roles-evidence.md` (citation provenance).

## 3.0 The deliverable must be clean: no IDs, no turn numbers in `roles.md`

`roles.md` is the file that **gets pasted into agent configuration and read repeatedly by humans**. It must contain **no session IDs, no turn numbers `[n]`, and no inline evidence anchors**.

- **Keep the quotes** — a citation is the substance of the conclusion, not an audit trace. Write it out.
- **Move the provenance** — each citation's `session_id + turn number` goes into `roles-evidence.md`, joined on **the quoted text itself**.
- **No inline anchors** (`[E12]`, "see evidence 3", `AD-07`). An inline index is itself a patch-style audit trace — the same class of problem it is trying to solve.

Three reasons, none of which alone would justify the rule:

1. **Readability**: a deliverable with a UUID and a bracketed number every other line forces the reader to step over noise to reach the clause.
2. **Stage 4 depends on it**: the replay agent **must** read `roles.md`. IDs plus turn numbers directly expose the identity and key moments of the session being replayed — **this leak has already voided an entire replay round**. A clean deliverable is what makes a blind replay possible, and it removes the need to build a de-identified copy downstream (which is itself a patch).
3. **Traceability is not lost**, only relocated. `roles-evidence.md` and `roles.md` correspond one-to-one; audit reads both together.

`roles-evidence.md` structure:

```markdown
| Quote (may be truncated; must match uniquely) | session | turn | section of roles.md |
```

**In `roles.md`, `「」` is reserved for verbatim quotes** — one quoted span per row in the evidence table. If the same quote is reused in several sections, write one row per section. Emphasis, enumeration, and template placeholder text use backticks or bold instead, never `「」`. The join check runs per `「」` span, so mixing the two usages destroys the meaning of the "no provenance found" signal.

## 3.1 Writing contract (applies equally to `roles.md` and `roles-method.md`)

**All three artifacts describe a stable target state, never a revision history.** This governs how every section is written, not just the limitations section.

Forbidden forms: "formerly X, now Y", "originally named …", "removed", "deprecated", "~~struck through~~", "revised accordingly", "(added after replay)", "(missing from the original document)", and any changelog-shaped section. They record the editing process rather than the current conclusion, and they accumulate into noise across versions.

- Write the **basis** for a ruling — it is part of the conclusion. Do not write the **history** of the ruling.
- Disposition records have dedicated homes: the residual list (§3C) and the validation record in `roles-method.md`.
- **If something upstream is wrong, go fix it upstream.** Do not add a downstream note explaining what upstream got wrong. The downstream note is itself the patch.

Observed risk point: **a section that records "what was done and what wasn't verified" naturally grows into changelog shape.** When writing that kind of section, check each sentence — is this describing the current state, or my editing process?

## 3A. Decision and friction pattern extraction

From the signals, first derive four lists (each entry backed by ≥1 session):

1. **Decision types the Owner must rule on personally** (with the archetypal forms found in the corpus)
2. **Questions that drain judgment the most / trigger irritation** (anger points)
3. **High-frequency correction directions toward the agent** (wanted / unwanted / relatively tolerated — "relatively tolerated" must also cite delegation evidence from `census.md`, and may not come only from high-friction sessions)
4. **Stable phase transitions** (the recurring in-session phase sequence and the hard signals that mark each switch)

## 3B. Cluster into roles (4–7)

- A role is a **recurring judgment function**, not a pipeline station name and not the proper name of a repository or tool.
- Each role definition: core responsibility / typical trigger / absorbs autonomously / escalates to human / success criteria / ≥2 corpus examples (**quotes only, provenance goes to `roles-evidence.md`**, see §3.0).
- **The Owner (the user) is always outside the system**: irreversible preferences, authority conflicts, scope, public-facing form, and sign-off belong to the human and are not made into an agent.
- **Phase-type annotation (mandatory)**: label each role `batch` or `dialogic`.
  - Batch: the goal is to compress Owner turns (a full decision packet ruled on in one page, a checklist completed in full).
  - Dialogic: the goal is not fewer turns but higher quality per turn — it must survive chained interrogation, produce demos, stay self-consistent across turns, and be interruptible when complexity grows. Design/shaping functions are almost always dialogic in real corpora; writing one up as "produces a proposal in one pass" fails immediately in deployment.

## 3C. Residual accounting (mandatory, never skipped)

After clustering, walk **every high-value signal** once more: each session either maps to ≥1 role (as a role example or trigger) or goes into the "residual list" section of `roles-method.md`:

```markdown
## Residuals (high-value, unbucketed)
| Judgment axis involved | Why no existing role holds it | Disposition |
```

The residual table also carries no session IDs (§3.0) — which session lands on which residual axis is recorded in `roles-evidence.md`.

- ≥3 sessions residual on the same judgment axis → that axis is a **candidate new role**, and the decision must be explicit: add a role / extend an existing definition / record as out-of-domain with a stated reason.
- Divergence axes found by the open-schema control (stage2 §2B) also enter this table.
- A descriptive conclusion that silently discards non-conforming high-value samples is a fidelity defect. The residual list exists to prevent exactly that.

## 3D. Three artifacts, split by reader

**`roles.md` carries only "how to do the work". Methodology, audit chains, and validation records stay out.**

Test: **would someone deploying these roles do the wrong thing without this section?** Yes → keep it in `roles.md`. No → move it out.

| Artifact | Contents | Reader |
|------|------|------|
| **`roles.md`** | The four lists (3A), raw role definitions, generic role definitions and shared constraints, collaboration order and minimal orchestration, pasteable prompt skeletons, the "known limits" block at the top | People who will **use** these roles |
| **`roles-method.md`** | Evidence tiers, measured biases, decision-persona summary, residual list (3C), distillation-principle table, raw→generic mapping, coverage and limitations (3E), Stage 4 replay results | People who will **audit** these roles |
| **`roles-evidence.md`** | Session + turn for every citation (§3.0) | People who will **check** provenance |

Skipping this split produces an outcome already observed in practice: the methodology prose outgrows the role definitions themselves — in one real run, "coverage and limitations" took 21% of the file, more than all raw roles combined.

`roles.md` still has two layers internally; they coexist and do not override each other:

- **Part 1 (descriptive)**: raw roles from this corpus only. May be coupled to the corpus's dominant scenario; naming may follow corpus-specific stations. Contains the four lists of 3A plus role definitions.
- **Part 2 (normative)**: generic roles distilled across domains. Contains generic role definitions and shared constraints, generic collaboration order and minimal orchestration, and pasteable prompt skeletons.
- Naming principles: short parallel terms, self-evident phase, domain-neutral (no specific repository or process proper names); each generic role must point back to raw roles (one-to-many, traceable).
- Merging two raw roles requires a stated basis (usually "the same type of question escalates to the human") and a note on the sub-patterns that could be split apart again — **the basis goes in `roles.md`, the mapping table in `roles-method.md`**.
- The evidence-tier declaration (L0 → L1 → L2–3 → L4 → L5, where L5 covers Owner rulings that are not pure observation) goes in `roles-method.md`.

## 3E. Coverage and limitations (written in `roles-method.md`)

`roles-method.md` states honestly: what was read, what was not (e.g. `cleaned/` not read end-to-end), that value/intervention labels are heuristics, how far the open-schema control converged, and how residuals were dispositioned. **Name the unverified scope explicitly; do not paper over it with a tone of completeness.**

**Mandatory item — corpus self-reference**: read `inventory/self-referential.md` and state whether self-reference filtering was on this round, how many sessions it dropped, **and how many hit a marker but stayed below threshold and therefore remain in the analysis set**; if hit sessions remain in the analysis set, state how many and how often they were cited, **with the specific identities carried by `inventory/self-referential.md` and `roles-evidence.md`** (§3.0: IDs stay out of `roles.md`). Rationale: these sessions let the pipeline rediscover its own framework inside its own output, and **the reader is entitled to know how much of the conclusion was discovered versus restated**.

### The "known limits" block at the top of `roles.md` (mandatory, ≤6 lines)

Moving the limitations elsewhere **does not** mean the deployer gets no error bars. This output is used to configure agents that act on the user's behalf, and a confident-looking role spec with no boundary annotations is a direct source of overreaching agents.

So `roles.md` must open with a short block containing **only the numbers that change a deployment decision**, one per line, pointing at `roles-method.md`:

```markdown
**Known limits** (basis in `roles-method.md`)
- Escalation precision ≈N%, recall ≈N%: these roles will ask about things you don't care about, and miss things you do
- Absorbable rate ≈N%: it won't save you many turns; the gain is fewer mistakes, not fewer questions
- <which role/clause is not yet replay-tested>
- <the largest known uncertainty this round>
```

With no replay run, write "not replay-tested". Leaving it blank is not allowed, and neither is glossing it with phrases like "continuously improving".

## 3F. Pre-delivery self-check (mandatory; memory does not substitute)

```bash
bun scripts/pipeline.ts lint-roles --run <run>
```

Every rule above is the kind an LLM drops — **in a real run, the rule was written into this document in the morning and violated by its own author the same afternoon**. So a script must sweep the artifacts before delivery; a non-zero exit means the work isn't finished. Checks and the clauses they enforce:

| Check | Clause | Typical miss |
|---|---|---|
| `session-id` | §3.0 | **Bare 8-hex IDs** (`33be3f1c`) — searching only for `claude_`/`grok_` prefixes misses them |
| `turn-ref` / `inline-anchor` | §3.0 | `[115]`, `[E12]`, "see evidence 3" |
| `patch-style` | §3.1 | Parentheticals hung on headings, e.g. "(added after replay, missing from the original document)" |
| `dangling-section` | — | A `§12` reference survives an artifact split after that section is gone |
| `subsection-parent-mismatch` | — | `### 11.1` sitting under `## §7`; a renumbering that only got half done |
| Known-limits block | §3E | Missing, or grown past 6 lines |
| Quote join | §3.0 | A quote in `roles.md` with no matching row in `roles-evidence.md` |

Results land in `inventory/lint-roles.json`. The only false positives possible come from `「」` used as an emphasis mark — fix the writing, not the check.

Once the write-up is done and lint passes, proceed to Stage 4 replay validation (`references/stage4-replay.md`) — until it has been replay-tested, a role definition is taxonomy, not validated design.
