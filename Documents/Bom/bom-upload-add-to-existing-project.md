# BOM Landing — "Upload a file" → choose destination (new or existing project)

> **Version:** 0.1 (proposal)
> **Scope:** `src/bom/pages/BomLandingPage.tsx` "Upload a file" card and the file-input handler that follows it.
> **References:** [`Documentation/hydra-ai-pack/rules/hydra-tokens-and-components.md`](../../Documentation/hydra-ai-pack/rules/hydra-tokens-and-components.md), [`Documentation/ux-heuristics-skill-mirror.md`](../../Documentation/ux-heuristics-skill-mirror.md), [`Documents/Bom/bom-complete-userflow.md`](./bom-complete-userflow.md)
> **Audience:** Engineer + designer pairing on the BOM module.

---

## 1. Problem

Today, on the BOM landing page (`/bom`), the **"Upload a file"** quick-action card is hard-wired to start a *new* BOM run. After the file passes validation it routes to `/bom/projects/new/field-mapping`, which always produces a brand-new BOM project.

This is wrong for a real-world case: a user often wants to **add a file** (extra sheet, change order, addendum, drawing schedule) into a **BOM project they already started**, not start a parallel one.

The only existing "add-to-existing" path is the **Upload file** button inside the workspace toolbar ([BomWorkspacePage.tsx:213-224](../../src/bom/pages/BomWorkspacePage.tsx)) — but that flow is destructive: it asks "Re-upload BOM file?" and warns it will *replace* the run after re-mapping. So:

- From the landing page, users cannot route a file into an existing project at all.
- From the workspace, users can re-upload, but only as a replacement, not as an additive import.

## 2. Goal

When a user clicks **Upload a file** on the BOM landing page, they should be able to choose, *before* mapping, whether the upload:

- **A.** creates a brand-new BOM project (existing behavior), or
- **B.** is added to an **existing** BOM project (in the active construction project), where the parsed lines are appended to that project's workspace rows.

The decision should be obvious, recoverable, and not block the user who just wants to start clean.

## 3. Out of scope

- Multi-file batch upload (still one file per pass).
- Changing parsing, field-mapping, or matching internals.
- Changing the workspace re-upload (replace) behavior — that flow stays as a separate "replace run" path. We may add a small label to it later for clarity (open question 7.3).
- Server-side merging logic. The demo only needs to merge into the in-memory `BomWorkspaceContext` rows.

---

## 4. Current code map (so we know exactly what changes)

| Concern | Location | Notes |
|---|---|---|
| Upload card on landing | [`BomLandingPage.tsx:336-353`](../../src/bom/pages/BomLandingPage.tsx) | Click → `triggerUpload()`. |
| Hidden file input | [`BomLandingPage.tsx:545-551`](../../src/bom/pages/BomLandingPage.tsx) | Standard `<input type="file">`. |
| File handler | [`BomLandingPage.tsx:266-284`](../../src/bom/pages/BomLandingPage.tsx) | Validates, then navigates to `/bom/projects/new/field-mapping` with `state.uploadFileName`. |
| New-project modal | [`BomCreateProjectModal.tsx`](../../src/bom/components/BomCreateProjectModal.tsx) | Already creates a `BomProject` via `addBomProject`. Reusable. |
| BOM project list (active construction project scope) | [`BomLandingPage.tsx:90-93`](../../src/bom/pages/BomLandingPage.tsx) | `projectBoms` is the source for "existing" choices. |
| Workspace state per BOM project | [`BomWorkspaceContext.tsx`](../../src/context/BomWorkspaceContext.tsx) | `setWorkspaceRows(bomProjectId, updater)` is what we'll use to **append** parsed rows when destination = existing. |
| Field-mapping page | [`BomFieldMappingPage.tsx`](../../src/bom/pages/BomFieldMappingPage.tsx) | Reads `:bomProjectId` from the URL. Today supports `'new'` and real ids. We need to make sure it carries the destination intent through to parsing review. |

---

## 5. Proposed UX

### 5.1 Entry point (no visible change to the card itself)

Keep the **"Upload a file"** card on the landing page exactly as it is. **One primary action** ("Upload a file") — do not add a competing button next to it (Nielsen #8 Aesthetic & minimalist; one clear primary CTA per context per Hydra UX guardrails).

### 5.2 New step: destination picker (modal)

After the user selects a file in the OS picker **and** the file passes validation (type + size, same checks as today), open a small modal **before** routing to field mapping. The modal asks: *Where should this file go?*

```
┌─ Upload destination ──────────────────────────────┐
│ File: addendum-2.xlsx · 240 KB                    │
│                                                   │
│  ◉ Create a new BOM project                       │
│      Start a fresh run from this file.            │
│                                                   │
│  ○ Add to an existing BOM project                 │
│      [ Select BOM project ▼ ]                     │
│      Lines will be appended after field mapping   │
│      and parsing review.                          │
│                                                   │
│                       [ Cancel ]  [ Continue → ]  │
└───────────────────────────────────────────────────┘
```

Rules:

- Default is **"Create a new BOM project"** (preserves today's primary path).
- The "existing project" radio is **disabled** when `projectBoms.length === 0`, with helper text: *"No BOM projects yet in this construction project."* (Nielsen #5 Error prevention.)
- The select is **required** before the primary CTA enables (Nielsen #5).
- The select shows the same projects as the landing table — `name`, `lastEdited`, status tag, and item count — so the user recognizes them rather than recalls ids (Nielsen #6 Recognition rather than recall).
- The select is searchable by name. Sorted by `lastEdited` desc, matching the landing default.
- Primary CTA is single: **"Continue → field mapping"**. Secondary: **"Cancel"** (returns to landing, clears file). No third button.
- Selected file name + size are shown so the user knows *what they are about to route* (Nielsen #1 Visibility of system status). If the user cancels, the hidden input is reset (already done by `e.target.value = ''`).

### 5.3 Routing after the picker

The primary CTA routes to field mapping with the destination intent in `location.state`:

| Choice | Route | `location.state` keys |
|---|---|---|
| Create new project | `/bom/projects/new/field-mapping` | `{ uploadFileName, uploadDestination: 'new' }` |
| Add to existing | `/bom/projects/:bomProjectId/field-mapping` | `{ uploadFileName, uploadDestination: 'append', appendTargetId: bomProjectId }` |

Field mapping itself stays the same screen and same logic. Only the **commit** step at the end of parsing review needs to know whether to *create + populate* (today) or *append* to an existing workspace.

### 5.4 Commit step (end of parsing review)

When the user confirms parsing review:

- **`uploadDestination === 'new'`** — current behavior. A new BOM project is created (or the `'new'` placeholder is materialized) and the parsed rows seed its workspace.
- **`uploadDestination === 'append'`** — call `setWorkspaceRows(appendTargetId, prev => renumberRows([...prev, ...newRows]))` and navigate to `/bom/projects/:appendTargetId/workspace`. Toast: **"N item{s} added to {Project name}."** (Nielsen #1 Visibility of system status, plain language per Krug law 3 "Get rid of half the words").
- New rows enter with `status: 'needs-review'` + `confidence: 'medium'` by default — same convention used today when ASC products are added in [`BomWorkspacePage.tsx:160-181`](../../src/bom/pages/BomWorkspacePage.tsx) — so the user knows what they need to verify (Nielsen #5 Error prevention).

### 5.5 Visibility on the workspace after append

Surface a one-time, dismissible info banner above the workspace table:

> **Added from `addendum-2.xlsx`: 12 items.** They are tagged *Needs Review*. [Filter to new lines]

The "Filter to new lines" link sets `statusFilter = 'needs-review'`. This is a Krug Trunk-Test moment: the user just landed back in the workspace and needs to instantly know *what changed* and *what to do next*. (Nielsen #9 Recognize, diagnose, recover — applied to a non-error case for orientation.)

Banner persists until dismissed or until the user navigates away from the workspace. No persistence to storage in this demo.

### 5.6 Empty-state copy parity

In the workspace empty state ([`BomLandingPage.tsx:382-413`](../../src/bom/pages/BomLandingPage.tsx) and [`BomWorkspacePage.tsx:596-704`](../../src/bom/pages/BomWorkspacePage.tsx)), the **"Upload a file"** button should reuse the **same destination picker** for consistency (Nielsen #4 Consistency and standards). It does *not* need a destination picker when invoked from inside a specific BOM project that has zero rows — in that case the destination is implicit (append to *this* project), and we should skip the modal and go straight to field mapping with `uploadDestination: 'append'` and the current `bomProjectId`.

---

## 6. UX heuristic checklist (Nielsen + Krug)

| # | Heuristic | How this design honors it |
|---|---|---|
| K1 | Don't make me think | The picker has only two choices, both labeled in plain language. No "Calculate route to destination" — just "Create new" / "Add to existing". |
| K3 | Get rid of half the words | Modal copy capped: one short sentence per option, no welcome-talk, no "please". |
| N1 | Visibility of system status | File name + size shown in modal; toast confirms append count and project; banner shows what changed in workspace. |
| N2 | Match real world | "BOM project" everywhere — same noun used in the landing table and breadcrumbs. No "workspace target" or other jargon. |
| N3 | User control & freedom | Cancel returns to landing and clears the file; the file input resets. No "Are you sure?" loop. The append is non-destructive on the existing workspace (rows are added, not replaced) — user can delete added rows from the workspace table the same way they delete any row today ([`BomWorkspacePage.tsx:263-309`](../../src/bom/pages/BomWorkspacePage.tsx)). |
| N4 | Consistency | Same modal pattern is reused from the landing card and from the empty-state buttons. Routing convention matches today's `/bom/projects/:id/field-mapping`. |
| N5 | Error prevention | The "existing" radio is disabled when there are no BOM projects. The CTA is disabled until a destination is picked. The same file-type and file-size validation runs *before* the modal opens. |
| N6 | Recognition over recall | Project rows in the select show name, last-edited, status, and item count — same columns as the landing table. |
| N7 | Flexibility & efficiency | Power users can skip the modal: keep the existing **"Upload BOM file"** button inside the workspace toolbar — it goes straight to field mapping with `uploadDestination: 'append'` and the current id (no modal). The modal is only the *landing* path because that's where ambiguity exists. |
| N8 | Aesthetic & minimalist | One primary CTA in the modal. No competing actions on the upload card. |
| N9 | Recognize, diagnose, recover | If parsing review yields zero rows for an "append" run, the user is offered "Adjust column mapping" or "Cancel and keep workspace as-is" — the existing workspace must not be touched on cancel. |
| N10 | Help & docs | Inline helper text under each radio is enough for this scope; no separate docs page. |

### 6.1 Severity of issues this fixes

- **Today**: cannot add a file to an existing BOM run from the landing page — **severity 3 (major)**: forces the user to either re-create work in a duplicate project or use the destructive workspace re-upload path. After this change: 0.

---

## 7. Edge cases & open questions

### 7.1 Edge cases

| Case | Handling |
|---|---|
| No active construction project (`project == null`) | The landing page already shows the "Select a construction project" alert ([`BomLandingPage.tsx:316-322`](../../src/bom/pages/BomLandingPage.tsx)). Upload card stays clickable, but **the modal's "Add to existing" radio is disabled** because `projectBoms` is empty by definition. Helper text: *"Pick a construction project in the top bar first."* |
| `projectBoms.length === 0` | "Add to existing" disabled with helper text. CTA goes through the new-project path. |
| `projectBoms.length === 1` | Still show the radio + select (consistency). Pre-select the only project to save a click. |
| User cancels mid-modal | Reset hidden file input, no navigation. |
| Append target project gets deleted between picker and field-mapping commit | At commit, if `bomProjectById(appendTargetId)` is `undefined`, fall back to creating a new project and surface a warning toast: *"That BOM project was removed. Created a new project from your file."* |
| File fails type/size validation | Same as today — `message.error` and the modal does not open. |
| Field mapping page is opened directly via URL (deep link) | Treat missing `location.state.uploadDestination` as `'new'` when `:bomProjectId === 'new'`, and `'append'` otherwise. This keeps deep links working. |
| Workspace re-upload (existing) | Unchanged: still **replace**, still confirms with `Modal.confirm`. We may rename its CTA to "Replace BOM run" later (see 7.3). |

### 7.2 Hydra tokens & components — compliance notes

Per [`hydra-tokens-and-components.md`](../../Documentation/hydra-ai-pack/rules/hydra-tokens-and-components.md):

- **Modal**: use existing antd `Modal` from `src/ui/antd.ts`. Do **not** create a new shared modal component. Local screen-level composition only.
- **Radio + Select**: use `Radio.Group` and `Select` from `src/ui/antd.ts`. The select options renderer can be local to the modal file.
- **Spacing / radius / colors**: `theme.useToken()` (`token.marginMD`, `token.paddingMD`, `token.borderRadiusLG`, `token.colorPrimary`, `token.colorTextSecondary`, `token.colorBorderSecondary`) and `shellLayout` from `src/theme/hydraAlias`. **No inline hex, no `rgb`, no arbitrary px** for design intent.
- **Typography**: `Typography.Title`, `Typography.Text`, `Typography.Paragraph` only. No ad-hoc `fontSize` / `fontWeight` / `lineHeight` overrides for design intent. `figmaTypography` helpers are available if a role-based metric is needed (matching the rest of the BOM pages).
- **Icons**: keep `UploadOutlined` for the entry card and reuse — do not introduce a new icon set.
- **Banner on workspace**: use existing `Alert` (type `info`, `showIcon`, `closable`). Same component pattern as the existing `actionError` alert in [`BomWorkspacePage.tsx:738-762`](../../src/bom/pages/BomWorkspacePage.tsx).
- **Toasts**: existing `message.success` / `message.error` API.
- **No new design tokens, no shared-component changes.** This is screen-level composition only.

### 7.3 Open questions

1. **Single source of truth for project metadata after append.** `mockBomProjects[…].items` is a static count from mock data. Should we increment it on append, or compute `items` from workspace rows? Today the workspace and the landing table can disagree after edits; this change makes that drift more visible. Recommend computing `items` from rows.
2. **Renumbering on append.** Today `renumberRows` is used inside the workspace ([`BomWorkspacePage.tsx:79`](../../src/bom/pages/BomWorkspacePage.tsx)). On append we should call it once over `[...prev, ...newRows]` so row numbers stay sequential.
3. **Workspace re-upload labelling.** Should the in-workspace "Upload file" button be relabelled to **"Replace BOM run"** to disambiguate it from the additive landing path? Low-risk, copy-only change. Out of scope for the first PR but flagged for the next pass.
4. **Multi-file follow-up.** Once this lands, the same modal is the natural place to offer multi-file batch upload (loop the same flow per file).

---

## 8. Acceptance criteria

- [ ] Clicking **Upload a file** on `/bom` opens the OS file picker (no change).
- [ ] On a valid file selection, the **destination modal** opens.
- [ ] The modal defaults to **Create a new BOM project**.
- [ ] When `projectBoms.length === 0`, the **Add to existing** radio is disabled with helper text.
- [ ] When `projectBoms.length >= 1`, selecting **Add to existing** reveals a searchable project select (sorted by last-edited desc, showing name + last edited + status + item count).
- [ ] The primary CTA is disabled until a destination is fully chosen.
- [ ] **Cancel** closes the modal, resets the hidden file input, and stays on `/bom`.
- [ ] **Continue → field mapping** navigates to `/bom/projects/<id-or-'new'>/field-mapping` with `location.state.uploadDestination` and (when applicable) `appendTargetId` populated.
- [ ] At parsing-review commit:
  - `'new'` flow behaves exactly as today.
  - `'append'` flow merges parsed rows via `setWorkspaceRows(appendTargetId, …)` with `status: 'needs-review'`, `confidence: 'medium'` defaults and re-numbered rows; navigates to that project's workspace.
- [ ] Workspace shows a dismissible info banner *"Added from `<filename>`: N items."* with a one-click filter to **Needs Review**.
- [ ] If `appendTargetId` no longer exists at commit time, the flow falls back to creating a new project and shows a warning toast.
- [ ] No new design tokens or shared components are introduced.
- [ ] All styling uses `theme.useToken()` / `shellLayout` / `figmaTypography`. No inline hex, no arbitrary px for spacing/radius/type, no ad-hoc font tuning.
- [ ] Workspace re-upload path (inside `BomWorkspacePage`) is **unchanged** in this PR.

---

## 9. Test plan

- Manual: Upload from landing → "new" → field mapping → parsing review → workspace. Confirm new project exists.
- Manual: Upload from landing → "append" to a BOM with N rows → confirm workspace now has `N + parsed.length` rows, all renumbered, all with `Needs Review` tag, banner visible.
- Manual: Upload with no construction project selected → "Add to existing" disabled.
- Manual: Upload with construction project selected but zero BOMs → "Add to existing" disabled with helper.
- Manual: Cancel modal → file input is reset (re-clicking the card opens the OS picker fresh, not the modal).
- Manual: Delete the target BOM project in another tab/before commit; complete the flow → fallback to new project + warning toast.
- Manual: Workspace re-upload still asks "Re-upload BOM file?" and replaces the run (regression check).
- Visual: Modal renders with antd tokens; spot-check no inline hex / arbitrary px in the diff.
