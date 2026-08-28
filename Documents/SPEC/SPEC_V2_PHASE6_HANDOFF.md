# SPEC V2 — Phase 6 → Phase 7 Handoff

**Date:** 2026-08-25  
**Status:** Phase 6 implemented and verified. Awaiting review before Phase 7 starts.

## 1. Wireframe pull (mandatory first step)

Official Figma MCP `get_figjam` succeeded for file `OvxMEc7zwbtW7q2Vx0EVeW`, nodes `2200:1065` (**Screen 06 — Export and Outputs**, frame label `07 — Export and Outputs`), `2215:105` (**M05 — Create or update BOM**), and `2215:122` (**M06 — Create or update Submittal Package**). No fallback was required.

Screen 06 shows the five-level breadcrumb ending in Export; title **Export and create outputs**; a summary strip with customer version, exact Master version, accepted/denied/undecided counts, and the undecided-export rule; a left revised-document panel with three selectable output choices, a Track Changes coming-soon card with **Tell me when available**, and a primary **Export document** button; and a right Project outputs panel with BOM and Submittal Package Create new / Add to existing, plus a Project-local reminder.

M05 shows PROJECT OUTPUT, Create or update a BOM, Project • Source version, create vs add-to-existing radios, conditional BOM name or existing selector, Cancel, and primary **Create BOM** / **Update BOM**. M06 is the same pattern for Submittal Package, with **Create package** / **Update package**.

The Screen 06 breadcrumb required the same narrow `buildAppBreadcrumbItems.tsx` exception used for Review and Re-analysis:

`Projects / [Project] / SPEC / [document] / Export`

## 2. Phase 6 — what shipped

### Canonical Export route

`/spec/:specId/export` is the Release 1 Export destination. Dashboard and editor Export actions navigate there. Ready-to-export, exporting, export-failed, and exported list statuses no longer fall through to Deliver-Back. Deliver-Back remains reachable at its existing route and is not deleted.

Workspace tabs now read Dashboard / Review & Edit / Export. The Export tab is enabled.

### Document generation

Users choose:

- Clean final document
- Revised document with revision history
- Original document with comparison appendix

Microsoft Word Track Changes is visible, not selectable, and offers **Tell me when available**. Export generating, ready (filename + Close + Download), and failed (Close + Retry export) states keep the chosen option. History is stored on the current customer version (`exportRecord` / `exportHistory`).

### Stale-analysis block

Export cannot start while `reanalysisRequired` is true. The Export page shows a blocking warning, and Generate stays disabled. Editor Export is disabled with the same explanation.

### Project outputs (M05 / M06)

BOM and Submittal Package support create and add-to-existing against Project-local dummy destinations. Only accepted recommendations with product evidence create downstream content. When none exist, Create new / Add to existing stay disabled with an explanation. Outputs do not call BOM or Submittal shared modules.

### Home list re-analysis (Phase 5 review carry-forward)

The Overview **Re-run analysis** action no longer clears `reanalysisRequired` or sends the user to first-upload processing. It opens M04, then starts the dedicated re-analysis route.

## 3. Verification

- Focused workflow assertions (`runSpecExportWorkflowTests`): generating → failed retains choice → retry → ready filename/history; stale analysis refuses a new run; BOM and Submittal records store accepted recommendation IDs.
- Browser walkthrough on Proprietary Division 23:
  - Dashboard Export opened Screen 06 with Master copy, undecided rule, Track Changes coming soon, and Export breadcrumb;
  - Export document reached ready and Download;
  - after a manual editor save, editor Export disabled and Screen 06 blocked Generate;
  - no page errors.
- Project outputs stayed disabled on Proprietary Division 23 because that fixture has no product-evidence recommendations. Repository tests still created BOM/Submittal records from accepted IDs.
- `npx tsc --noEmit` — clean.
- `npm run build` — succeeds; existing bundle-size warning only.
- `ReadLints` on changed files — no errors.
- Token audit — no raw color, spacing, or typography literals added.

## 4. Phase 6 acceptance criteria

- [x] Canonical Export route exists.
- [x] List and editor Export actions use it.
- [x] Export identifies customer and Master versions.
- [x] All supported output choices explain their result.
- [x] Track Changes is not selectable unless confirmed and implemented.
- [x] Stale analysis blocks output.
- [x] Ready and failed states retain context.
- [x] M05/M06 support create and add-to-existing modes.
- [x] Only accepted recommendations create downstream product content.
- [x] Export history remains tied to the customer version.

## 5. Intentional Phase 6 boundaries

- Ask, Deliver-Back, Products, Substitution, Guide Specs, and baseline comparison were not hidden or removed (Phase 7).
- BOM and Submittal shared modules were not edited; destinations are SPEC-local dummy records.
- Native Track Changes remains Coming soon.
- First-analysis processing and Screen 02 breadcrumb were not changed.
- Recommendation IDs remain `rec:{documentId}:{citationId}`.
- Shared UI, shared tables, theme files, and design tokens were not modified.

## 6. Phase 7 starting point

Phase 7 may hide out-of-scope Release 1 navigation, harden empty/failure states, and update adopted documentation. Keep the canonical Export route. Continue to block export whenever `reanalysisRequired` is true.

Do not start Phase 7 until this handoff is reviewed.
