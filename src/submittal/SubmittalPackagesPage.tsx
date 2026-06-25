import { PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { BomPageHeader } from '../bom/layout/BomPageHeader';
import { useActionTrail, useActionTrailModuleLifecycle } from '../context/ActionTrailContext';
import { useSubmittalPackages } from '../context/SubmittalPackagesContext';
import { PageBackButton } from '../shell/PageBackButton';
import { Button, Empty, Space, Tooltip, Typography, theme } from '../ui/antd';
import { PackageCard } from './components/PackageCard';
import { PackageCreateEditModal } from './components/PackageCreateEditModal';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import type { SubmittalPackage } from './types';

/**
 * Submittal packages list for the active construction project — replaces the old `SubmittalModule`
 * stub at `/projects/:projectId/submittal`. Construction project context (title, breadcrumb) is
 * provided by the shell, so this page only owns the packages surface.
 */
export function SubmittalPackagesPage() {
  const { token } = theme.useToken();
  const { projectId = '' } = useParams<{ projectId: string }>();
  useActionTrailModuleLifecycle('submittal');
  const { packagesForProject, createPackage, updatePackage } = useSubmittalPackages();
  const packages = packagesForProject(projectId);

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<SubmittalPackage | null>(null);
  const [previewing, setPreviewing] = useState<SubmittalPackage | null>(null);

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to={`/projects/${projectId}/content`}>Back to project workspace</PageBackButton>

      <BomPageHeader
        title="Submittal packages"
        description="Group cut sheets into packages, then preview and download the submittal PDF."
        actions={
          <Tooltip title="New package">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateOpen(true)}
              aria-label="New package"
            />
          </Tooltip>
        }
      />

      {packages.length > 0 ? (
        <Space orientation="vertical" size={token.marginMD} style={{ width: '100%' }}>
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onDownload={setPreviewing}
              onEdit={setEditing}
            />
          ))}
        </Space>
      ) : (
        <Empty
          description={
            <Space orientation="vertical" size={token.marginXS}>
              <Typography.Text strong>No submittal packages yet.</Typography.Text>
              <Typography.Text type="secondary">
                Create a package, then add cut sheets from search.
              </Typography.Text>
            </Space>
          }
        >
          <Tooltip title="New package">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateOpen(true)}
              aria-label="New package"
            />
          </Tooltip>
        </Empty>
      )}

      <PackageCreateEditModal
        open={createOpen}
        onSubmit={(name) => {
          createPackage(projectId, name);
          setCreateOpen(false);
        }}
        onCancel={() => setCreateOpen(false)}
      />

      <PackageCreateEditModal
        open={editing !== null}
        initialName={editing?.name ?? ''}
        onSubmit={(name) => {
          if (editing) updatePackage(editing.id, name);
          setEditing(null);
        }}
        onCancel={() => setEditing(null)}
      />

      <PdfPreviewModal open={previewing !== null} pkg={previewing} onCancel={() => setPreviewing(null)} />
    </Space>
  );
}
