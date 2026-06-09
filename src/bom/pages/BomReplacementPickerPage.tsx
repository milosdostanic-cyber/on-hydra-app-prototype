import { Navigate, useParams } from 'react-router-dom';

/** Legacy route — guided review + choose drawer replaced this full-page picker. */
export function BomReplacementPickerPage() {
  const { bomProjectId = '' } = useParams<{ bomProjectId: string }>();
  return <Navigate to={`/bom/projects/${bomProjectId}/matching/review`} replace />;
}
