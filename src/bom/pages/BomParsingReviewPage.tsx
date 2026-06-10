import { EyeOutlined } from '@ant-design/icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { useBomHubPath } from '../../context/ActiveProjectContext';
import { shellLayout } from '../../theme/hydraAlias';
import type { BomUploadFlowLocationState } from '../bomUploadFlowState';
import { readUploadFileName, resolveUploadDestination } from '../bomUploadFlowState';
import {
  bomAdvancedFieldMappingRoute,
  bomMappingSummaryRoute,
  parsingReviewColumnProfile,
} from '../bomFieldMappingUtils';
import { buildParsingReviewReadOnlyColumns } from '../bomParsingReviewColumns';
import {
  countParsingReviewWarnings,
  filterParsingReviewLowConfidenceRows,
  parsingReviewProgressStatusLabel,
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
  Button,
  Card,
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
        matchResults: createInitialMatchResults(normalized),
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
  ]);
  const [lowConfidenceOnly, setLowConfidenceOnly] = useState(false);
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const columnProfile = parsingReviewColumnProfile(uploadState.fieldMapping);
  const lowConfidenceCount = useMemo(
    () => countParsingReviewWarnings(rows, columnProfile),
    [rows, columnProfile],
  );
  const progressStatus = parsingReviewProgressStatusLabel(rows, columnProfile);
  const parsingStatusTone = progressStatus.endsWith(' ready') ? 'success' : 'warning';

  const visibleRows = useMemo(() => {
    if (!lowConfidenceOnly) return rows;
    return filterParsingReviewLowConfidenceRows(rows, columnProfile);
  }, [rows, columnProfile, lowConfidenceOnly]);

  const editRow = editRowId ? rows.find((r) => r.id === editRowId) ?? null : null;

  const updateRow = useCallback((rowId: string, patch: Partial<BomItem>) => {
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, ...patch } : r)));
  }, []);

  const openEditRow = useCallback((row: BomItem) => {
    setEditRowId(row.id);
  }, []);

  const columns = useMemo(
    () => buildParsingReviewReadOnlyColumns(columnProfile, openEditRow),
    [columnProfile, openEditRow],
  );

  const pagedParsedItems = useMemo(() => {
    const start = (page - 1) * shellLayout.tablePageSizeDefault;
    return visibleRows.slice(start, start + shellLayout.tablePageSizeDefault);
  }, [page, visibleRows]);

  const mappingSummaryRoute = bomMappingSummaryRoute(bomProjectId);
  const advancedFieldMappingRoute = bomAdvancedFieldMappingRoute(bomProjectId);
  const { confirmCancelUpload } = useBomCancelUpload(bomProjectId);

  function handleCommitParsingReview() {
    if (rows.length === 0) {
      message.warning('No parsed items to continue.');
      return;
    }
    const nextMatchResults = createInitialMatchResults(rows);
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

  function handleReviewLowConfidence() {
    if (lowConfidenceCount === 0) {
      message.info('All lines look ready for matching.');
      return;
    }
    setLowConfidenceOnly(true);
    setPage(1);
    window.setTimeout(() => tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  function handleShowAllRows() {
    setLowConfidenceOnly(false);
    setPage(1);
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
          title="Parsed data review"
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
        title="Parsed data review"
        description="We show what we could parse from your file. You can add missing details on any row, but it is optional."
        actions={headerActions}
      />

      <BomParsingReviewQualityAlert rows={rows} profile={columnProfile} />

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
            <Typography.Text type="secondary">
              {lowConfidenceOnly
                ? `Showing ${visibleRows.length} line${visibleRows.length === 1 ? '' : 's'} that may not match well`
                : `${rows.length} line${rows.length === 1 ? '' : 's'} from your file`}
            </Typography.Text>
            {lowConfidenceOnly ? (
              <Button icon={<EyeOutlined />} onClick={handleShowAllRows}>
                Show all rows
              </Button>
            ) : (
              <Button
                disabled={lowConfidenceCount === 0}
                icon={<EyeOutlined />}
                onClick={handleReviewLowConfidence}
              >
                Show lines that may not match well
              </Button>
            )}
          </Flex>
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
        onClose={() => setEditRowId(null)}
        onSave={updateRow}
      />
    </Space>
  );
}
