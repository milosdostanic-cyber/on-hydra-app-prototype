# Hydra App Prototype — Onboarding Notes

> **Purpose:** Reference for Claude, Cursor, developers, designers, and PMs. Written after a cold read of the repo on 2026-06-16. Describes how the app works, not what it should do.

---

## Product Overview

**Hydra** is a React + Vite single-page app (SPA) prototyping the "ASC Connected" platform — a B2B tool for fire-protection and MEP contractors. The two main domains are:

1. **BOM (Bill of Materials) module** — upload competitor BOM files, map columns, review parsed rows, match parts against the ASC product catalog, and manage a workspace of confirmed/pending BOM lines.
2. **Product catalog browser** — hierarchical browse of ASC product categories, subcategories, product lines, parts, and variants inside a construction project.

**All data is mock/seed data.** There are no real API calls. Persistence is limited to `localStorage` (import sessions) and `sessionStorage` (active project ID). Workspace rows live in React Context (in-memory, lost on page refresh except for what seeds from `mockData`).

**Tech stack:**
- React 19 + TypeScript + Vite
- Ant Design v6 (`antd`) — single re-export barrel at [`src/ui/antd.ts`](../src/ui/antd.ts)
- Custom "Hydra" theme layer — token overrides in [`src/theme/antdTheme.ts`](../src/theme/antdTheme.ts)
- React Router v7 (client-side routing only)
- No backend, no API client, no state management library

---

## Folder Structure

```
src/
├── App.tsx                        Root router — wires all top-level routes
├── main.tsx                       Entry point — mounts React with ConfigProvider (Hydra theme)
├── index.css                      Global CSS (minimal reset)
├── shell/                         Global layout shell + construction-project-level pages
│   ├── AppShell.tsx               Sidebar + TopBar + Breadcrumbs + Outlet
│   ├── AppShellSidebar.tsx        Collapsible left sidebar with 7 nav items
│   ├── AppTopBar.tsx              Top bar (search, notifications, project switcher)
│   ├── ShellHomeContent.tsx       /projects — construction project list
│   ├── ProjectWorkspaceLayout.tsx /projects/:id/* layout
│   ├── CatalogHome.tsx            /catalog — catalog entry page
│   ├── CatalogResults.tsx         /catalog/results — catalog search results
│   ├── CatalogPartPage.tsx        /catalog/parts/:partId — part detail
│   ├── buildAppBreadcrumbItems.tsx Derives breadcrumb items from URL
│   ├── content/                   Pages inside /projects/:id/content/*
│   └── ...                        Minor shell components (PageBackButton, ProjectDetailDrawer, etc.)
├── bom/                           Entire BOM feature module
│   ├── BomRoutes.tsx              Nested router for /bom/*
│   ├── layout/                    BomLayout, BomPageHeader
│   ├── pages/                     All BOM page components (~18 files)
│   ├── components/                Reusable BOM components (~20 files)
│   ├── hooks/                     BOM hooks (5 files)
│   ├── context/                   BomImportFlowContext (import session management)
│   ├── data/                      Mock data, seed factories, types
│   ├── constants/                 uploadLimits.ts (50MB, allowed types)
│   └── bom*.ts                    Business logic utilities (~12 files)
├── catalog/                       Catalog cards, navigation helpers, demo data
├── context/                       Global React contexts (3)
│   ├── ActiveProjectContext.tsx   Active construction project + CRUD
│   ├── BomWorkspaceContext.tsx    BOM workspace rows per project
│   └── HydraThemeContext.tsx      Color mode (light/dark)
├── theme/                         Design token layer (~12 files)
│   ├── antdTheme.ts               Main theme config — passed to ConfigProvider
│   ├── hydraAlias.ts              Resolved alias tokens + shellLayout constants
│   ├── hydraTypography.ts         Named text style objects (hydraBaseNormal, etc.)
│   ├── primaryPrimitiveBlue.ts    Primary color palette
│   └── ...                        Button palette, sidebar semantics, shadows, etc.
├── ui/
│   ├── antd.ts                    Barrel re-export of all Ant Design components used
│   ├── AppSearchInput.tsx         Custom search input wrapper
│   ├── ExportCard.tsx             Export mode card UI
│   └── HydraTag.tsx               Generic Tag wrapper
└── assets/brand/
    └── ascLogoUrls.ts             Logo image URLs
```

**Not the main codebase:** The `on-hydra-app-prototype-feature-parts/` directory at repo root is a separate full copy of the repo (own `package.json`, `node_modules`, `.git`). It appears to be an older branch snapshot or worktree. Ignore it unless specifically needed.

---

## Routing Structure

All routes live inside `AppShell` (sidebar + top bar + breadcrumbs always visible).

```
/                          → redirect to /projects
/dashboard                 → DashboardPlaceholder (stub, empty)
/projects                  → ShellHomeContent (construction project list)
/catalog                   → CatalogHome
/catalog/results           → CatalogResults
/catalog/parts/:partId     → CatalogPartPage

/bom                       → BomIndexRedirect (redirects to /bom/site/:activeProjectId)
/bom/site/:constructionProjectId
                           → BomSiteProjectsPage
/bom/search                → BomSearchPage
/bom/projects/:id/field-mapping
                           → BomFieldMappingPage (Step 1 — manual column edit)
/bom/projects/:id/mapping-summary
                           → BomMappingSummaryPage (Step 1 — auto-mapped summary)
/bom/projects/:id/parsing-review
                           → BomParsingReviewPage (Step 2)
/bom/projects/:id/matching
                           → BomMatchingIndexRedirect → /review
/bom/projects/:id/matching/review
                           → BomProgressiveMatchingPage (Step 3, one-by-one)
/bom/projects/:id/matching/table
                           → BomMatchingPage (Step 3, full table)
/bom/projects/:id/matching/items/:itemId/replacement
                           → BomReplacementPickerPage (DEPRECATED — redirects to /review)
/bom/projects/:id/workspace
                           → BomWorkspacePage
/bom/projects/:id/export   → BomExportPage
/bom/projects/:id/service-request
                           → BomServiceRequestPage
/bom/projects/:id/translate
                           → BomTranslatePage
/bom/projects/:id/asc-products
                           → BomAscProductsPage

/projects/:projectId/content
                           → ProductCatalogContent
/projects/:projectId/content/category/:categoryId/all-parts
                           → CategoryAllPartsPage
/projects/:projectId/content/category/:categoryId/sub/:subcategoryId
                           → SubcategoryHubPage
...and deeper catalog routes (product line, part variants, variant detail)
/projects/:projectId/seis-brace   → SalesBraceModule (stub)
/projects/:projectId/sales-brace  → SalesBraceModule (stub)
/projects/:projectId/submittal    → SubmittalModule (stub)
```

---

## Main User Flows

### Flow 1 — BOM Upload & Match (primary)

**Goal:** Import a competitor BOM file, map columns, review, match to ASC parts, save to workspace.

#### Step-by-step

**1. BOM Hub** (`/bom/site/:constructionProjectId` → `BomSiteProjectsPage`)
- User selects active construction project from sidebar or top-bar switcher
- Two quick-action cards: "Upload a file" and "Search Catalogue Parts"
- BOM projects table with status, item count, last edited
- CTA: **New BOM Project** (modal) or **Upload a file** (file picker)

**2. File pick + destination**
- File validation: must be `.xlsx`, `.xls`, `.csv`, or `.pdf`; max 50MB (see `src/bom/constants/uploadLimits.ts`)
- On success: `BomUploadDestinationModal` asks "New BOM project" or "Add to existing project"
- On invalid type/size: `message.error` toast, no navigation

**3. Mapping Summary** (`/bom/projects/:id/mapping-summary` → `BomMappingSummaryPage`)
- The app auto-derives column mapping from the filename (see `deriveFieldMappingForUpload`)
- Confidence levels: `high` (all required + most optional columns found), `partial` (required found, some optional missing), `blocked` (required columns missing or duplicate mappings)
- Alert shown matching confidence level: success/warning/error
- **Continue** button: enabled when confidence is `high` or `partial` (not blocked)
- **Review columns** button: goes to BomFieldMappingPage for manual adjustment
- **Cancel upload** button: dismisses the session

**4. Field Mapping Editor** (`/bom/projects/:id/field-mapping` → `BomFieldMappingPage`)
- Table of BOM file columns ↔ ASC fields in edit mode
- Required fields: Description, Figure Number, Part Number/SKU, or UPC (at least one)
- Validation: duplicates (two ASC fields mapped to same BOM column) block Save
- Actions: Stop editing (returns to mapping summary with confirmation if dirty), Save, Reset defaults
- Returns to mapping summary on Save/Stop editing

**5. Parsing Review** (`/bom/projects/:id/parsing-review` → `BomParsingReviewPage`)
- Read-only table of parsed BOM rows (from `normalizeParsedItemsForUpload`)
- Columns adapt to the field mapping profile (`description`, `sku-only`, or `upc`)
- Quality alert (`BomParsingReviewQualityAlert`): summarizes total rows, warnings count
- Row detail drawer (`BomParsingReviewRowDrawer`): expand a row to see all parsed fields
- **Continue to matching** button: goes to `/matching/review`
- **Back to mapping summary** button in step chrome

**6a. Progressive Matching** (`/bom/projects/:id/matching/review` → `BomProgressiveMatchingPage`)
- One-by-one guided review of pending lines
- Shows: original input description (left panel) + ASC suggested part details (right panel, `BomMatchingReviewPartPanel`)
- Per-line actions: **Accept**, **Skip**, **Choose different part** (opens `BomChoosePartModal`)
- If match is figure-level only: SKU picker required before accepting (`BomSkuVariantPicker`)
- Progress bar: "Reviewing X of Y"
- When all done: summary state, **Save and Import** CTA becomes available
- **Switch to table view** button: `/matching/table`

**6b. Table Matching** (`/bom/projects/:id/matching/table` → `BomMatchingPage`)
- All lines in a paginated table with confidence + status filters
- Stats strip: Total / Confirmed / Chosen / Skipped / Unresolved / Needs SKU / Match Confidence
- Bulk actions: "Accept all high matches" (≥85% confidence), "Skip rest"
- Per-row actions: Accept, Skip, Refine (opens `BomChoosePartModal`), view details (`BomMatchDetailDrawer`)
- Filter: confidence (all/high/medium/low), review status (all/accepted/skipped/pending/etc.)
- "Skipped only" toggle — can arrive focused on skipped lines (`focusSkipped` location state)
- **Save and Import** button: **disabled** until every line is `accepted` or `skipped`
- On Save: accepted + manually chosen lines appended to workspace rows; navigates to `/workspace`

**7. Workspace** (`/bom/projects/:id/workspace` → `BomWorkspacePage`)
- Full description in Flow 2 below

---

### Flow 2 — BOM Workspace Management

**Goal:** Review, confirm, export, or manage BOM lines after import.

**Screen:** `BomWorkspacePage`

#### States

| State | Trigger | What shown |
|---|---|---|
| Empty (new project) | `project.items === 0` and no workspace rows | Empty state + 3 CTAs (Add item, Upload BOM file, Search parts) |
| Project not found | `bomProjectId` not in mock data | Error message + "BOM home" button |
| Normal workspace | Has rows | Stats strip + table + toolbar |
| Pending uploads banner | Sessions with `currentStep !== 'done'` for this project | Yellow bar portaled below breadcrumbs (`BomPendingUploadsRegion`) |
| Append banner | Navigated from import with `appendImportBanner` location state | Blue Alert with "Filter to new lines" link |
| Translating | `isTranslating` = true | Info Alert |
| Action error | `actionError` set | Error Alert with optional Retry |

#### Table toolbar (normal state)
- Search (filters by description, part number, SKU, category)
- Status filter: All / Confirmed / Needs Review / Missing Match
- Row selection: when rows selected, shows "X selected" + Bulk Delete button

#### Per-row actions (in table, via `bomWorkspaceColumns`)
- **Review** → opens Review Modal (shows original + suggested ASC part)
- **Delete** → confirm modal, then removes row

#### Review Modal actions
- **Confirm match** → sets row `status: 'confirmed'`
- **Choose different part** → opens `AscProductsDrawer` in swap mode
- **Reopen for review** (if already confirmed) → sets `status: 'needs-review'`

#### Header actions
- **Add Item** → `AscProductsDrawer` (browse mode, adds new row)
- **Upload file** → confirms re-upload, navigates to mapping-summary with `append` destination
- **Export** → `/bom/projects/:id/export`
- **Edit project name** (pencil icon) → `BomEditProjectModal`

---

### Flow 3 — Resume Interrupted Import

**Goal:** Return to an in-progress import session from the workspace.

- Workspace shows `BomPendingUploadsRegion` (yellow bar below breadcrumbs)
  - 1 pending session: single strip with filename, step, progress bar, **Continue** CTA
  - 2+ pending sessions: collapsible panel listing all sessions
- Clicking **Continue**: restores `activeUploadId`, navigates to `routeForImportStep(projectId, currentStep)`
- Sessions persist across page refresh via localStorage (`hydra_bom_import_sessions_v2`)

**Demo behavior:** Project `6` (Parking Garage Electrical Upgrade) is always seeded with 3 pending imports. Project `1` (Hospital Wing) is seeded with 1 pending import. This seeding re-runs every time `pendingForProject()` is called if the seed was dismissed.

---

### Flow 4 — BOM Search

**Goal:** Natural-language or part-number search for catalog parts.

**Screen:** `BomSearchPage` → navigates to `/catalog/results?q=...`

- Standalone search bar with example queries as buttons
- Navigates to CatalogResults page (no BOM-specific wiring; effectively a catalog browse entry)

---

### Flow 5 — Construction Projects Hub

**Goal:** Select a construction project and navigate to its modules.

**Screen:** `ShellHomeContent` (`/projects`)

- Table of construction projects with tabs (All / Recent / Starred)
- Search by name/address/city
- Star/unstar rows (local state only)
- Row click → `ProjectDetailDrawer` (details panel)
- **Open** / row navigate → `/projects/:id/content` (product catalog for that project)
- **New Project** button → modal form (persists to sessionStorage via `ActiveProjectContext`)

---

### Flow 6 — Product Catalog Browse (inside project)

**Goal:** Browse ASC product hierarchy inside a construction project.

**Entry:** Sidebar → "Content" or `/projects/:id/content`

**Hierarchy:**
```
ProductCatalogContent (hero with featured parts)
  → CategoryAllPartsPage (all parts in a category)
  → SubcategoryHubPage (subcategory overview)
    → ProductLinePartsPage (parts in a product line)
      → PartVariantsPage (variants for a part)
        → PartVariantDetailPage (single variant)
```

All routes are under `/projects/:id/content/category/:cat/sub/:sub/line/:line/part/:part/...`

---

### Flow 7 — Export

**Screen:** `BomExportPage` (`/bom/projects/:id/export`)

Four export mode cards:
1. **Excel / CSV** — download BOM (simulated)
2. **Generate submittal package** — creates a datasheet package (simulated)
3. **Send to distributor** — share for pricing (simulated)
4. **Request ASC service** — send to ASC team (links to service-request route)

---

## Screen-by-Screen Breakdown

### `BomSiteProjectsPage` — BOM Hub
**File:** `src/bom/pages/BomSiteProjectsPage.tsx`
**Route:** `/bom/site/:constructionProjectId`

- Quick action cards: Upload file, Search catalogue
- BOM projects table: filterable (status, search), sortable (last edited), paginated
- Row actions: Edit (→ workspace), Delete (confirm modal)
- Bulk select: bulk delete
- Creates new BOM project via `BomCreateProjectModal`
- Upload triggers file validation → `BomUploadDestinationModal`

**Empty states:**
- No projects yet: empty state card + Create / Upload CTAs
- No search/filter results: empty state card + Clear filters

---

### `BomMappingSummaryPage` — Step 1: Mapping Summary
**File:** `src/bom/pages/BomMappingSummaryPage.tsx`
**Route:** `/bom/projects/:id/mapping-summary`

- Shows `BomUploadFlowStepChrome` (back button + 3-step progress bar at step 0)
- Confidence alert (success/warning/error) with explanation copy
- `BomFieldMappingTable` in read-only/summary mode
- Tags showing "auto-detected" vs "not mapped" columns
- Concatenated-column detection alert (special case)
- **Continue** button: disabled if `confidence === 'blocked'`
- **Review columns** → BomFieldMappingPage

---

### `BomFieldMappingPage` — Step 1: Advanced Column Edit
**File:** `src/bom/pages/BomFieldMappingPage.tsx`
**Route:** `/bom/projects/:id/field-mapping`

- Same step chrome (step index 0)
- `BomFieldMappingTable` in edit mode — dropdowns to select BOM column per ASC field
- Save blocked if: required fields not mapped OR duplicate BOM column assignments
- `isDirty` guard on "Stop editing" (confirm modal if unsaved changes)

---

### `BomParsingReviewPage` — Step 2: Parsing Review
**File:** `src/bom/pages/BomParsingReviewPage.tsx`
**Route:** `/bom/projects/:id/parsing-review`

- Step chrome at step index 1
- `BomParsingReviewQualityAlert` with summary stats
- Paginated table; columns vary by `parsingReviewColumnProfile` (description/sku-only/upc)
- Row expand icon → `BomParsingReviewRowDrawer` (all parsed fields)
- **Continue to matching** navigates to `/matching/review`
- Missing session guard: if no session data exists, shows warning and links back

---

### `BomProgressiveMatchingPage` — Step 3: One-by-One Review
**File:** `src/bom/pages/BomProgressiveMatchingPage.tsx`
**Route:** `/bom/projects/:id/matching/review`

- Step chrome at step index 2
- `BomMatchingReviewQualityAlert` (summary card above)
- Progress bar "Reviewing X of Y"
- `BomMatchingReviewPartPanel` — main review area:
  - Left: original import description + parsed attributes
  - Right: ASC suggested part details, match score, SKU picker (if figure-level match)
  - Alternate candidates selector
- Actions: **Accept**, **Skip**, **Choose different part** (`BomChoosePartModal`)
- All done state: shows last reviewed item, **Go to table** + **Save and Import**
- **Switch to table view** (`TableOutlined` button top-right)

---

### `BomMatchingPage` — Step 3: Table Review
**File:** `src/bom/pages/BomMatchingPage.tsx`
**Route:** `/bom/projects/:id/matching/table`

- Step chrome at step index 2
- Stats strip: Total / Confirmed / Chosen / Skipped / Unresolved / Needs SKU / Match Confidence
- Confidence + review status filters + skipped-only toggle
- Paginated table with `buildMatchingResultsColumns`
- Per-row: Accept / Skip / Refine (opens `BomChoosePartModal`) / Details (`BomMatchDetailDrawer`)
- Bulk: "Accept all high matches" (threshold: 85), "Skip rest"
- **Save and Import**: disabled until all lines are accepted or skipped
- Arrival with `guidedReviewComplete: true` location state: shows completion banner
- Arrival with `focusSkipped: true`: auto-activates "Skipped only" filter

---

### `BomWorkspacePage` — BOM Workspace
**File:** `src/bom/pages/BomWorkspacePage.tsx`
**Route:** `/bom/projects/:id/workspace`

Full description in Flow 2 above. Key details:
- `BomPendingUploadsRegion` portaled to `#bom-shell-flush-below-breadcrumb` slot (below breadcrumbs, full-width yellow)
- Stats strip: Total / Confirmed / Needs Review / Missing Match
- Table: search + status filter + row selection
- Double-click row → opens Review Modal
- `AscProductsDrawer`: supports both `browse` (add item) and `swap` (replace row) modes
- `BomWorkspaceImportDetailDrawer`: shows original import data for a row

---

### `BomExportPage`
**File:** `src/bom/pages/BomExportPage.tsx`
**Route:** `/bom/projects/:id/export`

- Workspace rows table (confirmed rows only) + column picker checkboxes
- Four `ExportCard` options (Excel/CSV, submittal package, distributor, service)
- Selecting mode shows a detail panel with fields (file name, email, etc.) and CTA
- All actions are simulated (`message.success`)

---

### `BomSearchPage`
**File:** `src/bom/pages/BomSearchPage.tsx`
**Route:** `/bom/search`

- Large search input with example query buttons
- Navigates to `/catalog/results?q=...` on search
- Back button to BOM hub

---

### `BomTranslatePage`
**File:** `src/bom/pages/BomTranslatePage.tsx`
**Route:** `/bom/projects/:id/translate`

- Shows unconfirmed workspace rows
- Per-row: left (original input), right (suggested ASC part), confirm/edit quantity
- Prev/Next navigation through rows
- Also accessible as workspace action (confirms all unconfirmed rows in one operation)

---

### `ShellHomeContent` — Construction Projects
**File:** `src/shell/ShellHomeContent.tsx`
**Route:** `/projects`

- Tabs: All / Recent / Starred
- Search bar
- Star/unstar toggle per row
- `ProjectDetailDrawer` on row click
- New project modal (name, address, city, state — persisted to sessionStorage)

---

### `CatalogHome`, `CatalogResults`, `CatalogPartPage`
**Files:** `src/shell/CatalogHome.tsx`, `src/shell/CatalogResults.tsx`, `src/shell/CatalogPartPage.tsx`
**Routes:** `/catalog`, `/catalog/results`, `/catalog/parts/:partId`

- Catalog home: featured parts cards (`FeaturedParts`, `FeaturedPartCard`)
- Results: search results table (mock data)
- Part page: individual part detail

---

## Data and Business Logic

### Data sources (all mock)

| Source | File | What it provides |
|---|---|---|
| BOM projects | `src/bom/data/mockData.ts` | `mockBomProjects` — 30 BOM projects across 4 construction project IDs |
| BOM workspace rows | `src/bom/data/bomWorkspaceSeed.ts` | Seed rows per project + `buildWorkspaceMainRows` |
| Import flow seed | `src/bom/data/bomImportFlowSeed.ts` | `createParsingReviewRows`, `createInitialMatchResults`, `normalizeParsedItemsForUpload` |
| ASC catalog | `src/bom/data/ascBrowserProducts.ts` | Flat list of ASC products for the AscProductsDrawer |
| ASC SKU variants | `src/bom/data/ascSkuVariants.ts` | SKU variants per figure number |
| Catalog hierarchy | `src/catalog/productCatalogHierarchy.demo.ts` | Category/subcategory/product line tree |
| Construction projects | `src/shell/projectSeed.ts` | `PROJECT_SEED_ROWS` — 4 seed construction projects |

### State management

| Context / store | File | What it manages | Persistence |
|---|---|---|---|
| `ActiveProjectContext` | `src/context/ActiveProjectContext.tsx` | Active construction project ID + CRUD | sessionStorage |
| `BomWorkspaceContext` | `src/context/BomWorkspaceContext.tsx` | BOM workspace rows per project | In-memory React state (lost on refresh) |
| `BomImportFlowContext` | `src/bom/context/BomImportFlowContext.tsx` | Import sessions: create/update/dismiss/list | localStorage (`hydra_bom_import_sessions_v2`) |
| Location state | React Router `navigate(path, {state})` | Upload flow data between steps | Ephemeral — lost on refresh or direct URL entry |
| `HydraThemeContext` | `src/context/HydraThemeContext.tsx` | Light/dark color mode | In-memory |

### Important business rules

1. **Field mapping required fields:** At least one of Description, Figure Number, Part Number/SKU, or UPC must be mapped. Blocked by duplicate column assignments. Source: `hasRequiredFieldMapping()` in `bomFieldMappingUtils.ts`.

2. **Mapping confidence gates progress:**
   - `blocked` → Continue disabled on mapping summary
   - `partial` → Continue enabled with warning alert
   - `high` → Continue enabled with success alert

3. **Match acceptance rule:** "Save and Import" on the matching table is **disabled** until every BOM line has `lineStatus === 'accepted'` or `lineStatus === 'skipped'`. No partial saves.

4. **Figure-level matches require SKU selection:** If a match returns `matchLevel === 'figure'`, the user must select a specific SKU variant (`AscSkuVariant`) before accepting. Tracked by `matchRequiresSkuSelection()` in `bomMatchSkuUtils.ts`.

5. **High-confidence threshold:** 85% (`HIGH_MATCH_AUTO_ACCEPT_THRESHOLD` in `bomMatchingBulkActions.ts`). "Accept all high matches" applies to lines at or above this threshold.

6. **Workspace row statuses:**
   - `confirmed` — accepted in matching or manually approved in workspace
   - `needs-review` — needs attention
   - `pending` (or undefined) — no match yet / missing
   - `isWorkspaceRowConfirmed()` in `bomWorkspaceHelpers.ts` defines what counts as "confirmed" for stats and export

7. **Import destination modes:**
   - `new` — creates a new BOM project
   - `append` — adds rows to an existing project's workspace (banner shown on arrival)

8. **File limits:** 50MB max, types: `.xlsx`, `.xls`, `.csv`, `.pdf` (see `src/bom/constants/uploadLimits.ts`)

9. **Demo seeding:** `ensureDemoPendingImports()` always re-seeds project `6` with 3 pending imports and project `1` with 1. This overrides user dismissals in the demo.

10. **Upload flow location state:** The flow from upload → mapping → parsing → matching passes data forward via `location.state` as `BomUploadFlowLocationState`. This includes `uploadFileName`, `uploadDestination`, `appendTargetId`, `fieldMapping`, `mappingConfidence`, `uploadId`. Losing this state (e.g., direct URL navigation) degrades some functionality; hooks fall back to localStorage.

---

## Key Components

### Layout / Shell

| Component | File | Used in |
|---|---|---|
| `AppShell` | `src/shell/AppShell.tsx` | Root layout — wraps all routes |
| `AppShellSidebar` | `src/shell/AppShellSidebar.tsx` | Left sidebar, 7 nav items, collapsible |
| `AppTopBar` | `src/shell/AppTopBar.tsx` | Top bar with search and project switcher |
| `BomLayout` | `src/bom/layout/BomLayout.tsx` | BOM section layout wrapper (thin) |
| `BomPageHeader` | `src/bom/layout/BomPageHeader.tsx` | Consistent title/description/actions header on every BOM page |

### Upload Flow Chrome

| Component | File | Used in |
|---|---|---|
| `BomUploadFlowStepChrome` | `src/bom/components/BomUploadFlowStepChrome.tsx` | Steps 1–3 pages — back button + progress bar |
| `BomUploadProgressBar` | `src/bom/components/BomUploadProgressBar.tsx` | 3-step stepper (Map → Parse → Match) with filename and status label |
| `BomPendingUploadsRegion` | `src/bom/components/BomPendingUploadsRegion.tsx` | Yellow pending-uploads banner portaled below breadcrumbs |
| `BomImportProgressStrip` | `src/bom/components/BomImportProgressStrip.tsx` | Individual session resume strip inside pending region |

### Field Mapping

| Component | File | Used in |
|---|---|---|
| `BomFieldMappingTable` | `src/bom/components/BomFieldMappingTable.tsx` | BomFieldMappingPage (edit mode) + BomMappingSummaryPage (read-only) |
| `BomAliasConfigurator` | `src/bom/components/BomAliasConfigurator.tsx` | Internal to BomFieldMappingTable |

### Matching Review

| Component | File | Used in |
|---|---|---|
| `BomMatchingReviewPartPanel` | `src/bom/components/BomMatchingReviewPartPanel.tsx` | BomProgressiveMatchingPage — main part comparison panel |
| `BomMatchingReviewQualityAlert` | `src/bom/components/BomMatchingReviewQualityAlert.tsx` | Both matching pages — quality summary alert |
| `BomChoosePartModal` | `src/bom/components/BomChoosePartModal.tsx` | BomMatchingPage + BomProgressiveMatchingPage — manual part selection modal |
| `BomSkuVariantModal` | `src/bom/components/BomSkuVariantModal.tsx` | BomMatchingPage — SKU variant picker in modal form |
| `BomSkuVariantPicker` | `src/bom/components/BomSkuVariantPicker.tsx` | BomMatchingReviewPartPanel — inline SKU picker |
| `BomMatchDetailDrawer` | `src/bom/components/BomMatchDetailDrawer.tsx` | BomMatchingPage — row detail side drawer |
| `BomSuggestedPartsModal` | `src/bom/components/BomSuggestedPartsModal.tsx` | Suggested ASC parts list in modal |

### Workspace

| Component | File | Used in |
|---|---|---|
| `AscProductsDrawer` | `src/bom/components/AscProductsDrawer.tsx` | BomWorkspacePage — browse/add/swap ASC products |
| `BomWorkspaceImportDetailDrawer` | `src/bom/components/BomWorkspaceImportDetailDrawer.tsx` | BomWorkspacePage — shows original import row data |
| `BomEditProjectModal` | `src/bom/components/BomEditProjectModal.tsx` | BomWorkspacePage + BomSiteProjectsPage |
| `BomCreateProjectModal` | `src/bom/components/BomCreateProjectModal.tsx` | BomSiteProjectsPage |
| `BomUploadDestinationModal` | `src/bom/components/BomUploadDestinationModal.tsx` | BomSiteProjectsPage — new vs. append choice |
| `BomTablePaginationBar` | `src/bom/components/BomTablePaginationBar.tsx` | Shared pagination bar in BOM tables |
| `BomTableRowActions` | `src/bom/components/BomTableRowActions.tsx` | Per-row action buttons |

### Tags / Badges

| Component | File | Notes |
|---|---|---|
| `BomConfidenceTag` | `src/bom/components/BomTags.tsx` | high/medium/low confidence — green/orange/red Tag |
| `BomProjectStatusTag` | `src/bom/components/BomTags.tsx` | BomProject status — colored Tag |
| `BomStatusBadge` | `src/bom/components/BomTags.tsx` | Match status badge |
| `BomManualTag` | `src/bom/components/BomTags.tsx` | "Manual" source indicator |
| `BomMatchLevelTag` | `src/bom/components/BomTags.tsx` | SKU vs Figure match level |

### Parsing Review

| Component | File | Used in |
|---|---|---|
| `BomParsingReviewQualityAlert` | `src/bom/components/BomParsingReviewQualityAlert.tsx` | BomParsingReviewPage |
| `BomParsingReviewRowDrawer` | `src/bom/components/BomParsingReviewRowDrawer.tsx` | BomParsingReviewPage — per-row detail side drawer |

### Shared UI

| Component | File | Notes |
|---|---|---|
| `AppSearchInput` | `src/ui/AppSearchInput.tsx` | Search input used across all tables |
| `ExportCard` | `src/ui/ExportCard.tsx` | Export mode selection card |
| `HydraTag` | `src/ui/HydraTag.tsx` | Generic styled Tag |
| `PageBackButton` | `src/shell/PageBackButton.tsx` | Back chevron button used on BOM sub-pages |

### Hooks

| Hook | File | What it does |
|---|---|---|
| `useBomImportSession` | `src/bom/hooks/useBomImportSession.ts` | Resolves the active import session for a project from location state + localStorage |
| `useBomMatchingData` | `src/bom/hooks/useBomMatchingData.ts` | Loads match results from session, provides persist callback |
| `useBomChoosePartDrawer` | `src/bom/hooks/useBomChoosePartDrawer.tsx` | Controls open/close state of BomChoosePartModal, handles part selection |
| `useBomFinishImport` | `src/bom/hooks/useBomFinishImport.tsx` | Handles "Save and Import" — commits accepted lines to workspace |
| `useBomCancelUpload` | `src/bom/hooks/useBomCancelUpload.tsx` | Dismisses current upload session |

---

## Design System and Styling

### Design system

**Ant Design v6** is the base component library. The "Hydra" theme wraps it with custom tokens configured through `ConfigProvider` in `src/main.tsx`.

- All Ant Design components are imported from `src/ui/antd.ts` (barrel file) — never directly from `antd`
- The barrel also exports custom `AppSearchInput`

### Theme configuration

**File:** `src/theme/antdTheme.ts` — exports `hydraAntdTheme` (light) and `hydraAntdThemeDark` (dark)

| Token area | Source | Notes |
|---|---|---|
| Primary color (blue) | `src/theme/primaryPrimitiveBlue.ts` | Used for links, focus rings, secondary buttons |
| Primary Button color (orange/volcano) | `src/theme/buttonPrimaryPalette.ts` | Intentionally different from global primary — orange CTA buttons |
| Background layout | `hydraNeutralGray3Light` | Overrides antd default gray |
| Box shadows | `hydraSemanticColors.ts` | Three shadow levels (primary/secondary/tertiary) |
| Typography | `hydraAntdTypography.ts` | Font family, sizes, line heights |
| Sidebar | `sidebarSemantics.ts` | Dark sidebar surface + item states |
| Menu | `antdTheme.ts` → `buildHydraShellComponents` | Menu item border radius, margins, heights |
| Table | same | Header bg, borders from alias tokens |
| Tag | same | Default bg: `colorFillQuaternary`, border: `colorBorder` |

### Typography

Named style objects in `src/theme/hydraTypography.ts`. Applied via `hydraTextStyleToReactCss(styleObj)` helper.

Key styles:
- `hydraSmallNormal` / `hydraSmallStrong` — smallest text
- `hydraBaseNormal` / `hydraBaseStrong` — body text
- `hydraLargeNormal` / `hydraLargeStrong` — large body
- `hydraTitleHeading1` through `hydraTitleHeading4` — page and card titles

**Pattern:** Always use `hydraTextStyleToReactCss()` when applying text styles inline. Do not set `fontSize` or `fontWeight` directly.

### Spacing and layout

Layout metrics in `src/theme/hydraAlias.ts` → `shellLayout`:
- `siderWidth`: 256px (sidebar expanded)
- `siderCollapsedWidth`: 72px
- `headerHeight`: derived from `hydraSidebarBrandBandHeightPx`
- `contentRailMinWidthPx`: 1136px / `contentRailMaxWidthPx`: 1440px
- `tablePageSizeDefault`: 20 rows

**Pattern:** Use `theme.useToken()` for all spacing values inside components (`token.padding`, `token.marginLG`, etc.). Hard-coded pixel values are a sign of a design system gap.

### Buttons

- **Primary (solid orange):** `type="primary"` — maps to orange/volcano palette via theme override
- **Default (stroke/outline):** `type="default"` — blue border, blue text
- **Ghost / text:** `type="text"` — no border
- **Link:** `type="link"` — text-only link style
- **Danger:** `danger` prop — red variants
- Size: most primary/default CTAs use `size="large"`. Inline/toolbar buttons use default size.

### Color usage patterns

- Accent borders on stat cards: `token.colorSuccessBorder` (green), `token.colorWarningBorder` (orange), `token.colorErrorBorder` (red), `bluePrimaryPrimitiveLight[6]` (blue)
- Table headers: `token.colorFillAlter` background
- Pending uploads region: `token.colorWarningBg` (yellow)
- Status badges follow antd semantic color presets (success/warning/error)

### Known hardcoding / inconsistencies

- Some components in matching review use fixed-width column labels (e.g., `COLUMN_LABEL_WIDTH = 104` in `BomMatchingReviewPartPanel.tsx`)
- A few pixel values appear in transition durations and specific layout calculations
- Documentation audits exist at `Documentation/hydra-tokenization-parity-audit.md` and `Documentation/hydra-elevation-parity-audit.md` that track token vs. Figma divergence
- `productCatalogHeroFigmaCover.tsx` in `src/shell/content/` is named with "Figma cover" — may be a placeholder component

---

## Current Gaps and Risks

### Functional gaps (as of this read)

1. **`BomReplacementPickerPage` is deprecated.** The route `/bom/projects/:id/matching/items/:itemId/replacement` still exists but is a redirect to `/matching/review`. Any old links are silently redirected. The comment says "Legacy route — guided review + choose drawer replaced this."

2. **Stub pages:** `/dashboard` (DashboardPlaceholder), `/projects/:id/seis-brace`, `/projects/:id/sales-brace`, `/projects/:id/submittal` are all empty stubs. Don't rely on these for flows.

3. **`BomNarrowPage`, `BomRecommendPage`** — These routes exist in BomRoutes.tsx but their purpose in the current flow is unclear. They may be earlier-iteration pages. Verify whether they're actively used or can be removed.

4. **`BomAscProductsPage`** (`/bom/projects/:id/asc-products`) — Has a redirect from `/catalog` alias. Full content unknown from this read, but appears to be a standalone ASC catalog browse for a BOM project.

5. **No real persistence:** Workspace rows are lost on page refresh (React Context only). Import sessions survive via localStorage, but the workspace state (rows, edits) does not. This is a known prototype limitation.

### UX risks

6. **Location state dependency:** The upload flow passes critical data (`uploadId`, `fieldMapping`, `uploadDestination`) via `location.state`. A user who refreshes mid-flow (e.g., on parsing-review page) may see degraded behavior. The app has fallback handling via `useBomImportSession`, but it's not guaranteed to recover all state.

7. **Demo seed interference:** `ensureDemoPendingImports()` re-seeds projects 1 and 6 every time `pendingForProject()` is called. If a demo user dismisses the pending uploads, they come back on next visit. This creates a confusing demo experience.

8. **Match table "Save and Import" is hard to enable:** Every line must be accepted or skipped — no partial save. The UX for skipping many lines at once (bulk skip) is only available as "Skip rest" which applies to all remaining pending lines simultaneously. No multi-select skip.

9. **Two matching modes but no clear guidance** on when to use table vs. one-by-one view. The app always opens in one-by-one (`/matching/review`) and lets the user switch to table. The distinction and recommended usage is not surfaced to the user.

10. **`productCatalogHeroFigmaCover.tsx`** contains the hero image/banner for the catalog product content page. The filename suggests it may be a Figma-specific placeholder — verify before treating as production-ready.

### Technical debt

11. **Nested repo directory:** `on-hydra-app-prototype-feature-parts/` at root is a full separate repo copy (own `.git`, `node_modules`, `package.json`). It is not an npm workspace. Confusing for new developers. Safe to ignore for all work in the main repo.

12. **`bomWorkspaceDashboard.ts`** provides demo URLs (`demoSubmittalUrlForFigure`, `demoCatalogImageForPart`, etc.) — these are hardcoded demo assets, not connected to any real catalog API.

13. **`BomImportProgress.totalAscFields` vs. `ASC_FIELD_MAPPING_TOTAL`:** The total number of mappable ASC fields is a constant. If new fields are added, both the constant and any existing saved sessions need to be consistent.

14. **Session upgrade path:** `upgradeImportSessionParsedItems()` handles migration of old localStorage sessions. If the seed data shape changes (e.g., new fields added to `BomItem`), old sessions may behave unexpectedly until dismissed.

---

## Recommended Files to Review First

For a developer or designer joining the project, read in this order:

1. **[`src/bom/data/types.ts`](../src/bom/data/types.ts)** — All BOM domain types. Start here to understand the data model.
2. **[`src/App.tsx`](../src/App.tsx)** — Routing overview. See the full route tree in 60 lines.
3. **[`src/bom/BomRoutes.tsx`](../src/bom/BomRoutes.tsx)** — BOM-specific routes.
4. **[`src/bom/bomImportProgressState.ts`](../src/bom/bomImportProgressState.ts)** — The import session state machine. Critical for understanding how the flow persists across steps.
5. **[`src/bom/context/BomImportFlowContext.tsx`](../src/bom/context/BomImportFlowContext.tsx)** — React Context wrapping the session state.
6. **[`src/bom/pages/BomSiteProjectsPage.tsx`](../src/bom/pages/BomSiteProjectsPage.tsx)** — BOM entry point. See the upload trigger and project management.
7. **[`src/bom/pages/BomMappingSummaryPage.tsx`](../src/bom/pages/BomMappingSummaryPage.tsx)** — Step 1 gateway. Confidence logic and gating.
8. **[`src/bom/pages/BomMatchingPage.tsx`](../src/bom/pages/BomMatchingPage.tsx)** — Step 3 table. The most complex page.
9. **[`src/bom/pages/BomWorkspacePage.tsx`](../src/bom/pages/BomWorkspacePage.tsx)** — Post-import workspace. Most user interactions live here.
10. **[`src/theme/antdTheme.ts`](../src/theme/antdTheme.ts)** + **[`src/theme/hydraAlias.ts`](../src/theme/hydraAlias.ts)** + **[`src/theme/hydraTypography.ts`](../src/theme/hydraTypography.ts)** — Design system tokens. Understand these before writing any UI.
11. **[`src/bom/bomFieldMappingUtils.ts`](../src/bom/bomFieldMappingUtils.ts)** — Mapping logic (confidence, validation, auto-derive).
12. **[`src/bom/data/mockData.ts`](../src/bom/data/mockData.ts)** — Understand what seed data exists.

---

## Manual QA Checklist

Verify these manually in the browser (`npm run dev`):

### BOM Upload Flow
- [ ] Upload a valid `.xlsx` file from BOM Hub → mapping summary appears with correct confidence
- [ ] Upload a `.txt` file → validation error toast, no navigation
- [ ] Upload a file >50MB → size error toast
- [ ] On mapping summary with `partial` confidence → Continue is enabled, warning alert shown
- [ ] Click "Review columns" → field mapping editor loads with correct initial state
- [ ] Make a change in field mapping editor → Save → returns to mapping summary with updated state
- [ ] Try to Save without required fields → warning message shown, Save blocked
- [ ] Make a duplicate column assignment → Save blocked with error message
- [ ] Continue from mapping summary → parsing review loads with correct table data
- [ ] Open a row drawer in parsing review → all parsed fields shown
- [ ] Continue to matching → arrives at one-by-one review (progressive), first pending line shown
- [ ] Accept a line → moves to next
- [ ] Skip a line → moves to next, skipped count increments
- [ ] "Choose different part" → `BomChoosePartModal` opens
- [ ] Switch to table view → table loads with stats strip
- [ ] Filter by confidence → table filters correctly
- [ ] "Accept all high matches" → only ≥85% confidence pending lines accepted
- [ ] "Save and Import" disabled while pending lines remain → enabled when all accepted/skipped
- [ ] Save and Import → navigates to workspace with accepted lines present
- [ ] Workspace stats strip shows correct counts

### Workspace
- [ ] Empty project workspace → empty state with 3 CTAs shown
- [ ] Double-click a row → Review Modal opens with original + suggested part
- [ ] Confirm match → row status updates to confirmed, modal closes
- [ ] "Choose different part" in modal → AscProductsDrawer opens in swap mode
- [ ] Add item via AscProductsDrawer → new row appears in workspace table
- [ ] Upload file from workspace → confirm modal, then navigates to mapping-summary with append mode
- [ ] Delete a row (single) → confirm modal, row removed, row numbers renumbered
- [ ] Bulk select + Bulk Delete → confirm modal, all selected removed
- [ ] Search filters table correctly
- [ ] Status filter (Confirmed / Needs Review / Missing) filters correctly

### Resume Interrupted Import
- [ ] Open project `6` (Parking Garage Electrical Upgrade) workspace → 3 pending upload strips shown in yellow bar
- [ ] Open project `1` (Hospital Wing) workspace → 1 pending upload strip shown
- [ ] Click "Continue" on a pending strip → navigates to correct step
- [ ] Refresh page mid-flow → still able to resume from workspace

### Navigation
- [ ] Sidebar BOM link → goes to BOM Hub for active project
- [ ] Sidebar "Content" link → goes to product catalog for active project
- [ ] Breadcrumbs update correctly on all BOM pages
- [ ] Back buttons navigate correctly through the upload flow
- [ ] `/bom/projects/999/workspace` (invalid ID) → project not found state shown

### Design
- [ ] Primary buttons are orange
- [ ] Sidebar is dark, main content is light gray
- [ ] Stat strip cards have correct colored left borders (blue/green/orange/red)
- [ ] Tags use correct colors per status
- [ ] Pending uploads region is full-width yellow, flush below breadcrumbs

---

*Last updated: 2026-06-16 — cold read of branch `bom-upload-match-review-plan`.*
