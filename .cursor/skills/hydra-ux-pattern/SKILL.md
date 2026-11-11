---
name: hydra-ux-pattern
description: >-
  Single source of truth for approved Hydra/RSFC UX pattern rules (rule IDs like UX-001),
  with a read-only audit and an approval-gated fix workflow across the Hydra Figma module
  files. Use when the user asks to audit, check, enforce or fix a UX pattern, form control
  spacing, horizontal input/select gaps, UX consistency across modules, or to add a new
  UX pattern rule. Never edits Figma unless explicitly asked.
---

# Hydra UX Pattern

Registry of **approved** UX pattern rules for Hydra/RSFC, plus the workflow to audit and
(only on request) fix them across the module Figma files. Each rule lives in its own file
under `rules/` so the set stays easy to extend.

## Default mode: read-only

- Creating, reading or editing this skill **never** triggers Figma changes.
- An **audit** is read-only: no Figma writes, no repo edits besides an optional report file.
- A **fix** runs only when the user explicitly says so (e.g. "Fix approved UX-001 in BOM",
  "apply UX-001 to Content") and names the rule and scope.
- The **Design System is never modified**. Missing tokens or components go to
  "Needs review" as DS gaps; never create or edit them without explicit approval.

## Approved rules

Only rules in this table are enforceable. Do not invent, infer or enforce others.

| ID | Category | Standard | File |
|----|----------|----------|------|
| UX-001 | Layout / Form Controls | 20px horizontal gap between independent form controls in one row, via DS spacing token | [rules/UX-001.md](rules/UX-001.md) |
| UX-002 | Table patterns / Colour | Link text in tables uses `colorLink`, never `colorLinkActive` | [rules/UX-002.md](rules/UX-002.md) |
| UX-003 | Typography / Page header | Module entry page title: `Title/Heading 2` + `colorText`, description `Large/Normal` + `colorTextDescription`, 4px gap (`paddingXXS`) | [rules/UX-003.md](rules/UX-003.md) |
| UX-004 | Table patterns / Alignment | Actions column is last, as wide as its widest action set + padding; header label and cell actions right-aligned to one edge, ⋯ last, never centered | [rules/UX-004.md](rules/UX-004.md) |
| UX-005 | Filters / Search controls | Page search = DS `Input` (search icon left) + primary `Button` "Search", same size, 8px gap (`paddingXS`) in `Input and Button Container`; never `Input__Search` | [rules/UX-005.md](rules/UX-005.md) |
| UX-006 | Layout / Screen frames | Top-level screen frames have `minHeight` 970; shell (Sidebar, work area) fills the height | [rules/UX-006.md](rules/UX-006.md) |

## Sources of truth

- **Design System (read-only):** Hydra Ant Design - DS, file key `3ghYBXR6XVUEaeBo3D5E4q`
  (referred to as "Hydra App Design - DS"). Components, variables and text styles come only from here.
- **Token inventory:** `Documentation/ds-inventory.json` (cached DS variables). Resolve tokens by
  name from it, never by guessing the value.
- **Related docs:** `Documentation/hydra-ux-patterns.md` (observed patterns, descriptive only; a
  rule here is normative only if it is in the table above).

## Target files

| Module | File key | Figma link |
|---|---|---|
| Admin - RSFC | `rONB8aMPanOjS3GC1uN16d` | https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=2009-5319 |
| Content - RSFC | `pGzqSs0fMmuQ2BtjbMNVjP` | https://www.figma.com/design/pGzqSs0fMmuQ2BtjbMNVjP/Content-RSFC?node-id=5603-308790 |
| Release Notes - RSFC | `a4gviD5oViRhasSCN6cC8Z` | https://www.figma.com/design/a4gviD5oViRhasSCN6cC8Z/Release-Notes-RSFC?node-id=1-5012 |
| Part Search - RSFC | `fyhH2NtH20puYbGLDChPwn` | https://www.figma.com/design/fyhH2NtH20puYbGLDChPwn/Part-Search-RSFC?node-id=11024-16994 |
| Unified Search - RSFC | `usBJj4PPK8naOgJdi31Lgt` | https://www.figma.com/design/usBJj4PPK8naOgJdi31Lgt/Unified-Search-RSFC |
| BOM - RSFC | `Ht3Up5MlRAKjK7eCuAy05L` | https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM-RSFC?node-id=673-23362 |
| SPEC - RSFC | `KmU1mTvL7D1fLZvJ8SIGTN` | https://www.figma.com/design/KmU1mTvL7D1fLZvJ8SIGTN/SPEC-RSFC?node-id=8075-133874 |

Links open each file's known entry node (Unified Search has none: open the file and find the screen pages). Links or node IDs in the prompt win. Skip Cover, Archive, Old, WIP, Exploration, Deprecated and
hidden pages/frames, and say which pages were covered. During BOM work do not touch Content File
Manager (`AGENTS.md`).

## Tools

- **figma-console Desktop Bridge (first choice):** `figma_list_open_files`, `figma_navigate` with
  `lock: true`, `figma_execute` for reads/writes, `figma_take_screenshot` for evidence.
- **Official Figma MCP (fallback):** `get_metadata`, `get_screenshot`, `use_figma` (load
  `figma:figma-use` first; call `create_session` first if offered).
- Large `get_metadata` results go to a file: parse with a script, never read raw.
- Writes are strictly sequential. Keep a ledger JSON in the scratchpad (frames done, node IDs,
  before/after values) so a run can resume and be reverted.

## Workflow

```text
Hydra UX Pattern:
- [ ] 1. Confirm rule ID(s) and scope (files/pages/frames) and mode (audit vs fix)
- [ ] 2. Confirm access to target files; load DS token inventory
- [ ] 3. Inspect screens (screenshot first, then node data)
- [ ] 4. Compare against the rule's "Applies / Does not apply" and classify each case
- [ ] 5. Audit: emit report, then STOP.  Fix: apply only safe corrections (rule file)
- [ ] 6. Verify (re-read nodes, screenshot before/after)
- [ ] 7. Emit report
```

1. **Scope:** no rule or scope given for an audit → all approved rules, all target files, read-only.
   A fix without a named rule and scope → ask; do not assume.
2. **Inspect:** screenshots to understand the logical rows, then node data. Never count a finding
   you have not looked at. Audit Light mode only.
3. **Classify** every candidate (see Reporting). When unsure whether elements are independent
   controls or one composite control, it is **Needs review**, not a fix.
4. **Fix safety (all rules):** preserve component instances and properties; never detach; no
   unnecessary overrides; keep visual hierarchy, responsiveness, constraints and Auto Layout
   behaviour; change nothing unrelated; bind to DS variables, never raw values.
5. **Verify:** re-read the changed nodes (value is the bound token, instance intact, layout not
   broken), screenshot before/after, list anything that moved.
6. **Audit ends the turn.** After an audit report, stop and end with: "Reply 'Fix approved' with the
   rule ID and scope (or finding IDs) to apply fixes." Never fix in the same turn as an audit.

## Reporting

Classify every finding as one of:

| Status | Meaning |
|---|---|
| **Already correct** | Matches the rule; no action |
| **Fixed** | Corrected in this run (fix mode only); include before → after |
| **Needs review** | Uncertain, exception-adjacent, DS gap, or would need a design decision; not changed |

Each finding: `<MODULE>-<RULE>-<NNN>` (e.g. `BOM-UX001-003`), rule ID, file, page, frame name,
node ID, Figma link (`https://www.figma.com/design/<fileKey>/?node-id=<id with : as ->`), status,
one-line note. Group identical repeats on one screen (×N). Print per-module counts per status, DS
gaps and open questions. Write the report to `Documentation/ux-pattern-audit-<YYYY-MM-DD>.md` only
when asked; otherwise reply in chat.

## Adding a new rule

Only after the user explicitly approves the rule. Then:

1. Copy [rules/_template.md](rules/_template.md) to `rules/UX-NNN.md` (next free number).
2. Fill every section (applies, does not apply, implementation, validation, fix safety).
3. Add one row to the Approved rules table above, and nothing else in this file.
4. Update the skill entries in `Documentation/agent-rules-and-skills.md` and
   `Documentation/skills-and-rules-catalog.md` if the rule list there changes.

Planned categories (**not approved, not enforceable**): form layouts and alignment, table
patterns, filters and search controls, modal and drawer behavior, navigation and breadcrumbs,
actions and button placement, empty/loading/error states, responsive behavior, cross-module
consistency.

## Implementation handoff

Fixes start only on a later explicit instruction ("Fix approved", "apply UX-001 to X", "go ahead").
Scope strictly to what the audit presented unless the user names something else; re-surface any
scope change before acting. For code (not Figma) changes follow `AGENTS.md` and `@hydra-ux-audit`.

## Explicit non-goals

- No modifications to the Design System file; no new tokens, variables, styles or components.
- No Figma edits on skill creation, on audit, or without an explicit fix request.
- No enforcing or inventing rules that are not in the Approved rules table.
- No detaching instances, no raw px/hex values, no restructuring of unrelated layers.
- No fixing uncertain cases: flag them as Needs review.
- No overlap with `@hydra-ux-audit` (code/UI quality gate) or `hydra-ds-compliance` (token/component
  drift); this skill only checks its own approved rule IDs.
