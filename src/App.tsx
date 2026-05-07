import { Navigate, Route, Routes } from 'react-router-dom';

import { AppShell } from './shell/AppShell';
import { CatalogHome } from './shell/CatalogHome';
import { CatalogPartPage } from './shell/CatalogPartPage';
import { CatalogResults } from './shell/CatalogResults';
import {
  ContentModule,
  SalesBraceModule,
  SubmittalModule,
} from './shell/ProjectModuleStubs';
import { ProjectReframingProposalPage } from './shell/ProjectReframingProposalPage';
import { BomRoutes } from './bom/BomRoutes';
import { HomeHubPage } from './shell/HomeHubPage';
import { ProjectWorkspaceLayout } from './shell/ProjectWorkspaceLayout';
import { ShellHomeContent } from './shell/ShellHomeContent';

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/projects" replace />} />
        <Route path="/dashboard" element={<HomeHubPage />} />
        <Route path="/projects" element={<ShellHomeContent />} />
        <Route path="/projects/reframing-proposal" element={<ProjectReframingProposalPage />} />
        <Route path="/catalog" element={<CatalogHome />} />
        <Route path="/catalog/results" element={<CatalogResults />} />
        <Route path="/catalog/parts/:partId" element={<CatalogPartPage />} />
        <Route path="/bom/*" element={<BomRoutes />} />

        <Route path="/projects/:projectId" element={<ProjectWorkspaceLayout />}>
          <Route index element={<Navigate to="content" replace />} />
          <Route path="seis-brace" element={<SalesBraceModule />} />
          <Route path="sales-brace" element={<SalesBraceModule />} />
          <Route path="submittal" element={<SubmittalModule />} />
          <Route path="content" element={<ContentModule />} />
        </Route>
      </Route>
    </Routes>
  );
}
