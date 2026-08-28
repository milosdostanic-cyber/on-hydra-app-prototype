import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';

import { useActiveProject } from '../../context/ActiveProjectContext';
import { SpecDemoControls } from '../components/SpecDemoControls';
import { SpecDemoProvider } from '../context/SpecDemoContext';
import { SpecWorkspaceProvider } from '../context/SpecWorkspaceContext';
import { getDocumentFromStore } from '../data/specMockStore';
import { specCanonicalPathFromLegacy } from '../specNavigation';

/** Spec module root — providers, demo float button, and project-owned URL / active-project sync. */
export function SpecLayout() {
  return (
    <SpecDemoProvider>
      <SpecWorkspaceProvider>
        <SpecRouteSync />
        <div style={{ width: '100%' }}>
          <Outlet />
        </div>
        <SpecDemoControls />
      </SpecWorkspaceProvider>
    </SpecDemoProvider>
  );
}

function SpecRouteSync() {
  const location = useLocation();
  const navigate = useNavigate();
  const { projectId, specId } = useParams<{ projectId?: string; specId?: string }>();
  const { projectId: activeId, setProjectId } = useActiveProject();

  useEffect(() => {
    const canonical = specCanonicalPathFromLegacy(location.pathname, location.search);
    if (canonical && `${location.pathname}${location.search}` !== canonical) {
      navigate(canonical, { replace: true });
    }
  }, [location.pathname, location.search, navigate]);

  useEffect(() => {
    const next = projectId ?? (specId ? getDocumentFromStore(specId)?.projectId : undefined);
    if (next && next !== activeId) setProjectId(next);
  }, [projectId, specId, activeId, setProjectId]);

  return null;
}
