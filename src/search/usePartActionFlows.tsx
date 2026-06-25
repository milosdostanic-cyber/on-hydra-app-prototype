import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AddToBomModal } from '../bom/components/AddToBomModal';
import { initialWorkspaceRowsForBomProject } from '../context/BomWorkspaceContext';
import { useBomWorkspace } from '../context/BomWorkspaceContext';
import { useActionTrail } from '../context/ActionTrailContext';
import { useActiveProject } from '../context/ActiveProjectContext';
import { useSubmittalPackages, findSubmittalPartRowId, isPartInAnySubmittalPackage } from '../context/SubmittalPackagesContext';
import {
  ProjectRequiredModal,
  type ProjectDestinationRequirement,
  type ProjectResolution,
} from '../shell/ProjectRequiredModal';
import { AddToPackageModal } from '../submittal/components/AddToPackageModal';
import { App, Button } from '../ui/antd';
import { buildCatalogBomItem, isSkuInBomRows } from './catalogBomAdd';
import { useRevitDownloadQueue } from './revitDownloadQueue';

export type FigureActionId = 'bom' | 'revit-queue' | 'revit-quick' | 'submittal';

export type PartActionPayload = {
  partKey: string;
  sku: string;
  displayName: string;
  figureNumber: string;
};

const ACTION_OPTIONS: { key: FigureActionId; label: string; gateDescription: string }[] = [
  {
    key: 'bom',
    label: 'Add to BOM',
    gateDescription: 'Pick a project and BOM to add this figure — both in the project picker.',
  },
  {
    key: 'revit-queue',
    label: 'Add Revit File to Downloads',
    gateDescription: 'Revit downloads are scoped to a project. Pick a project to queue this file.',
  },
  {
    key: 'revit-quick',
    label: 'Quick Download Revit File',
    gateDescription: '',
  },
  {
    key: 'submittal',
    label: 'Add to Submittal Package',
    gateDescription: 'Pick a project and submittal package — both in the project picker.',
  },
];

const GATE_LABELS: Record<FigureActionId, string> = {
  bom: 'Add to BOM',
  'revit-queue': 'Add Revit File to Downloads',
  'revit-quick': 'Quick Download Revit File',
  submittal: 'Add to Submittal Package',
};

function destinationRequirementForAction(id: FigureActionId): ProjectDestinationRequirement | undefined {
  if (id === 'bom') return 'bom';
  if (id === 'submittal') return 'submittal';
  return undefined;
}

function isBomResolution(
  result: ProjectResolution,
): result is ProjectResolution & { bomProjectId: string; bomProjectName: string } {
  return 'bomProjectId' in result && 'bomProjectName' in result;
}

function isSubmittalResolution(
  result: ProjectResolution,
): result is ProjectResolution & { packageId: string; packageName: string } {
  return 'packageId' in result && 'packageName' in result;
}

/** Shared figure-level BOM / Revit / Submittal orchestration for the part detail page. */
export function usePartActionFlows(payload: PartActionPayload) {
  const { message, notification } = App.useApp();
  const navigate = useNavigate();
  const { projectId, projects, setProjectId } = useActiveProject();
  const { addCartItem, addPartToPackage } = useSubmittalPackages();
  const { rowsByProjectId, setWorkspaceRows } = useBomWorkspace();
  const { registerEntry, consumeForModule } = useActionTrail();
  const { addToQueue } = useRevitDownloadQueue();

  const [pending, setPending] = useState<FigureActionId | null>(null);
  const [gateOpen, setGateOpen] = useState(false);
  const [addBomProjectId, setAddBomProjectId] = useState<string | null>(null);
  const [addPackageProjectId, setAddPackageProjectId] = useState<string | null>(null);

  const partPayload = useMemo(
    () => ({
      partKey: payload.partKey,
      sku: payload.sku,
      displayName: payload.displayName,
      figureNumber: payload.figureNumber,
    }),
    [payload],
  );

  const isInSubmittalPackage = useMemo(
    () => isPartInAnySubmittalPackage(payload.partKey),
    [payload.partKey],
  );

  const finishBomAdd = (bomProjectId: string, bomProjectName: string) => {
    const existingRows =
      rowsByProjectId[bomProjectId] ?? initialWorkspaceRowsForBomProject(bomProjectId);
    if (isSkuInBomRows(existingRows, payload.sku)) {
      message.info(`Already in BOM — “${bomProjectName}”.`);
      return;
    }

    const newRow = buildCatalogBomItem(
      {
        partKey: payload.partKey,
        sku: payload.sku,
        displayName: payload.displayName,
        figureNumber: payload.figureNumber,
      },
      existingRows.length,
    );
    setWorkspaceRows(bomProjectId, (prev) => [...prev, newRow]);

    registerEntry({
      module: 'bom',
      subProjectId: bomProjectId,
      subProjectLabel: bomProjectName,
      partKey: payload.partKey,
      itemIds: [newRow.id],
    });

    message.success(`${payload.sku} added to “${bomProjectName}”.`);
  };

  const finishSubmittalAdd = (
    pid: string,
    packageId: string,
    packageName: string,
    options?: { partAlreadyAdded?: boolean },
  ) => {
    const existingRowId = findSubmittalPartRowId(packageId, payload.partKey);
    if (existingRowId && !options?.partAlreadyAdded) {
      message.info(`Already in submittal package — “${packageName}”.`);
      return;
    }

    let partRowId = existingRowId;
    if (!partRowId) {
      if (!options?.partAlreadyAdded) {
        addPartToPackage(packageId, {
          partKey: payload.partKey,
          displayName: payload.displayName,
          figureNumber: payload.figureNumber,
        });
      }
      partRowId = findSubmittalPartRowId(packageId, payload.partKey);
    }
    if (!partRowId) return;

    addCartItem({ partKey: payload.partKey, packageId });

    registerEntry({
      module: 'submittal',
      subProjectId: packageId,
      subProjectLabel: packageName,
      partKey: payload.partKey,
      itemIds: [partRowId],
    });

    notification.success({
      message: 'Added to submittal package',
      description: `${payload.sku} cut sheet added to “${packageName}”.`,
      btn: (
        <Button
          type="primary"
          size="small"
          onClick={() => {
            notification.destroy();
            consumeForModule('submittal', packageId);
            navigate(`/projects/${pid}/submittal`);
          }}
        >
          Go to packages
        </Button>
      ),
    });
  };

  const execute = (id: FigureActionId, pid: string) => {
    const projectName = projects.find((p) => p.key === pid)?.name ?? 'project';
    switch (id) {
      case 'bom':
        setAddBomProjectId(pid);
        break;
      case 'revit-queue': {
        const queueId = addToQueue({ projectId: pid, partKey: payload.partKey, sku: payload.sku });
        registerEntry({
          module: 'content',
          subProjectId: pid,
          subProjectLabel: projectName,
          partKey: payload.partKey,
          itemIds: [queueId],
        });
        message.success(`${payload.sku}.rfa added to download queue · ${projectName}.`);
        break;
      }
      case 'revit-quick':
        console.info('[unified-search] revit-quick-download', {
          partKey: payload.partKey,
          sku: payload.sku,
          fileName: `${payload.sku}.rfa`,
        });
        message.success(`Downloading ${payload.sku}.rfa (stub).`);
        break;
      case 'submittal':
        setAddPackageProjectId(pid);
        break;
    }
  };

  const handleAddedToBom = ({ bomProjectId, bomProjectName }: { bomProjectId: string; bomProjectName: string }) => {
    setAddBomProjectId(null);
    finishBomAdd(bomProjectId, bomProjectName);
  };

  const handleAddedToPackage = ({ packageId, packageName }: { packageId: string; packageName: string }) => {
    const pid = addPackageProjectId;
    setAddPackageProjectId(null);
    if (pid) finishSubmittalAdd(pid, packageId, packageName, { partAlreadyAdded: true });
  };

  const requestAction = (id: FigureActionId) => {
    if (id === 'revit-quick') {
      execute(id, projectId ?? '');
      return;
    }
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

    if (resume === 'submittal' && isSubmittalResolution(result)) {
      finishSubmittalAdd(result.projectId, result.packageId, result.packageName);
      return;
    }

    execute(resume, result.projectId);
  };

  const pendingDef = pending ? ACTION_OPTIONS.find((o) => o.key === pending) : undefined;

  const modals = (
    <>
      <ProjectRequiredModal
        open={gateOpen}
        actionLabel={pending ? GATE_LABELS[pending] : 'Continue'}
        actionDescription={pendingDef?.gateDescription}
        destinationRequirement={pending ? destinationRequirementForAction(pending) : undefined}
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
        title="Add to Submittal Package"
        onAdded={handleAddedToPackage}
        onCancel={() => setAddPackageProjectId(null)}
      />
    </>
  );

  return {
    requestAction,
    modals,
    actionLabels: ACTION_OPTIONS.map((o) => ({ id: o.key, label: o.label })),
    isInSubmittalPackage,
  };
}
