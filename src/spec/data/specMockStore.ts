import { useSyncExternalStore } from 'react';

import {
  advanceV2ProcessingStages,
  completeV2ProcessingStages,
  completeV2ReanalysisStages,
  createV2ReanalysisStages,
  createV2ProcessingStages,
  hasV2ProcessingShape,
  projectStagesToV2,
} from '../constants/specWorkflowStatus';
import { trackSpecEvent } from '../specAnalytics';
import { DEFAULT_SPEC_SCENARIO, type SpecScenarioId } from './specScenarios';
import { buildScenarioFixtures, type SpecScenarioFixtures } from './specDocumentsSeed';
import { expandSpecDocumentBodies } from './specDocumentBodySeed';
import type {
  SpecAccessLevel,
  SpecAiProposal,
  SpecAlignmentDelta,
  SpecAskContextSnapshot,
  SpecAskMessage,
  SpecAskThread,
  SpecAskUrgency,
  SpecBaseline,
  SpecCitation,
  SpecCommentMessage,
  SpecCommentThread,
  SpecCorrection,
  SpecDeliverBackStatus,
  SpecDeliverable,
  SpecDocument,
  SpecDocumentBlock,
  SpecBlockFormatting,
  SpecEditorLock,
  SpecExportDocumentChoice,
  SpecExportRecord,
  SpecGuideMergePreview,
  SpecGuideSpec,
  SpecProjectBomOption,
  SpecProjectOutputRecord,
  SpecProductSuggestion,
  SpecProductSuggestionStatus,
  SpecRecommendationDecision,
  SpecRecommendationReanalysisState,
  SpecRecommendationReviewRecord,
  SpecReanalysisRecommendationResult,
  SpecReanalysisRecommendationSnapshot,
  SpecReanalysisSummary,
  SpecRedFlag,
  SpecRequirement,
  SpecSavedVersion,
  SpecSection,
  SpecSectionSummary,
  SpecSubmittalObligation,
  SpecSubmittalPackage,
  SpecSubstitutionLine,
  SpecSubstitutionRequest,
  SpecTrackedChange,
  SpecWorkingCopy,
} from './types';

// Bumped when seed/default document flags change so stale localStorage demos
// do not keep reanalysisRequired without a real manual edit.
const STORAGE_KEY = 'hydra-spec-mock-v7';

export type SpecMockState = SpecScenarioFixtures & {
  scenarioId: SpecScenarioId;
  role: SpecAccessLevel;
  delayMs: number;
  recommendationReviews: SpecRecommendationReviewRecord[];
  editorLocks: SpecEditorLock[];
  projectBomOptions: SpecProjectBomOption[];
  projectOutputs: SpecProjectOutputRecord[];
};

function defaultProjectBomOptions(): SpecProjectBomOption[] {
  return [
    { id: 'bom-project-1', projectId: '1', name: 'Downtown Convention Center — Fire protection BOM' },
    { id: 'bom-project-2', projectId: '2', name: 'Riverside Office Park — Mechanical BOM' },
    { id: 'bom-project-3', projectId: '3', name: 'Highland Retail Plaza — Plumbing BOM' },
  ];
}

function fixturesToState(scenarioId: SpecScenarioId, role: SpecAccessLevel, delayMs: number): SpecMockState {
  const fixtures = buildScenarioFixtures(scenarioId);
  return {
    scenarioId,
    role,
    delayMs,
    recommendationReviews: [],
    editorLocks: [],
    projectBomOptions: defaultProjectBomOptions(),
    projectOutputs: [],
    ...fixtures,
  };
}

function defaultState(): SpecMockState {
  return fixturesToState(DEFAULT_SPEC_SCENARIO, 'editor', 400);
}

function readState(): SpecMockState {
  if (typeof localStorage === 'undefined') return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as SpecMockState;
    if (!parsed || typeof parsed !== 'object' || !parsed.scenarioId) return defaultState();
    const base = defaultState();
    return {
      ...base,
      ...parsed,
      documents: Array.isArray(parsed.documents) ? parsed.documents : [],
      sections: Array.isArray(parsed.sections) ? parsed.sections : [],
      summaries: Array.isArray(parsed.summaries) ? parsed.summaries : [],
      requirements: Array.isArray(parsed.requirements) ? parsed.requirements : [],
      redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags : [],
      citations: Array.isArray(parsed.citations) ? parsed.citations : [],
      blocks: Array.isArray(parsed.blocks) ? parsed.blocks : [],
      corrections: Array.isArray(parsed.corrections) ? parsed.corrections : [],
      workingCopies: Array.isArray(parsed.workingCopies) ? parsed.workingCopies : base.workingCopies,
      changes: Array.isArray(parsed.changes) ? parsed.changes : base.changes,
      proposals: Array.isArray(parsed.proposals) ? parsed.proposals : base.proposals,
      commentThreads: Array.isArray(parsed.commentThreads) ? parsed.commentThreads : base.commentThreads,
      savedVersions: Array.isArray(parsed.savedVersions) ? parsed.savedVersions : base.savedVersions,
      baselines: Array.isArray(parsed.baselines) ? parsed.baselines : base.baselines,
      deltas: Array.isArray(parsed.deltas) ? parsed.deltas : base.deltas,
      productSuggestions: Array.isArray(parsed.productSuggestions)
        ? parsed.productSuggestions
        : base.productSuggestions,
      submittalObligations: Array.isArray(parsed.submittalObligations)
        ? parsed.submittalObligations
        : base.submittalObligations,
      submittalPackages: Array.isArray(parsed.submittalPackages)
        ? parsed.submittalPackages
        : base.submittalPackages,
      substitutionRequests: Array.isArray(parsed.substitutionRequests)
        ? parsed.substitutionRequests
        : base.substitutionRequests,
      askThreads: Array.isArray(parsed.askThreads) ? parsed.askThreads : base.askThreads,
      deliverables: Array.isArray(parsed.deliverables) ? parsed.deliverables : base.deliverables,
      guideSpecs: Array.isArray(parsed.guideSpecs) ? parsed.guideSpecs : base.guideSpecs,
      recommendationReviews: Array.isArray(parsed.recommendationReviews)
        ? parsed.recommendationReviews
        : base.recommendationReviews,
      editorLocks: Array.isArray(parsed.editorLocks) ? parsed.editorLocks : base.editorLocks,
      projectBomOptions: Array.isArray(parsed.projectBomOptions)
        ? parsed.projectBomOptions
        : base.projectBomOptions,
      projectOutputs: Array.isArray(parsed.projectOutputs) ? parsed.projectOutputs : [],
    };
  } catch {
    return defaultState();
  }
}

function writeState(state: SpecMockState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota */
  }
}

let storeCache: SpecMockState = readState();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function setState(updater: (prev: SpecMockState) => SpecMockState) {
  storeCache = updater(storeCache);
  writeState(storeCache);
  emit();
}

export function subscribeSpecMock(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSpecMockSnapshot(): SpecMockState {
  return storeCache;
}

export function getSpecMockServerSnapshot(): SpecMockState {
  return defaultState();
}

export function useSpecMockStore(): SpecMockState {
  return useSyncExternalStore(subscribeSpecMock, getSpecMockSnapshot, getSpecMockServerSnapshot);
}

export function resetSpecMock(scenarioId?: SpecScenarioId) {
  clearSpecProcessingTimer();
  clearSpecReanalysisTimer();
  clearSpecExportTimer();
  const nextScenario = scenarioId ?? storeCache.scenarioId;
  setState(() => fixturesToState(nextScenario, storeCache.role, storeCache.delayMs));
}

export function switchSpecScenario(scenarioId: SpecScenarioId) {
  clearSpecProcessingTimer();
  clearSpecReanalysisTimer();
  clearSpecExportTimer();
  setState((prev) => {
    let role = prev.role;
    if (scenarioId === 'restricted-external-reviewer') {
      role = 'comment-only';
    } else if (scenarioId === 'async-deliver-back' && (role === 'comment-only' || role === 'revoked')) {
      role = 'editor';
    }
    return fixturesToState(scenarioId, role, prev.delayMs);
  });
}

export function setSpecDemoRole(role: SpecAccessLevel) {
  setState((prev) => ({ ...prev, role }));
}

export function setSpecDemoDelayMs(delayMs: number) {
  setState((prev) => ({ ...prev, delayMs }));
  if (processingTimer != null) {
    clearSpecProcessingTimer();
    ensureSpecProcessingTicker();
  }
  if (reanalysisTimer != null) {
    clearSpecReanalysisTimer();
    ensureSpecReanalysisTicker();
  }
  if (exportTimer != null) {
    clearSpecExportTimer();
    ensureSpecExportTicker();
  }
}

export function getSpecDelayMs(): number {
  return storeCache.delayMs;
}

export async function withSpecDelay<T>(result: T): Promise<T> {
  const ms = storeCache.delayMs;
  if (ms > 0) {
    await new Promise((r) => setTimeout(r, ms));
  }
  return result;
}

let processingTimer: ReturnType<typeof setTimeout> | null = null;
let reanalysisTimer: ReturnType<typeof setTimeout> | null = null;
let exportTimer: ReturnType<typeof setTimeout> | null = null;

function isActivelyProcessing(document: SpecDocument): boolean {
  return document.processingState === 'queued' || document.processingState === 'processing';
}

function clearSpecProcessingTimer() {
  if (processingTimer == null) return;
  clearTimeout(processingTimer);
  processingTimer = null;
}

function seedMinimalAnalysisIfNeeded(documentId: string): void {
  const doc = getDocumentFromStore(documentId);
  if (!doc) return;
  if (listSectionsFromStore(documentId).length > 0) return;

  const sectionId = `${documentId}-sec-1`;
  const blockId = `${documentId}-blk-1`;
  const citId = `${documentId}-cit-1`;
  const reqId = `${documentId}-req-1`;

  appendUploadAnalysis({
    section: {
      id: sectionId,
      documentId,
      division: doc.divisionHint ?? '22',
      divisionTitle: 'Uploaded division',
      sectionNumber: `${doc.divisionHint ?? '22'} 00 00`,
      title: doc.title,
      parts: ['general', 'products', 'execution'],
      pageStart: 1,
      pageEnd: 4,
      processingState: 'ready',
      requirementCount: 1,
      redFlagCount: 0,
      hasLowConfidence: false,
      hasCorrections: false,
      hasProductOpportunities: false,
    },
    summary: {
      sectionId,
      summary: `Mock extraction for “${doc.title}”. Review values against the source before relying on them.`,
      attentionPoints: ['Review extracted values against the source.'],
      extractionCompleteness: 80,
      generatedAt: new Date().toISOString(),
      modelLabel: 'mock-extractor-v1',
    },
    requirement: {
      id: reqId,
      sectionId,
      category: 'materials-standards',
      value: 'Sample extracted requirement — correct as needed',
      part: 'products',
      confidence: 'medium',
      confidencePercent: 72,
      citationIds: [citId],
      verification: 'extracted',
    },
    citation: {
      id: citId,
      documentId,
      versionLabel: doc.versionLabel,
      sectionId,
      page: 1,
      blockId,
      excerpt: 'Sample source paragraph from the uploaded specification.',
      anchorType: 'exact',
    },
    block: {
      id: blockId,
      documentId,
      sectionId,
      page: 1,
      kind: 'paragraph',
      label: '2.1.A',
      text: 'Sample source paragraph from the uploaded specification.',
    },
  });

  setState((prev) => {
    if (!prev.sections.some((section) => section.documentId === documentId)) return prev;
    const expanded = expandSpecDocumentBodies({
      sections: prev.sections,
      blocks: prev.blocks,
      citations: prev.citations,
    });
    return {
      ...prev,
      sections: expanded.sections,
      blocks: expanded.blocks,
      citations: expanded.citations,
    };
  });
}

function processingTick() {
  processingTimer = null;
  const active = storeCache.documents.filter(isActivelyProcessing);
  for (const document of active) {
    const queued = document.processingState === 'queued';
    const hasActiveStage = document.stages.some((stage) => stage.state === 'active');
    const needsShape = !hasV2ProcessingShape(document.stages);
    if (queued || !hasActiveStage || needsShape) {
      const projected = projectStagesToV2(document.stages);
      const projectedActiveIndex = projected.findIndex((stage) => stage.state === 'active');
      const started = queued || projectedActiveIndex < 0;
      patchSpecDocument(document.id, {
        processingState: 'processing',
        stages: started ? createV2ProcessingStages(0) : projected,
        sourcePreviewReady: true,
      });
      if (started) {
        trackSpecEvent('spec_processing_started', { documentId: document.id });
      }
      continue;
    }

    const next = advanceV2ProcessingStages(document.stages);
    if (next.complete) {
      seedMinimalAnalysisIfNeeded(document.id);
      const latest = getDocumentFromStore(document.id) ?? document;
      patchSpecDocument(document.id, {
        processingState: 'ready',
        stages: completeV2ProcessingStages(),
        sourcePreviewReady: true,
        sectionCount: Math.max(latest.sectionCount, 1),
        requirementCount: Math.max(latest.requirementCount, 1),
      });
      trackSpecEvent('spec_processing_stage_completed', {
        documentId: document.id,
        stageId: document.stages.find((stage) => stage.state === 'active')?.id,
        final: true,
      });
      continue;
    }

    patchSpecDocument(document.id, {
      processingState: 'processing',
      stages: next.stages,
      sourcePreviewReady: true,
    });
    trackSpecEvent('spec_processing_stage_completed', {
      documentId: document.id,
      stageId: document.stages.find((stage) => stage.state === 'active')?.id,
    });
  }

  if (storeCache.documents.some(isActivelyProcessing)) {
    scheduleSpecProcessingTick();
  }
}

function scheduleSpecProcessingTick() {
  if (typeof window === 'undefined') return;
  if (processingTimer != null) return;
  const stepMs = Math.max(storeCache.delayMs, 350);
  processingTimer = window.setTimeout(processingTick, stepMs);
}

/**
 * Runs analysis in the mock store so leaving Screen 02 does not cancel work.
 * Starts on create/retry/replace and when the processing page mounts for an
 * in-progress seed document. Does not start on module load, so frozen seed
 * "processing" fixtures stay still until the user opens them.
 */
export function ensureSpecProcessingTicker() {
  if (typeof window === 'undefined') return;
  if (!storeCache.documents.some(isActivelyProcessing)) return;
  scheduleSpecProcessingTick();
}

export type SpecReanalysisCandidate = {
  recommendationId: string;
  sourceBlockId: string;
  proposedText: string;
};

export function classifyReanalysisRecommendations(input: {
  snapshots: SpecReanalysisRecommendationSnapshot[];
  currentRecommendations: SpecReanalysisCandidate[];
  currentSourceTextByBlock: Record<string, string | undefined>;
}): {
  results: SpecReanalysisRecommendationResult[];
  summary: SpecReanalysisSummary;
  preservedDecisionIds: string[];
} {
  const previousById = new Map(
    input.snapshots.map((snapshot) => [snapshot.recommendationId, snapshot]),
  );
  const currentById = new Map(
    input.currentRecommendations.map((recommendation) => [
      recommendation.recommendationId,
      recommendation,
    ]),
  );
  const results: SpecReanalysisRecommendationResult[] = [];
  const preservedDecisionIds: string[] = [];

  for (const snapshot of input.snapshots) {
    const current = currentById.get(snapshot.recommendationId);
    const currentSource = input.currentSourceTextByBlock[snapshot.sourceBlockId]?.trim() ?? '';
    let state: SpecRecommendationReanalysisState;

    if (!current || currentSource.length === 0) {
      state = 'resolved';
    } else {
      const sourceUnchanged = currentSource === snapshot.sourceText.trim();
      const acceptedTextUnchanged =
        snapshot.decision === 'accepted' && currentSource === snapshot.proposedText.trim();
      if (sourceUnchanged || acceptedTextUnchanged) {
        const keepsDecision =
          snapshot.decision === 'accepted' || snapshot.decision === 'denied';
        state = keepsDecision ? 'preserved' : 'unchanged';
        if (keepsDecision) preservedDecisionIds.push(snapshot.recommendationId);
      } else if (currentSource === snapshot.proposedText.trim()) {
        state = 'resolved';
      } else {
        state = 'changed';
      }
    }
    results.push({ recommendationId: snapshot.recommendationId, state });
  }

  for (const current of input.currentRecommendations) {
    if (!previousById.has(current.recommendationId)) {
      results.push({ recommendationId: current.recommendationId, state: 'new' });
    }
  }

  const resultById = new Map(results.map((result) => [result.recommendationId, result]));
  const firstNotReviewed = input.snapshots.find((snapshot) => {
    const state = resultById.get(snapshot.recommendationId)?.state;
    return snapshot.decision === 'not-reviewed' && state !== 'resolved';
  });
  const firstChangedOrNew = results.find(
    (result) => result.state === 'changed' || result.state === 'new',
  );
  const firstActive = results.find((result) => result.state !== 'resolved');

  return {
    results,
    preservedDecisionIds,
    summary: {
      newCount: results.filter((result) => result.state === 'new').length,
      changedCount: results.filter((result) => result.state === 'changed').length,
      resolvedCount: results.filter((result) => result.state === 'resolved').length,
      decisionsKeptCount: preservedDecisionIds.length,
      targetRecommendationId:
        firstNotReviewed?.recommendationId ??
        firstChangedOrNew?.recommendationId ??
        firstActive?.recommendationId,
    },
  };
}

function clearSpecReanalysisTimer() {
  if (reanalysisTimer == null) return;
  clearTimeout(reanalysisTimer);
  reanalysisTimer = null;
}

function isActivelyReanalyzing(document: SpecDocument): boolean {
  return (
    document.reanalysisRun?.status === 'queued' ||
    document.reanalysisRun?.status === 'processing'
  );
}

export function completeReanalysisInStore(documentId: string): void {
  const document = getDocumentFromStore(documentId);
  const run = document?.reanalysisRun;
  if (!document || !run) return;

  const workingCopy = getWorkingCopyFromStore(documentId);
  const currentSourceTextByBlock = Object.fromEntries(
    listBlocksFromStore(documentId).map((block) => [
      block.id,
      workingCopy?.blockOverrides[block.id] ?? block.text,
    ]),
  );
  const currentRecommendations = run.snapshots.map((snapshot) => ({
    recommendationId: snapshot.recommendationId,
    sourceBlockId: snapshot.sourceBlockId,
    proposedText: snapshot.proposedText,
  }));
  const classification = classifyReanalysisRecommendations({
    snapshots: run.snapshots,
    currentRecommendations,
    currentSourceTextByBlock,
  });
  const preserved = new Set(classification.preservedDecisionIds);
  const now = new Date().toISOString();

  setState((prev) => ({
    ...prev,
    recommendationReviews: prev.recommendationReviews.filter(
      (record) =>
        record.documentId !== documentId ||
        (preserved.has(record.recommendationId) &&
          (record.decision === 'accepted' || record.decision === 'denied')),
    ),
    documents: prev.documents.map((entry) =>
      entry.id === documentId
        ? {
            ...entry,
            reanalysisRequired: false,
            reanalysisRun: {
              ...run,
              status: 'complete' as const,
              stages: completeV2ReanalysisStages(),
              results: classification.results,
              summary: classification.summary,
              failureReason: undefined,
              updatedAt: now,
            },
            updatedAt: now,
          }
        : entry,
    ),
  }));
}

function reanalysisTick() {
  reanalysisTimer = null;
  const active = storeCache.documents.filter(isActivelyReanalyzing);
  for (const document of active) {
    const run = document.reanalysisRun;
    if (!run) continue;
    const activeIndex = run.stages.findIndex((stage) => stage.state === 'active');
    if (activeIndex >= run.stages.length - 1) {
      completeReanalysisInStore(document.id);
      continue;
    }
    const nextIndex = Math.max(activeIndex + 1, 1);
    const now = new Date().toISOString();
    patchSpecDocument(document.id, {
      reanalysisRun: {
        ...run,
        status: 'processing',
        stages: createV2ReanalysisStages(nextIndex),
        updatedAt: now,
      },
    });
  }
  if (storeCache.documents.some(isActivelyReanalyzing)) scheduleSpecReanalysisTick();
}

function scheduleSpecReanalysisTick() {
  if (typeof window === 'undefined' || reanalysisTimer != null) return;
  const stepMs = Math.max(storeCache.delayMs, 350);
  reanalysisTimer = window.setTimeout(reanalysisTick, stepMs);
}

export function ensureSpecReanalysisTicker() {
  if (typeof window === 'undefined') return;
  if (!storeCache.documents.some(isActivelyReanalyzing)) return;
  scheduleSpecReanalysisTick();
}

export function startReanalysisInStore(
  documentId: string,
  snapshots: SpecReanalysisRecommendationSnapshot[],
): SpecDocument | undefined {
  const document = getDocumentFromStore(documentId);
  if (!document || !document.reanalysisRequired) return document;
  const now = new Date().toISOString();
  patchSpecDocument(documentId, {
    reanalysisRun: {
      id: `reanalysis-${documentId}-${Date.now()}`,
      documentId,
      status: 'processing',
      stages: createV2ReanalysisStages(),
      snapshots,
      startedAt: now,
      updatedAt: now,
    },
  });
  ensureSpecReanalysisTicker();
  return getDocumentFromStore(documentId);
}

export function retryReanalysisInStore(documentId: string): SpecDocument | undefined {
  const document = getDocumentFromStore(documentId);
  const run = document?.reanalysisRun;
  if (!document || !run || !document.reanalysisRequired) return document;
  patchSpecDocument(documentId, {
    reanalysisRun: {
      ...run,
      status: 'processing',
      stages: createV2ReanalysisStages(),
      results: undefined,
      summary: undefined,
      failureReason: undefined,
      updatedAt: new Date().toISOString(),
    },
  });
  ensureSpecReanalysisTicker();
  return getDocumentFromStore(documentId);
}

export function failReanalysisInStore(
  documentId: string,
  reason = 'Re-analysis could not finish. Your edits and previous decisions are safe.',
): SpecDocument | undefined {
  const document = getDocumentFromStore(documentId);
  const run = document?.reanalysisRun;
  if (!document || !run) return document;
  clearSpecReanalysisTimer();
  patchSpecDocument(documentId, {
    reanalysisRequired: true,
    reanalysisRun: {
      ...run,
      status: 'failed',
      stages: run.stages.map((stage) =>
        stage.state === 'active' ? { ...stage, state: 'failed' as const } : stage,
      ),
      failureReason: reason,
      updatedAt: new Date().toISOString(),
    },
  });
  return getDocumentFromStore(documentId);
}

function isActivelyExporting(document: SpecDocument): boolean {
  return document.exportRun?.status === 'generating';
}

function clearSpecExportTimer() {
  if (exportTimer == null) return;
  clearTimeout(exportTimer);
  exportTimer = null;
}

export function exportFileNameFor(
  document: SpecDocument,
  choice: Exclude<SpecExportDocumentChoice, 'docx'>,
): string {
  const slug = document.title.replace(/[^\w]+/g, '-').replace(/^-|-$/g, '');
  const version = document.versionNumber ?? document.versionLabel.replace(/^v/i, '');
  return `${slug}-v${version}-${choice}.docx`;
}

export function startExportInStore(
  documentId: string,
  choice: Exclude<SpecExportDocumentChoice, 'docx'>,
): SpecDocument | undefined {
  const document = getDocumentFromStore(documentId);
  if (!document || document.reanalysisRequired) return document;
  const now = new Date().toISOString();
  patchSpecDocument(documentId, {
    exportRun: {
      id: `export-run-${documentId}-${Date.now()}`,
      documentId,
      status: 'generating',
      choice,
      startedAt: now,
      updatedAt: now,
    },
  });
  ensureSpecExportTicker();
  return getDocumentFromStore(documentId);
}

export function completeExportInStore(documentId: string): void {
  const document = getDocumentFromStore(documentId);
  const run = document?.exportRun;
  if (!document || !run) return;
  clearSpecExportTimer();
  const now = new Date().toISOString();
  const fileName = exportFileNameFor(document, run.choice);
  const record: SpecExportRecord = {
    id: run.id,
    exportedAt: now,
    format: run.choice,
    choice: run.choice,
    fileName,
  };
  patchSpecDocument(documentId, {
    exportRun: {
      ...run,
      status: 'ready',
      fileName,
      updatedAt: now,
    },
    exportRecord: record,
    exportHistory: [record, ...(document.exportHistory ?? [])],
  });
}

export function failExportInStore(
  documentId: string,
  reason = 'The document could not be generated. Your export choices are unchanged.',
): SpecDocument | undefined {
  const document = getDocumentFromStore(documentId);
  const run = document?.exportRun;
  if (!document || !run) return document;
  clearSpecExportTimer();
  const now = new Date().toISOString();
  patchSpecDocument(documentId, {
    exportRun: {
      ...run,
      status: 'failed',
      failureReason: reason,
      updatedAt: now,
    },
  });
  return getDocumentFromStore(documentId);
}

export function dismissExportRunInStore(documentId: string): SpecDocument | undefined {
  const document = getDocumentFromStore(documentId);
  if (!document) return document;
  patchSpecDocument(documentId, { exportRun: undefined });
  return getDocumentFromStore(documentId);
}

function exportTick() {
  exportTimer = null;
  const active = storeCache.documents.filter(isActivelyExporting);
  for (const document of active) {
    completeExportInStore(document.id);
  }
  if (storeCache.documents.some(isActivelyExporting)) scheduleSpecExportTick();
}

function scheduleSpecExportTick() {
  if (typeof window === 'undefined' || exportTimer != null) return;
  const stepMs = Math.max(storeCache.delayMs, 350);
  exportTimer = window.setTimeout(exportTick, stepMs);
}

export function ensureSpecExportTicker() {
  if (typeof window === 'undefined') return;
  if (!storeCache.documents.some(isActivelyExporting)) return;
  scheduleSpecExportTick();
}

export function listProjectBomOptionsFromStore(projectId?: string): SpecProjectBomOption[] {
  const options = storeCache.projectBomOptions;
  return projectId ? options.filter((option) => option.projectId === projectId) : options;
}

export function createProjectBomInStore(input: {
  projectId: string;
  name: string;
}): SpecProjectBomOption {
  const option: SpecProjectBomOption = {
    id: `bom-${input.projectId}-${Date.now()}`,
    projectId: input.projectId,
    name: input.name,
  };
  setState((prev) => ({
    ...prev,
    projectBomOptions: [...prev.projectBomOptions, option],
  }));
  return option;
}

export function listProjectOutputsFromStore(documentId: string): SpecProjectOutputRecord[] {
  return storeCache.projectOutputs.filter((output) => output.documentId === documentId);
}

export function recordProjectOutputInStore(
  input: SpecProjectOutputRecord,
): SpecProjectOutputRecord {
  setState((prev) => ({
    ...prev,
    projectOutputs: [input, ...prev.projectOutputs],
  }));
  return input;
}

export function listProjectSubmittalPackagesFromStore(projectId?: string): SpecSubmittalPackage[] {
  if (!projectId) return storeCache.submittalPackages;
  const documentIds = new Set(
    storeCache.documents
      .filter((document) => document.projectId === projectId)
      .map((document) => document.id),
  );
  return storeCache.submittalPackages.filter((pkg) => documentIds.has(pkg.documentId));
}

export function appendApprovedProductsToPackageInStore(input: {
  packageId: string;
  titles: string[];
}): SpecSubmittalPackage | undefined {
  const now = new Date().toISOString();
  let updated: SpecSubmittalPackage | undefined;
  setState((prev) => ({
    ...prev,
    submittalPackages: prev.submittalPackages.map((pkg) => {
      if (pkg.id !== input.packageId) return pkg;
      updated = {
        ...pkg,
        updatedAt: now,
        items: [
          ...pkg.items,
          ...input.titles.map((title, index) => ({
            id: `pkgitem-${Date.now()}-${index}`,
            obligationId: `approved-product-${index}`,
            title,
          })),
        ],
      };
      return updated;
    }),
  }));
  return updated;
}

export function upsertSpecDocument(doc: SpecDocument) {
  setState((prev) => {
    const idx = prev.documents.findIndex((d) => d.id === doc.id);
    const documents =
      idx === -1 ? [...prev.documents, doc] : prev.documents.map((d, i) => (i === idx ? doc : d));
    return { ...prev, documents };
  });
}

export function patchSpecDocument(id: string, patch: Partial<SpecDocument>) {
  setState((prev) => ({
    ...prev,
    documents: prev.documents.map((d) => (d.id === id ? { ...d, ...patch, updatedAt: new Date().toISOString() } : d)),
  }));
}

/** Removes a SPEC document (row overflow → Delete SPEC — audit §5.1 overflow). */
export function removeSpecDocument(id: string) {
  setState((prev) => ({
    ...prev,
    documents: prev.documents.filter((d) => d.id !== id),
  }));
}

export function addSpecCorrection(correction: SpecCorrection) {
  setState((prev) => {
    const requirements = prev.requirements.map((r) => {
      if (r.id !== correction.requirementId) return r;
      return {
        ...r,
        value: correction.nextValue,
        category: correction.nextCategory,
        verification: 'human-verified' as const,
      };
    });
    const sections = prev.sections.map((s) => {
      const req = requirements.find((r) => r.id === correction.requirementId);
      if (!req || req.sectionId !== s.id) return s;
      return { ...s, hasCorrections: true };
    });
    return {
      ...prev,
      requirements,
      sections,
      corrections: [...prev.corrections, correction],
    };
  });
}

/** Appends a minimal analysis bag for a freshly uploaded document that finished processing. */
export function appendUploadAnalysis(bag: {
  section: SpecSection;
  summary: SpecSectionSummary;
  requirement: SpecRequirement;
  citation: SpecCitation;
  block: SpecDocumentBlock;
}) {
  setState((prev) => {
    if (prev.sections.some((s) => s.id === bag.section.id)) return prev;
    return {
      ...prev,
      sections: [...prev.sections, bag.section],
      summaries: [...prev.summaries, bag.summary],
      requirements: [...prev.requirements, bag.requirement],
      citations: [...prev.citations, bag.citation],
      blocks: [...prev.blocks, bag.block],
    };
  });
}

export function listDocumentsFromStore(): SpecDocument[] {
  return storeCache.documents;
}

export function getDocumentFromStore(id: string): SpecDocument | undefined {
  return storeCache.documents.find((d) => d.id === id);
}

export function listSectionsFromStore(documentId: string): SpecSection[] {
  return storeCache.sections.filter((s) => s.documentId === documentId);
}

export function getSectionFromStore(id: string): SpecSection | undefined {
  return storeCache.sections.find((s) => s.id === id);
}

export function getSummaryFromStore(sectionId: string): SpecSectionSummary | undefined {
  return storeCache.summaries.find((s) => s.sectionId === sectionId);
}

export function listRequirementsFromStore(sectionId: string): SpecRequirement[] {
  return storeCache.requirements.filter((r) => r.sectionId === sectionId);
}

export function getRequirementFromStore(id: string): SpecRequirement | undefined {
  return storeCache.requirements.find((r) => r.id === id);
}

export function listRedFlagsFromStore(sectionId?: string): SpecRedFlag[] {
  const flags = storeCache.redFlags;
  return sectionId ? flags.filter((f) => f.sectionId === sectionId) : flags;
}

export function listCitationsFromStore(ids: string[]): SpecCitation[] {
  const set = new Set(ids);
  return storeCache.citations.filter((c) => set.has(c.id));
}

export function getCitationFromStore(id: string): SpecCitation | undefined {
  return storeCache.citations.find((c) => c.id === id);
}

export function listBlocksFromStore(documentId: string, sectionId?: string): SpecDocumentBlock[] {
  return storeCache.blocks.filter(
    (b) => b.documentId === documentId && (sectionId == null || b.sectionId === sectionId),
  );
}

export function listRecommendationReviewsFromStore(
  documentId: string,
): SpecRecommendationReviewRecord[] {
  return storeCache.recommendationReviews.filter((record) => record.documentId === documentId);
}

export function saveRecommendationReviewInStore(input: {
  recommendationId: string;
  documentId: string;
  decision: SpecRecommendationDecision;
  denialReason?: string;
  proposedTextOverride?: string;
}): SpecRecommendationReviewRecord {
  const now = new Date().toISOString();
  const previous = storeCache.recommendationReviews.find(
    (record) => record.recommendationId === input.recommendationId,
  );
  const record: SpecRecommendationReviewRecord = {
    recommendationId: input.recommendationId,
    documentId: input.documentId,
    decision: input.decision,
    denialReason:
      input.decision === 'denied' ? input.denialReason?.trim() || undefined : undefined,
    proposedTextOverride:
      input.proposedTextOverride?.trim() || previous?.proposedTextOverride || undefined,
    decidedAt: input.decision === 'not-reviewed' ? undefined : now,
    updatedAt: now,
  };

  setState((prev) => {
    const recommendationReviews = [
      ...prev.recommendationReviews.filter(
        (entry) => entry.recommendationId !== input.recommendationId,
      ),
      record,
    ];
    const reviewedCount = recommendationReviews.filter(
      (entry) => entry.documentId === input.documentId && entry.decision !== 'not-reviewed',
    ).length;
    return {
      ...prev,
      recommendationReviews,
      documents: prev.documents.map((document) =>
        document.id === input.documentId
          ? {
              ...document,
              reviewState: 'in-review' as const,
              reviewedRequirementCount: reviewedCount,
              updatedAt: now,
            }
          : document,
      ),
    };
  });
  return record;
}

export function saveRecommendationProposalInStore(input: {
  recommendationId: string;
  documentId: string;
  proposedText: string;
}): SpecRecommendationReviewRecord {
  const previous = storeCache.recommendationReviews.find(
    (record) => record.recommendationId === input.recommendationId,
  );
  return saveRecommendationReviewInStore({
    recommendationId: input.recommendationId,
    documentId: input.documentId,
    decision: previous?.decision ?? 'not-reviewed',
    denialReason: previous?.denialReason,
    proposedTextOverride: input.proposedText,
  });
}

export function listCorrectionsFromStore(requirementId: string): SpecCorrection[] {
  return storeCache.corrections.filter((c) => c.requirementId === requirementId);
}

export function getDemoRole(): SpecAccessLevel {
  return storeCache.role;
}

// ── I2 editor / review store accessors ───────────────────────────────────────

export function getWorkingCopyFromStore(documentId: string): SpecWorkingCopy | undefined {
  return storeCache.workingCopies.find((w) => w.documentId === documentId);
}

export function listChangesFromStore(documentId: string): SpecTrackedChange[] {
  return storeCache.changes.filter((c) => c.documentId === documentId);
}

export function listProposalsFromStore(documentId: string): SpecAiProposal[] {
  return storeCache.proposals.filter((p) => p.documentId === documentId);
}

export function listCommentThreadsFromStore(documentId: string): SpecCommentThread[] {
  return storeCache.commentThreads.filter((t) => t.documentId === documentId);
}

export function listSavedVersionsFromStore(documentId: string): SpecSavedVersion[] {
  return storeCache.savedVersions.filter((v) => v.documentId === documentId);
}

export function listBaselinesFromStore(documentId: string): SpecBaseline[] {
  return storeCache.baselines.filter((b) => b.documentId === documentId);
}

export function listDeltasFromStore(documentId: string, baselineId?: string): SpecAlignmentDelta[] {
  return storeCache.deltas.filter(
    (d) => d.documentId === documentId && (baselineId == null || d.baselineId === baselineId),
  );
}

export function createWorkingCopyInStore(documentId: string, basedOnVersionLabel: string): SpecWorkingCopy {
  const now = new Date().toISOString();
  const wc: SpecWorkingCopy = {
    id: `wc-${documentId}-${Date.now()}`,
    documentId,
    label: 'Working copy',
    basedOnVersionLabel,
    createdAt: now,
    updatedAt: now,
    blockOverrides: {},
  };
  setState((prev) => ({
    ...prev,
    workingCopies: [...prev.workingCopies.filter((w) => w.documentId !== documentId), wc],
  }));
  return wc;
}

export function updateWorkingCopyBlockInStore(input: {
  documentId: string;
  workingCopyId: string;
  blockId: string;
  text: string;
  formatting?: SpecBlockFormatting;
}): SpecWorkingCopy | undefined {
  const now = new Date().toISOString();
  let updated: SpecWorkingCopy | undefined;
  setState((prev) => {
    const workingCopy = prev.workingCopies.find((entry) => entry.id === input.workingCopyId);
    const baseText =
      workingCopy?.blockOverrides[input.blockId] ??
      prev.blocks.find((block) => block.id === input.blockId)?.text ??
      '';
    // Accept/deny apply recommendation text without this path. Only a direct
    // manual text change in the document marks analysis stale — not formatting alone.
    const manualTextChanged = baseText !== input.text;

    return {
      ...prev,
      workingCopies: prev.workingCopies.map((entry) => {
        if (entry.id !== input.workingCopyId) return entry;
        updated = {
          ...entry,
          updatedAt: now,
          blockOverrides: {
            ...entry.blockOverrides,
            [input.blockId]: input.text,
          },
          blockFormatting: input.formatting
            ? {
                ...(entry.blockFormatting ?? {}),
                [input.blockId]: input.formatting,
              }
            : entry.blockFormatting,
        };
        return updated;
      }),
      documents: manualTextChanged
        ? prev.documents.map((document) =>
            document.id === input.documentId
              ? {
                  ...document,
                  reanalysisRequired: true,
                  reanalysisRun: undefined,
                  reviewState: 'in-review' as const,
                  updatedAt: now,
                }
              : document,
          )
        : prev.documents,
    };
  });
  return updated;
}

export function applyRecommendationTextInStore(input: {
  documentId: string;
  workingCopyId: string;
  blockId: string;
  text: string;
}): SpecWorkingCopy | undefined {
  const now = new Date().toISOString();
  let updated: SpecWorkingCopy | undefined;
  setState((prev) => ({
    ...prev,
    workingCopies: prev.workingCopies.map((workingCopy) => {
      if (workingCopy.id !== input.workingCopyId) return workingCopy;
      updated = {
        ...workingCopy,
        updatedAt: now,
        blockOverrides: {
          ...workingCopy.blockOverrides,
          [input.blockId]: input.text,
        },
      };
      return updated;
    }),
  }));
  return updated;
}

export function getEditorLockFromStore(
  documentId: string,
  now = Date.now(),
): SpecEditorLock | undefined {
  const lock = storeCache.editorLocks.find((entry) => entry.documentId === documentId);
  if (!lock || Date.parse(lock.expiresAt) <= now) return undefined;
  return lock;
}

export function acquireEditorLockInStore(
  documentId: string,
  owner: string,
  timeoutMs: number,
  now = Date.now(),
): SpecEditorLock {
  const active = getEditorLockFromStore(documentId, now);
  if (active && active.owner !== owner) return active;

  const lock: SpecEditorLock = {
    documentId,
    owner,
    acquiredAt: active?.acquiredAt ?? new Date(now).toISOString(),
    expiresAt: new Date(now + timeoutMs).toISOString(),
  };
  setState((prev) => ({
    ...prev,
    editorLocks: [
      ...prev.editorLocks.filter((entry) => entry.documentId !== documentId),
      lock,
    ],
  }));
  return lock;
}

export function releaseEditorLockInStore(documentId: string, owner?: string): void {
  setState((prev) => ({
    ...prev,
    editorLocks: prev.editorLocks.filter(
      (entry) =>
        entry.documentId !== documentId || (owner != null && entry.owner !== owner),
    ),
  }));
}

export function addManualChangeInStore(input: {
  documentId: string;
  workingCopyId: string;
  blockId: string;
  sectionId: string;
  originalText: string;
  proposedText: string;
  author: string;
  rationale?: string;
  guideSpecId?: string;
  guideVersion?: string;
  guideSnippetId?: string;
}): SpecTrackedChange {
  const now = new Date().toISOString();
  const change: SpecTrackedChange = {
    id: `chg-${Date.now()}`,
    documentId: input.documentId,
    workingCopyId: input.workingCopyId,
    blockId: input.blockId,
    sectionId: input.sectionId,
    originalText: input.originalText,
    proposedText: input.proposedText,
    status: 'pending',
    method: 'manual',
    author: input.author,
    rationale: input.rationale,
    createdAt: now,
    guideSpecId: input.guideSpecId,
    guideVersion: input.guideVersion,
    guideSnippetId: input.guideSnippetId,
  };
  setState((prev) => ({
    ...prev,
    changes: [...prev.changes, change],
    workingCopies: prev.workingCopies.map((w) =>
      w.id === input.workingCopyId ? { ...w, updatedAt: now } : w,
    ),
  }));
  return change;
}

export function resolveChangeInStore(
  changeId: string,
  status: 'accepted' | 'rejected',
): SpecTrackedChange | undefined {
  const now = new Date().toISOString();
  let resolved: SpecTrackedChange | undefined;
  setState((prev) => {
    const changes = prev.changes.map((c) => {
      if (c.id !== changeId) return c;
      resolved = { ...c, status, resolvedAt: now };
      return resolved;
    });
    if (!resolved || status !== 'accepted') {
      return { ...prev, changes };
    }
    const workingCopies = prev.workingCopies.map((w) => {
      if (w.id !== resolved!.workingCopyId) return w;
      return {
        ...w,
        updatedAt: now,
        blockOverrides: { ...w.blockOverrides, [resolved!.blockId]: resolved!.proposedText },
      };
    });
    return { ...prev, changes, workingCopies };
  });
  return resolved;
}

export function resolveProposalInStore(
  proposalId: string,
  status: 'accepted' | 'rejected',
): SpecAiProposal | undefined {
  const now = new Date().toISOString();
  let resolved: SpecAiProposal | undefined;
  setState((prev) => {
    const proposals = prev.proposals.map((p) => {
      if (p.id !== proposalId) return p;
      resolved = { ...p, status };
      return resolved;
    });
    if (!resolved) return { ...prev, proposals };

    if (status === 'rejected') {
      return { ...prev, proposals };
    }

    const change: SpecTrackedChange = {
      id: `chg-from-${proposalId}`,
      documentId: resolved.documentId,
      workingCopyId: resolved.workingCopyId,
      blockId: resolved.blockId,
      sectionId: resolved.sectionId,
      originalText: resolved.originalText,
      proposedText: resolved.proposedText,
      status: 'accepted',
      method: 'ai',
      author: 'AI assistant',
      rationale: resolved.rationale,
      createdAt: resolved.createdAt,
      resolvedAt: now,
      proposalId: resolved.id,
    };

    const workingCopies = prev.workingCopies.map((w) => {
      if (w.id !== resolved!.workingCopyId) return w;
      return {
        ...w,
        updatedAt: now,
        blockOverrides: { ...w.blockOverrides, [resolved!.blockId]: resolved!.proposedText },
      };
    });

    const changes = [
      ...prev.changes.filter((c) => c.proposalId !== proposalId),
      change,
    ];

    return { ...prev, proposals, changes, workingCopies };
  });
  return resolved;
}

export function addCommentMessageInStore(
  threadId: string,
  message: Omit<SpecCommentMessage, 'id'>,
): SpecCommentThread | undefined {
  const full: SpecCommentMessage = { ...message, id: `msg-${Date.now()}` };
  let updated: SpecCommentThread | undefined;
  setState((prev) => ({
    ...prev,
    commentThreads: prev.commentThreads.map((t) => {
      if (t.id !== threadId) return t;
      updated = { ...t, messages: [...t.messages, full] };
      return updated;
    }),
  }));
  return updated;
}

export function addCommentThreadInStore(input: {
  documentId: string;
  blockId: string;
  sectionId: string;
  author: string;
  body: string;
}): SpecCommentThread {
  const now = new Date().toISOString();
  const thread: SpecCommentThread = {
    id: `thread-${Date.now()}`,
    documentId: input.documentId,
    blockId: input.blockId,
    sectionId: input.sectionId,
    resolved: false,
    createdAt: now,
    messages: [{ id: `msg-${Date.now()}`, author: input.author, body: input.body, createdAt: now }],
  };
  setState((prev) => ({
    ...prev,
    commentThreads: [...prev.commentThreads, thread],
  }));
  return thread;
}

export function setCommentThreadResolvedInStore(threadId: string, resolved: boolean) {
  setState((prev) => ({
    ...prev,
    commentThreads: prev.commentThreads.map((t) => (t.id === threadId ? { ...t, resolved } : t)),
  }));
}

export function saveVersionInStore(input: {
  documentId: string;
  workingCopyId: string;
  label: string;
  description: string;
  actor: string;
}): SpecSavedVersion {
  const version: SpecSavedVersion = {
    id: `ver-${Date.now()}`,
    documentId: input.documentId,
    workingCopyId: input.workingCopyId,
    label: input.label,
    description: input.description,
    createdAt: new Date().toISOString(),
    actor: input.actor,
  };
  setState((prev) => ({
    ...prev,
    savedVersions: [...prev.savedVersions, version],
    documents: prev.documents.map((d) =>
      d.id === input.documentId
        ? { ...d, versionLabel: input.label, updatedAt: version.createdAt, reviewState: 'corrected' as const }
        : d,
    ),
  }));
  return version;
}

export function createChangeFromDeltaInStore(input: {
  documentId: string;
  workingCopyId: string;
  delta: SpecAlignmentDelta;
  author: string;
}): SpecTrackedChange {
  const block =
    storeCache.blocks.find((b) => b.documentId === input.documentId && b.text === input.delta.currentText) ??
    storeCache.blocks.find((b) => b.documentId === input.documentId);
  const section =
    storeCache.sections.find((s) => s.documentId === input.documentId && s.sectionNumber === input.delta.sectionKey) ??
    storeCache.sections.find((s) => s.documentId === input.documentId);

  return addManualChangeInStore({
    documentId: input.documentId,
    workingCopyId: input.workingCopyId,
    blockId: block?.id ?? `blk-from-delta-${input.delta.id}`,
    sectionId: section?.id ?? input.delta.sectionKey,
    originalText: input.delta.baselineText || input.delta.currentText,
    proposedText: input.delta.currentText || input.delta.baselineText,
    author: input.author,
    rationale: input.delta.note ?? `Created from review delta: ${input.delta.title}`,
  });
}

// ── I3 products / artifacts ──────────────────────────────────────────────────

export function listProductSuggestionsFromStore(documentId: string): SpecProductSuggestion[] {
  return storeCache.productSuggestions.filter((p) => p.documentId === documentId);
}

export function setProductSuggestionStatusInStore(
  id: string,
  status: SpecProductSuggestionStatus,
): SpecProductSuggestion | undefined {
  let updated: SpecProductSuggestion | undefined;
  setState((prev) => ({
    ...prev,
    productSuggestions: prev.productSuggestions.map((p) => {
      if (p.id !== id) return p;
      updated = { ...p, status };
      return updated;
    }),
  }));
  return updated;
}

export function listSubmittalObligationsFromStore(documentId: string): SpecSubmittalObligation[] {
  return storeCache.submittalObligations.filter((o) => o.documentId === documentId);
}

export function listSubmittalPackagesFromStore(documentId: string): SpecSubmittalPackage[] {
  return storeCache.submittalPackages.filter((p) => p.documentId === documentId);
}

export function createSubmittalPackageInStore(documentId: string, name: string): SpecSubmittalPackage {
  const now = new Date().toISOString();
  const pkg: SpecSubmittalPackage = {
    id: `pkg-${Date.now()}`,
    documentId,
    name,
    createdAt: now,
    updatedAt: now,
    items: [],
  };
  setState((prev) => ({
    ...prev,
    submittalPackages: [...prev.submittalPackages, pkg],
  }));
  return pkg;
}

export function renameSubmittalPackageInStore(packageId: string, name: string) {
  const now = new Date().toISOString();
  setState((prev) => ({
    ...prev,
    submittalPackages: prev.submittalPackages.map((p) =>
      p.id === packageId ? { ...p, name, updatedAt: now } : p,
    ),
  }));
}

export function addObligationToPackageInStore(packageId: string, obligationId: string) {
  const now = new Date().toISOString();
  setState((prev) => {
    const obligation = prev.submittalObligations.find((o) => o.id === obligationId);
    if (!obligation) return prev;
    return {
      ...prev,
      submittalObligations: prev.submittalObligations.map((o) =>
        o.id === obligationId ? { ...o, status: 'in-package' as const, packageId } : o,
      ),
      submittalPackages: prev.submittalPackages.map((p) => {
        if (p.id !== packageId) return p;
        if (p.items.some((i) => i.obligationId === obligationId)) return p;
        return {
          ...p,
          updatedAt: now,
          items: [
            ...p.items,
            { id: `pkgitem-${Date.now()}`, obligationId, title: obligation.title },
          ],
        };
      }),
    };
  });
}

export function getSubstitutionRequestFromStore(documentId: string): SpecSubstitutionRequest | undefined {
  return storeCache.substitutionRequests.find((r) => r.documentId === documentId);
}

export function addLineToSubstitutionInStore(
  documentId: string,
  line: Omit<SpecSubstitutionLine, 'id'>,
): SpecSubstitutionRequest {
  const now = new Date().toISOString();
  let result: SpecSubstitutionRequest | undefined;
  setState((prev) => {
    const existing = prev.substitutionRequests.find((r) => r.documentId === documentId);
    const newLine: SpecSubstitutionLine = { ...line, id: `subline-${Date.now()}` };
    if (existing) {
      result = {
        ...existing,
        lines: [...existing.lines.filter((l) => l.suggestionId !== line.suggestionId), newLine],
        status: 'ready-to-preview',
        updatedAt: now,
      };
      return {
        ...prev,
        substitutionRequests: prev.substitutionRequests.map((r) =>
          r.id === existing.id ? result! : r,
        ),
        productSuggestions: prev.productSuggestions.map((p) =>
          p.id === line.suggestionId ? { ...p, status: 'added-to-substitution' as const } : p,
        ),
      };
    }
    result = {
      id: `subreq-${Date.now()}`,
      documentId,
      title: 'Substitution request',
      status: 'ready-to-preview',
      lines: [newLine],
      updatedAt: now,
    };
    return {
      ...prev,
      substitutionRequests: [...prev.substitutionRequests, result],
      productSuggestions: prev.productSuggestions.map((p) =>
        p.id === line.suggestionId ? { ...p, status: 'added-to-substitution' as const } : p,
      ),
    };
  });
  return result!;
}

export function updateSubstitutionNotesInStore(documentId: string, notes: string) {
  setState((prev) => ({
    ...prev,
    substitutionRequests: prev.substitutionRequests.map((r) =>
      r.documentId === documentId ? { ...r, notes, updatedAt: new Date().toISOString() } : r,
    ),
  }));
}

export function submitSubstitutionInStore(documentId: string): SpecSubstitutionRequest | undefined {
  let updated: SpecSubstitutionRequest | undefined;
  setState((prev) => ({
    ...prev,
    substitutionRequests: prev.substitutionRequests.map((r) => {
      if (r.documentId !== documentId) return r;
      updated = { ...r, status: 'submitted', updatedAt: new Date().toISOString() };
      return updated;
    }),
  }));
  return updated;
}

// ── I4 collaboration store accessors / mutations ─────────────────────────────

export function listAskThreadsFromStore(documentId: string): SpecAskThread[] {
  return storeCache.askThreads.filter((t) => t.documentId === documentId);
}

export function getAskThreadFromStore(threadId: string): SpecAskThread | undefined {
  return storeCache.askThreads.find((t) => t.id === threadId);
}

export function listDeliverablesFromStore(documentId: string): SpecDeliverable[] {
  return storeCache.deliverables.filter((d) => d.documentId === documentId);
}

export function getDeliverableFromStore(deliverableId: string): SpecDeliverable | undefined {
  return storeCache.deliverables.find((d) => d.id === deliverableId);
}

export function createAskThreadInStore(input: {
  documentId: string;
  subject: string;
  question: string;
  requestType: string;
  urgency: SpecAskUrgency;
  context: SpecAskContextSnapshot;
  author: string;
}): SpecAskThread {
  const now = new Date().toISOString();
  const thread: SpecAskThread = {
    id: `ask-${Date.now()}`,
    documentId: input.documentId,
    subject: input.subject,
    question: input.question,
    requestType: input.requestType,
    urgency: input.urgency,
    status: 'submitted',
    context: input.context,
    messages: [
      {
        id: `askmsg-${Date.now()}`,
        author: input.author,
        role: 'requester',
        body: input.question,
        createdAt: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
  setState((prev) => ({
    ...prev,
    askThreads: [...prev.askThreads, thread],
  }));
  return thread;
}

export function replyToAskThreadInStore(
  threadId: string,
  message: Omit<SpecAskMessage, 'id'>,
): SpecAskThread | undefined {
  const full: SpecAskMessage = { ...message, id: `askmsg-${Date.now()}` };
  let updated: SpecAskThread | undefined;
  setState((prev) => ({
    ...prev,
    askThreads: prev.askThreads.map((t) => {
      if (t.id !== threadId) return t;
      const nextStatus =
        full.role === 'engineer' && t.status !== 'closed' && t.status !== 'answered'
          ? ('answered' as const)
          : t.status;
      updated = {
        ...t,
        status: nextStatus,
        messages: [...t.messages, full],
        updatedAt: new Date().toISOString(),
      };
      return updated;
    }),
  }));
  return updated;
}

/**
 * Creates a pending AI proposal from an engineer answer — never edits the working copy (AC-031).
 */
export function createProposalFromAskAnswerInStore(
  threadId: string,
  messageId: string,
): SpecAiProposal | undefined {
  const thread = storeCache.askThreads.find((t) => t.id === threadId);
  if (!thread) return undefined;
  const message = thread.messages.find((m) => m.id === messageId);
  const wording = message?.proposedWording;
  if (!wording) return undefined;

  let workingCopy = storeCache.workingCopies.find((w) => w.documentId === thread.documentId);
  if (!workingCopy) {
    workingCopy = createWorkingCopyInStore(thread.documentId, thread.context.versionLabel);
  }

  const now = new Date().toISOString();
  const proposal: SpecAiProposal = {
    id: `prop-ask-${Date.now()}`,
    documentId: thread.documentId,
    workingCopyId: workingCopy.id,
    blockId: wording.blockId,
    sectionId: wording.sectionId,
    originalText: wording.originalText,
    proposedText: wording.proposedText,
    rationale: wording.rationale,
    confidence: 'high',
    confidencePercent: 90,
    citationIds: thread.context.citationId ? [thread.context.citationId] : [],
    commerciallyMotivated: false,
    status: 'pending',
    createdAt: now,
  };

  setState((prev) => ({
    ...prev,
    proposals: [...prev.proposals, proposal],
    askThreads: prev.askThreads.map((t) =>
      t.id === threadId ? { ...t, createdProposalId: proposal.id, updatedAt: now } : t,
    ),
  }));
  return proposal;
}

export function setDeliverableStatusInStore(
  deliverableId: string,
  status: SpecDeliverBackStatus,
  actor: string,
  detail?: string,
): SpecDeliverable | undefined {
  const now = new Date().toISOString();
  let updated: SpecDeliverable | undefined;
  setState((prev) => ({
    ...prev,
    deliverables: prev.deliverables.map((d) => {
      if (d.id !== deliverableId) return d;
      const versions =
        status === 'accepted'
          ? d.versions.map((v) =>
              v.id === d.currentVersionId ? { ...v, accepted: true } : { ...v, accepted: false },
            )
          : d.versions;
      updated = {
        ...d,
        status,
        versions,
        activity: [
          ...d.activity,
          {
            id: `act-${Date.now()}`,
            at: now,
            actor,
            action:
              status === 'revision-requested'
                ? 'Revision requested'
                : status === 'in-progress'
                  ? 'In progress'
                  : status === 'accepted'
                    ? 'Accepted'
                    : status === 'delivered'
                      ? 'Delivered'
                      : 'Requested',
            detail,
          },
        ],
        notifications: [
          ...d.notifications,
          {
            id: `notif-${Date.now()}`,
            at: now,
            title: `Deliver-Back ${status === 'revision-requested' ? 'revision requested' : status}`,
            body: detail ?? `Status is now ${status}.`,
          },
        ],
      };
      return updated;
    }),
  }));
  return updated;
}

export function addDeliverableCommentInStore(
  deliverableId: string,
  author: string,
  body: string,
): SpecDeliverable | undefined {
  const now = new Date().toISOString();
  let updated: SpecDeliverable | undefined;
  setState((prev) => ({
    ...prev,
    deliverables: prev.deliverables.map((d) => {
      if (d.id !== deliverableId) return d;
      updated = {
        ...d,
        comments: [...d.comments, { id: `dcom-${Date.now()}`, author, body, createdAt: now }],
      };
      return updated;
    }),
  }));
  return updated;
}

export function setDeliverableCurrentVersionInStore(deliverableId: string, versionId: string) {
  setState((prev) => ({
    ...prev,
    deliverables: prev.deliverables.map((d) =>
      d.id === deliverableId ? { ...d, currentVersionId: versionId } : d,
    ),
  }));
}

export function listGuideSpecsFromStore(): SpecGuideSpec[] {
  return storeCache.guideSpecs;
}

export function getGuideSpecFromStore(id: string): SpecGuideSpec | undefined {
  return storeCache.guideSpecs.find((g) => g.id === id);
}

export function updateGuideSpecContentInStore(id: string, content: string): SpecGuideSpec | undefined {
  const now = new Date().toISOString();
  let updated: SpecGuideSpec | undefined;
  setState((prev) => ({
    ...prev,
    guideSpecs: prev.guideSpecs.map((g) => {
      if (g.id !== id) return g;
      updated = { ...g, content, updatedAt: now };
      return updated;
    }),
  }));
  return updated;
}

/**
 * Builds a merge preview without mutating the store (AC-036).
 * Caller confirms before `insertGuideSnippetInStore`.
 */
export function buildGuideMergePreviewInStore(input: {
  guideSpecId: string;
  snippetId: string;
  documentId: string;
}): SpecGuideMergePreview | undefined {
  const guide = storeCache.guideSpecs.find((g) => g.id === input.guideSpecId);
  const snippet = guide?.snippets.find((s) => s.id === input.snippetId);
  if (!guide || !snippet) return undefined;

  const document = storeCache.documents.find((d) => d.id === input.documentId);
  if (!document) return undefined;

  let workingCopy = storeCache.workingCopies.find((w) => w.documentId === input.documentId);
  if (!workingCopy) {
    workingCopy = createWorkingCopyInStore(input.documentId, document.versionLabel);
  }

  const preferredBlock =
    (snippet.preferredBlockId
      ? storeCache.blocks.find((b) => b.id === snippet.preferredBlockId && b.documentId === input.documentId)
      : undefined) ??
    storeCache.blocks.find(
      (b) => b.documentId === input.documentId && b.kind === 'paragraph' && b.sectionId,
    );

  if (!preferredBlock) return undefined;

  const sectionId = snippet.preferredSectionId ?? preferredBlock.sectionId ?? '';
  const originalText =
    workingCopy.blockOverrides[preferredBlock.id] ?? preferredBlock.text;

  const pendingOnBlock = storeCache.changes.filter(
    (c) =>
      c.documentId === input.documentId &&
      c.blockId === preferredBlock.id &&
      c.status === 'pending',
  );

  const conflicts: string[] = [];
  if (pendingOnBlock.length > 0) {
    conflicts.push(
      `A pending edit already targets clause ${preferredBlock.label ?? preferredBlock.id}. Confirming replaces that pending wording with guide language.`,
    );
  }
  if (preferredBlock.label && preferredBlock.label !== snippet.suggestedLabel) {
    conflicts.push(
      `Numbering shift: current clause is ${preferredBlock.label}; guide language suggests ${snippet.suggestedLabel}.`,
    );
  }

  const numberingNote =
    preferredBlock.label && preferredBlock.label !== snippet.suggestedLabel
      ? `Clause label would move from ${preferredBlock.label} to ${snippet.suggestedLabel}.`
      : preferredBlock.label
        ? `Clause label stays ${preferredBlock.label}.`
        : `Guide language inserts as ${snippet.suggestedLabel}.`;

  return {
    guideSpecId: guide.id,
    guideVersion: guide.version,
    snippetId: snippet.id,
    documentId: input.documentId,
    workingCopyId: workingCopy.id,
    blockId: preferredBlock.id,
    sectionId,
    currentLabel: preferredBlock.label,
    proposedLabel: snippet.suggestedLabel,
    originalText,
    proposedText: snippet.body,
    numberingNote,
    conflicts,
    canInsert: guide.insertPermission !== 'blocked',
  };
}

/**
 * Creates a pending tracked change from guide language after merge preview confirm (AC-035, AC-036).
 * Does not edit the working-copy text until Accept in Edit.
 */
export function insertGuideSnippetInStore(input: {
  preview: SpecGuideMergePreview;
  author: string;
  resolvePendingConflicts?: boolean;
}): SpecTrackedChange | undefined {
  const guide = storeCache.guideSpecs.find((g) => g.id === input.preview.guideSpecId);
  if (!guide || guide.insertPermission === 'blocked') return undefined;

  const preview = input.preview;
  if (input.resolvePendingConflicts) {
    const now = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      changes: prev.changes.map((c) =>
        c.documentId === preview.documentId &&
        c.blockId === preview.blockId &&
        c.status === 'pending'
          ? { ...c, status: 'rejected' as const, resolvedAt: now }
          : c,
      ),
    }));
  }

  return addManualChangeInStore({
    documentId: preview.documentId,
    workingCopyId: preview.workingCopyId,
    blockId: preview.blockId,
    sectionId: preview.sectionId,
    originalText: preview.originalText,
    proposedText: preview.proposedText,
    author: input.author,
    rationale: `Inserted from guide ${guide.title} (${guide.version}).`,
    guideSpecId: guide.id,
    guideVersion: guide.version,
    guideSnippetId: preview.snippetId,
  });
}
