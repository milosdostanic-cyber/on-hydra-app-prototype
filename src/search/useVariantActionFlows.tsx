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
import { appendCatalogBomItems, partFromVariation } from './catalogBomAdd';

/** Add `'spec'` when Add to Spec ships. */
export type VariantActionId = 'bom' | 'drawing';

const GATE_LABELS: Record<VariantActionId, string> = {
  bom: 'Add to BOM',
  drawing: 'Download Drawing Files',
};

function isBomResolution(
  result: ProjectResolution,
): result is ProjectResolution & { bomProjectId: string; bomProjectName: string } {
  return 'bomProjectId' in result && 'bomProjectName' in result;
}

/** Variant-level BOM + drawing queue orchestration (no Submittal at variant level). */
export function useVariantActionFlows(partKey: string, allVariations: PartVariationRow[] = []) {
  const { message } = App.useApp();
  const { projectId, projects, setProjectId } = useActiveProject();
  const { rowsByProjectId, setWorkspaceRows } = useBomWorkspace();
  const { registerEntry } = useActionTrail();
  const { addDrawingFilesForVariations } = useRevitDownloadQueue();

  const [pending, setPending] = useState<VariantActionId | null>(null);
  const [pendingFileType, setPendingFileType] = useState<string | null>(null);
  const [pendingVariations, setPendingVariations] = useState<PartVariationRow[]>([]);
  const [gateOpen, setGateOpen] = useState(false);
  const [addBomProjectId, setAddBomProjectId] = useState<string | null>(null);
  const [bomParts, setBomParts] = useState<ReturnType<typeof partFromVariation>[]>([]);

  const finishBomAdd = (
    bomProjectId: string,
    bomProjectName: string,
    parts: ReturnType<typeof partFromVariation>[],
  ) => {
    if (parts.length === 0) return;

    const existingRows =
      rowsByProjectId[bomProjectId] ?? initialWorkspaceRowsForBomProject(bomProjectId);
    const { added, skippedSkus } = appendCatalogBomItems(existingRows, parts);

    if (added.length > 0) {
      setWorkspaceRows(bomProjectId, () => [...existingRows, ...added]);
      registerEntry({
        module: 'bom',
        subProjectId: bomProjectId,
        subProjectLabel: bomProjectName,
        partKey,
        variantKey: added.length === 1 ? added[0].sku : undefined,
        itemIds: added.map((row) => row.id),
        partCount: added.length,
      });
    }

    if (added.length > 0 && skippedSkus.length === 0) {
      message.success(
        added.length === 1
          ? `${added[0].sku} added to “${bomProjectName}”.`
          : `${added.length} variants added to “${bomProjectName}”.`,
      );
    } else if (added.length > 0 && skippedSkus.length > 0) {
      message.success(
        `${added.length} added to “${bomProjectName}”. ${skippedSkus.length} already in BOM skipped.`,
      );
    } else if (skippedSkus.length > 0) {
      message.info(
        skippedSkus.length === 1
          ? `Already in BOM — “${bomProjectName}”.`
          : `All ${skippedSkus.length} selected SKUs are already in “${bomProjectName}”.`,
      );
    }
  };

  const queueDrawingForVariations = (pid: string, fileType: string, variations: PartVariationRow[]) => {
    const eligible = variations.filter((variation) => variation.drawingFileTypes.includes(fileType));
    if (eligible.length === 0) return;

    const itemIds = addDrawingFilesForVariations({
      projectId: pid,
      partKey,
      figureNumber: partKey,
      fileType,
      variations: eligible.map((variation) => ({
        variationKey: variation.key,
        sku: variation.sku,
        displayName: `${variation.sku} — ${variation.name}`,
        thumbnailUrl: variation.thumbnailUrl,
      })),
    });

    const projectName = projects.find((p) => p.key === pid)?.name ?? 'project';
    registerEntry({
      module: 'content',
      subProjectId: pid,
      subProjectLabel: projectName,
      partKey,
      itemIds,
      partCount: itemIds.length,
    });
    message.success(
      itemIds.length === 1
        ? `1 ${fileType} file added to download queue · ${projectName}.`
        : `${itemIds.length} ${fileType} files added to download queue · ${projectName}.`,
    );
  };

  const queueFileTypeForVariations = (fileType: string, variations: PartVariationRow[]) => {
    const eligible = variations.filter((variation) => variation.drawingFileTypes.includes(fileType));
    if (eligible.length === 0) return;

    const pid = projectId;
    if (!pid) {
      setPendingFileType(fileType);
      setPendingVariations(eligible);
      setPending('drawing');
      setGateOpen(true);
      return;
    }
    queueDrawingForVariations(pid, fileType, eligible);
  };

  const requestBomAdd = (variations: PartVariationRow[]) => {
    if (variations.length === 0) return;
    const parts = variations.map(partFromVariation);
    if (projectId) {
      setBomParts(parts);
      setAddBomProjectId(projectId);
      return;
    }
    setPendingVariations(variations);
    setPending('bom');
    setGateOpen(true);
  };

  /** Legacy single-variant helper used by orphan VariantFileActions. */
  const queueSingleFileType = (fileType: string, variation: PartVariationRow) => {
    queueFileTypeForVariations(fileType, [variation]);
  };

  /** Legacy single-variant helper used by orphan VariantFileActions. */
  const requestAction = (id: VariantActionId, variation: PartVariationRow) => {
    if (id === 'bom') {
      requestBomAdd([variation]);
      return;
    }
    // drawing: open project gate then queue is not used from ActionsPanel anymore
    if (projectId) {
      setPendingVariations([variation]);
      setPending('drawing');
      // no file type yet — VariantFileActions used DrawingFileTypesModal path historically
    } else {
      setPendingVariations([variation]);
      setPending(id);
      setGateOpen(true);
    }
  };

  const handleResolved = (result: ProjectResolution) => {
    setProjectId(result.projectId);
    setGateOpen(false);

    if (pendingFileType) {
      const fileType = pendingFileType;
      const variations = pendingVariations;
      setPendingFileType(null);
      setPending(null);
      setPendingVariations([]);
      queueDrawingForVariations(result.projectId, fileType, variations);
      return;
    }

    const resume = pending;
    const variations = pendingVariations;
    setPending(null);
    setPendingVariations([]);
    if (!resume) return;

    if (resume === 'bom') {
      const parts = variations.map(partFromVariation);
      if (isBomResolution(result)) {
        finishBomAdd(result.bomProjectId, result.bomProjectName, parts);
        return;
      }
      setBomParts(parts);
      setAddBomProjectId(result.projectId);
      return;
    }
  };

  const handleAddedToBom = ({
    bomProjectId,
    bomProjectName,
    parts,
  }: {
    bomProjectId: string;
    bomProjectName: string;
    parts: ReturnType<typeof partFromVariation>[];
  }) => {
    setAddBomProjectId(null);
    setBomParts([]);
    finishBomAdd(bomProjectId, bomProjectName, parts);
  };

  const pendingGateDescription =
    pending === 'bom'
      ? 'Pick a project and BOM to add the selected variants — both in the project picker.'
      : pendingFileType
        ? 'Drawing downloads are scoped to a project. Pick a project to queue these files.'
        : undefined;

  const gateActionLabel = pendingFileType
    ? `Download ${pendingFileType} files`
    : pending
      ? GATE_LABELS[pending]
      : 'Continue';

  const modals = (
    <>
      <ProjectRequiredModal
        open={gateOpen}
        actionLabel={gateActionLabel}
        actionDescription={pendingGateDescription}
        destinationRequirement={pending === 'bom' ? 'bom' : undefined}
        onResolved={handleResolved}
        onCancel={() => {
          setGateOpen(false);
          setPending(null);
          setPendingFileType(null);
          setPendingVariations([]);
        }}
      />

      <AddToBomModal
        open={addBomProjectId !== null}
        projectId={addBomProjectId ?? ''}
        part={bomParts[0] ?? null}
        parts={bomParts.length > 0 ? bomParts : undefined}
        onBatchAdded={handleAddedToBom}
        onAdded={({ bomProjectId, bomProjectName, part }) =>
          handleAddedToBom({ bomProjectId, bomProjectName, parts: [part] })
        }
        onCancel={() => {
          setAddBomProjectId(null);
          setBomParts([]);
        }}
      />
    </>
  );

  const pillActions = useMemo(
    () => [
      { id: 'bom' as const, label: 'Add to BOM' },
      { id: 'drawing' as const, label: 'Download Drawing Files' },
    ],
    [],
  );

  return {
    requestBomAdd,
    queueFileTypeForVariations,
    queueSingleFileType,
    requestAction,
    modals,
    pillActions,
    allVariations,
  };
}
