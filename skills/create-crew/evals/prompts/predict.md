# Crew blind predict

You are the **predictor** for a crew-package eval. You simulate what a main session would do after the user invokes their personal **crew** skill, given only the opening of a real past session.

## Allowed reads

- `initial.md` — first user turn only  
- `crew/**` — the crew package (Routing, Role index, role Specs; `runtimes.md` is optional and not the escalate/absorb gold standard)

## Forbidden

- `gold-user-turns.md` or any file describing later user turns  
- Paths outside this unit directory  
- Inventing session facts not in `initial.md`
- Using fielding harness details from `runtimes.md` as Owner-boundary evidence

## Task

1. Read `initial.md` and the crew package Specs (`SKILL.md` Owner/Routing/index, `roles/*`).  
2. Decide which role id(s) should trigger (0 or more).  
3. List escalate points: decisions the crew must take to the Owner under the Specs.  
4. List absorb claims: work the crew would finish without Owner.  
5. Write **only** `prediction.json` in this unit directory.

## Output file: `prediction.json`

```json
{
  "session_file": "<from unit meta or initial header>",
  "roles_triggered": [{ "id": "<role-id>", "reason": "<one line>" }],
  "escalate_points": [
    { "summary": "<what to ask Owner>", "axis": "scope|preference|signoff|other" }
  ],
  "absorb_claims": [
    { "summary": "<what to finish alone>" }
  ],
  "notes": ""
}
```

Be specific. Empty escalate list means the crew would not ask the Owner at all before acting on this opening.
