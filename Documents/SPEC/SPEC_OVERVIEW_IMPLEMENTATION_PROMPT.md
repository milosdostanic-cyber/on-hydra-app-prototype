# Implementation prompt — SPEC Overview (desktop)

**Date:** 2026-08-24
**Branch:** `spec`
**Target route:** `/spec` (global module route, like `/bom` and `/seisbrace`)
**Status:** Historical implementation prompt. Do not run as the V2 implementation plan.
**Scope:** desktop only, mock data only, no backend

> **V2 authority notice (2026-08-25):** `src/spec` has now been ported and the global-library route premise is under an explicit V2 IA checkpoint. Use [`SPEC_V2_USER_FLOW_AND_SCREEN_AUDIT.md`](./SPEC_V2_USER_FLOW_AND_SCREEN_AUDIT.md) and [`../plans/2026-08-25-spec-v2-userflow-implementation-plan.md`](../plans/2026-08-25-spec-v2-userflow-implementation-plan.md). Retain this document only for historical Overview-table requirements that do not conflict with the selected-Project V2 flow.

---

## How to use this file

Open a **new chat**, paste the block in [Copy-paste prompt](#copy-paste-prompt), and attach the skills listed there. Everything below that block is context the implementer reads from this file.

---

## Skills and rules to attach

### Attach explicitly

| Invoke | Path | Why |
|---|---|---|
| `@hydra-module-builder` | `.cursor/skills/hydra-module-builder/SKILL.md` | Studies real screens and workflows before planning; maps requirements to existing patterns; analyze → plan → implement |
| `@hydra-ui-tokens-and-components` | `Documentation/hydra-ai-pack/skills/hydra-ui-tokens-and-components` | Imports from `src/ui/antd.ts`; styling via `theme.useToken()` only |
| `@hydra-ux-audit` | `.cursor/skills/hydra-ux-audit/SKILL.md` | Mandatory quality gate before the task is closed |
| `@scope-guardrails` | `.cursor/rules/scope-guardrails.mdc` | Keeps the change inside the allowed file list |
| `@token-discipline` | `.cursor/rules/token-discipline.mdc` | Targeted reads, phased work |

### Always active (listed so the implementer knows what applies)

`@product-ux-rules` · `@ux-guardrails` · `@ux-system-reuse-guardrails` · `@hydra-ui-tokens` · `@hydra-ux-composition` · `AGENTS.md`

### Deliberately not attached

| Skill | Why skipped |
|---|---|
| `@figma-use`, `@hydra-design-to-code`, `@figma-frame-ds-cleanup` | No Figma URL or node-id in this request |
| `@ds-parity-auditor` | No design-system-wide token work; this is one screen |
| `@prd-ux-implementation-planner` | `@hydra-module-builder` already covers gap analysis and file-scoped planning for this module |

---

## Repository facts already established

Verified on branch `spec` on 2026-08-24. The implementer does **not** need to rediscover these.

### The SPEC module is not on this branch yet

| Fact | Detail |
|---|---|
| `src/spec/` on `spec` | **Does not exist** |
| `src/spec/` on `feature/spec-platform` | **63 files** — routes, layout, pages, components, hooks, seeds, mock store |
| Sidebar "Spec" item today | `src/shell/AppShellSidebar.tsx` line ~136 → `/projects/${pid}/sales-brace` (a stub) |
| `/spec` route in `src/App.tsx` | Not wired |

**All external dependencies of `src/spec/**` already exist on this branch** — verified: `src/bom/layout/BomPageHeader.tsx`, `src/context/actionTrailStore.ts`, `src/shell/PageBackButton.tsx`, `src/shell/projectSeed.ts`, `src/submittal/components/PackageCreateEditModal.tsx`, `src/theme/hydraAlias.ts`, `src/ui/ExportCard.tsx`, `src/ui/HydraTag.tsx`, `src/ui/antd.ts`. The port is therefore `src/spec/**` plus two wiring edits — nothing else.

### What already exists inside the module (reuse, do not rebuild)

| Asset | Path (on `feature/spec-platform`) | Note |
|---|---|---|
| Route tree for `/spec/*` | `src/spec/SpecRoutes.tsx` | Already nests every workflow destination under `SpecLayout` |
| Path builders | `src/spec/specNavigation.ts` | `specHomePath`, `specAnalyzePath`, `specReviewPath`, `specProcessingPath`, `specDocumentPrimaryPath`, … |
| Status labels + badge mapping | `src/spec/constants/specStatusVocabulary.ts` | `processingStateLabel`, `processingBadgeStatus`, `reviewStateLabel`; already enforces "never colour alone" |
| Document model | `src/spec/data/types.ts` → `SpecDocument` | See gap table below |
| Mock store + repositories | `src/spec/data/specMockStore.ts`, `src/spec/data/repositories/specRepositories.ts`, `src/spec/data/specDocumentsSeed.ts` | Extend the seed; do not invent a second store |
| Current overview screen | `src/spec/pages/SpecHomePage.tsx` | Card/row list with scope tabs, division facets and saved searches — **this is the file being rebuilt** |

### Table patterns to copy from

`src/bom/bomWorkspaceColumns.tsx`, `src/bom/pages/BomAscProductsPage.tsx`, `src/shell/content/ProductLinePartsPage.tsx`. `Table`, `TableColumnsType` and `TableProps` are exported from `src/ui/antd.ts`; search uses `AppSearchInput` with `INLINE_SEARCH_CONTROL_SIZE`.

### Page header pattern

`BomPageHeader` (`src/bom/layout/BomPageHeader.tsx`) with `title`, `description`, `actions` — already used by `SubmittalPackagesPage` and by the current `SpecHomePage`.

---

## Phase 0 — Port the module (do this first, in one commit)

1. `git checkout feature/spec-platform -- src/spec`
2. In `src/App.tsx`: import `SpecRoutes` and add `<Route path="/spec/*" element={<SpecRoutes />} />` next to `/bom/*` and `/seisbrace/*`.
3. In `src/shell/AppShellSidebar.tsx`: point the `spec` menu key at `/spec` instead of `/projects/${pid}/sales-brace`, and remove `'spec'` from the `projectScoped` check so it no longer requires a scoped project. Update `activeKeyFor` so `/spec` resolves to the `spec` key (the current regex maps `sales-brace` to `spec` — that mapping goes away).
4. Run `npx tsc --noEmit` and confirm the ported module compiles untouched before writing any new UI.

Do not modify the other SPEC pages during this phase. If the port surfaces type errors, fix them minimally and report them; do not refactor.

---

## Phase 1 — Rebuild the SPEC Overview screen

The requirement below is the product brief. Implement it against the ported module.

### Screen purpose

This is the main operational workspace for managing uploaded SPEC documents. It should not look like a marketing landing page or immediately force the user into an upload flow.

Users must be able to:

* See all existing SPEC documents.
* Understand which project each document belongs to.
* See its analysis and review status.
* Continue from the correct point in the workflow.
* Upload a new SPEC.
* Download an editable ASC master specification.

### Page content

At the top, include:

* Title: **SPEC**
* Short description of the module.
* Primary action: **Upload SPEC**
* Secondary action: **Download ASC Master Spec**
* Search and filters for project, system type and status.

Use **System Type** instead of "Discipline". Options are Fire Protection, Plumbing and HVAC.

The main content must be a clear desktop table with:

* SPEC document name
* Project
* System Type
* Selected ASC master and version
* Status
* Review progress
* Last updated
* Contextual primary action
* Secondary actions menu

Support the important workflow statuses:

* Processing
* Master Confirmation Required
* Ready for Review
* In Review
* Re-analysis Required
* Ready to Export
* Exported
* Failed

The primary row action must reflect the current status:

| Status | Primary action |
|---|---|
| Processing | View Progress |
| Master Confirmation Required | Confirm ASC Master |
| Ready for Review | Review Analysis |
| In Review | Continue Review |
| Re-analysis Required | Re-run Analysis |
| Ready to Export | Export |
| Exported | View Exports |
| Failed | Retry |

Clicking a document should return the user to the relevant workflow screen instead of always opening the same destination. Extend `specDocumentPrimaryPath` in `src/spec/specNavigation.ts` rather than hardcoding paths in the page.

### Main interactions

**Upload SPEC** should open a simple modal or drawer where the user selects or creates a project, adds a PDF or Word document and starts the mocked analysis process.

**Download ASC Master Spec** should let the user choose:

* Fire Protection — Division 21
* Plumbing — Division 22
* HVAC — Division 23

Show the master version and editable Word format. Downloading a master is a standalone journey and must not redirect into analysis.

### Required states

Include:

* Populated table
* Loading state
* Empty state
* Search or filter with no results
* General error state
* Document-level failure status

The empty state should offer both **Upload First SPEC** and **Download ASC Master Spec**.

Use accessible status badges, clear focus states, readable spacing and typography of at least 16px for standard content. Do not communicate status through colour alone.

Keep the interface clean, professional and easy to scan. Avoid unnecessary summary cards, decorative elements, excessive badges and unrelated functionality.

---

## Data model gaps — resolve these deliberately

`SpecDocument` does not currently carry the fields this screen needs. **Extend the existing type and seed; do not fork the model.**

| Screen column | Exists today? | Required approach |
|---|---|---|
| SPEC document name | Yes — `title`, `fileName` | Use as-is |
| Project | Yes — `projectId` + `projectTitleById` | Use as-is; library documents show `LIBRARY_SCOPE_LABEL` |
| System Type | **No** — only `divisionHint` / `divisions` (`21`/`22`/`23`) | Add `systemType: 'fire-protection' \| 'plumbing' \| 'hvac'` and a label map in `specStatusVocabulary.ts`. Keep it consistent with the division values already in the seed |
| Selected ASC master + version | **No** | Add optional `ascMaster?: { id: string; label: string; version: string }` |
| Status (8 workflow statuses) | **Partly** — `processingState` (6 values) and `reviewState` (4 values) | **Derive**, do not replace. Add a `specWorkflowStatus.ts` helper that maps `processingState` + `reviewState` + new flags to the 8 statuses. Replacing `processingState` would break Processing, Analyze, Review, Products, Submittals and Substitution pages |
| Review progress | **Partly** — `requirementCount`, `unresolvedRedFlagCount` | Add `reviewedRequirementCount` and render progress as reviewed/total with text, not colour alone |
| Last updated | Yes — `updatedAt` | Use as-is |

Two statuses have no existing source and need new optional flags: **Master Confirmation Required** (ASC master not yet confirmed) and **Re-analysis Required** (document changed after analysis). **Ready to Export** / **Exported** map to review completion plus an export record. Model these as narrowly as possible and note the choice in the summary.

---

## Guardrails

**Allowed files**

```
src/spec/**                          (ported in Phase 0; Overview work concentrated in pages/, data/, constants/)
src/App.tsx                          (add /spec/* route only)
src/shell/AppShellSidebar.tsx        (repoint the spec key only)
```

**Forbidden**

* Any other module — `src/bom/**`, `src/submittal/**`, `src/search/**`, `src/catalog/**`, `src/seisbrace/**`, `src/shell/**` beyond the sidebar edit
* `src/theme/**`, `src/ui/**` — no new shared components, no token changes, no new tokens
* Raw hex, `rgb()`, ad-hoc `px` for design intent, or inline font settings — use `theme.useToken()` and `figmaTypography`
* Replacing `SpecProcessingState` or `SpecReviewState`
* Backend calls, mobile-specific layouts, new icon libraries

**Assumptions to confirm in the summary**

* SPEC is a global module at `/spec`, not project-scoped
* System Type maps 1:1 to Divisions 21 / 22 / 23
* ASC master download is mocked (no real file)

---

## Verification before closing

Run in order and report results:

1. `npx tsc --noEmit` — zero errors
2. `ReadLints` on every edited file — zero new errors
3. `npm run build`
4. Manual pass on `/spec`:
   - Sidebar SPEC opens `/spec` with no project scoped
   - Search, project filter, System Type filter and status filter each narrow the table, and combine correctly
   - Every one of the 8 statuses renders with the correct label, badge and contextual primary action
   - Each primary action navigates to the matching workflow route
   - Upload SPEC opens the modal/drawer and starts mocked processing
   - Download ASC Master Spec offers all three divisions and does not navigate into analysis
   - Empty, no-results, loading, error and failed-document states all render
   - Status is legible without colour (label text present in every badge)
5. `@hydra-ux-audit` self-audit — fix P0 and P1 before closing

---

## Required output

A short summary covering:

1. What was ported in Phase 0 and whether it compiled unchanged
2. What was rebuilt in `SpecHomePage` and which existing patterns were reused
3. Every `SpecDocument` field added and why
4. How the 8 workflow statuses are derived from existing state
5. Assumptions made and anything left unmapped
6. Verification results (typecheck, lint, build, manual pass, UX audit)

---

## Copy-paste prompt

```
Implement the SPEC Overview screen from this file:
Documents/SPEC/SPEC_OVERVIEW_IMPLEMENTATION_PROMPT.md

@hydra-module-builder
@hydra-ui-tokens-and-components
@hydra-ux-audit
@scope-guardrails
@token-discipline

Do Phase 0 first (port src/spec from feature/spec-platform, wire the /spec route
and the sidebar, confirm it typechecks) and stop for a check-in before Phase 1.

Then rebuild src/spec/pages/SpecHomePage.tsx as the desktop table workspace
described in Phase 1.

Stay inside the allowed file list. Mock data only. Desktop only. No backend.
Run the verification section before closing and report the required output.
```
