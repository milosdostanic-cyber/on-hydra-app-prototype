import { Navigate, Route, Routes, useParams } from 'react-router-dom';

import { SpecLayout } from './layout/SpecLayout';
import { SpecAnalyzePage } from './pages/SpecAnalyzePage';
import { SpecAskPage } from './pages/SpecAskPage';
import { SpecDeliverBackPage } from './pages/SpecDeliverBackPage';
import { SpecEditPage } from './pages/SpecEditPage';
import { SpecExportPage } from './pages/SpecExportPage';
import { SpecGuideSpecsPage } from './pages/SpecGuideSpecsPage';
import { SpecHomePage } from './pages/SpecHomePage';
import { SpecLegacyIndexRedirect } from './pages/SpecLegacyIndexRedirect';
import { SpecProcessingPage } from './pages/SpecProcessingPage';
import { SpecProductsPage } from './pages/SpecProductsPage';
import { SpecReviewPage } from './pages/SpecReviewPage';
import { SpecSubmittalsPage } from './pages/SpecSubmittalsPage';
import { SpecSubstitutionPage } from './pages/SpecSubstitutionPage';
import { specBaselineComparisonPath, specProjectListPath } from './specNavigation';

/**
 * `SpecRoutes` mounts at two prefixes (see `App.tsx`):
 *  - `/spec/*` (legacy) — `/spec` and `/spec/:specId/...` redirect into the
 *    project-owned tree; Guide Specs stays on this prefix.
 *  - `/projects/:projectId/spec/*` (canonical) — list and document workspace.
 */
function SpecIndexRoute() {
  const { projectId } = useParams<{ projectId?: string }>();
  if (!projectId) return <SpecLegacyIndexRedirect />;
  return <SpecHomePage />;
}

/** Legacy dual upload/detail entry points superseded by the W01 modal wizard on the list. */
function SpecLegacyProjectRedirect() {
  const { projectId = '' } = useParams<{ projectId: string }>();
  return <Navigate to={specProjectListPath(projectId)} replace />;
}

/** Baseline comparison was formerly overloaded as the main Review route. */
function SpecLegacyReviewRedirect() {
  const { specId = '', projectId } = useParams<{ specId: string; projectId?: string }>();
  return <Navigate to={specBaselineComparisonPath(specId, projectId)} replace />;
}

export function SpecRoutes() {
  return (
    <Routes>
      <Route element={<SpecLayout />}>
        <Route index element={<SpecIndexRoute />} />
        <Route path="new" element={<Navigate to="/spec" replace />} />
        <Route path="guide-specs" element={<SpecGuideSpecsPage />} />
        <Route path="projects/new" element={<Navigate to="/dashboard" replace />} />
        <Route path="projects/:projectId" element={<SpecLegacyProjectRedirect />} />
        <Route path="projects/:projectId/new" element={<SpecLegacyProjectRedirect />} />
        <Route path=":specId/processing" element={<SpecProcessingPage />} />
        <Route path=":specId/analyze" element={<SpecAnalyzePage />} />
        <Route path=":specId/edit" element={<SpecEditPage />} />
        <Route path=":specId/export" element={<SpecExportPage />} />
        <Route path=":specId/review" element={<SpecLegacyReviewRedirect />} />
        <Route path=":specId/baseline-comparison" element={<SpecReviewPage />} />
        <Route path=":specId/products" element={<SpecProductsPage />} />
        <Route path=":specId/submittals" element={<SpecSubmittalsPage />} />
        <Route path=":specId/substitution" element={<SpecSubstitutionPage />} />
        <Route path=":specId/ask" element={<SpecAskPage />} />
        <Route path=":specId/deliver-back" element={<SpecDeliverBackPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/spec" replace />} />
    </Routes>
  );
}
