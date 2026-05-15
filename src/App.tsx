import { Navigate, Route, Routes } from 'react-router-dom';

import { AppShell } from './shell/AppShell';
import { CatalogHome } from './shell/CatalogHome';
import { CatalogPartPage } from './shell/CatalogPartPage';
import { CatalogResults } from './shell/CatalogResults';
import { CategoryAllPartsPage } from './shell/content/CategoryAllPartsPage';
import { PartVariantDetailPage } from './shell/content/PartVariantDetailPage';
import { PartVariantsPage } from './shell/content/PartVariantsPage';
import { ProductCatalogContent } from './shell/content/ProductCatalogContent';
import { ProductCatalogSearchPage } from './shell/content/ProductCatalogSearchPage';
import { ProductLinePartsPage } from './shell/content/ProductLinePartsPage';
import { SubcategoryHubPage } from './shell/content/SubcategoryHubPage';
import { ContentModule, SalesBraceModule, SubmittalModule } from './shell/ProjectModuleStubs';
import { BomRoutes } from './bom/BomRoutes';
import { DashboardPlaceholder } from './shell/DashboardPlaceholder';
import { ProjectWorkspaceLayout } from './shell/ProjectWorkspaceLayout';
import { ShellHomeContent } from './shell/ShellHomeContent';

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/projects" replace />} />
        <Route path="/dashboard" element={<DashboardPlaceholder />} />
        <Route path="/projects" element={<ShellHomeContent />} />
        <Route path="/catalog" element={<CatalogHome />} />
        <Route path="/catalog/results" element={<CatalogResults />} />
        <Route path="/catalog/parts/:partId" element={<CatalogPartPage />} />
        <Route path="/bom/*" element={<BomRoutes />} />

        <Route path="/projects/:projectId" element={<ProjectWorkspaceLayout />}>
          <Route index element={<Navigate to="content" replace />} />
          <Route path="seis-brace" element={<SalesBraceModule />} />
          <Route path="sales-brace" element={<SalesBraceModule />} />
          <Route path="submittal" element={<SubmittalModule />} />
          <Route path="content" element={<ContentModule />}>
            <Route index element={<ProductCatalogContent />} />
            <Route path="category/:categoryId/all-parts" element={<CategoryAllPartsPage />} />
            <Route path="category/:categoryId/sub/:subcategoryId" element={<SubcategoryHubPage />} />
            <Route
              path="category/:categoryId/sub/:subcategoryId/line/:productLineId"
              element={<ProductLinePartsPage />}
            />
            <Route
              path="category/:categoryId/sub/:subcategoryId/line/:productLineId/part/:partId/parts"
              element={<PartVariantsPage />}
            />
            <Route
              path="category/:categoryId/sub/:subcategoryId/line/:productLineId/part/:partId/variant/:variantId"
              element={<PartVariantDetailPage />}
            />
            <Route path="search" element={<ProductCatalogSearchPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
