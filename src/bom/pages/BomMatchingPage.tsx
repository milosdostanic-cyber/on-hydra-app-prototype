import { UnorderedListOutlined } from '@ant-design/icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { useBomHubPath } from '../../context/ActiveProjectContext';
import { shellLayout } from '../../theme/hydraAlias';
import {
  hydraBaseNormal,
  hydraBaseStrong,
  hydraTextStyleToReactCss,
  hydraTitleHeading3,
} from '../../theme/hydraTypography';
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
import { buildBomChoosePartSearchQuery } from '../bomChoosePartUtils';
import {
  applyCatalogPickToMatchResult,
  catalogPickSuccessMessage,
  catalogProductByKey,
  matchingCatalogPickRoute,
  readCatalogPickReturn,
} from '../bomCatalogPickNavigation';
import { BomMatchDetailDrawer } from '../components/BomMatchDetailDrawer';
import { BomSkuVariantModal } from '../components/BomSkuVariantModal';
import { BomUploadFlowStepChrome } from '../components/BomUploadFlowStepChrome';
import { BomPageHeader } from '../layout/BomPageHeader';
import { normalizeParsedItemsForUpload } from '../data/bomImportFlowSeed';
import { bomItemById, bomProjectById, bomProjectTitleById } from '../data/mockData';
import { demoSubmittalUrlForFigure } from '../bomWorkspaceDashboard';
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

/** Figma `5026:21422` — review summary strip above matching table. */
function BomMatchingStatsStrip({
  summary,
}: {
  summary: ReturnType<typeof computeMatchingReviewSummary>;
}) {
  const { token } = theme.useToken();
  const readyCount = summary.confirmed + summary.chosen;
  const needsAttention = summary.incomplete;

  const cardShellStyle = (accentColor: string, flex?: string | number) => ({
    flex: flex ?? 1,
    minWidth: 200,
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
      <Flex align="center" style={cardShellStyle(token.colorPrimaryActive)}>
        {statInner('Total parts', summary.total)}
      </Flex>
      <Flex align="center" style={cardShellStyle(token.colorSuccessBorder)}>
        {statInner('Ready to import', readyCount)}
      </Flex>
      <Flex align="center" style={cardShellStyle(token.colorWarning)}>
        {statInner('Needs attention', needsAttention)}
      </Flex>
      {summary.cantMatch > 0 ? (
        <Flex align="center" style={cardShellStyle(token.colorError)}>
          {statInner("Can't be matched", summary.cantMatch)}
        </Flex>
      ) : null}
      <Flex align="center" style={cardShellStyle(token.colorWarningBorder)}>
        {statInner('Skipped', summary.skipped)}
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

  const tableRoute = `/bom/projects/${bomProjectId}/matching/table`;

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

  const allLinesReviewed = stats.pending === 0;
  const matchingProgressStatus = matchingStepStatusLabel(stats);
  const parsingReviewRoute = `/bom/projects/${bomProjectId}/parsing-review`;
  const reviewRoute = `/bom/projects/${bomProjectId}/matching/review`;

  useEffect(() => {
    const applied = readCatalogPickReturn(location.state);
    if (!applied) return;

    const matchRow = matchResults.find((row) => row.itemId === applied.itemId);
    const product = catalogProductByKey(applied.productKey);
    if (!matchRow || !product) return;

    const hadSuggestion = Boolean(matchRow.topMatch);
    const picked = applyCatalogPickToMatchResult(matchRow, product, applied.variantId);
    const next = { ...picked, lineStatus: 'accepted' as const };
    persist(matchResults.map((row) => (row.itemId === applied.itemId ? next : row)));
    message.success(
      applied.variantId
        ? 'Part and SKU saved.'
        : catalogPickSuccessMessage(hadSuggestion, false).replace('confirm the match to continue', 'saved'),
    );

    navigate(tableRoute, {
      replace: true,
      state: uploadState,
    });
  }, [location.state]);
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
      const parsedItem =
        bomItemById(row.itemId) ?? session?.parsedItems.find((i) => i.id === row.itemId);
      const searchQuery = buildBomChoosePartSearchQuery(row, parsedItem);
      navigate(matchingCatalogPickRoute(bomProjectId), {
        state: {
          matchingPickItemId: row.itemId,
          returnTo: tableRoute,
          returnLabel: 'Back to matching summary',
          uploadFlowState: uploadState,
          catalogSearch: searchQuery || undefined,
          pickSource: {
            partNumber: row.topMatch?.partNumber ?? parsedItem?.sku,
            description: parsedItem?.parsedDescription ?? row.originalRequest,
            size: parsedItem?.size,
            category: parsedItem?.category,
          },
        },
      });
    },
    [bomProjectId, navigate, session?.parsedItems, tableRoute, uploadState],
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
      navigate(reviewRoute, {
        state: { ...uploadState, focusItemId: row.itemId, resolveFromTable: true },
      });
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
      const ready = isReadyToConfirmMatch(next);
      const accepted = ready ? { ...next, lineStatus: 'accepted' as const } : next;
      persist(matchResults.map((r) => (r.itemId === accepted.itemId ? accepted : r)));
      message.success(ready ? 'SKU selected and match saved.' : 'SKU variant selected.');
    },
    [matchResults, persist],
  );

  const handleDeleteRow = useCallback(
    (row: BomMatchResult) => {
      persist(matchResults.filter((r) => r.itemId !== row.itemId));
      message.success('Line removed from matching.');
    },
    [matchResults, persist],
  );

  const resolveSubmittalUrl = useCallback(
    (row: BomMatchResult): string | undefined => {
      if (row.topMatch?.figureNumber) return demoSubmittalUrlForFigure(row.topMatch.figureNumber);
      if (row.figureNumber) return demoSubmittalUrlForFigure(row.figureNumber);
      return undefined;
    },
    [],
  );

  const columns = useMemo(
    () =>
      buildMatchingResultsColumns(
        (itemId) => rowNumbers.get(itemId),
        {
          onConfirm: handleConfirm,
          onChoose: handleChoose,
          onSelectSku: handleSelectSku,
          onReview: handleReviewRow,
          onDelete: handleDeleteRow,
          resolveSubmittalUrl,
          bomProjectId,
        },
        showReviewCompleteBanner,
      ),
    [bomProjectId, handleChoose, handleConfirm, handleDeleteRow, handleReviewRow, handleSelectSku, resolveSubmittalUrl, rowNumbers, showReviewCompleteBanner],
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
        backLabel="Back to file check"
        backState={uploadState}
        fileName={uploadFileName}
        currentStep={2}
        statusLabel={matchingProgressStatus}
        statusTone={allLinesReviewed ? 'success' : 'warning'}
        stepsComplete={allLinesReviewed}
      />
      <BomPageHeader
        title="Matching results"
        description={
          stats.pending > 0
            ? `${stats.pending} part${stats.pending === 1 ? '' : 's'} still need a decision before you can import. Resolve below, or send back to guided review.`
            : reviewSummary.skipped > 0
              ? `${reviewSummary.confirmed + reviewSummary.chosen} of ${reviewSummary.total} parts matched for ${projectTitle}. ${reviewSummary.skipped} skipped — they will not be imported.`
              : `All ${reviewSummary.total} parts matched for ${projectTitle}. Save and import when you are ready.`
        }
        actions={
          <Flex gap={token.marginXS} align="center" wrap="wrap">
            <Button
              size="large"
              icon={<UnorderedListOutlined />}
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
                  ? `Resolve ${stats.pending} part${stats.pending === 1 ? '' : 's'} before importing.`
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
        stats.pending > 0 ? (
          <Alert
            type="warning"
            showIcon
            message={`${stats.pending} part${stats.pending === 1 ? '' : 's'} still need attention`}
            description={`${reviewSummary.skipped} skipped · ${reviewSummary.unresolved} without a match · ${reviewSummary.needsSku} need exact product. Resolve below, or jump back to guided review.`}
            action={
              <Flex gap={token.marginXS} align="center" wrap="wrap">
                {reviewSummary.skipped > 0 && !skippedOnly ? (
                  <Button
                    size="small"
                    onClick={() => {
                      setSkippedOnly(true);
                      setReviewStatusFilter('skipped');
                      setPage(1);
                    }}
                  >
                    Show {reviewSummary.skipped} skipped
                  </Button>
                ) : null}
                <Button type="link" onClick={() => navigate(reviewRoute, { state: uploadState })}>
                  Back to guided review
                </Button>
              </Flex>
            }
          />
        ) : (
          <Alert
            type="success"
            showIcon
            message="All parts matched"
            description={`${reviewSummary.confirmed} confirmed · ${reviewSummary.chosen} chosen. Save and import to add them to your BOM.`}
            action={
              <Button type="primary" size="small" onClick={confirmFinishImport}>
                Save and import
              </Button>
            }
          />
        )
      ) : null}

      <BomMatchingStatsStrip summary={reviewSummary} />

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
                { value: 'cant-match', label: "Can't be matched" },
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
                ...hydraTextStyleToReactCss(hydraBaseStrong),
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
        bomProjectId={bomProjectId}
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
