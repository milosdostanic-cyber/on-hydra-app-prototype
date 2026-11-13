---
name: hydra-ux-pattern
description: Approved Hydra/RSFC UX pattern rules (UX-001 to UX-012) for frontend screens, with a read-only audit and an approval-gated fix workflow for code in the on-hydra-app-prototype repo. Use when building or reviewing a screen, or when asked to audit, check or fix a UX pattern such as form control spacing, table card layout, the actions column, the status column, row actions, tags, page search, page title, back button or state cards.
---

# Hydra UX Pattern

This skill holds the **approved** UX pattern rules for Hydra/RSFC screens and the workflow to check
them in the prototype code (`src/...`). Each rule lives in its own file under `rules/`. Design
applies the same rules in the module Figma files, so a screen built to these rules matches the design.

## Default mode: read-only

- An **audit** is read-only and changes no code.
- A **fix** runs only when the user explicitly asks for it and names the rule and the scope (for
  example "fix UX-007 on the BOM Hub"). The trigger words are listed in
  [code-audit.md](code-audit.md).
- When building a new screen, apply the rules from the start. That needs no separate approval.
- The **design system is never modified**. A missing token or component is reported as a DS gap under
  "Needs review" and is never added without approval.

## How to use it

1. Read [code-audit.md](code-audit.md). It maps every rule to code, lists the checks
   to run in the browser, and lists the shared pieces that are known to disagree with a rule.
2. Read each rule file in `rules/` in full before checking it. Use the **Standard**, **Spec**, **Applies
   when** and **Does not apply** sections. The **Implementation** and **Fix** sections describe Figma
   layers for the design team and do not apply to code.

## Approved rules

Only rules in this table are enforceable. Do not invent, infer or enforce other rules.

| ID     | Category                   | Standard                                                                                                                                                                  | File                               |
| ------ | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| UX-001 | Layout / Form Controls     | Independent form controls in one row are 20px apart, using the DS spacing token.                                                                                          | [rules/UX-001.md](rules/UX-001.md) |
| UX-002 | Table patterns / Colour    | Link text in tables uses `colorLink` and never `colorLinkActive`.                                                                                                         | [rules/UX-002.md](rules/UX-002.md) |
| UX-003 | Typography / Page header   | A module entry page title uses Heading 2 with `colorText`, and its description uses Large text with `colorTextDescription`, 4px apart.                                    | [rules/UX-003.md](rules/UX-003.md) |
| UX-004 | Table patterns / Alignment | The Actions column is last and as wide as its widest action set plus padding. Header and actions are right-aligned to one edge, with the kebab menu last.                 | [rules/UX-004.md](rules/UX-004.md) |
| UX-005 | Filters / Search controls  | Page search is an `Input` with a left search icon plus a primary "Search" `Button` of the same size, 8px apart. `Input.Search` is never used.                             | [rules/UX-005.md](rules/UX-005.md) |
| UX-006 | Layout / Screen frames     | Figma screen frames are at least 970px tall. In code this means the shell fills the viewport height.                                                                      | [rules/UX-006.md](rules/UX-006.md) |
| UX-007 | Tables / Layout            | A table card has padding 0 and the table runs edge to edge. Search, filters and the count sit in a toolbar inside the card, and the footer holds pagination on the right. | [rules/UX-007.md](rules/UX-007.md) |
| UX-008 | Tables / Column order      | The Status column comes right after the name column.                                                                                                                      | [rules/UX-008.md](rules/UX-008.md) |
| UX-009 | Layout / States            | A card that shows a start, loading, empty, no-results or error state fills the height down to the page padding.                                                           | [rules/UX-009.md](rules/UX-009.md) |
| UX-010 | Tables / Actions           | Row actions are small default buttons with `danger` last. At most 2 are visible and the rest go into the kebab menu. Rows have no links or primary buttons as actions.    | [rules/UX-010.md](rules/UX-010.md) |
| UX-011 | Tables / Tags              | Counts are plain text and never tags. Match quality uses the status tag. Colourful tags are only for Type and file type.                                                  | [rules/UX-011.md](rules/UX-011.md) |
| UX-012 | Navigation / Page header   | A sub-page opened from another page in the module starts with a default "Back to" button with a left arrow, 24px above the title.                                         | [rules/UX-012.md](rules/UX-012.md) |

## Sources of truth

- **Rules:** this folder. The Confluence page "Hydra UX pattern rules" in the Hydra space is the
  readable summary, and this folder wins when the two differ.
- **Tokens and components:** the antd theme in `src/theme/` (`hydraAlias.ts`, `antdTheme.ts`,
  `hydraTypography.ts`). Rule files name Figma variables such as `Size/Padding/paddingMD`, which is
  `token.paddingMD` in code. Read values from `src/theme/`, never from memory.
- **Design system in Figma (read-only):** Hydra Ant Design - DS, file key `3ghYBXR6XVUEaeBo3D5E4q`.

## Reporting

Classify every finding as one of these:

| Status              | Meaning                                                                                             |
| ------------------- | --------------------------------------------------------------------------------------------------- |
| **Already correct** | The case matches the rule and needs no action.                                                      |
| **Fixed**           | The case was corrected in this run (fix mode only), with the before and after values.               |
| **Needs review**    | The case is uncertain, close to an exception, a DS gap or a design decision, so it was not changed. |

Each finding has an ID in the form `<MODULE>-<RULE>-<NNN>` (for example `BOM-UX001-003`), the rule ID,
the app, route, file path, status and a one-line note. Group identical repeats on one screen as "xN".
Reply in chat unless the user asks for a ticket comment or a PR description.

## Writing style

- Write like a person explaining to a teammate. Use plain words and short sentences, one idea each.
- Do not use long or short dashes, arrows, middle dots, ellipsis characters or emoji in sentences.
- Use straight quotes for UI labels, as in the "Search" button.
- Use the plain status words "Already correct", "Fixed" and "Needs review".

## Changing the rules

Rules are owned by design. Do not add, remove or change a rule's Standard or Spec in this repo without
design approval. When design approves a change, it is made in this folder, in `on-hydra-app`
(`.agents/skills/hydra-ux-pattern/`) and on the Confluence page in the same step. After a code fix, a dated line may be added to the rule's **Status log**.

## Implementation handoff

Keep fixes to the scope the user named, and raise any scope change before acting. For code changes,
follow `AGENTS.md` (including the BOM rules there) and `@hydra-ux-audit`.

## Out of scope

- Figma edits. This skill checks code only. The Figma workflow is kept by design outside the repo.
- New tokens, variables, styles or components.
- Rules that are not in the Approved rules table.
- Uncertain cases. Report them as Needs review.
