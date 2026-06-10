import { useEffect, useMemo, useState } from 'react';

import { addBomProject, mockBomProjects } from '../../bom/data/mockData';
import type { BomDestinationMode, BomDestinationValue } from './BomDestinationFields';

/** Resolve the user's BOM destination choice (creates a BOM when in "new" mode). */
export function resolveBomDestination(
  projectId: string,
  mode: BomDestinationMode,
  selectedId: string | null,
  newName: string,
): BomDestinationValue | null {
  if (mode === 'existing') {
    if (!selectedId) return null;
    const bom = mockBomProjects.find((p) => p.id === selectedId && p.projectId === projectId);
    if (!bom) return null;
    return { bomProjectId: bom.id, bomProjectName: bom.name };
  }

  const trimmed = newName.trim();
  if (!trimmed) return null;
  const created = addBomProject(projectId, trimmed);
  return { bomProjectId: created.id, bomProjectName: created.name };
}

/** Stateful hook for BOM destination pickers in modals. */
export function useBomDestinationFields(projectId: string) {
  const boms = useMemo(
    () => mockBomProjects.filter((p) => p.projectId === projectId),
    [projectId],
  );

  const [mode, setMode] = useState<BomDestinationMode>('existing');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (boms.length > 0) {
      setMode('existing');
      setSelectedId(boms[0].id);
    } else {
      setMode('new');
      setSelectedId(null);
    }
    setNewName('');
  }, [projectId, boms]);

  const canSubmit = mode === 'existing' ? Boolean(selectedId) : newName.trim().length > 0;

  const resolve = () => resolveBomDestination(projectId, mode, selectedId, newName);

  return {
    boms,
    mode,
    setMode,
    selectedId,
    setSelectedId,
    newName,
    setNewName,
    canSubmit,
    resolve,
  };
}
