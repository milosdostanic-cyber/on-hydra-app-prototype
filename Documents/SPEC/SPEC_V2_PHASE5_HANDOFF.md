# SPEC V2 — Phase 5 → Phase 6 Handoff

**Date:** 2026-08-25  
**Status:** Phase 5 implemented and verified. Awaiting review before Phase 6 starts.

## 1. Wireframe pull (mandatory first step)

Official Figma MCP `get_figjam` succeeded for file `OvxMEc7zwbtW7q2Vx0EVeW`, nodes `2200:905` (**Screen 05 — Re-analysis**, frame label `06 — Re-analysis`) and `2214:105` (**M04 — Confirm re-analysis**). No fallback was required.

Screen 05 shows the five-level breadcrumb ending in Re-analysis; a title and preservation explanation; a left progress card with percent, current step, and four stages; a right setup card with Project, edited customer version, category, and exact Master version; and a return card with a bordered Back to editor Button. M04 shows the exact Master-version sentence, a bordered decision-preservation note, the export-blocking note, Cancel, and primary Re-run analysis.

The user authorized the narrow `buildAppBreadcrumbItems.tsx` exception required for the Screen 05 breadcrumb:

`Projects / [Project] / SPEC / [document] / Re-analysis`

## 2. Phase 5 — what shipped

### Confirmation and routing

The existing stale-analysis banner now opens M04. Confirmation names the current document and exact Master SPEC version, explains that accepted and denied decisions remain only for unchanged related customer text, and states that export remains unavailable until completion.

`/spec/:specId/reanalysis` is a distinct workflow route. It does not reuse or alter first-upload processing.

### Background re-analysis

Re-analysis persists on the current `SpecDocument` version and continues through the mock-store ticker after navigation:

1. Manual edits captured
2. Refresh findings and recommendations
3. Keep valid previous decisions
4. Prepare updated review

The active screen follows the wireframe’s progress/setup/return regions. Back to editor is safe during processing: the editor becomes review-only, names the running re-analysis, and links back to progress.

### Preservation and completion

The run snapshots stable recommendation IDs and previous source text before processing. Completion compares each previous source block with the working-copy text:

- unchanged accepted/denied source → decision preserved;
- changed source → recommendation marked changed and decision cleared;
- deleted or already-resolved source → recommendation marked resolved;
- previously unseen stable recommendation → marked new.

The working copy is not replaced, and historical customer versions are not mutated. Failure keeps `reanalysisRequired = true`, the working-copy edits, and previous review records; Retry reuses the same run context.

Successful completion alone clears `reanalysisRequired`. The completion state shows New, Changed, Resolved, and Decisions kept counts, a short result summary, and primary Return to editor. Return restores the stable recommendation query parameters and prefers the next not-reviewed item, then changed/new, then the first active recommendation.

## 3. Verification

- Focused workflow assertions:
  - unchanged source → preserved accepted decision;
  - changed source → changed and previous decision cleared;
  - deleted source → resolved;
  - unseen recommendation → new;
  - failure and retry retain edits and decisions;
  - success retains edits and clears stale state only at completion.
- Browser walkthrough with the **Proprietary Division 23** demo scenario:
  - manual edit showed the stale banner;
  - M04 showed preservation and export-blocking copy with the fixture’s exact Master version;
  - Screen 05 used the dedicated Re-analysis breadcrumb and four stages;
  - Back to editor during processing showed the review-only running state;
  - completion showed `0 New / 1 Changed / 0 Resolved / 1 Decisions kept`;
  - Return to editor restored stable `recommendation`, `section`, `citation`, and `version` query parameters;
  - stale banner disappeared after success;
  - Export remained disabled for Phase 6;
  - no page errors were reported.
- `npx tsc --noEmit` — clean.
- `npm run build` — succeeds; existing bundle-size warning only.
- `ReadLints` on changed files — no errors.
- Token audit — no raw color, spacing, or typography literals added.

## 4. Phase 5 acceptance criteria

- [x] M04 explains exact Master version, preservation, and export blocking.
- [x] Re-analysis progress is distinct from first analysis.
- [x] User can leave and return.
- [x] Working edits survive success and failure.
- [x] Only unchanged-source decisions are preserved.
- [x] Completion shows new, changed, resolved, and preserved counts.
- [x] Return opens the updated editor.
- [x] Analysis becomes current only after success.

## 5. Intentional Phase 5 boundaries

- Export remains disabled and does not route to Deliver-Back.
- Screen 06, M05, and M06 were not implemented.
- First-analysis stage IDs, behavior, and the known Screen 02 breadcrumb gap were not changed.
- Recommendation IDs remain `rec:{documentId}:{citationId}`.
- Ask, Deliver-Back, Products, and other retained routes were not hidden or removed.
- Shared UI, shared tables, theme files, and design tokens were not modified.

## 6. Phase 6 starting point

Phase 6 may use the now-current analysis, preserved recommendation decisions, and completion summary to implement the canonical Export and Outputs route. It must continue to block export whenever `reanalysisRequired` is true.

Do not start Phase 6 until this handoff is reviewed.
