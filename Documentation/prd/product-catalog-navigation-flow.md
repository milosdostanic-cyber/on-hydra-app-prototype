# Product catalog navigation (Content module)

This document describes the **prototype** browse flow under **Project → Content** (`/projects/:projectId/content`). Data lives in [`src/catalog/productCatalogHierarchy.demo.ts`](../../src/catalog/productCatalogHierarchy.demo.ts); URL helpers in [`src/catalog/productCatalogNavigation.ts`](../../src/catalog/productCatalogNavigation.ts).

## User flow

1. **Home** — Hero search, featured parts (unchanged), category cards with total part counts and subcategory chips (`Label (count)`).
2. **Subcategory hub** — Click a chip → table **Name / Description / Part Count** (product lines).
3. **Product line** — Click a row → leaf parts **Name (thumbnail placeholder) / Figure Number / Description**.
4. **Variants (“Parts”)** — Click a part → variant rows with the same three-column pattern; title area shows part count actions (stubs).
5. **Variant detail** — Click a variant → full layout when demo `detail` exists (e.g. **Loop Clutch** under Support Systems → Pipe Hangers and Supports → Cable Hangers); otherwise a short stub card.
6. **View all … parts** — Footer on each category card → flattened leaf parts for that category (paginated).
7. **Search** — Hero **Search** → `/content/search?q=…` across all leaf parts in the demo hierarchy (try query **`fire`**).

Global **`/catalog/*`** (Matt cut-sheet flow) is unchanged.

## Route map

| Path (under `…/content`) | Screen |
|--------------------------|--------|
| `/` (index) | Product catalog home |
| `category/:categoryId/sub/:subcategoryId` | Hub table |
| `category/:categoryId/sub/:subcategoryId/line/:productLineId` | Leaf parts |
| `…/line/:productLineId/part/:partId/parts` | Variants |
| `…/part/:partId/variant/:variantId` | Variant detail |
| `category/:categoryId/all-parts` | All parts in category |
| `search?q=` | Search results |

## Breadcrumbs

Shell breadcrumbs use **Content / Home / …** with `Home` linking back to the catalog index. Implemented in [`buildProductCatalogBreadcrumbSegments`](../../src/catalog/productCatalogNavigation.ts) and wired from [`buildAppBreadcrumbItems`](../shell/buildAppBreadcrumbItems.tsx).

## Visual rules

- No ad-hoc hex: tables and placeholders use **antd `theme.useToken()`** only.
- Thumbnails: [`CatalogThumbnailPlaceholder`](../../src/catalog/CatalogThumbnailPlaceholder.tsx) when no image URL exists.

## Scale note

Production scale (~2.5k parts, ~65k variants) is **not** mirrored in JSON; counts on cards match reference marketing numbers while **row lists stay small** for the prototype.
