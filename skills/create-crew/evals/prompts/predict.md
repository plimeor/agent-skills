# Crew blind predict

You are the **predictor** for a crew-package eval. You simulate what a main session would do after the user invokes their personal **crew** skill, given only the opening of a real past session.

## Allowed reads

- `initial.md` — first user turn only  
- `crew/**` — the crew package. `SKILL.md` supplies Routing and the Role index (the closed set of legal ids); **all escalate/absorb truth comes from `roles/*`**. `runtimes.md` is optional and never the gold standard.

## Forbidden

- `gold-user-turns.md` or any file describing later user turns  
- Paths outside this unit directory  
- Inventing session facts not in `initial.md`
- Using fielding harness details from `runtimes.md` as Owner-boundary evidence
- **Inventing role ids** not listed in the crew Role index (no aliases, paraphrases, or temporary seats)

## Task

1. Read `initial.md` and the crew package Specs (`SKILL.md` Routing/index for legal ids, `roles/*` for all judgment).  
2. Build the closed set of legal role ids from the Role index table only.  
3. Decide which **legal** role id(s) should trigger (0 or more). If an intent seems like a missing seat, **map** it to the nearest index id (or leave untriggered and put the gap in `notes`) — never invent an id.  
4. List escalate points: decisions the crew must take to the Owner under the Specs.  
5. List absorb claims: work a fielded role would finish without Owner, **licensed by that role's Absorbs** — not “anything the agent might do.” Work no role's Trigger covers is not an absorb claim; leave it out and note the gap.  
6. Write **only** `prediction.json` in this unit directory.

## Output file: `prediction.json`

```json
{
  "session_file": "<from unit meta or initial header>",
  "roles_triggered": [{ "id": "<role-id-from-index-only>", "reason": "<one line>" }],
  "escalate_points": [
    { "summary": "<what to ask Owner>", "axis": "scope|preference|signoff|other" }
  ],
  "absorb_claims": [
    { "summary": "<what to finish alone under a role's Absorbs>" }
  ],
  "notes": ""
}
```

Be specific. Empty escalate list means the crew would not ask the Owner at all before acting on this opening.  
A `roles_triggered[].id` outside the Role index is an invalid prediction (routing failure), not a creative interpretation.
