import { isReadyToConfirmMatch } from './bomMatchSkuUtils';
import type { BomMatchResult } from './data/types';

/** Same threshold as `matchScoreBand` high band — only these auto-accept on bulk action. */
export const HIGH_MATCH_AUTO_ACCEPT_THRESHOLD = 90;

export function isHighMatchConfidence(confidence: number | undefined): boolean {
  return (confidence ?? 0) >= HIGH_MATCH_AUTO_ACCEPT_THRESHOLD;
}

export type BulkAcceptHighSkipRestResult = {
  next: BomMatchResult[];
  acceptedCount: number;
  skippedCount: number;
};

/**
 * Pending rows with high match score → accepted.
 * Pending rows with medium/low (or no match) → skipped — not accepted.
 */
export function applyAcceptAllHighSkipRest(results: BomMatchResult[]): BulkAcceptHighSkipRestResult {
  let acceptedCount = 0;
  let skippedCount = 0;

  const next = results.map((row) => {
    if (row.lineStatus !== 'pending') return row;
    if (isHighMatchConfidence(row.topMatch?.matchConfidence) && isReadyToConfirmMatch(row)) {
      acceptedCount += 1;
      return { ...row, lineStatus: 'accepted' as const };
    }
    skippedCount += 1;
    return { ...row, lineStatus: 'skipped' as const };
  });

  return { next, acceptedCount, skippedCount };
}

export function bulkAcceptHighSkipRestMessage(acceptedCount: number, skippedCount: number): string {
  const acceptedPart =
    acceptedCount === 0
      ? ''
      : `Accepted ${acceptedCount} high-confidence line${acceptedCount === 1 ? '' : 's'}.`;
  const skippedPart =
    skippedCount === 0
      ? ''
      : `Skipped ${skippedCount} line${skippedCount === 1 ? '' : 's'} with medium or low confidence — those are not added to your BOM.`;

  if (acceptedPart && skippedPart) return `${acceptedPart} ${skippedPart}`;
  if (acceptedPart) return acceptedPart;
  if (skippedPart) return skippedPart;
  return 'No pending lines to update.';
}
