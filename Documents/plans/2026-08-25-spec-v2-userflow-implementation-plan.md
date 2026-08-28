# SPEC V2 User Flow Implementation Plan

**Date:** 2026-08-25
**Status:** Ready for product checkpoint and phased implementation
**UX source:** `Documents/SPEC/SPEC_V2_USER_FLOW_AND_SCREEN_AUDIT.md`
**Work type:** Future code implementation; this document does not authorize broad refactors

## 1. Goal

Align the existing SPEC prototype with the confirmed V2 Release 1 journey:

> Selected Project → Project SPEC list → Add SPEC → processing → Analysis Dashboard → Review and Edit → re-analysis after manual changes → Export → optional BOM/Submittal output.

The implementation should reshape existing SPEC architecture and local components. It must not change shared Hydra components, theme, typography, tokens, shell behavior, or unrelated modules.

## 2. Success definition

Release 1 is complete when a user can:

1. Open SPEC in an unambiguous selected-Project context.
2. Upload and validate a customer SPEC.
3. Confirm Division 21/22/23 and the exact ASC Master SPEC version.
4. Leave processing and return later.
5. Review prioritized recommendations with exact source evidence.
6. Accept, defer, deny, or edit recommendations.
7. Edit the complete document with basic formatting.
8. Re-run analysis after manual edits without losing valid decisions.
9. View customer and Master version history.
10. Export an approved document.
11. Create or update a project BOM or Submittal Package.
12. Recover from invalid input, analysis failure, editor lock, and export failure.

## 3. Non-goals

- Request Service / Ask / Deliver-Back
- Advanced organization Library/Search
- Saved searches and alerts
- Separate low-confidence queue
- Role-based Release 1 restrictions
- Real-time co-editing
- Native Word Track Changes before product confirmation
- Substitution, Guide Specs, and Get Specified as primary Release 1 tabs
- Shared component or design-token changes
- Backend or production persistence

Existing out-of-scope prototype routes should not be deleted without a separate product decision.

## 4. Delivery rules

- Implement one phase at a time.
- Start each phase from a clean understanding of current files; do not assume this plan remains line-for-line current.
- Keep a narrow file allowlist. Stop before changing files outside it.
- Attach `@hydra-ux-audit` to every UI implementation/review phase.
- Reuse Ant Design via `src/ui/antd.ts`.
- Reuse the current icon source only.
- Use `theme.useToken()`, established layout constants, and existing typography.
- Do not add raw color, spacing, radius, shadow, or typography values.
- Run `npx tsc --noEmit` and `npm run build` after substantive TypeScript changes.
- Run focused tests where available and add local SPEC tests for newly introduced workflow behavior.
- Visually verify relevant default, loading, empty, failure, disabled, and success states.
- Update `Documentation/hydra-app-capabilities.md` only after the adopted route/IA exists in code.

## 5. Cross-phase decisions and data contracts

### 5.1 Product checkpoint required before Phase 1

Resolve:

1. **Canonical URL**
   - Option A: `/projects/:projectId/spec` — recommended because ownership is explicit and deep links are durable.
   - Option B: `/spec` with mandatory selected-Project context — acceptable only if direct links restore the Project and no global library is implied.
2. **Visible Release 1 workspace navigation**
   - Recommended: Dashboard, Review & Edit, Export.
   - Processing and Re-analysis are workflow states, not permanent tabs.
3. **Baseline comparison**
   - Recommended: retain by direct route or demo control, remove from primary Release 1 tabs, and rename to avoid competing with recommendation Review.
4. **Native Track Changes**
   - Keep Coming soon until Matt confirms.
5. **Out-of-scope routes**
   - Recommended: retain implementation, hide from Release 1 navigation, and avoid destructive removal.

Document decisions in this plan’s implementation log or a short decision record before code.

### 5.2 Canonical workflow statuses

Use one status model across list, Project detail, routes, and actions:

- `uploading`
- `processing`
- `analysis-failed`
- `ready-to-review`
- `in-review`
- `reanalysis-required`
- `reanalyzing`
- `ready-to-export`
- `exporting`
- `export-failed`
- `exported`

Display labels may use sentence case. Derive status from facts when possible; avoid storing duplicate, contradictory status fields.

### 5.3 Recommendation contract

The V2 recommendation entity must support:

- stable recommendation ID;
- customer document/version ID;
- Master SPEC/version ID;
- section and paragraph locator;
- exact source citation;
- title and concise outcome;
- existing text;
- proposed text;
- reason;
- type/category;
- priority;
- supporting product evidence;
- review decision: not reviewed, accepted, later, denied;
- optional denial reason;
- decision timestamp;
- manual edit relationship;
- preserved/changed/resolved/new state after re-analysis.

Map current requirements, red flags, product suggestions, and corrections into this contract through repository/selectors. Do not make pages translate several incompatible domain models independently.

### 5.4 Version contract

Each customer SPEC version retains:

- immutable version ID and number;
- uploaded filename, date, and user;
- exact Master SPEC ID/version;
- validation and analysis state;
- recommendations and decisions;
- working document snapshot;
- export history.

Uploading a new version creates a new record. Re-analysis updates analysis for the current customer version and does not create a new customer-file version unless product later decides otherwise.

### 5.5 Stale-analysis invariant

- Manual document edits set `analysisIsCurrent = false`.
- Final export and downstream outputs are unavailable while false.
- Re-analysis returns it to true after successful completion.
- Accepted/denied decisions are preserved only when their related source text remains unchanged.

## 6. Phase overview

| Phase | User outcome | Main risk |
|---|---|---|
| 0 | Product and IA decisions are explicit | Building the wrong URL/navigation model |
| 1 | User sees Project SPECs and can start/version work | Breaking current global `/spec` links |
| 2 | Upload processing is trustworthy and recoverable | Duplicate process/status logic |
| 3 | User understands and starts recommendation review | Losing useful existing extraction evidence |
| 4 | User can decide and edit in context | Editor complexity and stale-analysis correctness |
| 5 | Re-analysis preserves valid work and explains changes | Silent decision loss |
| 6 | User exports and creates project outputs | Deliver-Back route coupling and output ambiguity |
| 7 | Release 1 is focused, accessible, tested, and documented | Hidden routes or stale navigation regressions |

## 7. Phase 0 — Product authority and IA checkpoint

### User outcome

No visible change. The team has one approved route, navigation, status, and Release 1 boundary before implementation.

### Work

1. Review the V2 audit with product/design.
2. Record decisions from section 5.1.
3. Confirm the status vocabulary.
4. Confirm whether undecided recommendations are allowed in an export and how they appear.
5. Confirm that BOM/Submittal outputs use accepted recommendations only.
6. Confirm whether historical baseline comparison remains directly accessible.

### File allowlist

- `Documents/SPEC/SPEC_V2_USER_FLOW_AND_SCREEN_AUDIT.md`
- `Documents/plans/2026-08-25-spec-v2-userflow-implementation-plan.md`
- Optional new decision record under `Documents/SPEC/`

Do not edit `src/**` in this phase.

### Risks

- Product discussion reopens already confirmed Release 1 decisions.
- Route strategy is deferred but implementation starts anyway.

### Acceptance criteria

- [ ] Canonical URL recorded.
- [ ] Visible Release 1 tabs recorded.
- [ ] Status vocabulary approved.
- [ ] Baseline comparison treatment recorded.
- [ ] Track Changes remains explicitly confirmed or pending.
- [ ] Output and undecided-recommendation rules recorded.

### Verification

- Documentation review only.

## 8. Phase 1 — Project SPEC list and entry flows

### User outcome

Inside a selected Project, the user can scan SPEC status, upload a SPEC through one consistent wizard, download an ASC Master, view version history, and upload a new version without overwriting history.

### Existing patterns to reuse

- BOM Project list/table chrome.
- `BomPageHeader`.
- `BomUploadDestinationModal` and `BomUploadFlowStepChrome` interaction hierarchy.
- Existing SPEC upload limits and repository abstractions.
- Existing Ant Design `Modal`, `Steps`, `Upload`, `Form`, `Select`, `Radio`, `Table`, `Empty`, `Alert`, and `Button`.

### Work

1. Implement the adopted Project-owned route/context.
2. Align sidebar and Project navigation without changing shell styling.
3. Refactor `SpecHomePage` into the selected-Project SPEC list:
   - required columns;
   - V2 status filter;
   - Division/System Type filter;
   - Last edited sort;
   - status-driven next action;
   - empty and no-results states.
4. Replace duplicate upload paths with W01:
   - Step 1 upload and validation;
   - Step 2 Division/Master confirmation;
   - Step 3 review/start;
   - validation error recovery.
5. Add M02 Master download.
6. Add M01 Version History.
7. Add W02 New Version and validation recovery.
8. Persist customer version and exact Master version in local repositories/store.
9. Route Start analysis to Processing.

### File allowlist

- `src/App.tsx` only if route mounting must change
- `src/shell/AppShellSidebar.tsx` only for route target/label wiring, not visuals
- `src/spec/SpecRoutes.tsx`
- `src/spec/specNavigation.ts`
- `src/spec/specWorkspaceTabs.ts`
- `src/spec/pages/SpecHomePage.tsx`
- `src/spec/pages/SpecAddDocumentPage.tsx`
- `src/spec/pages/SpecProjectDetailPage.tsx` only if retained in the adopted IA
- `src/spec/components/SpecWorkspaceHeader.tsx` only if the local header supports the Project list
- `src/spec/constants/specUploadLimits.ts`
- `src/spec/constants/specWorkflowStatus.ts`
- `src/spec/data/types.ts`
- `src/spec/data/specMockStore.ts`
- `src/spec/data/repositories/specRepositories.ts`
- `src/spec/data/specDocumentsSeed.ts`
- New local files under `src/spec/components/` for W01, W02, M01, and M02
- Focused tests colocated under `src/spec/`

Do not edit BOM, shell layout, shared tables, `src/ui/**`, or theme files.

### Risks

- Existing `/spec` bookmarks lose Project context.
- Seed data assumes organization ownership.
- Old `/spec/new` links remain reachable and create a second workflow.
- A stored workflow status diverges from facts.

### Acceptance criteria

- [ ] Landing screen is unambiguously scoped to one Project.
- [ ] Empty and populated list states follow existing Hydra patterns.
- [ ] One primary Upload SPEC action exists.
- [ ] W01 validates before creating a SPEC.
- [ ] User confirms/changes Division and exact Master version.
- [ ] Download Master creates no SPEC.
- [ ] New version never overwrites previous history.
- [ ] Version History shows customer and Master versions.
- [ ] Every status-driven action opens the correct next surface.
- [ ] Existing shared/core components and tokens are unchanged.

### Verification

- Keyboard walkthrough of list, overflow, both wizards, and both modals.
- Test invalid file, empty Project, and no-filter-results.
- `npx tsc --noEmit`
- `npm run build`
- `@hydra-ux-audit` on all changed UI.

## 9. Phase 2 — Processing and recovery

### User outcome

The user can understand analysis progress, leave safely, return later, and recover from failure or invalid input.

### Existing patterns to reuse

- Current `SpecProcessingPage`.
- `SpecProcessingStages`.
- `useSpecProcessingSimulation`.
- BOM pending upload/progress and alert conventions.

### Work

1. Replace technical/extraction stages with the four V2 stages.
2. Show Project, customer SPEC/version, Division, and Master version.
3. Make Back to SPEC list safe while processing continues.
4. Ensure list status and processing state use one source of truth.
5. Add processing failure:
   - Retry analysis;
   - Replace file;
   - Back to list.
6. Ensure completion routes to the Analysis Dashboard.
7. Ensure re-entry to a complete job routes to results rather than replaying processing.
8. Add accessible progress announcements.

### File allowlist

- `src/spec/pages/SpecProcessingPage.tsx`
- `src/spec/components/SpecProcessingStages.tsx`
- `src/spec/hooks/useSpecProcessingSimulation.ts`
- `src/spec/constants/specWorkflowStatus.ts`
- `src/spec/data/types.ts`
- `src/spec/data/specMockStore.ts`
- `src/spec/data/repositories/specRepositories.ts`
- `src/spec/data/specScenarios.ts`
- `src/spec/SpecRoutes.tsx` only for corrected destination
- Focused tests under `src/spec/`

### Risks

- Processing component maintains local state that disagrees with repository state.
- Retry creates duplicate documents or versions.
- Completion auto-navigation interrupts users who already left.

### Acceptance criteria

- [ ] Four understandable stages and overall progress are visible.
- [ ] Exact input and Master version are visible.
- [ ] Leaving does not cancel analysis.
- [ ] Returning restores current or completed state.
- [ ] Failure offers Retry, Replace, and Back.
- [ ] Retry does not duplicate the customer version.
- [ ] Successful completion opens Analysis Dashboard.
- [ ] Progress updates are accessible.

### Verification

- Test active, complete, failed, retrying, and return-later scenarios.
- `npx tsc --noEmit`
- `npm run build`
- `@hydra-ux-audit`.

## 10. Phase 3 — Analysis Dashboard

### User outcome

The user understands the quality of the analyzed SPEC, can filter recommendations, sees exact evidence, and starts or continues review confidently.

### Existing patterns to reuse

- Current citation, requirement, red-flag, and product-suggestion data.
- `SpecCitationLink`, `SpecDocumentViewer`, `SpecRequirementCard`, `SpecRedFlagCard`, and `SpecProductSuggestionCard` where their semantics still fit.
- BOM matching stats, filters, and drill-in composition.

### Work

1. Add repository/selectors that map existing findings into the V2 recommendation contract.
2. Recompose `SpecAnalyzePage`:
   - document status/header;
   - overall assessment;
   - recommendation/high-priority/reviewed counts;
   - TOC;
   - priority/category/review-status filters;
   - item-by-item recommendation list.
3. Make exact source navigation first-class.
4. Route Start/Continue review to Review and Edit.
5. Route Export to the eventual canonical destination, or disable it with truthful copy until Phase 6.
6. Add successful no-recommendations state.
7. Remove separate low-confidence queue behavior from the Release 1 page.
8. Ensure no requirement/red-flag extraction details compete with the primary recommendation model.

### File allowlist

- `src/spec/pages/SpecAnalyzePage.tsx`
- `src/spec/components/SpecCitationLink.tsx`
- `src/spec/components/SpecDocumentViewer.tsx`
- `src/spec/components/SpecRequirementCard.tsx`
- `src/spec/components/SpecRedFlagCard.tsx`
- `src/spec/components/SpecProductSuggestionCard.tsx`
- `src/spec/components/SpecConfidenceTag.tsx` only to remove/de-emphasize conflicting page use
- New local recommendation components under `src/spec/components/`
- `src/spec/data/types.ts`
- `src/spec/data/repositories/specRepositories.ts`
- `src/spec/data/specAnalysisSeed.ts`
- `src/spec/data/specProductsSeed.ts`
- `src/spec/hooks/useSpecDeepLink.ts`
- `src/spec/specAnalytics.ts` only for event names/payloads needed by the new journey
- `src/spec/SpecRoutes.tsx`
- Focused tests under `src/spec/`

### Risks

- Flattening findings loses source accuracy.
- Recommendation IDs change across renders and break decisions.
- Filters hide undecided high-priority items without clear indication.

### Acceptance criteria

- [ ] Header identifies document, Division, and exact Master version.
- [ ] Rollup metrics match displayed recommendation data.
- [ ] User can filter by priority, type, and review state.
- [ ] Every recommendation has exact source evidence.
- [ ] Start/Continue review opens the correct item.
- [ ] No recommendations is clearly successful.
- [ ] No separate low-confidence workflow is visible.
- [ ] Existing useful evidence remains available through progressive disclosure.

### Verification

- Test zero, one, many, and mixed-decision recommendation sets.
- Test source deep links.
- Test filter combinations and no-results-within-filter.
- `npx tsc --noEmit`
- `npm run build`
- `@hydra-ux-audit`.

## 11. Phase 4 — Review and Edit

### User outcome

The user reviews one recommendation at a time, understands evidence, accepts/defers/denies, edits the complete document, and knows when edits require re-analysis.

### Existing patterns to reuse

- Current `SpecEditPage`.
- `SpecSectionNavigator`, `SpecDocumentViewer`, `SpecCorrectionDrawer`, and editor repositories.
- BOM progressive matching and decision-footer hierarchy.
- Existing Ant Design `Alert`, `Drawer`, `Modal`, `Form`, `Input`, `Button`, `Tooltip`, and `Typography`.

### Work

1. Recompose editor into TOC / full-document editor / recommendation detail.
2. Support previous/next and Recommendation N of M.
3. Show priority, type, existing/proposed text, reason, source, and product evidence.
4. Implement Accept, Later, Deny, and Edit proposal.
5. Implement M03 optional denial reason.
6. Auto-save decisions and text changes.
7. Mark analysis stale after manual document edits.
8. Add stale-analysis banner and block Export.
9. Add one-editor lock:
   - lock owner;
   - read-only mode;
   - refresh;
   - timeout/release simulation.
10. Keep baseline comparison out of the main Review meaning.

### File allowlist

- `src/spec/pages/SpecEditPage.tsx`
- `src/spec/pages/SpecReviewPage.tsx` only to rename/defer baseline comparison within adopted routing
- `src/spec/components/SpecSectionNavigator.tsx`
- `src/spec/components/SpecDocumentViewer.tsx`
- `src/spec/components/SpecCorrectionDrawer.tsx`
- `src/spec/components/SpecChangeReviewPanel.tsx`
- `src/spec/components/SpecPermissionBoundary.tsx` only to remove conflicting Release 1 gating from this flow
- New local recommendation-detail and denial-modal components under `src/spec/components/`
- `src/spec/data/types.ts`
- `src/spec/data/specEditorSeed.ts`
- `src/spec/data/specReviewSeed.ts`
- `src/spec/data/specMockStore.ts`
- `src/spec/data/repositories/specRepositories.ts`
- `src/spec/hooks/useSpecCorrection.ts`
- `src/spec/context/SpecWorkspaceContext.tsx`
- `src/spec/SpecRoutes.tsx`
- `src/spec/specWorkspaceTabs.ts`
- Focused tests under `src/spec/`

### Risks

- Full-document editing scope expands beyond current editor capability.
- Auto-save masks an error.
- Recommendation decisions and edited text become inconsistent.
- Lock demo creates permanent false locks.

### Acceptance criteria

- [ ] User can navigate all recommendations without returning to Dashboard.
- [ ] Recommendation detail includes all required evidence.
- [ ] Accept, Later, and Deny save and update counts.
- [ ] Denial reason is optional and retained.
- [ ] Full document is editable with basic formatting.
- [ ] Auto-save status is truthful.
- [ ] Manual edits immediately require re-analysis.
- [ ] Export cannot proceed while analysis is stale.
- [ ] Lock state is read-only, names the editor, and offers Refresh.
- [ ] One clear primary decision exists per recommendation.

### Verification

- Keyboard walkthrough of TOC, recommendation navigation, decisions, and M03.
- Test autosave success/failure if failure simulation exists.
- Test lock acquire, read-only, release, and refresh.
- Test manual edit → stale banner → blocked Export.
- `npx tsc --noEmit`
- `npm run build`
- `@hydra-ux-audit`.

## 12. Phase 5 — Re-analysis and decision preservation

### User outcome

After editing, the user understands why re-analysis is needed, knows what is preserved, sees progress, and returns to the updated editor with a clear change summary.

### Existing patterns to reuse

- Processing page and stages.
- Existing workflow status derivation.
- Existing recommendation and working-copy repositories.

### Work

1. Implement M04 Confirm Re-analysis.
2. Add the explicit Re-analysis screen/route.
3. Add four V2 stages and leave/return behavior.
4. Compare previous recommendation source ranges with the edited document.
5. Preserve valid accepted/denied decisions when related source is unchanged.
6. Mark recommendations as new, changed, resolved, or preserved.
7. Add completion summary.
8. Return to Review and Edit at the next relevant recommendation.
9. Ensure failure restores a safe retry state without losing edits or old decisions.

### File allowlist

- `src/spec/SpecRoutes.tsx`
- `src/spec/specNavigation.ts`
- `src/spec/constants/specWorkflowStatus.ts`
- New `src/spec/pages/SpecReanalysisPage.tsx`
- New local M04/progress/completion components under `src/spec/components/`
- `src/spec/components/SpecProcessingStages.tsx` only if safely parameterized without changing existing behavior
- `src/spec/pages/SpecEditPage.tsx` only for the M04 trigger and return state
- `src/spec/data/types.ts`
- `src/spec/data/specMockStore.ts`
- `src/spec/data/repositories/specRepositories.ts`
- `src/spec/hooks/useSpecProcessingSimulation.ts` only if safely extended
- `src/spec/context/SpecWorkspaceContext.tsx`
- Focused tests under `src/spec/`

### Risks

- Preservation logic silently attaches a decision to changed text.
- Re-analysis mutates historical customer versions.
- Failure loses working document edits.

### Acceptance criteria

- [ ] M04 explains exact Master version, preservation, and export blocking.
- [ ] Re-analysis progress is distinct from first analysis.
- [ ] User can leave and return.
- [ ] Working edits survive success and failure.
- [ ] Only unchanged-source decisions are preserved.
- [ ] Completion shows new, changed, resolved, and preserved counts.
- [ ] Return opens the updated editor.
- [ ] Analysis becomes current only after success.

### Verification

- Unit-test preservation for unchanged, changed, deleted, and new source.
- Test failure and retry.
- Test leave and return.
- `npx tsc --noEmit`
- `npm run build`
- `@hydra-ux-audit`.

## 13. Phase 6 — Export and downstream outputs

### User outcome

The user can generate a transparent document output and create or update a Project BOM or Submittal Package from approved recommendations.

### Existing patterns to reuse

- Existing Deliver-Back output preview logic where semantically compatible.
- Existing BOM Project destinations and selector patterns.
- Existing Submittals local data.
- Standard Hydra modal footer and success/failure feedback.

### Work

1. Add canonical Export route and Screen 06.
2. Route Ready to Export/Exported actions there instead of Deliver-Back.
3. Show version trace and decision summary.
4. Implement output choices:
   - clean final;
   - revision-history appendix;
   - original with comparison appendix;
   - Track Changes as Coming soon unless confirmed.
5. Implement export generating, ready, download, and failure/retry states.
6. Add M05 BOM output:
   - Create new;
   - Add to existing;
   - Project-local destination.
7. Add M06 Submittal output with the same mode logic.
8. Use accepted product recommendations only.
9. Persist export/output history to the current customer version.
10. Keep Deliver-Back out of the Release 1 primary journey.

### File allowlist

- `src/spec/SpecRoutes.tsx`
- `src/spec/specNavigation.ts`
- `src/spec/specWorkspaceTabs.ts`
- New `src/spec/pages/SpecExportPage.tsx`
- `src/spec/pages/SpecDeliverBackPage.tsx` only to extract/reuse local logic or redirect legacy links
- `src/spec/pages/SpecHomePage.tsx` only for corrected next actions
- `src/spec/pages/SpecEditPage.tsx` only for Export navigation
- New local export, M05, and M06 components under `src/spec/components/`
- `src/spec/data/types.ts`
- `src/spec/data/specArtifactsSeed.ts`
- `src/spec/data/specMockStore.ts`
- `src/spec/data/repositories/specRepositories.ts`
- `src/spec/data/specCollaborationSeed.ts` only if it currently stores export records
- Focused tests under `src/spec/`

Do not edit BOM or Submittal module shared components. Use local dummy selectors and repository handoff until a separate cross-module contract is approved.

### Risks

- Legacy Deliver-Back behavior remains the actual destination.
- Output choices overpromise Track Changes.
- BOM/Submittal update selectors imply production cross-module persistence.
- Export ignores stale analysis.

### Acceptance criteria

- [ ] Canonical Export route exists.
- [ ] List and editor Export actions use it.
- [ ] Export identifies customer and Master versions.
- [ ] All supported output choices explain their result.
- [ ] Track Changes is not selectable unless confirmed and implemented.
- [ ] Stale analysis blocks output.
- [ ] Ready and failed states retain context.
- [ ] M05/M06 support create and add-to-existing modes.
- [ ] Only accepted recommendations create downstream product content.
- [ ] Export history remains tied to the customer version.

### Verification

- Test each document option.
- Test stale-analysis blocking.
- Test generating, ready, failure, and retry.
- Test BOM/Submittal create and existing selection validation.
- `npx tsc --noEmit`
- `npm run build`
- `@hydra-ux-audit`.

## 14. Phase 7 — Scope cleanup, hardening, and adopted documentation

### User outcome

The Release 1 journey is focused, accessible, predictable, and represented accurately in project documentation.

### Work

1. Hide/defer out-of-scope workspace tabs from Release 1 navigation:
   - Products as a standalone tab;
   - Submittals as a standalone tab;
   - Substitution;
   - Ask;
   - Deliver-Back;
   - baseline Review;
   - Guide Specs.
2. Preserve direct routes only if product approved that treatment.
3. Remove organization-library and role/low-confidence concepts from primary-flow copy.
4. Correct route destinations, back links, breadcrumbs, and labels.
5. Run accessibility pass:
   - headings;
   - labels;
   - focus;
   - keyboard;
   - live regions;
   - text status;
   - reduced motion.
6. Verify all state variants.
7. Add route/workflow integration tests.
8. Update capabilities documentation to the adopted route/IA.
9. Add an implementation note to the V2 audit if delivered behavior intentionally differs.

### File allowlist

- `src/spec/SpecRoutes.tsx`
- `src/spec/specNavigation.ts`
- `src/spec/specWorkspaceTabs.ts`
- `src/spec/specAnalytics.ts`
- `src/spec/context/SpecDemoContext.tsx`
- `src/spec/components/SpecDemoControls.tsx`
- SPEC pages/components changed in Phases 1–6, only for defects found during verification
- `src/App.tsx` only for final route alignment
- `src/shell/AppShellSidebar.tsx` only for final route/label alignment
- Focused tests under `src/spec/`
- `Documentation/hydra-app-capabilities.md`
- `Documents/SPEC/SPEC_V2_USER_FLOW_AND_SCREEN_AUDIT.md`

Do not turn this phase into visual redesign or unrelated cleanup.

### Risks

- Hiding tabs leaves orphaned links or incorrect analytics.
- Broad “hardening” expands scope.
- Documentation is updated before code is actually adopted.

### Acceptance criteria

- [ ] Visible navigation matches approved Release 1 scope.
- [ ] No primary action routes to Deliver-Back or the wrong semantic page.
- [ ] No role restriction blocks Release 1.
- [ ] No separate low-confidence workflow is visible.
- [ ] All listed states have a verified UI.
- [ ] Keyboard and focus journeys pass.
- [ ] Route/workflow tests cover the happy path and key recovery paths.
- [ ] Capabilities documentation matches implemented routes.
- [ ] No shared/core component or token changed.
- [ ] No raw visual values introduced.

### Verification

- Full journey: empty Project → upload → processing → review/edit → re-analysis → export → BOM/Submittal.
- Recovery journey: invalid file, analysis failure, lock, export failure.
- Version journey: upload v1 → decisions/export → upload v2 → history preserved.
- `npx tsc --noEmit`
- `npm run build`
- focused tests
- `ReadLints` on edited files
- final `@hydra-ux-audit`.

## 15. Test matrix

### Routing

- Direct Project SPEC list link.
- Processing route after wizard.
- Complete processing opens Dashboard.
- Start/Continue review opens correct recommendation.
- Manual edit opens re-analysis confirmation.
- Successful re-analysis returns to editor.
- Ready-to-export action opens Export.
- Legacy/out-of-scope routes follow the approved treatment.

### Upload and versions

- PDF valid.
- DOCX valid.
- Scanned document note.
- Unsupported file.
- Oversized file.
- Non-SPEC file.
- Retry same file.
- Replace file.
- Master auto-selection and override.
- New version creates increment and preserves history.

### Recommendations

- Zero recommendations.
- Mixed priorities/types.
- Accept, Later, Deny with/without reason.
- Manual proposal edit.
- Exact source deep link.
- Filter no results.
- Re-analysis new/changed/resolved/preserved.

### Editor

- Full-document edit.
- Save state.
- Lock read-only.
- Lock refresh/release.
- Stale-analysis blocking.
- Keyboard recommendation navigation.

### Export and outputs

- Clean final.
- Revision appendix.
- Original comparison appendix.
- Track Changes pending.
- Generate success/failure/retry.
- Create/update BOM.
- Create/update Submittal Package.
- Existing destination required.
- Only accepted products included.

## 16. Rollout and review strategy

Prefer one reviewable change set per implementation phase. If a phase becomes too large, split it by the user-visible outcome, not by technical layer. Examples:

- Phase 1A: Project list and route context.
- Phase 1B: Add SPEC wizard and Master download.
- Phase 1C: Version history and new-version wizard.
- Phase 4A: Recommendation review decisions.
- Phase 4B: Full-document editing, autosave, and lock.
- Phase 6A: Document export.
- Phase 6B: BOM/Submittal outputs.

Do not merge later-phase cleanup into an earlier phase merely because the files overlap.

## 17. Implementation log template

Complete this section during future work; do not pre-mark items.

### Phase [N]

- Decision changes:
- Files changed:
- Existing patterns reused:
- Components used:
- Tokens preserved:
- Tests run:
- UX states verified:
- Deferred:
- Intentional deviations from the audit:

## 18. Definition of done

- [ ] Phase 0 product decisions recorded.
- [ ] Phases 1–7 acceptance criteria pass.
- [ ] V2 audit and code agree.
- [ ] `Documentation/hydra-app-capabilities.md` reflects adopted routes.
- [ ] Existing out-of-scope functionality is preserved or intentionally retired by a separate decision.
- [ ] No shared/core component, theme, or token changes.
- [ ] No raw design values.
- [ ] TypeScript, build, focused tests, lints, and UX audit pass.
