import { UnorderedListOutlined } from '@ant-design/icons';
import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { useBomHubPath } from '../../context/ActiveProjectContext';
import { shellLayout } from '../../theme/hydraAlias';
import { bluePrimaryPrimitiveLight } from '../../theme/primaryPrimitiveBlue';
import {
  hydraBaseNormal,
  hydraTextStyleToReactCss,
  hydraTitleHeading3,
} from '../../theme/hydraTypography';
import { BomConfidenceTag } from '../components/BomTags';
import type { BomItemConfidence } from '../data/types';
import type { BomUploadFlowLocationState } from '../bomUploadFlowState';
import { readUploadFileName } from '../bomUploadFlowState';
import { matchingStepStatusLabel } from '../bomUploadFlowStatus';
import { HIGH_MATCH_AUTO_ACCEPT_THRESHOLD } from '../bomMatchingBulkActions';
import { isReadyToConfirmMatch } from '../bomMatchSkuUtils';
import {
  computeMatchingReviewSummary,
  deriveReviewDisplayStatus,
  type BomReviewDisplayStatus,
} from '../bomMatchingReviewStatus';
import { buildMatchingResultsColumns } from '../bomMatchingColumns';
import { BomChoosePartModal } from '../components/BomChoosePartModal';
import { BomMatchDetailDrawer } from '../components/BomMatchDetailDrawer';
import { BomSkuVariantModal } from '../components/BomSkuVariantModal';
import { BomUploadFlowStepChrome } from '../components/BomUploadFlowStepChrome';
import { useBomChoosePartDrawer } from '../hooks/useBomChoosePartDrawer';
import { BomPageHeader } from '../layout/BomPageHeader';
import { normalizeParsedItemsForUpload } from '../data/bomImportFlowSeed';
import { bomItemById, bomProjectById, bomProjectTitleById } from '../data/mockData';
import { useBomFinishImport } from '../hooks/useBomFinishImport';
import { useBomMatchingData } from '../hooks/useBomMatchingData';
import type { BomMatchResult } from '../data/types';
import {
  Alert,
  Button,
  Card,
  Flex,
  Pagination,
  Select,
  Space,
  Table,
  Typography,
  message,
  theme,
} from '../../ui/antd';

type ConfidenceFilter = 'all' | 'high' | 'medium' | 'low';
type ReviewStatusFilter = 'all' | BomReviewDisplayStatus;

function rowConfidence(row: BomMatchResult): 'high' | 'medium' | 'low' | 'none' {
  const p = row.topMatch?.matchConfidence ?? 0;
  if (!row.topMatch) return 'none';
  if (p >= HIGH_MATCH_AUTO_ACCEPT_THRESHOLD) return 'high';
  if (p >= 70) return 'medium';
  return 'low';
}

/** KPI reflects accepted lines only — skipped medium/low are not treated as accepted matches. */
function aggregateMatchConfidence(results: BomMatchResult[]): BomItemConfidence {
  const accepted = results.filter((r) => r.lineStatus === 'accepted');
  const source = accepted.length > 0 ? accepted : results.filter((r) => r.lineStatus === 'pending');
  if (source.length === 0) return 'low';

  const bands = source.map(rowConfidence);
  if (bands.every((b) => b === 'high' || b === 'none')) return 'high';
  if (bands.some((b) => b === 'low' || b === 'none')) return 'low';
  return 'medium';
}

/** Figma `5026:21422` — review summary strip above matching table. */
function BomMatchingStatsStrip({
  summary,
  matchConfidence,
}: {
  summary: ReturnType<typeof computeMatchingReviewSummary>;
  matchConfidence: BomItemConfidence;
}) {
  const { token } = theme.useToken();

  const cardShellStyle = (accentColor: string, flex?: string | number) => ({
    flex: flex ?? 1,
    minWidth: 212,
    height: 56,
    paddingLeft: token.paddingMD,
    paddingRight: token.paddingMD,
    paddingTop: token.paddingSM,
    paddingBottom: token.paddingSM,
    borderRadius: token.borderRadiusLG,
    border: 'none',
    borderLeft: `${token.sizeUnit}px solid ${accentColor}`,
    background: token.colorBgContainer,
    boxShadow: token.boxShadowTertiary,
    boxSizing: 'border-box' as const,
  });

  const statInner = (label: string, value: number) => (
    <Flex align="center" justify="space-between" style={{ width: '100%', height: 32 }}>
      <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
        {label}
      </Typography.Text>
      <Typography.Text style={hydraTextStyleToReactCss(hydraTitleHeading3)}>{value}</Typography.Text>
    </Flex>
  );

  return (
    <Flex gap={token.margin} align="stretch" wrap="wrap" style={{ width: '100%' }}>
      <Flex align="center" style={cardShellStyle(bluePrimaryPrimitiveLight[6])}>
        {statInner('Total parts', summary.total)}
      </Flex>
      <Flex align="center" style={cardShellStyle(token.colorSuccessBorder)}>
        {statInner('Confirmed', summary.confirmed)}
      </Flex>
      <Flex align="center" style={cardShellStyle(token.colorSuccessBorder)}>
        {statInner('Chosen', summary.chosen)}
      </Flex>
      <Flex align="center" style={cardShellStyle(token.colorWarning)}>
        {statInner('Skipped', summary.skipped)}
      </Flex>
      <Flex align="center" style={cardShellStyle(token.colorError)}>
        {statInner('Unresolved', summary.unresolved)}
      </Flex>
      <Flex align="center" style={cardShellStyle(token.colorWarning)}>
        {statInner('Needs SKU', summary.needsSku)}
      </Flex>
      <Flex align="center" style={{ ...cardShellStyle(bluePrimaryPrimitiveLight[2], 'none'), minWidth: 368 }}>
        <Flex align="center" justify="space-between" style={{ width: '100%', maxWidth: 326, height: 30 }}>
          <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
            Match Confidence
          </Typography.Text>
          <BomConfidenceTag confidence={matchConfidence} showIcon />
        </Flex>
      </Flex>
    </Flex>
  );
}

export function BomMatchingPage() {
  const { token } = theme.useToken();
  const { bomProjectId = '' } = useParams<{ bomProjectId: string }>();
  const navigate = useNavigate();
  const bomHubPath = useBomHubPath();
  const location = useLocation();
  const uploadState = (location.state ?? {}) as BomUploadFlowLocationState;
  const uploadFileName = readUploadFileName(uploadState);
  const projectMeta = bomProjectById(bomProjectId);
  const projectTitle = bomProjectTitleById(bomProjectId) ?? 'New BOM project';
  const [page, setPage] = useState(1);
  const [confidenceFilter, setConfidenceFilter] = useState<ConfidenceFilter>('all');
  const [reviewStatusFilter, setReviewStatusFilter] = useState<ReviewStatusFilter>('all');
  const [skippedOnly, setSkippedOnly] = useState(Boolean(uploadState.focusSkipped));
  const showReviewCompleteBanner = Boolean(uploadState.guidedReviewComplete);
  const [skuRowId, setSkuRowId] = useState<string | null>(null);
  const [detailItemId, setDetailItemId] = useState<string | null>(null);

  const { session, uploadId, matchResults, persist, stats } = useBomMatchingData(bomProjectId);
  const { chooseOpen, chooseMatchRow, openChoose, closeChoose, handleSelectPart } = useBomChoosePartDrawer(
    matchResults,
    persist,
  );

  const rowNumbers = useMemo(() => {
    const parsed = normalizeParsedItemsForUpload(
      session?.parsedItems,
      session?.progress.fileName ?? uploadFileName,
    );
    return new Map(parsed.map((r) => [r.id, r.rowNumber]));
  }, [session?.parsedItems]);

  const skippedCount = useMemo(
    () => matchResults.filter((r) => r.lineStatus === 'skipped').length,
    [matchResults],
  );

  const reviewSummary = useMemo(() => computeMatchingReviewSummary(matchResults), [matchResults]);

  const filteredResults = useMemo(() => {
    return matchResults.filter((row) => {
      if (skippedOnly && row.lineStatus !== 'skipped') return false;
      if (reviewStatusFilter !== 'all' && deriveReviewDisplayStatus(row) !== reviewStatusFilter) {
        return false;
      }
      const c = rowConfidence(row);
      if (confidenceFilter === 'all') return true;
      if (confidenceFilter === 'high') return c === 'high';
      if (confidenceFilter === 'medium') return c === 'medium';
      if (confidenceFilter === 'low') return c === 'low' || c === 'none';
      return true;
    });
  }, [confidenceFilter, matchResults, reviewStatusFilter, skippedOnly]);

  const pagedMatchResults = useMemo(() => {
    const start = (page - 1) * shellLayout.tablePageSizeDefault;
    return filteredResults.slice(start, start + shellLayout.tablePageSizeDefault);
  }, [filteredResults, page]);

  const matchConfidence = aggregateMatchConfidence(matchResults);
  const allLinesReviewed = stats.pending === 0;
  const matchingProgressStatus = matchingStepStatusLabel(stats);
  const parsingReviewRoute = `/bom/projects/${bomProjectId}/parsing-review`;
  const reviewRoute = `/bom/projects/${bomProjectId}/matching/review`;
  const { confirmFinishImport } = useBomFinishImport({
    bomProjectId,
    uploadState,
    uploadFileName,
    matchResults,
    stats,
    session,
    uploadId,
    onReviewSkipped: () => {
      setSkippedOnly(true);
      setPage(1);
    },
  });

  const handleConfirm = useCallback(
    (row: BomMatchResult) => {
      if (!isReadyToConfirmMatch(row)) {
        message.warning('Pick a SKU variant before confirming this match.');
        return;
      }
      persist(matchResults.map((r) => (r.itemId === row.itemId ? { ...r, lineStatus: 'accepted' } : r)));
      message.success('Match confirmed.');
    },
    [matchResults, persist],
  );

  const handleChoose = useCallback(
    (row: BomMatchResult) => {
      openChoose(row.itemId);
    },
    [openChoose],
  );

  const handleSelectSku = useCallback((row: BomMatchResult) => {
    setSkuRowId(row.itemId);
  }, []);

  const handleReviewRow = useCallback(
    (row: BomMatchResult) => {
      persist(
        matchResults.map((r) =>
          r.itemId === row.itemId ? { ...r, lineStatus: 'pending' as const } : r,
        ),
      );
      navigate(reviewRoute, { state: uploadState });
      message.info('Returned to guided review for this part.');
    },
    [matchResults, navigate, persist, reviewRoute, uploadState],
  );

  const skuMatchRow = useMemo(
    () => (skuRowId ? matchResults.find((r) => r.itemId === skuRowId) ?? null : null),
    [matchResults, skuRowId],
  );

  const detailMatchRow = useMemo(
    () => (detailItemId ? matchResults.find((r) => r.itemId === detailItemId) ?? null : null),
    [matchResults, detailItemId],
  );

  const detailParsedItem = detailMatchRow
    ? bomItemById(detailMatchRow.itemId) ?? session?.parsedItems.find((i) => i.id === detailMatchRow.itemId)
    : undefined;

  const handleApplySkuVariant = useCallback(
    (next: BomMatchResult) => {
      persist(matchResults.map((r) => (r.itemId === next.itemId ? next : r)));
      message.success('SKU variant selected.');
    },
    [matchResults, persist],
  );

  const columns = useMemo(
    () =>
      buildMatchingResultsColumns((itemId) => rowNumbers.get(itemId), {
        onConfirm: handleConfirm,
        onChoose: handleChoose,
        onSelectSku: handleSelectSku,
        onReview: handleReviewRow,
      }),
    [handleChoose, handleConfirm, handleReviewRow, handleSelectSku, rowNumbers],
  );

  if (bomProjectId && bomProjectId !== 'new' && !projectMeta) {
    return (
      <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
        <BomPageHeader
          title="BOM project not found"
          description="Unknown project id."
          actions={
            <Button type="primary" size="large" onClick={() => navigate(bomHubPath)}>
              Go to BOM home
            </Button>
          }
        />
      </Space>
    );
  }

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <BomUploadFlowStepChrome
        backTo={parsingReviewRoute}
        backLabel="Back to parsing review"
        backState={uploadState}
        fileName={uploadFileName}
        currentStep={2}
        statusLabel={matchingProgressStatus}
        statusTone={allLinesReviewed ? 'success' : 'warning'}
        stepsComplete={allLinesReviewed}
      />
      <BomPageHeader
        title="Matching results summary"
        description={`Summary of every imported line for ${projectTitle} after guided review. Confirm or fix any remaining lines, then save and import.`}
        actions={
          <Flex gap={token.marginXS} align="center" wrap="wrap">
            <Button
              size="large"
              icon={<UnorderedListOutlined />}
              type={stats.pending > 0 ? 'primary' : 'default'}
              onClick={() => navigate(reviewRoute, { state: uploadState })}
            >
              Back to guided review
            </Button>
            <Button
              type="primary"
              size="large"
              disabled={stats.pending > 0}
              title={
                stats.pending > 0
                  ? `Complete ${stats.pending} pending part${stats.pending === 1 ? '' : 's'} before importing.`
                  : undefined
              }
              onClick={confirmFinishImport}
            >
              Save and import to BOM
            </Button>
          </Flex>
        }
      />

      {showReviewCompleteBanner ? (
        <Alert
          type="success"
          showIcon
          message="Guided part review complete"
          description={`${reviewSummary.confirmed} confirmed · ${reviewSummary.chosen} chosen · ${reviewSummary.skipped} skipped · ${reviewSummary.unresolved} unresolved · ${reviewSummary.needsSku} need SKU. Scan the table below before you import.`}
          action={
            reviewSummary.skipped > 0 ? (
              <Button
                size="small"
                onClick={() => {
                  setSkippedOnly(true);
                  setReviewStatusFilter('skipped');
                  setPage(1);
                }}
              >
                Review incomplete items
              </Button>
            ) : undefined
          }
        />
      ) : null}

      <BomMatchingStatsStrip summary={reviewSummary} matchConfidence={matchConfidence} />

      <Card styles={{ body: { padding: 0 } }}>
        <Flex
          align="center"
          justify="space-between"
          gap={token.marginSM}
          wrap="wrap"
          style={{
            paddingInline: token.paddingMD,
            paddingBlock: token.paddingSM,
            borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
            background: token.colorFillAlter,
          }}
        >
          <Flex align="center" gap={token.marginXS} wrap="wrap">
            <Select<ConfidenceFilter>
              value={confidenceFilter}
              onChange={(v) => {
                setConfidenceFilter(v);
                setPage(1);
              }}
              style={{ width: 160 }}
              options={[
                { value: 'all', label: 'All confidence level' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' },
              ]}
            />
            <Select<ReviewStatusFilter>
              value={reviewStatusFilter}
              onChange={(v) => {
                setReviewStatusFilter(v);
                setPage(1);
              }}
              style={{ width: 180 }}
              options={[
                { value: 'all', label: 'All review statuses' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'chosen', label: 'Chosen' },
                { value: 'skipped', label: 'Skipped' },
                { value: 'unresolved', label: 'Unresolved' },
                { value: 'needs-sku', label: 'Needs SKU' },
                { value: 'ready-to-confirm', label: 'Ready to confirm' },
              ]}
            />
            {skippedCount > 0 ? (
              <Button
                type={skippedOnly ? 'primary' : 'default'}
                ghost={skippedOnly}
                onClick={() => {
                  setSkippedOnly((v) => !v);
                  setReviewStatusFilter(skippedOnly ? 'all' : 'skipped');
                  setPage(1);
                }}
              >
                {skippedOnly ? 'Showing skipped' : `Skipped (${skippedCount})`}
              </Button>
            ) : null}
          </Flex>
        </Flex>
        <Table<BomMatchResult>
          rowKey="itemId"
          columns={columns}
          dataSource={pagedMatchResults}
          pagination={false}
          scroll={{ x: 'max-content' }}
          onRow={(row) => ({
            onClick: () => setDetailItemId(row.itemId),
            style: { cursor: 'pointer' },
          })}
          styles={{
            header: {
              cell: {
                background: token.colorFillAlter,
                borderBottomColor: token.colorBorderSecondary,
                fontWeight: token.fontWeightStrong,
              },
            },
            body: { cell: { borderBottomColor: token.colorBorderSecondary, paddingBlock: token.paddingSM } },
          }}
        />
        <Flex
          justify="flex-end"
          align="center"
          style={{
            paddingInline: token.paddingMD,
            paddingBlock: token.paddingSM,
            borderTop: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
          }}
        >
          <Pagination
            current={page}
            pageSize={shellLayout.tablePageSizeDefault}
            total={filteredResults.length}
            onChange={setPage}
            showSizeChanger={false}
          />
        </Flex>
      </Card>

      <BomChoosePartModal
        open={chooseOpen}
        matchRow={chooseMatchRow}
        onClose={closeChoose}
        onSelectPart={handleSelectPart}
      />

      <BomSkuVariantModal
        open={skuRowId !== null}
        matchRow={skuMatchRow}
        onClose={() => setSkuRowId(null)}
        onApply={handleApplySkuVariant}
      />

      <BomMatchDetailDrawer
        open={detailItemId !== null}
        matchRow={detailMatchRow}
        parsedItem={detailParsedItem}
        onClose={() => setDetailItemId(null)}
        onConfirm={() => {
          if (detailMatchRow) handleConfirm(detailMatchRow);
          setDetailItemId(null);
        }}
        onChoose={() => {
          if (detailMatchRow) handleChoose(detailMatchRow);
          setDetailItemId(null);
        }}
        onPickVariant={
          detailMatchRow
            ? () => {
                setDetailItemId(null);
                handleSelectSku(detailMatchRow);
              }
            : undefined
        }
      />
    </Space>
  );
}
