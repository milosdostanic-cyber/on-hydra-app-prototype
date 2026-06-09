# BOM App — User Flow & Dead Spots Audit

> **Purpose:** End-to-end user flow map as a FigJAM-ready reference. Covers every screen, action, modal, and drawer. Dead spots are marked with 🔴. Orphaned / disconnected elements are marked with ⚠️. Functional but stub/placeholder areas are marked with 🟡.

---

## 0. App Entry & Shell

```
Browser opens /
  └─► Redirect → /projects
```

### `/projects` — Project List (`ShellHomeContent`)

| UI Element | Action | Destination |
|---|---|---|
| Project row (click) | Navigate | `/projects/:projectId` → redirects to `/projects/:projectId/content` |
| **Create Project** button | 🔴 No handler — button does nothing | — |
| Star column | 🔴 UI only, no state | — |
| Tabs (Recent, Starred, All) | Filter visually | local state |

**Shell Sidebar navigation items:** Homepage, Projects, SeisBrace, Spec, Submittal, BOM, Content
> 🔴 Catalog is NOT in the sidebar — `/catalog` is only reachable via BOM Search or direct URL.

---

### `/projects/:projectId/content` — Project Hub (`ContentModule`)
🟡 Stub placeholder — "Content (stub)" paragraph only. No actions.

### `/projects/:projectId/seis-brace` → redirect to `/seisbrace` (`SeisBraceStubRedirect`)
The legacy project-scoped SeisBrace stub now scopes the active construction project from the URL and redirects to the top-level **`/seisbrace`** module (BOM model). Sidebar "SeisBrace" and the Home rollup card keep working unchanged.

### `/seisbrace` — SeisBrace landing (`SeisBraceLandingPage`)
Seismic designs + brace configurations for the active construction project (ported from the SeisBrace ZIP `ProjectDetailPage`, reframed to Hydra). Backed by `SeisBraceContext` (sessionStorage, scoped by construction `projectId`); construction project comes from `useActiveProject()` (top bar owns selection — no in-module project picker). The ZIP construction project list/create/edit and `ProjectDetailHeader` project title are intentionally skipped (shell owns them).

| UI Element | Action | Destination / Result |
|---|---|---|
| **New design** button (header + empty state) | Reset wizard draft, start a new design | `/seisbrace/wizard/seismic-design` |
| Designs list row (left rail) | Select design | Loads that design's brace table |
| Design row hover: Edit / Copy / Delete | Edit → wizard step 1; Copy → `copyDesign`; Delete → confirm + `deleteDesign` | — |
| Search designs / Sort (date, name) | Filter / sort the designs rail | local state |
| **Get DWG file** | Stub download | message only |
| **Report & Submittal** (disabled until braces selected) | Opens `SubmittalOptionsModal` | Stub report/submittal generation |
| Brace name link / Edit | Edit brace | `/seisbrace/wizard/seismic-coefficient` (loads brace into draft) |
| Brace row Copy / Delete | `copyBrace` / confirm + `deleteBraces` | — |
| Brace Move up / down (▲▼) | Reorder braces in the design | `moveBrace` (no DnD lib in repo) |
| Brace checkbox (COMPLETE only) | Select braces for Report & Submittal | local state |
| **New brace configuration** (dashed CTA) | Add a brace to the selected design | `/seisbrace/wizard/seismic-coefficient` |
| Submittals/reports + uploaded files | Download (stub) / Remove (uploaded) | `FileListSection` |
| **Upload fastener calculations** | Opens `FastenerUploadModal` | Stub upload → adds to uploaded files |

### `/seisbrace/wizard/:step` — Brace setup wizard (`WizardPage`)
Five-step brace setup (ZIP `WizardPage`): stepper rail (compact `WizardSteps`) + step content + shared `WizardFooter` (Back / Save & exit / Next|Finish). Wizard state lives in `SeisBraceWizardContext` (replaces the ZIP Redux `wizardSlice`); steps commit progressively to `SeisBraceContext`. Engineering math (Cp, weights, capacities) is representative static output — no real seismic engine is ported.

| Step | Slug | Content |
|---|---|---|
| 1 | `seismic-design` | Seismic Design Setup form (name, date, code, unit, load type, notes). Next creates/updates the design. |
| 2 | `seismic-coefficient` | Brace info (name, drawing ref, qty) + Cp method (`Radio.Group`, methods by code) + method-specific `CpCalculationInput` (A–H) + calculated Cp. Next creates/updates the brace. |
| 3 | `brace-type` | Brace orientation selector + zone-of-influence main line segment table (editable rows, add/remove/reorder) + Fpw summary. |
| 4 | `structure-sway-brace` | Structure/substrate (+ user-defined), fastener (+ user-defined), orientation/size, brace angles, L/R max, brace member, summary. |
| 5 | `parts-selection` | Swivel fitting cards, structural attachments table (single-select), pipe attachment cards. **Finish** marks the brace COMPLETE and returns to `/seisbrace`. |

### `/projects/:projectId/submittal` — Submittal packages (`SubmittalPackagesPage`)
Submittal Manager surface (ported from the Content ZIP, reframed to Hydra). Lists the active construction project's **submittal packages**, backed by `SubmittalPackagesContext` (sessionStorage, scoped by construction `projectId`). Construction project context is provided by the shell breadcrumb/top bar, so the page only owns the packages list.

| UI Element | Action | Destination / Result |
|---|---|---|
| **New package** button (header + empty state) | Opens `PackageCreateEditModal` | Creates a package in the active project |
| `PackageCard` chevron | Collapse / expand the card | local state |
| Part name link (in parts table) | Navigate | `/search/parts/:partKey` |
| Move up / down (▲▼) | Reorder a part within the package | `movePart` (no DnD lib in repo) |
| Remove part (🗑, per row) | `Popconfirm` → remove | `removePartFromPackage` |
| **Add part from search** (dashed CTA) | Navigate | `/search/results?q=all` (unified search) |
| Download (footer) | Opens `PdfPreviewModal` | Stub preview + stubbed download |
| Rename (footer) | Opens `PackageCreateEditModal` (edit) | `updatePackage` |
| Delete (footer) | `Popconfirm` → delete | `deletePackage` |

**Add to submittal (from a part):** Catalog/search Part detail → `UnifiedPartActions` "Add to submittal" (project-gated) → `AddToPackageModal` (pick existing or create-and-add) → success notification with "Go to packages" + session-cart floating button (`SubmittalPackageCartFloatingButton`) → `/projects/:projectId/submittal`.

> The earlier flat `SubmittalDraftContext` draft-lines stub has been replaced by this package-based model; the context was retired.

### `/dashboard`
🟡 `DashboardPlaceholder` — one paragraph + "Back to Projects" link.

---

## 1. BOM Entry Point

### Sidebar → BOM → `/bom` (`BomLandingPage`)

**Page header:** "Bill of Materials"

```
/bom Landing
  ├─► [Hero Card] Upload a File
  │     └─► Hidden file input → file picked → simulated processing delay
  │           └─► Navigate: /bom/projects/new/parsing-review
  │
  ├─► [Hero Card] Search Catalogue Parts
  │     └─► Navigate: /bom/search
  │
  ├─► [New BOM Project] button (top-right)
  │     └─► Opens: BomCreateProjectModal
  │           ├─► [Create] → adds project to mock data → Navigate: /bom/projects/:newId/workspace
  │           └─► [Cancel] → close modal
  │
  ├─► [Project table] — filtered by active construction project
  │     ├─► Row name / Edit icon → Navigate: /bom/projects/:id/workspace
  │     └─► Delete icon → removes from local state (mock only)
  │
  └─► [Back] → /bom/flow
```

**Empty states:**
- No projects for active construction project → illustrated empty state
- No filter match → "No results"

---

## 2. BOM Flow Overview

### `/bom/flow` (`BomFlowOverviewPage`)

Linear steps explainer with "Open (demo)" cards pointing to hardcoded project `new`.

| Step | Label | Demo link |
|---|---|---|
| 1 | Upload BOM file | `/bom/projects/new/parsing-review` |
| 2 | Review parsed data | `/bom/projects/new/parsing-review` |
| 3 | Matching | `/bom/projects/new/matching` |
| 4 | Narrow / Refine | `/bom/projects/new/items/item-1/narrow` |
| 5 | Recommendations | `/bom/projects/new/items/item-1/recommend` |
| 6 | Workspace | `/bom/projects/new/workspace` |
| 7 | Export | `/bom/projects/new/export` |

> ⚠️ **Not included in flow steps:** Field Mapping, Translate, in-app Catalog (`/bom/projects/.../catalog`) — these routes exist but are not surfaced here.

---

## 3. BOM Search

### `/bom/search` (`BomSearchPage`)

```
/bom/search
  ├─► Search input + example chips
  │     └─► [Search] / Enter
  │           └─► Navigate: /search/results?q=<query>   (unified search)
  │
  └─► [Back] → /bom/flow (not /bom landing — potential UX issue)
```

---

## 4. Unified Search (Home, Catalog, and BOM Search all enter here)

### `/search/results?q=` (`UnifiedSearchResultsPage`)
Single results experience across domains. Parts are fully wired; Content, Submittal, BOM, and
SeisBrace return preview rows that prove the multi-domain model.

```
/search/results?q=<query>
  ├─► Tabs: All | Parts | Content | Submittal | BOM | SeisBrace
  ├─► Part row → /search/parts/:partId
  └─► Refine search input → updates ?q=
```

### `/search/parts/:partId` (`UnifiedPartDetailPage` + `UnifiedPartActions`)
Discovery is open (view metadata with no project). Primary CTA is a single **Add to** dropdown.

```
/search/parts/:partId
  ├─► [Add to ▼]
  │     ├─► BOM → (project gate if needed) → AddToBomModal → pick/create BOM → workspace
  │     ├─► Add Revit File → (project gate if needed) → Revit download queue + floating cart
  │     ├─► Quick Download Revit File → (project gate if needed) → immediate .rfa stub download
  │     └─► Submittal Manager → (project gate if needed) → AddToPackageModal → package confirm
  │           └─► Gate (ProjectRequiredModal): select or create project → pending action resumes
  └─► Back → /dashboard (part detail hero)
```

### `/catalog` (`CatalogHome`) — browse entry into unified search

```
/catalog
  ├─► Search input → /search/results?q=<query>
  ├─► Category tag chips → /search/results?q=<tag>
  └─► Part preview rows → /search/parts/:partId
```

> Legacy `/catalog/results` and `/catalog/parts/:partId` now redirect to the `/search/*`
> equivalents (preserving query and part id) for bookmark compatibility.

---

## 5. BOM Core Flow

### Step 1 — Parsing Review

### `/bom/projects/:bomProjectId/parsing-review` (`BomParsingReviewPage`)

```
Parsing Review
  ├─► Table: parsed line items (mockParsedItems — same data for every project)
  │     └─► 🟡 No row-level actions currently
  │
  ├─► [Continue to Matching] (primary)
  │     └─► Navigate: /bom/projects/:bomProjectId/matching
  │
  └─► [BOM Home] → /bom
```

> 🟡 All projects share the same mock parsed rows. No editing or correction of parsed data is possible.

---

### Step 2 — Matching

### `/bom/projects/:bomProjectId/matching` (`BomMatchingPage`)

```
Matching
  ├─► Table: each line → top match, confidence tag, risk tag
  │     └─► [Refine] link on row → Navigate: /bom/projects/:bomProjectId/items/:itemId/narrow
  │
  ├─► [Skip to Workspace] (primary)
  │     └─► Navigate: /bom/projects/:bomProjectId/workspace
  │
  └─► [BOM Home] → /bom
```

---

### Step 3 — Narrow (per item)

### `/bom/projects/:bomProjectId/items/:itemId/narrow` (`BomNarrowPage`)

```
Narrow — Item :itemId
  ├─► Stepper + radio form (mockGuidedQuestions)
  │     ├─► [Next] → advance step
  │     └─► [Previous] → go back step
  │
  ├─► [Last step + Next / Confirm] → Navigate: /bom/projects/:bomProjectId/items/:itemId/recommend
  │
  └─► Fallback if unknown itemId → "Line not found" error state
```

---

### Step 4 — Recommend (per item)

### `/bom/projects/:bomProjectId/items/:itemId/recommend` (`BomRecommendPage`)

```
Recommend — Item :itemId
  ├─► Recommended ASC part card + attribute comparison
  │
  ├─► [Confirm and go to workspace] (primary)
  │     └─► Navigate: /bom/projects/:bomProjectId/workspace
  │
  ├─► [Adjust answers] → Navigate: /bom/projects/:bomProjectId/items/:itemId/narrow
  │
  └─► Fallback if item/match missing → "Recommendation unavailable" state
```

---

### Step 5 — Workspace

### `/bom/projects/:bomProjectId/workspace` (`BomWorkspacePage`)

**Central hub of the BOM flow.** All product add/swap actions converge here.

```
Workspace
  ├─► Stats strip: Total / Confirmed / Needs Review / Missing / Confidence %
  │
  ├─► [Add Item] / [ASC Products] (top-right)
  │     └─► Navigate: /bom/projects/:bomProjectId/asc-products
  │
  ├─► [Upload] (top-right) → Modal.confirm
  │     └─► Confirm → Navigate: /bom/projects/:bomProjectId/parsing-review
  │
  ├─► Table: workspace line items
  │     ├─► Part number link / [Resolve] → Opens: Resolve Modal
  │     │     ├─► Shows: Original vs Suggested ASC part
  │     │     ├─► [Approve] → item status = "confirmed"
  │     │     ├─► [Manual Swap] → Navigate: /bom/projects/:bomProjectId/asc-products
  │     │     │     (carries state.swapRowId)
  │     │     └─► [Approve with Feedback] → 🟡 logs to console only
  │     │
  │     └─► [Delete row] → removes from local state
  │
  ├─► [Request Service] button
  │     ├─► If unresolved rows → Modal.confirm first
  │     │     └─► Confirm → Navigate: /bom/projects/:bomProjectId/service-request
  │     └─► If all resolved → direct navigate to service-request
  │
  ├─► [Export] button (enabled when all items confirmed)
  │     └─► Navigate: /bom/projects/:bomProjectId/export
  │
  ├─► Translation flow (internal, unreachable in UI):
  │     🔴 handleTranslateParts() exists in code but no button/trigger exposes it
  │     🔴 "Translating…" alert state is unreachable via normal interaction
  │
  └─► Empty workspace (0 items) → Hero empty state with Upload / ASC Products CTAs
```

**Receiving state from other pages:**
- `state.addedProduct` (from AscProductsPage or CatalogPage) → merged into rows
- `state.swappedProduct` (from AscProductsPage in swap mode) → swaps specific row

---

### Step 6a — ASC Products (Browse / Swap)

### `/bom/projects/:bomProjectId/asc-products` (`BomAscProductsPage`)

```
ASC Products
  ├─► [Swap mode] (if navigated with state.swapRowId): Info alert shown; qty column hidden
  │
  ├─► Tabs: "Pre-Products" / "Quantity Part"
  │     🔴 Tab change does NOT change table content — both tabs show same data
  │
  ├─► Filter Drawer (inline, not AscProductsDrawer component):
  │     Checkboxes by category/rating → filters table locally
  │
  ├─► Table: ASC products
  │     ├─► [Add to BOM] / [Swap] on row
  │     │     └─► Navigate: /bom/projects/:bomProjectId/workspace  (with state.addedProduct or state.swappedProduct)
  │     └─► Quantity input (hidden in swap mode)
  │
  └─► [Back] / [Cancel] → Navigate: /bom/projects/:bomProjectId/workspace
```

> ⚠️ `AscProductsDrawer.tsx` component exists but is **not imported anywhere** — unused orphan.

---

### Step 6b — In-App Catalog

### `/bom/projects/:bomProjectId/catalog` (`BomCatalogPage`)

🔴 **Not reachable from any UI navigation.** Must be typed directly into URL or linked manually.
🔴 Not listed in `BomFlowOverviewPage` steps.

```
BOM Catalog (orphaned route)
  ├─► Tabs: "Pre-Products" / "Quantity Part"
  │     🔴 Tab change does NOT change content
  │
  ├─► Search + filter chips + filter panel (inline)
  │
  ├─► Table: MOCK_ASC_PRODUCTS (same data as AscProductsPage)
  │     ├─► Quantity input per row
  │     └─► [Add] on row → Navigate: /bom/projects/:bomProjectId/workspace  (state.addedProduct)
  │
  └─► [Back to Workspace] → /bom/projects/:bomProjectId/workspace
```

> Conceptually overlaps with `BomAscProductsPage`. Duplicate functionality with no clear differentiation.

---

### Step 6c — Translate

### `/bom/projects/:bomProjectId/translate` (`BomTranslatePage`)

🔴 **Not reachable from any primary UI navigation.** Must be typed directly.
🔴 Not listed in `BomFlowOverviewPage` steps.
🔴 Data is **not wired to workspace state** — uses independent module-level mock data.

```
Translate (orphaned route)
  ├─► Per-item wizard: Original item vs ASC part comparison
  │     ├─► [Confirm] → mark item done, advance to next
  │     └─► [Skip] → advance to next
  │
  ├─► Completion screen
  │     └─► [Return to Workspace] → /bom/projects/:bomProjectId/workspace
  │
  ├─► [Exit] → /bom/projects/:bomProjectId/workspace (any time)
  └─► [Start Over] → reset local wizard state
```

> ⚠️ `PartTranslationModal.tsx` component exists as a modal version of this flow but is **not imported anywhere**.

---

### Step 6d — Field Mapping

### `/bom/projects/:bomProjectId/field-mapping` (`BomFieldMappingPage`)

🔴 **Not reachable from any primary UI navigation.** Must be typed directly.
🔴 Not listed in `BomFlowOverviewPage` steps.

```
Field Mapping (orphaned route)
  ├─► Map BOM columns → ASC fields (dropdown selectors per column)
  │
  ├─► [Save] → message.success + Navigate: /bom/projects/:bomProjectId/workspace
  ├─► [Reset] → revert to defaults
  └─► [Cancel] → Navigate: /bom/projects/:bomProjectId/workspace
```

> ⚠️ `BomAliasConfigurator.tsx` exists as a modal version of this concept but is **not imported anywhere**.

---

### Step 7 — Export

### `/bom/projects/:bomProjectId/export` (`BomExportPage`)

```
Export
  ├─► Mode cards: Download CSV / Download Excel / Send Service Request / Email Summary
  │     (single-select)
  │
  ├─► Column visibility checkboxes
  │
  ├─► Preview table (mockWorkspaceItems — not workspace state)
  │
  ├─► [Export / Submit] (primary, label changes by mode)
  │     ├─► mode = "service" → Navigate: /bom/projects/:bomProjectId/service-request
  │     └─► mode = csv/excel/email → 🟡 message.success toast only (no real download)
  │
  └─► [BOM Home] → /bom
```

> 🟡 Export preview data is hardcoded mock — does not reflect actual workspace rows.

---

### Step 8 — Service Request

### `/bom/projects/:bomProjectId/service-request` (`BomServiceRequestPage`)

```
Service Request
  ├─► Form: contact info, project details, notes
  │
  ├─► [Submit] → 🟡 message.success toast + Navigate: /bom/projects/:bomProjectId/workspace
  │
  ├─► [Back to Workspace] link → /bom/projects/:bomProjectId/workspace
  └─► [BOM Home] link → /bom
```

> 🟡 Demo only — no real submission.

---

## 6. BOM Layout & Shared Components

### `BomLayout` — transparent outlet wrapper (no chrome added)

### `BomPageHeader` — eyebrow / title / description — used by Parsing Review and others

### `BomFlowStepper`
⚠️ Component defined but **not imported anywhere** in the app. Dead code.

### `BomCardTitle`
Used for section headings on several pages. ✅ Active.

### `BomTags` (Status, Confidence, Risk tags)
Used widely across tables. ✅ Active.

### `BomCreateProjectModal`
Used on Landing page. ✅ Active.

### `AscProductsDrawer`
⚠️ Component defined but **not imported anywhere**. Dead code.

### `BomAliasConfigurator`
⚠️ Component defined but **not imported anywhere**. Concept duplicated by `BomFieldMappingPage`.

### `PartTranslationModal`
⚠️ Component defined but **not imported anywhere**. Concept duplicated by `BomTranslatePage`.

---

## 7. AppTopBar Actions

| Element | Action |
|---|---|
| Title "BOM" | — (static) |
| **Switch Project** (dropdown) | Opens: project switcher modal → changes `ActiveProjectContext` |
| Help icon | 🔴 No handler |
| Notifications icon | 🔴 No handler |
| Account/Avatar dropdown | 🔴 No handler |

---

## 8. Complete Navigation Graph

```
/projects (Home)
  ├── /projects/:id/content          🟡 stub
  ├── /projects/:id/seis-brace       → redirects to /seisbrace (scopes active project)
  ├── /projects/:id/submittal        partial (receives from Catalog)
  └── /dashboard                     🟡 stub

/seisbrace (top-level module; sidebar "SeisBrace" + Home rollup)
  ├── /seisbrace                     designs rail + brace table + files (scoped to active project)
  └── /seisbrace/wizard/:step        5-step brace setup wizard

/search (entered from Home global search, Catalog, and BOM Search)
  ├── /search/results?q=             unified results (Parts wired; other domains preview)
  └── /search/parts/:id              Unified Action Bar (Download / Submittal / BOM, all gated)
        └── → project gate → resume action → /projects/:id/submittal or /bom

/catalog (browse entry; sidebar)
  ├── /catalog/results               → redirects to /search/results
  └── /catalog/parts/:id             → redirects to /search/parts/:id

/bom
  ├── /bom/flow                      flow overview (demo links to "new" project only)
  ├── /bom/search                    → /search/results
  └── /bom/projects/:id/
        ├── parsing-review           → matching
        ├── matching                 → workspace  OR  → narrow (per item)
        │     └── items/:iid/narrow  → recommend
        │           └── recommend    → workspace
        ├── workspace  ◄─────────────────────────────────────┐
        │     ├── → asc-products (add/swap)                  │
        │     │     └── → workspace ──────────────────────────┘
        │     ├── → service-request → workspace
        │     └── → export
        │           └── → service-request (mode=service)
        ├── catalog        🔴 orphaned, not reachable from UI
        ├── translate      🔴 orphaned, not reachable from UI; data disconnected
        └── field-mapping  🔴 orphaned, not reachable from UI
```

---

## 9. Dead Spots Summary

| # | Location | Issue | Severity |
|---|---|---|---|
| 1 | `BomWorkspacePage` — Translate | `handleTranslateParts()` exists but no UI trigger. "Translating…" state unreachable. | 🔴 High |
| 2 | `/bom/projects/:id/translate` | Route exists, page exists, but no link in any navigation or workspace. Data not connected to workspace state. | 🔴 High |
| 3 | `/bom/projects/:id/field-mapping` | Route exists, page exists, but no link in any navigation. | 🔴 High |
| 4 | `/bom/projects/:id/catalog` | Route exists, page exists, but no link in any navigation. Overlaps with ASC Products page. | 🔴 High |
| 5 | `AscProductsDrawer.tsx` | Defined, never imported. | ⚠️ Orphan |
| 6 | `BomAliasConfigurator.tsx` | Defined, never imported. Concept exists as separate page. | ⚠️ Orphan |
| 7 | `PartTranslationModal.tsx` | Defined, never imported. Concept exists as separate page. | ⚠️ Orphan |
| 8 | `BomFlowStepper.tsx` | Defined, never imported. | ⚠️ Orphan |
| 9 | Workspace tabs (ASC Products & Catalog) | "Pre-Products" / "Quantity Part" tabs render identical content. | 🔴 Functional gap |
| 10 | Catalog results filtering | Query param `q` received but not used; full list always shown. | 🟡 Stub |
| 11 | Export preview data | Hardcoded mock — does not reflect actual workspace rows. | 🟡 Stub |
| 12 | Shell "Create Project" button | No `onClick` handler — button does nothing. | 🔴 Non-functional |
| 13 | Sidebar — Catalog missing | `/catalog` is not a sidebar item; only reachable via BOM search or direct URL. | 🔴 Navigation gap |
| 14 | AppTopBar — Help / Notifications / Account | No handlers attached. | 🟡 Placeholder |
| 15 | `/dashboard` | One paragraph placeholder. | 🟡 Stub |
| 16 | `/projects/:id/content` | Stub paragraph. | 🟡 Stub |
| 17 | `/projects/:id/seis-brace` | Redirects to `/seisbrace` (scopes active project). | ✅ Wired |
| 17a | `/seisbrace` | Seismic designs + brace table + files; opens the 5-step brace wizard. | ✅ Wired |
| 18 | Parsing review — no row editing | Parsed data cannot be corrected before matching. | 🔴 Feature gap |
| 19 | "Approve with Feedback" | Handler exists in resolve modal but only logs to console. | 🟡 Stub |
| 20 | Service request submit | Toast only — no real submission or confirmation. | 🟡 Stub |
| 21 | `BomSearchPage` — back button | Goes to `/bom/flow` instead of `/bom` landing, which may be unexpected. | 🟡 UX note |
| 22 | Sidebar active item | `/catalog` paths are not matched — sidebar highlights "Homepage" incorrectly. | 🔴 Navigation bug |

---

## 10. Recommended Connections to Define

> Questions for product/design decisions before FigJAM can be finalized:

1. **Field Mapping** — when in the flow does the user map columns? Before parsing review? As part of upload?
2. **Translate** — is this a step before workspace confirmation, or a separate post-matching pass?
3. **BOM Catalog vs ASC Products** — are these two distinct surfaces (internal catalog vs curated pre-products) or should they be merged?
4. **Tab content** — what differentiates "Pre-Products" from "Quantity Part" tabs?
5. **Workspace translate trigger** — should a "Translate All" button appear in workspace when items are in needs-review state?
6. **Export → real download** — what formats are actually supported, and does the preview reflect real workspace data?
7. **Service Request** — is this an internal ASC team request or an external form submission?
8. **Sidebar Catalog** — should Catalog be a first-class sidebar item?
9. **"Approve with Feedback"** — what does feedback entail? Is it a form, a comment, a rating?
10. **Create Project (shell)** — what is the project creation flow outside of BOM?
