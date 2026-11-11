# BOM · Part Cross-Reference — implementation plan (2026-11-11)

Source of truth for the UI: Figma BOM - RSFC, page "Cheat Sheet · Part Cross-Reference",
section `7560:210686` (screens 1.1–1.6, 1.2a–c, 2.1–2.4, spec panel "Category dropdown · full list").
Live reference: hydra-dev `/bom/projects/:id/static-matches` (43 tabs = All Parts + 42 categories).

## Goal

A non-technical estimator finds the RSFC equivalent for a competitor part: pick a category
(optional), search by figure number / SKU / description / keyword, open a part, compare RSFC
equivalents, copy the RSFC SKU.

## Scope (in)

| # | File | Change |
|---|---|---|
| 1 | `src/bom/data/partCrossReferenceData.ts` (new) | 42 categories in 4 groups, demo competitor parts + RSFC equivalents, search helper |
| 2 | `src/bom/components/PartCrossReferenceMatchModal.tsx` (new) | Match details modal (competitor part panel, origin `Segmented` with counts, match cards, copy SKU, warning note) |
| 3 | `src/bom/pages/BomPartCrossReferencePage.tsx` (new) | Page: header (UX-003 pattern via `BomPageHeader`), category `Select` (grouped, searchable) + `AppSearchInput` + primary "Search" (UX-005), states: start, searching, results table, no results, no results in category, error |
| 4 | `src/bom/BomRoutes.tsx` | Route `cross-reference`; redirect `projects/:bomProjectId/static-matches` → `cross-reference` |
| 5 | `src/shell/buildAppBreadcrumbItems.tsx` | Breadcrumb "BOM / Part Cross-Reference" |
| 6 | `src/bom/pages/BomSiteProjectsPage.tsx` | Third "Get started" card "Part Cross-Reference" + "Internal feature" tag |
| 7 | `src/ui/antd.ts` | Re-export `Segmented` (DS component, no styling change) |

## UX decisions

- 43 tabs → one grouped searchable `Select` (Valves, Fittings & piping, Hangers & supports, Other);
  dropdown 380px wide, list height 392px, type-to-filter, "No matching categories".
- Search = `Input` + primary `Button` "Search", same size (large), 8px gap (UX-005); 20px to the Select (UX-001).
- Multi-word search matches all words in any field (fixes live "ball valve" → 0 results).
- Table: Figure No., Competitor SKU, Description (link, `colorLink`, UX-002), Brand, RSFC matches (tag),
  Action last + right-aligned (UX-004). Row click opens the modal.
- Modal: best match first; origin filter hidden with 1 match, zero-count options disabled; RSFC SKU copy → success message.
- Status rule respected: no record status here; match/origin chips use colorful tags (non-status chips).

## Out of scope

Backend/API, persisting picks, adding a match to a BOM project, Content File Manager, DS changes.

## Verification

`npx tsc -b` (or project typecheck), run dev server, walk: start → category dropdown → search "valve"
→ open row (2 matches, filter) → 717 HR 2" (1 match + note) → copy SKU → "ball valve" in Ball Valves
(no results in category → Search all categories) → `?simulateError=1` error state. hydra-ux-audit self-check.
