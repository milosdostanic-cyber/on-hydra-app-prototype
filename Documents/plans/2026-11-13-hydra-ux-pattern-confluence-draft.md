# Hydra UX pattern skill: Confluence updates (draft)

Status 2026-11-13: sections 1 and 3 are published on "Hydra UX pattern rules" (version 3), with a
"How to use it" section for both repos. Section 2 (Skills Glossary) is still open and needs Matt.

## 1. Page "Hydra UX pattern rules" (Hydra space, page 2411331589)

Replace the second paragraph ("The source of truth is ...") with:

> The source of truth is the `hydra-ux-pattern` skill in the `on-hydra-app` repo
> (`.agents/skills/hydra-ux-pattern/`). Each rule has its own file there with the full spec. This page
> is the short, readable version. Design keeps the Figma audit workflow; the repo copy checks code.

Add a section after "How the rules are used":

> ## How to use it
>
> - **Developers (Cursor, Claude Code, Codex):** pull `develop`. The skill is in `.agents/skills/` with
>   the other team skills. Ask the agent "check this screen against the Hydra UX rules" or call
>   `/hydra-ux-pattern`. An audit changes nothing. Say "fix" with the rule and screen to apply changes.
> - **Prototype (`on-hydra-app-prototype`):** the same skill is in `.cursor/skills/hydra-ux-pattern/`
>   for Cursor and linked at `.claude/skills/hydra-ux-pattern` for Claude Code. It checks `src/...`.
> - **When building a new screen:** the agent applies the rules from the start.
> - **Rule changes:** design approves a rule first. The change goes into the repo folder and this page
>   in the same step.

## 2. Page "Skills Glossary" (Hydra space, page 2409627673, owner Matt Pettit)

Ask Matt before editing. Proposed new group after "Engineering standards":

> ## Design and UX
>
> - `/hydra-ux-pattern` — Approved Hydra/RSFC UX rules (UX-001 to UX-013) for frontend screens:
>   spacing, table cards, actions and status columns, row actions, tags, search, page titles, back
>   buttons, state cards, status badges and tag colours. Audits are read-only, and fixes run only when asked.

The skill count at the top of that page goes up by one.

## 3. New row on "Hydra UX pattern rules"

> | UX-013 | Tags, badges and colours | A record status is a dot badge. Match quality is a status tag. Only Type columns and file types get coloured tags, and each value keeps one colour everywhere (tables in the rule file). Everything else is a neutral tag or plain text. | Dashboard numbers, notification badges. |

Open question to list under the table: the Content file manager in `on-hydra-app` uses different file type colours (PDF red, STEP green, TXT purple, plus ITM and VRML). Design decides which map wins.
