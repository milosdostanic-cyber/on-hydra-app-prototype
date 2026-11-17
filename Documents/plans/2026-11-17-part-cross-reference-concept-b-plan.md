# Part Cross-Reference: concept B (part cards) in the prototype

Date: 17 Nov 2026. Branch: `feat/variant-modal-sidebar-layout`. Route: `/bom/cross-reference` (page `src/bom/pages/BomPartCrossReferencePage.tsx`).

## Source of truth
- Figma BOM - RSFC, frame 7651:4917: B1 (7655:5453, competitor to RSFC cards), B2 (7655:5560, RSFC to competitor cards), A1 (7651:11285, filter placement), A5 to A9 (states). Card reference: `Documents/plans/assets/2026-11-16-part-cross-reference/b1-card-polish-reference.png`.
- Requirements: Matt (meeting 13 Nov, BOM-431 comment 13 Nov): both search directions, filters, e-commerce-like listing, keep the match details modal.
- Handoff: `Documents/plans/2026-11-16-handoff-context-for-chatgpt.md` section 15.

## Scope (what changes)
1. Data (`partCrossReferenceData.ts`): keep the existing exports. Add an RSFC-grouped view (RSFC part with its competitor matches), filter types, facet options and list functions that allow an empty search (browse).
2. Page: filters column on the left (260 px), toolbar with direction toggle, category, search + Search button (UX-005), a 3-column card grid, and pagination footer.
3. Cards (new component `PartCrossReferenceCard`): competitor to RSFC = best RSFC match block; RSFC to competitor = competitor matches block. Real product image (72 px frame, Fit). "View matches" opens the existing modal.
4. Filters: Match type, RSFC origin, and RSFC attributes (Size, Material, Brand) in disclosure rows. Applied filters as removable chips with "Clear all".
5. States: loading (skeleton cards), error with retry (`?simulateError=1`), no results for filters (Clear filters), no hits for a search term.
6. Open decision (BOM-360): the page shows all parts before a search. `?start=search` switches to search-first. Needs Matt and James to confirm.

## Not in scope
- Match details modal stays unchanged. In the RSFC to competitor view, "View matches" opens it for the best competitor match.
- CRM iframe variant.
- Real PIM attributes: Size, Material and Brand are sample values from the demo data until Sofija confirms the attribute list (CON-347).
- Content File Manager and every other BOM screen.

## Rules to follow
Hydra DS components and tokens only (`src/ui/antd`), UX-001 to UX-013 (`hydra-ux-pattern`) except UX-006: the repo does not set a minimum screen height of 970 (Milos, 17 Nov). `hydra-ux-audit` before closing.

## Done when
- `npm run build` passes.
- Both directions, filters, chips, pagination and the four states work in the browser at 1440 px and 1750 px wide.
- The page matches B1 and B2 in Figma; the modal opens from both directions.
- The handoff file records what was built and what is still open.
