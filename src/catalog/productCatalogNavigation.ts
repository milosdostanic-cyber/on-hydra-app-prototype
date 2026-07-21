import {
  catalogCategoryById,
  catalogLeafPart,
  catalogProductLine,
  catalogSubcategory,
} from './productCatalogHierarchy.demo';

export type ProductCatalogBreadcrumbSeg = { label: string; to?: string };

export function productCatalogHomePath(projectId: string): string {
  return `/projects/${projectId}/catalog`;
}

export function productCatalogHubPath(
  projectId: string,
  categoryId: string,
  subcategoryId: string,
): string {
  return `${productCatalogHomePath(projectId)}/category/${categoryId}/sub/${subcategoryId}`;
}

export function productCatalogLinePath(
  projectId: string,
  categoryId: string,
  subcategoryId: string,
  productLineId: string,
): string {
  return `${productCatalogHubPath(projectId, categoryId, subcategoryId)}/line/${productLineId}`;
}

export function productCatalogPartVariantsPath(
  projectId: string,
  categoryId: string,
  subcategoryId: string,
  productLineId: string,
  partId: string,
): string {
  return `${productCatalogLinePath(projectId, categoryId, subcategoryId, productLineId)}/part/${partId}/parts`;
}

export function productCatalogVariantDetailPath(
  projectId: string,
  categoryId: string,
  subcategoryId: string,
  productLineId: string,
  partId: string,
  variantId: string,
): string {
  return `${productCatalogLinePath(projectId, categoryId, subcategoryId, productLineId)}/part/${partId}/variant/${variantId}`;
}

export function productCatalogCategoryAllPartsPath(projectId: string, categoryId: string): string {
  return `${productCatalogHomePath(projectId)}/category/${categoryId}/all-parts`;
}

export function productCatalogSearchPath(projectId: string, query: string): string {
  const q = query.trim() || 'all';
  return `${productCatalogHomePath(projectId)}/search?q=${encodeURIComponent(q)}`;
}

/**
 * Breadcrumb trail for `/projects/:id/catalog/*` (Part Search product hierarchy).
 * Returns `null` when pathname is not under project product catalog.
 */
export function buildProductCatalogBreadcrumbSegments(
  pathname: string,
  projectId: string,
): ProductCatalogBreadcrumbSeg[] | null {
  const base = productCatalogHomePath(projectId);
  if (!pathname.startsWith(base)) return null;

  const tail = pathname.slice(base.length).replace(/^\/+/, '');
  const moduleSeg = { label: 'Part Search', to: base } as const;
  const homeSeg = { label: 'Home', to: base } as const;

  if (!tail || tail === '') {
    return [moduleSeg, { label: 'Home' }];
  }

  if (tail.startsWith('search')) {
    return [moduleSeg, homeSeg, { label: 'Search results' }];
  }

  const allPartsMatch = /^category\/([^/]+)\/all-parts$/.exec(tail);
  if (allPartsMatch) {
    const categoryId = allPartsMatch[1];
    const cat = catalogCategoryById(categoryId);
    return [moduleSeg, homeSeg, { label: cat?.title ?? 'Category' }, { label: 'All parts' }];
  }

  const hubMatch = /^category\/([^/]+)\/sub\/([^/]+)$/.exec(tail);
  if (hubMatch) {
    const [, categoryId, subcategoryId] = hubMatch;
    const sub = catalogSubcategory(categoryId, subcategoryId);
    return [moduleSeg, homeSeg, { label: sub?.label ?? 'Subcategory' }];
  }

  const lineMatch = /^category\/([^/]+)\/sub\/([^/]+)\/line\/([^/]+)$/.exec(tail);
  if (lineMatch) {
    const [, categoryId, subcategoryId, lineId] = lineMatch;
    const sub = catalogSubcategory(categoryId, subcategoryId);
    const line = catalogProductLine(categoryId, subcategoryId, lineId);
    return [
      moduleSeg,
      homeSeg,
      { label: sub?.label ?? 'Subcategory', to: productCatalogHubPath(projectId, categoryId, subcategoryId) },
      { label: line?.name ?? 'Product line' },
    ];
  }

  const partsMatch = /^category\/([^/]+)\/sub\/([^/]+)\/line\/([^/]+)\/part\/([^/]+)\/parts$/.exec(tail);
  if (partsMatch) {
    const [, categoryId, subcategoryId, lineId, partId] = partsMatch;
    const sub = catalogSubcategory(categoryId, subcategoryId);
    const line = catalogProductLine(categoryId, subcategoryId, lineId);
    const part = catalogLeafPart(categoryId, subcategoryId, lineId, partId);
    const linePath = productCatalogLinePath(projectId, categoryId, subcategoryId, lineId);
    return [
      moduleSeg,
      homeSeg,
      { label: sub?.label ?? 'Subcategory', to: productCatalogHubPath(projectId, categoryId, subcategoryId) },
      { label: line?.name ?? 'Product line', to: linePath },
      { label: part?.name ?? 'Parts' },
    ];
  }

  const variantMatch =
    /^category\/([^/]+)\/sub\/([^/]+)\/line\/([^/]+)\/part\/([^/]+)\/variant\/([^/]+)$/.exec(tail);
  if (variantMatch) {
    const [, categoryId, subcategoryId, lineId, partId] = variantMatch;
    const sub = catalogSubcategory(categoryId, subcategoryId);
    const line = catalogProductLine(categoryId, subcategoryId, lineId);
    const part = catalogLeafPart(categoryId, subcategoryId, lineId, partId);
    const linePath = productCatalogLinePath(projectId, categoryId, subcategoryId, lineId);
    return [
      moduleSeg,
      homeSeg,
      { label: sub?.label ?? 'Subcategory', to: productCatalogHubPath(projectId, categoryId, subcategoryId) },
      { label: line?.name ?? 'Product line', to: linePath },
      { label: part?.name ?? 'Part' },
    ];
  }

  return null;
}
