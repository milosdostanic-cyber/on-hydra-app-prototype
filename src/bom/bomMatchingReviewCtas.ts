import { isReadyToConfirmMatch, matchRequiresSkuSelection } from './bomMatchSkuUtils';
import type { BomMatchResult } from './data/types';

/** Item-level review state used to pick CTA labels and visibility. */
export type BomReviewItemCtaState =
  | 'no-match'
  | 'figure-only'
  | 'sku-ready'
  | 'manual-pending'
  | 'skipped';

export function resolveReviewItemCtaState(row: BomMatchResult): BomReviewItemCtaState {
  if (row.lineStatus === 'skipped') return 'skipped';
  if (!row.topMatch) return 'no-match';
  if (matchRequiresSkuSelection(row)) return 'figure-only';
  if (row.source === 'manual' && row.lineStatus === 'pending') return 'manual-pending';
  return 'sku-ready';
}

/** Card-level primary — may open SKU picker or choose flow before confirm. */
export function reviewPrimaryCtaLabel(row: BomMatchResult): string {
  const state = resolveReviewItemCtaState(row);
  switch (state) {
    case 'no-match':
      return 'Choose a part';
    case 'figure-only':
      return 'Pick exact product';
    case 'manual-pending':
      return 'Confirm and continue';
    case 'skipped':
      return 'Review';
    case 'sku-ready':
    default:
      return 'Confirm and continue';
  }
}

/** Page header primary — always confirm and advance (choose flow when there is no suggestion). */
export function reviewHeaderPrimaryCtaLabel(_row: BomMatchResult): string {
  return 'Confirm and continue';
}

export function reviewSecondaryCtaLabel(row: BomMatchResult): string | null {
  const state = resolveReviewItemCtaState(row);
  if (state === 'no-match' || state === 'skipped') return null;
  if (state === 'figure-only') return 'Choose different part';
  if (state === 'manual-pending') return 'Change selection';
  if (row.selectedVariantId && row.matchLevel !== 'figure') return 'Change product';
  return 'Choose different part';
}

export function reviewCanConfirm(row: BomMatchResult): boolean {
  return isReadyToConfirmMatch(row) && row.lineStatus === 'pending';
}

export function reviewDetailPrimaryLabel(row: BomMatchResult): string {
  const state = resolveReviewItemCtaState(row);
  if (state === 'figure-only') return 'Pick exact product';
  if (state === 'manual-pending') return 'Confirm and continue';
  return 'Confirm and continue';
}

/** Single row action for the summary table — status column carries the rest. */
export function summaryTableRowActionLabel(row: BomMatchResult): string | null {
  if (row.lineStatus === 'accepted') return 'Change match';
  if (row.lineStatus === 'skipped') return 'Review';
  const state = resolveReviewItemCtaState(row);
  if (state === 'no-match') return 'Choose part';
  if (state === 'figure-only') return 'Pick exact product';
  if (state === 'sku-ready' || state === 'manual-pending') return 'Confirm match';
  return null;
}
