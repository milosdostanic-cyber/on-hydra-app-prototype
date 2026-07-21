# Plan: BOM Figma V3 → repo (visible diffs only)

## Meta

- **Date:** 2026-06-08 (revised same day)
- **Request type:** `figma-delta` — sync **only** what differs between Figma and repo
- **User intent:** Figma → repo visual/IA alignment for linked nodes. **No** new behavior, **no** PRD-driven refactors, **no** code until user picks a diff item.
- **Status:** **implemented** — audited diffs A1–A9, B1–B10 (2026-06-08)
- **Plan file:** `Documents/Bom/2026-06-08-bom-figma-v3-sync-plan.md`
- **Figma file:** [BOM-SPEC — ASC-Connected v2](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM-SPEC---ASC-Connected-v2) (`Ht3Up5MlRAKjK7eCuAy05L`)
- **Linked nodes:**
  - `5022:23065` — section **BOM Flow V3 Milos**
  - `5054:22784` — frame (field mapping screen; **not** empty shell)

### Figma Console (this run)

- `figma_get_status` probe: **connected** (WebSocket Bridge, file open on page **🚧 BOM Re-Skin**)
- Deep fetch + screenshots: `5022:23179`, `5054:22784`
- Section child list: `5022:23065` (frame names only)

---

## Scope (strict)

**In**

- Document **visible** Figma vs repo differences for linked nodes
- Per-diff: repo file, change type (copy / layout / columns / chrome), user approval gate
- Implementation prompts **one approved diff at a time**

**Out**

- Full section rebuild in one pass
- PRD behavior changes not shown in Figma (e.g. “Choose not Refine”) unless same screen diff
- New routes, data models, matching logic, backend
- `src/shell/*`, `src/theme/*`, shared `ui/antd` barrel
- Content File Manager
- Implementing anything user did not explicitly approve

---

## Orchestration

### Used for this plan

| Name | Path | Why |
|------|------|-----|
| plan-orchestrator | `.cursor/rules/plan-orchestrator.mdc` | Plan-only run |
| figma-console-mcp | `.cursor/skills/figma-console-mcp/SKILL.md` | Read Figma (Console only) |
| prd-ux-implementation-planner | `.cursor/skills/prd-ux-implementation-planner/SKILL.md` | Diff audit structure |
| hydra-design-to-code | `.cursor/rules/hydra-design-to-code.mdc` | Map regions → existing repo components |

### Implicit during future sync (not PRD planning)

| Invoke | Path |
|--------|------|
| @scope-guardrails | `.cursor/rules/scope-guardrails.mdc` |
| @token-discipline | `.cursor/rules/token-discipline.mdc` |
| @ux-guardrails | `.cursor/rules/ux-guardrails.mdc` |
| @hydra-ui-tokens | `.cursor/rules/hydra-ui-tokens.mdc` |

### Not used

| Name | Why |
|------|-----|
| bom-prd / AGENTS.md (as driver) | User asked diff-only, not PRD feature work |
| @ds-parity-auditor | Not a DS audit |
| Official Figma MCP | Project policy |
| Multi-phase “implement all screens” | Replaced by per-diff approval |

---

## Section inventory (`5022:23065`)

Frames in section (names from Figma). **Diff status:** audited = compared to repo this run; pending = need frame-level pass before any code.

| Figma frame | Node (primary) | Repo target | Diff status |
|-------------|----------------|-------------|-------------|
| 01 - Landing / Project List | `5022:23179` | `BomLandingPage.tsx` | **audited** |
| 02 - Field Mapping | *(not in section list; see `5054:22784`)* | `BomFieldMappingPage.tsx` | **audited** via `5054:22784` |
| 03 - Parsing Review (×4 variants) | `5022:23894`, `24023`, `24115`, `5039:100223` | `BomParsingReviewPage.tsx` | pending |
| 04 - Matching / Default | `5022:23066` | `BomMatchingPage.tsx` | pending |
| 05 - Matching / Bulk Selection | `5022:23273` | `BomMatchingPage.tsx` | pending |
| 06 - Delete Confirmation | `5022:23382` | modal (local) | pending |
| 07 - Workspace / Main | `4986:22020` | `BomWorkspacePage.tsx` | pending |
| 11 - Recommendation / Replacement Picker | `5026:90934` | `BomNarrowPage` / `BomRecommendPage` | pending |
| 12 - Matching Results | `5026:21396`, `5026:21993` | `BomMatchingPage.tsx` | pending |
| 13 - Export / Routes & Preview | `5022:23736` | `BomExportPage.tsx` | pending |
| `5054:22784` (unnamed) | `5054:22784` | `BomFieldMappingPage.tsx` | **audited** |

Duplicate older frames (`4859:171*`) in section — treat **5022:** IDs as V3 source unless user says otherwise.

---

## Shared chrome (both audited frames)

| Element | Figma | Repo | Diff? |
|---------|-------|------|-------|
| Top bar module title | “BOM” + “Build or Convert a Bill of Materials” | `AppTopBar.tsx` — same subtitle | **match** (shell) |
| Construction project picker | “Riverside Office Park” in top bar | `ActiveProjectContext` + top bar | **likely match** — verify visually only |
| Sidebar | ASC ConnectED nav, BOM active | `AppShell` sidebar | **out of scope** — do not edit shell |
| Breadcrumb strip | “BOM / …” per screen | `buildAppBreadcrumbItems.tsx` | **diff** — see per screen |

**Rule:** Shell chrome diffs → **document only** unless user explicitly approves shell edit (forbidden by default).

---

## Audited diffs

### A — Landing `5022:23179` → `BomLandingPage.tsx`

**Semantic warning (not auto-fix):** Figma lists **construction projects** (Address, City, State, …). Repo lists **BOM projects** scoped to active construction project + upload/search entry cards. This is IA/data model shift — **user must choose** before any landing code.

| # | Figma (visible) | Repo (current) | Change type | Approval |
|---|-----------------|----------------|-------------|----------|
| A1 | Single header: title **“Project List”**, description **“Select a construction project to open BOM for that job site.”** | Two blocks: **“Get started”** (+ upload/search cards) and **“Your BOM projects”** | layout + copy | required |
| A2 | Primary CTA **“New Project”** (top right) | **“New BOM project”** | copy + CTA | required |
| A3 | Breadcrumb **“BOM / Project List”** | `/bom` → breadcrumb **“BOM”** only (`buildAppBreadcrumbItems`) | chrome | required — may need shell breadcrumb helper, user approval |
| A4 | **No** upload / search quick-action cards | Two large cards: Upload file, Search Catalogue | layout | required |
| A5 | Table columns: **Project name, Address, City, State, Zip, Project Date, Country, Notes**, Actions | **Project name, Last edited, Items, Status**, Actions | columns + data | required — blocked until A semantic decision |
| A6 | Row actions: **Edit, Copy, Delete** | **Edit, Delete** (no Copy) | actions | required |
| A7 | Search placeholder **“Search Items…”** above table only | Same placeholder in table toolbar + status/sort filters | layout | required |
| A8 | `PageBackButton` **not** in Figma frame | **“Back to projects”** shown | chrome | required |
| A9 | Row selection + bulk delete toolbar | Present in repo | — | repo extra — **do not remove** unless Figma frame added & user approves |

**Files if user approves subset:** `BomLandingPage.tsx`; breadcrumb may need `buildAppBreadcrumbItems.tsx` (shell — explicit approval).

---

### B — Field mapping `5054:22784` → `BomFieldMappingPage.tsx`

**Correction:** Frame is **field mapping** (upload flow step 1), not empty shell.

| # | Figma (visible) | Repo (current) | Change type | Approval |
|---|-----------------|----------------|-------------|----------|
| B1 | Breadcrumb **“BOM / New BOM Project”** | Field-mapping route not labeled in breadcrumbs; shows BOM project id/title | chrome | required |
| B2 | **3-step** progress: **1. Map Columns → 2. Review Parsed Rows → 3. Match parts** | No steps on this page | layout | required |
| B3 | Uploaded file chip **“BOM-ExLine2.xlsx”** in header area | File name only in `location.state` (not shown in header) | layout | required |
| B4 | Status badge **“11 of 13 fields mapped”** (inline, top) | Side card **“Mapping status”** `N / 11` | layout + count | required |
| B5 | **“Cancel upload”** (secondary) | **“Cancel”** | copy | required |
| B6 | **“Save mapping & continue”** (primary, top right) | Same label — **match** | — | — |
| B7 | **“Reset to Defaults”** link in table header row | **“Reset to defaults”** button in right column | layout | required |
| B8 | ASC fields include **SKU**, **UPC**; skip shown as **`--Skip--`** | Fields include **Quantity, Brand, Material, Order Flag**; skip **`— Skip —`**; no SKU/UPC | columns | required — confirm field list with user |
| B9 | Mapping table only (no side alerts in frame) | Warning/error/info **Alerts** above table | layout | required — keep alerts or hide per user |
| B10 | Title **“Field mapping”** + description with **“New BOM project.”** | Same title; description uses **dynamic `projectLabel`** | copy | minor — optional |

**Files if user approves subset:** `BomFieldMappingPage.tsx` only (default). Breadcrumb: shell file — explicit approval.

**Do not change without approval:** required-field validation logic, duplicate-column rules, navigation targets.

---

## Pending frames (no diffs claimed yet)

Do **not** implement parsing, matching, workspace, export, recommendation until:

1. `figma_get_component_for_development_deep` + screenshot for that frame
2. Side-by-side vs matching `src/bom/pages/*.tsx`
3. Diff rows added to this doc
4. User approves rows

---

## Implementation workflow (after user picks diffs)

### Baseline attach (one diff batch)

```
@figma-console-mcp
@hydra-design-to-code
@scope-guardrails
@token-discipline
@ux-guardrails
@hydra-ui-tokens
```

### Prompt template (example: A1 + A2 only)

```
Sync approved diffs from Documents/Bom/2026-06-08-bom-figma-v3-sync-plan.md

Approved: A1, A2 only.
Figma: 5022:23179
Allowed: src/bom/pages/BomLandingPage.tsx
Forbidden: everything else, shell, theme, behavior not in diff rows
```

### Acceptance (per batch)

- [ ] Only approved diff IDs touched
- [ ] Tokens only (no raw hex)
- [ ] `npm run build` passes
- [ ] No shell/theme edits unless listed in approved rows

---

## Implementation log (2026-06-08)

| Diff IDs | Files changed | Decision |
|----------|---------------|----------|
| A1–A9 | `BomLandingPage.tsx` | A5: Figma construction **Project List** table (Figma mock rows) |
| A3, B1 | `buildAppBreadcrumbItems.tsx` | Breadcrumb segments per Figma |
| B1–B10 | `BomFieldMappingPage.tsx` | B8: 13 fields incl. SKU/UPC + QTY/Brand/Material/Unit; skip `--Skip--` |

`npm run build` — pass.

## Open decisions (user)

1. **Next frame:** Which pending section frame to audit next (03 parsing, 04 matching, …)?

---

## Risks

| Risk | Mitigation |
|------|------------|
| Treating PRD as scope | This plan is Figma-diff-only |
| Landing semantic swap breaks flow | Block A5 until decision #1 |
| Shell edits for breadcrumbs | Document as B1/A3; separate explicit approval |
| Section scope creep | Pending table + one batch at a time |

---

## Removed from prior plan

- Multi-phase “implement all BOM screens”
- PRD-driven copy audit (“Choose not Refine”) as default work
- Claim that `5054:22784` is empty shell
- Implementation phases 1–5 without per-diff approval
