# Hydra UX pattern skill: Confluence updates (draft)

Nothing here is published yet. Two pages change once the PR to `on-hydra-app` is merged.

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
> - **When building a new screen:** the agent applies the rules from the start.
> - **Rule changes:** design approves a rule first. The change goes into the repo folder and this page
>   in the same step.

## 2. Page "Skills Glossary" (Hydra space, page 2409627673, owner Matt Pettit)

Ask Matt before editing. Proposed new group after "Engineering standards":

> ## Design and UX
>
> - `/hydra-ux-pattern` — Approved Hydra/RSFC UX rules (UX-001 to UX-012) for frontend screens:
>   spacing, table cards, actions and status columns, row actions, tags, search, page titles, back
>   buttons and state cards. Audits are read-only, and fixes run only when asked.

The skill count at the top of that page goes up by one.
