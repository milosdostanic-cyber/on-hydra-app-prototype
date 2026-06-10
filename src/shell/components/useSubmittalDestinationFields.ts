import { useEffect, useMemo, useState } from 'react';

import { useSubmittalPackages } from '../../context/SubmittalPackagesContext';
import type { SubmittalDestinationMode, SubmittalDestinationValue } from './SubmittalDestinationFields';

/** Resolve the user's submittal package choice (creates a package when in "new" mode). */
export function resolveSubmittalDestination(
  projectId: string,
  mode: SubmittalDestinationMode,
  selectedId: string | null,
  newName: string,
  createPackage: (projectId: string, name: string) => string,
  packages: { id: string; name: string }[],
): SubmittalDestinationValue | null {
  if (mode === 'existing') {
    if (!selectedId) return null;
    const pkg = packages.find((p) => p.id === selectedId);
    if (!pkg) return null;
    return { packageId: pkg.id, packageName: pkg.name };
  }

  const trimmed = newName.trim();
  if (!trimmed) return null;
  const packageId = createPackage(projectId, trimmed);
  return { packageId, packageName: trimmed };
}

/** Stateful hook for submittal destination pickers in modals. */
export function useSubmittalDestinationFields(projectId: string) {
  const { packagesForProject, createPackage } = useSubmittalPackages();
  const packages = useMemo(() => packagesForProject(projectId), [packagesForProject, projectId]);

  const [mode, setMode] = useState<SubmittalDestinationMode>('existing');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (packages.length > 0) {
      setMode('existing');
      setSelectedId(packages[0].id);
    } else {
      setMode('new');
      setSelectedId(null);
    }
    setNewName('');
  }, [projectId, packages]);

  const canSubmit = mode === 'existing' ? Boolean(selectedId) : newName.trim().length > 0;

  const resolve = () =>
    resolveSubmittalDestination(projectId, mode, selectedId, newName, createPackage, packages);

  return {
    packages,
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
