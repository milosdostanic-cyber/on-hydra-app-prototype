import type { BomImportProgress, BomImportStep, BomItem, BomMatchResult } from './data/types';
import { ASC_FIELD_MAPPING_TOTAL, countMappedAscFields } from './bomFieldMappingUtils';
import { createInitialMatchResults, createParsingReviewRows } from './data/bomImportFlowSeed';

export function routeForImportStep(bomProjectId: string, step: BomImportStep): string {
  switch (step) {
    case 'map':
      return `/bom/projects/${bomProjectId}/field-mapping`;
    case 'review':
      return `/bom/projects/${bomProjectId}/parsing-review`;
    case 'match':
      return `/bom/projects/${bomProjectId}/matching`;
    case 'done':
      return `/bom/projects/${bomProjectId}/workspace`;
    default:
      return `/bom/projects/${bomProjectId}/workspace`;
  }
}

export function stepLabel(step: BomImportStep): string {
  switch (step) {
    case 'map':
      return 'Map columns';
    case 'review':
      return 'Review parsed rows';
    case 'match':
      return 'Match parts';
    case 'done':
      return 'Complete';
    default:
      return step;
  }
}

export function stepIndex(step: BomImportStep): number {
  switch (step) {
    case 'map':
      return 0;
    case 'review':
      return 1;
    case 'match':
      return 2;
    case 'done':
      return 3;
    default:
      return 0;
  }
}

export function overallProgressPercent(progress: BomImportProgress): number {
  const step = stepIndex(progress.currentStep);
  const stepWeight = 100 / 3;
  let within = 0;
  if (progress.currentStep === 'map' && progress.totalAscFields > 0) {
    within = (progress.mappedAscFields / progress.totalAscFields) * stepWeight;
  } else if (progress.currentStep === 'review' && progress.totalRows > 0) {
    within = stepWeight + (progress.parsedRows / progress.totalRows) * stepWeight;
  } else if (progress.currentStep === 'match' && progress.totalRows > 0) {
    const done = progress.acceptedCount + progress.skippedCount + progress.manualCount;
    within = stepWeight * 2 + (done / progress.totalRows) * stepWeight;
  } else if (progress.currentStep === 'done') {
    return 100;
  } else {
    within = step * stepWeight;
  }
  return Math.min(100, Math.round(within));
}

export type BomImportSession = {
  uploadId: string;
  progress: BomImportProgress;
  parsedItems: BomItem[];
  matchResults: BomMatchResult[];
  fieldMapping?: Record<string, string | undefined>;
};

const LS_KEY = 'hydra_bom_import_sessions_v1';

type PersistedStore = {
  sessions: BomImportSession[];
  uploadIdsByProjectId: [string, string[]][];
};

const sessionsByUploadId = new Map<string, BomImportSession>();
const uploadIdsByProjectId = new Map<string, string[]>();

function saveToStorage(): void {
  try {
    const data: PersistedStore = {
      sessions: [...sessionsByUploadId.values()],
      uploadIdsByProjectId: [...uploadIdsByProjectId.entries()],
    };
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch {
    // localStorage unavailable (private browsing, quota exceeded, etc.)
  }
}

function loadFromStorage(): void {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    const data = JSON.parse(raw) as PersistedStore;
    if (Array.isArray(data.sessions)) {
      data.sessions.forEach((s) => sessionsByUploadId.set(s.uploadId, s));
    }
    if (Array.isArray(data.uploadIdsByProjectId)) {
      data.uploadIdsByProjectId.forEach(([projectId, ids]) =>
        uploadIdsByProjectId.set(projectId, ids),
      );
    }
  } catch {
    // corrupted data — start fresh
    try { localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
  }
}

// Restore persisted sessions on module load
loadFromStorage();

function nowIso() {
  return new Date().toISOString();
}

export function createImportSession(
  bomProjectId: string,
  fileName: string,
  fieldMapping?: Record<string, string | undefined>,
): BomImportSession {
  const uploadId = `upload-${bomProjectId}-${Date.now()}`;
  const parsedItems = createParsingReviewRows();
  const matchResults = createInitialMatchResults(parsedItems);
  const mapped = countMappedAscFields(fieldMapping);

  const progress: BomImportProgress = {
    uploadId,
    fileName,
    bomProjectId,
    currentStep: 'map',
    totalAscFields: ASC_FIELD_MAPPING_TOTAL,
    mappedAscFields: mapped,
    totalRows: parsedItems.length,
    parsedRows: 0,
    matchedRows: 0,
    acceptedCount: 0,
    skippedCount: 0,
    manualCount: 0,
    startedAt: nowIso(),
    lastUpdatedAt: nowIso(),
  };

  const session: BomImportSession = {
    uploadId,
    progress,
    parsedItems,
    matchResults,
    fieldMapping,
  };

  sessionsByUploadId.set(uploadId, session);
  const list = uploadIdsByProjectId.get(bomProjectId) ?? [];
  uploadIdsByProjectId.set(bomProjectId, [uploadId, ...list.filter((id) => id !== uploadId)]);
  saveToStorage();

  return session;
}

export function getImportSession(uploadId: string): BomImportSession | undefined {
  return sessionsByUploadId.get(uploadId);
}

export function getImportSessionForProject(bomProjectId: string): BomImportSession | undefined {
  const ids = uploadIdsByProjectId.get(bomProjectId) ?? [];
  for (const id of ids) {
    const s = sessionsByUploadId.get(id);
    if (s && s.progress.currentStep !== 'done') return s;
  }
  return undefined;
}

/** Reuse the active import for this project, or create one (keeps stepper visible across import screens). */
export function getOrCreateImportSessionForProject(
  bomProjectId: string,
  fileName: string,
  fieldMapping?: Record<string, string | undefined>,
): BomImportSession {
  const pending = getImportSessionForProject(bomProjectId);
  if (pending) return pending;

  const ids = uploadIdsByProjectId.get(bomProjectId) ?? [];
  const latestId = ids[0];
  if (latestId) {
    const latest = sessionsByUploadId.get(latestId);
    if (latest) return latest;
  }

  return createImportSession(bomProjectId, fileName, fieldMapping);
}

export function listPendingImportsForProject(bomProjectId: string): BomImportSession[] {
  const ids = uploadIdsByProjectId.get(bomProjectId) ?? [];
  return ids
    .map((id) => sessionsByUploadId.get(id))
    .filter((s): s is BomImportSession => Boolean(s && s.progress.currentStep !== 'done'));
}

export function updateImportSession(
  uploadId: string,
  patch: Partial<BomImportProgress> & {
    parsedItems?: BomItem[];
    matchResults?: BomMatchResult[];
    fieldMapping?: Record<string, string | undefined>;
  },
): BomImportSession | undefined {
  const session = sessionsByUploadId.get(uploadId);
  if (!session) return undefined;

  session.progress = {
    ...session.progress,
    ...patch,
    lastUpdatedAt: nowIso(),
  };
  if (patch.parsedItems) session.parsedItems = patch.parsedItems;
  if (patch.matchResults) session.matchResults = patch.matchResults;
  if (patch.fieldMapping) session.fieldMapping = patch.fieldMapping;

  sessionsByUploadId.set(uploadId, session);
  saveToStorage();
  return session;
}

export function dismissImportSession(uploadId: string): void {
  const session = sessionsByUploadId.get(uploadId);
  if (!session) return;
  const projectId = session.progress.bomProjectId;
  sessionsByUploadId.delete(uploadId);
  const ids = uploadIdsByProjectId.get(projectId) ?? [];
  uploadIdsByProjectId.set(
    projectId,
    ids.filter((id) => id !== uploadId),
  );
  saveToStorage();
}

export function ensureDemoPendingImports(bomProjectId: string): void {
  if ((uploadIdsByProjectId.get(bomProjectId) ?? []).length > 0) return;

  const files = ['BOM-ExLine.xlsx', 'BOM-ExLine2.xlsx'];
  files.forEach((fileName, i) => {
    const session = createImportSession(bomProjectId, fileName);
    updateImportSession(session.uploadId, {
      currentStep: i === 0 ? 'review' : 'map',
      mappedAscFields: i === 0 ? 11 : 4,
      parsedRows: i === 0 ? session.parsedItems.length : 0,
    });
  });
}
