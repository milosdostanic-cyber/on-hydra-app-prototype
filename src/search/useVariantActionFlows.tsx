import { useMemo, useState } from 'react';

import { AddToBomModal } from '../bom/components/AddToBomModal';
import { initialWorkspaceRowsForBomProject } from '../context/BomWorkspaceContext';
import { useBomWorkspace } from '../context/BomWorkspaceContext';
import { useActionTrail } from '../context/ActionTrailContext';
import { useActiveProject } from '../context/ActiveProjectContext';
import {
  ProjectRequiredModal,
  type ProjectResolution,
} from '../shell/ProjectRequiredModal';
import { App } from '../ui/antd';
import type { PartVariationRow } from './partDetailDemoData';
import { useRevitDownloadQueue } from './revitDownloadQueue';
import { DrawingFileTypesModal } from './components/DrawingFileTypesModal';
import { buildCatalogBomItem, isSkuInBomRows } from './catalogBomAdd';

/** Add `'spec'` when Add to Spec ships. */
export type VariantActionId = 'bom' | 'drawing';

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

/** Variant-level BOM + drawing queue orchestration (no Submittal at variant level). */
export function useVariantActionFlows(partKey: string, variation: PartVariationRow | null) {
  const { message } = App.useApp();
  const { projectId, projects, setProjectId } = useActiveProject();
  const { rowsByProjectId, setWorkspaceRows } = useBomWorkspace();
  const { registerEntry } = useActionTrail();
  const { addDrawingFilesToQueue } = useRevitDownloadQueue();

  const [pending, setPending] = useState<VariantActionId | null>(null);
  const [pendingFileType, setPendingFileType] = useState<string | null>(null);
  const [gateOpen, setGateOpen] = useState(false);
  const [addBomProjectId, setAddBomProjectId] = useState<string | null>(null);
  const [drawingModalOpen, setDrawingModalOpen] = useState(false);
  const [drawingProjectId, setDrawingProjectId] = useState<string | null>(null);

  const partPayload = useMemo(
    () =>
      variation
        ? {
            partKey: variation.key,
            sku: variation.sku,
            displayName: `${variation.sku} — ${variation.name}`,
          }
        : null,
    [variation],
  );

  const finishBomAdd = (bomProjectId: string, bomProjectName: string) => {
    if (!variation) return;
    const existingRows =
      rowsByProjectId[bomProjectId] ?? initialWorkspaceRowsForBomProject(bomProjectId);
    if (isSkuInBomRows(existingRows, variation.sku)) {
      message.info(`Already in BOM — “${bomProjectName}”.`);
      return;
    }

    const newRow = buildCatalogBomItem(
      {
        partKey: variation.key,
        sku: variation.sku,
        displayName: `${variation.sku} — ${variation.name}`,
      },
      existingRows.length,
    );
    setWorkspaceRows(bomProjectId, (prev) => [...prev, newRow]);

    registerEntry({
      module: 'bom',
      subProjectId: bomProjectId,
      subProjectLabel: bomProjectName,
      partKey: variation.key,
      variantKey: variation.key,
      itemIds: [newRow.id],
    });

    message.success(`${variation.sku} added to “${bomProjectName}”.`);
  };

  const openDrawingPicker = (pid: string) => {
    setDrawingProjectId(pid);
    setDrawingModalOpen(true);
  };

  const queueDrawingFiles = (pid: string, fileTypes: string[]) => {
    if (!variation || fileTypes.length === 0) return;
    const itemIds = addDrawingFilesToQueue({
      projectId: pid,
      partKey,
      variationKey: variation.key,
      sku: variation.sku,
      fileTypes,
    });
    const projectName = projects.find((p) => p.key === pid)?.name ?? 'project';
    registerEntry({
      module: 'content',
      subProjectId: pid,
      subProjectLabel: projectName,
      partKey,
      variantKey: variation.key,
      itemIds,
      partCount: itemIds.length,
    });
    message.success(
      `${fileTypes.length} drawing file${fileTypes.length === 1 ? '' : 's'} added to download queue · ${projectName}.`,
    );
    setDrawingModalOpen(false);
    setDrawingProjectId(null);
  };

  const queueSingleFileType = (fileType: string) => {
    if (!variation) return;
    const pid = projectId;
    if (!pid) {
      setPendingFileType(fileType);
      setGateOpen(true);
      return;
    }
    queueDrawingFiles(pid, [fileType]);
  };

  const execute = (id: VariantActionId, pid: string) => {
    if (!variation) return;
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
    if (!variation) return;
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

    if (pendingFileType) {
      const fileType = pendingFileType;
      setPendingFileType(null);
      queueDrawingFiles(result.projectId, [fileType]);
      return;
    }

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

  const gateActionLabel = pendingFileType
    ? `Add ${pendingFileType} to Downloads`
    : pending
      ? GATE_LABELS[pending]
      : 'Continue';

  const modals = (
    <>
      <ProjectRequiredModal
        open={gateOpen}
        actionLabel={gateActionLabel}
        bomSku={pending === 'bom' ? variation?.sku : undefined}
        actionDescription={
          pendingFileType
            ? 'Drawing downloads are scoped to a project. Pick a project to queue this file.'
            : pendingDef?.gateDescription
        }
        destinationRequirement={pending === 'bom' ? 'bom' : undefined}
        onResolved={handleResolved}
        onCancel={() => {
          setGateOpen(false);
          setPending(null);
          setPendingFileType(null);
        }}
      />

      <AddToBomModal
        open={addBomProjectId !== null}
        projectId={addBomProjectId ?? ''}
        part={addBomProjectId && partPayload ? partPayload : null}
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

  const pillActions = useMemo(
    () =>
      VARIANT_ACTION_OPTIONS.map(({ key, label }) => ({
        id: key,
        label: key === 'bom' ? `Add to ${label}` : label,
      })),
    [],
  );

  return {
    requestAction,
    queueSingleFileType,
    modals,
    pillActions,
  };
}
