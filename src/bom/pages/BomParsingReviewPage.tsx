import { ExclamationCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { useBomHubPath } from '../../context/ActiveProjectContext';
import { shellLayout } from '../../theme/hydraAlias';
import { hydraBaseStrong, hydraTextStyleToReactCss } from '../../theme/hydraTypography';
import type { BomUploadFlowLocationState } from '../bomUploadFlowState';
import { readUploadFileName, resolveUploadDestination } from '../bomUploadFlowState';
import {
  bomAdvancedFieldMappingRoute,
  bomMappingSummaryRoute,
  parsingReviewColumnProfile,
} from '../bomFieldMappingUtils';
import { buildParsingReviewReadOnlyColumns } from '../bomParsingReviewColumns';
import {
  clearFixedUpcParseIssue,
  filterParsingReviewByAttention,
  isParsingReviewUnusableRow,
  parsingReviewMatchOutlook,
  parsingReviewProgressStatusLabel,
  parsingReviewProgressStatusTone,
  parsingReviewRowSeverity,
  type ParsingReviewAttentionFilter,
} from '../bomParsingReviewAlert';
import { BomParsingReviewQualityAlert } from '../components/BomParsingReviewQualityAlert';
import { BomParsingReviewRowDrawer } from '../components/BomParsingReviewRowDrawer';
import { BomUploadFlowStepChrome } from '../components/BomUploadFlowStepChrome';
import { BomPageHeader } from '../layout/BomPageHeader';
import {
  createInitialMatchResults,
  normalizeParsedItemsForUpload,
} from '../data/bomImportFlowSeed';
import { bomProjectById, bomProjectTitleById } from '../data/mockData';
import { useBomImportFlow } from '../context/BomImportFlowContext';
import { useBomCancelUpload } from '../hooks/useBomCancelUpload';
import { useBomImportSession } from '../hooks/useBomImportSession';
import type { BomItem } from '../data/types';
import {
  App,
  Button,
  Card,
  Empty,
  Flex,
  Pagination,
  Space,
  Table,
  Typography,
  message,
  theme,
} from '../../ui/antd';

export function BomParsingReviewPage() {
  const { token } = theme.useToken();
  const { modal } = App.useApp();
  const { bomProjectId = '' } = useParams<{ bomProjectId: string }>();
  const navigate = useNavigate();
  const bomHubPath = useBomHubPath();
  const location = useLocation();
  const uploadState = (location.state ?? {}) as BomUploadFlowLocationState;
  const { destination: uploadDestination, appendTargetId: resolvedAppendId } = resolveUploadDestination(
    bomProjectId,
    uploadState,
  );
  const uploadFileName = readUploadFileName(uploadState);
  const projectMeta = bomProjectById(bomProjectId);
  const title = bomProjectTitleById(bomProjectId) ?? 'New BOM project';
  const { session, uploadId } = useBomImportSession(bomProjectId);
  const { updateProgress, bumpRefresh } = useBomImportFlow();
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<BomItem[]>(() =>
    normalizeParsedItemsForUpload(undefined, uploadFileName).map((r) => ({ ...r })),
  );

  const sessionFileName = session?.progress.fileName ?? uploadFileName;

  useEffect(() => {
    const normalized = normalizeParsedItemsForUpload(session?.parsedItems, sessionFileName);
    setRows(normalized.map((r) => ({ ...r })));

    const resolvedUploadId = uploadId ?? session?.uploadId;
    if (
      resolvedUploadId &&
      session &&
      normalized.length !== (session.parsedItems?.length ?? 0)
    ) {
      updateProgress(resolvedUploadId, {
        parsedItems: normalized,
        matchResults: createInitialMatchResults(normalized, parsingReviewColumnProfile(uploadState.fieldMapping)),
        totalRows: normalized.length,
      });
      bumpRefresh();
    }
  }, [
    session?.parsedItems,
    session?.uploadId,
    sessionFileName,
    uploadId,
    updateProgress,
    bumpRefresh,
    uploadState.fieldMapping,
  ]);

  const [attentionFilter, setAttentionFilter] = useState<ParsingReviewAttentionFilter>('all');
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const countsLiveRef = useRef<HTMLDivElement>(null);

  const columnProfile = parsingReviewColumnProfile(uploadState.fieldMapping);
  const outlook = useMemo(
    () => parsingReviewMatchOutlook(rows, columnProfile),
    [rows, columnProfile],
  );
  const unusableCount = outlook.unusable;
  const degradedCount = outlook.limited;
  const progressStatus = parsingReviewProgressStatusLabel(rows, columnProfile);
  const parsingStatusTone = parsingReviewProgressStatusTone(rows, columnProfile);

  const visibleRows = useMemo(
    () => filterParsingReviewByAttention(rows, columnProfile, attentionFilter),
    [rows, columnProfile, attentionFilter],
  );

  const pageSize = shellLayout.tablePageSizeDefault;
  const maxPage = Math.max(1, Math.ceil(visibleRows.length / pageSize) || 1);

  useEffect(() => {
    if (page > maxPage) setPage(maxPage);
  }, [page, maxPage]);

  useEffect(() => {
    if (countsLiveRef.current) {
      countsLiveRef.current.textContent = `${outlook.ready} ready · ${outlook.limited} may match poorly · ${outlook.unusable} can't be matched`;
    }
  }, [outlook]);

  const editRow = editRowId ? rows.find((r) => r.id === editRowId) ?? null : null;

  const updateRow = useCallback((rowId: string, patch: Partial<BomItem>) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        const merged = { ...r, ...patch };
        return {
          ...merged,
          upcParseIssue: clearFixedUpcParseIssue(r, patch),
        };
      }),
    );
  }, []);

  const openEditRow = useCallback((row: BomItem) => {
    setEditRowId(row.id);
  }, []);

  const columns = useMemo(
    () => buildParsingReviewReadOnlyColumns(columnProfile, openEditRow, token, uploadState.fieldMapping),
    [columnProfile, openEditRow, token, uploadState.fieldMapping],
  );

  const pagedParsedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return visibleRows.slice(start, start + pageSize);
  }, [page, visibleRows, pageSize]);

  const mappingSummaryRoute = bomMappingSummaryRoute(bomProjectId);
  const advancedFieldMappingRoute = bomAdvancedFieldMappingRoute(bomProjectId);
  const { confirmCancelUpload } = useBomCancelUpload(bomProjectId);

  function commitAndNavigate() {
    const nextMatchResults = createInitialMatchResults(rows, columnProfile);
    const resolvedUploadId = uploadId ?? session?.uploadId;
    if (resolvedUploadId) {
      updateProgress(resolvedUploadId, {
        parsedItems: rows,
        matchResults: nextMatchResults,
        parsedRows: rows.length,
        totalRows: rows.length,
        currentStep: 'match',
        acceptedCount: 0,
        skippedCount: 0,
        manualCount: 0,
        matchedRows: 0,
      });
      bumpRefresh();
    }
    navigate(`/bom/projects/${bomProjectId}/matching/review`, {
      state: { ...uploadState, uploadId: resolvedUploadId },
    });
  }

  function handleCommitParsingReview() {
    if (rows.length === 0) {
      message.warning('No items found to continue.');
      return;
    }

    if (unusableCount > 0) {
      modal.confirm({
        title: `${unusableCount} line${unusableCount === 1 ? '' : 's'} can't be matched`,
        icon: <ExclamationCircleOutlined style={{ color: token.colorWarning }} />,
        content:
          unusableCount === rows.length
            ? "They'll be imported as unmatched lines — nothing is lost, but you'll need to pick parts for them yourself later. You may also want to re-check column mapping first."
            : "They'll be imported as unmatched lines — nothing is lost, but you'll need to pick parts for them yourself later.",
        okText: 'Continue anyway',
        cancelText: 'Go back and fix',
        centered: true,
        onOk: commitAndNavigate,
      });
      return;
    }

    commitAndNavigate();
  }

  function handleFilter(filter: ParsingReviewAttentionFilter) {
    if (filter === 'error' && unusableCount === 0) {
      message.info('No lines that can’t be matched.');
      return;
    }
    if (filter === 'warning' && degradedCount === 0) {
      message.info('No lines that may match poorly.');
      return;
    }
    setAttentionFilter(filter);
    setPage(1);
    window.setTimeout(() => tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  function handleShowAllRows() {
    setAttentionFilter('all');
    setPage(1);
  }

  function handleRowSaved(rowId: string, patch: Partial<BomItem>) {
    const before = rows.find((r) => r.id === rowId);
    updateRow(rowId, patch);
    const after = before
      ? { ...before, ...patch, upcParseIssue: clearFixedUpcParseIssue(before, patch) }
      : null;
    if (before && after) {
      const wasUnusable = isParsingReviewUnusableRow(before, columnProfile);
      const nowSeverity = parsingReviewRowSeverity(after, columnProfile);
      if (wasUnusable && nowSeverity !== 'error') {
        message.success(`Row ${before.rowNumber} updated — it can be matched now.`);
        return;
      }
    }
    message.success(before ? `Row ${before.rowNumber} updated.` : 'Row updated.');
  }

  const headerActions = (
    <Flex gap={token.marginXS} align="center" wrap="wrap" justify="flex-end">
      <Button size="large" onClick={() => confirmCancelUpload('review')}>
        Cancel upload
      </Button>
      <Button type="primary" size="large" disabled={rows.length === 0} onClick={handleCommitParsingReview}>
        Continue with current data
      </Button>
    </Flex>
  );

  if (bomProjectId && bomProjectId !== 'new' && !projectMeta) {
    return (
      <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
        <BomPageHeader
          title="BOM project not found"
          description="Unknown project id in this demo."
          actions={
            <Button type="primary" size="large" onClick={() => navigate(bomHubPath)}>
              Go to BOM home
            </Button>
          }
        />
      </Space>
    );
  }

  if (rows.length === 0) {
    const appendWorkspaceId = resolvedAppendId ?? bomProjectId;
    const isAppendFlow = uploadDestination === 'append';
    return (
      <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
        <BomUploadFlowStepChrome
          backTo={mappingSummaryRoute}
          backLabel="Back to column check"
          backState={uploadState}
          fileName={uploadFileName}
          currentStep={1}
          statusLabel={progressStatus}
          statusTone={parsingStatusTone}
        />
        <BomPageHeader
          title="Review your imported rows"
          description={`Check row quality before matching. Project: ${title}.`}
          actions={
            <Space wrap>
              <Button size="large" onClick={() => confirmCancelUpload('review')}>
                Cancel upload
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={() => navigate(advancedFieldMappingRoute, { state: uploadState })}
              >
                Review mapping
              </Button>
              {isAppendFlow ? (
                <Button size="large" onClick={() => navigate(`/bom/projects/${appendWorkspaceId}/workspace`)}>
                  Cancel — keep workspace as-is
                </Button>
              ) : null}
            </Space>
          }
        />
      </Space>
    );
  }

  const toolbarLabel =
    attentionFilter === 'error'
      ? `Showing ${visibleRows.length} part${visibleRows.length === 1 ? '' : 's'} that can't be matched`
      : attentionFilter === 'warning'
        ? `Showing ${visibleRows.length} part${visibleRows.length === 1 ? '' : 's'} that may match poorly`
        : `${rows.length} part${rows.length === 1 ? '' : 's'} we found in your file${
            unusableCount > 0 ? ` · ${unusableCount} can't be matched` : ''
          }`;

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <BomUploadFlowStepChrome
        backTo={mappingSummaryRoute}
        backLabel="Back to column check"
        backState={uploadState}
        fileName={uploadFileName}
        currentStep={1}
        statusLabel={progressStatus}
        statusTone={parsingStatusTone}
      />
      <BomPageHeader
        title="Review your imported rows"
        description="Your original line comes first; the other columns show how we read it."
        actions={headerActions}
      />

      <div
        ref={countsLiveRef}
        aria-live="polite"
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      />

      <BomParsingReviewQualityAlert
        rows={rows}
        profile={columnProfile}
      />

      <div ref={tableRef}>
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
            <Typography.Text type="secondary">{toolbarLabel}</Typography.Text>
            <Flex gap={token.marginXS} wrap="wrap">
              {attentionFilter !== 'all' ? (
                <Button icon={<EyeOutlined />} onClick={handleShowAllRows}>
                  Show all rows
                </Button>
              ) : (
                <>
                  <Button
                    disabled={unusableCount === 0}
                    icon={<EyeOutlined />}
                    onClick={() => handleFilter('error')}
                  >
                    Can&apos;t be matched ({unusableCount})
                  </Button>
                  <Button
                    disabled={degradedCount === 0}
                    icon={<EyeOutlined />}
                    onClick={() => handleFilter('warning')}
                  >
                    May match poorly ({degradedCount})
                  </Button>
                </>
              )}
            </Flex>
          </Flex>
          {visibleRows.length === 0 ? (
            <Flex
              vertical
              align="center"
              justify="center"
              style={{ paddingBlock: token.paddingLG, paddingInline: token.paddingMD }}
            >
              <Empty
                description={
                  attentionFilter === 'error'
                    ? 'No lines that can’t be matched — nice work.'
                    : 'No lines that may match poorly.'
                }
              >
                <Button type="primary" onClick={handleShowAllRows}>
                  Show all rows
                </Button>
              </Empty>
            </Flex>
          ) : (
            <Table<BomItem>
              rowKey="id"
              columns={columns}
              dataSource={pagedParsedItems}
              pagination={false}
              scroll={{ x: 'max-content' }}
              styles={{
                header: {
                  cell: {
                    background: token.colorFillAlter,
                    borderBottomColor: token.colorBorderSecondary,
                    ...hydraTextStyleToReactCss(hydraBaseStrong),
                  },
                },
                body: {
                  cell: { borderBottomColor: token.colorBorderSecondary, paddingBlock: token.paddingSM },
                },
              }}
            />
          )}
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
              pageSize={pageSize}
              total={visibleRows.length}
              onChange={setPage}
              showSizeChanger={false}
            />
          </Flex>
        </Card>
      </div>

      <BomParsingReviewRowDrawer
        open={editRowId != null}
        row={editRow}
        profile={columnProfile}
        fieldMapping={uploadState.fieldMapping}
        onClose={() => setEditRowId(null)}
        onSave={handleRowSaved}
      />
    </Space>
  );
}
