import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import {
  reviewCanConfirm,
  reviewHeaderPrimaryCtaLabel,
  reviewPrimaryCtaLabel,
  reviewSecondaryCtaLabel,
  resolveReviewItemCtaState,
} from '../bomMatchingReviewCtas';
import {
  applyVariantToMatch,
  matchRequiresSkuSelection,
  resolveFigureNumber,
} from '../bomMatchSkuUtils';
import { useBomMatchingData } from '../hooks/useBomMatchingData';
import type { BomUploadFlowLocationState } from '../bomUploadFlowState';
import { readUploadFileName } from '../bomUploadFlowState';
import { computeMatchingReviewSummary } from '../bomMatchingReviewStatus';
import { guidedMatchingStepStatusLabel } from '../bomUploadFlowStatus';
import { getSkuVariantsForFigure } from '../data/ascSkuVariants';
import { BomChoosePartModal } from '../components/BomChoosePartModal';
import { BomGuidedReviewCompletePanel } from '../components/BomGuidedReviewCompletePanel';
import { BomMatchingReviewPartPanel } from '../components/BomMatchingReviewPartPanel';
import { BomMatchingReviewQualityAlert } from '../components/BomMatchingReviewQualityAlert';
import { BomUploadFlowStepChrome } from '../components/BomUploadFlowStepChrome';
import { useBomChoosePartDrawer } from '../hooks/useBomChoosePartDrawer';
import { BomPageHeader } from '../layout/BomPageHeader';
import { bomItemById, bomProjectTitleById } from '../data/mockData';
import type { AscCatalogPart, BomMatchResult } from '../data/types';
import {
  hydraBaseNormal,
  hydraLargeStrong,
  hydraTextStyleToReactCss,
} from '../../theme/hydraTypography';
import {
  Button,
  Card,
  Flex,
  Progress,
  Typography,
  message,
  theme,
} from '../../ui/antd';

function firstPendingLineIndex(results: BomMatchResult[]): number {
  const idx = results.findIndex((row) => row.lineStatus === 'pending');
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

export function BomProgressiveMatchingPage() {
  const { token } = theme.useToken();
  const { bomProjectId = '' } = useParams<{ bomProjectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const uploadState = (location.state ?? {}) as BomUploadFlowLocationState;
  const uploadFileName = readUploadFileName(uploadState);
  const projectTitle = bomProjectTitleById(bomProjectId) ?? 'BOM project';
  const tableRoute = `/bom/projects/${bomProjectId}/matching/table`;
  const { session, uploadId, matchResults, persist, stats } = useBomMatchingData(bomProjectId);
  const { chooseOpen, chooseMatchRow, openChoose, closeChoose, handleSelectPart } = useBomChoosePartDrawer(
    matchResults,
    persist,
  );

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
  const processed = Math.min(index, totalParts);

  const parsingReviewRoute = `/bom/projects/${bomProjectId}/parsing-review`;

  useEffect(() => {
    setIndex(resolveGuidedReviewIndex(matchResults, uploadState.focusItemId));
  }, [uploadId, location.key, uploadState.focusItemId, matchResults.length]);

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
    setIndex((i) => i + 1);
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
    openChoose(current.itemId);
  }

  function handleSelectCandidate(part: AscCatalogPart) {
    if (!current) return;
    const figure = part.figureNumber ?? part.partNumber;
    const variantCount = getSkuVariantsForFigure(figure).length;
    patchCurrent({
      topMatch: part,
      figureNumber: figure,
      matchLevel: variantCount > 0 ? 'figure' : 'sku',
      selectedVariantId: undefined,
      source: 'auto',
    });
    message.info('Match candidate updated.');
  }

  function handleSelectVariant(variantId: string) {
    if (!current) return;
    const variants = getSkuVariantsForFigure(resolveFigureNumber(current));
    const variant = variants.find((entry) => entry.id === variantId);
    if (!variant) return;
    patchCurrent(applyVariantToMatch(current, variant));
    message.success('SKU variant selected.');
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
        : `All ${reviewSummary.total} parts reviewed for ${projectTitle}.`;
    }
    if (!current) return '';
    if (!current.topMatch) {
      return 'No automatic match for this line. Choose an ASC part or skip — you can finish from the summary table.';
    }
    if (matchRequiresSkuSelection(current)) {
      return `Pick the exact SKU for this product family, then confirm for ${projectTitle}.`;
    }
    return `Confirm each suggested part for ${projectTitle}. Skip lines you are not ready to decide on — you can finish them from the summary table.`;
  }, [allDone, current, hasSkippedItems, projectTitle, readyCount, reviewSummary]);

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
      style={{
        width: '100%',
        ...(allDone
          ? undefined
          : {
              minHeight: `calc(100vh - ${token.sizeXXL * 4}px)`,
              maxHeight: `calc(100vh - ${token.sizeXXL * 4}px)`,
              overflow: 'hidden',
            }),
      }}
    >
      <div style={{ flexShrink: 0 }}>
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
      </div>

      <div style={{ flexShrink: 0 }}>
      <BomPageHeader
        title={allDone ? 'Guided review complete' : 'Match parts from your file'}
        description={matchingHeaderDescription}
        actions={
          allDone ? null : current ? (
            <Flex gap={token.marginXS} align="center" wrap="wrap" justify="flex-end">
              <Button type="link" size="large" onClick={handleSkip}>
                Skip for now
              </Button>
              {headerSecondaryLabel ? (
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
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: token.marginMD,
          }}
        >
          <Card
            style={{ flexShrink: 0 }}
            styles={{ body: { padding: `${token.paddingSM}px ${token.paddingMD}px` } }}
          >
            <Flex align="center" gap={token.marginMD}>
              <Flex vertical gap={token.marginXXS} style={{ flexShrink: 0 }}>
                <Typography.Text strong style={hydraTextStyleToReactCss(hydraLargeStrong)}>
                  {reviewingPosition}/{totalParts} reviewed
                </Typography.Text>
                <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                  {stats.pending} remaining · {stats.skipped} skipped
                </Typography.Text>
              </Flex>
              <Progress
                percent={totalParts ? Math.round((processed / totalParts) * 100) : 0}
                showInfo={false}
                strokeColor={token.colorPrimary}
                style={{ flex: 1, margin: 0 }}
              />
            </Flex>
          </Card>

          <BomMatchingReviewQualityAlert matchRow={current} />

          <Card
            style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
            styles={{
              body: {
                padding: token.paddingMD,
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
              },
            }}
          >
            <BomMatchingReviewPartPanel
              matchRow={current}
              parsedItem={parsedItem}
              onSelectCandidate={handleSelectCandidate}
              onSelectVariant={handleSelectVariant}
              onChoosePart={handleChoosePart}
            />
          </Card>
        </div>
      ) : null}

      <BomChoosePartModal
        open={chooseOpen}
        matchRow={chooseMatchRow}
        onClose={closeChoose}
        onSelectPart={handleSelectPart}
      />

    </Flex>
    </>
  );
}
