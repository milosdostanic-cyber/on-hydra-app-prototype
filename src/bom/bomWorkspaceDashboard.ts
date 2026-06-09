import type { BomItem, BomItemMatchStatus } from './data/types';

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
