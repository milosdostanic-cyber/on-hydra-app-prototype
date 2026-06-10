import { DownOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AddToBomModal } from '../../bom/components/AddToBomModal';
import { useActiveProject } from '../../context/ActiveProjectContext';
import {
  ProjectRequiredModal,
  type ProjectResolution,
} from '../../shell/ProjectRequiredModal';
import { App, Button, Dropdown } from '../../ui/antd';
import type { MenuProps } from '../../ui/antd';
import type { PartVariationRow } from '../partDetailDemoData';
import { useRevitDownloadQueue } from '../revitDownloadQueue';
import { DrawingFileTypesModal } from './DrawingFileTypesModal';

/** Add `'spec'` when Add to Spec ships. */
type VariantActionId = 'bom' | 'drawing';

const VARIANT_ACTION_OPTIONS: { key: VariantActionId; label: string; gateDescription: string }[] = [
  {
    key: 'bom',
    label: 'BOM',
    gateDescription: 'Pick a project and BOM to add this variant — both in the project picker.',
  },
  {
    key: 'drawing',
    label: 'Download Drawing Files',
    gateDescription: 'Drawing downloads are scoped to a project. Pick a project, then choose file types.',
  },
];

const GATE_LABELS: Record<VariantActionId, string> = {
  bom: 'BOM',
  drawing: 'Download Drawing Files',
};

function isBomResolution(
  result: ProjectResolution,
): result is ProjectResolution & { bomProjectId: string; bomProjectName: string } {
  return 'bomProjectId' in result && 'bomProjectName' in result;
}

type Props = {
  partKey: string;
  variation: PartVariationRow;
};

/**
 * Per-row “Add to” dropdown for part variant files (sizes & variations table).
 * BOM + drawing queue only — Submittal Manager is figure-level, not variant-level.
 */
export function PartVariantActions({ partKey, variation }: Props) {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { projectId, projects, setProjectId } = useActiveProject();
  const { addDrawingFilesToQueue } = useRevitDownloadQueue();

  const [pending, setPending] = useState<VariantActionId | null>(null);
  const [gateOpen, setGateOpen] = useState(false);
  const [addBomProjectId, setAddBomProjectId] = useState<string | null>(null);
  const [drawingModalOpen, setDrawingModalOpen] = useState(false);
  const [drawingProjectId, setDrawingProjectId] = useState<string | null>(null);

  const partPayload = useMemo(
    () => ({
      partKey: variation.key,
      sku: variation.sku,
      displayName: `${variation.sku} — ${variation.name}`,
    }),
    [variation],
  );

  const finishBomAdd = (bomProjectId: string, bomProjectName: string) => {
    message.success(`${variation.sku} added to “${bomProjectName}”.`);
    navigate(`/bom/projects/${bomProjectId}/workspace`);
  };

  const openDrawingPicker = (pid: string) => {
    setDrawingProjectId(pid);
    setDrawingModalOpen(true);
  };

  const queueDrawingFiles = (pid: string, fileTypes: string[]) => {
    addDrawingFilesToQueue({
      projectId: pid,
      partKey,
      variationKey: variation.key,
      sku: variation.sku,
      fileTypes,
    });
    const projectName = projects.find((p) => p.key === pid)?.name ?? 'project';
    message.success(
      `${fileTypes.length} drawing file${fileTypes.length === 1 ? '' : 's'} added to download queue · ${projectName}.`,
    );
    setDrawingModalOpen(false);
    setDrawingProjectId(null);
  };

  const execute = (id: VariantActionId, pid: string) => {
    switch (id) {
      case 'bom':
        setAddBomProjectId(pid);
        break;
      case 'drawing':
        openDrawingPicker(pid);
        break;
    }
  };

  const handleAddedToBom = ({ bomProjectId, bomProjectName }: { bomProjectId: string; bomProjectName: string }) => {
    setAddBomProjectId(null);
    finishBomAdd(bomProjectId, bomProjectName);
  };

  const requestAction = (id: VariantActionId) => {
    if (projectId) {
      execute(id, projectId);
    } else {
      setPending(id);
      setGateOpen(true);
    }
  };

  const handleResolved = (result: ProjectResolution) => {
    setProjectId(result.projectId);
    setGateOpen(false);
    const resume = pending;
    setPending(null);
    if (!resume) return;

    if (resume === 'bom' && isBomResolution(result)) {
      finishBomAdd(result.bomProjectId, result.bomProjectName);
      return;
    }

    if (resume === 'drawing') {
      openDrawingPicker(result.projectId);
      return;
    }

    execute(resume, result.projectId);
  };

  const handleDrawingConfirm = (fileTypes: string[]) => {
    const pid = drawingProjectId ?? projectId;
    if (!pid) return;
    queueDrawingFiles(pid, fileTypes);
  };

  const pendingDef = pending ? VARIANT_ACTION_OPTIONS.find((o) => o.key === pending) : undefined;

  const menuItems: MenuProps['items'] = VARIANT_ACTION_OPTIONS.map((opt) => ({
    key: opt.key,
    label: opt.label,
    onClick: () => requestAction(opt.key),
  }));

  return (
    <>
      <Dropdown menu={{ items: menuItems }} trigger={['click']}>
        <Button type="primary" size="small">
          Add to <DownOutlined />
        </Button>
      </Dropdown>

      <ProjectRequiredModal
        open={gateOpen}
        actionLabel={pending ? GATE_LABELS[pending] : 'Continue'}
        actionDescription={pendingDef?.gateDescription}
        destinationRequirement={pending === 'bom' ? 'bom' : undefined}
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

      <DrawingFileTypesModal
        open={drawingModalOpen}
        variation={drawingModalOpen ? variation : null}
        onConfirm={handleDrawingConfirm}
        onCancel={() => {
          setDrawingModalOpen(false);
          setDrawingProjectId(null);
        }}
      />
    </>
  );
}
