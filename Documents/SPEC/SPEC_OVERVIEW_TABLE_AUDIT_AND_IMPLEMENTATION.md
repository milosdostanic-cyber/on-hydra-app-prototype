# SPEC Overview table — audit and implementation

**Date:** 2026-08-24  
**Status:** Audit + implementation spec. No code in this pass.  
**Route:** `/spec` (`src/spec/pages/SpecHomePage.tsx`)  
**BOM reference:** `/bom/site/1` (`src/bom/pages/BomSiteProjectsPage.tsx`)  
**FigJam:** [SPEC - Kickoff V2](https://www.figma.com/board/OvxMEc7zwbtW7q2Vx0EVeW/SPEC---Kickoff-V2?node-id=2035-1468) (`OvxMEc7zwbtW7q2Vx0EVeW`, node `2035:1468`)  
**PRD / prior brief:** `Documents/SPEC/SPEC_OVERVIEW_IMPLEMENTATION_PROMPT.md`

Use this file as the implementation contract for the next chat. Orchestrated plan (phases, `@` blocks): `Documents/plans/2026-08-24-spec-overview-table-parity-plan.md`.

---

## 1. Verdict

The SPEC Overview table is **product-correct** (columns, eight statuses, contextual primary action, filters, states) and **visually wrong** relative to the BOM site table.

| Area | Verdict |
|---|---|
| Columns vs PRD | Pass |
| Status set vs PRD | Pass (labels + `Badge` status + text) |
| Page actions vs PRD + FigJam | Pass (Upload SPEC, Download ASC Master Spec) |
| Row actions vs PRD + FigJam | Partial — primary is a filled `Button`; BOM site uses **link** cells. Overflow is a raw `Dropdown`, not `BomTableRowActions`. |
| Cell / header composition vs BOM | Fail — SPEC invents two-line stacks, `fontSizeLG` on header and body, `size="middle"`, built-in Table pagination |
| Padding / tokens vs BOM | Fail — see §4 |
| Single-line scanability | Fail — three columns wrap to two rows |

**Decision for implementation:** Treat `/bom/site/1` as the **table chrome and cell language**. Keep SPEC **column set and workflow actions**. Do not copy BOM row selection or Bulk Delete.

BOM does **not** export reusable Table cell/header components. “Same components” means the **same Ant Design composition**:

| Role | BOM site (`BomSiteProjectsPage`) | SPEC should use |
|---|---|---|
| Table | `Table` from `src/ui/antd` | Same |
| Header cell | `styles.header.cell`: `colorFillAlter`, `colorBorderSecondary`, `fontWeightStrong` — **no `fontSize` override** | Same tokens, same omission |
| Body cell | `styles.body.cell`: `colorBorderSecondary`, `paddingBlock: token.paddingSM` — **no `fontSize` override** | Same |
| Name / document cell | `Button type="link"` + `padding: 0`, `height: 'auto'` | Same for document title |
| Status cell | `BomProjectStatusTag` → antd `Badge status` + text (`BomTags.tsx`) | Same **Badge pattern** via existing `specWorkflowBadgeStatus` + `specWorkflowStatusLabel` (do **not** import BOM status tags) |
| Row actions | `Button type="link"` (and `danger` for delete) | Contextual **link** for primary; overflow via existing `BomTableRowActions` **or** the same `Button type="link"` + `MoreOutlined` text button as today, restyled to match BOM density |
| Shell | `Card` `styles.body.padding: 0`, radius `borderRadiusLG`, `boxShadowTertiary` | Already close; keep |
| Toolbar | `paddingInline: paddingMD`, `paddingBlock: padding` | Match BOM (`padding` not `paddingSM`) |
| Pagination | Sibling `Pagination`, `pageSize: shellLayout.tablePageSizeDefault` (20) | Match BOM; drop Table `pagination` |
| Table `size` | Unset (antd default `large`) | Unset — remove `size="middle"` |

Do **not** edit `src/bom/**`. Importing `BomPageHeader` (already) and optionally `BomTableRowActions` is allowed. Importing `BomProjectStatusTag` is **not** allowed (wrong vocabulary).

---

## 2. Why two-line cells fail

Current SPEC cells (`SpecHomePage.tsx`):

| Column | Current | Problem |
|---|---|---|
| SPEC document | Title (`Button link` + `fontWeightStrong`) **and** `fileName` as `Typography.Text type="secondary"` | Mixed weights + wrapped row; BOM name cell is **one** link |
| ASC master | Master label **and** version on a second line | Two type styles; version is metadata, not a second row |
| Review progress | `"N of M reviewed"` **and** `Progress` | Progress forces a second row; BOM never puts a chart in a list cell |
| Status | `Badge` + text | OK — keep |
| Last updated | Single `formatUpdated` | OK — keep |
| Primary action | `Button type="primary" size="small"` | Competes with page primary; BOM row actions are links |

**Single-line mapping (keep meaning):**

| Column | One-line content | Overflow / extra meaning |
|---|---|---|
| SPEC document | Document **title** as `Button type="link"` (ellipsis) | `fileName` in `title` / Tooltip only |
| Project | Project name or library label | Unchanged |
| System Type | System type label | Unchanged |
| ASC master | `"{label} {version}"` with ellipsis, or `"Not selected"` as `type="secondary"` | Tooltip = full label + version |
| Status | `Badge` + full workflow label (never colour alone) | Unchanged |
| Review progress | `"12 / 18"` (or `"—"` when total is 0) | Tooltip: `"12 of 18 reviewed (67%)"` — **no Progress bar in the cell** |
| Last updated | Same date string | Unchanged |
| Actions | One **link** = contextual primary; `⋮` = secondary | See §5 |

Long workflow labels (`Master Confirmation Required`, `Re-analysis Required`) stay **one line** with column width + ellipsis + Tooltip. Do not wrap the badge onto two lines.

---

## 3. Status component (existing in this repo)

Do **not** invent a new tag. Do **not** use colour-only dots.

**Golden status in tables**

| Pattern | File | Use on SPEC Overview? |
|---|---|---|
| `Badge status` + text | `src/bom/components/BomTags.tsx` (`BomStatusBadge` / `BomProjectStatusTag`) | **Yes — same Ant Design `Badge`**, SPEC labels |
| `HydraTag` tones | `src/ui/HydraTag.tsx`, `SpecSeverityBadge`, `SpecConfidenceTag` | No — those are severity/confidence, not workflow list status |
| Raw `Tag` colour | — | No |

Already wired:

- `specWorkflowStatusLabel` / `specWorkflowBadgeStatus` in `src/spec/constants/specWorkflowStatus.ts`
- Render today: `<Badge status={specWorkflowBadgeStatus(status)} text={specWorkflowStatusLabel[status]} />`

Keep that. Optionally extract a local `SpecWorkflowStatusBadge` in `src/spec/components/` that only wraps `Badge` + those maps (no new colours).

| Workflow status | Badge `status` (existing map) | Label |
|---|---|---|
| Processing | `processing` | Processing |
| Master Confirmation Required | `warning` | Master Confirmation Required |
| Ready for Review | `default` | Ready for Review |
| In Review | `processing` | In Review |
| Re-analysis Required | `warning` | Re-analysis Required |
| Ready to Export | `default` | Ready to Export |
| Exported | `success` | Exported |
| Failed | `error` | Failed |

---

## 4. Token and padding comparison

Resolved Hydra/antd defaults used below: `fontSize` 14 (`hydraBaseNormal`), `fontSizeLG` 16 (`hydraLargeNormal`), `fontWeightStrong` 600. Spacing from antd alias (`sizeUnit` 4): `paddingSM` 12, `padding` 16, `paddingMD` 20, `paddingLG` 24.

| Surface | BOM `/bom/site/1` | SPEC `/spec` today | Match? | Implement |
|---|---|---|---|---|
| Table `size` | default (`large`) | `middle` | No | Remove `size` |
| Header background | `token.colorFillAlter` | `token.colorFillAlter` | Yes | Keep |
| Header border | `token.colorBorderSecondary` | `token.colorBorderSecondary` | Yes | Keep |
| Header weight | `token.fontWeightStrong` | `token.fontWeightStrong` | Yes | Keep |
| Header **font size** | theme default **14** | `token.fontSizeLG` **16** | **No** | **Delete `fontSize` on header cells** |
| Body border | `token.colorBorderSecondary` | `token.colorBorderSecondary` | Yes | Keep |
| Body **paddingBlock** | `token.paddingSM` (12) | `token.paddingSM` (12) | Yes | Keep |
| Body **font size** | theme default **14** | `token.fontSizeLG` **16** | **No** | **Delete `fontSize` on body cells** |
| Cell paddingInline | antd Table default | antd Table default | Yes | Do not add custom px |
| Toolbar paddingInline | `token.paddingMD` (20) | `token.paddingMD` (20) | Yes | Keep |
| Toolbar paddingBlock | `token.padding` (16) | `token.paddingSM` (12) | **No** | Use `token.padding` |
| Toolbar border | `lineWidth` / `lineType` / `colorBorderSecondary` | same | Yes | Keep |
| Card body padding | `0` | `0` | Yes | Keep |
| Card radius / shadow | `borderRadiusLG`, `boxShadowTertiary` | Card default | Partial | Apply the same `tableShellStyle` as BOM if missing |
| Pagination | External `Pagination`, page size **20** (`shellLayout.tablePageSizeDefault`) | Table `pagination` pageSize **10** | **No** | External bar, page size 20, `showSizeChanger={false}` |
| Filter controls | `size` unset / middle `AppSearchInput` | `size="middle"` | Close | Match BOM: search `middle`, selects default |
| Row primary control | `Button type="link"` | `Button type="primary" size="small"` | **No** | Link, `padding: 0`, `height: 'auto'` |
| Typography in cells | `hydraBaseNormal` via theme (14/22/400) | mix of strong title + secondary filename + LG | **No** | One style: default Table / `Typography.Text`; link for the name only |

**FigJam node `2035:1468`:** board is **flow**, not a table mock. Padding cannot be measured there. Table spacing follows **BOM site code**, not FigJam.

**Earlier Overview prompt** asked for “at least 16px standard content.” That **conflicts** with BOM tables (14px `Base/Normal`). **This audit wins:** table chrome matches BOM; page title stays `BomPageHeader` / Heading 3 (24). Do not set `fontSizeLG` on table cells.

---

## 5. Actions — PRD vs FigJam vs current

### 5.1 Page-level (Overview)

| Action | PRD (`SPEC_OVERVIEW_IMPLEMENTATION_PROMPT`) | FigJam Kickoff V2 | Current `/spec` | Ship |
|---|---|---|---|---|
| Upload SPEC | Primary | Upload PDF/Word spec | `Upload SPEC` modal | Keep; empty state **Upload First SPEC** |
| Download ASC Master Spec | Secondary; Div 21/22/23; Word; **do not** start analysis | Download editable Master Spec | `Download ASC Master Spec` modal | Keep |
| Search + filters | Project, System Type, Status | Not drawn (list is implied at entry) | Present | Keep |
| Bulk select / delete | Not in SPEC PRD | Not in FigJam for this list | Absent | **Do not** copy from BOM |

FigJam entry diamond (`What do you want to do?`) is exactly those two page actions.

### 5.2 Row primary (PRD — keep)

| Status | Primary label | Destination |
|---|---|---|
| Processing | View Progress | Processing |
| Master Confirmation Required | Confirm ASC Master | Confirm / analyze entry |
| Ready for Review | Review Analysis | Analyze / review |
| In Review | Continue Review | Review |
| Re-analysis Required | Re-run Analysis | Restart processing (mock) |
| Ready to Export | Export | Export / deliver-back |
| Exported | View Exports | Export |
| Failed | Retry | Restart processing (mock) |

Change **only the control:** `Button type="link"` like BOM **Edit**, not `type="primary"`.

Row click / title click: `specDocumentPrimaryPath` (already).

### 5.3 Row secondary (PRD + FigJam)

PRD: “Secondary actions menu.” Current: Open document, View project (if `projectId`).

| Action | Source | When | Placement |
|---|---|---|---|
| Open document | PRD | Always | Overflow (title already opens) |
| View project | PRD | `projectId` set | Overflow |
| Retry analysis | FigJam (`Retry or replace?` → Retry analysis) | Failed — **already primary** | Do not duplicate in overflow |
| Replace file / return to upload | FigJam | Failed | **Defer** unless upload-replace exists in mock (do not fake) |
| Export / Download Word with Track Changes | FigJam phase 4 | Ready to Export / Exported | Covered by primary **Export** / **View Exports** — do not add a second export control |
| Create BOM / submittal | FigJam (project-linked) | Export step, not Overview | **Not** on this table |
| Confirm master category | FigJam diamond after upload | Master Confirmation Required | Covered by primary |
| Re-run after edit | FigJam “Analysis is now out of date” | Re-analysis Required | Covered by primary |

**Overflow menu to ship now:** `Open document`, `View project` (if linked). Nothing else until those flows exist on Overview.

Optional later (not this phase): `Download original file` if a mock file URL exists.

### 5.4 Do not put on Overview rows

Edit-in-document, accept/deny suggestions, denial reason, create BOM, create submittal, Track Changes download picker — those belong to Analyze / Review / Export screens (FigJam phases 3–4).

---

## 6. Implementation spec

### Goal

One-line, BOM-parity table on `/spec` without changing workflow data or page modals.

### Allowed files

```
src/spec/pages/SpecHomePage.tsx
src/spec/components/SpecWorkflowStatusBadge.tsx   (optional extract)
```

Optional import only (no edits):

```
src/bom/layout/BomPageHeader.tsx          (already)
src/bom/components/BomTableRowActions.tsx (optional for ⋮)
src/theme/hydraAlias.ts                   (shellLayout.tablePageSizeDefault)
```

### Forbidden

- `src/bom/**` edits, `src/ui/**`, `src/theme/**`
- New tokens, hex, raw px, `fontSize` / `fontWeight` on table cells
- `HydraTag` as workflow status
- `Progress` in the review cell
- BOM row selection / bulk delete
- Changing the eight statuses or primary **labels** / destinations

### UI changes

1. Remove `size="middle"` and all `fontSize: token.fontSizeLG` Table style overrides.
2. Header / body `styles` = BOM site snippet (tokens only).
3. Toolbar `paddingBlock: token.padding`.
4. Flatten document, master, and review columns to one line (ellipsis + Tooltip).
5. Status: keep `Badge` + label (optional thin wrapper).
6. Primary row action: `type="link"`, stop propagation, same handlers.
7. Pagination: lift out of `Table` like BOM; `pageSize` from `shellLayout.tablePageSizeDefault`.
8. Card shell: match BOM `borderRadiusLG` + `boxShadowTertiary` if not already.

### Must not change

Upload / download modals, filters, empty/error/no-results copy, `deriveSpecWorkflowStatus`, seed data, other SPEC routes.

### Acceptance

- [ ] `/spec` table header and body type size match `/bom/site/1` (14px Base/Normal).
- [ ] Body `paddingBlock` is `token.paddingSM`; toolbar block padding is `token.padding`.
- [ ] No two-line cells; long text ellipsizes with Tooltip.
- [ ] Status is `Badge` + text for all eight states; colour never alone.
- [ ] Row primary is a link whose label still follows the PRD status map.
- [ ] Overflow: Open document + View project only.
- [ ] Page actions unchanged; no BOM bulk delete.
- [ ] Empty, no-results, loading, error still work.
- [ ] `npx tsc --noEmit`; `@hydra-ux-audit` on `SpecHomePage.tsx`.

---

## 7. Copy-paste prompt

```
Implement the SPEC Overview table parity pass from:
Documents/SPEC/SPEC_OVERVIEW_TABLE_AUDIT_AND_IMPLEMENTATION.md
and phases in:
Documents/plans/2026-08-24-spec-overview-table-parity-plan.md

@hydra-ux-audit
@hydra-ui-tokens-and-components
@scope-guardrails
@token-discipline
@product-ux-rules

Reference table: /bom/site/1 (src/bom/pages/BomSiteProjectsPage.tsx).
Do not edit src/bom/**, src/ui/**, or src/theme/**.
Flatten cells to one line; match BOM Table styles and padding tokens;
keep SPEC columns, statuses, and page/row action labels from the PRD.
```
