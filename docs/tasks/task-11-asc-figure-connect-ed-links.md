# Task 11 — ASC figure links (ConnectED part listing)

**Status:** Done  
**Related feedback:** Matt, item 11

---

## Problem

In the matching results table, the **Our Part** column showed figure numbers (e.g. `Fig. FP7450`) as plain text. Matt asked for **ConnectED URL links for all ASC parts** so users can open the part listing. Imported/competitor text in **Original part** should stay plain — only ASC-side figure numbers are navigational.

Matt's feedback: *"We need ConnectED URL links for all ASC parts so the user can open up the part listing."*

---

## What was changed

| File | Change |
|------|--------|
| `src/bom/components/BomAscFigureLink.tsx` | New local component — opens ASC products browser with figure pre-filled in search |
| `src/bom/bomMatchingColumns.tsx` | **Our Part** column: `Fig. {figure}` is now a clickable link |
| `src/bom/pages/BomMatchingPage.tsx` | Passes `bomProjectId` to columns and detail drawer |
| `src/bom/components/BomMatchDetailDrawer.tsx` | **Figure** label is a link when `bomProjectId` is available |

---

## Rule

| Column / field | Link? |
|--------------|-------|
| **Original part** (imported text) | No — reference only |
| **Fig. / Figure** (ASC side) | Yes — opens `/bom/projects/:id/asc-products` with catalog search |
| SKU, description | No — plain text |

Same pattern as workspace **Figure** column (`bomWorkspaceColumns.tsx`).

---

## Test checklist

- [ ] [Matching table](http://localhost:5173/bom/projects/new/matching/table) → **Our Part** → click **Fig. FP7450** → opens ASC products page with figure in search
- [ ] Click figure link does **not** open the row detail drawer (stopPropagation)
- [ ] **Original part** column is still plain text (not a link)
- [ ] Click row → detail drawer → **Figure** link opens same ASC listing
- [ ] Workspace **Figure** column still works (unchanged)
