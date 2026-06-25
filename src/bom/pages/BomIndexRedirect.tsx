import { Navigate } from 'react-router-dom';

import { useBomHubPath } from '../../context/ActiveProjectContext';

/** `/bom` opens the BOM hub for the active construction project (no separate project list page). */
export function BomIndexRedirect() {
  const bomHubPath = useBomHubPath();
  return <Navigate to={bomHubPath} replace />;
}
