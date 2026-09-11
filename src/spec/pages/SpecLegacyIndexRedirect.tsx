import { Navigate } from 'react-router-dom';

import { resolveActiveConstructionProjectId, useActiveProject } from '../../context/ActiveProjectContext';
import { specProjectListPath } from '../specNavigation';

/**
 * `/spec` opens the Project SPEC list for the active project (Phase 0 decision
 * record, decision 1). Mirrors `BomIndexRedirect` — no separate organization-wide
 * SPEC library in Release 1.
 */
export function SpecLegacyIndexRedirect() {
  const { projectId } = useActiveProject();
  return <Navigate to={specProjectListPath(resolveActiveConstructionProjectId(projectId))} replace />;
}
