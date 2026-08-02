# Stage 3 — Role Inference

Input: `signals/` + `signals-manifest.md` + `census/census.md` + the open-schema control conclusions in `signals/_open-schema/`.
Output: `roles.md` (portable role catalog: **Spec** + optional **Depth**) + `roles-method.md` (method, residuals, limitations, validation record) + `roles-evidence.md` (citation provenance).

## What Stage 3 must produce

From first principles: the user will mount this catalog on **their** harness. Most harnesses are single-agent or loosely routed. Multi-agent dialogue in one session is ideal and rare. Context is scarce. So Stage 3 optimizes for **transferable judgment specs that fit in a small mount surface**, not for a long essay or a runtime.

### Two inputs for every boundary (dual-source)

Judgment has two complementary records in the corpus:

| Source | What it shows | Default field it fills |
|---|---|---|
| **Friction** (high-intervention signals, anger points, corrections) | What the Owner seizes, rejects, or insists on | **Escalates to Owner** |
| **Census** (low-intervention / successfully delegated sessions) | What the Owner already lets finish without them | **Absorbs autonomously** |

Using only friction produces a control-biased catalog (everything escalates). Using only census produces a naive catalog (everything absorbs). **Both sources enter Stage 3 at equal rank** — not "friction first, census if time remains."

**Dual-source gate.** When `census/census.md` lists repeated delegated task types, absorb clauses must draw on that list (source `census` or `both`). Escalate clauses must draw on friction/anger/must-rule signals (source `friction` or `both`). Record the mapping in `roles-method.md` under **Boundary sources** (see §3C′). If the census is empty, state that once and allow absorb lines from other evidence with an explicit waiver — silence is not a waiver.

**Prohibited substitutes:** absorb/escalate written only from high-friction sessions while census has matching task types; census summary present in the run but never cited in any absorb line; "relatively tolerated" without census support (see §3A).

### Acceptance fields (every role)

| Field | Question it answers | Lives in |
|---|---|---|
| **Name + core responsibility** | What judgment function is this? | **Spec** |
| **Trigger** | When does it engage? (intent, phase signal, or user-visible switch — operational, not vibes) | **Spec** |
| **Absorbs autonomously** | What may it finish without the Owner? | **Spec** |
| **Escalates to Owner** | What must stop and ask the human? | **Spec** |
| **Phase type** | `batch` or `dialogic` | **Spec** |
| **Success criteria** | How would you know this role did its job? | **Spec** |
| **≥2 corpus examples** | Quotes only; provenance in `roles-evidence.md` | **Depth** (or Spec if short) |

Optional depth (never a substitute for Spec fields): hand-off to another role, short prompt skeleton, collaboration order, long shared-constraint essays.

**Prohibited substitutes for acceptance:** a role list with responsibilities but no triggers; triggers that only name a tool or repo; "run the multi-agent pipeline" as the only usage path; orchestration or four-list narrative that outgrows Spec; Spec that is incomplete unless the reader opens Depth.

**Gates before Stage 4:** every role has Spec fields complete; dual-source gate satisfied; `## Spec` present and mountable alone. Incomplete → do not present as deployable.

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

From the **signals**, derive four lists (each entry backed by ≥1 session). These lists feed Spec boundaries and live in **Depth**, not in Spec.

1. **Decision types the Owner must rule on personally** (archetypal forms from the corpus) → feeds **escalate**
2. **Questions that drain judgment / trigger irritation** (anger points) → feeds **escalate**
3. **High-frequency correction directions** (wanted / unwanted / relatively tolerated) — "relatively tolerated" **must** cite `census.md` task types and may not come only from high-friction sessions
4. **Stable phase transitions** (recurring phase sequence and hard switch signals) → feeds **trigger**

In parallel, read `census/census.md` and extract the **delegation whitelist**: task types repeatedly completed with low Owner intervention. That list feeds **absorb** at the same priority as lists 1–2 feed escalate. Do not finish clustering before this read.

## 3B. Cluster into roles

- **Let the data set the count.** No target range: a stated range becomes a target, and clustering converges on it instead of on the evidence. Residual accounting (§3C) forces honesty, not a bound.
- A role is a **recurring judgment function**, not a pipeline station name and not the proper name of a repository or tool.
- Fill every Spec acceptance field for each role. Write absorb and escalate **in the same pass**, each tied to its source (census vs friction).
- **The Owner is always outside the system**: irreversible preferences, authority conflicts, scope, public-facing form, and sign-off are not agent roles.
- **Phase-type annotation (mandatory)**:
  - **Batch:** compress Owner turns (one decision packet, one full checklist).
  - **Dialogic:** higher quality per turn, not fewer turns — chained interrogation, demos, self-consistency, interruptibility. Design/shaping roles are almost always dialogic; "one-pass proposal" fails on contact with real work.

## 3C. Residual accounting (mandatory, never skipped)

After clustering, walk **every high-value signal** once more: each session either maps to ≥1 role or goes into the residual list in `roles-method.md`:

```markdown
## Residuals (high-value, unbucketed)
| Judgment axis involved | Why no existing role holds it | Disposition |
```

The residual table carries no session IDs (§3.0) — session→axis mapping is in `roles-evidence.md`.

- ≥3 sessions residual on the same judgment axis → **candidate new role**; decide explicitly: add / extend / out-of-domain with reason.
- Open-schema divergence axes (stage2 §2B) also enter this table.
- Silently discarding non-conforming high-value samples is a fidelity defect.

### 3C′. Boundary sources table (mandatory in `roles-method.md`)

After Spec boundaries are drafted, record every absorb and escalate clause:

```markdown
## Boundary sources
| Role | Direction | Clause (short) | Source | Backing |
|---|---|---|---|---|
| … | absorb \| escalate | … | census \| friction \| both \| waiver | census task-type or signal pattern |
```

- **Source = census** only for absorb (or both). **Source = friction** only for escalate (or both).
- If census is empty: one row or note `census: empty — absorb waiver: <reason>`.
- Dual-source gate fails if census has repeated task types and no absorb row cites `census` or `both`.
- This table is audit-only — it does not enter `roles.md` Spec.

## 3D. Artifacts and progressive disclosure

**`roles.md` is what a deployer mounts. Method and evidence are audit.**

Test: **would someone mounting these roles do the wrong thing without this section?** Yes → `roles.md`. No → method/evidence.

| Artifact | Contents | Reader |
|------|------|------|
| **`roles.md` → Spec** | Known-limits; deployment menu; role cards with Spec fields only; optional one-line shared constraints | Default **mount** surface |
| **`roles.md` → Depth** | Four lists (3A); examples/quotes; Part 2 generic roles; skeletons; collaboration hints | Humans or rich harnesses |
| **`roles-method.md`** | Evidence tiers, biases, persona summary, residuals, **Boundary sources**, distillation, coverage, Stage 4 record | **Audit** |
| **`roles-evidence.md`** | Session + turn for every citation | **Provenance** |

### Spec vs Depth (mandatory shape of `roles.md`)

Context is general across many requests; it cannot be a dump of every practice. Prefer a small interface the model or human can mount, and load depth only when needed.

Required outline:

```markdown
**Known limits** (basis in `roles-method.md`)
- …

## Spec

Self-contained mount surface. Do not require Depth to apply triggers or boundaries.

### Deployment
(menu table — see below)

### Roles

#### <Role name>
- **Responsibility:** …
- **Trigger:** …
- **Absorbs:** …          # dual-source: census-backed when census exists
- **Escalates:** …        # dual-source: friction-backed
- **Phase:** batch | dialogic
- **Success:** …

## Depth

### Decision patterns
(four lists from 3A)

### Role detail
(examples with 「quotes」, hand-offs, optional skeletons)

### Generic roles (Part 2, if any)
```

Rules:

1. **Spec is mountable alone.** A reader who stops after `## Spec` has every trigger and boundary.
2. **Depth never invents new escalate/absorb axes** that Spec lacks. Depth may illustrate and qualify; Spec is authoritative for Stage 4 and for deployment.
3. **Prefer interfaces over examples** in Spec: operational trigger + two boundary lines beat multi-paragraph stories.
4. **Prefer judgment over stacked rules:** one clear escalate line, not five overlapping must/never paragraphs.
5. **Part 1 raw roles** fill Spec (+ Depth detail). **Part 2 generic roles** are optional compression in Depth (or a short Spec subsection if the user deploys only generics); each generic points back to raw roles. Mapping table in method.
6. Merging two raw roles requires a stated basis in Spec or Depth; mapping table in method.

### Deployment menu (inside Spec)

```markdown
### Deployment

This catalog is harness-agnostic. Pick a mount that fits your tools:

| Option | Use when |
|---|---|
| Single agent + Spec shared constraints and role triggers | Default for most current tools |
| One role card from Spec selected per task | You can route or paste one role at a time |
| Separate agents or skills per role | Your harness isolates roles cleanly |
| Multi-agent dialogue in one session | Only if your harness supports it — not required |

Mount **Spec** first. Depth is optional.
```

Do not prescribe a named product's tool graph.

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
| `missing-spec-section` | §3D | No `## Spec` / `## 规格` |
| `missing-boundary-sources` | §3C′ | No Boundary sources table in method |
| Quote join | §3.0 | Quote in `roles.md` with no row in `roles-evidence.md` |

Also enforce by inspection before Stage 4 (not all are scriptable):

| Check | Fail if |
|---|---|
| Spec fields | Any role lacks trigger, absorbs, escalates, or phase |
| Spec mountable alone | Applying boundaries requires reading Depth |
| Dual-source | Census has repeated task types but Boundary sources has no census/both absorb rows |
| Boundary sources table | Missing from `roles-method.md` |

Results land in `inventory/lint-roles.json`. The only false positives from `「」` as emphasis — fix the writing, not the check.

Once lint passes and the gates above hold, proceed to Stage 4 (`references/stage4-replay.md`). Until the primary path has run, the catalog is taxonomy, not validated design. Stage 4 validators mount **Spec** only unless a Depth-only clause is under test.
