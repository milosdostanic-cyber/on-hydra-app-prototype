import { getSkuVariantsForFigure } from './data/ascSkuVariants';
import type { AscCatalogPart, BomItem, BomItemMatchStatus } from './data/types';

/** Demo submittal PDF used when no figure-specific demo document is available. */
export const BOM_DEMO_SUBMITTAL_PDF_URL =
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

/**
 * Distinct demo submittal documents per parent figure family so the prototype
 * does not link every SKU to the same placeholder PDF (helps "verify parent family").
 */
const BOM_DEMO_SUBMITTAL_BY_FIGURE: Record<string, string> = {
  FP7450: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
  'ASC-SR-155-TH': 'https://www.africau.edu/images/default/sample.pdf',
  'ASC-GV-600-FL': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  'CV-400-GR': 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
};

/** Demo catalog thumbnails keyed by figure family for guided matching review. */
const BOM_DEMO_IMAGE_BY_FIGURE: Record<string, string> = {
  FP7450: '/assets/catalog/featured-tiles/groove-group.png',
  'ASC-SR-155-TH': '/assets/catalog/featured-tiles/sf-17-thumbnail.png',
  'ASC-GV-600-FL': '/assets/catalog/figma-featured-parts/600-f.png',
  'GV-600-FL': '/assets/catalog/figma-featured-parts/600-f.png',
  'CV-400-GR': '/assets/catalog/figma-featured-parts/300-c.png',
  'AHV-250-TH': '/assets/catalog/featured-tiles/angle-hose-valve.png',
};

/** Demo submittal document for a figure family (falls back to the generic dummy PDF). */
/** Demo product page URL for verifying a figure family in the catalog. */
export function demoProductUrlForFigure(figureNumber: string | undefined): string | undefined {
  const key = figureNumber?.trim();
  if (!key) return undefined;
  return `/catalog/parts/${encodeURIComponent(key)}`;
}

export function demoSubmittalUrlForFigure(figureNumber: string | undefined): string {
  const key = figureNumber?.trim();
  if (key && BOM_DEMO_SUBMITTAL_BY_FIGURE[key]) return BOM_DEMO_SUBMITTAL_BY_FIGURE[key];
  return BOM_DEMO_SUBMITTAL_PDF_URL;
}

export function demoCatalogImageForFigure(figureNumber: string | undefined): string | undefined {
  const key = figureNumber?.trim();
  if (!key) return undefined;
  return BOM_DEMO_IMAGE_BY_FIGURE[key];
}

export function demoCatalogImageForPart(part: AscCatalogPart): string | undefined {
  if (part.imageUrl?.trim()) return part.imageUrl.trim();
  return demoCatalogImageForFigure(part.figureNumber ?? part.partNumber);
}

/**
 * Returns true only for Domestic ASC parts that have a real catalog page.
 * Import parts do not have ASC product/submittal pages — hide those links in matching UI.
 */
export function ascPartShowsCatalogLinks(part: AscCatalogPart): boolean {
  return demoDomesticImportForPart(part) === 'Domestic';
}

/** Demo domestic/import label for ASC suggestion cards. */
export function demoDomesticImportForPart(part: AscCatalogPart): 'Domestic' | 'Import' | undefined {
  const figure = part.figureNumber ?? part.partNumber;
  const variants = getSkuVariantsForFigure(figure);
  if (variants.length > 0) {
    const skuMatch = variants.find((variant) => variant.sku === part.partNumber);
    if (skuMatch?.domesticImport) return skuMatch.domesticImport;
    return variants[0].domesticImport;
  }
  return part.partNumber.endsWith('1') || part.partNumber.endsWith('3') ? 'Domestic' : 'Import';
}

export function workspaceRowReviewStatus(row: BomItem): BomItemMatchStatus {
  if (row.status === 'confirmed' || row.status === 'needs-review' || row.status === 'matched' || row.status === 'pending') {
    return row.status;
  }
  return 'pending';
}

export function workspaceAscProductsPath(bomProjectId: string): string {
  return `/bom/projects/${bomProjectId}/asc-products`;
}

export function workspaceFigureLinkState(figureNumber: string): { catalogSearch: string } {
  return { catalogSearch: figureNumber };
}

export function resolveWorkspaceSubmittalUrl(row: BomItem): string | undefined {
  if (row.submittalUrl?.trim()) return row.submittalUrl.trim();
  if (row.sku?.trim()) return demoSubmittalUrlForFigure(row.figureNumber);
  return undefined;
}

export function workspaceSkuDisplayLabel(row: BomItem): string {
  return row.sku?.trim() || '—';
}

export function workspaceQuantityLabel(row: BomItem): string {
  const unit = row.unit?.trim();
  return unit ? `${row.quantity} ${unit}` : String(row.quantity);
}

export function workspaceHasImportMetadata(row: BomItem): boolean {
  return Boolean(
    row.originalInput?.trim() ||
      row.importedDescription?.trim() ||
      row.manufacturer?.trim() ||
      row.upc?.trim() ||
      row.importedRowNumber != null,
  );
}
