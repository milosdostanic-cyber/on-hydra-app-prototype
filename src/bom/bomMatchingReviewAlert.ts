import { resolveFigureNumber } from './bomMatchSkuUtils';
import { resolveReviewItemCtaState } from './bomMatchingReviewCtas';
import { matchScoreBand } from './data/bomImportFlowSeed';
import { getSkuVariantsForFigure } from './data/ascSkuVariants';
import type { BomItem, BomMatchResult } from './data/types';

/** Same label as the YOUR PART panel — parsed description first, then raw file text. */
export function resolveImportedPartDisplayLabel(
  row: BomMatchResult,
  parsedItem?: BomItem,
): string {
  return (
    parsedItem?.parsedDescription?.trim() ||
    parsedItem?.originalInput?.trim() ||
    row.originalRequest
  );
}

export type MatchingReviewAlertContent = {
  type: 'success' | 'info' | 'warning';
  message: string;
  description: string;
};

function quotePartLabel(originalRequest: string): string {
  return `“${originalRequest}”`;
}

function confidencePhrase(confidence: number): string {
  const band = matchScoreBand(confidence);
  const pct = confidence > 0 ? ` (${confidence}% match)` : '';
  if (band === 'high') return `a strong match${pct}`;
  if (band === 'medium') return `a fair match${pct}`;
  if (band === 'low') return `a weak match${pct}`;
  return 'a limited match';
}

/** Guided review alert for the part currently on screen — plain language, no jargon. */
export function currentPartMatchingReviewAlert(
  row: BomMatchResult,
  parsedItem?: BomItem,
): MatchingReviewAlertContent {
  const original = quotePartLabel(resolveImportedPartDisplayLabel(row, parsedItem));
  const state = resolveReviewItemCtaState(row);
  const top = row.topMatch;

  if (state === 'skipped') {
    return {
      type: 'info',
      message: 'This part was skipped',
      description: `You skipped ${original} earlier. Look at the options below, or skip again and finish this line later from the summary table.`,
    };
  }

  if (state === 'no-match') {
    return {
      type: 'warning',
      message: 'No suggestion for this part',
      description: `We could not find a matching product for ${original}. Choose a part yourself, or skip this line and come back to it later.`,
    };
  }

  if (!top) {
    return {
      type: 'info',
      message: 'Review this part',
      description: `Check the options for ${original}, then confirm a match or skip this line.`,
    };
  }

  const suggested = top.partNumber;
  const conf = top.matchConfidence ?? 0;

  if (state === 'figure-only') {
    const figure = resolveFigureNumber(row) ?? suggested;
    const optionCount = getSkuVariantsForFigure(figure).length;
    const optionNote =
      optionCount > 0
        ? ` Choose one of ${optionCount} product option${optionCount === 1 ? '' : 's'} below, then confirm`
        : ' Choose the exact product below, then confirm';

    return {
      type: 'info',
      message: 'Pick the exact product for this part',
      description: `We matched ${original} to product family ${figure} with ${confidencePhrase(conf)}.${optionNote} — or choose a different part if this family is not right.`,
    };
  }

  if (state === 'manual-pending') {
    return {
      type: 'info',
      message: 'Confirm your part choice',
      description: `You picked ${suggested} for ${original}. Confirm to keep this match, or change it if it is not right.`,
    };
  }

  const band = matchScoreBand(conf);
  if (band === 'high') {
    return {
      type: 'success',
      message: 'Ready to confirm this match',
      description: `We suggested ${suggested} for ${original} with a strong match${conf > 0 ? ` (${conf}%)` : ''}. Confirm to accept, or choose a different part if needed.`,
    };
  }

  return {
    type: 'warning',
    message: 'Check this match before you confirm',
    description: `We suggested ${suggested} for ${original} with ${confidencePhrase(conf)}. Look at the details below, then confirm or pick another option.`,
  };
}
