# Plan: Table card layout (UX-007) and Status column placement (UX-008)

- **Date:** 2026-11-11
- **Rules:** `.cursor/skills/hydra-ux-pattern/rules/UX-007.md`, `UX-008.md`
- **Status:** Planned. No Figma or code changes yet. Each step runs only on
  "Fix approved UX-007 <scope>" / "Fix approved UX-008 <scope>".
- **Attached:** `@hydra-ux-pattern`, `@hydra-ux-audit`. DS file is read-only.

## Target layout

```
Card (padding 0, radius borderRadiusLG, colorBgContainer, boxShadowTertiary, clip)
├─ Toolbar 16/20: Category → Search (Input + Search) → filters · right: actions · summary line below (12)
├─ Table: edge to edge · ☐ | # | Name | Status | … | Actions
└─ Footer 16/20: Total left · Pagination right
```

## Step 1 — UX-007 in BOM - RSFC (`Ht3Up5MlRAKjK7eCuAy05L`)

| Screens | Node | Change |
|---|---|---|
| Part Cross-Reference 1.3, 1.4, 1.5, 1.6 (8 `Search Card` frames) | e.g. `7573:181350` | Card padding 24 → 0, gap 0. Wrap `Search Controls` + `Results Summary` in a `Toolbar` frame (16/20, gap 12, bottom border). `Table Footer` padding → 16/20 + top border |
| Parsing review 2.5 / 2.8 family and BOM-356 | e.g. `5495:137756`, `6760:28629` | `Top Strip` 12 → 16 top/bottom. `Pagination` footer → 16/20, FILL width (2.5 is 1416 with left 0) |
| Old Cheat Sheet 1.2, 1.3, 2.1 | `7008:38538`, `6497:60340` | **Ask first:** superseded by the new Part Cross-Reference section? If not, move `Search Controls` and the count into the card toolbar |
| Hub 1.x, Workspace 3.x | `5289:21316`, `5709:51660` | Already correct |

## Step 2 — UX-008 in all files

| File | Table | Today | Change |
|---|---|---|---|
| BOM | Hub project list (1.1, 1.3, 1.4 + 3 more) | `Project name \| Last edited \| Items \| Status \| Actions` | Status → 2nd |
| BOM | Matching results (2.15, 2.15.1, 2.16, 2.17) | `# \| Original part \| Our Part \| Match score \| Status \| Actions` | Status after `Our Part` |
| Unified Search | Cross-module guidance 1.2 (BOM hub) | `… \| Items \| Status \| Actions` | Status → after name |
| Admin | Release Notes list (8 screens) | `Title \| Published date \| Type \| Status \| …` | Status → 2nd |
| Admin | KC Data Feeds (2) | `Feed Name \| Company \| Format \| Records \| Status \| …` | Status → 2nd |
| Admin | Lead Time Uploader (1) | `Upload Timestamp \| Administrator \| … \| Status \| … \| Actions \| Variants Updated` | **Needs review:** identity is a timestamp. Also UX-004: move `Actions` last |
| SPEC | "02 — Upload SPEC" list (11) | `SPEC name \| Division \| Version \| Last updated \| Status \| …` | Status → 2nd (match the SPEC list) |
| Admin | CFM Receipts | Event log | No change (excluded) |
| SPEC, Admin, BOM | SPEC list, Feature Access Limit, Companies → Feature Access, BOM-356 | Status 2nd / after identity | Already correct |

SPEC "Draft" page is not in scope.

## Step 3 — Code parity (prototype)

- `src/bom/pages/BomSiteProjectsPage.tsx`: move the Status column after Project name; footer
  padding `paddingSM` → `padding` (16) to match UX-007.
- Check other `<Table>` pages for the same two rules; list them before editing.

## Verification

- Figma: re-read the node padding and column order after each file; screenshot before/after.
- Code: run the prototype, check BOM Hub in the browser, screenshot.
- Log results in each rule's Status log.
