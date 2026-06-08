import { useCallback, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { useBomHubPath } from '../../context/ActiveProjectContext';
import { shellLayout } from '../../theme/hydraAlias';
import {
  hydraBaseNormal,
  hydraTextStyleToReactCss,
  hydraTitleHeading3,
} from '../../theme/hydraTypography';
import type { BomUploadFlowLocationState } from '../bomUploadFlowState';
import { readUploadFileName, resolveUploadDestination } from '../bomUploadFlowState';
import {
  bomAdvancedFieldMappingRoute,
  bomMappingSummaryRoute,
  parsingReviewColumnProfile,
} from '../bomFieldMappingUtils';
import {
  buildParsingReviewReadOnlyColumns,
  parsingReviewRowStyle,
} from '../bomParsingReviewColumns';
import {
  countParsingReviewWarnings,
  filterParsingReviewLowConfidenceRows,
  parsingReviewProgressStatusLabel,
  parsingReviewQualityAlert,
  parsingReviewQualityCounts,
} from '../bomParsingReviewAlert';
import { BomParsingReviewRowDrawer } from '../components/BomParsingReviewRowDrawer';
import { BomUploadFlowStepChrome } from '../components/BomUploadFlowStepChrome';
import { BomPageHeader } from '../layout/BomPageHeader';
import { createParsingReviewRows } from '../data/bomImportFlowSeed';
import { bomProjectById, bomProjectTitleById } from '../data/mockData';
import { useBomCancelUpload } from '../hooks/useBomCancelUpload';
import type { BomItem } from '../data/types';
import {
  Alert,
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

function ParsingReviewQualityStrip({
  high,
  medium,
  low,
}: {
  high: number;
  medium: number;
  low: number;
}) {
  const { token } = theme.useToken();

  const cardShellStyle = (accentColor: string) => ({
    flex: 1,
    minWidth: 160,
    height: 56,
    paddingInline: token.paddingMD,
    paddingBlock: token.paddingSM,
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
    <Flex gap={token.margin} align="stretch" style={{ width: '100%' }} wrap="wrap">
      <Flex align="center" style={cardShellStyle(token.colorSuccessBorder)}>
        {statInner('High quality', high)}
      </Flex>
      <Flex align="center" style={cardShellStyle(token.colorWarningBorder)}>
        {statInner('Medium quality', medium)}
      </Flex>
      <Flex align="center" style={cardShellStyle(token.colorErrorBorder)}>
        {statInner('Low quality', low)}
      </Flex>
    </Flex>
  );
}

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
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<BomItem[]>(() => createParsingReviewRows().map((r) => ({ ...r })));
  const [lowConfidenceOnly, setLowConfidenceOnly] = useState(false);
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const columnProfile = parsingReviewColumnProfile(uploadState.fieldMapping);
  const qualityCounts = useMemo(() => parsingReviewQualityCounts(rows), [rows]);
  const lowConfidenceCount = useMemo(
    () => countParsingReviewWarnings(rows, columnProfile),
    [rows, columnProfile],
  );
  const parsingBanner = parsingReviewQualityAlert(rows, columnProfile);
  const progressStatus = parsingReviewProgressStatusLabel(rows, columnProfile);

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
    navigate(`/bom/projects/${bomProjectId}/matching/review`, { state: uploadState });
  }

  function handleReviewLowConfidence() {
    if (lowConfidenceCount === 0) {
      message.info('All rows look ready — no low-confidence rows to review.');
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
    <Flex gap={token.marginXS} align="center" wrap="wrap">
      <Button size="large" onClick={() => confirmCancelUpload('review')}>
        Cancel upload
      </Button>
      {lowConfidenceOnly ? (
        <Button size="large" onClick={handleShowAllRows}>
          Show all rows
        </Button>
      ) : (
        <Button
          size="large"
          disabled={lowConfidenceCount === 0}
          onClick={handleReviewLowConfidence}
        >
          Review low-confidence rows
        </Button>
      )}
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
          backLabel="Back to column mapping"
          backState={uploadState}
          fileName={uploadFileName}
          currentStep={1}
          statusLabel={progressStatus}
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
        backLabel="Back to column mapping"
        backState={uploadState}
        fileName={uploadFileName}
        currentStep={1}
        statusLabel={progressStatus}
      />
      <BomPageHeader
        title="Parsed data review"
        description="Check whether your uploaded rows have enough detail for accurate matching. Fixing rows is optional."
        actions={headerActions}
      />

      <ParsingReviewQualityStrip
        high={qualityCounts.high}
        medium={qualityCounts.medium}
        low={qualityCounts.low}
      />

      <Alert
        type={parsingBanner.type === 'success' ? 'info' : parsingBanner.type}
        showIcon
        message={parsingBanner.message}
        description={parsingBanner.description}
      />

      {lowConfidenceOnly ? (
        <Alert
          type="info"
          showIcon
          message={`Showing ${visibleRows.length} low-confidence row${visibleRows.length === 1 ? '' : 's'}`}
          description="Use Add info on a row to fill in missing details, or continue with current data when you are done reviewing."
        />
      ) : null}

      <div ref={tableRef}>
        <Card styles={{ body: { padding: 0 } }}>
          <Table<BomItem>
            rowKey="id"
            columns={columns}
            dataSource={pagedParsedItems}
            pagination={false}
            scroll={{ x: 'max-content' }}
            onRow={(record) => ({
              style: parsingReviewRowStyle(record, token),
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
