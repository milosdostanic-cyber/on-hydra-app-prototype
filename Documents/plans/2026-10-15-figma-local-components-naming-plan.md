# Figma "Local Components" — naming & description plan

Source: Figma `BOM-SPEC---ASC-Connected-v2`, section **Local Components** (`node-id=5553:192184`).
Status: **proposal only** — nothing renamed in Figma or code yet.

## Naming convention proposed

`Domain / Component / Variant-axis` (slash hierarchy, Title Case, singular nouns), variant props `State=Rest|Hover|Selected`.
Domain = module the component lives in (`BOM`, `Catalog`, `Shared`). Matches existing `Product / SKU Card / Horizontal` style; adds the missing domain prefix and removes ambiguous words ("Form", "Import", "Export" used as domain when they are really a BOM step).

## Inventory

| # | Current Figma name (node) | Proposed name | Code counterpart | Where used (code) |
|---|---|---|---|---|
| 1 | `Product / SKU Card / Horizontal` (5499:144987) — State=Rest, Selected | `BOM / SKU Match Card / Horizontal` | `SkuMatchCard` (file-local fn, `src/bom/components/BomMatchingReviewPartPanel.tsx:171`), rendered via `SkuCardGrid` (:359). Spec has a copy: `src/spec/components/SpecProductSuggestionCard.tsx` | Guided matching review (`BomProgressiveMatchingPage` → `BomMatchingReviewPartPanel`); also `BomSkuVariantPicker` uses same selectable style |
| 2 | `Product / SKU Card / Vertical` (5570:204055) — Rest, Selected | `BOM / SKU Match Card / Vertical` | Same as #1 (`layout='stack'` in `BomSkuVariantPicker`, side panels) | `BomMatchDetailDrawer`, `BomSkuVariantModal`, `BomCatalogSkuPickModal` |
| 3 | `SKU-Card` (5741:48054) — loose frame, not a component, unnamed layers (`Content`, `Metadata`, `Button`×4) | **Delete or convert**; it is a duplicate of #1 with Import/Exact tags. If kept: `BOM / SKU Match Card / Draft` | — | — (orphan) |
| 4 | `Form / Linked Input` (5492:106100) — Status=Linked, Not Linked, Required | `BOM / Field Mapping Select / Status` | Inline status render in `BomFieldMappingTable` (`src/bom/components/BomFieldMappingTable.tsx:~222`, "Not linked" / "Required — not linked"); "Not linked" text also in `SpecExportPage` | `BomFieldMappingPage`, `BomMappingSummaryPage` |
| 5 | `Export / Format Card` (5546:188176) — State=Rest, Hover | `Shared / Export Format Card / State` (Figma DS already has `ExportCard`, 826-1181 → consider **merging** and adding `Active`) | `ExportCard` (`src/ui/ExportCard.tsx`, states rest/hover/active) | `BomExportPage`, `SpecGuideSpecsPage`, `SpecReviewPage` |
| 6 | `Import / Line Item Editor` (5570:201374) — single symbol | `BOM / Parsed Line Editor` | `BomParsingReviewRowDrawer` (`src/bom/components/BomParsingReviewRowDrawer.tsx`; comment cites Figma modal `5506:187558`) | `BomParsingReviewPage` |
| 7 | `Catalog / Part Replacement Picker` (5573:294537) | `BOM / Replace Match Picker` (it opens from BOM, not Catalog) | `BomChoosePartModal` (`src/bom/components/BomChoosePartModal.tsx`); legacy page `BomReplacementPickerPage` only redirects | `BomWorkspacePage`, via `useBomChoosePartDrawer` |
| 8 | `Catalog / Category Card` (5573:294361) — Rest, Selected | Two different things share this: **(a)** `BOM / Category Tile` ↔ `FeaturedCategoryCard` (`BomChoosePartModal.tsx:103`, matches the image shown, "Pre-engineered kits"); **(b)** `Catalog / Category Card` ↔ `CategoryCard` (`src/shell/content/ProductCatalogContent.tsx:48`, different design). Rename Figma one to (a) | see left | Replace picker (a); Product Catalog landing (b) |

## Descriptions (paste into Figma component description)

1. **BOM / SKU Match Card / Horizontal** — Selectable card for one orderable SKU suggested for an imported BOM line. Shows photo, SKU number with copy, Import and match-quality tags ("Exact Product"), name, Fig/Brand/UPC metadata, View Product / View PDF links. Use in wide review lists. States: Rest, Selected.
2. **BOM / SKU Match Card / Vertical** — Same content stacked for narrow side panels/drawers; no photo, "View submittal" link. States: Rest, Selected.
3. **BOM / Field Mapping Select / Status** — Row showing whether a BOM column is linked to an ASC field. Linked = value shown; Not Linked = neutral; Required = red, blocks continue.
4. **Shared / Export Format Card** — Large clickable tile to pick an export format (icon, title, one-line description). States: Rest, Hover, Active/selected.
5. **BOM / Parsed Line Editor** — Form to review/fix how a BOM line was read ("From your file" → UPC, SKU, size, manufacturer, figure number, qty) before matching.
6. **BOM / Replace Match Picker** — Modal body to swap the match for an imported line: context header, "Popular starting points" category tiles, catalog search.
7. **BOM / Category Tile** — Small selectable tile (icon, category, example, sample part) used inside the picker. States: Rest, Selected.

## Hygiene findings (Figma)

- `SKU-Card` frame is orphaned and unnamed internally (`Button`, `Content`) — remove or componentize.
- Nested instances are all named `Button` / `Tag__Status`; leave (they are library instances) but name text layers with real roles (`SKU`, `Title`, `Metadata`).
- Mixed variant naming: Figma `State=Selected` vs `ExportCard` `Active`. Pick one (`Selected` for pick-one cards, `Active` only for pressed).
- Spec module has a private duplicate of `SkuMatchCard` (`SpecProductSuggestionCard`) — candidate to share after Figma rename.

## Code follow-up (optional, after Figma approval)

Rename file-local fns to match Figma (`SkuMatchCard` ok already; `ChoosePartCard`→`ReplaceMatchPartCard`, `FeaturedCategoryCard`→`CategoryTile`) and add JSDoc with Figma node id + description. Keep small, per-file.

## Open questions

- Does "Import" in `Import / Line Item Editor` mean BOM import only, or Spec too?
- OK to merge #5 into the existing DS `ExportCard`?
- Figma-only rename, or also code renames?
