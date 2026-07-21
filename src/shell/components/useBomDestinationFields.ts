import { useCallback, useEffect, useMemo, useState } from 'react';

import { addBomProject, mockBomProjects } from '../../bom/data/mockData';
import type { BomDestinationValue } from './BomDestinationFields';

/** Resolve the user's BOM destination choice from a selected list row. */
export function resolveBomDestination(
  projectId: string,
  selectedId: string | null,
): BomDestinationValue | null {
  if (!selectedId) return null;
  const bom = mockBomProjects.find((p) => p.id === selectedId && p.projectId === projectId);
  if (!bom) return null;
  return { bomProjectId: bom.id, bomProjectName: bom.name };
}

/** Stateful hook for BOM destination pickers in modals. */
export function useBomDestinationFields(projectId: string) {
  const [refreshKey, setRefreshKey] = useState(0);

  const boms = useMemo(
    () => mockBomProjects.filter((p) => p.projectId === projectId),
    [projectId, refreshKey],
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedId(boms[0]?.id ?? null);
  }, [projectId, boms]);

  const canSubmit = Boolean(selectedId);

  const resolve = useCallback(
    () => resolveBomDestination(projectId, selectedId),
    [projectId, selectedId],
  );

  const createBom = useCallback(
    (name: string): BomDestinationValue | null => {
      const trimmed = name.trim();
      if (!trimmed) return null;
      const created = addBomProject(trimmed, undefined, projectId);
      setRefreshKey((key) => key + 1);
      setSelectedId(created.id);
      return { bomProjectId: created.id, bomProjectName: created.name };
    },
    [projectId],
  );

  return {
    boms,
    selectedId,
    setSelectedId,
    canSubmit,
    resolve,
    createBom,
  };
}
