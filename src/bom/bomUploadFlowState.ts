import type { BomMappingConfidence } from './bomFieldMappingUtils';
import type { BomProject } from './data/types';

/** Carried on `location.state` through field mapping → parsing review → commit. */
export type BomUploadFlowLocationState = {
  uploadFileName?: string;
  uploadDestination?: 'new' | 'append';
  appendTargetId?: string;
  /** Field mapping page output */
  fieldMapping?: Record<string, string | undefined>;
  /** Derived on smart mapping summary from auto / saved field mapping */
  mappingConfidence?: BomMappingConfidence;
  /** Tracks in-flight import session for progress strip + matching state */
  uploadId?: string;
  /** Step-back target for field mapping chrome (upload entry — not hub when resuming from workspace). */
  uploadFlowBackTo?: string;
  uploadFlowBackLabel?: string;
  /** Set when guided review finishes — table view can show a summary banner. */
  guidedReviewComplete?: boolean;
  /** Table view: filter to skipped lines on arrival. */
  focusSkipped?: boolean;
  /** Guided review: open a specific match row (e.g. Resolve from summary table). */
  focusItemId?: string;
  /** Set when navigating to guided review from the matching table (not from the upload flow). Hides upload-flow chrome. */
  resolveFromTable?: boolean;
};

export function resolveUploadDestination(
  bomProjectId: string,
  state: BomUploadFlowLocationState | null | undefined,
): { destination: 'new' | 'append'; appendTargetId: string | undefined } {
  if (state?.uploadDestination === 'new') {
    return { destination: 'new', appendTargetId: undefined };
  }
  if (state?.uploadDestination === 'append') {
    return {
      destination: 'append',
      appendTargetId: state.appendTargetId ?? (bomProjectId !== 'new' ? bomProjectId : undefined),
    };
  }
  // Resume / in-project import without explicit destination → full 3-step flow (not append shortcut).
  return { destination: 'new', appendTargetId: undefined };
}

export function sortBomProjectsByLastEditedDesc(projects: BomProject[]): BomProject[] {
  return [...projects].sort(
    (a, b) => new Date(b.lastEdited).getTime() - new Date(a.lastEdited).getTime(),
  );
}

/** After append import, workspace shows a one-time banner (cleared on dismiss or navigation). */
export type BomWorkspaceAppendBannerState = {
  appendImportBanner?: { fileName: string; count: number };
};

const DEFAULT_UPLOAD_FILE_NAME = 'BOM-ExLine2.xlsx';

export function readUploadFileName(state: BomUploadFlowLocationState | null | undefined): string {
  return state?.uploadFileName?.trim() || DEFAULT_UPLOAD_FILE_NAME;
}
