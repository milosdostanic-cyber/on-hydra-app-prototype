import { DownOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AddToBomModal } from '../bom/components/AddToBomModal';
import { useActiveProject } from '../context/ActiveProjectContext';
import { useSubmittalPackages } from '../context/SubmittalPackagesContext';
import { ProjectRequiredModal } from '../shell/ProjectRequiredModal';
import { AddToPackageModal } from '../submittal/components/AddToPackageModal';
import { SubmittalPackageCartFloatingButton } from '../submittal/components/SubmittalPackageCartFloatingButton';
import { RevitDownloadQueueFloatingButton } from './components/RevitDownloadQueueFloatingButton';
import { useRevitDownloadQueue } from './revitDownloadQueue';
import { App, Button, Dropdown } from '../ui/antd';
import type { MenuProps } from '../ui/antd';
import type { CatalogPartRow } from '../catalog/catalogDemoData';

/** Extensible menu keys — add `spec` later without restructuring. */
type AddToActionId = 'bom' | 'revit-queue' | 'revit-quick' | 'submittal';

const ADD_TO_OPTIONS: { key: AddToActionId; label: string; gateDescription: string }[] = [
  {
    key: 'bom',
    label: 'BOM',
    gateDescription: 'Bills of materials live under a project. Pick a project to add this part.',
  },
  {
    key: 'revit-queue',
    label: 'Add Revit File',
    gateDescription: 'Revit downloads are scoped to a project. Pick a project to queue this file.',
  },
  {
    key: 'revit-quick',
    label: 'Quick Download Revit File',
    gateDescription: 'Quick downloads are scoped to a project. Pick a project to download this file.',
  },
  {
    key: 'submittal',
    label: 'Submittal Manager',
    gateDescription: 'Submittal packages live under a project. Pick a project to add this cut sheet.',
  },
];

const GATE_LABELS: Record<AddToActionId, string> = {
  bom: 'BOM',
  'revit-queue': 'Add Revit File',
  'revit-quick': 'Quick Download Revit File',
  submittal: 'Submittal Manager',
};

/**
 * Part detail primary CTA — single “Add to” dropdown with project-gated flows.
 * Reuses {@link ProjectRequiredModal}, {@link AddToBomModal}, {@link AddToPackageModal},
 * and module-level Revit download queue (same pattern as submittal session cart).
 */
export function UnifiedPartActions({ part }: { part: CatalogPartRow }) {
  const { message, notification } = App.useApp();
  const navigate = useNavigate();
  const { projectId, projects, setProjectId } = useActiveProject();
  const { addCartItem } = useSubmittalPackages();
  const { addToQueue } = useRevitDownloadQueue();

  const [pending, setPending] = useState<AddToActionId | null>(null);
  const [gateOpen, setGateOpen] = useState(false);
  const [addBomProjectId, setAddBomProjectId] = useState<string | null>(null);
  const [addPackageProjectId, setAddPackageProjectId] = useState<string | null>(null);

  const partPayload = useMemo(
    () => ({
      partKey: part.key,
      sku: part.sku,
      displayName: `${part.sku} — ${part.description}`,
      figureNumber: part.sku,
    }),
    [part],
  );

  const execute = (id: AddToActionId, pid: string) => {
    const projectName = projects.find((p) => p.key === pid)?.name ?? 'project';
    switch (id) {
      case 'bom':
        setAddBomProjectId(pid);
        break;
      case 'revit-queue':
        addToQueue({ projectId: pid, partKey: part.key, sku: part.sku });
        message.success(`${part.sku}.rfa added to download queue · ${projectName}.`);
        break;
      case 'revit-quick':
        console.info('[unified-search] revit-quick-download', {
          partKey: part.key,
          sku: part.sku,
          fileName: `${part.sku}.rfa`,
          projectId: pid,
        });
        message.success(`Downloading ${part.sku}.rfa · ${projectName} (stub).`);
        break;
      case 'submittal':
        setAddPackageProjectId(pid);
        break;
    }
  };

  const handleAddedToBom = ({ bomProjectId, bomProjectName }: { bomProjectId: string; bomProjectName: string }) => {
    setAddBomProjectId(null);
    message.success(`${part.sku} added to “${bomProjectName}”.`);
    navigate(`/bom/projects/${bomProjectId}/workspace`);
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

  const requestAction = (id: AddToActionId) => {
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

  const pendingDef = pending ? ADD_TO_OPTIONS.find((o) => o.key === pending) : undefined;

  const menuItems: MenuProps['items'] = ADD_TO_OPTIONS.map((opt) => ({
    key: opt.key,
    label: opt.label,
    onClick: () => requestAction(opt.key),
  }));

  return (
    <>
      <Dropdown menu={{ items: menuItems }} trigger={['click']}>
        <Button type="primary">
          Add to <DownOutlined />
        </Button>
      </Dropdown>

      <ProjectRequiredModal
        open={gateOpen}
        actionLabel={pending ? GATE_LABELS[pending] : 'Continue'}
        actionDescription={pendingDef?.gateDescription}
        onResolved={handleResolved}
        onCancel={() => {
          setGateOpen(false);
          setPending(null);
        }}
      />

      <AddToBomModal
        open={addBomProjectId !== null}
        projectId={addBomProjectId ?? ''}
        part={addBomProjectId ? partPayload : null}
        onAdded={handleAddedToBom}
        onCancel={() => setAddBomProjectId(null)}
      />

      <AddToPackageModal
        open={addPackageProjectId !== null}
        projectId={addPackageProjectId ?? ''}
        part={addPackageProjectId ? partPayload : null}
        title="Submittal Manager"
        onAdded={handleAddedToPackage}
        onCancel={() => setAddPackageProjectId(null)}
      />

      <RevitDownloadQueueFloatingButton />
      <SubmittalPackageCartFloatingButton />
    </>
  );
}
