import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { bomProjectById, mockWorkspaceItems } from '../bom/data/mockData';
import type { BomItem } from '../bom/data/types';

export function initialWorkspaceRowsForBomProject(bomProjectId: string): BomItem[] {
  if (bomProjectId === 'new') return [];
  const p = bomProjectById(bomProjectId);
  if (p && p.items === 0) return [];
  return mockWorkspaceItems.map((r) => ({ ...r }));
}

type BomWorkspaceContextValue = {
  rowsByProjectId: Record<string, BomItem[] | undefined>;
  setWorkspaceRows: (bomProjectId: string, updater: (prev: BomItem[]) => BomItem[]) => void;
  replaceWorkspaceRows: (bomProjectId: string, rows: BomItem[]) => void;
};

const BomWorkspaceContext = createContext<BomWorkspaceContextValue | null>(null);

export function BomWorkspaceProvider({ children }: { children: ReactNode }) {
  const [rowsByProjectId, setRowsByProjectId] = useState<Record<string, BomItem[] | undefined>>({});

  const setWorkspaceRows = useCallback((bomProjectId: string, updater: (prev: BomItem[]) => BomItem[]) => {
    setRowsByProjectId((prev) => {
      const current = prev[bomProjectId] ?? initialWorkspaceRowsForBomProject(bomProjectId);
      return { ...prev, [bomProjectId]: updater(current) };
    });
  }, []);

  const replaceWorkspaceRows = useCallback((bomProjectId: string, rows: BomItem[]) => {
    setRowsByProjectId((p) => ({ ...p, [bomProjectId]: rows }));
  }, []);

  const value = useMemo(
    () => ({ rowsByProjectId, setWorkspaceRows, replaceWorkspaceRows }),
    [rowsByProjectId, setWorkspaceRows, replaceWorkspaceRows],
  );

  return <BomWorkspaceContext.Provider value={value}>{children}</BomWorkspaceContext.Provider>;
}

export function useBomWorkspace() {
  const ctx = useContext(BomWorkspaceContext);
  if (!ctx) throw new Error('useBomWorkspace must be used within BomWorkspaceProvider');
  return ctx;
}

/**
 * Workspace rows for a BOM project — shared by Workspace, Translate, and Export.
 * When no edits exist yet, seed matches {@link initialWorkspaceRowsForBomProject}.
 */
export function useBomWorkspaceRows(bomProjectId: string) {
  const { rowsByProjectId, setWorkspaceRows } = useBomWorkspace();
  const stored = rowsByProjectId[bomProjectId];
  const rows = useMemo(() => {
    if (stored !== undefined) return stored;
    return initialWorkspaceRowsForBomProject(bomProjectId);
  }, [stored, bomProjectId]);

  const setRows = useCallback(
    (updater: BomItem[] | ((prev: BomItem[]) => BomItem[])) => {
      setWorkspaceRows(bomProjectId, (prev) =>
        typeof updater === 'function' ? (updater as (p: BomItem[]) => BomItem[])(prev) : updater,
      );
    },
    [bomProjectId, setWorkspaceRows],
  );

  return { rows, setRows };
}
