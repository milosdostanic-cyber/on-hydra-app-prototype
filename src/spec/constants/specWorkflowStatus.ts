import type { BadgeProps } from 'antd';

import type {
  SpecDocument,
  SpecProcessingStage,
  SpecProcessingStageId,
  SpecProcessingState,
  SpecReanalysisRun,
  SpecReanalysisStageId,
} from '../data/types';

/**
 * V2 canonical status vocabulary — plan §5.2, approved without changes in the
 * Phase 0 decision record (`Documents/SPEC/SPEC_V2_PHASE0_DECISION_RECORD.md`).
 * `uploading`, `reanalyzing`, `exporting`, and `export-failed` are part of the
 * approved vocabulary but not yet derivable from a persisted `SpecDocument` —
 * they arrive with the Phase 2/5/6 work that introduces the underlying state
 * (in-flight upload, re-analysis run, export run, export failure reason).
 */
export type SpecWorkflowStatus =
  | 'uploading'
  | 'processing'
  | 'analysis-failed'
  | 'ready-to-review'
  | 'in-review'
  | 'reanalysis-required'
  | 'reanalyzing'
  | 'ready-to-export'
  | 'exporting'
  | 'export-failed'
  | 'exported';

type AntBadgeStatus = NonNullable<BadgeProps['status']>;

export const specWorkflowStatusLabel: Record<SpecWorkflowStatus, string> = {
  uploading: 'Uploading',
  processing: 'Processing',
  'analysis-failed': 'Analysis failed',
  'ready-to-review': 'Ready to review',
  'in-review': 'In review',
  'reanalysis-required': 'Re-analysis required',
  reanalyzing: 'Re-analyzing',
  'ready-to-export': 'Ready to export',
  exporting: 'Exporting',
  'export-failed': 'Export failed',
  exported: 'Exported',
};

/** Audit §5.1 status-driven next-action table. */
export const specWorkflowPrimaryActionLabel: Record<SpecWorkflowStatus, string> = {
  uploading: 'View upload',
  processing: 'View progress',
  'analysis-failed': 'Retry',
  'ready-to-review': 'Start review',
  'in-review': 'Continue review',
  'reanalysis-required': 'Re-run analysis',
  reanalyzing: 'View progress',
  'ready-to-export': 'Export',
  exporting: 'View export',
  'export-failed': 'Retry export',
  exported: 'View export',
};

/**
 * Derives status from facts on the persisted document (plan §5.2: "avoid storing
 * duplicate, contradictory status fields"). Master-SPEC confirmation moved into
 * W01 step 2 in Phase 1, so a persisted `SpecDocument` is only ever created with
 * a confirmed master — there is no separate "master confirmation required" status.
 */
export function deriveSpecWorkflowStatus(document: SpecDocument): SpecWorkflowStatus {
  if (document.processingState === 'failed') return 'analysis-failed';
  if (
    document.processingState === 'queued' ||
    document.processingState === 'processing' ||
    document.processingState === 'partial' ||
    document.processingState === 'cancelled'
  ) {
    return 'processing';
  }
  if (
    document.reanalysisRun?.status === 'queued' ||
    document.reanalysisRun?.status === 'processing'
  ) {
    return 'reanalyzing';
  }
  if (document.reanalysisRequired) return 'reanalysis-required';
  if (document.exportRun?.status === 'generating') return 'exporting';
  if (document.exportRun?.status === 'failed') return 'export-failed';
  if (document.exportRecord) return 'exported';
  if (document.reviewState === 'approved') return 'ready-to-export';
  if (document.reviewState === 'in-review' || document.reviewState === 'corrected') {
    return 'in-review';
  }
  return 'ready-to-review';
}

export const V2_REANALYSIS_STAGE_ORDER = [
  'capture-manual-edits',
  'refresh-recommendations',
  'preserve-decisions',
  'prepare-review',
] as const satisfies readonly SpecReanalysisStageId[];

export const v2ReanalysisStageLabel: Record<SpecReanalysisStageId, string> = {
  'capture-manual-edits': 'Manual edits captured',
  'refresh-recommendations': 'Refresh findings and recommendations',
  'preserve-decisions': 'Keep valid previous decisions',
  'prepare-review': 'Prepare updated review',
};

export function createV2ReanalysisStages(
  activeIndex = 1,
): Array<{ id: SpecReanalysisStageId; state: SpecProcessingStage['state'] }> {
  return V2_REANALYSIS_STAGE_ORDER.map((id, index) => ({
    id,
    state: index < activeIndex ? 'done' : index === activeIndex ? 'active' : 'pending',
  }));
}

export function completeV2ReanalysisStages(): Array<{
  id: SpecReanalysisStageId;
  state: SpecProcessingStage['state'];
}> {
  return V2_REANALYSIS_STAGE_ORDER.map((id) => ({ id, state: 'done' }));
}

export function v2ReanalysisPercent(
  stages: Array<{ id: SpecReanalysisStageId; state: SpecProcessingStage['state'] }>,
): number {
  const doneCount = stages.filter((stage) => stage.state === 'done').length;
  const hasActive = stages.some((stage) => stage.state === 'active');
  const units = doneCount + (hasActive ? 0.6 : 0);
  return Math.max(
    0,
    Math.min(100, Math.round((units / V2_REANALYSIS_STAGE_ORDER.length) * 100)),
  );
}

const v2ReanalysisActiveStepCopy: Record<SpecReanalysisStageId, string> = {
  'capture-manual-edits': 'Capturing your edits',
  'refresh-recommendations': 'Refreshing findings',
  'preserve-decisions': 'Keeping valid decisions',
  'prepare-review': 'Preparing updated review',
};

/** Compact bar subtitle — current step plus how many of the four re-analysis steps are done. */
export function v2ReanalysisStepDetail(run: SpecReanalysisRun): string {
  const doneCount = run.stages.filter((stage) => stage.state === 'done').length;
  const active = run.stages.find((stage) => stage.state === 'active');
  const stepLabel = active
    ? v2ReanalysisActiveStepCopy[active.id]
    : run.status === 'complete'
      ? 'Re-analysis complete'
      : run.status === 'failed'
        ? (run.failureReason ?? 'Re-analysis could not finish')
        : 'Waiting to start';
  return `${stepLabel} · ${doneCount} of ${V2_REANALYSIS_STAGE_ORDER.length} steps complete`;
}

export function specWorkflowBadgeStatus(status: SpecWorkflowStatus): AntBadgeStatus {
  if (status === 'analysis-failed' || status === 'export-failed') return 'error';
  if (status === 'exported') return 'success';
  if (
    status === 'processing' ||
    status === 'in-review' ||
    status === 'uploading' ||
    status === 'reanalyzing' ||
    status === 'exporting'
  ) {
    return 'processing';
  }
  if (status === 'reanalysis-required') return 'warning';
  return 'default';
}

/**
 * Canonical V2 processing stages (audit §5.2). Reuses the first four legacy
 * `SpecProcessingStageId` values so seed fixtures outside this phase's
 * allowlist still type-check; UI labels are the V2 copy below.
 */
export const V2_PROCESSING_STAGE_ORDER = [
  'upload-received',
  'ocr-layout',
  'section-detection',
  'requirement-extraction',
] as const satisfies readonly SpecProcessingStageId[];

export type SpecV2ProcessingStageId = (typeof V2_PROCESSING_STAGE_ORDER)[number];

export const v2ProcessingStageLabel: Record<SpecV2ProcessingStageId, string> = {
  'upload-received': 'File validated',
  'ocr-layout': 'Document structure created',
  'section-detection': 'Compare against Master SPEC and product data',
  'requirement-extraction': 'Generate item-by-item recommendations',
};

/** Legacy 7-stage IDs collapsed onto the four V2 stages. */
const LEGACY_STAGE_TO_V2: Record<SpecProcessingStageId, SpecV2ProcessingStageId> = {
  'upload-received': 'upload-received',
  'ocr-layout': 'ocr-layout',
  'section-detection': 'section-detection',
  'requirement-extraction': 'section-detection',
  'red-flag-analysis': 'requirement-extraction',
  'citation-mapping': 'requirement-extraction',
  finalizing: 'requirement-extraction',
};

function rankStageState(state: SpecProcessingStage['state']): number {
  if (state === 'failed') return 4;
  if (state === 'active') return 3;
  if (state === 'done') return 2;
  if (state === 'skipped') return 1;
  return 0;
}

function mergeStageState(
  current: SpecProcessingStage['state'] | undefined,
  incoming: SpecProcessingStage['state'],
): SpecProcessingStage['state'] {
  if (!current) return incoming;
  return rankStageState(incoming) >= rankStageState(current) ? incoming : current;
}

export function isV2ProcessingStageId(id: SpecProcessingStageId): id is SpecV2ProcessingStageId {
  return (V2_PROCESSING_STAGE_ORDER as readonly SpecProcessingStageId[]).includes(id);
}

/** True when `document.stages` is already the four V2 stages in order. */
export function hasV2ProcessingShape(stages: SpecProcessingStage[]): boolean {
  return (
    stages.length === V2_PROCESSING_STAGE_ORDER.length &&
    V2_PROCESSING_STAGE_ORDER.every((id, index) => stages[index]?.id === id)
  );
}

/**
 * Projects a document's stored stages onto the four V2 stages. Legacy 7-stage
 * fixtures (still produced by `specSeedHelpers`) collapse into this shape.
 */
export function projectStagesToV2(stages: SpecProcessingStage[]): SpecProcessingStage[] {
  if (hasV2ProcessingShape(stages)) return stages;

  const byV2 = new Map<SpecV2ProcessingStageId, SpecProcessingStage['state']>();
  for (const stage of stages) {
    const v2Id = LEGACY_STAGE_TO_V2[stage.id];
    byV2.set(v2Id, mergeStageState(byV2.get(v2Id), stage.state));
  }

  let sawIncomplete = false;
  return V2_PROCESSING_STAGE_ORDER.map((id) => {
    const raw = byV2.get(id) ?? 'pending';
    if (sawIncomplete && raw === 'done') {
      return { id, state: 'pending' as const };
    }
    if (raw !== 'done') sawIncomplete = true;
    return { id, state: raw };
  });
}

export function createV2ProcessingStages(activeIndex = 0): SpecProcessingStage[] {
  return V2_PROCESSING_STAGE_ORDER.map((id, index) => ({
    id,
    state: index < activeIndex ? 'done' : index === activeIndex ? 'active' : 'pending',
  }));
}

export function completeV2ProcessingStages(): SpecProcessingStage[] {
  return V2_PROCESSING_STAGE_ORDER.map((id) => ({ id, state: 'done' as const }));
}

export function failedV2ProcessingStages(failedId: SpecV2ProcessingStageId = 'ocr-layout'): SpecProcessingStage[] {
  let pastFailed = false;
  return V2_PROCESSING_STAGE_ORDER.map((id) => {
    if (id === failedId) {
      pastFailed = true;
      return { id, state: 'failed' as const };
    }
    if (pastFailed) return { id, state: 'pending' as const };
    return { id, state: 'done' as const };
  });
}

export function advanceV2ProcessingStages(stages: SpecProcessingStage[]): {
  stages: SpecProcessingStage[];
  complete: boolean;
} {
  const projected = projectStagesToV2(stages);
  const activeIndex = projected.findIndex((stage) => stage.state === 'active');
  if (activeIndex === -1) {
    return { stages: createV2ProcessingStages(0), complete: false };
  }
  if (activeIndex >= V2_PROCESSING_STAGE_ORDER.length - 1) {
    return { stages: completeV2ProcessingStages(), complete: true };
  }
  return { stages: createV2ProcessingStages(activeIndex + 1), complete: false };
}

/**
 * Overall percent. Mid-stage fraction is 0.6 so two completed stages + one
 * active stage reads as 65% — matching the Screen 02 wireframe.
 */
export function v2ProcessingPercent(
  stages: SpecProcessingStage[],
  processingState: SpecProcessingState,
): number {
  if (processingState === 'ready') return 100;
  if (processingState === 'queued') return 0;
  const projected = projectStagesToV2(stages);
  const doneCount = projected.filter((stage) => stage.state === 'done').length;
  const hasActive = projected.some((stage) => stage.state === 'active');
  const total = V2_PROCESSING_STAGE_ORDER.length;
  const units = doneCount + (hasActive ? 0.6 : 0);
  return Math.max(0, Math.min(100, Math.round((units / total) * 100)));
}

export function v2StageDetail(stage: SpecProcessingStage, document: SpecDocument): string {
  if (stage.state === 'pending') return 'Waiting';
  if (stage.state === 'active') return 'In progress';
  if (stage.state === 'failed') return document.failureReason ?? 'Could not complete this stage.';
  if (stage.id === 'upload-received') return document.fileName;
  if (stage.id === 'ocr-layout') return 'Sections and table of contents are ready';
  if (stage.id === 'section-detection') return 'Compared with the selected Master SPEC and product data';
  return 'Recommendations are ready';
}

export function v2CurrentStepCopy(document: SpecDocument, stages: SpecProcessingStage[]): string {
  const projected = projectStagesToV2(stages);
  const active = projected.find((stage) => stage.state === 'active');
  if (!active) {
    if (document.processingState === 'queued') return 'Waiting to start analysis.';
    if (document.processingState === 'failed') {
      return document.failureReason ?? 'Analysis could not finish.';
    }
    if (document.processingState === 'ready') return 'Analysis is complete.';
    return 'Waiting.';
  }
  if (active.id === 'upload-received') return 'Validating the uploaded file.';
  if (active.id === 'ocr-layout') return 'Creating the document structure.';
  if (active.id === 'section-detection') {
    const division = document.divisionHint ?? '';
    const version = document.ascMaster?.version;
    if (division && version) {
      return `Comparing the customer SPEC with ASC Master SPEC — Division ${division}, Version ${version}`;
    }
    return 'Comparing the customer SPEC with ASC Master SPEC and product data.';
  }
  return 'Generating item-by-item recommendations.';
}
