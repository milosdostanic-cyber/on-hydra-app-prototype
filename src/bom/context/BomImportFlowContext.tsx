import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { BomImportProgress, BomItem, BomMatchResult } from '../data/types';
import {
  createImportSession,
  dismissImportSession,
  ensureDemoPendingImports,
  getImportSession,
  listPendingImportsForProject,
  updateImportSession,
  type BomImportSession,
} from '../bomImportProgressState';

type BomImportFlowContextValue = {
  activeUploadId: string | undefined;
  setActiveUploadId: (id: string | undefined) => void;
  getSession: (uploadId: string | undefined) => BomImportSession | undefined;
  getActiveSession: () => BomImportSession | undefined;
  ensureSession: (
    bomProjectId: string,
    fileName: string,
    fieldMapping?: Record<string, string | undefined>,
  ) => BomImportSession;
  updateProgress: (
    uploadId: string,
    patch: Partial<BomImportProgress> & {
      parsedItems?: BomItem[];
      matchResults?: BomMatchResult[];
      fieldMapping?: Record<string, string | undefined>;
    },
  ) => BomImportSession | undefined;
  pendingForProject: (bomProjectId: string) => BomImportSession[];
  refreshKey: number;
  bumpRefresh: () => void;
  dismissSession: (uploadId: string) => void;
};

const BomImportFlowContext = createContext<BomImportFlowContextValue | null>(null);

export function BomImportFlowProvider({ children }: { children: ReactNode }) {
  const [activeUploadId, setActiveUploadId] = useState<string | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  const bumpRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const getSession = useCallback(
    (uploadId: string | undefined) => {
      if (!uploadId) return undefined;
      return getImportSession(uploadId);
    },
    [refreshKey],
  );

  const getActiveSession = useCallback(() => {
    if (!activeUploadId) return undefined;
    return getImportSession(activeUploadId);
  }, [activeUploadId, refreshKey]);

  const ensureSession = useCallback(
    (bomProjectId: string, fileName: string, fieldMapping?: Record<string, string | undefined>) => {
      const session = createImportSession(bomProjectId, fileName, fieldMapping);
      setActiveUploadId(session.uploadId);
      bumpRefresh();
      return session;
    },
    [bumpRefresh],
  );

  const updateProgress = useCallback(
    (
      uploadId: string,
      patch: Partial<BomImportProgress> & {
        parsedItems?: BomItem[];
        matchResults?: BomMatchResult[];
        fieldMapping?: Record<string, string | undefined>;
      },
    ) => {
      const updated = updateImportSession(uploadId, patch);
      bumpRefresh();
      return updated;
    },
    [bumpRefresh],
  );

  const pendingForProject = useCallback(
    (bomProjectId: string) => {
      ensureDemoPendingImports(bomProjectId);
      return listPendingImportsForProject(bomProjectId);
    },
    [refreshKey],
  );

  const dismissSession = useCallback(
    (uploadId: string) => {
      dismissImportSession(uploadId);
      bumpRefresh();
    },
    [bumpRefresh],
  );

  const value = useMemo(
    () => ({
      activeUploadId,
      setActiveUploadId,
      getSession,
      getActiveSession,
      ensureSession,
      updateProgress,
      pendingForProject,
      refreshKey,
      bumpRefresh,
      dismissSession,
    }),
    [
      activeUploadId,
      getSession,
      getActiveSession,
      ensureSession,
      updateProgress,
      pendingForProject,
      refreshKey,
      bumpRefresh,
      dismissSession,
    ],
  );

  return <BomImportFlowContext.Provider value={value}>{children}</BomImportFlowContext.Provider>;
}

export function useBomImportFlow() {
  const ctx = useContext(BomImportFlowContext);
  if (!ctx) throw new Error('useBomImportFlow must be used within BomImportFlowProvider');
  return ctx;
}
