# Nav IA reorganization — existing screens only

**Branch:** `refactor/nav-ia-reorg`  
**Rule:** No new screens. No placeholders for Revit Plug-in / Knowledge Center (none exist).

## Phase 3 — Corrected mapping (wired + orphans)

| Screen | Path | Current route | Current nav | Purpose | Target nav | Action |
|--------|------|---------------|-------------|---------|------------|--------|
| HomeHubPage | `shell/HomeHubPage.tsx` | `/dashboard` | Homepage | Home hub | Home | rename nav label |
| UnifiedSearchResultsPage | `search/UnifiedSearchResultsPage.tsx` | `/search/results` | Part Search | Product/cross search | Part Search | keep |
| UnifiedPartDetailPage | `search/UnifiedPartDetailPage.tsx` | `/search/parts/:id` | Part Search | Part detail | Part Search | keep (shared) |
| CatalogHome | `shell/CatalogHome.tsx` | `/catalog` | Catalog | Catalog browse | Part Search | remove Catalog nav; active=Part Search |
| CatalogResultsRedirect | `App.tsx` | `/catalog/results` | Catalog | → search | Part Search | keep redirect |
| CatalogPartRedirect | `App.tsx` | `/catalog/parts/:id` | Catalog | → part detail | Part Search | keep redirect |
| ProductCatalogContent | `shell/content/ProductCatalogContent.tsx` | unwired (was content) | — | BIM catalog hub | Part Search | reconnect under `/projects/:id/catalog` |
| ProductCatalogSearchPage | `shell/content/…` | unwired | — | Catalog search | Part Search | reconnect |
| SubcategoryHubPage | `shell/content/…` | unwired | — | Subcategory hub | Part Search | reconnect |
| CategoryAllPartsPage | `shell/content/…` | unwired | — | Category all parts | Part Search | reconnect |
| ProductLinePartsPage | `shell/content/…` | unwired | — | Product line | Part Search | reconnect |
| PartVariantsPage | `shell/content/…` | unwired | — | Variants list | Part Search | reconnect |
| PartVariantDetailPage | `shell/content/…` | unwired | — | Variant detail | Part Search | reconnect |
| ContentModule | `shell/ProjectModuleStubs.tsx` | `/projects/:id/content` | Download Center | Download history | Content | rename nav; strip cross-module entry cards |
| SalesBraceModule | `shell/ProjectModuleStubs.tsx` | `/projects/:id/sales-brace` | Spec | Spec stub | Spec | keep |
| SubmittalPackagesPage | `submittal/…` | `/projects/:id/submittal` | Submittal | Packages | Submittal Manager | rename nav |
| SeisBraceLandingPage | `seisbrace/…` | `/seisbrace` | SeisBrace (via stub) | Designs hub | SeisBrace | sidebar → `/seisbrace`; fix active |
| WizardPage | `seisbrace/…` | `/seisbrace/wizard/:step` | SeisBrace | Wizard | SeisBrace | keep |
| Bom* pages | `bom/pages/*` | `/bom/*` | BOM | BOM flow | BOM | keep |
| Revit Plug-in | — | — | — | — | — | **omit** (no screen) |
| Knowledge Center | — | — | — | — | — | **omit** (no screen) |

### Orphans left unwired (not product discovery / not target nav)

| Screen | Action |
|--------|--------|
| ShellHomeContent, ProjectDetailDrawer, DashboardPlaceholder | keep unused (no new route) |
| ProjectReframingProposal* | keep unused |
| CatalogResults, CatalogPartPage | keep as dead code; redirects already replace |

## Files to change

- `src/shell/AppShellSidebar.tsx`
- `src/App.tsx` (catalog nested routes + content/catalog redirects)
- `src/catalog/productCatalogNavigation.ts`
- `src/shell/buildAppBreadcrumbItems.tsx`
- `src/shell/AppShell.tsx` (full-bleed path)
- `src/shell/ProjectModuleStubs.tsx` (Content cleanup + title)
- `src/shell/ProjectWorkspaceLayout.tsx` (Content label)
- `src/shell/HomeHubPage.tsx` (Catalog CTA → Part Search ownership)
- `src/shell/AppTopBar.tsx` if needed
- `src/bom/pages/BomSearchPage.tsx` (`/catalog/results` → `/search/results`)

## Sidebar target (existing only)

1. Home → `/dashboard`  
2. Part Search → `/search/results?q=all` (also active on `/catalog`, `/projects/:id/catalog`)  
3. Content → `/projects/:lastPid/content`  
4. BOM → `/bom`  
5. Spec → `/projects/:lastPid/sales-brace`  
6. SeisBrace → `/seisbrace`  
7. Submittal Manager → `/projects/:lastPid/submittal`  

Omit: Revit Plug-in, Knowledge Center.
