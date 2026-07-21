# BOM Import — Figma Parity, Progress Bar, Progressive Matching & “Added Manually”

> **Status:** Implemented in prototype (May 2026)
> **Owner:** UX prototype (Hydra)
> **Source feedback:** Saeed “Key details” (Image 1)
> **Figma file:** [BOM-SPEC — ASC-Connected v2](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM-SPEC---ASC-Connected-v2?node-id=4969-16896)
> **Figma flow root:** `4969:16896` (frame “Frame 196” — *Flow: Upload File → BOM Translation process → BOMProject*)

---

## 0. TL;DR

End-to-end the import flow has **3 steps + manual pick branch + 1 success state**:

```
[ Upload modal ]
       │
       ▼
Step 1 / MAPPING ─ Field Mapping (02 / 4969:13572)
       │
       ▼
Step 2 / PARSING ─ Parsing Review (03a / 03b / 03c — column set depends on identifier)
       │
       ▼
Step 3 / TRANSLATING ─ Matching Results (12 / 4969:13967)
       │
       ├─► Refine → Replacement Picker (11a / 4969:13422)
       │     └─► Approve → row marked “Added manually”
       │
       └─► Save and import to BOM → Workspace
```

The plan therefore has **two pillars**, both end-to-end:

- **A. Figma parity** — bring Field Mapping, Parsing Review (3 variants), Matching Results, and Replacement Picker 1:1 with Figma frames `4969:13572 / 13642 / 13771 / 13863 / 13967 / 13422 / 13492`.
- **B. The 3 Saeed requests** — global progress strip, progressive matching, “Added manually” labels.

Each pillar is wired into the same `BomImportProgressState` so workspace alerts (`07 / 4859:171500`) know exactly which step is incomplete and route Continue to the right page.

---

## 1. Figma reference — per-screen audit

### 1.1 Step 1 — Field Mapping (`4969:13572`)

| Slot | Figma content |
|---|---|
| Back link | **Back to BOM** |
| Title | **Field mapping** |
| Description | *Map columns from your uploaded BOM to ASC fields before parsing. New BOM project.* |
| Primary CTA | **Save mapping & continue** |
| Secondary CTA | **Cancel upload** |
| Body left | Two-column table: **ASC FIELD** ↔ **YOUR BOM COLUMN**. Rows: Part Number, Description, Quantity, Brand, Figure Number, Finish, Mfr Number, Install Type, Manufacturer (mapped to PART NUMBER, DESCRIPTION, QTY, BRAND, FIGURE NUM, FINISH, MFR NUM, INSTALL TYPE, MANUFACTURER). |
| Body right | Side panel **Mapping status** with text **Fields mapped 11 / 11** and link **Reset to Defaults**. |

#### Repo today (`BomFieldMappingPage.tsx`)
- ✅ Has Back to BOM, Save mapping & continue, Cancel upload, ASC fields, alias map.
- ❌ Side panel “Mapping status / Fields mapped X/Y / Reset to Defaults” missing.
- ❌ Description copy slightly different.
- ❌ Some ASC field labels differ (MATERIAL, ORDER FLAG are in repo but **not in Figma**) — keep them for now but de-emphasize in UI to stay in scope.

### 1.2 Step 2 — Parsing Review (3 variants)

Common chrome on all variants:

| Slot | Figma content |
|---|---|
| Back link | **Back to BOM** |
| Title | **Parsing review** |
| Description | *Review parsed rows before matching. Project: New BOM project.* |
| Primary CTA | **Continue to matching** |
| Secondary CTA | **Cancel upload** |
| Banner | Info `Alert`: **5 items parsed** + *2 rows may need attention (confidence or missing attributes)* |

Table columns by mapped identifier (left → right, widths in px from Figma):

| Variant (frame) | Columns |
|---|---|
| **3a — Has DESCRIPTION** (`4969:13642`) | `#` 56 · **Original Description** 252 · **Parsed Description** 252 · **SKU** 127 · **Size (inches)** 110 · **Manufacturer** 120 · **Figure Number** 127 · **UPC** 127 · **Qty** 110 |
| **3b — SKU only** (`4969:13771`) | `#` 56 · **SKU** 758 · **Size (inches)** 110 · **Manufacturer** 120 · **Figure Number** 127 · **Qty** 110 |
| **3c — UPC, no DESCRIPTION** (`4969:13863`) | `#` 56 · **UPC** 631 · **SKU** 127 · **Size (inches)** 110 · **Manufacturer** 120 · **Figure Number** 127 · **Qty** 110 |

#### Repo today (`BomParsingReviewPage.tsx`)
Columns today: `# | Original input | Parsed description | Size | Pressure (PSI) | Connection (Type) | Qty | Confidence`.
- ❌ **Pressure** and **Connection** columns are **not in Figma** — remove.
- ❌ **Confidence** column not in Figma either — remove (confidence becomes a row-level tag in the matching step).
- ❌ **Manufacturer**, **Figure Number**, **UPC**, **SKU** columns missing in current parsing review — add per variant.
- ❌ The 3 column profiles (Description / SKU / UPC) are not yet selected by the prior mapping decision; need to drive column set by `fieldMapping`.

### 1.3 Step 3 — Matching Results (`4969:13967`)

| Slot | Figma content |
|---|---|
| Back link | **Back to BOM** |
| Title | **Matching results** |
| Description | *Catalog candidates per BOM line. Project: New BOM project.* |
| Primary CTA | **Save and import to BOM** |
| Secondary CTA | **Cancel upload** |
| Stats strip | Four KPI cards (170 × 32 each): **Total items 7**, **Accepted 5**, **Pending 5**, **Skipped 2** + a fifth (326 × 28) **Match Confidence: High** |
| Alert | Info `Alert` (“Alert title / Additional description…”) — left in place as system/info banner |
| Toolbar | Left: `Select` *All confidence level* · Right: button **Accept all high matches and skip rest** |
| Table | `Line` 56 · `Original part` 401 · `Our Part` 392 · `Match score` 140 · `Status` 101 · `Actions` 191 |
| Match score cell | Tag: **High / Medium / Low** + **Added manually** badge for manually-picked rows |
| Status cell | **Pending / Accepted / Skipped** tag |
| Actions cell | Per row: **Accept**, **Refine**, **Skip** |

#### Repo today (`BomMatchingPage.tsx`)
Columns today: `Line | Original request | Top match | Risk | Actions (Refine)`. Primary CTA: *Skip to workspace*. No stat cards, no Status column, no Accept/Skip, no Cancel upload.
- ❌ Add stat cards, Status column, per-row Accept/Skip, “Save and import to BOM”, “Cancel upload”.
- ❌ Replace “Refine → /narrow → /recommend” with “Refine → Replacement Picker (`/matching/replacement`)”.
- ❌ Rename column “Top match” → **Our Part** to match Figma.
- ❌ Add `source: 'auto' | 'manual'` to drive the **Added manually** badge.

### 1.4 Step 3 branch — Replacement Picker (`4969:13422` and `4969:13492`)

| Slot | Figma content |
|---|---|
| Back link | **Back to Review** (variant a) / **Back to Workspace** (variant b — “Different variant added”) |
| Title | **Replacement Part** |
| Description | *Select ASC replacement part — Choose an ASC product to replace the current suggested match for this BOM line.* |
| Primary CTA | **Approve** |
| Secondary CTA | **Choose different part** |
| Context strip | **Manual Swap:** `<ASC#>` — `<Description>` · `<Category>` · `<Size>` |
| Table | `Select` 82 · **SKU** 157 · **Part** 257 · **Figure Number** 157 · **UPC** 157 · **Size** 157 · **Weight** 157 · **Match Score** 157 |
| Match Score cell | Tag: **High / Medium / Low / processing**, and **Added manually** when the row is picked (variant b) |

#### Repo today
- `BomNarrowPage` (guided Q&A) + `BomRecommendPage` (single suggested part) **do not match** this Figma flow. The new flow is a **single picker page** with a table of candidate variants and an Approve button.
- We will introduce a new page `BomReplacementPickerPage` mounted on `projects/:id/matching/items/:itemId/replacement` and route Refine → it. `Narrow`/`Recommend` stay reachable as “Guided narrowing” advanced links from the picker but are no longer on the happy path.

### 1.5 Upload destination modal (`4969:14094` / `4969:14095`)

| Slot | Figma content |
|---|---|
| Title | **Modal title** (e.g. *Choose destination*) |
| Subhead | **Selected file** + description |
| Body | Radio set: **Create a new BOM project** / **Add to an existing BOM project** with `Select` for the project |
| CTAs | **Cancel** + **Continue** |

#### Repo today
- `BomUploadDestinationModal` exists with similar shape — confirm copy / Select dropdown matches Figma, polish if needed.

### 1.6 Workspace Resolve modal (`4969:13571`)

Title **Resolve BOM Line** with optional Rating, textarea, Cancel + **Submit & Confirm** — already implemented inside `BomWorkspacePage` resolve flow.

---

## 2. Cross-screen elements introduced by Saeed feedback

> Saeed-requested additions that are **not yet in Figma** (proposed local compositions, fully tokenized).

### 2.1 Global Import Progress Strip

A persistent strip rendered **at the top of Field Mapping, Parsing Review, Matching, Replacement Picker** (any screen with an in-progress import).

- `Card` containing antd `Steps size="small"` with 3 items: **Map columns**, **Review parsed rows**, **Match parts**, optionally **Done**.
- Below the Steps, an antd `Progress` line showing fine-grained progress inside the current step:
  - Step 1: mapping coverage (`N/Total` ASC fields mapped).
  - Step 2: parsed rows count vs uploaded rows.
  - Step 3: `accepted + skipped + manual` ÷ `total`.
- Right side: small `Typography.Text type="secondary"` reading *“File: BOM-ExLine.xlsx · started 12:08 PM”* for context.

Reuse the same numbers as the Matching stats cards — no duplicate counters.

### 2.2 Workspace “Continue file upload” alerts get a progress preview

The two yellow `Alert`s on the workspace screen become **progress-aware**:

```
⚠  Continue file upload process for “BOM-ExLine.xlsx”?
   Stopped at: Review parsed rows · 2 of 3 steps complete
   ▓▓▓▓▓▓▓▓░░░░░░  66 %                            [ Continue → ]
```

The Continue button uses the persisted `BomImportProgress.currentStep` to route to **the exact page** the user stopped on (not always field mapping).

### 2.3 Progressive matching mode

Step 3 keeps **two view modes** that share the same data and progress:

| Mode | Default | Layout | When to use |
|---|---|---|---|
| **Progressive** | ✅ Default after Parsing Review | One row at a time (pattern adapted from `BomTranslatePage`), with **Accept & next** / **Refine** / **Skip** | Common flow — quickest path for users who just want to confirm one by one |
| **Table** (existing Figma frame `4969:13967`) | Toggled via *“View as table”* button in the header | Full table with stats, filter, “Accept all high matches and skip rest” | Power users / bulk operations / overview |

Both share:
- The Refine action → opens **Replacement Picker** (`4969:13422`).
- The Accept/Skip semantics and counts.
- The `source: 'auto' | 'manual'` flag, so **Added manually** is rendered identically in both.

> Note: the progressive view is a **local composition** (no shared component changes) until product validates the pattern.

---

## 3. Reconciliation tasks (end-to-end, ordered)

Each task is local; **no shared/core component or token is touched**; only existing antd primitives + Hydra tokens.

### 3.1 Data layer
1. Extend `BomMatchResult` (in `src/bom/data/types.ts`):
   - `status: 'pending' | 'accepted' | 'skipped'`
   - `source: 'auto' | 'manual'`
2. Add `BomImportStep`, `BomImportProgress`, `BomMatchScoreBand` (`'high' | 'medium' | 'low' | 'processing'`).
3. Add module `src/bom/bomImportProgressState.ts`:
   - In-memory map keyed by `bomProjectId` (mirrors `bomUploadFlowState.ts`).
   - Mock seeds for two “Continue upload…” entries on the workspace.

### 3.2 Field Mapping (`BomFieldMappingPage`)
4. Move primary actions to header: **Cancel upload** (secondary), **Save mapping & continue** (primary).
5. Add right-side `Card` panel **Mapping status** with:
   - Big number `Fields mapped N / Total`.
   - Link **Reset to defaults** (resets `aliasMap` to `DEFAULT_ALIAS`).
6. Update description copy to Figma: *Map columns from your uploaded BOM to ASC fields before parsing.*
7. Mount `BomImportProgressStrip` above the body.

### 3.3 Parsing Review (`BomParsingReviewPage`)
8. Drive column set from `fieldMapping`:
   - If `DESCRIPTION` mapped → **3a** columns.
   - If only `SKU` mapped → **3b** columns.
   - If `UPC` mapped, no `DESCRIPTION` → **3c** columns.
9. Remove **Pressure**, **Connection**, **Confidence** columns from this screen entirely.
10. Add **Manufacturer**, **Figure Number**, **UPC**, **SKU** columns where Figma shows them; widths per §1.2.
11. Replace existing primary `BOM home` link with **Cancel upload** in the header.
12. Mount `BomImportProgressStrip` above the body.

### 3.4 Matching Results (`BomMatchingPage`)
13. Header: **Cancel upload** (secondary) + **Save and import to BOM** (primary). Replace “Skip to workspace”.
14. Add **stats strip** (5 cards): `Total items`, `Accepted`, `Pending`, `Skipped`, `Match Confidence`. Use 4 KPI cards + 1 wider Match Confidence panel matching Figma widths.
15. Add Info `Alert` slot at top of body for system messages (e.g. *“1 row needs your attention”*).
16. Toolbar: keep confidence `Select`; rename bulk button to **Accept all high matches and skip rest**.
17. Rename column **Top match → Our Part**.
18. Add column **Match score** rendering:
    - `source === 'manual'` → `Tag color="default"` text **Added manually**.
    - Else `Tag color={confidenceColor(band)}` text **High / Medium / Low / Processing**.
19. Add column **Status** with tag (Pending / Accepted / Skipped) + sortable.
20. Replace Actions cell with **Accept · Refine · Skip** links/buttons that update `status` + `source` and persist via `bomImportProgressState`.
21. Refine routes to **Replacement Picker** (`/bom/projects/:id/matching/items/:itemId/replacement`).
22. Add **View as table / View progressive** toggle in header.
23. Mount `BomImportProgressStrip`.

### 3.5 Progressive Matching (`BomProgressiveMatchingPage` — NEW)
24. Add route `projects/:bomProjectId/matching/progressive` in `BomRoutes.tsx`.
25. Lift the one-by-one layout from `BomTranslatePage`:
    - Top: progress strip + `BomImportProgressStrip`.
    - Middle: Original part vs Our Part panels with arrow.
    - Bottom: **Accept & next** primary · **Manual pick → Replacement Picker** secondary · **Skip** tertiary.
26. Update workspace return summary to *“X accepted · Y added manually · Z skipped”*.

### 3.6 Replacement Picker (`BomReplacementPickerPage` — NEW)
27. New route `projects/:bomProjectId/matching/items/:itemId/replacement`.
28. Header: **Replacement Part** title + Back link (Review vs Workspace based on entry point).
29. Context strip: **Manual Swap:** ASC# · description · category · size.
30. Table per Figma §1.4: Select / SKU / Part / Figure Number / UPC / Size / Weight / Match Score.
31. Approve sets `source = 'manual'`, returns to the originating screen with the row marked **Added manually**, advances progressive index if applicable.
32. Choose different part = clear selection.

### 3.7 Workspace alerts (`BomWorkspacePage`)
33. Replace the two static yellow alerts with the **progress-aware variant** from §2.2.
34. Continue button reads `bomImportProgressState.currentStep` and routes to the right page.
35. Auto-dismiss the alert when the corresponding import completes (`currentStep === 'done'`).

### 3.8 Upload destination modal (`BomUploadDestinationModal`)
36. Confirm copy + Select dropdown matches Figma (`4969:14094 / 14095`); polish small string differences only.

### 3.9 Done / success state
37. After Save and import to BOM → navigate to workspace with banner:
    *“Imported N items from BOM-ExLine.xlsx — A accepted · M added manually · S skipped.”*

---

## 4. State coverage matrix (per `ux-guardrails.mdc`)

| State | Field Mapping | Parsing Review | Matching (table) | Progressive | Replacement Picker | Workspace alerts |
|---|---|---|---|---|---|---|
| default | strip step 1 | strip step 2 | strip step 3 + stats cards | strip step 3, item 1 | manual-swap context strip | progress card |
| loading | disable Save | disable Continue | Skeleton table | Skeleton item card | Skeleton table | disabled Continue |
| empty | unchanged | “Nothing to parse” path | empty matching set | “All items already confirmed” | empty candidates | no alert |
| error | inline Alert + Retry | inline Alert + Retry | matching error Alert + Retry | inline error in item card + Retry | inline error + Retry | alert with `type="error"` |
| success | step 1 ✓ | step 2 ✓ | step 3 ✓ + import summary | summary card | row marked “Added manually” | alert auto-dismisses |
| read-only | disabled Save | disabled Continue | disabled Accept/Skip | disabled buttons | disabled Approve | Continue hidden |
| no results | n/a | 0 parsed rows path covered | empty table | n/a | “No candidates” | n/a |
| missing data | tooltip stays | banner already covered | row → “No matches — Manual pick required” + Manual pick CTA | same | empty Match Score → “processing” | alert shows step + “0 of N matched yet” |

---

## 5. Open questions (decisions still needed)

1. **Default step 3 mode**: progressive vs table — currently I propose **progressive by default**; confirm.
2. **Pressure / Connection columns**: Figma removed them from parsing review. Are they redundant with `Size`, or should they survive as an *Advanced columns* toggle in the table header?
3. **Skipped rows on import**: stored as `Pending` in the workspace so they can be revisited, or stored as `Skipped` and shown only via a filter?
4. **`MATERIAL` and `ORDER FLAG`** ASC fields exist in repo but **not in Figma** — keep silently, or drop from the field mapping list?
5. **Workspace alerts for Ready projects**: in the current mock, project `id: '3'` (Office Complex) has two alerts — do they live only when there *really is* an unfinished import, or do we keep them as a demo always-on for screenshots?
6. **`Resetto Defaults`** typo in Figma — keep as **Reset to defaults** in code (correct spelling)?
7. **Refine target**: confirm Refine → Replacement Picker (not the existing Narrow/Recommend flow). If yes, can Narrow/Recommend be dropped from routing, or kept as a `?advanced=true` flag?

---

## 6. Acceptance criteria

- [x] All import screens (Field Mapping, Parsing Review, Matching, Progressive Matching, Replacement Picker) render the **same progress strip** at the top.
- [x] Parsing Review table renders the **correct column set** for each of the 3 mapping profiles (Description / SKU / UPC).
- [x] Matching Results table has **stats strip + Status column + per-row Accept/Skip + Refine**, with primary CTA **Save and import to BOM** and secondary **Cancel upload**.
- [x] Replacement Picker page exists at `projects/:id/matching/items/:itemId/replacement` and approves with `source = 'manual'`.
- [x] Manually-picked lines render **Added manually** in Matching table, Progressive Matching, and Recommend (legacy refine path).
- [x] Workspace alerts show progress (label + bar) and Continue routes to the correct step; import-complete summary banner on workspace.
- [x] Build passes (`npm run build`) with no shared/core component or token edits.
- [x] Workspace table layout unchanged beyond upload alerts + import summary banner.

---

## 7. Out of scope (this plan)

- Export, Service Request, Translate (kept as-is unless touched by step-3 refactor).
- Catalog / Product Browser visual changes.
- Sidebar / shell navigation changes.
- Any change to shared components (Ant Design overrides, Hydra theme tokens).
- Reset/edit of the workspace table on the BOM Workspace page.

---

## 8. Implementation order recommended

1. **Data layer** (§3.1) — types + state module + mock seeds. Build passes.
2. **Field Mapping** (§3.2) — quickest visual win.
3. **Parsing Review** (§3.3) — variants drive matching downstream.
4. **Matching Results table parity** (§3.4) — stats, Status, per-row actions.
5. **Replacement Picker** (§3.6) — Refine target unblocks Matching.
6. **Progressive Matching** (§3.5) — once data + Replacement Picker exist.
7. **Workspace alerts** (§3.7) — read from progress state.
8. **Upload destination modal polish** (§3.8) — small copy / Select adjustments.
9. **Done summary banner** (§3.9) — last.
10. Final pass: `npm run build`, ReadLints, screenshot diff against Figma frames.
