import { DownloadOutlined, InboxOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useActiveProject } from '../context/ActiveProjectContext';
import { useSubmittalPackages } from '../context/SubmittalPackagesContext';
import { ProjectRequiredModal } from '../shell/ProjectRequiredModal';
import { AddToPackageModal } from '../submittal/components/AddToPackageModal';
import { SubmittalPackageCartFloatingButton } from '../submittal/components/SubmittalPackageCartFloatingButton';
import { App, Button, Flex, Space, Typography, theme } from '../ui/antd';
import type { CatalogPartRow } from '../catalog/catalogDemoData';

type UnifiedActionId = 'download' | 'submittal' | 'bom';

type ActionDef = {
  id: UnifiedActionId;
  label: string;
  icon: React.ReactNode;
  primary?: boolean;
  /** All unified actions require an active project (PNG flow — Download is gated too). */
  gateDescription: string;
};

const ACTIONS: ActionDef[] = [
  {
    id: 'download',
    label: 'Download',
    icon: <DownloadOutlined />,
    gateDescription: 'Downloads are scoped to a project so usage is tracked. Pick a project to download.',
  },
  {
    id: 'submittal',
    label: 'Add to submittal',
    icon: <InboxOutlined />,
    primary: true,
    gateDescription: 'Submittal packages live under a project. Pick a project to add this cut sheet.',
  },
  {
    id: 'bom',
    label: 'Add to BOM',
    icon: <UnorderedListOutlined />,
    gateDescription: 'Bills of materials live under a project. Pick a project to add this part.',
  },
];

/**
 * Unified Action Bar (PNG flow). Every action is project-gated: clicking without an active
 * project opens {@link ProjectRequiredModal}; after the user selects or creates a project the
 * pending action resumes automatically and the module-specific handoff runs.
 *
 * `layout="header"` — primary BOM + link-style submittal/download (part detail hero).
 * `layout="stack"` — default button row with helper copy (legacy inline use).
 */
export function UnifiedPartActions({
  part,
  layout = 'stack',
}: {
  part: CatalogPartRow;
  layout?: 'stack' | 'header';
}) {
  const { token } = theme.useToken();
  const { message, notification } = App.useApp();
  const navigate = useNavigate();
  const { projectId, project, projects, setProjectId } = useActiveProject();
  const { addCartItem } = useSubmittalPackages();

  const [pending, setPending] = useState<UnifiedActionId | null>(null);
  const [gateOpen, setGateOpen] = useState(false);
  /** When set, the AddToPackageModal is open and scoped to this construction project. */
  const [addPackageProjectId, setAddPackageProjectId] = useState<string | null>(null);

  const execute = (id: UnifiedActionId, pid: string) => {
    const projectName = projects.find((p) => p.key === pid)?.name ?? 'project';
    switch (id) {
      case 'download':
        // Audit hook (prod: emit a download event with projectId for the "zero orphaned actions" metric).
        console.info('[unified-search] download', { partKey: part.key, sku: part.sku, projectId: pid });
        message.success(`Download queued for ${part.sku} · ${projectName} (stub).`);
        break;
      case 'submittal':
        setAddPackageProjectId(pid);
        break;
      case 'bom':
        message.success(`Opening BOM for ${projectName} to add ${part.sku}.`);
        navigate('/bom');
        break;
    }
  };

  const handleAddedToPackage = ({ packageId, packageName }: { packageId: string; packageName: string }) => {
    const pid = addPackageProjectId;
    setAddPackageProjectId(null);
    if (pid) addCartItem({ partKey: part.key, packageId });
    notification.success({
      message: 'Added to submittal package',
      description: `${part.sku} cut sheet added to “${packageName}”.`,
      btn: (
        <Button
          type="primary"
          size="small"
          onClick={() => {
            notification.destroy();
            if (pid) navigate(`/projects/${pid}/submittal`);
          }}
        >
          Go to packages
        </Button>
      ),
    });
  };

  const requestAction = (id: UnifiedActionId) => {
    if (projectId) {
      execute(id, projectId);
    } else {
      setPending(id);
      setGateOpen(true);
    }
  };

  const handleResolved = (pid: string) => {
    setProjectId(pid);
    setGateOpen(false);
    const resume = pending;
    setPending(null);
    if (resume) execute(resume, pid);
  };

  const pendingDef = ACTIONS.find((a) => a.id === pending);

  const actionButtons =
    layout === 'header' ? (
      <Flex wrap="wrap" gap={token.marginSM} align="center">
        <Button type="primary" icon={<UnorderedListOutlined />} onClick={() => requestAction('bom')}>
          Add to BOM
        </Button>
        <Button type="link" icon={<InboxOutlined />} onClick={() => requestAction('submittal')}>
          Add to submittal
        </Button>
        <Button type="link" icon={<DownloadOutlined />} onClick={() => requestAction('download')}>
          Download
        </Button>
      </Flex>
    ) : (
      <Flex wrap="wrap" gap={token.margin} align="center">
        {ACTIONS.map((action) => (
          <Button
            key={action.id}
            type={action.primary ? 'primary' : 'default'}
            icon={action.icon}
            onClick={() => requestAction(action.id)}
          >
            {action.label}
          </Button>
        ))}
      </Flex>
    );

  return (
    <Space orientation="vertical" size={token.marginSM} style={{ width: layout === 'header' ? undefined : '100%' }}>
      {actionButtons}
      {layout === 'stack' ? (
        <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          {project
            ? `Actions apply to ${project.name}. Switch projects from the top bar.`
            : 'Download, submittal, and BOM all need a project — we’ll ask for one when you click.'}
        </Typography.Text>
      ) : null}

      <ProjectRequiredModal
        open={gateOpen}
        actionLabel={pendingDef?.label ?? 'Continue'}
        actionDescription={pendingDef?.gateDescription}
        onResolved={handleResolved}
        onCancel={() => {
          setGateOpen(false);
          setPending(null);
        }}
      />

      <AddToPackageModal
        open={addPackageProjectId !== null}
        projectId={addPackageProjectId ?? ''}
        part={{ partKey: part.key, displayName: `${part.sku} — ${part.description}`, figureNumber: part.sku }}
        onAdded={handleAddedToPackage}
        onCancel={() => setAddPackageProjectId(null)}
      />

      <SubmittalPackageCartFloatingButton />
    </Space>
  );
}
