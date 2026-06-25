import { Navigate } from 'react-router-dom';

import { bomSitePath, useActiveProject } from '../../context/ActiveProjectContext';

/** `/bom` opens the BOM hub for the active construction project (no separate project list page). */
export function BomIndexRedirect() {
  const { projectId } = useActiveProject();
  return <Navigate to={bomSitePath(projectId)} replace />;
}
