import { Navigate, Route, Routes } from 'react-router-dom';

import { BomLayout } from './layout/BomLayout';
import { BomExportPage } from './pages/BomExportPage';
import { BomFlowOverviewPage } from './pages/BomFlowOverviewPage';
import { BomLandingPage } from './pages/BomLandingPage';
import { BomMatchingPage } from './pages/BomMatchingPage';
import { BomNarrowPage } from './pages/BomNarrowPage';
import { BomParsingReviewPage } from './pages/BomParsingReviewPage';
import { BomRecommendPage } from './pages/BomRecommendPage';
import { BomSearchPage } from './pages/BomSearchPage';
import { BomServiceRequestPage } from './pages/BomServiceRequestPage';
import { BomWorkspacePage } from './pages/BomWorkspacePage';

/**
 * Nested BOM experience under `/bom/*`. Shell sidebar and top bar stay in {@link AppShell}.
 */
export function BomRoutes() {
  return (
    <Routes>
      <Route element={<BomLayout />}>
        <Route index element={<BomLandingPage />} />
        <Route path="flow" element={<BomFlowOverviewPage />} />
        <Route path="search" element={<BomSearchPage />} />
        <Route path="projects/:bomProjectId/parsing-review" element={<BomParsingReviewPage />} />
        <Route path="projects/:bomProjectId/matching" element={<BomMatchingPage />} />
        <Route path="projects/:bomProjectId/items/:itemId/narrow" element={<BomNarrowPage />} />
        <Route path="projects/:bomProjectId/items/:itemId/recommend" element={<BomRecommendPage />} />
        <Route path="projects/:bomProjectId/workspace" element={<BomWorkspacePage />} />
        <Route path="projects/:bomProjectId/export" element={<BomExportPage />} />
        <Route path="projects/:bomProjectId/service-request" element={<BomServiceRequestPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/bom" replace />} />
    </Routes>
  );
}
