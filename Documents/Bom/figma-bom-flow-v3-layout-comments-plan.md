# Figma layout comments — BOM Flow V3

**Section:** [BOM Flow V3](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM-SPEC---ASC-Connected-v2?node-id=5022-23065) (`5022:23065`)  
**Commit range:** `ad8ebf0` → `HEAD`  
**Format:** **What** + **Why** only (English)  
**Rule:** [figma-layout-change-comments.mdc](../../.cursor/rules/figma-layout-change-comments.mdc)

Only the **8 screens** below receive comments. No pins on pre-existing buttons (Back, Save and import, Approve, etc.).

---

## 1 — Workspace / Main v2 (`5024:29217`)

| # | Pin node | Node ID | x | y | Comment | Figma comment ID |
|---|----------|---------|---|---|---------|------------------|
| 1 | Resume import banner | `5024:29236` | 46894 | -13911 | **What:** Incomplete BOM import banner on workspace. **Why:** Lets the user resume an interrupted upload from the project workspace, with file name and stopped step visible before they continue. | `1779711005` |
| 2 | Progress on banner | `5024:29243` | 46918 | -13829 | **What:** Progress indicator on the resume banner. **Why:** Shows how far the import pipeline has progressed so the user knows what remains before returning to mapping, parsing, or matching. | `1779711032` |

---

## 2 — Field Mapping (`5022:23824`)

| # | Pin node | Node ID | x | y | Comment | Figma comment ID |
|---|----------|---------|---|---|---------|------------------|
| 3 | Import progress block | `5025:30159` | 42151 | -11786 | **What:** Import progress strip (step 1 of 3). **Why:** Orients the user in the upload → map → parse → match pipeline and shows mapping progress for the active file. | `1779711069` |
| 4 | Mapping status panel | `5022:23888` | 43208 | -11560 | **What:** Mapping status side panel. **Why:** Confirms required ASC fields are mapped before parsing and offers a quick fields-mapped count with reset. | `1779711080` |

---

## 3 — Parsing Review / Has DESCRIPTION (`5022:23894`)

| # | Pin node | Node ID | x | y | Comment | Figma comment ID |
|---|----------|---------|---|---|---------|------------------|
| 5 | Variant table | `5022:23916` | 43795 | -11498 | **What:** Parsing review table (Description column variant). **Why:** Step 2 — user validates and edits parsed rows before matching; columns match a Description identifier from field mapping. | `1779711103` |
| 6 | Parsing summary alert | `5022:23914` | 43795 | -11604 | **What:** Parsed-items summary alert. **Why:** Surfaces how many rows were parsed and which may need attention before the user continues to matching. | `1779711113` |

---

## 4 — Parsing Review / Has UPC no DESCRIPTION (`5022:24115`)

| # | Pin node | Node ID | x | y | Comment | Figma comment ID |
|---|----------|---------|---|---|---------|------------------|
| 7 | Variant table | `5022:24136` | 43795 | -10329 | **What:** Parsing review table (UPC column variant). **Why:** Step 2 — user validates and edits parsed rows before matching; columns match a UPC identifier from field mapping. | `1779711192` |
| 8 | Parsing summary alert | `5022:24134` | 43795 | -10435 | **What:** Parsed-items summary alert. **Why:** Surfaces how many rows were parsed and which may need attention before the user continues to matching. | `1779711223` |

---

## 5 — Parsing Review / Only SKU (`5022:24023`)

| # | Pin node | Node ID | x | y | Comment | Figma comment ID |
|---|----------|---------|---|---|---------|------------------|
| 9 | Variant table | `5022:24044` | 43795 | -9231 | **What:** Parsing review table (SKU-only column variant). **Why:** Step 2 — user validates and edits parsed rows before matching; columns match SKU-only mapping from field mapping. | `1779711256` |
| 10 | Parsing summary alert | `5022:24042` | 43795 | -9337 | **What:** Parsed-items summary alert. **Why:** Surfaces how many rows were parsed and which may need attention before the user continues to matching. | `1779711287` |

---

## 6 — Matching Results (`5026:21396`)

| # | Pin node | Node ID | x | y | Comment | Figma comment ID |
|---|----------|---------|---|---|---------|------------------|
| 11 | Import progress block | `5026:21409` | 45460 | -11852 | **What:** Import progress strip on matching results. **Why:** Marks step 3 of the import flow and shows overall progress while the user reviews catalog matches. | `1779711306` |
| 12 | KPI stat strip | `5026:21422` | 45460 | -11604 | **What:** Summary metric cards (Total, Accepted, Pending, Skipped, Match Confidence). **Why:** Gives at-a-glance counts so the user can see import status before working through individual lines. | `1779711328` |
| 13 | Confidence filter | `5026:21447` | 45476 | -11520 | **What:** Confidence level filter. **Why:** Lets the user narrow the table to high, medium, or low match bands during review. | `1779711439` |
| 14 | Bulk high-match action | `5026:21448` | 46476 | -11520 | **What:** Accept all high matches and skip rest. **Why:** Offers a faster path when most lines are high-confidence and do not need individual review. | `1779711473` |
| 15 | Results table | `5026:21449` | 45460 | -11476 | **What:** Matching results table. **Why:** Main surface to review each BOM line, compare original input to the suggested ASC match, and decide next steps. | `1779711510` |
| 16 | Status column | `5026:21486` | 46449 | -11476 | **What:** Line status column. **Why:** Shows whether each line is still pending, accepted, or skipped during import review. | `1779711538` |
| 17 | Match score column | `5026:21479` | 46309 | -11476 | **What:** Match score column. **Why:** Communicates match confidence or that a line was added manually instead of auto-matched. | `1779711572` |
| 18 | Actions column | `5026:21493` | 46550 | -11476 | **What:** Row actions column. **Why:** Supports per-line accept, skip, and refine without leaving the table. | `1779711583` |

---

## 7 — Matching Results - Confirmed (`5026:21993`)

| # | Pin node | Node ID | x | y | Comment | Figma comment ID |
|---|----------|---------|---|---|---------|------------------|
| 19 | Import progress (complete) | `5026:22006` | 47128 | -11852 | **What:** Matching-results confirmed state (import progress complete). **Why:** Signals that step 3 review is finished and the user can proceed toward workspace import without an open matching task. | `1779711672` |

---

## 8 — Replacement Picker (`5026:90934`)

| # | Pin node | Node ID | x | y | Comment | Figma comment ID |
|---|----------|---------|---|---|---------|------------------|
| 20 | Manual swap alert | `5026:90954` | 48835 | -11756 | **What:** Manual swap context alert. **Why:** Identifies which part is being replaced and instructs the user to select a catalog row before approving the manual pick. | `1779711697` |
| 21 | Replacement catalog table | `5026:90955` | 48835 | -11642 | **What:** ASC replacement picker table. **Why:** Presents selectable catalog SKUs so the user can choose the ASC product that should replace the current line match. | `1779711720` |
| 22 | Match Score column | `5026:91005` | 49936 | -11642 | **What:** Match Score column (extra width). **Why:** Gives tag labels such as “Added manually” and confidence bands enough room to read clearly. | `1779711727` |

---

## Summary

| Screen | Pins |
|--------|------|
| Workspace | 2 |
| Field Mapping | 2 |
| Parsing ×3 | 6 |
| Matching Results | 8 |
| Confirmed | 1 |
| Replacement Picker | 3 |
| **Total** | **22** |

---

## Execution

**Posted:** 2026-05-28 via Figma Console MCP (`figma_post_comment`).  
**Pins:** 22/22 successful (comment IDs `1779711005`–`1779711727`).  
**Skipped:** Optional V3 parity (Candidates column, Approve button variant, stat card borders) — not in comment scope.
