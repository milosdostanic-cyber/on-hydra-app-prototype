# Project Product Catalog Home (`/projects/:projectId/content`)

**Canonical URL (demo):** [http://localhost:5173/projects/1/content](http://localhost:5173/projects/1/content)  
**Route:** `/projects/:projectId/content` (index)  
**Page component:** [`ProductCatalogContent`](../../src/shell/content/ProductCatalogContent.tsx)  
**Verified against:** branch `milos-feature-parts-updates`, commit `5a7c724`

This document describes **only** the project Content catalog landing page and how users reach it via app navigation. Deeper catalog routes (search, subcategory hub, product line, variants) are mentioned only as **exit targets** from this page.

---

## Page Overview

### Purpose

The **Product Catalog home** for a project: search the catalog, open curated **featured parts**, or browse by **category**. It is the default module view when opening a project workspace (`/projects/:id` redirects here).

### User problem

Find and open BIM-ready parts in the context of a job site (project), without leaving the ConnectED shell.

### Role in the product

| Area | Relationship |
|------|----------------|
| **Content module** | Default home for `/projects/:projectId/content/*` |
| **Left sidebar “Content”** | Primary navbar entry to this page (see [Navigation](#navigation)) |
| **Global `/catalog`** | Separate flow (cut sheets, no project); not this page |
| **Spec / Submittal** | Sibling modules via sidebar; no module tabs shown on this route |

For project `1`, the seed name is **Downtown Convention Center** ([`projectSeed.ts`](../../src/shell/projectSeed.ts)).

---

## Navigation

Navigation to this page is a first-class requirement. Users should always be able to return to `http://localhost:5173/projects/{projectId}/content` from the shell.

### Primary: left sidebar (navbar)

The app **navbar** is the dark left sidebar ([`AppShellSidebar`](../../src/shell/AppShellSidebar.tsx)).

| Item | When active | Target |
|------|-------------|--------|
| **Content** (`ReadOutlined`) | Any path matching `/projects/:id/content` | `/projects/{projectId}/content` |

**How `projectId` is chosen when clicking Content:**

1. `:projectId` from the current URL if the path is `/projects/:id/...`
2. Otherwise the last segment from `/projects/:id/...` in the pathname
3. Otherwise [`getLastScopedProjectId()`](../../src/shell/lastProjectScope.ts) (`sessionStorage` `hydra:lastProjectId`, default **`1`**)

So from **Projects**, **BOM**, or **Dashboard**, **Content** opens the catalog for the **last opened project** (typically project `1` in a fresh session). While already on `/projects/1/content/...`, **Content** keeps project `1` in the URL.

Menu tooltip (accessibility): *“Product catalog for the current project”*.

### Top bar (context, not a second navbar)

[`AppTopBar`](../../src/shell/AppTopBar.tsx) on this route shows:

- **Title:** Content  
- **Subtitle:** Product catalog, parts, and BIM-ready content  
- **Project switcher:** opens a modal; choosing another project **updates the URL** to `/projects/{newId}/content` when the user is already on a Content route (catalog stays in sync with the selected project).

### Breadcrumbs

Below the top bar:

```text
App  >  Content  >  Home
```

- **App** → `/projects`  
- **Content** → label only (current module)  
- **Home** → current page (not a link on the index)

On child catalog routes, **Home** links back to `/projects/:projectId/content`.

### Other entry points

| Entry | Result |
|-------|--------|
| `/projects/:id` (index) | Redirect to `/projects/:id/content` |
| Projects table → create project | Navigate to `/projects/{newId}/content` |
| Project drawer → **Content** card or **Open full workspace** | `/projects/{id}/content` |
| Project drawer module list | First module is **Content** → same path |

---

## Page Structure

Layout: **app shell** (sidebar + top bar + breadcrumbs) + **full-bleed page body**.

### 1. Hero (full width)

- Background: `/content-catalog-hero-bg.png` + gradient overlay  
- Heading: **Get Production Level BIM Content**  
- **Search** input (placeholder: *Search by System, Part Number, or Trade*) + primary **Search** button  
- Tags: *Native Content*, *Trusted Data*, *Open, Free, Unlocked*

### 2. Featured parts (index only)

Rendered only on the exact path `/projects/:projectId/content` (not on search or category child routes).

| Block | Description |
|-------|-------------|
| Header | “Featured parts” + count (“N curated highlights”) |
| Intro | Explains that opening a card goes to that part’s **variants table** in this catalog |
| Grid | Up to **6** cards per view; responsive columns |
| Pager | Prev / next + `page / total` when more than 6 items |

**Card data (intended source):**  
Featured cards are loaded from:

```http
GET http://localhost:3003/content/featured-parts
```

**Prototype in this repo:** No `fetch` to port 3003. Cards use [`featuredPartsConfig.ts`](../../src/catalog/featuredPartsConfig.ts) + [`catalogDemoData.ts`](../../src/catalog/catalogDemoData.ts) and optional `localStorage` key `hydra.featuredPartKeys.v1`. Wire the API in the Content MFE when the backend is available.

### 3. Divider

Between featured and categories (when featured section is shown).

### 4. Categories

- Section title **Categories** + primary **Download All Content** (stub toast)  
- **Four** category cards from [`PRODUCT_CATALOG_CATEGORIES`](../../src/catalog/productCatalogHierarchy.demo.ts):

| Category | Total parts (display) | Subcategories shown |
|----------|----------------------|---------------------|
| Flow Control | 397 | Industrial Valves… (160), Commercial and Residential… (237) |
| Pipe Joining Systems | 1,065 | Pipe Fittings (620) |
| Fire Protection and Fabrication Products | 311 | Grooved (105) |
| Support Systems | 690 | Pipe Hangers and Supports (661) |

Each card: header (title, “N parts” label, per-card download stub), **Categories Overview** chips, footer link **View all {category} parts**.

Counts are marketing-scale; deep lists in the demo file are small ([`product-catalog-navigation-flow.md`](../prd/product-catalog-navigation-flow.md)).

---

## Functionalities

### Hero search

- Type query → **Enter** or **Search**  
- Navigates to `/projects/:projectId/content/search?q={query}` (empty query → `q=all`)

### Featured card

- Click card → part **variants** route when the part key is in [`featuredPartContentListing.ts`](../../src/catalog/featuredPartContentListing.ts) (`p-100` … `p-1000`)  
- Unmapped demo keys (`p-2011` … `p-2030`) fall back to `/catalog/parts/:key` (prototype gap)

### Featured pagination

- Local state only; does not change the URL

### Category subcategory chip

- Navigates to `/projects/:projectId/content/category/:categoryId/sub/:subcategoryId`

### View all … parts

- Navigates to `/projects/:projectId/content/category/:categoryId/all-parts`

### Download buttons

- `message.info('Stub: download would start.')` — no file download

### Sidebar **Content**

- Always navigates to `/projects/{resolvedProjectId}/content` (see [Navigation](#navigation))

---

## Main User Flows

### Open the page

1. Click **Content** in the left sidebar → `/projects/1/content` (with default/last project).  
2. Or open a project → auto-redirect to `…/content`.  
3. Or use the project drawer → **Content** / **Open full workspace**.

### Use the page

1. **Search** from the hero → search results route.  
2. **Featured card** → variants table for mapped parts.  
3. **Subcategory chip** → hub → (user continues in child routes).  
4. **View all … parts** → flat category list.

Returning to this home: breadcrumb **Home**, sidebar **Content**, or browser back from a child route.

---

## Data Displayed

### Featured card (UI fields)

| Field | Prototype source | Expected from `GET …/content/featured-parts` |
|-------|------------------|-----------------------------------------------|
| Title | `sku` | Figure number / short title |
| Subtitle | `featuredCardSubtitle` or `description` | Description |
| Image | `featuredImageUrl` | `imageUrl` on content part |
| Route key | `key` | Part id for navigation |

### Category card

| Field | Source |
|-------|--------|
| Title | `DemoCategory.title` |
| Total parts | `DemoCategory.totalParts` |
| Chip label | `sub.label` + `sub.partCount` |

### Project

| Field | Source |
|-------|--------|
| `projectId` | URL param |
| Name in shell | `projectSeed` / `ActiveProjectContext` (synced in [`ProjectWorkspaceLayout`](../../src/shell/ProjectWorkspaceLayout.tsx)) |

---

## Interactive Elements

| Element | Action |
|---------|--------|
| Sidebar **Content** | Go to `/projects/{id}/content` |
| Search input / button | Go to search route |
| Featured card | Variants or global part page |
| Featured prev/next | Change featured page |
| Subcategory chip | Subcategory hub |
| View all … parts | Category all-parts |
| Download (any) | Stub toast |
| Top bar project switcher | Change project; on Content routes also changes URL to `…/content` |

---

## UI States and Conditions

| Condition | Behavior |
|-----------|----------|
| Path is exactly `…/content` | Featured section + divider visible |
| Path is `…/content/search` (etc.) | Featured hidden |
| Fewer than 3 featured rows resolve | Empty state with admin hint |
| More than 6 featured rows | Pagination controls |
| Hover/focus featured card | Primary border + stronger shadow |
| Content index path | Hero full-bleed (no side padding on main column) |

No loading/error UI for featured data in the prototype.

---

## Technical Implementation Notes

### Route tree

```text
App.tsx
└── AppShell
    └── ProjectWorkspaceLayout  (syncs projectId + lastScopedProjectId)
        └── ContentModule (Outlet)
            └── index → ProductCatalogContent
```

### Key files

| File | Role |
|------|------|
| [`ProductCatalogContent.tsx`](../../src/shell/content/ProductCatalogContent.tsx) | Page UI |
| [`FeaturedParts.tsx`](../../src/catalog/FeaturedParts.tsx) | Featured grid + paging |
| [`AppShellSidebar.tsx`](../../src/shell/AppShellSidebar.tsx) | **Content** navbar link + `resolveSidebarProjectId` |
| [`AppTopBar.tsx`](../../src/shell/AppTopBar.tsx) | Title + project switcher navigation on Content routes |
| [`lastProjectScope.ts`](../../src/shell/lastProjectScope.ts) | Last project for sidebar when URL has no `:projectId` |
| [`productCatalogNavigation.ts`](../../src/catalog/productCatalogNavigation.ts) | Path helpers + breadcrumbs |

### Hooks on the page

`useParams` (`projectId`), `useNavigate`, `useLocation`, `useState` (search draft), `useSyncExternalStore` (featured keys).

### Stubs / gaps

- Category and featured data: demo JSON / localStorage, not live APIs except featured endpoint **documented** for integration.  
- Downloads: toast only.  
- Featured keys `p-2011`–`p-2030`: no project content route mapping.

---

## UX / Product Notes

**Works well**

- Sidebar **Content** is always available and highlights on all `…/content` routes.  
- Project `1` opens a complete catalog home (hero, featured, categories).  
- Single clear primary action in the hero (Search).  
- Breadcrumb **Home** anchors the user on child pages.

**Watch out**

- Unmapped featured cards leave project context (`/catalog/parts/…`).  
- “N parts” on category headers looks clickable but is not.  
- Download buttons look real but are stubs.

---

## Open Questions / Things That Need Clarification

1. **`GET http://localhost:3003/content/featured-parts`** — confirm response shape and how each item resolves to `/projects/:id/content/.../parts`.  
2. Should sidebar label stay **Content** or become **Product catalog** for clarity?  
3. Should category **“N parts”** navigate to **View all … parts**?  
4. When should downloads be implemented vs. hidden on this page?
