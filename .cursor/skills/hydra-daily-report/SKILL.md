---
name: hydra-daily-report
description: >-
  Generates Miloš's daily Hydra/ASC project status report in Serbian by
  reading Granola meeting transcripts, Gemini meeting notes in Google Drive,
  Jira UATL tickets assigned to Miloš, and related Confluence PRDs/intake
  pages, then resolving source conflicts with a fixed priority order. Use
  when Miloš asks for his daily report, status update, "šta danas da radim",
  "dnevni izveštaj", or similar Hydra prioritization requests. Read-only —
  never edits Jira, Confluence, Drive, or Granola.
---

# Hydra Daily Report (Miloš)

## Purpose

Produce **one Serbian daily status report** for Miloš on the Hydra/ASC
project by combining Granola, Gemini/Drive, Jira UATL, and Confluence,
resolving conflicts with the priority hierarchy below, and emitting the
fixed 7-section Serbian template.

## Read-only

This skill only reads. It must never edit Jira, Confluence, Google Drive,
Granola, or repository files — regardless of what the report recommends.

## Required sources

| # | Source | MCP server | Typical tools | What to pull |
|---|--------|------------|----------------|---------------|
| 1 | Granola | `plugin-granola-granola` | `query_granola_meetings`, `list_meetings`, `get_meeting_transcript` | Recent Hydra/ASC meetings; anything said to or assigned to Miloš directly |
| 2 | Gemini / Drive | `user-google-drive` | `search_drive_files`, `get_drive_file_content` | Recent Gemini meeting notes/transcripts for Hydra/ASC, focus on the most recent meetings |
| 3 | Jira UATL | `user-Atlassian-MCP-Server` | `atlassianUserInfo`, `getAccessibleAtlassianResources`, `searchJiraIssuesUsingJql`, `getJiraIssue` | All UATL tickets assigned to Miloš, not Done: status, new comments, changes, blockers |
| 4 | Confluence | `user-Atlassian-MCP-Server` | `searchConfluenceUsingCql`, `getConfluencePage` | Hydra PRDs / intake pages linked to the active tickets found in step 3 |

Call `GetMcpTools` per server before use. Authenticate with `mcp_auth` only
if a server reports `needsAuth` or an auth error. If a source fails or is
empty, say so in the report and continue with the rest — never invent
content from a missing or broken source.

### Jira query pattern

```text
project = UATL AND assignee = currentUser() AND statusCategory != Done ORDER BY updated DESC
```

Pull `summary`, `status`, `assignee`, `updated`, `comment`, `priority`,
`labels`, `parent`/links. For active candidates, call `getJiraIssue` for the
latest comments and any blocker language.

### Granola / Gemini pattern

Search recent Hydra/ASC meetings first (last ~14 days), prioritizing any
where Miloš is a named participant or is directly addressed/assigned an
action. Keep title + date + link/citation for anything used in the report.

### Confluence pattern

Only fetch PRDs/intake pages already linked from the Jira tickets found in
step 3, or explicitly named in a recent meeting. Confluence is background
context, never the newest-instruction source.

## Source priority hierarchy

Apply in this exact order when sources disagree; always name the conflict
explicitly in the report (see section 6 of the template):

1. The newest direct instruction to Miloš has the highest priority.
2. Instructions and decisions from **Matt** and **Lucas** outrank other
   sources (except a newer direct instruction to Miloš).
3. A newer meeting outranks an older meeting.
4. Then Jira comments/status.
5. PRD and Confluence pages are baseline context only — never the
   newest-instruction source.

## Selection rule

Do not treat every open Jira ticket as today's priority. Extract only the
realistic Hydra work for that specific day, factoring in the latest
meetings and any active blockers. If a ticket's Jira status looks stale
next to a newer verbal decision, flag it in section 5 of the report instead
of trusting the status blindly.

## Workflow

```text
Hydra Daily Report:
- [ ] 1. MCP discovery + auth check
- [ ] 2. Granola: recent Hydra/ASC meetings, esp. items directed at Miloš
- [ ] 3. Gemini/Drive: recent Hydra/ASC meeting notes
- [ ] 4. Jira UATL: Miloš's non-Done tickets (status, comments, blockers)
- [ ] 5. Confluence: PRDs/intake linked to active tickets
- [ ] 6. Apply priority hierarchy; resolve conflicts
- [ ] 7. Select "Danas prvo uradi" + up to 3 "Posle toga" items
- [ ] 8. Emit the fixed Serbian template
```

## Output format (always this exact structure, in Serbian)

```markdown
# Hydra Dnevni Izveštaj — [datum]

## 1. Danas prvo uradi
- Zadatak (+ Jira key ako postoji)
- Razlog
- Konkretan sledeći korak
- Kriterijum završetka

## 2. Posle toga
Maksimalno 3 stavke, po prioritetu.

## 3. Direktno rečeno tebi
Sve nove ili i dalje važeće instrukcije, naročito od Matta i Lucasa —
datum sastanka + citat/link ka izvoru kad postoji.

## 4. Blokirano / čeka odluku
Ko treba da odgovori i šta tačno treba pitati.

## 5. Jira stanje
Svi UATL tiketi dodeljeni Milošu koji nisu Done, kratko. Označi ako je
status verovatno zastareo zbog novije usmene odluke.

## 6. Konflikti izvora
Samo ako postoje — koji izvor je jači i zašto.

## 7. Predlog poruke
Samo kada je potreban follow-up — kratka poruka na engleskom za radni chat.
```

If a section has nothing to report, keep the heading and write a short
"nema" / "nema novih promena" line — do not delete the heading.

## Failure / sparse-data behavior

| Situation | Behavior |
|-----------|----------|
| No new meetings since last report | Use the last valid decisions; state clearly in section 3 that there are no newer changes |
| MCP source unavailable/empty | Name it, continue with remaining sources, lower confidence on affected items |
| Only stale/blocked tickets | Section 1 may be "nema aktivnog build rada" + the concrete unblocking action instead |
| Conflicting instructions | Always populate section 6 with the winning source and the rule applied |

## Explicit non-goals

- Never invent tasks, meetings, or Jira activity that the sources don't
  actually contain.
- Never treat every open Jira ticket as today's priority.
- Never edit Jira, Confluence, Drive, or Granola content.
- Never skip a template section — mark it empty instead of omitting it.
- Do not merge this report with implementation — it is status/prioritization
  only; if Miloš wants an implementation plan afterward, that is a separate,
  explicit follow-up request.
