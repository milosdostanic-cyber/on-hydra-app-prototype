# SPEC V2 — Phase 0 Decision Record

**Date:** 2026-08-25
**Status:** Confirmed. Product checkpoint complete; Phase 1 implementation authorized.
**References:**
- `Documents/SPEC/SPEC_V2_USER_FLOW_AND_SCREEN_AUDIT.md` (section 5.1, section 14)
- `Documents/plans/2026-08-25-spec-v2-userflow-implementation-plan.md` (section 5.1, Phase 0)

This record captures the five product/IA decisions required before Phase 1 code changes. It does not modify the audit or the implementation plan.

## Decisions

### 1. Canonical URL

**Decision:** Option A — `/projects/:projectId/spec`.

Project ownership is explicit in the URL; deep links are durable and never imply an organization-wide library. Matches the existing BOM precedent (`/bom/projects/:bomProjectId/...`).

### 2. Visible Release 1 workspace navigation

**Decision:** Three tabs — **Dashboard**, **Review & Edit**, **Export**.

Processing and Re-analysis remain workflow states/routes, not permanent tabs. The existing eight-tab workspace (Analyze, Edit, Review, Products, Submittals, Substitution, Ask, Deliver-Back) is reduced to these three primary tabs for Release 1; non-R1 surfaces are hidden from navigation per decision 5, not deleted.

### 3. Baseline comparison

**Decision:** Retain `SpecReviewPage` (current G1.3 baseline-vs-Master diff) by direct route only. Rename it away from "Review" so it no longer competes with recommendation Review and Edit. Remove it from the primary Release 1 tab set.

Naming for the renamed route/label is an implementation detail for Phase 4 (`SpecReviewPage` is in that phase's file allowlist "only to rename/defer baseline comparison within adopted routing").

### 4. Native Track Changes

**Decision:** Show as a disabled "Coming soon" choice in the Export document-choice list (Screen 06 / section 5.6). Do not imply support. Revisit once Matt confirms feasibility.

### 5. Out-of-scope routes

**Decision:** Retain existing implementation for Products, Submittals-as-standalone-tab, Substitution, Ask, Deliver-Back, and Guide Specs. Hide them from Release 1 primary navigation. Keep direct routes reachable (non-destructive) rather than deleting or feature-flagging with a visible toggle.

## Related Phase 0 confirmations (already settled by the audit; recorded here, not reopened)

- **Status vocabulary:** The canonical status list in plan section 5.2 (`uploading`, `processing`, `analysis-failed`, `ready-to-review`, `in-review`, `reanalysis-required`, `reanalyzing`, `ready-to-export`, `exporting`, `export-failed`, `exported`) is approved as the single source of truth across list, Project detail, routes, and actions.
- **Undecided recommendations at export:** Per audit section 5.6 guardrails, undecided recommendations may remain in the document; the output rule must be stated explicitly in the Export UI copy.
- **BOM/Submittal outputs:** Use only accepted product recommendations, per audit sections 5.6 and 12.

## Consequence for Phase 1 scope

- Implement the Project-owned route `/projects/:projectId/spec` as the SPEC list landing surface.
- Sidebar SPEC entry and any global `/spec` link must resolve into a selected-Project context; legacy global `/spec` behavior is superseded by this decision (Phase 1 work item 2: "Align sidebar and Project navigation without changing shell styling").
- Workspace tab reduction (decision 2) and baseline-comparison rename (decision 3) apply starting Phase 4; Phase 1 only needs to avoid contradicting them.
