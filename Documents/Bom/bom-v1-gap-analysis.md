# BOM V1 — Gap Analysis

> **Date:** May 28, 2026
> **Audience:** Product designer / product owner
> **Purpose:** Compare what was agreed in the V1 scoping meeting against the current prototype state, call out gaps clearly, and surface open decisions.

---

## 1. V1 Scope Agreed in the Meeting

The meeting locked in a **sequential, guided, controlled flow**. No smart dashboards, no bulk automation, no advanced features. Here is the V1 contract:

| Step | What happens |
|------|-------------|
| **Upload** | User uploads one or more BOM files to a project. If the process is interrupted at any point, progress is saved and the user can return and continue. |
| **Field mapping** | User must map at least one of: **Description**, **Figure Number**, or **Part Number / SKU**. Minimum one; system prevents proceeding without it. |
| **Parsing review** | System extracts metadata (size, skew, etc.). User reviews parsed rows and manually corrects anything wrong before continuing. |
| **Match verification** | System matches competitor parts to ASC parts and assigns a confidence score. User goes through items one by one and either: **accepts** a high-confidence match, **manually refines** (opens catalog/search, picks a part), or **skips** the item. |
| **Save and Import** | Button is **disabled** until every item is either accepted or skipped — no finishing with pending rows. |
| **Error notifications** | If any step fails (upload, mapping, parsing, matching), the system shows a clear notification telling the user where the problem is and what to do. |

**Explicitly out of V1 (saved for V2):**
- Progress bars / percentage indicators
- Natural language search / queries
- Returning to and re-scoring match results after import
- Post-import part refinement

---

## 2. What Is Already Working in the Repo

The prototype has solid coverage of the structural and visual layer:

- **Full route hierarchy** — all 5 import steps have pages: field mapping, parsing review, matching (table view), progressive matching (one-by-one view), and replacement picker.
- **3-column profiles in parsing review** — the table adapts based on which identifier the user mapped (Description / SKU-only / UPC). Cells are editable.
- **Match confidence labels** — High / Medium / Low / Processing tags, plus an "Added manually" badge for hand-picked parts.
- **Per-row actions in matching** — Accept, Refine, Skip all exist on `BomMatchingPage`. Refine routes to the Replacement Picker.
- **Replacement Picker** — a catalog table where the user can select an ASC part and approve it. Sets `source: 'manual'` on the row.
- **Session resume (within same browser tab)** — workspace shows "Continue upload" alerts with the correct step and a Continue button that routes to the right page.
- **Edit project name** — modal accessible from both the landing page and the workspace header.
- **File validation on upload** — wrong file type and files over 50 MB are caught immediately.
- **Workspace warnings and import summary banner** — shown after Save and Import.

---

## 3. Gaps — V1 Requirements Not Met

These are features the meeting explicitly agreed for V1 that are either missing, broken, or incomplete in the current prototype.

---

### 3.1 Persistence does not survive a page refresh

**Agreed:** If the upload or matching is interrupted, the process stays saved and the user can return and continue.

**Current state:** All import session data is stored in memory only (a JavaScript Map). Refreshing the page wipes it completely. There is no localStorage, sessionStorage, or API backing.

**Impact:** The resume flow (workspace "Continue" alerts) works only if the user stays in the same browser tab without refreshing. Any navigation away or accidental refresh loses all progress silently.

**What needs to happen:** Decide whether V1 persistence means (a) localStorage/sessionStorage (client-only, survives refresh but not cross-device), (b) a backend session, or (c) accepting refresh = data loss as a known V1 limitation and documenting it clearly.

---

### 3.2 "Save and Import" is not blocked by pending items

**Agreed:** The Save and Import button must be disabled until every item is either accepted or skipped. No importing with pending rows.

**Current state:** The button is always active. Clicking it navigates to the workspace and shows a summary banner regardless of how many items are still pending.

**Impact:** Users can "finish" an import without reviewing all parts, which breaks the core V1 contract.

**What needs to happen:** The button must be disabled (with a tooltip explaining why) as long as any row has `status: 'pending'`. It should only become active when all rows are `accepted` or `skipped`.

---

### 3.3 Progressive (one-by-one) matching page is unreachable from the UI

**Agreed:** V1 is a guided, one-by-one review flow.

**Current state:** The progressive matching page (`/matching/progressive`) exists and is fully built — it shows one item at a time with Approve / Skip / Manual pick. However, `BomMatchingPage` (the table view) has no button or link leading to it. The page is only reachable by typing the URL directly.

**Impact:** The core V1 matching experience is invisible to the user.

**What needs to happen:** The matching step should default to the progressive (one-by-one) view, or at minimum have a clearly visible entry point from the matching table. The current table view can remain as a secondary "View all" option.

---

### 3.4 "Cancel Upload" does not clean up the session

**Agreed:** Cancelling an upload should exit the flow cleanly.

**Current state:** Clicking "Cancel upload" only navigates the user away. The in-progress session remains stored as "pending" in memory and keeps showing up as a "Continue upload" alert on the workspace indefinitely.

**Impact:** The workspace accumulates ghost alerts for cancelled uploads. The session cleanup function (`dismissSession`) exists in the codebase but is never called.

**What needs to happen:** Cancel must call `dismissSession` before navigating. A confirmation modal should ask the user whether they want to discard progress.

---

### 3.5 "Save and Import" does not add lines to the workspace table

**Agreed:** After completing the import, the BOM project reflects the imported parts.

**Current state:** After saving, only a summary banner is shown (e.g. "Imported 7 items — 5 accepted, 1 added manually, 1 skipped"). The accepted and manually-picked lines are never actually added to the workspace table rows.

**Impact:** The workspace table after import is identical to before. The import produces no visible result beyond the banner.

**What needs to happen:** Design decision needed — see Section 5, question 1.

---

### 3.6 Figure Number is missing from the required mapping validation

**Agreed:** User must map at least one of: Description, Figure Number, or Part Number / SKU.

**Current state:** The validation only checks for Description, SKU, or UPC. Figure Number is not listed as a qualifying minimum field.

**Impact:** A user who maps only Figure Number (a common case for catalog-heavy BOMs) cannot proceed, even though the meeting agreed it should be sufficient.

**What needs to happen:** Add Figure Number to the "at least one of these" validation rule in field mapping.

---

### 3.7 Error notifications are incomplete past the upload step

**Agreed:** If the process breaks at any phase, the system shows a notification and tells the user clearly where the problem is.

**Current state:** File upload errors are handled (wrong type, oversized file). Everything downstream — parsing failures, matching service errors, session corruption — has no error handling. Failures in these steps are silent.

**Impact:** If anything goes wrong during parsing or matching, the user sees nothing and does not know whether to retry, restart, or contact support.

**What needs to happen:** Each step (parsing, matching, save) needs an error state: an inline alert with a clear message and a retry or restart action.

---

## 4. V2 Items Already Built in the Prototype

These were moved to V2 in the meeting but are already implemented in the codebase. They are not breaking anything, but the designer should be aware so they are not treated as V1 deliverables or included in V1 Figma specs.

| Feature | Where it lives | Meeting decision |
|---------|---------------|-----------------|
| **Progress percentage bar** | `BomImportProgressStrip` — the strip shows a filled `Progress` bar with a percentage number inside the import steps card | Moved to V2 ("no progress bars in V1"). The 3-step indicator above it is V1-appropriate; the percentage fill bar specifically is V2. |
| **Natural language search** | `BomSearchPage` — fully routed at `/bom/search`, accessible from the landing page | Moved to V2 ("no natural language queries"). The page works but should not be surfaced prominently in V1 designs. |
| **Progressive matching page** | `BomProgressiveMatchingPage` — fully built but unreachable from the UI (see Gap 3.3) | Technically V1-intended, but treated as invisible V2 in the current prototype due to the missing entry point. |

---

## 5. Open Design Decisions

These were not resolved in the meeting or the repo. They need a product answer before the Figma screen can be finalized.

**1. Does "Save and Import" populate the workspace table?**
After the user completes the import flow, do accepted and manually-picked lines appear as rows in the workspace table? Or does the workspace table stay independent, and the import just records that the job is done?

*Current prototype behavior:* Only a banner. No rows added.

**2. What happens to skipped items?**
If a user skips an item during matching, where does it go? Options:
- Stored in the workspace as a "Pending" row (user can revisit later from workspace)
- Filtered out and not shown in workspace at all
- Shown in workspace with a "Skipped" status tag (read-only until user explicitly re-reviews)

**3. What is the acceptable persistence model for V1?**
If the user closes the browser mid-import, should the in-progress state survive? Options:
- **Accept data loss** — V1 is a prototype; refresh = start over. Document it clearly in UI ("Your progress may be lost if you close this tab").
- **Client-side persistence** — save to localStorage/sessionStorage. Survives refresh, not cross-device.
- **Server-side session** — persists fully but requires backend work.

**4. What does the workspace look like for a project with no completed import yet?**
The empty state exists in the prototype, but it is not clear whether an in-progress import should block access to the workspace or simply show the empty state with the resume alert.

---

## 6. Summary Table

| # | Requirement | Status |
|---|-------------|--------|
| Multiple BOM files per project | Supported | ✅ Working |
| Edit project name | Modal on landing + workspace | ✅ Working |
| Map at least one field (Description / Figure Number / SKU) | Partially — Figure Number missing from validation | ⚠️ Gap |
| Parsing review with editable rows | Working, 3 column profiles | ✅ Working |
| Match confidence score per line | High / Medium / Low tags | ✅ Working |
| Accept / Refine / Skip per row | All three actions present | ✅ Working |
| Manual pick via catalog (Replacement Picker) | Working | ✅ Working |
| One-by-one review flow (progressive) | Built but unreachable from UI | ❌ Gap |
| Save and Import disabled until all processed | Not enforced | ❌ Gap |
| Save and Import writes rows to workspace | Not implemented — banner only | ❌ Gap |
| Resume if process interrupted | Same tab only; lost on refresh | ⚠️ Gap |
| Cancel upload cleans up session | Navigate only; session lingers | ❌ Gap |
| Error notifications at each step | Upload only; downstream silent | ❌ Gap |
| No progress bars in V1 | Progress bar built in ImportStrip | ⚠️ V2 item built early |
| No natural language search in V1 | BomSearchPage is routed and accessible | ⚠️ V2 item built early |
