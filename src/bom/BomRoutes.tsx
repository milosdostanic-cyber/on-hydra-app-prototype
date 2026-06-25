import { Navigate, Route, Routes } from 'react-router-dom';

import { BomLayout } from './layout/BomLayout';
import { BomAscProductsPage } from './pages/BomAscProductsPage';
import { BomExportPage } from './pages/BomExportPage';
import { BomFieldMappingPage } from './pages/BomFieldMappingPage';
import { BomMappingSummaryPage } from './pages/BomMappingSummaryPage';
import { BomIndexRedirect } from './pages/BomIndexRedirect';
import { BomSiteProjectsPage } from './pages/BomSiteProjectsPage';
import { BomMatchingIndexRedirect } from './pages/BomMatchingIndexRedirect';
import { BomMatchingPage } from './pages/BomMatchingPage';
import { BomProgressiveMatchingPage } from './pages/BomProgressiveMatchingPage';
import { BomReplacementPickerPage } from './pages/BomReplacementPickerPage';
import { BomNarrowPage } from './pages/BomNarrowPage';
import { BomParsingReviewPage } from './pages/BomParsingReviewPage';
import { BomRecommendPage } from './pages/BomRecommendPage';
import { BomCompetitorSearchResultsPage } from './pages/BomCompetitorSearchResultsPage';
import { BomSearchPage } from './pages/BomSearchPage';
import { BomServiceRequestPage } from './pages/BomServiceRequestPage';
import { BomTranslatePage } from './pages/BomTranslatePage';
import { BomWorkspacePage } from './pages/BomWorkspacePage';

/**
 * Nested BOM experience under `/bom/*`. Shell sidebar and top bar stay in {@link AppShell}.
 */
export function BomRoutes() {
  return (
    <Routes>
      <Route element={<BomLayout />}>
        <Route index element={<BomIndexRedirect />} />
        <Route path="site/:constructionProjectId" element={<BomSiteProjectsPage />} />
        <Route path="search" element={<BomSearchPage />} />
        <Route path="search/results" element={<BomCompetitorSearchResultsPage />} />
        <Route path="projects/:bomProjectId/parsing-review" element={<BomParsingReviewPage />} />
        <Route path="projects/:bomProjectId/matching" element={<BomMatchingIndexRedirect />} />
        <Route path="projects/:bomProjectId/matching/review" element={<BomProgressiveMatchingPage />} />
        <Route path="projects/:bomProjectId/matching/table" element={<BomMatchingPage />} />
        <Route
          path="projects/:bomProjectId/matching/progressive"
          element={<Navigate to="../review" replace />}
        />
        <Route
          path="projects/:bomProjectId/matching/items/:itemId/replacement"
          element={<BomReplacementPickerPage />}
        />
        <Route path="projects/:bomProjectId/items/:itemId/narrow" element={<BomNarrowPage />} />
        <Route path="projects/:bomProjectId/items/:itemId/recommend" element={<BomRecommendPage />} />
        <Route path="projects/:bomProjectId/workspace" element={<BomWorkspacePage />} />
        <Route path="projects/:bomProjectId/asc-products" element={<BomAscProductsPage />} />
        <Route path="projects/:bomProjectId/catalog" element={<Navigate to="../asc-products" replace />} />
        <Route path="projects/:bomProjectId/translate" element={<BomTranslatePage />} />
        <Route path="projects/:bomProjectId/mapping-summary" element={<BomMappingSummaryPage />} />
        <Route path="projects/:bomProjectId/field-mapping" element={<BomFieldMappingPage />} />
        <Route path="projects/:bomProjectId/export" element={<BomExportPage />} />
        <Route path="projects/:bomProjectId/service-request" element={<BomServiceRequestPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/bom" replace />} />
    </Routes>
  );
}
