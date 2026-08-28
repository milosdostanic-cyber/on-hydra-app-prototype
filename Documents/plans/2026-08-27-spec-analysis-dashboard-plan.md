# Plan: SPEC Analysis Dashboard (FigJam `2200:585`)

## Meta
- **Date:** 2026-08-27
- **Request type:** `figma-delta`
- **User request summary:** Inspect FigJam Screen 03 — Analysis Dashboard (`2200:585`), read board comments, confirm where it belongs in the SPEC flow, and plan implementation from the wireframe plus comments. Connect it to the rest of the flow. Do not change the other screens.
- **Status:** draft — planning only; implementation not started
- **Plan file:** `Documents/plans/2026-08-27-spec-analysis-dashboard-plan.md`
- **Figma:** [SPEC — Kickoff V2, node `2200:585`](https://www.figma.com/board/OvxMEc7zwbtW7q2Vx0EVeW/SPEC---Kickoff-V2?node-id=2200-585)
- **Related earlier plan:** `Documents/plans/2026-08-26-spec-v2-figjam-feedback-implementation-plan.md` (broader module pass). This plan **supersedes that file’s Phase 3 for the dashboard only**, and **does not implement** its phases that edit Home, Processing, Edit, or Export.

## Orchestration for planning (this run)

### Explicit skills and rules used
| Name | Type | Path | Why selected |
|------|------|------|--------------|
| `@plan-orchestrator` | rule | `.cursor/rules/plan-orchestrator.mdc` | Planning-only run; write this file |
| `@prd-ux-implementation-planner` | skill | `.cursor/skills/prd-ux-implementation-planner/SKILL.md` | Map wireframe + comments to current routes and gaps |
| `@figma-use-figjam` | skill | Figma plugin skill | Official `get_figjam` / `get_screenshot` for a `/board/` file |
| `@hydra-design-to-code` | rule | `.cursor/rules/hydra-design-to-code.mdc` | Token and component mapping for a Figma-sourced screen |
| `figma-design-to-code` | skill | Figma plugin skill | Required before treating Figma output as an implementation reference |
| Granola context | skill | granola-context | Check meetings for this screen; no matching transcript found |

### Implicit rules (always active)
| Invoke | Path | Why relevant to this task |
|--------|------|---------------------------|
| `@token-discipline` | `.cursor/rules/token-discipline.mdc` | Targeted reads only |
| `@scope-guardrails` | `.cursor/rules/scope-guardrails.mdc` | Dashboard only; other screens frozen |
| `@product-ux-rules` | `.cursor/rules/product-ux-rules.mdc` | One primary CTA; non-technical copy |
| `@ux-guardrails` | `.cursor/rules/ux-guardrails.mdc` | Reuse existing local SPEC components |
| `@hydra-ui-tokens` | `.cursor/rules/hydra-ui-tokens.mdc` | No raw visual values |
| `@hydra-ux-composition` | `.cursor/rules/hydra-ux-composition.mdc` | Compose antd + existing SPEC cards |
| `@figma-repo-parity` | `.cursor/rules/figma-repo-parity.mdc` | No theme/token changes expected |

### Not used (and why)
| Name | Why skipped |
|------|-------------|
| `@hydra-work-planner` | This is a named FigJam-screen plan, not a “what should I work on” run |
| `@ds-parity-auditor` | No design-system or token sync |
| `@figma-generate-design` | Code ← FigJam, not code → Figma |
| Figma Console write tools | Comments were **read** only (`figma_get_comments`); no board edits |

## Implementation invocation (use in a new chat after approval)

### Baseline — attach every UI implementation phase
```
@scope-guardrails
@token-discipline
@ux-guardrails
@hydra-ui-tokens-and-components
```

### Default attach set for this request type
```
@figma-use
@figma-generate-design
@hydra-design-to-code
@hydra-ui-tokens-and-components
@scope-guardrails
@token-discipline
```

### Implicit rules during implementation
| Invoke | Path | Applies when |
|--------|------|--------------|
| `@product-ux-rules` | `.cursor/rules/product-ux-rules.mdc` | Always — CTA hierarchy and states |
| `@hydra-ux-composition` | `.cursor/rules/hydra-ux-composition.mdc` | Card/list composition on the dashboard |
| `@figma-repo-parity` | `.cursor/rules/figma-repo-parity.mdc` | Only if a theme file is touched (not expected) |

### Optional add-ons
| Invoke | Path | When to add |
|--------|------|-------------|
| `@hydra-ux-audit` | `.cursor/skills/hydra-ux-audit/SKILL.md` | After the dashboard UI change, before closing |
| `@figma-use-figjam` | Figma plugin skill | Re-pull `2200:585` if the board moved |

## Opinion (authority order)

This screen **does belong in the flow**. It is the post-analysis hub, not a second editor.

**Authority when they disagree**

1. Matt’s comments on this node (26 Aug 2026) and Miloš’s follow-up on review-status chips (27 Aug 2026).
2. Published V2 user flow — Screen 03 is the step after processing and before Review & Edit.
3. The wireframe drawing of `2200:585` itself.

The wireframe is the layout source. The comments **correct** the wireframe: drop the dashboard TOC, paginate a long recommendation list, group by action type, and stop treating “High / Medium” as a user-facing priority model.

**What went wrong in the repo:** `SpecAnalyzePage` already exists, but it folded Screen 04 into Screen 03. The header only has **Export**. There is no **Start review**. Rows open an in-place Accept / Later / Deny panel. That duplicates `SpecEditPage` and severs the connection the wireframe was drawn for.

Matt’s “don’t bury the review tool” is **not** “put the editor on the dashboard.” It is: keep one short orientation page (summary + list), then send the user into Review & Edit. Too many CTAs on this page is why he later asked to **remove the TOC from here** and keep it on the next screen.

**Do not 1:1 the wireframe TOC.** Matt explicitly reversed that.

## Scope summary

Restore Screen 03 as an orientation dashboard:

- Header identity + assessment metrics.
- Full-width recommended-changes list (no TOC column, no in-place decision panel).
- Filters from comments (action type + review status), not the superseded Language / Product / High-priority chip set.
- Primary **Start review** / **Continue review** and per-row **Review** navigate to the existing editor.
- Secondary **Export** navigates to the existing export page.
- Keep dashboard-local processing / failed / reanalysis chrome that already lives on this page.
- Do not edit Home, Processing, Edit, Export, or shared editor rail components.

## Current flow audit

Canonical V2 journey:

`Project SPEC list → upload wizard → processing → Analysis Dashboard → Review & Edit → Export`

| Screen | Route today | Role | This plan |
|--------|-------------|------|-----------|
| 01 Project SPEC list | `/projects/:projectId/spec` | Listing and next action | Frozen. Already sends ready-to-review rows to analyze. |
| 02 Processing | `/spec/:specId/processing` | Progress (fallback) | Frozen. Already redirects completed docs to analyze. |
| **03 Analysis Dashboard** | `/spec/:specId/analyze` | Orient, scan, start review | **Only surface to change.** |
| 04 Review & Edit | `/spec/:specId/edit` | Document + decide | Frozen. Already reads `recommendation`, `section`, `citation`, `version`. |
| 06 Export | `/spec/:specId/export` | Document + ConnectED actions | Frozen. Dashboard already can navigate here. |

**What `SpecAnalyzePage` does today**

- Correct: document title, analysis/Division/Master line, overall assessment, action-type data, section `Select` (TOC already gone), processing strip, failed card/modal, reanalysis completion card, zero-recommendation empty state, Export → export route.
- Wrong for this wireframe: Export is the only header CTA (and it is primary). Start review is missing. The work area is a list + `SpecRecommendationDetailPanel` with live decisions — that is Screen 04’s rail (`SpecRecommendationsListPanel` on `SpecEditPage`).
- Half-applied comments: action-type exists as a `Select`, not the chip/segmented group Matt asked for. Status is a dropdown. High-priority checkbox and metric remain. List is an inner split pane, not a page-scrolled paginated list.

**Comments that apply to this node**

| # | Author | Date | Gist | Plan verdict |
|---|--------|------|------|----------------|
| 12 | Matt | 26 Aug | TOC does not belong here — too many CTAs | Keep TOC off the dashboard. Section filter stays as a `Select`. |
| 13 | Matt | 26 Aug | 3–40 items; user must get through all of them; paginate? | Page-level list + `BomTablePaginationBar`. No inner split-pane editor. |
| 14 | Matt | 26 Aug | Group filters: Add Manufacturer, Rewrite Language, Swap Part, Add Product, Update Reference, Blocked | Facet already in data (`SpecRecommendation.action`). Expose as counted chips/`Segmented`, not a buried `Select`. |
| 16 + reply | Matt, then Miloš | 26–27 Aug | If those tags are confidence, don’t show them. Miloš: they were meant as priority, but replace with **Not reviewed / Accepted / Denied** and use the same states as tabs. No defined priority model. | Drop user-facing High/Medium/Low chips, the High-priority checkbox, and the High-priority metric on this page. Status tabs become the primary facet. |
| 20, 28 | Matt | 26 Aug | Re-analysis output belongs on the dashboard, not its own page | Already on this page. Keep. Do not edit the reanalysis page. |
| 25 | Matt | 26 Aug | Failed analysis is a modal, not a page | Already on this page. Keep. |

Comments on other nodes (listing copy, processing chrome, editor “why”, export “ConnectED Actions”) are **out of scope** because they require changing other screens.

Granola has no recorded meeting that names node `2200:585`. Decisions for this screen live on the board.

## Requirements / gap table
| Requirement | Current | Gap | UX risk | Area |
|-------------|---------|-----|---------|------|
| Hub after analysis, before editor | Route exists; role is blurred | Dashboard is a second review workspace | User never reaches the document; two places to Accept/Deny | `SpecAnalyzePage` |
| Header: secondary Export, primary Start/Continue review | Export only, styled primary | Missing Start review; CTA hierarchy inverted | “What is the next action?” is unanswered | Header actions |
| Review row → editor with stable ids | In-place panel; no `specEditPath` | Reconnect `Review` to `/spec/:id/edit?...` | Editor query contract already exists and is unused from here | Row CTA |
| Assessment: counts that match visible work | Recommendations / High priority / Reviewed | High priority has no product model (Miloš 27 Aug) | Looks like confidence | Metric cards |
| Filters: status tabs + action types | Status `Select` + action `Select` + High-priority checkbox | Wrong control pattern; leftover priority | Too many competing facets | Filter bar |
| No TOC column | Already removed | None | — | Layout |
| Scroll/paginate 3–40 rows | Inner split pane + `useSpecScrollFit` | Restore a single list + BOM pagination | Hidden items, competing scroll | List |
| Zero recommendations is success | Present | Keep; Open document stays a drawer on this page | — | Empty state |
| Processing / failed / reanalysis on this hub | Present | Keep as-is | — | Dashboard-local states |

## Proposed UX flow

1. User finishes processing (or opens a ready-to-review row). Lands on `/spec/:specId/analyze`.
2. Sees: this SPEC, analysis complete, Division, Master version.
3. Reads a short overall assessment and three metrics: **Recommendations**, **Not reviewed**, **Reviewed** (`n / total`).
4. Scans a full-width list. Filters by review status (tabs) and action type (Matt’s six groups). Optionally narrows by section.
5. Primary **Start review** (or **Continue review** if any decision exists) opens the existing editor on the first not-reviewed item, using the query params `SpecEditPage` already understands.
6. Per-row **Review** opens the same editor focused on that recommendation.
7. Secondary **Export** opens the existing export page. Remains disabled when analysis is stale or failed, with the existing tooltip copy.
8. After decisions in the editor, the user can breadcrumb back to this dashboard; counts and status tabs reflect store state. No Edit page changes required.

**While analysis is running (already on this page):** progress strip + empty “still running” state. Start review hidden/disabled. Export disabled.

**Zero recommendations:** success empty state. Primary Export. Secondary Open document (existing source drawer — local to this page).

## Implementation plan by phase

### Phase 1 — Restore the hub (layout, CTAs, navigation)
- **Goal:** Screen 03 orients and sends the user to Screen 04. It no longer decides recommendations itself.
- **Files:** `src/spec/pages/SpecAnalyzePage.tsx`, `src/spec/components/SpecRecommendationCard.tsx`
- **UI changes:**
  - Header actions: default **Export** (secondary) + primary **Start review** / **Continue review** (`size="large"`). Copy from `specWorkflowStatus` (`Start review` / `Continue review`).
  - Remove the list + `SpecRecommendationDetailPanel` split. Stop mounting Deny modal / `saveDecision` / proposal save from this page.
  - Restore `SpecRecommendationCard` as the row: action chip, review-status chip, title, exact source, **Review**.
  - `Review` and Start/Continue review navigate to `specEditPath(id)` with `recommendation`, `section`, `citation`, `version` — the contract `SpecEditPage` already reads at L153–165.
  - Keep `BomPageHeader`, assessment card, processing strip, failed card/modal, reanalysis card, zero-rec empty state, source `Drawer`.
- **Data/state:** No model changes. Drop dashboard-local `selectedRecommendationId`, `denyOpen`, `decisionSaving`, `saveDecision`. Keep filter and citation drawer state.
- **Acceptance criteria:**
  - Start/Continue review is the header primary CTA whenever recommendations exist and analysis is not running/failed.
  - Clicking Review or Start review leaves `/analyze` and opens `/edit` on the intended recommendation.
  - Accept / Later / Deny are not available on the dashboard.
  - Export still goes to `/export` and stays disabled when blocked.
- **Must not change:** `SpecEditPage.tsx`, `SpecRecommendationsListPanel.tsx`, `SpecRecommendationDetailPanel.tsx`, `SpecRecommendationListCard.tsx`, `SpecRecommendationTags.tsx`, `SpecExportPage.tsx`, `SpecHomePage.tsx`, `SpecProcessingPage.tsx`, `SpecRoutes.tsx`, `specNavigation.ts`.

#### Phase 1 — invoke for implementation
```
@figma-use
@hydra-design-to-code
@hydra-ui-tokens-and-components
@scope-guardrails
@token-discipline
@ux-guardrails
@product-ux-rules
```

**Copy-paste prompt:**
```
Implement Phase 1 only from this plan: Documents/plans/2026-08-27-spec-analysis-dashboard-plan.md

@figma-use
@hydra-design-to-code
@hydra-ui-tokens-and-components
@scope-guardrails
@token-discipline
@ux-guardrails
@product-ux-rules

Allowed files:
- src/spec/pages/SpecAnalyzePage.tsx
- src/spec/components/SpecRecommendationCard.tsx

Forbidden:
- Any other screen, route, navigation helper, editor rail component, or modal
- Theme / token files
- SpecRecommendationTags.tsx (editor also uses it)

Figma: https://www.figma.com/board/OvxMEc7zwbtW7q2Vx0EVeW/SPEC---Kickoff-V2?node-id=2200-585
Restore the dashboard as an orientation hub. Do not 1:1 the TOC column (Matt #12).
```

### Phase 2 — Filters, metrics, and pagination (comments on this node)
- **Goal:** Match Matt #13/#14 and Miloš 27 Aug on this page only.
- **Files:** `src/spec/pages/SpecAnalyzePage.tsx`, `src/spec/components/SpecRecommendationCard.tsx`
- **UI changes:**
  - Metric cards: **Recommendations** | **Not reviewed** | **Reviewed** (`n / total`). Remove High priority.
  - Assessment copy: drop “review high-priority first.” Point at not-reviewed items instead.
  - Status tabs (primary facet): `All {n}` · `Not reviewed {n}` · `Accepted {n}` · `Denied {n}`. Use antd `Segmented` or `Radio.Group` optionType `button` — same pattern as the wireframe chip row, new labels.
  - Action-type facet (Matt #14): counted chips or a second `Radio.Group` / `Segmented` for groups that have count > 0, plus All actions. Labels already in `recommendationActionLabel`.
  - Keep **All sections** `Select`. Remove High-priority checkbox.
  - List: natural page scroll. `BomTablePaginationBar` at the card footer (`shellLayout.tablePageSizeDefault`). Reset to page 1 on filter change. Keep filter empty + Clear filters.
  - Row chips on `SpecRecommendationCard`: **action** + **review status** (Not reviewed / Accepted / Later / Denied). Remove High/Medium/Low priority tags from this card only.
- **Data/state:** Keep `priority` and `later` on the model. Do not expose priority on this page. Include **Later** as its own tab if any fixture uses it (see Q2); otherwise keep Later only as a row chip.
- **Acceptance criteria:**
  - User can page through a long filtered list without an inner editor pane.
  - Status tabs and action chips combine; counts match the unpaginated filtered set.
  - No High/Medium/Low or `%` confidence copy on the dashboard.
  - `SpecRecommendationTags` (editor) still shows whatever it shows today.
- **Must not change:** same freeze as Phase 1.

#### Phase 2 — invoke for implementation
```
@figma-use
@hydra-design-to-code
@hydra-ui-tokens-and-components
@scope-guardrails
@token-discipline
@ux-guardrails
@product-ux-rules
```

**Copy-paste prompt:**
```
Implement Phase 2 only from this plan: Documents/plans/2026-08-27-spec-analysis-dashboard-plan.md

@figma-use
@hydra-design-to-code
@hydra-ui-tokens-and-components
@scope-guardrails
@token-discipline
@ux-guardrails
@product-ux-rules

Allowed files:
- src/spec/pages/SpecAnalyzePage.tsx
- src/spec/components/SpecRecommendationCard.tsx

Forbidden:
- SpecRecommendationTags.tsx, SpecEditPage.tsx, and every other screen
- New tokens, new shared components

Reuse BomTablePaginationBar as-is. Reuse recommendationActionLabel / RECOMMENDATION_ACTION_ORDER.
```

### Phase 3 — Verify connections and audit
- **Goal:** Prove the hub talks to frozen screens without editing them.
- **Files:** none except tests if an existing analyze selector test asserts the old split pane.
- **UI changes:** none.
- **Data/state:** none.
- **Acceptance criteria:**
  - Home → analyze (ready-to-review / processing complete) still works.
  - Analyze → edit with query params focuses the matching recommendation on the existing editor.
  - Analyze → export still works; blocked export still explains why.
  - Breadcrumb back from edit lands on the dashboard.
  - `npx tsc --noEmit` clean; `ReadLints` clean on allowed files.
  - `@hydra-ux-audit` on the dashboard: one primary CTA, states covered, tokens only.
- **Must not change:** other screens. If a test fails because it expected in-place decisions, update **that test only**.

#### Phase 3 — invoke for implementation
```
@hydra-ux-audit
@hydra-ui-tokens-and-components
@scope-guardrails
@token-discipline
```

**Copy-paste prompt:**
```
Implement Phase 3 only from this plan: Documents/plans/2026-08-27-spec-analysis-dashboard-plan.md

@hydra-ux-audit
@hydra-ui-tokens-and-components
@scope-guardrails
@token-discipline

Verify in the browser: listing → dashboard → Start review → editor (correct recommendation) → breadcrumb back → Export.
Do not change SpecEditPage, SpecHomePage, SpecExportPage, or SpecProcessingPage.
Fix only analyze-page tests if they still expect the in-place decision panel.
```

## File change plan
| File | Action | Reason |
|------|--------|--------|
| `src/spec/pages/SpecAnalyzePage.tsx` | Modify | Restore hub layout, CTAs, filters, pagination; drop in-place review |
| `src/spec/components/SpecRecommendationCard.tsx` | Modify | Dashboard row: action + status chips, Review → editor; drop priority tags |
| Existing analyze tests (if any assert the split pane) | Modify only if they break | Keep tests truthful |

**Reuse, do not edit:** `BomPageHeader`, `BomTablePaginationBar`, `SpecCitationLink`, `specEditPath` / `specExportPath`, `recommendationActionLabel`, `SpecAnalysisProgressStrip`, `SpecAnalysisFailedModal`, `SpecReanalysisCompletion`, `SpecDocumentViewer` drawer.

## Guardrails
- **Allowed (after approval):** the two files in the file-change plan; analyze-page tests if required.
- **Forbidden:** `SpecEditPage`, `SpecHomePage`, `SpecProcessingPage`, `SpecExportPage`, `SpecRoutes`, `specNavigation`, `SpecRecommendationsListPanel`, `SpecRecommendationDetailPanel`, `SpecRecommendationListCard`, `SpecRecommendationTags`, all SPEC modals, theme/token files, other screens.
- **Assumptions:**
  - Incoming links to `/analyze` stay as they are.
  - `SpecEditPage` query-param focus is sufficient; we will not add editor features.
  - Processing / failed / reanalysis chrome already on the dashboard stays.
  - Comments override the wireframe TOC and the Language/Product/High-priority chip set.
- **Open questions:** see below. Phase 1 can start without them; Phase 2 should confirm Q1–Q2.

## Risks
| Risk | Mitigation |
|------|------------|
| Restoring Start review looks like “adding a click” vs Matt’s anti-bloat comments | The click is the designed handoff into the document. The current merge of two screens is the bloat. |
| `SpecRecommendationCard` changes could leak if someone remounts it on Edit | Edit uses `SpecRecommendationsListPanel`, not this card. Keep it that way. |
| Dropping High priority while Matt never replied to Miloš | Called out as Q1. Default is Miloš’s 27 Aug comment because he tagged Matt and it resolves #16. |
| Pagination vs “scroll through all of them” | Page scroll of the list **and** BOM pagination. Page size from `shellLayout`. |

## Acceptance checklist
- [ ] Dashboard is the post-analysis hub, not a second editor
- [ ] Primary CTA is Start/Continue review; Export is secondary
- [ ] Review / Start review open existing `/edit` with stable query params
- [ ] Export opens existing `/export` without editing that page
- [ ] No TOC column (Matt #12)
- [ ] Action-type facet uses Matt’s six groups (#14)
- [ ] Review-status tabs replace priority chips/metrics (Miloš 27 Aug, pending Q1)
- [ ] Long lists paginate with `BomTablePaginationBar` (#13)
- [ ] Zero-recommendation, processing, failed, and reanalysis states still work on this page
- [ ] Other screens unchanged
- [ ] No new tokens, no new shared components, no raw visual values
- [ ] `@hydra-ux-audit` passed on the dashboard

## Full implementation prompt (all approved phases)
```
Implement approved phase(s) from: Documents/plans/2026-08-27-spec-analysis-dashboard-plan.md

@figma-use
@hydra-design-to-code
@hydra-ui-tokens-and-components
@scope-guardrails
@token-discipline
@ux-guardrails
@product-ux-rules
@hydra-ux-audit

Follow allowed files and guardrails in the plan. Do not expand scope.
Do not change SpecEditPage, SpecHomePage, SpecProcessingPage, SpecExportPage, or editor rail components.
Figma: https://www.figma.com/board/OvxMEc7zwbtW7q2Vx0EVeW/SPEC---Kickoff-V2?node-id=2200-585
```

## Open questions

**Q1 (Phase 2).** Miloš’s 27 Aug comment (reply to Matt #16) is unanswered by Matt. Default in this plan: drop High-priority metrics/chips/checkbox on the dashboard. If Matt still wants a priority model, keep the metric and relabel chips `High priority` only — still never show confidence percents.

**Q2 (Phase 2).** Miloš named three statuses. The model also has **Later**. Default: show Later as a row chip; add a Later tab only when count > 0.

**Q3 (non-blocking).** Assessment body copy still mentions “ASC-friendly language and product-related updates.” Keep that sentence; only remove “high-priority first.”
