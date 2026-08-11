import { Navigate } from 'react-router-dom';

import { bomSitePath, resolveActiveConstructionProjectId, useActiveProject } from '../../context/ActiveProjectContext';

/** `/bom` opens the BOM hub for the active construction project (no separate project list page). */
export function BomIndexRedirect() {
  const { projectId } = useActiveProject();
  return <Navigate to={bomSitePath(resolveActiveConstructionProjectId(projectId))} replace />;
}
