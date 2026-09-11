# SPEC V2 — Phase 4 → Phase 5 Handoff

**Date:** 2026-08-25  
**Status:** Phase 4 implemented and verified. Awaiting review before Phase 5 starts.

## 1. Wireframe pull (mandatory first step)

Official Figma MCP `get_figjam` succeeded for file `OvxMEc7zwbtW7q2Vx0EVeW`, nodes `2200:745` (**04 — Review and Edit**) and `2213:105` (**M03 — Deny recommendation**). No fallback was required.

Screen 04 shows a five-level breadcrumb ending in Review; a document header with recommendation progress, saved state, secondary Back to dashboard, and secondary Export; a three-pane TOC, full-document editor, and recommendation-detail workspace; basic formatting controls; Previous/Next navigation; priority/type, existing/proposed text, rationale, and exact source evidence; a full-width Edit proposal action; and a Deny/Later/Accept row with Accept as the only positive primary action. The editor lock is a named warning banner with Refresh, not a modal.

M03 shows the destructive confirmation **Deny this recommendation?**, review-decision context, optional reason input, Cancel, and destructive **Deny recommendation**.

## 2. Phase 4 — what shipped

### Recommendation review contract

Recommendation decisions are persisted as review records layered over `listRecommendations()`. Stable IDs remain `rec:{documentId}:{citationId}`. Accept, Later, Deny, optional denial reason, and edited proposal text are returned through the same selector used by the Dashboard, so counts and row statuses update without a parallel review model.

### Review and Edit workspace

`SpecEditPage` now consumes `recommendation`, `section`, `citation`, and `version`, then opens the exact stable Dashboard recommendation. The page follows the Screen 04 three-pane composition:

- keyboard-operable Table of contents;
- full-document editor with paragraph editing, style, bold, italic, bullets, undo, and redo;
- recommendation position and Previous/Next navigation;
- priority, type, existing/proposed wording, rationale, product evidence, and exact source;
- secondary Edit proposal;
- Deny, Later, and primary Accept decisions;
- truthful saving and saved states;
- stale-analysis warning after manual text or formatting changes;
- disabled Export with Phase 6 or stale-analysis explanation.

Accept applies the recommendation wording to the working copy. Manual editor changes set `reanalysisRequired` immediately; accepting a recommendation does not incorrectly mark analysis stale.

### Denial and lock behavior

M03 supports denial with or without a reason and retains supplied context.

The prototype lock names the active editor, makes document and recommendation mutations read-only, and offers Refresh. The lock is released when the active editor leaves and expires after simulated inactivity, so the restricted demo does not create a permanent false lock.

### Routing and workspace meaning

The Release 1 workspace tabs are Dashboard, Review & Edit, and disabled Export. The old review page is explicitly **Baseline Comparison**, remains supplemental, and is available at `/spec/:specId/baseline-comparison`; the legacy review URL redirects there.

After the mandatory stop-and-ask checkpoint, the user authorized a narrow Screen 04 shell exception. `buildAppBreadcrumbItems.tsx` renders:

`Projects / [Project] / SPEC / [document] / Review`

The known Screen 02 Processing breadcrumb gap remains deferred.

## 3. Verification

- Focused selector assertions: zero, one, many, mixed decisions, exact evidence, and stable IDs.
- Focused review-workflow assertions: Accept/Deny persistence, optional denial reason retention, stale analysis after manual edit, competing-editor read-only lock, inactivity expiry, and explicit release.
- Browser walkthrough:
  - Dashboard deep link restores the requested recommendation;
  - Previous/Next traverses the recommendation set without returning to Dashboard;
  - Accept, Later, and Deny save;
  - M03 works with a blank reason and with retained context;
  - edited proposal saves before decision;
  - manual text edit shows Re-analysis required and keeps Export disabled;
  - Dashboard reflects Accepted, Later, and Denied states from the same selector;
  - keyboard activation works in the TOC;
  - restricted reviewer shows `Jordan Lee is editing this SPEC`, disables mutation, then recovers after timeout and Refresh.
- Browser walkthrough reported no page errors.
- Visual comparison against FigJam nodes `2200:745` and `2213:105`: region order, action hierarchy, evidence order, editor lock presentation, and denial confirmation match the wireframe direction.
- `npx tsc --noEmit` — clean.
- `npm run build` — succeeds; existing bundle-size warning only.
- `ReadLints` on changed files — no errors.
- Token audit — no raw color, spacing, or typography literals added to the new Screen 04 compositions.

## 4. Phase 4 acceptance criteria

- [x] User can navigate all recommendations without returning to Dashboard.
- [x] Recommendation detail includes all required evidence.
- [x] Accept, Later, and Deny save and update counts.
- [x] Denial reason is optional and retained.
- [x] Full document is editable with basic formatting.
- [x] Auto-save status is truthful.
- [x] Manual edits immediately require re-analysis.
- [x] Export cannot proceed while analysis is stale.
- [x] Lock state is read-only, names the editor, and offers Refresh.
- [x] One clear primary decision exists per recommendation.

## 5. Intentional Phase 4 boundaries

- Export remains disabled until Phase 6 and never routes to Deliver-Back.
- Re-analysis remains Phase 5. This phase only establishes and presents the stale-analysis invariant.
- M04 and Screen 05 were not implemented.
- Ask, Deliver-Back, Products, and other retained routes were not removed from global navigation.
- Screen 02 breadcrumb and legacy processing stage IDs were not changed.
- Shared UI, shared tables, theme files, and design tokens were not modified.

## 6. Phase 5 starting point

Manual document text or formatting mutations now set `reanalysisRequired`. Phase 5 can use that state to open the re-analysis confirmation flow and preserve accepted/manual edits according to the plan without changing recommendation identity or the Phase 4 decision contract.

Do not start Phase 5 until this handoff is reviewed.
