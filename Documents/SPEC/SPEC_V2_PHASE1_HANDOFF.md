# SPEC V2 — Phase 1 → Phase 2 Handoff

**Date:** 2026-08-25
**Status:** Phase 1 implemented and verified. Awaiting your review before Phase 2 starts.
**References:**
- `Documents/SPEC/SPEC_V2_USER_FLOW_AND_SCREEN_AUDIT.md` (sections 5.1, 6, 7, 10)
- `Documents/plans/2026-08-25-spec-v2-userflow-implementation-plan.md` (sections 8, 9)
- `Documents/SPEC/SPEC_V2_PHASE0_DECISION_RECORD.md`

This record does not modify the audit, the implementation plan, or the Phase 0 decision record.

## 1. Phase 1 — what shipped

**Screen 01 — Project SPEC list** (`src/spec/pages/SpecHomePage.tsx`, rewritten): selected-Project scope only via the `:projectId` route param — no org-wide library view. Header (title/description, secondary Download Master, primary Upload SPEC), table with search + Status filter + Division/System Type filter + Last-updated sort, required columns (SPEC name, Division/System Type, Version, Last updated, Status, Review progress, Next action, Actions/overflow), empty state, no-results state, external pagination. Reuses `BomPageHeader` / `BomTableRowActions` / BOM table chrome per audit §10.

**New local components (`src/spec/components/`):**
- `SpecAddDocumentWizardModal.tsx` — **W01** Add SPEC (3 steps: Upload → Confirm Master → Review/start). File is validated before any `SpecDocument` is created; Master SPEC confirmation happens in step 2 and is persisted with the document.
- `SpecUploadNewVersionModal.tsx` — **W02** Upload new version (2 steps). Never overwrites — pushes the prior version into `previousVersions` via the new `createNewVersion` repository method.
- `SpecVersionHistoryModal.tsx` — **M01** Version history. Reverse-chronological cards (current + previous) with uploader, review state, and exact Master SPEC version. Footer is primary "Upload new version" only, per audit §7.1.
- `SpecDownloadMasterModal.tsx` — **M02** Download ASC Master SPEC. Division radio-cards + version selector, backed by the new `SPEC_MASTER_CATALOG` export in `specDocumentsSeed.ts`. Creates no document.

**Data/type changes:** `SpecDocumentVersionRecord` type + `versionNumber`/`previousVersions` fields on `SpecDocument` (`types.ts`); `createNewVersion` and `remove` on `SpecDocumentRepository` (`specRepositories.ts`); `removeSpecDocument` mutator (`specMockStore.ts`); `SPEC_MASTER_CATALOG` catalog export (`specDocumentsSeed.ts`); canonical 11-status vocabulary in `specWorkflowStatus.ts` (removed `master-confirmation-required` — master is now confirmed in W01 step 2, before the document exists).

**Routing:** canonical `/projects/:projectId/spec` mounted top-level in `App.tsx` (BOM-style, not nested under `ProjectWorkspaceLayout`); legacy `/spec` redirects into the resolved Project's list via `SpecLegacyIndexRedirect.tsx`; `AppShellSidebar.tsx` and `ProjectWorkspaceLayout.tsx` wired to the new path.

**Removed:** `SpecAddDocumentPage.tsx`, `SpecProjectDetailPage.tsx` — superseded by the modal wizards and the list itself.

Delete SPEC is available from the list row overflow via `modal.confirm` (BOM pattern), visually separated/destructive.

### 1.1 Wireframe parity correction (Screen 01)

The initial Screen 01 build was composed from the audit's prose spec + loosely-borrowed BOM conventions, not from the actual Figma Wireframe node. Pulled `get_figjam` on node `2278:599` (file `OvxMEc7zwbtW7q2Vx0EVeW`, page "Wireframes") and corrected `SpecHomePage.tsx` + the breadcrumb branch to match:

- **Breadcrumb:** was `Spec / [Project]` (2 levels, module first) → now `Projects / [Project] / SPEC` (3 levels, matching the wireframe exactly) in `buildAppBreadcrumbItems.tsx`.
- **Table card:** added the missing "SPEC documents" panel title row + divider above the filter toolbar.
- **Filter toolbar layout:** Search/Status/Division/Clear now group on the left; "Last updated" sort control moved to the right (`justify="space-between"`), matching the wireframe's separated "Last edited ⇅" placement.
- **Table "Actions" column:** changed from a `type="link"` text action to a real outlined `Button` per row (the wireframe shows a bordered button — "Continue review" / "Start review" / "Retry" / etc. — not a link). Renamed columns to match the wireframe exactly: the primary per-row action column is titled "Actions"; the trailing ⋮ overflow column has no title.
- **Footer pagination:** replaced the hand-rolled `Flex` + `Pagination` + `showTotal` with the existing shared `src/bom/components/BomTablePaginationBar.tsx` (left summary text + right pager) — this component was already the designated golden reference in audit §10 and had been missed on the first pass.
- **Header description copy:** aligned to the wireframe's exact text ("Upload, analyze, review, and export specifications for this Project.").

**New standard process going forward (Phase 2 onward):** before implementing any screen/wizard/modal, pull its Wireframe node via `get_figjam` (FigJam board) using the node IDs already listed in the audit's Wireframe inventory (§2.4), decompose the actual layout, and only then map it onto existing `src/ui/antd.ts` components and Hydra patterns — rather than working from the prose description alone.

### 1.2 Deviations beyond the strict Phase 1 file allowlist (flagged, not silent)

- **`src/App.tsx`:** removed the orphaned `/projects/:projectId/sales-brace` → `SalesBraceModule` route (the old, mislabeled "Spec" destination) and replaced it with a redirect to the canonical `/projects/:projectId/spec`, so no stale bookmark shows the stale placeholder content.
- **`src/shell/buildAppBreadcrumbItems.tsx`:** repointed that same dead `/sales-brace` breadcrumb branch to `/spec`. Without this fix the canonical route had no breadcrumb at all, failing the Screen 01 requirement ("Breadcrumb: Projects / Project / SPEC," audit §5.1).

Both are narrow, mechanical consequences of the route rename Phase 0/1 already authorized, not a broader refactor. **Please confirm these are acceptable** — if not, they're easy to revert independently of the rest of Phase 1.

## 2. Verification

- `npx tsc --noEmit` — clean.
- `npm run build` — succeeds.
- `ReadLints` on all touched/created files — no errors.
- Self-audit pass per `@hydra-ux-audit`: button-size consistency in table rows/cards (`size="small"` on inline row/card actions), no design literals (`#hex`/`rgba`/ad-hoc `fontSize`), single primary CTA per surface, empty/error/no-results states present.

### 2.1 Phase 1 acceptance criteria (plan §8)

- [x] Landing screen is unambiguously scoped to one Project.
- [x] Empty and populated list states follow existing Hydra patterns.
- [x] One primary Upload SPEC action exists.
- [x] W01 validates before creating a SPEC.
- [x] User confirms/changes Division and exact Master version.
- [x] Download Master creates no SPEC.
- [x] New version never overwrites previous history.
- [x] Version History shows customer and Master versions.
- [x] Every status-driven action opens the correct next surface.
- [x] Existing shared/core components and tokens are unchanged.

## 3. Phase 2 handoff — Processing and recovery (plan §9)

**User outcome:** understand analysis progress, leave safely, return later, and recover from failure or invalid input.

**Reuse:** current `SpecProcessingPage`, `SpecProcessingStages`, `useSpecProcessingSimulation`, plus BOM's pending-upload/progress and alert conventions.

### 3.1 Work items

1. Replace the technical/extraction stages with the four V2 stages (file validated → document structure created → compare against Master SPEC/product data → generate item-by-item recommendations).
2. Show Project, customer SPEC/version, Division, and exact Master version in the setup summary.
3. Make "Back to SPEC list" safe while processing continues in the background.
4. Ensure list status and processing state use one source of truth.
5. Add processing failure recovery: Retry analysis, Replace file, Back to list.
6. Ensure completion routes to the Analysis Dashboard.
7. Ensure re-entry to a complete job routes to results rather than replaying processing.
8. Add accessible progress announcements (polite live region).

### 3.2 File allowlist

- `src/spec/pages/SpecProcessingPage.tsx`
- `src/spec/components/SpecProcessingStages.tsx`
- `src/spec/hooks/useSpecProcessingSimulation.ts`
- `src/spec/constants/specWorkflowStatus.ts`
- `src/spec/data/types.ts`
- `src/spec/data/specMockStore.ts`
- `src/spec/data/repositories/specRepositories.ts`
- `src/spec/data/specScenarios.ts`
- `src/spec/SpecRoutes.tsx` (corrected destination only)
- Focused tests under `src/spec/`

Do not touch BOM, shell layout, shared tables, `src/ui/**`, or theme files.

### 3.3 Concrete gaps found while reading the current code (starting points, not yet fixed)

- `useSpecProcessingSimulation.ts` still drives the old `PROCESSING_STAGE_ORDER` (7 stages: `upload-received`, `ocr-layout`, `section-detection`, `requirement-extraction`, `red-flag-analysis`, `citation-mapping`, `finalizing`) — needs to become the 4 canonical V2 stages, likely via a new stage-order constant plus a relabeling pass.
- `SpecProcessingPage.tsx` still uses `specHomePath()` (unscoped `/spec`) for its back button and has no Project/Division/Master-version setup summary panel — needs `specProjectListPath(document.projectId)` and the summary block from audit §5.2.
- Cancel is currently a `modal.confirm` from a trigger inside `SpecProcessingStages`; audit says "do not show Cancel as a dominant action" — worth checking its current visual weight once inside that file.
- Retry reuses `mockSpecDocumentRepository.retryProcessing`, which resets `stages`/`processingState` in place — should already satisfy "Retry does not duplicate the customer version," but confirm against the new 4-stage shape.

### 3.4 Risks (plan §9)

- Processing component maintains local state that disagrees with repository state.
- Retry creates duplicate documents or versions.
- Completion auto-navigation interrupts users who already left.

### 3.5 Phase 2 acceptance criteria (plan §9)

- [ ] Four understandable stages and overall progress are visible.
- [ ] Exact input and Master version are visible.
- [ ] Leaving does not cancel analysis.
- [ ] Returning restores current or completed state.
- [ ] Failure offers Retry, Replace, and Back.
- [ ] Retry does not duplicate the customer version.
- [ ] Successful completion opens Analysis Dashboard.
- [ ] Progress updates are accessible.

### 3.6 Verification plan

- Test active, complete, failed, retrying, and return-later scenarios (via the Spec demo scenario switcher).
- `npx tsc --noEmit`
- `npm run build`
- `@hydra-ux-audit`

## 4. Gate

Per the standing instruction to work one phase at a time: **do not start Phase 2 implementation until this handoff (including section 1.2 deviations) is reviewed and Phase 2 scope is confirmed.**
