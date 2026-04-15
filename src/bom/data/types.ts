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
  status?: BomItemMatchStatus;
}

export type AscSubstitutionRisk = 'low' | 'medium' | 'high';

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
}

export interface BomMatchResult {
  itemId: string;
  originalRequest: string;
  suggestedParts: AscCatalogPart[];
  topMatch?: AscCatalogPart;
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
