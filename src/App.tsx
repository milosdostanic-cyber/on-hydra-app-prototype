import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';

import { useActiveProject } from './context/ActiveProjectContext';
import { BomRoutes } from './bom/BomRoutes';
import { SeisBraceRoutes } from './seisbrace/SeisBraceRoutes';
import { UnifiedPartDetailPage } from './search/UnifiedPartDetailPage';
import { UnifiedSearchResultsPage } from './search/UnifiedSearchResultsPage';
import { AppShell } from './shell/AppShell';
import { CatalogHome } from './shell/CatalogHome';
import {
  ContentModule,
  KnowledgeCenterModule,
  RevitPlugInModule,
  SalesBraceModule,
} from './shell/ProjectModuleStubs';
import { CategoryAllPartsPage } from './shell/content/CategoryAllPartsPage';
import { PartVariantDetailPage } from './shell/content/PartVariantDetailPage';
import { PartVariantsPage } from './shell/content/PartVariantsPage';
import { ProductCatalogContent } from './shell/content/ProductCatalogContent';
import { ProductCatalogSearchPage } from './shell/content/ProductCatalogSearchPage';
import { ProductLinePartsPage } from './shell/content/ProductLinePartsPage';
import { SubcategoryHubPage } from './shell/content/SubcategoryHubPage';
import { HomeHubPage } from './shell/HomeHubPage';
import { ProjectWorkspaceLayout } from './shell/ProjectWorkspaceLayout';
import { SubmittalPackagesPage } from './submittal/SubmittalPackagesPage';

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

/** Old Content-module catalog deep links → Part Search catalog (index `/content` stays Content downloads). */
function LegacyContentCatalogDeepLinkRedirect() {
  const { projectId = '', '*': rest } = useParams<{ projectId: string; '*': string }>();
  const { search } = useLocation();
  if (!rest) {
    return <Navigate to={`/projects/${projectId}/content`} replace />;
  }
  return <Navigate to={`/projects/${projectId}/catalog/${rest}${search}`} replace />;
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
        <Route path="/revit-plugin" element={<RevitPlugInModule />} />
        <Route path="/knowledge-center" element={<KnowledgeCenterModule />} />

        {/* Part Search — project product catalog hierarchy (existing screens, reassigned from Content) */}
        <Route path="/projects/:projectId/catalog" element={<ProductCatalogContent />} />
        <Route path="/projects/:projectId/catalog/search" element={<ProductCatalogSearchPage />} />
        <Route
          path="/projects/:projectId/catalog/category/:categoryId/all-parts"
          element={<CategoryAllPartsPage />}
        />
        <Route
          path="/projects/:projectId/catalog/category/:categoryId/sub/:subcategoryId"
          element={<SubcategoryHubPage />}
        />
        <Route
          path="/projects/:projectId/catalog/category/:categoryId/sub/:subcategoryId/line/:productLineId"
          element={<ProductLinePartsPage />}
        />
        <Route
          path="/projects/:projectId/catalog/category/:categoryId/sub/:subcategoryId/line/:productLineId/part/:partId/parts"
          element={<PartVariantsPage />}
        />
        <Route
          path="/projects/:projectId/catalog/category/:categoryId/sub/:subcategoryId/line/:productLineId/part/:partId/variant/:variantId"
          element={<PartVariantDetailPage />}
        />

        <Route path="/projects/:projectId" element={<ProjectWorkspaceLayout />}>
          <Route index element={<Navigate to="content" replace />} />
          <Route path="seis-brace" element={<SeisBraceStubRedirect />} />
          <Route path="sales-brace" element={<SalesBraceModule />} />
          <Route path="submittal" element={<SubmittalPackagesPage />} />
          <Route path="content" element={<ContentModule />} />
          {/* Deep links only — exact `content` above wins for Content downloads */}
          <Route path="content/*" element={<LegacyContentCatalogDeepLinkRedirect />} />
        </Route>
      </Route>
    </Routes>
  );
}
