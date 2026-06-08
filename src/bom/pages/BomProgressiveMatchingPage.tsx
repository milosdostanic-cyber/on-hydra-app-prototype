import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  RightOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { applyAcceptAllHighSkipRest, bulkAcceptHighSkipRestMessage } from '../bomMatchingBulkActions';
import {
  applyVariantToMatch,
  isReadyToConfirmMatch,
  matchRequiresSkuSelection,
  resolveFigureNumber,
} from '../bomMatchSkuUtils';
import { buildWorkspaceRowFromMatch } from '../bomMatchingWorkspaceImport';
import { matchScoreBand } from '../data/bomImportFlowSeed';
import { useBomCancelUpload } from '../hooks/useBomCancelUpload';
import { useBomMatchingData } from '../hooks/useBomMatchingData';
import { useBomImportFlow } from '../context/BomImportFlowContext';
import { useBomWorkspace } from '../../context/BomWorkspaceContext';
import type { BomUploadFlowLocationState } from '../bomUploadFlowState';
import { readUploadFileName } from '../bomUploadFlowState';
import { BomChoosePartDrawer } from '../components/BomChoosePartDrawer';
import { BomMatchDetailDrawer } from '../components/BomMatchDetailDrawer';
import { BomSkuVariantPicker } from '../components/BomSkuVariantPicker';
import { BomUploadFlowStepChrome } from '../components/BomUploadFlowStepChrome';
import { useBomChoosePartDrawer } from '../hooks/useBomChoosePartDrawer';
import { BomConfidenceTag, BomManualTag } from '../components/BomTags';
import { BomPageHeader } from '../layout/BomPageHeader';
import { bomItemById, bomProjectTitleById } from '../data/mockData';
import type { BomMatchResult } from '../data/types';
import {
  hydraBaseNormal,
  hydraLargeStrong,
  hydraSmallNormal,
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
  const { updateProgress } = useBomImportFlow();
  const { confirmCancelUpload } = useBomCancelUpload(bomProjectId);
  const { rowsByProjectId, setWorkspaceRows } = useBomWorkspace();
  const { session, uploadId, matchResults, persist, stats } = useBomMatchingData(bomProjectId);
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
  const matchingProgressStatus = allDone
    ? `All ${totalParts} reviewed`
    : `Reviewing ${reviewingPosition} of ${totalParts}`;

  const parsingReviewRoute = `/bom/projects/${bomProjectId}/parsing-review`;
  const tableRoute = `/bom/projects/${bomProjectId}/matching/table`;

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
      message.warning('Select a SKU variant before confirming this match.');
      return;
    }
    setLastReviewed(current);
    patchCurrent({ lineStatus: 'accepted', source: current.source === 'manual' ? 'manual' : 'auto' });
    message.success('Match confirmed.');
    advanceAfterAction();
  }

  function handleSelectVariant(variant: Parameters<typeof applyVariantToMatch>[1]) {
    if (!current) return;
    patchCurrent(applyVariantToMatch(current, variant));
    message.success('SKU variant selected.');
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

  function handleAcceptAllHigh() {
    const { next, acceptedCount, skippedCount } = applyAcceptAllHighSkipRest(matchResults);
    if (acceptedCount === 0 && skippedCount === 0) {
      message.info('No pending lines to update.');
      return;
    }
    persist(next);
    message.success(bulkAcceptHighSkipRestMessage(acceptedCount, skippedCount));
    setIndex(0);
  }

  function goReviewSkipped() {
    navigate(tableRoute, { state: { ...uploadState, focusSkipped: true } });
  }

  function handleSaveAndImport() {
    if (stats.skipped > 0) {
      Modal.confirm({
        title: `Import without ${stats.skipped} skipped line${stats.skipped === 1 ? '' : 's'}?`,
        icon: <ExclamationCircleOutlined style={{ color: token.colorWarning }} />,
        content: `Skipped lines will not be added to your BOM. You can review and resolve them in the table view first, or import the ${stats.accepted + stats.manual} confirmed match${stats.accepted + stats.manual === 1 ? '' : 'es'} now.`,
        okText: 'Import confirmed matches',
        cancelText: 'Review skipped first',
        onOk: runImport,
        onCancel: goReviewSkipped,
      });
      return;
    }
    runImport();
  }

  function runImport() {
    const accepted = matchResults.filter((r) => r.lineStatus === 'accepted' || r.source === 'manual');
    const parsedItems = session?.parsedItems ?? [];
    const existingRows = rowsByProjectId[bomProjectId] ?? [];
    const startIndex = existingRows.length;
    const newRows = accepted.map((result, i) => {
      const item = parsedItems.find((p) => p.id === result.itemId);
      return buildWorkspaceRowFromMatch(result, item, startIndex + i + 1);
    });
    if (newRows.length > 0) {
      setWorkspaceRows(bomProjectId, (prev) => [...prev, ...newRows]);
    }
    if (uploadId) updateProgress(uploadId, { currentStep: 'done' });
    message.success(
      `Imported ${stats.total} items — ${stats.accepted} confirmed · ${stats.manual} chosen manually · ${stats.skipped} skipped.`,
    );
    navigate(`/bom/projects/${bomProjectId}/workspace`, {
      state: {
        ...uploadState,
        importSummary: {
          fileName: session?.progress.fileName,
          total: stats.total,
          accepted: stats.accepted,
          manual: stats.manual,
          skipped: stats.skipped,
        },
      },
    });
  }

  if (!allDone && !current) return null;
  if (allDone && !displayMatch) return null;

  const top = displayMatch?.topMatch;
  const conf = top?.matchConfidence ?? 0;
  const scoreBand = top ? matchScoreBand(conf) : null;
  const chooseLabel = top ? 'Choose different part' : 'Choose';
  const needsSku = displayMatch ? matchRequiresSkuSelection(displayMatch) : false;
  const figureRef = displayMatch ? resolveFigureNumber(displayMatch) : undefined;
  const confirmReady = current ? isReadyToConfirmMatch(current) : false;

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
          allDone ? null : (
            <Flex gap={token.marginXS} align="center" wrap="wrap">
              <Button size="large" icon={<TableOutlined />} onClick={() => navigate(tableRoute, { state: uploadState })}>
                View all in table
              </Button>
              <Button size="large" onClick={() => confirmCancelUpload('match')}>
                Cancel upload
              </Button>
              <Button type="primary" ghost onClick={handleAcceptAllHigh}>
                Confirm all high matches
              </Button>
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
            <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraSmallNormal)}>
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
          {current.source === 'manual' ? (
            <BomManualTag />
          ) : scoreBand && scoreBand !== 'processing' ? (
            <BomConfidenceTag
              confidence={scoreBand === 'high' ? 'high' : scoreBand === 'medium' ? 'medium' : 'low'}
              showIcon
            />
          ) : null}
          {current.source !== 'manual' && conf > 0 ? (
            <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraSmallNormal)}>
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

      {needsSku ? (
        <Alert
          type="warning"
          showIcon
          message="Figure-level match — select a SKU"
          description="This line matched a parent figure number. Choose the specific SKU variant before you confirm."
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
                ...hydraTextStyleToReactCss(hydraSmallNormal),
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
              <Typography.Text strong>{current.originalRequest}</Typography.Text>
              {parsedItem?.parsedDescription ? (
                <Typography.Text type="secondary">{parsedItem.parsedDescription}</Typography.Text>
              ) : null}
              {parsedItem ? (
                <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraSmallNormal)}>
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
              background: top ? token.colorPrimaryBg : token.colorFillQuaternary,
              borderRadius: token.borderRadiusLG,
              border: `${token.lineWidth}px ${token.lineType} ${top ? token.colorPrimaryBorder : token.colorBorderSecondary}`,
            }}
          >
            <Flex align="center" justify="space-between" gap={token.marginXS}>
              <Typography.Text
                type="secondary"
                style={{
                  ...hydraTextStyleToReactCss(hydraSmallNormal),
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
              <Space orientation="vertical" size={token.marginXS}>
                {figureRef ? (
                  <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraSmallNormal)}>
                    Figure {figureRef}
                  </Typography.Text>
                ) : null}
                <Typography.Text strong style={hydraTextStyleToReactCss(hydraLargeStrong)}>
                  {needsSku ? `${top.partNumber} (figure)` : top.partNumber}
                </Typography.Text>
                <Typography.Text>{top.description}</Typography.Text>
                {top.productFamily ? (
                  <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraSmallNormal)}>
                    {top.productFamily}
                    {top.dimensions ? ` · ${top.dimensions}` : ''}
                  </Typography.Text>
                ) : null}
              </Space>
            ) : (
              <Typography.Text type="secondary">No automatic match for this line.</Typography.Text>
            )}
          </div>
        </Flex>

        {needsSku && figureRef ? (
          <div style={{ marginTop: token.marginMD }}>
            <BomSkuVariantPicker
              figureNumber={figureRef}
              figureDescription={top?.description}
              selectedVariantId={current.selectedVariantId}
              onSelectVariant={handleSelectVariant}
            />
          </div>
        ) : null}

        <Flex justify="flex-end" gap={token.marginSM} wrap="wrap" style={{ marginTop: token.marginMD }}>
          <Button size="large" onClick={handleSkip}>
            Skip
          </Button>
          <Button size="large" onClick={handleChoosePart}>
            {chooseLabel}
          </Button>
          <Button type="primary" size="large" onClick={handleConfirm} disabled={!confirmReady}>
            Confirm
          </Button>
        </Flex>
      </Card>

      <BomChoosePartDrawer
        open={chooseOpen}
        matchRow={chooseMatchRow}
        onClose={closeChoose}
        onSelectPart={handleSelectPart}
      />

      <BomMatchDetailDrawer
        open={detailOpen}
        matchRow={current ?? null}
        parsedItem={parsedItem}
        onClose={() => setDetailOpen(false)}
        onConfirm={handleConfirm}
        onChoose={handleChoosePart}
      />
        </>
      )}
    </Space>

      {allDone ? (
        <Modal
          title={null}
          open={completeModalOpen}
          onCancel={() => setCompleteModalOpen(false)}
          footer={
            <Flex justify="center" gap={token.marginSM} wrap="wrap">
              <Button
                size="large"
                icon={<TableOutlined />}
                onClick={() => navigate(tableRoute, { state: uploadState })}
              >
                View all in table
              </Button>
              <Button type="primary" size="large" onClick={handleSaveAndImport}>
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
