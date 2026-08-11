import { BomPageHeader } from '../bom/layout/BomPageHeader';
import { useParams } from 'react-router-dom';

import { PageBackButton } from './PageBackButton';
import { Space, theme } from '../ui/antd';

export { DownloadCenterPage as ContentModule } from './content/DownloadCenterPage';

export function SalesBraceModule() {
  const { token } = theme.useToken();
  const { projectId = '' } = useParams<{ projectId: string }>();
  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to={`/projects/${projectId}/content`}>Back to project workspace</PageBackButton>
      <BomPageHeader
        title="Spec"
        description="Sales brace (stub): this level will show design names and brace visuals — a different layout than Submittal / Content, by product design."
      />
    </Space>
  );
}

export function ProjectReframingProposalModule() {
  const { token } = theme.useToken();
  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to="/dashboard">Back to home</PageBackButton>
      <BomPageHeader
        title="Project Reframing Proposal"
        description="Proposal workspace (stub). Use this route for Project Reframing Proposal flow and content."
      />
    </Space>
  );
}

/** Top-level nav destination — no plug-in content in prototype yet (same stub pattern as Spec). */
export function RevitPlugInModule() {
  const { token } = theme.useToken();
  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to="/dashboard">Back to home</PageBackButton>
      <BomPageHeader
        title="Revit Plug-in"
        description="Plug-in overview, download, installation, and support will live here. No content in this prototype yet."
      />
    </Space>
  );
}

/** Top-level nav destination — no knowledge-center content in prototype yet (same stub pattern as Spec). */
export function KnowledgeCenterModule() {
  const { token } = theme.useToken();
  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to="/dashboard">Back to home</PageBackButton>
      <BomPageHeader
        title="Knowledge Center"
        description="Documentation, guides, and shared resources will live here. No content in this prototype yet."
      />
    </Space>
  );
}
