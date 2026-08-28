import { specProjectListPath } from '../spec/specNavigation';
import { flatProjectWorkspacePath } from './umbrellaCompany';

export type DeliverableKind = 'bom' | 'spec' | 'seis-brace' | 'submittal';

export type ProjectLastDeliverable = {
  kind: DeliverableKind;
  /** Full row label segment after “Last worked on:”, e.g. “BOM - Level 2 Fire Protection”. */
  displayLabel: string;
  path: string;
};

type LastDeliverableSeed = {
  kind: DeliverableKind;
  name: string;
  bomProjectId?: string;
  deliverableId?: string;
};

const DELIVERABLE_KIND_LABEL: Record<DeliverableKind, string> = {
  bom: 'BOM',
  spec: 'Spec',
  'seis-brace': 'SeisBrace',
  submittal: 'Submittal Package',
};

/** Per-project most recent deliverable activity (demo seed — not global recency). */
const PROJECT_LAST_DELIVERABLE_SEED: Record<string, LastDeliverableSeed> = {
  '1': { kind: 'bom', name: 'Level 2 Fire Protection', bomProjectId: '1' },
  '2': { kind: 'spec', name: 'East Wing HVAC Spec', deliverableId: 'east-wing-hvac' },
  '3': { kind: 'seis-brace', name: 'Retail Anchor Brace Layout', deliverableId: 'retail-anchor' },
  '4': { kind: 'submittal', name: 'Fire Pump Cut Sheets', deliverableId: 'fire-pump-cut-sheets' },
  '5': { kind: 'seis-brace', name: 'Station Platform Brace Design', deliverableId: 'station-platform' },
};

function deliverableDisplayLabel(kind: DeliverableKind, name: string): string {
  return `${DELIVERABLE_KIND_LABEL[kind]} - ${name}`;
}

function buildDeliverablePath(projectKey: string, seed: LastDeliverableSeed): string {
  switch (seed.kind) {
    case 'bom':
      return `/bom/projects/${seed.bomProjectId}/workspace`;
    case 'spec':
      return specProjectListPath(projectKey);
    case 'seis-brace':
      return `${flatProjectWorkspacePath(projectKey, 'seis-brace')}?design=${encodeURIComponent(seed.deliverableId ?? 'default')}`;
    case 'submittal':
      return `${flatProjectWorkspacePath(projectKey, 'submittal')}?package=${encodeURIComponent(seed.deliverableId ?? 'default')}`;
  }
}

export function lastDeliverableForProject(projectKey: string): ProjectLastDeliverable | undefined {
  const seed = PROJECT_LAST_DELIVERABLE_SEED[projectKey];
  if (!seed) return undefined;
  return {
    kind: seed.kind,
    displayLabel: deliverableDisplayLabel(seed.kind, seed.name),
    path: buildDeliverablePath(projectKey, seed),
  };
}
