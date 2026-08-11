# Hydra app — validated capabilities map

**Purpose:** Single canonical reference for **adopted** product structure (routes, shell navigation, and what each area is intended to do). Agents and humans use this before PRD-driven work so implementations stay aligned with what the prototype is meant to contain.

**Authority:** This file is updated when behavior or navigation is **merged as product intent**. If code and this document disagree after a merge, **fix the document in the same PR** (or follow up immediately). Do not expand scope in Cursor without updating this map.

**Last updated:** 2026-05-14

**Deeper BOM UX audit (supplement, not duplicate):** [Documents/Bom/app-userflow-audit.md](../Documents/Bom/app-userflow-audit.md)

---

## Global shell

- All routes below render inside **`AppShell`** (sidebar + chrome) except where noted.
- **Providers:** theme (`HydraThemeProvider`), `ActiveProjectContext`, `BomWorkspaceContext`, `SubmittalDraftProvider` (`src/main.tsx`).

---

## Primary sidebar navigation

Sidebar labels and their **default navigation targets** (from `AppShellSidebar`; project-scoped links use last scoped project id when available):

| Sidebar label | Typical path | Notes |
|---------------|--------------|--------|
| Homepage | `/dashboard` | Placeholder hub. |
| Projects | `/projects` | Project list / shell home content. |
| SeisBrace | `/projects/:projectId/seis-brace` | **Stub** module (`ProjectModuleStubs`). |
| Spec | `/projects/:projectId/sales-brace` | **Stub** (“Sales brace” copy in shell). |
| Submittal | `/projects/:projectId/submittal` | Submittal draft list per project (not a dead stub). |
| Catalog | `/catalog` | Global catalog (not per-project); **Featured parts** row on landing (**prototype:** mock / `localStorage`; **production:** public GET from backend, rendered in Content MFE). |
| BOM | `/bom` | Full nested BOM app under `/bom/*`. |
| Content | `/projects/:projectId/content` | Project workspace **Content Search** (product catalog UI): **Featured parts** between search and **Categories**; catalog search links to `/catalog/results`; cards link to `/catalog/parts/:partId`. |

---

## Top-level routes (`src/App.tsx`)

| Path | Purpose |
|------|---------|
| `/` | Redirect → `/projects`. |
| `/dashboard` | Homepage placeholder. |
| `/projects` | Projects landing / list. |
| `/catalog` | Catalog home. |
| `/catalog/results` | Catalog search results. |
| `/catalog/parts/:partId` | Part detail. |
| `/bom/*` | Delegated to `BomRoutes` (see below). |
| `/projects/:projectId/*` | Project workspace (`ProjectWorkspaceLayout`). |

### Featured parts (global, 3–10)

- **PRD (mirror):** [Documentation/prd/featured-parts.md](./prd/featured-parts.md) — PRD body, prototype decisions, **PM umbrella placement** (Matt). **Kickoff for AI / next steps:** [featured-parts-implementation-brief.md](./prd/featured-parts-implementation-brief.md).
- **Adopted UI:** Responsive **Row/Col** card grid (no horizontal scroll); **prototype** uses `featuredPartsConfig` + optional `localStorage` and static tile images under `public/assets/catalog/featured-tiles/` until **on-hydra-backend** public GET and **on-hydra-frontend-content** ship. **Admin** management UI: **`on-hydra-admin-frontend`** → Content → Featured parts (not this repo). **FR-2** (min 3, max 10): enforced in UI for demos; **backend service** is canonical when integrated.
- **Surfaces (umbrella prototype):** **`/catalog`** (`CatalogHome`) **and** project **`/projects/:projectId/content`** root (`ProductCatalogContent`): row sits **between** the **search bar** and **Categories** (project) or quick category chips (global catalog). **Not** shown on `/catalog/results`, nested content routes (when added), or category drill-in views.
- **Navigation (FR-6 / PM):** Each card links to **`/catalog/parts/:partId`** (part detail in this prototype; Content MFE must use the **real** Part Detail route — see implementation brief routing risk).
- **Code (prototype):** `src/catalog/FeaturedParts.tsx`, `src/catalog/featuredPartsConfig.ts`, `src/catalog/catalogDemoData.ts`; composition in `src/shell/CatalogHome.tsx` and `src/shell/content/ProductCatalogContent.tsx`.

---

## Project workspace (`/projects/:projectId/...`)

| Path | Purpose |
|------|---------|
| `/projects/:projectId` | Index redirect → `content`. |
| `content` | Default hub module (`ContentModule`). |
| `seis-brace` | SeisBrace stub. |
| `sales-brace` | Spec / sales-brace stub. |
| `submittal` | Submittal manager (draft lines). |

---

## BOM module (`/bom/*`, `src/bom/BomRoutes.tsx`)

| Path | Purpose |
|------|---------|
| `/bom` | BOM landing. |
| `/bom/search` | BOM search. |
| `/bom/projects/:bomProjectId/parsing-review` | Parsing review. |
| `/bom/projects/:bomProjectId/matching` | Matching results. |
| `/bom/projects/:bomProjectId/items/:itemId/narrow` | Guided narrowing. |
| `/bom/projects/:bomProjectId/items/:itemId/recommend` | Recommended result. |
| `/bom/projects/:bomProjectId/workspace` | BOM workspace. |
| `/bom/projects/:bomProjectId/asc-products` | ASC products (canonical catalog experience for BOM project). |
| `/bom/projects/:bomProjectId/catalog` | Redirect → `asc-products`. |
| `/bom/projects/:bomProjectId/translate` | Translate screen (reachable by URL / flow links; not a top-level sidebar item). |
| `/bom/projects/:bomProjectId/field-mapping` | Field mapping (reachable by URL / flow links). |
| `/bom/projects/:bomProjectId/export` | Export. |
| `/bom/projects/:bomProjectId/service-request` | Service request. |
| Unknown under `/bom` | Fallback redirect → `/bom`. |

---

## Breadcrumbs / edge naming

- `buildAppBreadcrumbItems` includes a branch for `/projects/reframing-proposal`, but **no such route is registered in `App.tsx` today**. Treat as non-canonical unless a route is added and this document is updated.

---

## Maintenance rules

1. **New route, renamed flow, or new sidebar item:** update this file in the **same PR** as the code.
2. **Intentional stub → real feature:** change the **Notes** column and any **Stub** labels here.
3. **PRD work:** agents read this file first (see `hydra-prd-ux-playbook.mdc`). Proposals must not invent flagship flows that contradict this map without explicit product approval and a map update.

---

## PRD storage

Product requirement docs linked or stored under **[Documentation/prd/](./prd/)** (see `prd/README.md`). Prefer a stable **ID or filename** in chat when requesting PRD-based implementation.

**Featured Parts:** [prd/featured-parts.md](./prd/featured-parts.md).
