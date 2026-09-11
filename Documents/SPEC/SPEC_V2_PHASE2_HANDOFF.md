# SPEC V2 — Phase 2 → Phase 3 Handoff

**Date:** 2026-08-25
**Status:** Phase 2 implemented and verified. Awaiting your review before Phase 3 starts.
**References:**
- `Documents/SPEC/SPEC_V2_USER_FLOW_AND_SCREEN_AUDIT.md` (sections 2.4, 5.2)
- `Documents/plans/2026-08-25-spec-v2-userflow-implementation-plan.md` (section 9)
- `Documents/SPEC/SPEC_V2_PHASE0_DECISION_RECORD.md`
- `Documents/SPEC/SPEC_V2_PHASE1_HANDOFF.md`

This record does not modify the audit, the implementation plan, or the Phase 0 decision record.

## 1. Wireframe pull (mandatory first step)

Pulled Official Figma MCP `get_figjam` on node `2282:764` (file `OvxMEc7zwbtW7q2Vx0EVeW`, frame **02 — Processing**). The node is a FigJam/wireframe frame; `get_figjam` succeeded (no fallback).

Related inventory nodes for this phase: none. Failure recovery is specified in audit §5.2 only (no separate failed-state wireframe). W02 is the new-version wizard from Phase 1, not the Screen 02 Replace-file recovery.

### 1.1 What the wireframe actually shows (active processing)

- **Shell (untouched):** sidebar + topbar.
- **Breadcrumb:** `Projects / [Project] / SPEC / [SPEC name] / Processing` (five levels). Not changed here — `buildAppBreadcrumbItems.tsx` is outside the Phase 2 allowlist.
- **Back:** bordered default Button **Back to SPEC list** above the heading (not a link).
- **Title:** `Analyzing [SPEC]`.
- **Subtitle (exact):** “Analysis continues in the background. You can leave this page and return later. We will continue processing and update the SPEC status in the Project list.”
- **Left card — Analysis in progress:** title + `{n}% complete` on the right; progress bar; **Current step** label + description; divider; **Analysis steps** heading; four stages with complete / in-progress / waiting detail copy.
- **Right card — Analysis setup:** Selected Project; Customer SPEC (`[name] — Version n`); Category (`Division nn — [system]`); Master SPEC (`Division nn — Version x.y`).
- **No Cancel, Retry, or Next** on the active view.

Canonical stages (wireframe + audit): File validated → Document structure created → Compare against Master SPEC and product data → Generate item-by-item recommendations.

## 2. Phase 2 — what shipped

**Screen 02 — Processing** (`SpecProcessingPage.tsx`, `SpecProcessingStages.tsx`): two-column layout matching the wireframe (progress card + Analysis setup card). Back routes to `specProjectListPath(document.projectId)`. Completion (`processingState === 'ready'`) replace-navigates to the Analysis Dashboard (`specAnalyzePath`). Re-entry to a complete job therefore never replays processing.

**Four V2 stages:** `V2_PROCESSING_STAGE_ORDER` in `specWorkflowStatus.ts` reuses the first four legacy stage IDs with V2 labels (handoff-prescribed relabeling pass). `projectStagesToV2()` maps leftover 7-stage seed arrays onto those four so `specDocumentsSeed.ts` / `specSeedHelpers.ts` (outside the allowlist) still type-check. Create / retry / replace / new-version persist only the four-stage shape.

**Background processing:** ticker lives in `specMockStore.ts`. Leaving Screen 02 does not cancel work. The ticker starts on create/retry/replace and when the processing page mounts for an in-progress document; it does not auto-start on module load, so frozen seed fixtures stay still until opened.

**Failure recovery:** title + plain-language reason; setup panel remains; primary **Retry analysis**; secondary **Replace file** (hidden file input, same validation as W01); Back stays the page-level bordered button. Replace updates `fileName` / size / type on the **same** customer version and re-queues analysis — it does not call `createNewVersion`. Retry likewise patches in place.

**Cancel:** removed from the active view (wireframe has none; audit: do not show Cancel as a dominant action). `cancelProcessing` remains on the repository for leftover cancelled records; the page offers Retry if that state is opened.

**Accessibility:** polite live region on percent complete and on Current step; failure uses `role="alert"` on the error Alert.

**`SpecRoutes.tsx`:** no destination correction required. Processing is already `:specId/processing`; completion is handled on the page.

## 3. Verification

- `npx tsc --noEmit` — clean.
- `npm run build` — succeeds.
- `ReadLints` on all touched files — no errors.
- Playwright against the running app (system Chrome):
  - **Active** (Clean Division 22 → `spec-processing-21`): four V2 stages, setup panel, Back to SPEC list, no Cancel.
  - **Return later:** Back landed on `/projects/2/spec`; reopening the processing URL restored current/completed state and redirected to Analyze once ready.
  - **Complete re-entry:** `/spec/spec-clean-22/processing` → `/spec/spec-clean-22/analyze`.
  - **Failed** (Failed processing → `spec-failed-1`): failure title, Retry, Replace, Back, setup panel, no Cancel.
  - **Retry:** same document id (`spec-failed-1`), four V2 stages, in-progress; no new version record.

Self-audit pass per `@hydra-ux-audit`: one primary CTA on failure (Retry analysis, large); Replace is default large in the same group; Back is default navigational (PageBackButton / BOM upload-back pattern); no design literals; empty/error/not-found handled; Cancel is not a competing primary.

## 4. Phase 2 acceptance criteria (plan §9 / handoff §3.5)

- [x] Four understandable stages and overall progress are visible.
- [x] Exact input and Master version are visible (Master shows “Not recorded” when the seed has no `ascMaster`).
- [x] Leaving does not cancel analysis.
- [x] Returning restores current or completed state.
- [x] Failure offers Retry, Replace, and Back.
- [x] Retry does not duplicate the customer version.
- [x] Successful completion opens Analysis Dashboard.
- [x] Progress updates are accessible.

## 5. Intentional deviations / known gaps (not silent)

- **Stage IDs:** V2 copy is a relabel of the first four legacy IDs. New ID strings were not introduced because `processingStageLabel: Record<SpecProcessingStageId, string>` in `specStatusVocabulary.ts` (outside the allowlist) would break. Seed 7-stage arrays are projected at display/tick time.
- **Replace file** is in-place on the current version, not W02 (W02 creates Version n+1). Audit §5.2 lists Replace as Screen 02 failure recovery; W02 is a separate new-version wizard.
- **Breadcrumb** still does not match the wireframe’s five-level `Projects / Project / SPEC / [name] / Processing`. That file is outside this allowlist (same class of gap Phase 1 had to flag for the list breadcrumb).
- **Failed-state layout** has no wireframe node; composed from audit §5.2 + the active Screen 02 regions (setup panel kept).
- **`SpecRoutes.tsx`** was not edited.

## 6. Phase 3 handoff — Analysis Dashboard (plan §10)

**User outcome:** understand the quality of the analyzed SPEC, filter recommendations, see exact evidence, and start or continue review.

**Starting points from this phase:** completion and re-entry already land on `SpecAnalyzePage` via `specAnalyzePath`. Processing no longer offers an “Open analysis” header CTA while work is running. Partial results, if still present on the large-project-manual fixture, are labeled explicitly and use a secondary Open analysis control.

Do not start Phase 3 until this handoff is reviewed.
