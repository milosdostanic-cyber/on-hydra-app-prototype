---
name: hydra-work-planner
description: >-
  Decides what to work on next for Hydra by reading Jira UATL assignments,
  Confluence PRDs, Granola Hydra transcripts, and Gemini meeting notes in Google
  Drive, then lists a prioritized work plan from that knowledge only — no repo
  scanning and no implementation plan by default. Use when the user asks what
  to work on next, what to do today, prioritization, or Hydra work planning.
  Read-only by default — does not scan the repository, and does not edit Jira,
  Confluence, Drive, Figma, or repo files unless explicitly asked to implement
  or update.
---

# Hydra Work Planner

## Purpose

Answer: **exactly what should I work on next for Hydra?**

Gather evidence from Jira, Confluence, Granola, and Gemini Drive transcripts; resolve conflicts with the rules below; list the prioritized tasks. That is the entire default run — **do not** inspect this repository and **do not** produce an implementation plan until the user picks a specific task in a **later, separate** turn (see Phase 2).

## Default mode: read-only, knowledge-only

- **Do not** edit Jira, Confluence, Google Drive, Figma, or repository files.
- **Do not** inspect, scan, or read repository files/routes/components during the default run — this run is Jira/Confluence/Granola/Drive knowledge only.
- **Do not** run the skill's plan as implementation.
- Only write or update something when the user **explicitly** asks to implement or update.

If any MCP call fails (auth, empty result, broken transcript), say so and continue with remaining sources. Never invent instructions from missing data.

**Hard stop:** this skill's default job ends the moment the knowledge-based output template (see below) is printed. Never continue into repo inspection, implementation planning, editing code, creating branches, opening files for writing, or calling any implement-oriented skill in the same turn — even if `Today` looks simple or unambiguous. Repo inspection and an implementation plan only happen once the user names a specific task in a **later, separate** turn (Phase 2). Actual code changes only happen after a further explicit confirmation on top of that (Phase 3).

## When to run

Trigger on requests like:

- "What should I work on next?"
- "What should I do today for Hydra?"
- "Prioritize my Hydra work"
- `@hydra-work-planner`

Do **not** run this skill for unrelated coding tasks unless the user asks for prioritization.

---

## Required MCP sources

Call `GetMcpTools` for each server before use. Authenticate with `mcp_auth` only if a server reports `needsAuth` or returns an auth error.

| Source | MCP server | Tools (typical) | What to pull |
|--------|------------|-----------------|--------------|
| Jira UATL | `user-Atlassian-MCP-Server` | `atlassianUserInfo`, `getAccessibleAtlassianResources`, `searchJiraIssuesUsingJql`, `getJiraIssue` | Issues in project **UATL** assigned to the current user |
| Confluence PRDs | `user-Atlassian-MCP-Server` | `searchConfluenceUsingCql`, `getConfluencePage` | PRDs / specs linked to candidate tickets or named in meetings |
| Granola | `plugin-granola-granola` | `query_granola_meetings`, `list_meetings` | Recent **Hydra** meeting decisions and action items |
| Gemini / Drive | `user-google-drive` | `search_drive_files`, `get_drive_file_content` | Recent Gemini meeting transcripts / notes mentioning Hydra |

Optional companion (do not block on it): `user-google-workspace` if Drive email must be confirmed.

### Jira query pattern

1. Resolve `cloudId` via `getAccessibleAtlassianResources`.
2. Confirm identity via `atlassianUserInfo`.
3. Search with JQL (adjust fields as needed):

```text
project = UATL AND assignee = currentUser() AND statusCategory != Done ORDER BY updated DESC
```

4. Request fields including: `summary`, `description`, `status`, `priority`, `assignee`, `updated`, `comment`, `issuetype`, `labels`, `parent` (and linked issues if available).
5. For top candidates, call `getJiraIssue` for full latest comments.

Treat statuses roughly as:

| Bucket | Typical statuses |
|--------|------------------|
| Active | To Do, In Progress, selected for development, reopened |
| Waiting / Review | In Review, In QA, Ready for Review |
| Blocked | Blocked, Waiting, Needs Decision, or explicit blocker comments |
| Skip | Done, Cancelled, unscoped / no acceptance criteria |

### Confluence pattern

- Prefer links from Jira description / remote links / comments.
- Else CQL search for Hydra PRD pages tied to the candidate keys or feature names.
- Use Confluence as **supporting specification** only — not as the newest instruction source unless it is the only source.

### Granola pattern

```text
query_granola_meetings: recent Hydra decisions and action items for me
list_meetings: last 14–21 days if you need titles/dates to prioritize
```

Keep Granola citations in the output.

### Gemini / Google Drive pattern

1. Resolve `user_google_email` from the Drive/Workspace MCP tool schema or prior session context; ask once if unknown.
2. Search recent files, for example:

```text
(Hydra OR UATL) AND (Gemini OR "Notes by Gemini" OR transcript OR meeting)
```

Use `order_by: "modifiedTime desc"`, `page_size` ~10–20, include shared drives.
3. Open only clearly relevant recent docs with `get_drive_file_content`.
4. If a file is empty, truncated, or unreadable → **ignore it** (conflict rule 8).

---

## Conflict rules

Apply in this order internally. If a conflict actually changed the `Today` pick, fold a short mention into that one-liner (see Output format) — otherwise there is nothing to surface.

1. The newest relevant explicit instruction wins.
2. A direct instruction to me has priority over general team discussion.
3. Newer meeting decisions override older Jira or Confluence information.
4. Latest Jira comments or assignments override old ticket descriptions.
5. Confluence is supporting specification context.
6. `In Review` work should wait unless new feedback requires changes.
7. Unscoped or blocked tickets must not be treated as active work.
8. Never infer instructions from empty or broken transcripts.

### Selection heuristics

- Prefer: assigned to me + clear next action + frontend-feasible + recent explicit ask.
- Deprioritize: In Review with no new feedback; blocked; unscoped; backend-only; already Done.
- If two sources disagree, cite both dates/links and apply the rules above — do not average them.

---

## Workflow (default run — Phase 1)

Copy and track:

```text
Hydra Work Planner:
- [ ] 1. MCP discovery + auth check
- [ ] 2. Jira UATL assigned to me
- [ ] 3. Confluence PRDs for candidates
- [ ] 4. Granola Hydra transcripts
- [ ] 5. Gemini Drive transcripts
- [ ] 6. Resolve conflicts → pick Today + Next (≤3)
- [ ] 7. Emit knowledge-only output template, then STOP
```

No repository inspection and no implementation plan happen in this phase. See **Phase 2** below for what runs once the user expresses interest in a specific task.

### Step 1–5 — Gather

Run Jira, Granola, and Drive searches in parallel when possible. Then pull Confluence for the shortlist.

For each candidate, capture:

- title / Jira key
- status / assignee
- newest instruction (who, when, source)
- whether it is scoped, blocked, or in review
- evidence links + dates

### Step 6 — Prioritize

Work this out internally (for your own reasoning, not for the printed output):

1. **Today** — one item
2. **Next** — max 3
3. **Waiting / Review**
4. **Blocked / Needs Decision**
5. Which conflict rule decided the `Today` pick, if any
6. Confidence: `high` | `medium` | `low` based on source freshness and clarity

Only the short, one-line-per-item brief below gets printed by default — keep the full reasoning ready in case the user asks for detail.

---

## Output format (Phase 1 — default, knowledge-only)

This is a **short daily brief**, not a report — but it must still be cleanly structured and easy for a human to scan, not one long run-on line. Do all the gathering and conflict-resolution work internally; surface only the conclusion, with a few short labeled lines per item (no evidence dump, no confidence score, no dedicated "Conflicts Resolved" section) unless the user explicitly asks "why", "objasni", or "koji su izvori".

Always respond with exactly this structure and stop:

```markdown
# Hydra — šta danas

## Danas
**[Jira key] Naslov**
- Zašto: [1 kratka rečenica]
- Sledeći korak: [1 kratka rečenica]

## Sledeće
- **[key]** — [kratko, par reči]
- **[key]** — [kratko, par reči]
- **[key]** — [kratko, par reči]

## Čeka / blokirano
- **[key]** — [kratko, par reči]
```

Rules for this brief:

- **Danas** is exactly one item: bold title line, then 2 short bullets (`Zašto`, `Sledeći korak`) — no more than that.
- If truly nothing is active, replace the `Danas` block with one line, e.g. "Nema aktivnog frontend posla danas — sve je In Review ili blokirano."
- **Sledeće** is max 3 bullets, one line each (key + a few words). Omit the section entirely if empty.
- **Čeka / blokirano** is one line per item (key + short reason). Omit the section entirely if empty.
- If a newer source overrode an older one for the `Danas` pick, add it as a third short bullet under `Danas` (e.g. "Napomena: Granola sastanak od [datum] ima prioritet nad starijim Jira komentarom") instead of a separate section. Skip it if there was no real conflict.
- Keep Granola citation links inline in the `Zašto` or `Sledeći korak` bullet, not as a separate list.
- If the user asks for more detail afterward ("why", "objasni", "detaljnije", "izvori"), then expand with done criteria, blockers, confidence, evidence links, and full conflict reasoning for the item they're asking about — still without touching the repo or making an implementation plan (that stays Phase 2).

After printing the brief, end the turn with one short line inviting task selection (e.g. "Reci mi koji task te zanima i napraviću implementacioni plan za njega."). **Do not** mention or start repo inspection, implementation planning, editing, or scaffolding anything in that same response.

---

## Phase 2 — Implementation plan (only once a task is chosen)

Triggers only when, in a **later, separate** turn, the user names or clearly points at one item from `Today` or `Next` (e.g. "hajde na taj", "zanima me UATL-123", "napravi plan za taj task"). Do not run this phase proactively and do not run it for more than one task at a time.

This phase is still **planning only** — no code changes yet (see Phase 3).

### Step A — Repo inspect (chosen task only)

Targeted read-only inspection of this repo:

- routes / pages / components for the feature
- existing Ant Design usage via `src/ui/antd.ts`
- tokens / theme / shell patterns already used nearby
- similar screens to reuse
- relevant plans under `Documents/plans/` if they match the ticket

Do **not** scan the whole repo. Prefer paths named in the ticket, PRD, or prior plans.

Identify **real** files and routes before naming them in the plan. If a path is uncertain, mark it as a discovery step — do not invent filenames.

### Step B — Frontend implementation plan

Produce a **frontend-only** plan that:

- uses only existing frontend architecture and tools
- reuses existing components, Ant Design components, tokens and styles
- identifies real files and routes before naming them
- includes UI states, accessibility, responsive behavior and validation
- uses relevant installed frontend, Figma, React, TypeScript, testing or design-system skills
- avoids backend, database, infrastructure and unrelated refactoring
- clearly lists any backend dependency without implementing it

Recommended plan shape under **Frontend Implementation Plan**:

1. Goal / done criteria (from the chosen task)
2. Current repo touchpoints (routes, files found)
3. Closest existing pattern to reuse
4. Phased frontend slices (small, reviewable)
5. UI states (default, loading, empty, error, success, disabled, validation)
6. A11y + responsive notes
7. Tokens / components to reuse (no new tokens or shared core components)
8. Backend / API dependencies (list only — do not implement)
9. Out of scope
10. Suggested companion skills for implementation later (e.g. `@prd-ux-implementation-planner`, `@hydra-ux-audit`, Figma skills) — load them only if the user asks to implement

Also honor repo guardrails: `AGENTS.md`, UX reuse rules, token discipline, plan-before-code. Prefer linking to `@prd-ux-implementation-planner` detail if the user wants a deeper PRD gap analysis after prioritization.

### Phase 2 output format

```markdown
## Frontend Implementation Plan — <task / Jira key>
```

...followed by the plan shape above. After printing it, end the turn asking whether to start implementation. **Do not** start implementing, editing, or scaffolding anything in that same response.

---

## Phase 3 — Implementation (only on explicit confirmation)

- Only triggers when the user later says to implement/start/go ahead on the Phase 2 plan (e.g. "implement this", "go ahead", "hajde", "kreni") — treat it as a new instruction, not part of this skill's default run.
- Scope the work strictly to what was captured in the Phase 2 plan, unless the user names a different item.
- Follow standard repo implementation rules at that point: `AGENTS.md`, scope guardrails, token discipline, and the `@hydra-ux-audit` quality gate for any UI change.
- Do not silently expand scope beyond the plan already presented; if new information changes the plan, re-surface it before touching files.

---

## Failure / sparse-data behavior

| Situation | Behavior |
|-----------|----------|
| MCP auth missing | Name the server; continue with other sources; lower confidence |
| No UATL issues assigned | Say so; fall back to meeting action items directed at the user |
| Empty / broken transcript | Ignore; never invent asks from it |
| Only In Review work | Put under Waiting / Review; Today may be “no active build work” + next review follow-up |
| Backend-only primary ask | Put as Today only if it is the real priority; if the user later picks it for Phase 2, the Frontend Implementation Plan must state frontend cannot proceed and list backend deps |

---

## Explicit non-goals

- Do not create commits, PRs, or Jira/Confluence edits.
- Do not inspect or scan the repository during the default (Phase 1) run.
- Do not produce a Frontend Implementation Plan during the default (Phase 1) run — only after the user picks a task (Phase 2).
- Do not implement the plan unless asked — not even a "quick" or "obvious" first step, and not in the same turn as any plan output.
- Do not broaden into infra, DB, or unrelated refactors.
- Do not promote local UI into new shared/core components or new tokens.
