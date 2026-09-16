# Plan: CON-296 — Content download history surface and create actions

## Meta

| Field | Value |
|---|---|
| **Date** | 2026-09-15 |
| **Jira** | [CON-296 — Design Content download history surface and create actions](https://ooden.atlassian.net/browse/CON-296) (Story, In Progress, assigned to Miloš) |
| **Epic** | [CON-295 — Design Content download history UX](https://ooden.atlassian.net/browse/CON-295) |
| **Confluence** | [STORY page](https://ooden.atlassian.net/wiki/spaces/Hydra/pages/2268364801) · [PRD - Content Module Rework](https://ooden.atlassian.net/wiki/spaces/Hydra/pages/2254929949) · [DELIVERY](https://ooden.atlassian.net/wiki/spaces/Hydra/pages/2268332033) |
| **Branch** | `con-296-content-download-history` (cut from `origin/main`) |
| **Target repo** | `on-hydra-app-prototype` (this repo) — prototype only |
| **Production repo** | `ooden-tech/on-hydra-app` — **not touched by this plan** |
| **Status** | Draft — planning only, implementation not started |
| **Plan file** | `Documents/plans/2026-09-15-con-296-content-download-history-plan.md` |

### Why this repo, when the ticket says "design-only"

CON-296 forbids production code in `on-hydra-app`. It requires **"Figma (or equivalent)"** for the surface that replaces the cart tables, plus written answers to Q-1–Q-4.

This prototype is the "or equivalent". Building the surface here produces a clickable spec that covers every acceptance criterion better than a static frame, and the result feeds Figma through the existing `prototype-to-figma` / `figma-generate-design` path. **No change is proposed to `on-hydra-app` in any phase.**

## Orchestration for planning (this run)

### Explicit skills and rules used

| Name | Type | Path | Why selected |
|---|---|---|---|
| `@plan-orchestrator` | rule | `.cursor/rules/plan-orchestrator.mdc` | Planning-only run; write this file, do not implement |
| `@prd-ux-implementation-planner` | skill | `.cursor/skills/prd-ux-implementation-planner/SKILL.md` | Map PRD FRs to real routes, files, and gaps in this repo |
| Atlassian MCP | MCP | `user-Atlassian-MCP-Server` | Read CON-296 and the Content Module Rework PRD verbatim |
| Granola context | skill | `granola-context` | Confirmed the Sep 14 assignment ("content download history and create actions") |
| Repo exploration | subagent | `explore` | Verified every file path and exported symbol named below |

### Implicit rules (always active)

| Invoke | Path | Why relevant |
|---|---|---|
| `@token-discipline` | `.cursor/rules/token-discipline.mdc` | Targeted reads only; no full-repo scans |
| `@scope-guardrails` | `.cursor/rules/scope-guardrails.mdc` | Content module only; search / BOM / Submittal internals stay frozen except where a phase says otherwise |
| `@product-ux-rules` | `.cursor/rules/product-ux-rules.mdc` | One primary CTA; non-technical copy; blocking vs informational clarity |
| `@ux-system-reuse-guardrails` | `.cursor/rules/ux-system-reuse-guardrails.mdc` | Reuse existing patterns before inventing |
| `@hydra-ui-tokens` | `.cursor/rules/hydra-ui-tokens.mdc` | No raw hex / px for design intent |
| `@hydra-ux-composition` | `.cursor/rules/hydra-ux-composition.mdc` | Composing Card + Table + Flex into the surface |

### Not used (and why)

| Name | Why skipped |
|---|---|
| `@figma-repo-parity` | No theme, token, or brand-colour change in any phase |
| `@ds-parity-auditor` | No design-system sync in scope |
| `@hydra-work-planner` | Task was named explicitly; no prioritisation run needed |
| Figma Console MCP | Not requested; Official MCP is the default per `figma-mcp-routing.mdc` |

## Implementation invocation (use in a new chat after approval)

### Baseline — attach to every UI phase

```
@scope-guardrails
@token-discipline
@ux-system-reuse-guardrails
@hydra-ui-tokens
@product-ux-rules
```

### Closing gate — attach to the last phase

```
@hydra-ux-audit
```

---

## 1. Requirements this plan implements

From the PRD, verbatim scope per requirement:

| ID | Requirement | Covered by |
|---|---|---|
| **FR-7** | History is a two-level projection keyed on figure number. A parent row exists for **every** part in history, including parts that only ever had variant-level downloads, so a variant never appears top-level. Parents ordered most-recent-first, where parent recency is the latest occurrence across itself and its children. | Phase 1 |
| **FR-8** | Replace the download center with the history surface: expandable table, figure parents, variant children. Replaces the cart tables, the hierarchy-level table, the total-items footer, and "Download All Files". Each row shows **what it is, which formats were downloaded, when, and by whom**. | Phase 2 |
| **FR-9** | Empty state must state that download history **begins from the release date** — not a bare "no downloads yet". | Phase 2 |
| **FR-10** | Selection model carries a multi-row, **mixed-granularity** set (any mix of parent figure rows and child variant rows). Single vs multi-select and parent cascade are design-owned. | Phase 3 |
| **FR-11** | Create Submittal Package from selection, targeting a new or existing package. Submittal rows are **part-scoped**: a child variant contributes its parent part, and parent + child together produce **one** part entry. | Phase 4 |
| **FR-12** | Create BOM from selection. Child variants write directly as BOM items. Every parent figure row **lacking a concrete variant** routes through the shared variant-selection flow first. Nothing is written until every entry resolves or the user explicitly drops the unresolved ones. Targets a new or existing BOM. | Phase 4 + 5 |
| **FR-13** | Both create actions are **rendered and disabled** with a tooltip naming the missing access — never hidden. BOM CREATE for BOM, SUBMITTAL_MANAGER CREATE for Submittal. | Phase 4 |
| **FR-15** | Module name stays **Content**; route paths and legacy redirects unchanged. Only labels and copy change. | All phases (constraint) |
| **NFR-6** | Gated actions must be i18n-keyed, announced as disabled to assistive tech, and must **not** retain a live click handler when disabled. | Phase 4 |

Requirements explicitly **out of this plan**: FR-1 to FR-6 (backend ZIP pipeline, history entity, write path, origin discriminator) and FR-14 (cart data migration). Those are backend and have no prototype surface.

## 2. Current state in this repo

### Route and entry point — unchanged by this plan (FR-15)

```117:122:src/App.tsx
        <Route path="/projects/:projectId" element={<ProjectWorkspaceLayout />}>
          <Route index element={<Navigate to="content" replace />} />
          <Route path="seis-brace" element={<SeisBraceStubRedirect />} />
          <Route path="sales-brace" element={<SalesBraceLegacyRedirect />} />
          <Route path="submittal" element={<SubmittalPackagesPage />} />
          <Route path="content" element={<ContentModule />} />
```

`ContentModule` is re-exported from `src/shell/ProjectModuleStubs.tsx` and resolves to `DownloadCenterPage`.

### What `DownloadCenterPage.tsx` renders today

| Element | Today | After |
|---|---|---|
| Header | "Download Center", `N Individual Parts / Variations · 0 Groups` | Repositioned to history framing |
| Header action | **Clear all Items** | Removed (FR-8) |
| Table 1 | Flat queue rows from `useRevitDownloadQueue()` | Two-level history table |
| Table 2 | Category table, permanently empty (`categoryRows: CategoryRow[] = []`) | Removed (FR-8) |
| Footer | Total items + **Download All Files** (stub zip) | Removed (FR-8) |
| History | Flat `List` of the last 20 entries, secondary card | Becomes the primary surface |
| Empty | "Queue is empty. Add files from Part Search." | Release-date copy (FR-9) |

### What already exists and is reusable

| Need | Existing asset | Path |
|---|---|---|
| History records | `useDownloadHistory()` → `{ history, historyForProject }`, type `DownloadHistoryEntry` | `src/search/revitDownloadQueue.ts` |
| Table card chrome | `shellTableCardStyle(token)`, `shellTableStyles(token)` | `src/shell/shellTablePatterns.ts` |
| Page header | `BomPageHeader` (`title`, `description`, `actions`, `titleVariant`) | `src/bom/layout/BomPageHeader.tsx` |
| Back link | `PageBackButton` (`to`, `children`) | `src/shell/PageBackButton.tsx` |
| Flat row selection | `rowSelection={{ selectedRowKeys, onChange, preserveSelectedRowKeys: false }}` | `src/bom/pages/BomWorkspacePage.tsx:834` |
| Per-row checkbox disable | `getCheckboxProps: (row) => ({ disabled: ... })` | `src/seisbrace/components/BraceTable.tsx:189` |
| Disabled CTA + tooltip | Tooltip wrapping a `<span>` around a disabled Button | `src/search/components/ActionsPanel.tsx:45` |
| Submittal destination picker | `useSubmittalDestinationFields(projectId)` → `{ packages, mode, setMode, selectedId, setSelectedId, newName, setNewName, canSubmit, resolve }` | `src/shell/components/useSubmittalDestinationFields.ts` |
| BOM destination picker | `useBomDestinationFields(projectId)` → `{ boms, selectedId, setSelectedId, canSubmit, resolve, createBom }` | `src/shell/components/useBomDestinationFields.ts` |
| Submittal writes | `useSubmittalPackages()` → `createPackage`, `addPartToPackage`, … | `src/context/SubmittalPackagesContext.tsx` |
| BOM writes | `addBomProject(name, description?, constructionProjectId)`, `mockBomProjects` | `src/bom/data/mockData.ts` |
| Action trail | `useActionTrailModuleLifecycle('content')`, `ActionTrailNewTag`, `actionTrailTableRowProps` | `src/context/ActionTrailContext.tsx`, `src/search/` |
| Empty-state composition | `Empty` + `Space` + strong title + secondary text (+ optional CTA child) | `src/shell/CatalogResults.tsx:75` |

### Confirmed gaps

| Gap | Impact | Handled in |
|---|---|---|
| `DownloadHistoryEntry` has **no attribution field** (no `downloadedBy` / `owner`) | FR-8 "by whom" and Q-3 cannot render | Phase 1 |
| Entry carries a single `fileType`, not the **set of formats** delivered in one occurrence | FR-8 "which formats" | Phase 1 |
| **No nested-table-with-selection precedent.** `childrenColumnName` and `checkStrictly` appear nowhere in `src/` | Parent/child cascade must be built locally | Phase 3 |
| **No permission system** outside the Spec module's simulated `SpecAccessLevel` | FR-13 needs a gating source | Phase 4 |
| History is only written by `src/search/` flows; the Content catalog pages (`ProductCatalogContent`, `PartVariantsPage`, `PartVariantDetailPage`) use `message.info(...)` stubs | Populated state depends on seeded data | Phase 1 |
| No seeded history — a fresh session always shows empty | Demo cannot show the populated state | Phase 1 |

## 3. Design decisions — proposals for PO sign-off (AC-6)

These are the four questions CON-296 requires written answers for. Each proposal below is the one this plan implements; each needs Matt's confirmation before the story can close.

### Q-1 — Parent row display when only variant-level downloads exist

**Proposal:** always materialise the figure parent, and mark it as a container rather than a download.

The parent shows figure number, part name, thumbnail, a roll-up of every child format, the latest child timestamp, and roll-up attribution. Its Formats cell reads `Variants only` when the figure itself was never downloaded at figure level; otherwise it lists the figure-level formats (RFA, TXT). This satisfies FR-7 without pretending a download happened that did not.

### Q-2 — What selecting a parent means for BOM

**Proposal:** a checked parent means "this figure, variant to be decided".

- **Submittal:** the parent resolves to its part directly. No further input.
- **BOM:** the parent enters the **variant resolution queue** (Phase 5). Nothing is written until it resolves or is dropped.
- **Dedupe:** if a parent and one of its own children are both selected, the child wins and the pair produces one entry. For Submittal this is required by FR-11; for BOM it removes an unresolved item that the child already answers.
- **Cascade:** checking a parent checks its children (`checkStrictly: false`). A parent with children checked is therefore normally redundant; the dedupe rule above makes that safe.

### Q-3 — Attribution when several teammates downloaded the same figure

**Proposal:** show the most recent downloader, then the overflow count.

`Ana Petrović +2` — an `Avatar.Group` with a `Tooltip` listing every distinct downloader and their latest date. One name is enough to scan; the tooltip carries the full team picture without widening the column.

### Q-4 — Do repeats need a count

**Proposal:** yes, but quietly.

A repeat count appears as a subdued `Tag` (`×3`) next to the timestamp on any row with more than one occurrence, with a tooltip giving the first and latest dates. Rows downloaded once show nothing. This keeps the default view calm while making "we keep re-pulling this" visible.

## 4. Phases

Each phase is independently reviewable. Phases 1–4 deliver the acceptance criteria; Phase 5 completes AC-5; Phase 6 is flagged and needs separate approval; Phase 7 is the closing gate.

---

### Phase 1 — History data model, seed, and two-level projection

**Goal:** the data needed for FR-7 and FR-8 exists and groups correctly, before any UI changes.

| File | Change |
|---|---|
| `src/search/revitDownloadQueue.ts` | **Additive only.** Add optional `downloadedBy?: string` and `fileFormats?: string[]` to `DownloadHistoryEntry`. Do not rename `queuedAt`; do not change the queue API. Existing callers in `src/search/` keep compiling untouched. |
| `src/shell/content/downloadHistorySeed.ts` | **New.** Seeded history for the demo projects, built from `PRODUCT_CATALOG_CATEGORIES` in `src/catalog/productCatalogHierarchy.demo.ts` and contact names in `src/shell/projectSeed.ts`. Must include: a figure with figure-level + variant downloads, a figure with **variants only** (Q-1), a figure downloaded by **several people** (Q-3), and a figure with **repeats** (Q-4). |
| `src/shell/content/downloadHistoryRows.ts` | **New.** `buildDownloadHistoryRows(entries): HistoryFigureRow[]`. Groups by `partKey`, builds a parent for every part, nests children by `variationKey`, sorts parents by latest occurrence across self and children, sorts children most-recent-first, and rolls up formats, attribution, and occurrence counts. |

**Rules:** pure functions, no JSX, no antd imports in the projection module. The seed is dummy data only.

**Done when:** the projection is exercised from the page in Phase 2 and never yields a variant at top level, for any seeded project.

**Copy-paste prompt**

```
@scope-guardrails
@token-discipline

Implement Phase 1 of Documents/plans/2026-09-15-con-296-content-download-history-plan.md.

Only touch these files:
- src/search/revitDownloadQueue.ts (ADDITIVE ONLY: optional downloadedBy?: string and fileFormats?: string[] on DownloadHistoryEntry — do not rename queuedAt, do not change the queue API, do not break existing src/search callers)
- src/shell/content/downloadHistorySeed.ts (new)
- src/shell/content/downloadHistoryRows.ts (new)

Follow section "Phase 1" of the plan exactly, including the four seed scenarios (variants-only figure, multi-downloader figure, repeat downloads, mixed figure-level + variant-level).
Do not change any UI yet. Run `npx tsc --noEmit` when done.
```

---

### Phase 2 — Replace the cart tables with the history surface

**Goal:** FR-8 and FR-9. The page stops being a cart.

| File | Change |
|---|---|
| `src/shell/content/DownloadCenterPage.tsx` | Rewrite the body. |

**Remove:** the queue table, the always-empty category table, the total-items footer, the "Download All Files" button, "Clear all Items", the secondary history `List`, and the `useRevitDownloadQueue()` dependency on this page.

**Keep:** `PageBackButton`, `BomPageHeader`, the `Card` + `shellTableCardStyle` / `shellTableStyles` chrome, and the action-trail wiring (`useActionTrailModuleLifecycle('content')`, `ActionTrailNewTag`, `actionTrailTableRowProps`).

**Table:** one `Table` over `HistoryFigureRow[]`, `expandable` with `defaultExpandAllRows`, children nested via the projection.

| Column | Parent row | Child row |
|---|---|---|
| Part / figure | Thumbnail + part name + figure number | Indented variant name + SKU |
| Type | `Figure` tag | `Variation` tag |
| Formats | Roll-up tags, or `Variants only` (Q-1) | Format tags for that occurrence |
| Downloaded | Latest date + repeat `Tag` if > 1 (Q-4) | Date + repeat tag |
| By | `Avatar.Group` + name + `+N` with tooltip (Q-3) | Single name |

**Header copy:** title stays **Content Downloads** (FR-15 — module name unchanged); description becomes history framing, e.g. `N figures · M variations downloaded · <project>`.

**Empty state (FR-9):** `Empty` + `Space`, matching `src/shell/CatalogResults.tsx:75`. Copy must state the release-date boundary, e.g. *"No downloads yet. Download history starts from the release date — anything downloaded before then is not shown."* Secondary CTA links to Part Search.

**States to cover:** populated, empty, single-figure, figure with no variants, long part names (`ellipsis` with tooltip), narrow viewport.

**Copy-paste prompt**

```
@scope-guardrails
@token-discipline
@ux-system-reuse-guardrails
@hydra-ui-tokens
@product-ux-rules

Implement Phase 2 of Documents/plans/2026-09-15-con-296-content-download-history-plan.md.

Only touch src/shell/content/DownloadCenterPage.tsx.

Replace the cart tables with the two-level history table described in "Phase 2", using buildDownloadHistoryRows from Phase 1.
Remove: queue table, category table, total-items footer, Download All Files, Clear all Items, the secondary history List, and the useRevitDownloadQueue dependency on this page.
Keep: PageBackButton, BomPageHeader, shellTableCardStyle/shellTableStyles chrome, action-trail wiring.
Empty state copy MUST state that history starts from the release date (FR-9).
No raw hex or px for design intent — use theme.useToken() and hydraTypography only.
Run `npx tsc --noEmit` and ReadLints on the file.
```

---

### Phase 3 — Mixed-granularity selection model

**Goal:** FR-10 plus the AC-3 answer.

| File | Change |
|---|---|
| `src/shell/content/downloadHistorySelection.ts` | **New.** `resolveSelection(rows, selectedKeys): { partKeys: string[]; variants: {...}[]; unresolvedFigures: {...}[] }`. Implements the Q-2 dedupe: a selected child suppresses its parent; a selected parent with no selected child becomes an unresolved figure. |
| `src/shell/content/DownloadCenterPage.tsx` | Add `rowSelection` with `checkStrictly: false` (cascade), plus a selection summary strip above the table. |

**Selection strip:** appears only when the selection is non-empty. Shows `N figures, M variations selected`, a `Clear selection` text button, and the two create actions from Phase 4. Uses `token.colorFillAlter` and existing spacing tokens — no new values.

**Reuse note:** flat `rowSelection` exists at `src/bom/pages/BomWorkspacePage.tsx:834`. The cascade behaviour (`checkStrictly: false`) is new to this repo; it is antd-native and adds no custom component.

**Done when:** every combination is provably deduped — child only, parent only, parent + own child, parent + unrelated child, all rows.

**Copy-paste prompt**

```
@scope-guardrails
@token-discipline
@ux-system-reuse-guardrails
@hydra-ui-tokens

Implement Phase 3 of Documents/plans/2026-09-15-con-296-content-download-history-plan.md.

Files:
- src/shell/content/downloadHistorySelection.ts (new, pure functions)
- src/shell/content/DownloadCenterPage.tsx (add rowSelection with checkStrictly: false, plus the selection summary strip)

Implement the Q-2 dedupe exactly as written in the plan: a selected child suppresses its parent; a selected parent with no selected child becomes an unresolved figure.
Reuse the rowSelection shape from src/bom/pages/BomWorkspacePage.tsx:834. No new tokens, no new shared components.
Run `npx tsc --noEmit` and ReadLints.
```

---

### Phase 4 — Create actions and permission gating

**Goal:** FR-11, FR-13, NFR-6, and the non-BOM half of FR-12. Covers AC-4.

| File | Change |
|---|---|
| `src/shell/content/contentDownloadAccess.ts` | **New, prototype-only.** `useContentDownloadAccess()` → `{ canCreateBom, canCreateSubmittal }`. Local simulated access, following the Spec module's `SpecAccessLevel` precedent. Explicitly **not** a shared permission system. |
| `src/shell/content/CreateSubmittalFromHistoryModal.tsx` | **New.** Wraps `SubmittalDestinationFields` via `useSubmittalDestinationFields`. Lists the resolved parts, writes with `addPartToPackage`. |
| `src/shell/content/CreateBomFromHistoryModal.tsx` | **New.** Wraps `BomDestinationFields` via `useBomDestinationFields`. Writes resolved variants; hands unresolved figures to Phase 5. |
| `src/shell/content/DownloadCenterPage.tsx` | Wire both buttons into the selection strip. |

**CTA hierarchy (`@product-ux-rules`):** **Create Submittal Package** is `type="primary"`. **Create BOM** is default. Nothing else in the strip competes.

**Gating (FR-13 + NFR-6):**

- Buttons are always **rendered**. Never hidden.
- Without permission: `disabled`, wrapped in `Tooltip` naming the missing access — *"You need BOM create access to do this."*
- Follow `src/search/components/ActionsPanel.tsx:45` — `Tooltip` around a `<span>` around the disabled `Button`, so the tooltip still fires on a disabled control.
- Disabled buttons must carry `aria-disabled` and **must not** keep a live `onClick`.
- With permission but an empty selection: disabled with a different tooltip — *"Select at least one figure or variation."* This is an informational block, not a permission block, and the copy must make that obvious.

**Submittal write rule (FR-11):** child variants contribute their parent part; parent + child collapses to one part entry. Resolution comes from `resolveSelection`, not from the modal.

**States:** default, no selection, no permission, submitting, success (`message.success` + navigate offer), failure.

**Copy-paste prompt**

```
@scope-guardrails
@token-discipline
@ux-system-reuse-guardrails
@hydra-ui-tokens
@product-ux-rules

Implement Phase 4 of Documents/plans/2026-09-15-con-296-content-download-history-plan.md.

Files:
- src/shell/content/contentDownloadAccess.ts (new, prototype-only simulated access — NOT a shared permission system)
- src/shell/content/CreateSubmittalFromHistoryModal.tsx (new)
- src/shell/content/CreateBomFromHistoryModal.tsx (new)
- src/shell/content/DownloadCenterPage.tsx (wire the two buttons into the selection strip)

Reuse useSubmittalDestinationFields + SubmittalDestinationFields and useBomDestinationFields + BomDestinationFields as-is. Do NOT modify those shared files or the Submittal/BOM contexts.
Gating must follow FR-13 and NFR-6 exactly: rendered + disabled + tooltip naming the missing access, aria-disabled, no live click handler when disabled. Use the Tooltip>span>Button pattern from src/search/components/ActionsPanel.tsx:45.
Create Submittal Package is the primary CTA; Create BOM is default.
Run `npx tsc --noEmit` and ReadLints.
```

---

### Phase 5 — BOM variant resolution queue

**Goal:** the remainder of FR-12, and AC-5.

| File | Change |
|---|---|
| `src/shell/content/ResolveFigureVariantsDrawer.tsx` | **New.** Steps through every unresolved figure from `resolveSelection`, one at a time, so the user picks a concrete variant. |
| `src/shell/content/CreateBomFromHistoryModal.tsx` | Hand off to the drawer when `unresolvedFigures.length > 0`. |

**Behaviour (FR-12):**

- Progress is explicit — `Figure 2 of 5`.
- Each step lists that figure's variants from `PRODUCT_CATALOG_CATEGORIES`, with previously downloaded variants surfaced first and labelled.
- **Skip this figure** drops that entry and says so.
- The BOM is written **only** when every figure has resolved or been explicitly dropped. Abandoning the drawer writes nothing.
- A closing summary states what will be written and what was dropped, before the write.

**Pattern:** `Drawer` + `Steps` from `src/ui/antd.ts`. Reuse the variant-row presentation from `src/shell/content/PartVariantsPage.tsx` rather than inventing a new row.

**States:** one figure, many figures, all skipped (write blocked with an explanation), abandoned mid-way.

**Copy-paste prompt**

```
@scope-guardrails
@token-discipline
@ux-system-reuse-guardrails
@hydra-ui-tokens
@product-ux-rules

Implement Phase 5 of Documents/plans/2026-09-15-con-296-content-download-history-plan.md.

Files:
- src/shell/content/ResolveFigureVariantsDrawer.tsx (new)
- src/shell/content/CreateBomFromHistoryModal.tsx (hand off when unresolvedFigures is non-empty)

Follow FR-12 exactly: nothing is written to the BOM until every selected figure has resolved to a concrete variant or been explicitly dropped. Abandoning the drawer writes nothing.
Reuse the variant row presentation from src/shell/content/PartVariantsPage.tsx. Use Drawer + Steps from src/ui/antd.ts.
Run `npx tsc --noEmit` and ReadLints.
```

---

### Phase 6 — Retire the staging cart (FLAGGED — needs separate approval)

**Do not start this phase with the others.** It crosses module boundaries and `@scope-guardrails` requires asking first.

The PRD removes the cart end to end (FR-2) and makes every download direct (FR-3). In this repo the cart lives in the **search** module, not Content:

- `src/search/revitDownloadQueue.ts` — `useRevitDownloadQueue()`
- `src/search/components/RevitDownloadQueueFloatingButton.tsx`
- `src/search/usePartActionFlows.tsx` — `addToQueue`
- `src/search/useVariantActionFlows.tsx` — `addDrawingFilesToQueue`

**Known inconsistency after Phase 2:** the floating cart button still counts queued items, but the Content page no longer shows them. The button leads to a page that ignores its badge.

| Option | Trade-off |
|---|---|
| **A — Leave as is** | Zero risk to search. Demo has a dangling cart button. Needs a verbal caveat in the walkthrough. |
| **B — Hide the floating button only** | Removes the dead end with one small change in search. Queue still exists but is invisible. |
| **C — Full FR-2 / FR-3 retirement** | Matches the PRD: search actions download immediately and append history. Largest blast radius; changes four search files and the demo story of two other modules. |

**Recommendation: B for the design review, C only once the implementation epic is opened.** Ask before doing either.

---

### Phase 7 — UX audit and Figma handoff

| Step | Detail |
|---|---|
| Quality gate | Run `@hydra-ux-audit` across every changed screen |
| Type + lint | `npx tsc --noEmit`, `ReadLints` on all edited files |
| Walkthrough capture | Screenshot each AC state: empty, populated mixed-granularity, selection, permission-gated, BOM-unresolved queue |
| Figma | `@prototype-to-figma` or `figma-generate-design` + `use_figma` per `figma-mcp-routing.mdc` (Official MCP) |
| Jira | Attach the Figma link and the written Q-1–Q-4 answers to the Confluence story page (AC-6), then comment on CON-296 |

**Copy-paste prompt**

```
@hydra-ux-audit
@scope-guardrails

Run the closing gate for Documents/plans/2026-09-15-con-296-content-download-history-plan.md.

Audit every screen changed in Phases 2-5 of that plan. Verify tokens, typography, CTA hierarchy, states (default/empty/loading/error/disabled/no-permission), a11y of the disabled create actions, and responsive behaviour.
Then capture screenshots of each acceptance-criterion state listed in Phase 7.
Report findings; do not fix silently.
```

---

## 5. Complete file list

### New

| Path | Purpose |
|---|---|
| `src/shell/content/downloadHistorySeed.ts` | Seeded history covering all four Q scenarios |
| `src/shell/content/downloadHistoryRows.ts` | Two-level projection (FR-7) |
| `src/shell/content/downloadHistorySelection.ts` | Mixed-granularity selection + dedupe (FR-10) |
| `src/shell/content/contentDownloadAccess.ts` | Prototype-only simulated access (FR-13) |
| `src/shell/content/CreateSubmittalFromHistoryModal.tsx` | FR-11 |
| `src/shell/content/CreateBomFromHistoryModal.tsx` | FR-12 |
| `src/shell/content/ResolveFigureVariantsDrawer.tsx` | FR-12 variant queue (AC-5) |

### Modified

| Path | Change |
|---|---|
| `src/shell/content/DownloadCenterPage.tsx` | Cart surface → history surface |
| `src/search/revitDownloadQueue.ts` | Two optional fields on `DownloadHistoryEntry`, additive only |

### Read-only — reused, never modified

`src/shell/shellTablePatterns.ts` · `src/bom/layout/BomPageHeader.tsx` · `src/shell/PageBackButton.tsx` · `src/ui/antd.ts` · `src/theme/hydraTypography.ts` · `src/context/ActionTrailContext.tsx` · `src/context/SubmittalPackagesContext.tsx` · `src/shell/components/useSubmittalDestinationFields.ts` · `src/shell/components/SubmittalDestinationFields.tsx` · `src/shell/components/useBomDestinationFields.ts` · `src/shell/components/BomDestinationFields.tsx` · `src/bom/data/mockData.ts` · `src/catalog/productCatalogHierarchy.demo.ts` · `src/shell/projectSeed.ts` · `src/App.tsx`

## 6. Guardrails

- **Routes unchanged.** `/projects/:projectId/content` stays; `src/App.tsx` is not edited (FR-15).
- **Module name stays Content.** Only labels and copy change.
- **No new tokens, no new shared components.** Everything composes `src/ui/antd.ts` + `theme.useToken()` + `hydraTypography`.
- **No raw hex or design-intent px** in any TSX.
- **Shared contexts are read-only.** `SubmittalPackagesContext` and the BOM mock store are consumed through their existing public APIs.
- **`revitDownloadQueue.ts` changes are additive only** — no renames, no API changes, no breakage for `src/search/` callers.
- **Search, BOM, Submittal, Spec, and SeisBrace screens are frozen** unless Phase 6 is separately approved.
- **`on-hydra-app` is not touched.** CON-296 is design-only there.
- **Dummy data only.** No API calls, no backend assumptions.
- **Local prototype composition.** Nothing here is promoted to a shared system component.

## 7. Acceptance criteria mapping

| AC | Requirement | Satisfied by | Evidence |
|---|---|---|---|
| **AC-1** | Figure parents with nested variant children; no variant top-level | Phase 1 + 2 | Projection cannot emit a top-level variant; screenshot of populated state |
| **AC-2** | Empty copy states history begins at the release date | Phase 2 | Screenshot of empty state |
| **AC-3** | Single vs multi-select and parent cascade documented | Phase 3 + Q-2 above | This plan's §3; screenshot of a mixed selection |
| **AC-4** | Enabled vs disabled-with-tooltip, plus new-or-existing chooser | Phase 4 | Screenshots with and without permission; both destination modals |
| **AC-5** | Shared variant flow presented for multiple unresolved figures | Phase 5 | Screenshot of the resolution drawer at step 2 of N |
| **AC-6** | Written answers to Q-1–Q-4 linked on the Confluence page | §3 of this plan | Paste §3 into the story page; link this plan and the Figma file |

## 8. Out of scope

- Backend: ZIP pipeline removal, history entity, write path, origin discriminator (FR-1–FR-6), cart migration (FR-14).
- Any change to `ooden-tech/on-hydra-app`.
- Admin Featured Parts — the PRD explicitly defers it.
- A real permission system. `contentDownloadAccess.ts` is a demo toggle, nothing more.
- Content-catalog download stubs in `ProductCatalogContent` / `PartVariantsPage` / `PartVariantDetailPage` — untouched unless Phase 6 is approved.
- Pagination and analytics — PRD §13.3, later epic.
- i18n infrastructure. NFR-6 requires i18n keys in production; this prototype has no i18n layer, so copy stays inline and **every user-facing string must be centralised in one constants block per file** so extraction is trivial later. This gap is intentional and must be stated at handoff.

## 9. Open items before implementation starts

1. **PO sign-off on Q-1–Q-4** (§3). AC-6 blocks on this; implementation can start in parallel, but the answers may change Phase 3 and 5.
2. **Phase 6 decision** — option A, B, or C for the floating cart button.
3. **Attribution names** — the seed needs plausible teammate names. Project contacts in `src/shell/projectSeed.ts` are the obvious source; confirm that is acceptable for a client-facing demo.
