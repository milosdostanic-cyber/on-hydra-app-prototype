# BOM client feedback — implementation map

Verification of the short client checklist against the current branch **`bom-upload-match-review-plan`** (PR [#5](https://github.com/ooden-tech/on-hydra-app-prototype/pull/5), commits `16d9c88`, `cec21b9`).

**How to read this doc**

| Column | Meaning |
|--------|---------|
| **App route** | Where to see it in the running prototype (`npm run dev`, default `http://localhost:5173`) |
| **Code** | Primary file(s) changed — click paths in GitHub/Cursor |
| **What changed** | Behaviour / UI delta |

---

## 1. Improve upload / search CTA prominence

| | |
|---|---|
| **Status** | Done |
| **App route** | [`/bom/site/:constructionProjectId`](http://localhost:5173/bom/site/3) — **Get started** row (upload + search cards) |
| **Also** | Workspace empty state upload button — [`/bom/projects/:bomProjectId/workspace`](http://localhost:5173/bom/projects/new/workspace) |

**Code**

- [`src/bom/pages/BomSiteProjectsPage.tsx`](../src/bom/pages/BomSiteProjectsPage.tsx) — `getQuickActionStyle()` (~L328), full-width quick-action `Card`s with primary border, hover lift/shadow, green upload icon, blue search icon (~L367–428)
- [`src/bom/pages/BomWorkspacePage.tsx`](../src/bom/pages/BomWorkspacePage.tsx) — empty workspace **Upload BOM file** + **Add item** (~L685–728)

**What changed**

- Upload and search are equal **large clickable cards** (not buried links).
- Hover state increases border/shadow so CTAs read as primary entry points.
- Copy on search card: **Search parts** + competitor/ASC hint (was catalogue-only wording).

---

## 2. Clean up field-mapping language and emphasize original imported data

| | |
|---|---|
| **Status** | Done |
| **App route** | [`/bom/projects/:bomProjectId/mapping-summary`](http://localhost:5173/bom/projects/new/mapping-summary) → **Review columns** → [`/bom/projects/:bomProjectId/field-mapping`](http://localhost:5173/bom/projects/new/field-mapping) |
| **Also** | Parsing review table — [`/bom/projects/:bomProjectId/parsing-review`](http://localhost:5173/bom/projects/new/parsing-review) |
| **Also** | Guided match panel — [`/bom/projects/:bomProjectId/matching/review`](http://localhost:5173/bom/projects/new/matching/review) |

**Code**

- [`src/bom/components/BomFieldMappingTable.tsx`](../src/bom/components/BomFieldMappingTable.tsx) — headers **IN YOUR FILE**, **PART DETAIL WE NEED** (~L79–97); edit-mode required placeholder **Required — choose a column**
- [`src/bom/pages/BomMappingSummaryPage.tsx`](../src/bom/pages/BomMappingSummaryPage.tsx) — strip **HOW WE LINKED YOUR COLUMNS** + confidence tag (~L258–276); summary table card `opacity: 0.7` so mapping reads secondary to copy
- [`src/bom/bomImportedDataEmphasis.tsx`](../src/bom/bomImportedDataEmphasis.tsx) — `bomImportedDataShellStyle`, `BomImportedValueCell` (left accent on user’s values)
- [`src/bom/bomParsingReviewColumns.tsx`](../src/bom/bomParsingReviewColumns.tsx) — parsing table uses `BomImportedValueCell` for file-side columns
- [`src/bom/components/BomMatchingReviewPartPanel.tsx`](../src/bom/components/BomMatchingReviewPartPanel.tsx) — **YOUR PART** / **HOW WE MATCHED IT** section titles (~L390–462)
- [`src/bom/pages/BomFieldMappingPage.tsx`](../src/bom/pages/BomFieldMappingPage.tsx) — edit-mode alerts + **REQUIRED** strip for unmapped required fields

**What changed**

- Replaced technical mapping jargon with file-centric labels.
- User’s imported values get a consistent visual shell (primary left border, subtle fill) in mapping, parsing, and review.
- Mapping summary de-emphasizes the link table so users read the narrative first.

---

## 3. Define a forced-review state for weak matches

| | |
|---|---|
| **Status** | Done (warning + gating, not hard block) |
| **App route** | Guided match — [`/bom/projects/:bomProjectId/matching/review`](http://localhost:5173/bom/projects/new/matching/review) (rows with medium/low score or figure-only match) |
| **Also** | Parsing review — [`/bom/projects/:bomProjectId/parsing-review`](http://localhost:5173/bom/projects/new/parsing-review) (weak parsed rows) |
| **Also** | Mapping blocked state — [`/bom/projects/:bomProjectId/mapping-summary`](http://localhost:5173/bom/projects/new/mapping-summary) |

**Code**

- [`src/bom/bomMatchingReviewAlert.ts`](../src/bom/bomMatchingReviewAlert.ts) — `currentPartMatchingReviewAlert()`: **warning** + *“Check this match before you confirm”* for low/medium confidence (~L82–95); figure-only → must pick SKU
- [`src/bom/components/BomMatchingReviewQualityAlert.tsx`](../src/bom/components/BomMatchingReviewQualityAlert.tsx) — renders per-line alert on guided screen
- [`src/bom/bomMatchSkuUtils.ts`](../src/bom/bomMatchSkuUtils.ts) — `matchRequiresSkuSelection()` / `isReadyToConfirmMatch()` — **Confirm** disabled until exact SKU when match is figure-level
- [`src/bom/bomMatchingReviewCtas.ts`](../src/bom/bomMatchingReviewCtas.ts) — `reviewCanConfirm()` used by guided header + table
- [`src/bom/bomParsingReviewAlert.ts`](../src/bom/bomParsingReviewAlert.ts) + [`src/bom/components/BomParsingReviewQualityAlert.tsx`](../src/bom/components/BomParsingReviewQualityAlert.tsx) — weak/missing parse data warnings (informational, not import blockers per PRD)
- [`src/bom/bomFieldMappingUtils.ts`](../src/bom/bomFieldMappingUtils.ts) + [`src/bom/pages/BomMappingSummaryPage.tsx`](../src/bom/pages/BomMappingSummaryPage.tsx) — `blocked` mapping confidence disables **Continue** until required columns linked

**What changed**

- Weak **match** confidence → forced attention via warning banner; user must consciously confirm (not auto-bulk-accepted).
- **Figure-level** match → confirm blocked until SKU variant selected.
- Weak **parsed** rows → highlighted + copy that matching may be weak; user can still continue.
- Bad **column mapping** → blocked at mapping summary (true blocker).

---

## 4. Remove redundant final match confirmation

| | |
|---|---|
| **Status** | Done |
| **App route** | End of guided flow — [`/bom/projects/:bomProjectId/matching/review`](http://localhost:5173/bom/projects/new/matching/review) (all lines visited → completion panel) |
| **Then** | Import scan — [`/bom/projects/:bomProjectId/matching/table`](http://localhost:5173/bom/projects/new/matching/table) with `guidedReviewComplete` in navigation state |

**Code**

- [`src/bom/components/BomGuidedReviewCompletePanel.tsx`](../src/bom/components/BomGuidedReviewCompletePanel.tsx) — global checkpoint: stats + **Continue to import summary** / **Review N skipped lines** (no per-line confirm here)
- [`src/bom/pages/BomProgressiveMatchingPage.tsx`](../src/bom/pages/BomProgressiveMatchingPage.tsx) — sequential 1→N review; navigates to table with `guidedReviewComplete: true` (~L100–103, ~L290–295); `reopenSkippedInGuided()` for skipped lines
- [`src/bom/bomMatchingColumns.tsx`](../src/bom/bomMatchingColumns.tsx) — when `guidedReviewComplete`, **accepted** rows show only `…` menu (no inline **Confirm match**) (~L123–157)
- [`src/bom/pages/BomMatchingPage.tsx`](../src/bom/pages/BomMatchingPage.tsx) — passes `showReviewCompleteBanner` / `guidedReviewComplete` into columns (~L156, ~L321); primary CTA **Save and import to BOM**

**What changed**

- Line-by-line **confirm** happens once in **guided review**, not again on the summary table for already-accepted rows.
- Completion screen is a **single global** decision point before the scan-only summary table.
- Skipped lines can re-enter guided review instead of forcing spreadsheet re-confirmation.
- On the summary table, **Change match** or **Pick exact product** saves the row immediately — no extra **Confirm match** step (see **7b**).

**Also (7b)**

- [`src/bom/hooks/useBomChoosePartDrawer.tsx`](../src/bom/hooks/useBomChoosePartDrawer.tsx) — `autoAcceptOnSelect` on the table
- [`src/bom/pages/BomMatchingPage.tsx`](../src/bom/pages/BomMatchingPage.tsx) — auto-accept after manual part change or SKU selection

---

## 5. Imported-part rows: non-link primary data, secondary actions in menu

| | |
|---|---|
| **Status** | Done |
| **App route** | Matching results — [`/bom/projects/:bomProjectId/matching/table`](http://localhost:5173/bom/projects/new/matching/table) |
| **Also** | Workspace — [`/bom/projects/:bomProjectId/workspace`](http://localhost:5173/bom/projects/new/workspace) |

**Code**

- [`src/bom/bomMatchingColumns.tsx`](../src/bom/bomMatchingColumns.tsx) — **Original part** column: plain `dataIndex: 'originalRequest'` text (~L48–53); overflow menu: View original, Go to submittal, Delete (~L125–145)
- [`src/bom/bomWorkspaceColumns.tsx`](../src/bom/bomWorkspaceColumns.tsx) — `ImportedPartCell`: `Typography.Text` only (~L46–57); **Figure** column alone uses `FigureLink` (~L27–43); `WorkspaceActionsCell` **Review** + `…` menu (~L131–176)
- [`src/bom/components/BomMatchDetailDrawer.tsx`](../src/bom/components/BomMatchDetailDrawer.tsx) — **Original imported part** section (read-only detail, not navigation)

**What changed**

- Competitor/imported line text is **never** a catalog link.
- ASC navigation stays on **Figure** / ASC product links only.
- Row utilities (original info, submittal, delete, change match) live in **secondary** overflow menu or **Review** — not on the imported label.

---

## 6. Split “Add item” into ASC search vs competitor BOM matching

| | |
|---|---|
| **Status** | Done |
| **App route** | [`/bom/projects/:bomProjectId/workspace`](http://localhost:5173/bom/projects/new/workspace) → **Add item** dropdown (empty + populated workspace) |

**Code**

- [`src/bom/pages/BomWorkspacePage.tsx`](../src/bom/pages/BomWorkspacePage.tsx) — dropdown (~L697–716 empty, ~L906–920 populated):
  - **Find an ASC part** → `AscProductsDrawer`
  - **Add competitor / unknown part** → modal → **Find match**
- [`src/bom/bomAdHocMatchSession.ts`](../src/bom/bomAdHocMatchSession.ts) — `createAdHocCompetitorMatchSession()` builds one-line import session
- [`src/bom/pages/BomWorkspacePage.tsx`](../src/bom/pages/BomWorkspacePage.tsx) — competitor **Find match** navigates to [`/bom/projects/:id/matching/review`](http://localhost:5173/bom/projects/new/matching/review) with `uploadId` (no direct workspace row insert)

**What changed**

- Single **Add item** forks into two explicit paths (ASC picker vs competitor/manual line).
- Competitor path enters **guided BOM matching** for one line instead of silently adding a workspace row.

---

## 7. Keep competitor matching in BOM, not the normal unified search path

| | |
|---|---|
| **Status** | Done |
| **App route** | BOM search hub — [`/bom/search`](http://localhost:5173/bom/search) |
| **Competitor results** | [`/bom/search/results?q=…`](http://localhost:5173/bom/search/results?q=coupling) |
| **ASC catalog** | Mode **ASC catalog** → [`/catalog/results?q=…`](http://localhost:5173/catalog/results?q=FP7450) |

**Code**

- [`src/bom/pages/BomSearchPage.tsx`](../src/bom/pages/BomSearchPage.tsx) — **Search mode** toggle: *Competitor / unknown* vs *ASC catalog*; competitor → `/bom/search/results`, ASC → `/catalog/results` (~L34–45, ~L71–80)
- [`src/bom/pages/BomCompetitorSearchResultsPage.tsx`](../src/bom/pages/BomCompetitorSearchResultsPage.tsx) — BOM-framed competitor results (stays under `/bom/*`)
- [`src/bom/BomRoutes.tsx`](../src/bom/BomRoutes.tsx) — route `search/results` (~L33)
- [`src/bom/pages/BomSiteProjectsPage.tsx`](../src/bom/pages/BomSiteProjectsPage.tsx) — search quick action → `/bom/search?mode=competitor` (~L410)

**What changed**

- Competitor/unknown search **no longer** dumps straight into generic `/catalog/results`.
- Explicit mode separation: catalog browse/search vs BOM competitor matching.
- Competitor results page copy states results stay in the **BOM flow**.

---

## 7b. No redundant Confirm match after table edits

| | |
|---|---|
| **Status** | Done |
| **App route** | Matching results — [`/bom/projects/:bomProjectId/matching/table`](http://localhost:5173/bom/projects/new/matching/table) |

**Code**

- [`src/bom/hooks/useBomChoosePartDrawer.tsx`](../src/bom/hooks/useBomChoosePartDrawer.tsx) — optional `autoAcceptOnSelect` sets `lineStatus: 'accepted'` after part pick
- [`src/bom/pages/BomMatchingPage.tsx`](../src/bom/pages/BomMatchingPage.tsx) — table uses `autoAcceptOnSelect: true`; SKU apply auto-accepts when ready

**What changed**

- After **Change match** or **Pick exact product** on the summary table, the row is saved immediately.
- Guided review still requires explicit confirm per line (`autoAcceptOnSelect: false` there).

---

## 9. Hide ASC catalog links on Import suggestion cards

| | |
|---|---|
| **Status** | Done |
| **App route** | Guided match — [`/bom/projects/:bomProjectId/matching/review`](http://localhost:5173/bom/projects/new/matching/review) (**HOW WE MATCHED IT**) |
| **Also** | Matching table detail drawer; figure-only SKU picker |

**Code**

- [`src/bom/bomWorkspaceDashboard.ts`](../src/bom/bomWorkspaceDashboard.ts) — `ascPartShowsCatalogLinks()`
- [`src/bom/components/BomMatchingReviewPartPanel.tsx`](../src/bom/components/BomMatchingReviewPartPanel.tsx)
- [`src/bom/components/BomMatchDetailDrawer.tsx`](../src/bom/components/BomMatchDetailDrawer.tsx)
- [`src/bom/components/BomSkuVariantPicker.tsx`](../src/bom/components/BomSkuVariantPicker.tsx)

**What changed**

- **Import** badges no longer show **View product** / **View PDF** / **View submittal** — those parts have no ASC catalog page.
- **Domestic** cards keep catalog links.

---

## 11. ASC figure links (ConnectED part listing)

| | |
|---|---|
| **Status** | Done |
| **App route** | Matching results — [`/bom/projects/:bomProjectId/matching/table`](http://localhost:5173/bom/projects/new/matching/table) (**Our Part** column) |
| **Also** | Row detail drawer |

**Code**

- [`src/bom/components/BomAscFigureLink.tsx`](../src/bom/components/BomAscFigureLink.tsx)
- [`src/bom/bomMatchingColumns.tsx`](../src/bom/bomMatchingColumns.tsx)
- [`src/bom/components/BomMatchDetailDrawer.tsx`](../src/bom/components/BomMatchDetailDrawer.tsx)

**What changed**

- **Fig. {number}** in **Our Part** is a clickable underlined link to the ASC products browser (figure pre-filled in search).
- **Original part** stays plain text. SKU lines are labelled **SKU** when shown.

---

## 12. Figure vs SKU — light UI cue and explanation

| | |
|---|---|
| **Status** | Done |
| **App route** | Guided match + matching table (figure-level rows) |

**Code**

- [`src/bom/bomMatchSkuUtils.ts`](../src/bom/bomMatchSkuUtils.ts) — shared copy helpers
- [`src/bom/components/BomMatchingReviewPartPanel.tsx`](../src/bom/components/BomMatchingReviewPartPanel.tsx)
- [`src/bom/bomMatchingColumns.tsx`](../src/bom/bomMatchingColumns.tsx)
- [`src/bom/components/BomMatchDetailDrawer.tsx`](../src/bom/components/BomMatchDetailDrawer.tsx)

**What changed**

- Figure-only matches show **Product family** badge plus plain-language text explaining the user must pick an exact SKU variant.
- Card titles append **— select SKU variant**; **Select SKU** panel appears on the right in guided review.

---

## Quick test path (all items)

1. Open [`/bom/site/3`](http://localhost:5173/bom/site/3) — upload/search cards.
2. Upload → mapping summary → field mapping → parsing review.
3. Continue to [`/bom/projects/new/matching/review`](http://localhost:5173/bom/projects/new/matching/review) — confirm lines 1…N in order; note weak-match warnings.
4. Completion panel → **Continue to import summary** → table without re-confirm on accepted rows.
5. Workspace → **Add item** → test both fork paths.
6. [`/bom/search`](http://localhost:5173/bom/search) — toggle modes and confirm URL targets.

---

## Out of scope for this checklist (not claimed above)

- Unified-search NLQ weighting preservation (architecture / backend; not in prototype).
- Full Figma 1:1 parity pass on every BOM screen.
- `docs/app-onboarding-notes.md` (local notes, not in PR).

---

*Last verified against branch `bom-upload-match-review-plan`.*
