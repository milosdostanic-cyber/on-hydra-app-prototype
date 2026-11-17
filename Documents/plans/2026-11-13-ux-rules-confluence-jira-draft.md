# DRAFT — Hydra UX rules: Confluence page + Jira ticket

Status: draft for review. Nothing is published yet.

---

## 1. Where the Confluence page goes

**Space:** Hydra
**Parent:** Hydra - ASC › Product Planning › Planning › Design system adoption › **DELIVERY - Design System Adoption**
**Sits next to:** *Hydra DS token architecture and usage* (your page, same parent)

Why here: this is where the design system reference pages already live (tokens, gap tracker, shared patterns). UX rules are the "how we use the DS on screens" layer, so they belong beside the token page.

---

## 2. Confluence page draft

### Title
**Hydra UX pattern rules**

### Intro
These are the approved UX rules for Hydra / RSFC screens. They keep the same patterns consistent across all modules (BOM, SPEC, Content, Admin, Part Search, Unified Search, Release Notes), in Figma and in the prototype.

The source of truth is the `hydra-ux-pattern` skill in the `on-hydra-app-prototype` repo (`.cursor/skills/hydra-ux-pattern/`). Each rule has its own file there with the full spec. This page is the short, readable version.

### How the rules are used
- **Check:** an agent or designer audits a module against the rules. Audits never change anything.
- **Fix:** changes are made only after approval, for a named rule and module.
- **Design system:** the rules use existing DS components and tokens only. They never change the DS itself.
- **New rule:** when two modules handle the same thing differently, agree the pattern, then add it as the next UX rule.

### Rules

| ID | Rule | What it means | Does not apply to |
|---|---|---|---|
| UX-001 | Form control spacing | Independent form controls side by side in one row (e.g. Input + Select) are 20 px apart, using the DS spacing token. | Parts of one control (range picker, input with unit), button rows, tables, vertical spacing. |
| UX-002 | Table link colour | Links in tables use the normal link colour (`colorLink`). The active colour is only for the pressed state. | Links outside tables, status tags, danger actions. |
| UX-003 | Module entry page title | The landing page of a module uses Heading 2 for the title and Large text in the description colour under it, 4 px apart. | Detail pages, wizard steps, modals, empty-state titles. |
| UX-004 | Table actions column | Actions is the last column, just wide enough for its actions. Header and buttons are right-aligned, with ⋯ last. | Bulk action bars, links inside data cells, selection columns. |
| UX-005 | Search field | Page search is an Input with a search icon plus a primary "Search" button, same size, 8 px apart. | Type-to-filter search above a table, search inside dropdowns. |
| UX-006 | Screen minimum height | Every full screen frame is at least 970 px tall, and the sidebar and work area fill that height. | Components, modals, mobile frames, screens already taller. |
| UX-007 | Table card layout | A table inside a card goes edge to edge. Search, filters and the item count sit in a toolbar inside the card. The footer holds pagination on the right. | Tables in modals and drawers, small preview tables. |
| UX-008 | Status column placement | The Status column comes right after the name column, so users see what the row is and its state first. | Match / confidence columns, event logs ordered by time. |
| UX-009 | State card fills the height | A card that shows a start, loading, empty, no-results or error state fills the page down to the bottom padding. | Cards with tables or lists, cards in a grid. |
| UX-010 | Row action style | Row actions are small default buttons, danger last. Show at most 2, the rest go into ⋯. No links or primary buttons in rows. | Toolbars, bulk actions, modal footers. |
| UX-011 | Counts and match quality | Counts are plain text, not tags. Match quality uses the status tag. Coloured tags are only for Type and file type. | Dashboard numbers, notification badges. |
| UX-012 | Back button on sub-pages | A page opened from a hub or list starts with a "Back to …" button (left arrow), 24 px above the title. | Entry pages, pages opened from the sidebar, modals and drawers. |

### Related
- Hydra DS token architecture and usage
- DELIVERY - Design System Adoption
- Hydra Ant Design – DS (Figma)

---

## 3. Jira ticket draft

**Project:** UATL
**Type:** Sub-task of **UATL-557** — *Document the Hydra design system and support its implementation and design QA*
**Assignee:** Milos Dostanic
**Status:** To Do

**Summary:**
[Design] Document Hydra UX pattern rules in Confluence

**Description:**

*Context*
The approved Hydra UX rules (UX-001 to UX-012) live in the `hydra-ux-pattern` skill in the prototype repo. The team needs one readable page in Confluence that explains each rule.

*Scope*
- Create "Hydra UX pattern rules" under DELIVERY - Design System Adoption, next to the DS token page.
- Short explanation of each rule: what it means and where it does not apply.
- Explain how rules are checked, fixed after approval and added.
- Link the skill as the source of truth.

*Acceptance criteria*
- All 12 approved rules are on the page, each with a short explanation.
- The page links to the skill and the DS Figma file.
- New rules are added to the page when they are approved in the skill.
- Reviewed with Lucas.

---

## Open questions for you
1. Is the parent OK (DELIVERY - Design System Adoption), or do you want the page directly in the "Design system adoption" folder?
2. Sub-task of UATL-557, or a separate Task in UATL?
3. Should the Jira ticket mention Lucas as reviewer, or leave that out?
