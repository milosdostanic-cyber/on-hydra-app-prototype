import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';

import { useActiveProject } from './context/ActiveProjectContext';
import { AppShell } from './shell/AppShell';
import { CatalogHome } from './shell/CatalogHome';
import {
  ContentModule,
  SalesBraceModule,
} from './shell/ProjectModuleStubs';
import { BomRoutes } from './bom/BomRoutes';
import { HomeHubPage } from './shell/HomeHubPage';
import { ProjectWorkspaceLayout } from './shell/ProjectWorkspaceLayout';
import { SeisBraceRoutes } from './seisbrace/SeisBraceRoutes';
import { SubmittalPackagesPage } from './submittal/SubmittalPackagesPage';
import { UnifiedPartDetailPage } from './search/UnifiedPartDetailPage';
import { UnifiedSearchResultsPage } from './search/UnifiedSearchResultsPage';

/** Legacy catalog results route → unified search, preserving the query string. */
function CatalogResultsRedirect() {
  const { search } = useLocation();
  return <Navigate to={`/search/results${search || '?q=all'}`} replace />;
}

/** Legacy catalog part route → unified part detail, preserving the part id. */
function CatalogPartRedirect() {
  const { partId } = useParams<{ partId: string }>();
  return <Navigate to={`/search/parts/${partId ?? ''}`} replace />;
}

/**
 * Legacy project-scoped SeisBrace stub → the `/seisbrace` module. Scopes the active construction
 * project from the URL so sidebar / home-rollup entry points keep working without touching the shell.
 */
function SeisBraceStubRedirect() {
  const { projectId } = useParams<{ projectId: string }>();
  const { setProjectId } = useActiveProject();
  const navigate = useNavigate();
  useEffect(() => {
    if (projectId) setProjectId(projectId);
    navigate('/seisbrace', { replace: true });
  }, [projectId, setProjectId, navigate]);
  return null;
}

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<HomeHubPage />} />
        <Route path="/projects" element={<Navigate to="/dashboard" replace />} />
        <Route path="/search" element={<Navigate to="/search/results?q=all" replace />} />
        <Route path="/search/results" element={<UnifiedSearchResultsPage />} />
        <Route path="/search/parts/:partId" element={<UnifiedPartDetailPage />} />
        <Route path="/catalog" element={<CatalogHome />} />
        <Route path="/catalog/results" element={<CatalogResultsRedirect />} />
        <Route path="/catalog/parts/:partId" element={<CatalogPartRedirect />} />
        <Route path="/bom/*" element={<BomRoutes />} />
        <Route path="/seisbrace/*" element={<SeisBraceRoutes />} />

        <Route path="/projects/:projectId" element={<ProjectWorkspaceLayout />}>
          <Route index element={<Navigate to="content" replace />} />
          <Route path="seis-brace" element={<SeisBraceStubRedirect />} />
          <Route path="sales-brace" element={<SalesBraceModule />} />
          <Route path="submittal" element={<SubmittalPackagesPage />} />
          <Route path="content" element={<ContentModule />} />
        </Route>
      </Route>
    </Routes>
  );
}
