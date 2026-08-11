import { useLayoutEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { useBomImportFlow } from '../context/BomImportFlowContext';
import { countMappedAscFields } from '../bomFieldMappingUtils';
import {
  getImportSession,
  getOrCreateImportSessionForProject,
  type BomImportSession,
} from '../bomImportProgressState';
import type { BomImportStep } from '../data/types';
import type { BomUploadFlowLocationState } from '../bomUploadFlowState';

function stepForPathname(pathname: string): BomImportStep {
  if (pathname.includes('/matching')) return 'match';
  if (pathname.includes('/parsing-review')) return 'review';
  if (pathname.includes('/mapping-summary') || pathname.includes('/field-mapping')) return 'map';
  return 'map';
}

function resolveSession(
  bomProjectId: string,
  uploadState: BomUploadFlowLocationState,
  getSession: (uploadId: string | undefined) => BomImportSession | undefined,
): BomImportSession {
  if (uploadState.uploadId) {
    const byStateId = getSession(uploadState.uploadId);
    if (byStateId?.progress.bomProjectId === bomProjectId) return byStateId;
  }

  return getOrCreateImportSessionForProject(
    bomProjectId,
    uploadState.uploadFileName ?? 'BOM-ExLine.xlsx',
    uploadState.fieldMapping,
  );
}

export function useBomImportSession(bomProjectId: string) {
  const location = useLocation();
  const uploadState = (location.state ?? {}) as BomUploadFlowLocationState;
  const { getSession, setActiveUploadId, activeUploadId, refreshKey, updateProgress } = useBomImportFlow();

  const session = useMemo(
    () => resolveSession(bomProjectId, uploadState, getSession),
    [
      bomProjectId,
      uploadState.uploadFileName,
      uploadState.uploadId,
      uploadState.fieldMapping,
      getSession,
      refreshKey,
    ],
  );

  const uploadId = uploadState.uploadId ?? session.uploadId ?? activeUploadId;

  useLayoutEffect(() => {
    setActiveUploadId(session.uploadId);

    if (uploadState.fieldMapping) {
      const mapped = countMappedAscFields(uploadState.fieldMapping);
      if (session.progress.mappedAscFields !== mapped || session.fieldMapping !== uploadState.fieldMapping) {
        updateProgress(session.uploadId, {
          fieldMapping: uploadState.fieldMapping,
          mappedAscFields: mapped,
        });
      }
    }

    const routeStep = stepForPathname(location.pathname);
    if (session.progress.currentStep !== 'done' && session.progress.currentStep !== routeStep) {
      updateProgress(session.uploadId, { currentStep: routeStep });
    }
  }, [
    bomProjectId,
    location.pathname,
    session.uploadId,
    session.progress.currentStep,
    session.progress.mappedAscFields,
    session.fieldMapping,
    uploadState.fieldMapping,
    setActiveUploadId,
    updateProgress,
  ]);

  // Re-read after progress patches so stepper current step updates.
  const sessionWithProgress = useMemo(() => {
    return getImportSession(session.uploadId) ?? session;
  }, [session, refreshKey]);

  return { session: sessionWithProgress, uploadState, uploadId };
}
