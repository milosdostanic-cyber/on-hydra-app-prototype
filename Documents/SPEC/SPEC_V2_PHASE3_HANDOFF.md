# SPEC V2 — Phase 3 → Phase 4 Handoff

**Date:** 2026-08-25  
**Status:** Phase 3 implemented and verified. Awaiting review before Phase 4 starts.

## 1. Wireframe pull (mandatory first step)

Official Figma MCP `get_figjam` succeeded for file `OvxMEc7zwbtW7q2Vx0EVeW`, node `2200:585` (**03 — Analysis Dashboard**). No fallback was required. No related wizard or modal belongs to Phase 3; M03 Deny remains Phase 4.

The wireframe shows a four-level breadcrumb, document header with analysis/Division/Master context, secondary Export, primary Start review, an overall-assessment panel with three metrics, and a two-column TOC + Recommended changes work area. Recommendation rows show priority, type, review state, outcome-focused title, exact section/paragraph, and a bordered Review button. Requirements, Red Flags, confidence queues, and an embedded document viewer are not top-level modes.

## 2. Phase 3 — what shipped

### Recommendation contract and repository selector

`SpecRecommendation` now carries the V2 plan §5.3 contract: stable ID, customer and Master version trace, exact section/paragraph and citation, title/outcome, existing/proposed text, reason, type/category, priority, product evidence, review decision metadata, manual-edit relationship, and re-analysis state.

`mockSpecAnalysisRepository.listRecommendations()` is the single page-facing selector. It deterministically groups requirements, red flags, product suggestions, citations, and document blocks by source block. IDs use `rec:{documentId}:{citationId}`, so repeated selector runs return the same IDs.

### Analysis Dashboard

`SpecAnalyzePage` now follows the Screen 03 wireframe:

- document identity, analysis state, Division/System Type, and exact Master version;
- disabled secondary Export with truthful Phase 6 explanation;
- primary Start/Continue review routed to the next not-reviewed recommendation on the existing editor route;
- filter-aware recommendation, high-priority, and reviewed metrics;
- TOC plus Recommended changes two-column work area;
- combinable section, high-priority, type, and review-state filters;
- recommendation rows with exact source locator and Review;
- progressive Evidence and proposed change disclosure;
- exact-source drawer using existing citation and document-viewer semantics;
- successful zero-recommendation state with secondary Open document and disabled primary Export;
- filter no-results state with Clear filters.

The old three-pane analyzer, top-level Overview/Requirements/Red Flags modes, correction flow, permission gate, and low-confidence queue presentation are no longer part of this Release 1 page.

The wireframe has no Back button. The stale `Back to Spec` control was removed. The breadcrumb is the navigation back to the Project SPEC list.

### Breadcrumb scope authorization

After the mandatory stop-and-ask checkpoint, a narrow shell exception was authorized. `buildAppBreadcrumbItems.tsx` now renders Screen 03 as:

`Projects / [Project] / SPEC / [document]`

The known Screen 02 five-level Processing breadcrumb gap remains deferred and was not changed.

## 3. Verification

- Focused selector test: zero, one, many, mixed decisions, exact evidence, and stable IDs.
- Demo scenarios:
  - Clean Division 22 → successful `0 recommendations`;
  - Large project manual → one recommendation;
  - Proprietary Division 23 → two recommendations;
  - Contradictory requirements → mixed Later and Denied decisions.
- Combined Product + High priority + Accepted filter → one displayed recommendation and matching metrics.
- Denied filter with no matching proprietary recommendation → no-results-within-filter state.
- Source citation click updates the URL and opens the source drawer.
- Direct citation deep link restores the source drawer and highlighted block.
- Review action opens `/spec/:specId/edit` with stable recommendation, section, citation, and version query parameters.
- Browser walkthrough reported no page errors.
- Visual comparison against FigJam node `2200:585`: region order, header action hierarchy, assessment metrics, TOC/list proportions, row hierarchy, and exact-source placement match the wireframe direction.
- `npx tsc --noEmit` — clean.
- `npm run build` — succeeds; existing bundle-size warning only.
- `ReadLints` on all changed files — no errors.
- Token audit — no raw color, spacing, or typography literals added.

## 4. Phase 3 acceptance criteria

- [x] Header identifies document, Division, and exact Master version.
- [x] Rollup metrics match displayed recommendation data.
- [x] User can combine priority, type, and review-state filters.
- [x] Every recommendation has exact source evidence.
- [x] Start/Continue review opens the correct stable recommendation on the editor route.
- [x] No recommendations is clearly successful.
- [x] No separate low-confidence workflow is visible.
- [x] Existing extraction and product evidence remains available through progressive disclosure.

## 5. Intentional Phase 3 boundaries

- Export is disabled with truthful copy until the canonical Phase 6 destination exists; it does not route to Deliver-Back.
- Review decisions are deterministic fixture data in Phase 3. Phase 4 will add mutation, auto-save, Deny reason, and editor recommendation navigation.
- Existing workspace-tab reduction and baseline-comparison rename remain Phase 4/7 work. `specWorkspaceTabs.ts` and `SpecWorkspaceHeader.tsx` were not edited.
- Existing Requirements, Red Flags, Product Suggestion, and Confidence components remain available to retained out-of-scope routes; Phase 3 only removed their competing use from the Dashboard.
- Processing stage IDs and the Screen 02 breadcrumb gap were not reopened.

## 6. Phase 4 starting point

The Dashboard now routes every Start/Continue/Review action to the editor with:

- `recommendation`;
- `section`;
- `citation`;
- `version`.

Phase 4 can consume those parameters to open the correct recommendation in the Review and Edit workspace, persist Accept/Later/Deny decisions, and implement M03 without changing Dashboard recommendation identity.

Do not start Phase 4 until this handoff is reviewed.
