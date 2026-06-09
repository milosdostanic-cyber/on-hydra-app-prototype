import { ASC_FIELD_MAPPING_TOTAL } from './bomFieldMappingUtils';

/** Step 0 — column mapping progress for the upload flow chrome tag. */
export function mappingStepStatusLabel(mappedCount: number): string {
  return `${mappedCount} of ${ASC_FIELD_MAPPING_TOTAL} fields mapped`;
}

type MatchingReviewStats = {
  total: number;
  pending: number;
};

/** Step 2 — match review progress (table or guided). */
export function matchingStepStatusLabel({ total, pending }: MatchingReviewStats): string {
  if (total === 0) return 'No parts to match';
  if (pending === 0) return `All ${total} reviewed`;
  const reviewed = total - pending;
  return `${reviewed} of ${total} reviewed`;
}

/** Step 2 — guided card flow (current position in queue). */
export function guidedMatchingStepStatusLabel(
  reviewingPosition: number,
  total: number,
  allDone: boolean,
): string {
  if (total === 0) return 'No parts to match';
  if (allDone) return `All ${total} reviewed`;
  return `Reviewing part ${reviewingPosition} of ${total}`;
}
