import { PROCESSING_STAGE_ORDER } from '../constants/specStatusVocabulary';
import type { SpecProcessingStage, SpecProcessingStageId, SpecStageState } from './types';

export function allStages(
  upTo: SpecProcessingStageId | 'complete',
  failedAt?: SpecProcessingStageId,
): SpecProcessingStage[] {
  let pastActive = false;
  return PROCESSING_STAGE_ORDER.map((id) => {
    if (failedAt && id === failedAt) {
      pastActive = true;
      return { id, state: 'failed' as SpecStageState, note: 'Could not complete this stage.' };
    }
    if (upTo === 'complete') {
      return { id, state: 'done' as SpecStageState };
    }
    if (id === upTo && !pastActive) {
      pastActive = true;
      return { id, state: 'active' as SpecStageState };
    }
    if (!pastActive) {
      const idx = PROCESSING_STAGE_ORDER.indexOf(id);
      const targetIdx = PROCESSING_STAGE_ORDER.indexOf(upTo);
      if (idx < targetIdx) return { id, state: 'done' as SpecStageState };
    }
    return { id, state: 'pending' as SpecStageState };
  });
}

export function readyStages(): SpecProcessingStage[] {
  return allStages('complete');
}

export function failedStages(at: SpecProcessingStageId = 'ocr-layout'): SpecProcessingStage[] {
  return allStages(at, at);
}

export function processingAt(stage: SpecProcessingStageId): SpecProcessingStage[] {
  return allStages(stage);
}

export function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}
