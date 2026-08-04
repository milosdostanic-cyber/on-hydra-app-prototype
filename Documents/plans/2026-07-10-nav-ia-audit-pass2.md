# Nav IA audit — 2026-07-10 (pass 2)

## Current sitemap (post prior reorg)

| Nav | Route(s) | Screen |
|-----|----------|--------|
| Home | `/dashboard` | HomeHubPage (tab default was **recent** — gap) |
| Part Search | `/search/*`, `/catalog`, `/projects/:id/catalog/*` | Unified search/detail + CatalogHome + ProductCatalog* |
| Content | `/projects/:id/content` | ContentModule (downloads) |
| BOM | `/bom/*` | BomRoutes |
| Spec | `/projects/:id/sales-brace` | SalesBraceModule stub |
| SeisBrace | `/seisbrace/*` | Landing + wizard |
| Submittal Manager | `/projects/:id/submittal` | SubmittalPackagesPage |
| Revit Plug-in | `/revit-plugin` | Spec-style stub only |
| Knowledge Center | `/knowledge-center` | Spec-style stub only |

## Gaps vs this prompt

| Gap | Required change |
|-----|-----------------|
| Home tab defaults to `recent` | Default `all` — all-projects landing |
| Content crumb = Home / Project / Content | → Content / Project / Download center |
| Spec/Submittal/Seis crumbs start with Home | → Module / Project / … |
| Catalog crumbs use “Catalog” not “Home” | Part Search / Home / … |
| AppTopBar `GlobalSearch` experimental header | Remove entry (keep Part Search flows) |
| Content page title “Content” | Title “Download center” (nav label stays Content) |
| Revit / Knowledge real product screens | REPORT GAP (stubs only; keep nav per prior ask) |

## Files to modify

- `HomeHubPage.tsx` — default tab
- `buildAppBreadcrumbItems.tsx` — ownership crumbs
- `productCatalogNavigation.ts` — Part Search / Home segments
- `AppTopBar.tsx` — remove GlobalSearch
- `ProjectModuleStubs.tsx` — Content page title
