import { Navigate, useParams } from 'react-router-dom';

/** `/matching` opens guided review — table view is at `/matching/table`. */
export function BomMatchingIndexRedirect() {
  const { bomProjectId = '' } = useParams<{ bomProjectId: string }>();
  return <Navigate to={`/bom/projects/${bomProjectId}/matching/review`} replace />;
}
