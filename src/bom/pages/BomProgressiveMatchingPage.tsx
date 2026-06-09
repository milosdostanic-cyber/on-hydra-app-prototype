import {
  CheckCircleOutlined,
  PictureOutlined,
  RightOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { applyAcceptAllHighSkipRest, bulkAcceptHighSkipRestMessage } from '../bomMatchingBulkActions';
import {
  isReadyToConfirmMatch,
  matchRequiresSkuSelection,
  resolveFigureNumber,
} from '../bomMatchSkuUtils';
import { matchScoreBand } from '../data/bomImportFlowSeed';
import { useBomCancelUpload } from '../hooks/useBomCancelUpload';
import { useBomFinishImport } from '../hooks/useBomFinishImport';
import { useBomMatchingData } from '../hooks/useBomMatchingData';
import type { BomUploadFlowLocationState } from '../bomUploadFlowState';
import { readUploadFileName } from '../bomUploadFlowState';
import { guidedMatchingStepStatusLabel } from '../bomUploadFlowStatus';
import { getSkuVariantsForFigure } from '../data/ascSkuVariants';
import { BomChoosePartDrawer } from '../components/BomChoosePartDrawer';
import { BomMatchDetailDrawer } from '../components/BomMatchDetailDrawer';
import { BomSkuVariantDrawer } from '../components/BomSkuVariantDrawer';
import { BomSuggestedPartsModal } from '../components/BomSuggestedPartsModal';
import { BomUploadFlowStepChrome } from '../components/BomUploadFlowStepChrome';
import { useBomChoosePartDrawer } from '../hooks/useBomChoosePartDrawer';
import { BomConfidenceTag, BomManualTag } from '../components/BomTags';
import { BomPageHeader } from '../layout/BomPageHeader';
import { bomItemById, bomProjectTitleById } from '../data/mockData';
import type { AscCatalogPart, BomMatchResult } from '../data/types';
import {
  hydraBaseNormal,
  hydraLargeStrong,
  hydraTextStyleToReactCss,
  hydraTitleHeading1,
} from '../../theme/hydraTypography';
import {
  Alert,
  Button,
  Card,
  Divider,
  Flex,
  Modal,
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
  const { confirmCancelUpload } = useBomCancelUpload(bomProjectId);
  const { session, uploadId, matchResults, persist, stats } = useBomMatchingData(bomProjectId);
  const goReviewSkipped = useCallback(() => {
    navigate(tableRoute, { state: { ...uploadState, focusSkipped: true } });
  }, [navigate, tableRoute, uploadState]);
  const { confirmFinishImport } = useBomFinishImport({
    bomProjectId,
    uploadState,
    uploadFileName,
    matchResults,
    stats,
    session,
    uploadId,
    onReviewSkipped: goReviewSkipped,
  });
  const { chooseOpen, chooseMatchRow, openChoose, closeChoose, handleSelectPart } = useBomChoosePartDrawer(
    matchResults,
    persist,
  );

  const queue = useMemo(
    () => matchResults.filter((r) => r.lineStatus === 'pending'),
    [matchResults],
  );

  const [index, setIndex] = useState(0);
  const [detailOpen, setDetailOpen] = useState(false);
  const [candidatesModalOpen, setCandidatesModalOpen] = useState(false);
  const [skuModalOpen, setSkuModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [lastReviewed, setLastReviewed] = useState<BomMatchResult | undefined>();
  const current: BomMatchResult | undefined = queue[index];
  const processed = stats.accepted + stats.skipped + stats.manual;
  const allDone = queue.length === 0;
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

  useEffect(() => {
    if (allDone) setCompleteModalOpen(true);
  }, [allDone]);

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
    if (!isReadyToConfirmMatch(current)) {
      message.warning('Pick a SKU variant before confirming this match.');
      return;
    }
    setLastReviewed(current);
    patchCurrent({ lineStatus: 'accepted', source: current.source === 'manual' ? 'manual' : 'auto' });
    message.success('Match confirmed.');
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

  function handleNextPart() {
    advanceAfterAction();
  }

  function handleAcceptAllHigh() {
    const { next, acceptedCount, skippedCount } = applyAcceptAllHighSkipRest(matchResults);
    if (acceptedCount === 0 && skippedCount === 0) {
      message.info('No pending lines to update.');
      return;
    }
    const lastPending = queue[queue.length - 1];
    if (lastPending) setLastReviewed(lastPending);
    persist(next);
    message.success(bulkAcceptHighSkipRestMessage(acceptedCount, skippedCount));
    setIndex(0);
  }

  if (!allDone && !current) return null;
  if (allDone && !displayMatch) return null;

  const top = displayMatch?.topMatch;
  const conf = top?.matchConfidence ?? 0;
  const scoreBand = top ? matchScoreBand(conf) : null;
  const chooseLabel = 'Choose';
  const needsSku = displayMatch ? matchRequiresSkuSelection(displayMatch) : false;
  const figureRef = displayMatch ? resolveFigureNumber(displayMatch) : undefined;
  const confirmReady = current ? isReadyToConfirmMatch(current) : false;

  const primaryReviewAction = !current
    ? null
    : !top
      ? { label: 'Choose', onClick: handleChoosePart, disabled: false }
      : needsSku && !confirmReady
        ? { label: 'Pick variant', onClick: () => setSkuModalOpen(true), disabled: false }
        : { label: 'Confirm match', onClick: handleConfirm, disabled: !confirmReady };

  return (
    <>
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <BomUploadFlowStepChrome
        backTo={parsingReviewRoute}
        backLabel="Back to parsed data review"
        backState={uploadState}
        fileName={uploadFileName}
        currentStep={2}
        statusLabel={matchingProgressStatus}
        statusTone={allDone ? 'success' : 'warning'}
        stepsComplete={allDone}
      />

      <BomPageHeader
        title={
          allDone
            ? `All ${totalParts} parts reviewed`
            : `Reviewing ${reviewingPosition} of ${totalParts} parts`
        }
        description={
          allDone
            ? `${stats.accepted} confirmed · ${stats.manual} chosen manually · ${stats.skipped} skipped for ${projectTitle}.`
            : `Confirm each ASC match for ${projectTitle}. You can skip lines and return to them from the table view.`
        }
        actions={
          allDone ? (
            !completeModalOpen ? (
              <Flex gap={token.marginXS} align="center" wrap="wrap">
                <Button size="large" icon={<TableOutlined />} onClick={() => navigate(tableRoute, { state: uploadState })}>
                  View all in table
                </Button>
                <Button type="primary" size="large" onClick={confirmFinishImport}>
                  Save and import to BOM
                </Button>
              </Flex>
            ) : null
          ) : (
            <Flex gap={token.marginXS} align="center" wrap="wrap">
              <Button size="large" onClick={() => confirmCancelUpload('match')}>
                Cancel upload
              </Button>
              <Button size="large" icon={<TableOutlined />} onClick={() => navigate(tableRoute, { state: uploadState })}>
                View all in table
              </Button>
              <Button size="large" onClick={handleAcceptAllHigh}>
                Confirm all high matches
              </Button>
              {primaryReviewAction ? (
                <Button
                  type="primary"
                  size="large"
                  onClick={primaryReviewAction.onClick}
                  disabled={primaryReviewAction.disabled}
                >
                  {primaryReviewAction.label}
                </Button>
              ) : null}
            </Flex>
          )
        }
      />

      <Card styles={{ body: { padding: `${token.paddingSM}px ${token.paddingMD}px` } }}>
        <Flex align="center" gap={token.marginMD}>
          <Flex vertical gap={token.marginXXS} style={{ flexShrink: 0 }}>
            <Typography.Text strong style={hydraTextStyleToReactCss(hydraLargeStrong)}>
              {reviewingPosition} of {totalParts}
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

      {top ? (
        <Flex
          gap={token.marginSM}
          wrap="wrap"
          align="center"
          style={{
            paddingInline: token.paddingMD,
            paddingBlock: token.paddingSM,
            background: token.colorFillAlter,
            borderRadius: token.borderRadiusLG,
            border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
          }}
        >
          <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
            Match confidence:
          </Typography.Text>
          {displayMatch?.source === 'manual' ? (
            <BomManualTag />
          ) : scoreBand && scoreBand !== 'processing' ? (
            <BomConfidenceTag
              confidence={scoreBand === 'high' ? 'high' : scoreBand === 'medium' ? 'medium' : 'low'}
              showIcon
            />
          ) : null}
          {displayMatch?.source !== 'manual' && conf > 0 ? (
            <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
              Score {conf}%
            </Typography.Text>
          ) : null}
        </Flex>
      ) : (
        <Alert
          type="info"
          showIcon
          message="No suggested match"
          description="We could not suggest an ASC part for this line. Choose a part manually to continue."
        />
      )}

      {needsSku && !allDone ? (
        <Alert
          type="warning"
          showIcon
          message="Figure-level match — pick a SKU"
          description="We matched the parent figure number. Choose the exact SKU variant before you confirm."
          action={
            <Button size="large" onClick={() => setSkuModalOpen(true)}>
              Pick variant
            </Button>
          }
        />
      ) : null}

      <Card styles={{ body: { padding: token.paddingMD } }}>
        <Flex gap={token.marginMD} align="stretch" wrap="wrap">
          <div
            style={{
              flex: 1,
              minWidth: 240,
              padding: token.paddingMD,
              background: token.colorFillAlter,
              borderRadius: token.borderRadiusLG,
              border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
            }}
          >
            <Typography.Text
              type="secondary"
              style={{
                ...hydraTextStyleToReactCss(hydraBaseNormal),
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                display: 'block',
                marginBottom: token.marginXS,
              }}
            >
              Original imported part
            </Typography.Text>
            <Divider style={{ marginBlock: token.marginXS }} />
            <Space orientation="vertical" size={token.marginXS}>
              <Typography.Text strong>{displayMatch?.originalRequest}</Typography.Text>
              {parsedItem?.parsedDescription ? (
                <Typography.Text type="secondary">{parsedItem.parsedDescription}</Typography.Text>
              ) : null}
              {parsedItem ? (
                <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                  Qty {parsedItem.quantity}
                  {parsedItem.manufacturer ? ` · ${parsedItem.manufacturer}` : ''}
                </Typography.Text>
              ) : null}
            </Space>
          </div>

          <Flex align="center" justify="center" style={{ flexShrink: 0 }}>
            <RightOutlined style={{ color: token.colorPrimary, fontSize: token.fontSizeLG }} />
          </Flex>

          <div
            style={{
              flex: 1,
              minWidth: 240,
              padding: token.paddingMD,
              background: top ? token.colorPrimaryBgSubtle : token.colorFillQuaternary,
              borderRadius: token.borderRadiusLG,
              border: `${token.lineWidth}px ${token.lineType} ${
                top ? token.colorPrimaryBorderSubtle : token.colorBorderSecondary
              }`,
            }}
          >
            <Flex align="center" justify="space-between" gap={token.marginXS}>
              <Typography.Text
                type="secondary"
                style={{
                  ...hydraTextStyleToReactCss(hydraBaseNormal),
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Suggested ASC match
              </Typography.Text>
              {top ? (
                <Button
                  type="link"
                  size="small"
                  style={{ padding: 0, height: 'auto' }}
                  onClick={() => setDetailOpen(true)}
                >
                  View details
                </Button>
              ) : null}
            </Flex>
            <Divider style={{ marginBlock: token.marginXS }} />
            {top ? (
              <Space orientation="vertical" size={token.marginXS} style={{ width: '100%' }}>
                <Flex gap={token.marginSM} align="flex-start">
                  <Flex
                    align="center"
                    justify="center"
                    style={{
                      width: 72,
                      height: 72,
                      flexShrink: 0,
                      background: token.colorBgContainer,
                      borderRadius: token.borderRadius,
                      border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                      overflow: 'hidden',
                    }}
                  >
                    {top.imageUrl ? (
                      <img
                        src={top.imageUrl}
                        alt={top.description}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <PictureOutlined style={{ color: token.colorTextQuaternary, fontSize: token.fontSizeHeading3 }} />
                    )}
                  </Flex>
                  <Flex vertical gap={token.marginXXS} style={{ flex: 1, minWidth: 0 }}>
                    {figureRef ? (
                      <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                        Figure {figureRef}
                        {needsSku && figureRef
                          ? ` · ${getSkuVariantsForFigure(figureRef).length} SKU variants`
                          : ''}
                      </Typography.Text>
                    ) : null}
                    <Typography.Text strong style={hydraTextStyleToReactCss(hydraLargeStrong)}>
                      {needsSku ? `${top.partNumber} (figure)` : top.partNumber}
                    </Typography.Text>
                    <Typography.Text>{top.description}</Typography.Text>
                    {top.productFamily ? (
                      <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                        {top.productFamily}
                        {top.dimensions ? ` · ${top.dimensions}` : ''}
                      </Typography.Text>
                    ) : null}
                  </Flex>
                </Flex>
              </Space>
            ) : (
              <Typography.Text type="secondary">No automatic match for this line.</Typography.Text>
            )}
          </div>
        </Flex>

        {!allDone ? (
          <Flex
            align="center"
            wrap="wrap"
            gap={token.marginXS}
            style={{ marginTop: token.marginMD }}
          >
            <Button size="large" onClick={handleSkip}>
              Skip
            </Button>
            {top ? (
              <Button size="large" onClick={handleChoosePart}>
                {chooseLabel}
              </Button>
            ) : null}
            {displayMatch && displayMatch.suggestedParts.length > 1 ? (
              <Button size="large" onClick={() => setCandidatesModalOpen(true)}>
                Compare {displayMatch.suggestedParts.length} possible matches
              </Button>
            ) : null}
          </Flex>
        ) : null}
      </Card>

      <BomChoosePartDrawer
        open={chooseOpen}
        matchRow={chooseMatchRow}
        onClose={closeChoose}
        onSelectPart={handleSelectPart}
      />

      <BomSuggestedPartsModal
        open={candidatesModalOpen}
        matchRow={current ?? null}
        onClose={() => setCandidatesModalOpen(false)}
        onSelectCandidate={handleSelectCandidate}
      />

      <BomSkuVariantDrawer
        open={skuModalOpen}
        matchRow={current ?? null}
        onClose={() => setSkuModalOpen(false)}
        onApply={(next) => {
          patchCurrent(next);
          message.success('SKU variant selected.');
        }}
      />

      <BomMatchDetailDrawer
        open={detailOpen}
        matchRow={displayMatch ?? null}
        parsedItem={parsedItem}
        onClose={() => setDetailOpen(false)}
        onConfirm={handleConfirm}
        onChoose={handleChoosePart}
        onSkip={!allDone ? handleSkip : undefined}
        onNext={!allDone ? handleNextPart : undefined}
        onPickVariant={!allDone ? () => setSkuModalOpen(true) : undefined}
        chooseLabel={chooseLabel}
      />
    </Space>

      {allDone ? (
        <Modal
          title={null}
          open={completeModalOpen}
          onCancel={() => setCompleteModalOpen(false)}
          footer={
            <Flex justify="flex-end" gap={token.marginXS} wrap="wrap">
              <Button
                size="large"
                icon={<TableOutlined />}
                onClick={() => navigate(tableRoute, { state: uploadState })}
              >
                View all in table
              </Button>
              <Button type="primary" size="large" onClick={confirmFinishImport}>
                Save and import to BOM
              </Button>
            </Flex>
          }
          centered
          width={520}
          destroyOnClose={false}
        >
          <Flex vertical align="center" gap={token.marginMD} style={{ paddingBlock: token.paddingSM }}>
            <CheckCircleOutlined
              style={{ fontSize: hydraTitleHeading1.fontSize, color: token.colorSuccess }}
            />
            <Typography.Title level={3} style={{ margin: 0, textAlign: 'center' }}>
              Match review complete
            </Typography.Title>
            <Typography.Text type="secondary" style={{ textAlign: 'center' }}>
              {stats.accepted} confirmed · {stats.manual} chosen manually · {stats.skipped} skipped
            </Typography.Text>
            {stats.skipped > 0 ? (
              <Alert
                type="warning"
                showIcon
                style={{ width: '100%' }}
                message={`${stats.skipped} part${stats.skipped === 1 ? '' : 's'} skipped`}
                description="Skipped lines will not be imported. Resolve them in the table view, or import the confirmed matches now."
                action={
                  <Button size="small" onClick={goReviewSkipped}>
                    Review skipped
                  </Button>
                }
              />
            ) : null}
          </Flex>
        </Modal>
      ) : null}
    </>
  );
}
