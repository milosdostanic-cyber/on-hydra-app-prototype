import type { BomProject } from './data/types';

/** Carried on `location.state` through field mapping → parsing review → commit. */
export type BomUploadFlowLocationState = {
  uploadFileName?: string;
  uploadDestination?: 'new' | 'append';
  appendTargetId?: string;
  /** Field mapping page output */
  fieldMapping?: Record<string, string | undefined>;
  /** Tracks in-flight import session for progress strip + matching state */
  uploadId?: string;
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
  if (bomProjectId === 'new') {
    return { destination: 'new', appendTargetId: undefined };
  }
  return { destination: 'append', appendTargetId: bomProjectId };
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
