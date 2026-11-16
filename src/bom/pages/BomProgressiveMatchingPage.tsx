import { useEffect, useMemo, useState } from 'react';
import { LeftOutlined } from '@ant-design/icons';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import {
  reviewCanConfirm,
  reviewHeaderPrimaryCtaLabel,
  reviewPrimaryCtaLabel,
  reviewSecondaryCtaLabel,
  resolveReviewItemCtaState,
} from '../bomMatchingReviewCtas';
import {
  applyAutoMatchHighConfidence,
  applySkuCardToMatchRow,
  bestMatchReviewSkuCard,
  countHighConfidenceAutoMatchableRows,
  matchRequiresSkuSelection,
  rowNeedsBestSkuAutoSelect,
  type SkuMatchCardItem,
} from '../bomMatchSkuUtils';
import { useBomMatchingData } from '../hooks/useBomMatchingData';
import type { BomUploadFlowLocationState } from '../bomUploadFlowState';
import { readUploadFileName } from '../bomUploadFlowState';
import { computeMatchingReviewSummary } from '../bomMatchingReviewStatus';
import { guidedMatchingStepStatusLabel } from '../bomUploadFlowStatus';
import { buildBomChoosePartSearchQuery } from '../bomChoosePartUtils';
import {
  applyCatalogPickToMatchResult,
  catalogPickSuccessMessage,
  catalogProductByKey,
  matchingCatalogPickRoute,
  readCatalogPickReturn,
} from '../bomCatalogPickNavigation';
import { BomGuidedReviewCompletePanel } from '../components/BomGuidedReviewCompletePanel';
import { BomMatchingReviewPartPanel } from '../components/BomMatchingReviewPartPanel';
import { BomMatchingReviewQualityAlert } from '../components/BomMatchingReviewQualityAlert';
import { shouldShowGuidedReviewPageAlert } from '../bomMatchingReviewAlert';
import { BomUploadFlowStepChrome } from '../components/BomUploadFlowStepChrome';
import { BomPageHeader } from '../layout/BomPageHeader';
import { bomItemById, bomProjectTitleById } from '../data/mockData';
import type { BomMatchResult } from '../data/types';
import {
  hydraBaseNormal,
  hydraSubtitleLarge,
  hydraTextStyleToReactCss,
} from '../../theme/hydraTypography';
import {
  Alert,
  Button,
  Card,
  Flex,
  Progress,
  Typography,
  message,
  theme,
} from '../../ui/antd';

function firstPendingLineIndex(results: BomMatchResult[]): number {
  const idx = results.findIndex((row) => row.lineStatus === 'pending' && !row.parseUnusable);
  return idx >= 0 ? idx : results.length;
}

function resolveGuidedReviewIndex(
  results: BomMatchResult[],
  focusItemId?: string,
): number {
  if (focusItemId) {
    const focused = results.findIndex((row) => row.itemId === focusItemId);
    if (focused >= 0) return focused;
  }
  return firstPendingLineIndex(results);
}

function autoMatchHighButtonLabel(count: number): string {
  return `Accept all strong, skip rest (${count})`;
}

export function BomProgressiveMatchingPage() {
  const { token } = theme.useToken();
  const { bomProjectId = '' } = useParams<{ bomProjectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const uploadState = (location.state ?? {}) as BomUploadFlowLocationState;
  const uploadFileName = readUploadFileName(uploadState);
  const resolveFromTable = Boolean(uploadState.resolveFromTable);
  const projectTitle = bomProjectTitleById(bomProjectId) ?? 'BOM project';
  const tableRoute = `/bom/projects/${bomProjectId}/matching/table`;
  const { session, uploadId, matchResults, persist, stats } = useBomMatchingData(bomProjectId);

  const queue = matchResults;

  const [index, setIndex] = useState(0);
  const [lastReviewed, setLastReviewed] = useState<BomMatchResult | undefined>();
  const current: BomMatchResult | undefined = index < queue.length ? queue[index] : undefined;
  const allDone = index >= queue.length;
  const reviewSummary = useMemo(() => computeMatchingReviewSummary(matchResults), [matchResults]);
  const displayMatch = current ?? (allDone ? lastReviewed : undefined);
  const parsedItem = displayMatch
    ? bomItemById(displayMatch.itemId) ?? session?.parsedItems.find((i) => i.id === displayMatch.itemId)
    : undefined;
  const totalParts = matchResults.length;
  const reviewingPosition = allDone ? totalParts : index + 1;
  const matchingProgressStatus = guidedMatchingStepStatusLabel(reviewingPosition, totalParts, allDone);
  const reviewedCount = stats.accepted + stats.skipped;
  const remainingCount = Math.max(totalParts - reviewedCount, 0);
  const pendingCount = matchResults.filter(
    (row) => row.lineStatus === 'pending' && !row.parseUnusable,
  ).length;
  const autoMatchableCount = useMemo(
    () => countHighConfidenceAutoMatchableRows(matchResults),
    [matchResults],
  );

  const parsingReviewRoute = `/bom/projects/${bomProjectId}/parsing-review`;

  useEffect(() => {
    setIndex(resolveGuidedReviewIndex(matchResults, uploadState.focusItemId));
  }, [uploadId, location.key, uploadState.focusItemId, matchResults.length]);

  useEffect(() => {
    if (!current || !rowNeedsBestSkuAutoSelect(current)) return;
    const best = bestMatchReviewSkuCard(current);
    if (!best) return;
    persist(
      matchResults.map((row) =>
        row.itemId === current.itemId ? applySkuCardToMatchRow(row, best) : row,
      ),
    );
  }, [current?.itemId]);

  useEffect(() => {
    const applied = readCatalogPickReturn(location.state);
    if (!applied) return;

    const matchRow = matchResults.find((row) => row.itemId === applied.itemId);
    const product = catalogProductByKey(applied.productKey);
    if (!matchRow || !product) return;

    const hadSuggestion = Boolean(matchRow.topMatch);
    const next = applyCatalogPickToMatchResult(matchRow, product, applied.variantId);
    persist(matchResults.map((row) => (row.itemId === applied.itemId ? next : row)));
    message.success(
      catalogPickSuccessMessage(hadSuggestion, Boolean(applied.variantId)),
    );

    navigate(location.pathname, {
      replace: true,
      state: { ...uploadState, focusItemId: applied.itemId },
    });
  }, [location.state]);

  function reopenSkippedInGuided() {
    const firstSkippedIdx = matchResults.findIndex((row) => row.lineStatus === 'skipped');
    if (firstSkippedIdx < 0) return;
    persist(
      matchResults.map((row) =>
        row.lineStatus === 'skipped' ? { ...row, lineStatus: 'pending' as const } : row,
      ),
    );
    setIndex(firstSkippedIdx);
  }

  function goToMatchingSummary() {
    navigate(tableRoute, {
      state: { ...uploadState, guidedReviewComplete: true },
    });
  }

  function patchCurrent(patch: Partial<BomMatchResult>) {
    if (!current) return;
    persist(matchResults.map((r) => (r.itemId === current.itemId ? { ...r, ...patch } : r)));
  }

  function advanceAfterAction() {
    if (current) setLastReviewed(current);
    setIndex((i) => {
      let next = i + 1;
      while (next < matchResults.length && matchResults[next]?.parseUnusable) {
        next += 1;
      }
      return next;
    });
  }

  function handleConfirm() {
    if (!current) return;
    if (!current.topMatch) {
      patchCurrent({ lineStatus: 'skipped' });
      message.info('No match to confirm — you can choose a part later from the summary table.');
      advanceAfterAction();
      return;
    }
    if (!reviewCanConfirm(current)) {
      message.info('Pick the exact product before you confirm this match.');
      return;
    }
    patchCurrent({ lineStatus: 'accepted', source: current.source === 'manual' ? 'manual' : 'auto' });
    if (matchRequiresSkuSelection(current)) {
      message.info('Match saved at product family level — you can pick the exact product later.');
    } else {
      message.success('Match confirmed.');
    }
    advanceAfterAction();
  }

  function handleSkip() {
    if (!current) return;
    patchCurrent({ lineStatus: 'skipped' });
    message.info('Part skipped — you can review skipped items before import.');
    advanceAfterAction();
  }

  function handleChoosePart() {
    if (!current) return;
    const searchQuery = buildBomChoosePartSearchQuery(current, parsedItem);
    navigate(matchingCatalogPickRoute(bomProjectId), {
      state: {
        matchingPickItemId: current.itemId,
        returnTo: `/bom/projects/${bomProjectId}/matching/review`,
        returnLabel: 'Back to matching review',
        uploadFlowState: uploadState,
        catalogSearch: searchQuery || undefined,
        pickSource: {
          partNumber: current.topMatch?.partNumber ?? parsedItem?.sku,
          description: parsedItem?.parsedDescription ?? current.originalRequest,
          size: parsedItem?.size,
          category: parsedItem?.category,
        },
      },
    });
  }

  function handleSelectSku(item: SkuMatchCardItem) {
    if (!current) return;
    patchCurrent(applySkuCardToMatchRow(current, item));
    message.success('SKU selected.');
  }

  function handleAutoMatchHigh() {
    if (pendingCount === 0) {
      message.info('All parts are already reviewed.');
      return;
    }
    const beforePending = matchResults.filter(
      (row) => row.lineStatus === 'pending' && !row.parseUnusable,
    );
    const next = applyAutoMatchHighConfidence(matchResults);
    const newlyAccepted = beforePending.filter(
      (row) => next.find((entry) => entry.itemId === row.itemId)?.lineStatus === 'accepted',
    ).length;
    const newlySkipped = beforePending.length - newlyAccepted;
    persist(next);
    if (next.length > 0) setLastReviewed(next[next.length - 1]);
    setIndex(next.length);
    message.success(
      `Accepted ${newlyAccepted} high-confidence part${newlyAccepted === 1 ? '' : 's'}. ${newlySkipped} skipped for manual review.`,
    );
  }

  if (matchResults.length === 0) return null;
  if (!allDone && !current) return null;

  const ctaState = current ? resolveReviewItemCtaState(current) : null;
  const headerPrimaryLabel = current
    ? ctaState === 'no-match'
      ? reviewPrimaryCtaLabel(current)
      : reviewHeaderPrimaryCtaLabel(current)
    : '';
  const headerSecondaryLabel = current ? reviewSecondaryCtaLabel(current) : null;
  const headerConfirmDisabled = current
    ? ctaState === 'no-match'
      ? false
      : Boolean(current.topMatch) && !reviewCanConfirm(current)
    : false;
  const hasSkippedItems = reviewSummary.skipped > 0;
  const readyCount = reviewSummary.confirmed + reviewSummary.chosen;

  const matchingHeaderDescription = useMemo(() => {
    if (allDone) {
      return hasSkippedItems
        ? `${readyCount} ready to import · ${reviewSummary.skipped} skipped for ${projectTitle}.`
        : reviewSummary.cantMatch > 0
          ? `${readyCount} ready to import · ${reviewSummary.cantMatch} can't be matched for ${projectTitle}.`
          : `All ${reviewSummary.total} parts reviewed for ${projectTitle}.`;
    }
    if (resolveFromTable && pendingCount > 1) {
      return `Part ${reviewingPosition} of ${totalParts} · ${pendingCount - 1} more part${pendingCount - 1 === 1 ? '' : 's'} still need a decision after this one.`;
    }
    return `Part ${reviewingPosition} of ${totalParts} · ${projectTitle}`;
  }, [allDone, hasSkippedItems, pendingCount, projectTitle, readyCount, resolveFromTable, reviewSummary, reviewingPosition, totalParts]);

  function handleHeaderPrimary() {
    if (!current) return;
    if (ctaState === 'no-match') {
      handleChoosePart();
      return;
    }
    handleConfirm();
  }

  return (
    <>
    <Flex
      vertical
      gap={token.marginMD}
      style={{ width: '100%' }}
    >
      <div style={{ flexShrink: 0 }}>
        {resolveFromTable ? (
          <Button
            type="default"
            icon={<LeftOutlined />}
            onClick={() => navigate(tableRoute, { state: { ...uploadState, resolveFromTable: undefined } })}
            style={{ alignSelf: 'flex-start' }}
          >
            Back to matching results
          </Button>
        ) : (
          <BomUploadFlowStepChrome
            backTo={parsingReviewRoute}
            backLabel="Back to file check"
            backState={uploadState}
            fileName={uploadFileName}
            currentStep={2}
            statusLabel={matchingProgressStatus}
            statusTone={allDone ? 'success' : 'warning'}
            stepsComplete={allDone}
          />
        )}
      </div>

      <div style={{ flexShrink: 0 }}>
      <BomPageHeader
        title={allDone ? (resolveFromTable ? 'All parts resolved' : 'Guided review complete') : (resolveFromTable ? 'Resolve match' : 'Match parts from your file')}
        description={matchingHeaderDescription}
        actions={
          allDone ? null : current ? (
            <Flex gap={token.marginXS} align="center" wrap="wrap" justify="flex-end">
              {!resolveFromTable ? (
                <Button type="link" size="large" onClick={handleSkip}>
                  Skip for now
                </Button>
              ) : null}
              {ctaState === 'no-match' ? (
                <Button type="link" size="large" onClick={() => navigate('/bom/search')}>
                  Search unknown parts
                </Button>
              ) : headerSecondaryLabel ? (
                <Button size="large" onClick={handleChoosePart}>
                  {headerSecondaryLabel}
                </Button>
              ) : null}
              <Button
                type="primary"
                size="large"
                disabled={headerConfirmDisabled}
                title={
                  headerConfirmDisabled
                    ? 'Pick the exact product before you can confirm this match.'
                    : undefined
                }
                onClick={handleHeaderPrimary}
              >
                {headerPrimaryLabel}
              </Button>
            </Flex>
          ) : null
        }
      />
      </div>

      {allDone ? (
        <BomGuidedReviewCompletePanel
          projectTitle={projectTitle}
          summary={reviewSummary}
          onContinueToSummary={goToMatchingSummary}
          onReviewSkipped={reopenSkippedInGuided}
        />
      ) : null}

      {!allDone && current ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: token.marginMD,
          }}
        >
          {resolveFromTable ? (
            <Alert
              type="info"
              showIcon
              message="Review and confirm this match"
              description={
                pendingCount > 1
                  ? `Confirm the suggested part or pick a different one. After resolving this, you'll be shown ${pendingCount - 1} other part${pendingCount - 1 === 1 ? '' : 's'} that still need a decision.`
                  : 'Confirm the suggested part or pick a different one. This is the last part that needs a decision — you\'ll be ready to import after.'
              }
            />
          ) : (
            <Card
              style={{ flexShrink: 0 }}
              styles={{ body: { padding: `${token.paddingSM}px ${token.paddingMD}px` } }}
            >
              <Flex align="center" gap={token.marginMD} wrap="wrap">
                <Flex vertical gap={token.marginXXS} style={{ flexShrink: 0 }}>
                  <Typography.Text style={hydraTextStyleToReactCss(hydraSubtitleLarge)}>
                    {reviewedCount}/{totalParts} reviewed
                  </Typography.Text>
                  <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                    {remainingCount} remaining · {stats.skipped} skipped
                  </Typography.Text>
                </Flex>
                <Progress
                  percent={totalParts ? Math.round((reviewedCount / totalParts) * 100) : 0}
                  showInfo={false}
                  strokeColor={token.colorPrimary}
                  style={{ flex: 1, minWidth: 120, margin: 0 }}
                />
                <Button
                  type="primary"
                  disabled={pendingCount === 0 || autoMatchableCount === 0}
                  onClick={handleAutoMatchHigh}
                  title={
                    autoMatchableCount === 0
                      ? 'No pending lines have a strong match to accept.'
                      : 'Accept every strong match in one step and skip the rest for manual review.'
                  }
                >
                  {autoMatchHighButtonLabel(autoMatchableCount)}
                </Button>
              </Flex>
            </Card>
          )}

          {shouldShowGuidedReviewPageAlert(current) ? (
            <BomMatchingReviewQualityAlert matchRow={current} parsedItem={parsedItem} />
          ) : null}

          <Card
            styles={{
              body: {
                padding: token.paddingMD,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                maxHeight: '60vh',
                overflow: 'hidden',
              },
            }}
          >
            <BomMatchingReviewPartPanel
              matchRow={current}
              parsedItem={parsedItem}
              onSelectSku={handleSelectSku}
            />
          </Card>
        </div>
      ) : null}

    </Flex>
    </>
  );
}
