/** Domain types for the BOM module (aligned with PM prototype data shapes; Hydra app uses mock data only). */

export type BomProjectStatus = 'draft' | 'in-progress' | 'completed' | 'needs-review' | 'failed' | 'partial';

export interface BomProject {
  id: string;
  /** Key of the parent ProjectRow (construction project). */
  projectId: string;
  name: string;
  description?: string;
  lastEdited: string;
  items: number;
  status: BomProjectStatus;
}

export type BomItemConfidence = 'high' | 'medium' | 'low';

export type BomItemMatchStatus = 'matched' | 'pending' | 'needs-review' | 'confirmed';

export interface BomItem {
  id: string;
  rowNumber: number;
  originalInput: string;
  parsedDescription: string;
  size: string;
  pressureClass: string;
  connectionType: string;
  quantity: number;
  confidence: BomItemConfidence;
  category?: string;
  unit?: string;
  figureNumber?: string;
  sku?: string;
  /** Short variant descriptor (finish, connection) when SKU differs from figure. */
  variantLabel?: string;
  manufacturer?: string;
  upc?: string;
  status?: BomItemMatchStatus;
  /** How the ASC line was matched during import review. */
  matchSource?: BomMatchSource;
  /** Demo submittal / datasheet URL when available for the selected SKU. */
  submittalUrl?: string;
  /** Parsed competitor description preserved from the import file. */
  importedDescription?: string;
  /** Source row number from the uploaded BOM file. */
  importedRowNumber?: number;
}

export type BomParsingReviewColumnProfile = 'description' | 'sku-only' | 'upc';

export type BomImportStep = 'map' | 'review' | 'match' | 'done';

export interface BomImportProgress {
  uploadId: string;
  fileName: string;
  bomProjectId: string;
  currentStep: BomImportStep;
  totalAscFields: number;
  mappedAscFields: number;
  totalRows: number;
  parsedRows: number;
  matchedRows: number;
  acceptedCount: number;
  skippedCount: number;
  manualCount: number;
  startedAt: string;
  lastUpdatedAt: string;
}

export type BomMatchLineStatus = 'pending' | 'accepted' | 'skipped';

export type BomMatchSource = 'auto' | 'manual';

export type BomMatchScoreBand = 'high' | 'medium' | 'low' | 'processing';

export type AscSubstitutionRisk = 'low' | 'medium' | 'high';

/** Whether the matcher returned a sellable SKU or only a parent figure number. */
export type BomMatchLevel = 'sku' | 'figure';

export interface AscSkuVariant {
  id: string;
  figureNumber: string;
  sku: string;
  description: string;
  size: string;
  finish?: string;
  domesticImport?: 'Domestic' | 'Import';
  painted?: 'Painted' | 'Unpainted';
  pressureRating?: string;
  connectionType?: string;
}

export interface AscCatalogPart {
  partNumber: string;
  productFamily: string;
  description: string;
  dimensions: string;
  pressureRating: string;
  connectionType: string;
  imageUrl?: string;
  approvals: string[];
  matchConfidence: number;
  matchedAttributes: string[];
  ignoredAttributes: string[];
  conversionRule: string;
  substitutionRisk: AscSubstitutionRisk;
  /** Parent figure when `matchLevel` is figure-only or after SKU resolve. */
  figureNumber?: string;
  matchLevel?: BomMatchLevel;
}

export interface BomMatchResult {
  itemId: string;
  originalRequest: string;
  suggestedParts: AscCatalogPart[];
  topMatch?: AscCatalogPart;
  lineStatus: BomMatchLineStatus;
  source: BomMatchSource;
  /** Figure-level match requires `selectedVariantId` before confirm. */
  matchLevel?: BomMatchLevel;
  selectedVariantId?: string;
  /** Parent figure reference kept after SKU selection. */
  figureNumber?: string;
}

export interface GuidedQuestion {
  id: string;
  question: string;
  options: string[];
}

export type BomRunStatus = 'draft' | 'parsing' | 'in-review' | 'completed';

export interface BomRun {
  id: string;
  /** Parent BomProject id */
  projectId: string;
  label: string;
  createdAt: string;
  status: BomRunStatus;
  itemCount: number;
}
