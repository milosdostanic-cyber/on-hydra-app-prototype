import { TableOutlined } from '@ant-design/icons';
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
  Space,
  Typography,
  message,
  theme,
} from '../../ui/antd';

export function BomProgressiveMatchingPage() {
  const { token } = theme.useToken();
  const { bomProjectId = '' } = useParams<{ bomProjectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const uploadState = (location.state ?? {}) as BomUploadFlowLocationState;
  const uploadFileName = readUploadFileName(uploadState);
  const projectTitle = bomProjectTitleById(bomProjectId) ?? 'BOM project';
  const tableRoute = `/bom/projects/${bomProjectId}/matching/table`;
  const { session, matchResults, persist, stats } = useBomMatchingData(bomProjectId);
  const { chooseOpen, chooseMatchRow, openChoose, closeChoose, handleSelectPart } = useBomChoosePartDrawer(
    matchResults,
    persist,
  );

  const queue = useMemo(
    () => matchResults.filter((r) => r.lineStatus === 'pending'),
    [matchResults],
  );

  const [index, setIndex] = useState(0);
  const [lastReviewed, setLastReviewed] = useState<BomMatchResult | undefined>();
  const current: BomMatchResult | undefined = queue[index];
  const processed = stats.total - stats.pending;
  const allDone = queue.length === 0;
  const reviewSummary = useMemo(() => computeMatchingReviewSummary(matchResults), [matchResults]);
  const displayMatch = current ?? (allDone ? lastReviewed : undefined);
  const parsedItem = displayMatch
    ? bomItemById(displayMatch.itemId) ?? session?.parsedItems.find((i) => i.id === displayMatch.itemId)
    : undefined;
  const totalParts = matchResults.length;
  const reviewingPosition = allDone ? totalParts : processed + 1;
  const matchingProgressStatus = guidedMatchingStepStatusLabel(reviewingPosition, totalParts, allDone);

  const parsingReviewRoute = `/bom/projects/${bomProjectId}/parsing-review`;

  useEffect(() => {
    if (index >= queue.length && queue.length > 0) setIndex(0);
  }, [queue.length, index]);

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
    if (index < queue.length - 1) setIndex((i) => i + 1);
    else setIndex(0);
  }

  function handleConfirm() {
    if (!current) return;
    if (!current.topMatch) {
      setLastReviewed(current);
      patchCurrent({ lineStatus: 'skipped' });
      message.info('No match to confirm — you can choose a part later from the summary table.');
      advanceAfterAction();
      return;
    }
    if (!reviewCanConfirm(current)) {
      message.info('Pick the exact product before you confirm this match.');
      return;
    }
    setLastReviewed(current);
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
    setLastReviewed(current);
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

  function goReviewIncomplete() {
    navigate(tableRoute, {
      state: { ...uploadState, guidedReviewComplete: true, focusSkipped: reviewSummary.skipped > 0 },
    });
  }

  if (!allDone && !current) return null;
  if (allDone && !displayMatch) return null;

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
  const hasIncompleteItems = reviewSummary.skipped > 0;

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
        minHeight: `calc(100vh - ${token.sizeXXL * 4}px)`,
        maxHeight: `calc(100vh - ${token.sizeXXL * 4}px)`,
        overflow: 'hidden',
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
        title={allDone ? 'Part matching complete' : 'Match parts from your file'}
        description={
          allDone
            ? `${reviewSummary.confirmed} confirmed · ${reviewSummary.chosen} chosen · ${reviewSummary.skipped} skipped for ${projectTitle}.`
            : `Confirm each suggested part for ${projectTitle}. Skip lines you are not ready to decide on — you can finish them from the summary table.`
        }
        actions={
          allDone ? (
            <Flex gap={token.marginXS} align="center" wrap="wrap">
              {hasIncompleteItems ? (
                <>
                  <Button type="primary" size="large" onClick={goReviewIncomplete}>
                    Review incomplete items
                  </Button>
                  <Button size="large" icon={<TableOutlined />} onClick={goToMatchingSummary}>
                    Continue to summary
                  </Button>
                </>
              ) : (
                <Button type="primary" size="large" icon={<TableOutlined />} onClick={goToMatchingSummary}>
                  Continue to summary
                </Button>
              )}
            </Flex>
          ) : current ? (
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
        <Card styles={{ body: { padding: token.paddingMD } }} style={{ flexShrink: 0 }}>
          <Space orientation="vertical" size={token.marginMD} style={{ width: '100%' }}>
            <Typography.Text strong style={hydraTextStyleToReactCss(hydraLargeStrong)}>
              Review summary
            </Typography.Text>
            <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
              {hasIncompleteItems
                ? 'Some parts were skipped. Review them in the summary table, or continue to scan every line before you import.'
                : 'Every part has been reviewed. Continue to the matching results summary, then save and import when you are ready.'}
            </Typography.Text>
            <Flex gap={token.marginSM} wrap="wrap">
              {[
                { label: 'Total parts', value: reviewSummary.total },
                { label: 'Confirmed', value: reviewSummary.confirmed },
                { label: 'Chosen', value: reviewSummary.chosen },
                { label: 'Skipped', value: reviewSummary.skipped },
                { label: 'Unresolved', value: reviewSummary.unresolved },
                { label: 'Needs exact product', value: reviewSummary.needsSku },
              ].map((stat) => (
                <Flex
                  key={stat.label}
                  vertical
                  gap={token.marginXXS}
                  style={{
                    minWidth: 120,
                    padding: token.paddingSM,
                    background: token.colorFillAlter,
                    borderRadius: token.borderRadiusLG,
                    border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                  }}
                >
                  <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                    {stat.label}
                  </Typography.Text>
                  <Typography.Text strong style={hydraTextStyleToReactCss(hydraLargeStrong)}>
                    {stat.value}
                  </Typography.Text>
                </Flex>
              ))}
            </Flex>
          </Space>
        </Card>
      ) : (
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
      )}

      {!allDone && current ? (
        <div style={{ flexShrink: 0 }}>
          <BomMatchingReviewQualityAlert matchRow={current} />
        </div>
      ) : null}

      {!allDone && current ? (
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
          />
        </Card>
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
