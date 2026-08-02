# Stage 3 — Role Inference

Input: `signals/` + `signals-manifest.md` + `census/census.md` + the open-schema control conclusions in `signals/_open-schema/`.
Output: `roles.md` (portable role catalog) + `roles-method.md` (method, residuals, limitations, validation record) + `roles-evidence.md` (citation provenance).

## What Stage 3 must produce

From first principles: the user will mount this catalog on **their** harness. Most harnesses are single-agent or loosely routed. Multi-agent dialogue in one session is ideal and rare. So Stage 3 optimizes for **transferable judgment specs**, not for a runtime.

**Acceptance (catalog completeness).** Every role in `roles.md` must carry all of:

| Field | Question it answers |
|---|---|
| **Name + core responsibility** | What judgment function is this? |
| **Trigger** | When does it engage? (intent type, phase signal, or user-visible switch — operational, not vibes) |
| **Absorbs autonomously** | What may it finish without the Owner? |
| **Escalates to Owner** | What must stop and ask the human? |
| **Phase type** | `batch` or `dialogic` |
| **Success criteria** | How would you know this role did its job? |
| **≥2 corpus examples** | Quotes only; provenance in `roles-evidence.md` |

Optional (progressive disclosure — include when they help a deployer who already has a capable harness; never as a substitute for the table above):

- Hand-off to another role (if the corpus shows a stable switch)
- Short prompt skeleton for that role alone
- Collaboration order among roles
- Shared constraints block

**Prohibited substitutes for acceptance:** a role list with responsibilities but no triggers; triggers that only name a tool or repo; "run the multi-agent pipeline" as the only usage path; orchestration prose that outgrows the boundary fields.

Gate: if any kept role lacks trigger, absorbs, or escalates, Stage 3 is incomplete — do not proceed to Stage 4 and do not present the catalog as deployable.

## 3.0 The deliverable must be clean: no IDs, no turn numbers in `roles.md`

`roles.md` is read by humans and often pasted into agent configuration. It must contain **no session IDs, no turn numbers `[n]`, and no inline evidence anchors**.

- **Keep the quotes** — a citation is the substance of the conclusion, not an audit trace. Write it out.
- **Move the provenance** — each citation's `session_id + turn number` goes into `roles-evidence.md`, joined on **the quoted text itself**.
- **No inline anchors** (`[E12]`, "see evidence 3", `AD-07`). An inline index is itself a patch-style audit trace — the same class of problem it is trying to solve.

Three reasons:

1. **Readability** — UUIDs and bracketed numbers force the reader to step over noise to reach the clause.
2. **Boundary validation** — Stage 4's primary path (and any optional blind stress test) must read `roles.md` without being handed the session's identity and key turns. Provenance in-file has already voided a validation round.
3. **Traceability is relocated, not lost.** `roles-evidence.md` and `roles.md` correspond one-to-one; audit reads both together.

`roles-evidence.md` structure:

```markdown
| Quote (may be truncated; must match uniquely) | session | turn | section of roles.md |
```

**In `roles.md`, `「」` is reserved for verbatim quotes** — one quoted span per row in the evidence table. If the same quote is reused in several sections, write one row per section. Emphasis, enumeration, and template placeholder text use backticks or bold instead, never `「」`. The join check runs per `「」` span, so mixing the two usages destroys the meaning of the "no provenance found" signal.

## 3.1 Writing contract (applies equally to `roles.md` and `roles-method.md`)

**All three artifacts describe a stable target state, never a revision history.**

Forbidden forms: "formerly X, now Y", "originally named …", "removed", "deprecated", "~~struck through~~", "revised accordingly", "(added after validation)", "(missing from the original document)", and any changelog-shaped section.

- Write the **basis** for a ruling — it is part of the conclusion. Do not write the **history** of the ruling.
- Disposition records live in the residual list (§3C) and the validation record in `roles-method.md`.
- **If something upstream is wrong, go fix it upstream.** Do not add a downstream note explaining what upstream got wrong.

## 3A. Decision and friction pattern extraction

From the signals, first derive four lists (each entry backed by ≥1 session):

1. **Decision types the Owner must rule on personally** (with the archetypal forms found in the corpus)
2. **Questions that drain judgment the most / trigger irritation** (anger points)
3. **High-frequency correction directions toward the agent** (wanted / unwanted / relatively tolerated — "relatively tolerated" must also cite delegation evidence from `census.md`, and may not come only from high-friction sessions)
4. **Stable phase transitions** (the recurring in-session phase sequence and the hard signals that mark each switch)

## 3B. Cluster into roles

- **Let the data set the count.** No target range: a stated range becomes a target, and clustering converges on it instead of on the evidence. If the corpus supports three roles, write three; if it supports nine, write nine. Residual accounting (§3C) forces honesty, not a bound.
- A role is a **recurring judgment function**, not a pipeline station name and not the proper name of a repository or tool.
- Fill every acceptance field in the table above for each role.
- **The Owner (the user) is always outside the system**: irreversible preferences, authority conflicts, scope, public-facing form, and sign-off belong to the human and are not made into an agent.
- **Phase-type annotation (mandatory)**:
  - **Batch:** compress Owner turns (one decision packet, one full checklist).
  - **Dialogic:** higher quality per turn, not fewer turns — survive chained interrogation, demos, self-consistency, interruptibility. Design/shaping roles are almost always dialogic; writing one as "one-pass proposal" fails on contact with real work.

## 3C. Residual accounting (mandatory, never skipped)

After clustering, walk **every high-value signal** once more: each session either maps to ≥1 role (as a role example or trigger) or goes into the residual list in `roles-method.md`:

```markdown
## Residuals (high-value, unbucketed)
| Judgment axis involved | Why no existing role holds it | Disposition |
```

The residual table carries no session IDs (§3.0) — which session lands on which residual axis is recorded in `roles-evidence.md`.

- ≥3 sessions residual on the same judgment axis → **candidate new role**; decide explicitly: add / extend / out-of-domain with reason.
- Divergence axes from the open-schema control (stage2 §2B) also enter this table.
- Silently discarding non-conforming high-value samples is a fidelity defect.

## 3D. Three artifacts, split by reader

**`roles.md` carries only what a deployer needs.** Methodology, audit chains, and validation records stay out.

Test: **would someone mounting these roles do the wrong thing without this section?** Yes → keep it in `roles.md`. No → move it out.

| Artifact | Contents | Reader |
|------|------|------|
| **`roles.md`** | Known-limits; four lists (3A); raw roles (acceptance fields); optional generic roles; shared constraints; **deployment menu**; optional skeletons / collaboration hints | People who will **use** these roles |
| **`roles-method.md`** | Evidence tiers, biases, decision-persona summary, residuals (3C), distillation table, raw→generic mapping, coverage (3E), Stage 4 validation record | People who will **audit** these roles |
| **`roles-evidence.md`** | Session + turn for every citation (§3.0) | People who will **check** provenance |

### Progressive disclosure inside `roles.md`

Put load-bearing content first; depth only when a harness can use it.

1. **Always:** known-limits → four lists → each role's acceptance fields (trigger, absorb, escalate, phase).
2. **When useful:** shared constraints; hand-off rules; one short skeleton per role.
3. **Never required for acceptance:** multi-agent session wiring, product-specific tool recipes, long orchestration playbooks.

Prefer **interfaces over examples**: a clear trigger and boundary beats three narrative walkthroughs of a fictional multi-agent run. Prefer **judgment over stacked rules**: state the real escalate/absorb line once; do not restate it as five overlapping "must / never" paragraphs that fight each other.

### Two layers (Part 1 / Part 2)

- **Part 1 (descriptive):** raw roles from this corpus. May couple to dominant scenarios; naming may follow corpus stations. Contains the four lists of 3A plus role definitions with full acceptance fields.
- **Part 2 (normative, optional compression):** generic roles across domains. Each generic role points back to raw roles (one-to-many). Domain-neutral names; no repository proper names.
- Merging two raw roles requires a stated basis (usually "same type of question escalates to the human") — basis in `roles.md`, mapping table in `roles-method.md`.
- Evidence-tier declaration (L0 → L1 → L2–3 → L4 → L5) lives in `roles-method.md`.

### Deployment menu (mandatory short section in `roles.md`)

State that mounting is user-owned. Give a menu, not a single recipe:

```markdown
## Deployment

This catalog is harness-agnostic. Pick a mount that fits your tools:

| Option | Use when |
|---|---|
| Single agent + shared constraints (+ role triggers as guidance) | Default for most current tools |
| One role definition selected per task | You can route or paste one role at a time |
| Separate agents or skills per role | Your harness isolates roles cleanly |
| Multi-agent dialogue in one session | Only if your harness supports it — not required by this catalog |

Mount the **triggers and boundaries** first. Skeletons and collaboration order are optional depth for harnesses that can use them.
```

Do not prescribe a named product's tool graph. Do not imply that multi-agent same-session dialogue is the intended or validated deployment.

## 3E. Coverage and limitations (written in `roles-method.md`)

State honestly: what was read, what was not, that value/intervention labels are heuristics, open-schema convergence, residual dispositions. **Name unverified scope; do not paper over with a tone of completeness.**

**Mandatory — corpus self-reference:** read `inventory/self-referential.md`; state whether self-reference filtering was on, how many sessions it dropped, **and how many hit a marker but stayed below threshold**; if hit sessions remain, state how many and how often cited, identities via `inventory/self-referential.md` and `roles-evidence.md` (IDs stay out of `roles.md`). The reader is entitled to know how much of the conclusion was discovered versus restated.

### Known-limits block at the top of `roles.md` (mandatory, ≤6 lines)

Only numbers and facts that change a **mounting** decision:

```markdown
**Known limits** (basis in `roles-method.md`)
- Boundary check: <not run | escalation precision ≈N%, recall ≈N%>
- Absorbable share ≈N% (if measured): fewer mistakes may matter more than fewer questions
- <which role/clause is not yet boundary-validated>
- <the largest known uncertainty this round>
- Multi-agent same-session behaviour: not validated by this pipeline
```

With no Stage 4 primary path, write "boundary check: not run". Leaving the block blank is not allowed; neither is glossing with "continuously improving". Optional pipeline stress-test numbers, if any, go in `roles-method.md` only — they must not masquerade as catalog validity.

## 3F. Pre-delivery self-check (mandatory; memory does not substitute)

```bash
bun scripts/pipeline.ts lint-roles --run <run>
```

Every rule above is the kind an LLM drops, including the model that wrote the rule the same day. Non-zero exit means unfinished.

| Check | Clause | Typical miss |
|---|---|---|
| `session-id` | §3.0 | **Bare 8-hex IDs** (`33be3f1c`) — searching only for `claude_`/`grok_` prefixes misses them |
| `turn-ref` / `inline-anchor` | §3.0 | `[115]`, `[E12]`, "see evidence 3" |
| `patch-style` | §3.1 | Parentheticals hung on headings, e.g. "(added after validation)" |
| `dangling-section` | — | A `§12` reference survives an artifact split |
| `subsection-parent-mismatch` | — | `### 11.1` under `## §7` |
| Known-limits block | §3E | Missing, or grown past 6 lines |
| Quote join | §3.0 | Quote in `roles.md` with no row in `roles-evidence.md` |

Also enforce **catalog acceptance** by inspection before Stage 4: every role has trigger, absorbs, escalates, phase type. Missing fields → incomplete, not "good enough prose".

Results land in `inventory/lint-roles.json`. The only false positives from `「」` as emphasis — fix the writing, not the check.

Once lint passes and acceptance fields are complete, proceed to Stage 4 boundary validation (`references/stage4-replay.md`). Until the primary path has run, the catalog is taxonomy, not validated design.
