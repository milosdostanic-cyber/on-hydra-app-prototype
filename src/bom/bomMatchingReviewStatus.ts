import type { BomMatchResult } from './data/types';
import { isReadyToConfirmMatch, matchRequiresSkuSelection } from './bomMatchSkuUtils';

/** User-facing review status derived from match row state (no new persisted fields). */
export type BomReviewDisplayStatus =
  | 'confirmed'
  | 'chosen'
  | 'skipped'
  | 'unresolved'
  | 'needs-sku'
  | 'ready-to-confirm'
  | 'cant-match';

export type MatchingReviewSummary = {
  total: number;
  confirmed: number;
  chosen: number;
  skipped: number;
  unresolved: number;
  needsSku: number;
  readyToConfirm: number;
  /** Parse-unusable lines — not counted in pending / needs attention. */
  cantMatch: number;
  pending: number;
  incomplete: number;
};

export function deriveReviewDisplayStatus(row: BomMatchResult): BomReviewDisplayStatus {
  if (row.parseUnusable) return 'cant-match';
  if (row.lineStatus === 'skipped') return 'skipped';
  if (row.lineStatus === 'accepted') {
    return row.source === 'manual' ? 'chosen' : 'confirmed';
  }
  if (!row.topMatch) return 'unresolved';
  if (matchRequiresSkuSelection(row)) return 'needs-sku';
  if (isReadyToConfirmMatch(row)) return 'ready-to-confirm';
  return 'unresolved';
}

export function computeMatchingReviewSummary(results: BomMatchResult[]): MatchingReviewSummary {
  const summary: MatchingReviewSummary = {
    total: results.length,
    confirmed: 0,
    chosen: 0,
    skipped: 0,
    unresolved: 0,
    needsSku: 0,
    readyToConfirm: 0,
    cantMatch: 0,
    pending: 0,
    incomplete: 0,
  };

  for (const row of results) {
    const status = deriveReviewDisplayStatus(row);
    switch (status) {
      case 'confirmed':
        summary.confirmed += 1;
        break;
      case 'chosen':
        summary.chosen += 1;
        break;
      case 'skipped':
        summary.skipped += 1;
        break;
      case 'cant-match':
        summary.cantMatch += 1;
        break;
      case 'unresolved':
        summary.unresolved += 1;
        summary.pending += 1;
        summary.incomplete += 1;
        break;
      case 'needs-sku':
        summary.needsSku += 1;
        summary.pending += 1;
        summary.incomplete += 1;
        break;
      case 'ready-to-confirm':
        summary.readyToConfirm += 1;
        summary.pending += 1;
        summary.incomplete += 1;
        break;
      default:
        break;
    }
  }

  return summary;
}

export const reviewDisplayStatusLabel: Record<BomReviewDisplayStatus, string> = {
  confirmed: 'Confirmed',
  chosen: 'Chosen',
  skipped: 'Skipped',
  unresolved: 'Unresolved',
  'needs-sku': 'Needs exact product',
  'ready-to-confirm': 'Ready to confirm',
  'cant-match': "Can't be matched",
};
