import { ExclamationCircleOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { shellLayout } from '../../theme/hydraAlias';
import { matchScoreBand } from '../data/bomImportFlowSeed';
import { useBomMatchingData } from '../hooks/useBomMatchingData';
import { useBomImportFlow } from '../context/BomImportFlowContext';
import { useBomWorkspace } from '../../context/BomWorkspaceContext';
import { ensureWorkspaceRowDisplayFields } from '../data/bomWorkspaceSeed';
import { BomConfidenceTag, BomManualTag } from '../components/BomTags';
import { BomImportProgressStrip } from '../components/BomImportProgressStrip';
import { BomTablePaginationBar } from '../components/BomTablePaginationBar';
import { BomPageHeader } from '../layout/BomPageHeader';
import { bomProjectById, bomProjectTitleById } from '../data/mockData';
import type { BomItem, BomItemConfidence, BomMatchResult } from '../data/types';
import { PageBackButton } from '../../shell/PageBackButton';
import {
  Alert,
  App,
  Badge,
  Button,
  Card,
  Flex,
  Select,
  Space,
  Table,
  Tooltip,
  Typography,
  message,
  theme,
} from '../../ui/antd';
import type { TableColumnsType } from '../../ui/antd';
import {
  hydraBaseNormal,
  hydraTextStyleToReactCss,
  hydraTitleHeading3,
} from '../../theme/hydraTypography';

function buildWorkspaceRowFromMatch(
  result: BomMatchResult,
  parsedItem: BomItem | undefined,
  rowIndex: number,
): BomItem {
  const match = result.topMatch;
  const conf: BomItemConfidence =
    result.source === 'manual' || (match?.matchConfidence ?? 0) >= 90
      ? 'high'
      : (match?.matchConfidence ?? 0) >= 70
        ? 'medium'
        : 'low';
  return ensureWorkspaceRowDisplayFields({
    id: `ws-import-${result.itemId}`,
    rowNumber: rowIndex,
    originalInput: result.originalRequest,
    parsedDescription: match?.description ?? result.originalRequest,
    sku: match?.partNumber,
    size: match?.dimensions ?? parsedItem?.size ?? '',
    pressureClass: match?.pressureRating ?? parsedItem?.pressureClass ?? '',
    connectionType: match?.connectionType ?? parsedItem?.connectionType ?? '',
    quantity: parsedItem?.quantity ?? 1,
    confidence: conf,
    category: match?.productFamily ?? parsedItem?.category,
    unit: parsedItem?.unit ?? 'EA',
    manufacturer: parsedItem?.manufacturer,
    status: 'pending' as const,
  });
}

type ConfidenceFilter = 'all' | 'high' | 'medium' | 'low';

const MATCHING_COLUMN_WIDTHS = {
  line: 56,
  originalPart: 401,
  ourPart: 392,
  matchScore: 140,
  status: 101,
  actions: 191,
} as const;

type StatCardKey = 'total' | 'accepted' | 'pending' | 'skipped' | 'confidence';

function statAccentColor(key: StatCardKey, token: ReturnType<typeof theme.useToken>['token']) {
  if (key === 'total') return token.colorInfoActive;
  if (key === 'accepted') return token.colorSuccessBorder;
  if (key === 'pending') return token.colorInfoBorder;
  if (key === 'skipped') return token.colorWarning;
  if (key === 'confidence') return token.colorPrimaryBorder;
  return token.colorInfoActive;
}

function rowBand(row: BomMatchResult): ConfidenceFilter | 'none' {
  if (row.source === 'manual') return 'high';
  const p = row.topMatch?.matchConfidence ?? 0;
  if (!row.topMatch) return 'none';
  if (p >= 90) return 'high';
  if (p >= 70) return 'medium';
  return 'low';
}

function bandToConfidence(band: ReturnType<typeof matchScoreBand>): BomItemConfidence {
  if (band === 'high') return 'high';
  if (band === 'medium') return 'medium';
  return 'low';
}

function MatchScoreCell({ row }: { row: BomMatchResult }) {
  if (row.source === 'manual') {
    return <BomManualTag />;
  }
  const conf = row.topMatch?.matchConfidence ?? 0;
  return <BomConfidenceTag confidence={bandToConfidence(matchScoreBand(conf))} showIcon />;
}

function LineStatusCell({ status }: { status: BomMatchResult['lineStatus'] }) {
  const badgeStatus =
    status === 'accepted' ? 'success' : status === 'skipped' ? 'warning' : 'processing';
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return <Badge status={badgeStatus} text={label} />;
}

type MatchingStatCardProps = {
  label: string;
  value: ReactNode;
  accentColor: string;
  flex?: string;
  minWidth?: number;
  maxWidth?: number;
};

function MatchingStatCard({ label, value, accentColor, flex, minWidth, maxWidth }: MatchingStatCardProps) {
  const { token } = theme.useToken();
  return (
    <Card
      size="small"
      style={{
        flex: flex ?? '1 1 160px',
        minWidth: minWidth ?? 160,
        maxWidth,
        borderLeft: `${token.lineWidthBold}px solid ${accentColor}`,
        borderRadius: token.borderRadiusLG,
        boxShadow: token.boxShadowTertiary,
      }}
      styles={{ body: { paddingBlock: token.paddingSM, paddingInline: token.paddingMD } }}
    >
      <Flex align="center" justify="space-between" gap={token.marginSM}>
        <Typography.Text style={{ ...hydraTextStyleToReactCss(hydraBaseNormal), color: token.colorTextDescription }}>
          {label}
        </Typography.Text>
        {value}
      </Flex>
    </Card>
  );
}

export function BomMatchingPage() {
  const { token } = theme.useToken();
  const { modal } = App.useApp();
  const { bomProjectId = '' } = useParams<{ bomProjectId: string }>();
  const navigate = useNavigate();
  const { updateProgress, dismissSession } = useBomImportFlow();
  const { rowsByProjectId, setWorkspaceRows } = useBomWorkspace();
  const projectMeta = bomProjectById(bomProjectId);
  const projectTitle = bomProjectTitleById(bomProjectId) ?? 'BOM project';
  const { session, uploadId, matchResults, persist, stats } = useBomMatchingData(bomProjectId);
  const [page, setPage] = useState(1);
  const [confidenceFilter, setConfidenceFilter] = useState<ConfidenceFilter>('all');

  const tableStyles = useMemo(
    () => ({
      header: {
        cell: {
          background: token.colorFillAlter,
          borderBottomColor: token.colorBorderSecondary,
          fontWeight: token.fontWeightStrong,
        },
      },
      body: { cell: { borderBottomColor: token.colorBorderSecondary, paddingBlock: token.paddingSM } },
    }),
    [token],
  );

  useEffect(() => {
    if (!uploadId) return;
    updateProgress(uploadId, { currentStep: 'match' });
  }, [uploadId, updateProgress]);

  const filteredResults = useMemo(() => {
    return matchResults.filter((row) => {
      const c = rowBand(row);
      if (confidenceFilter === 'all') return true;
      if (confidenceFilter === 'high') return c === 'high';
      if (confidenceFilter === 'medium') return c === 'medium';
      if (confidenceFilter === 'low') return c === 'low' || c === 'none';
      return true;
    });
  }, [matchResults, confidenceFilter]);

  const pagedResults = useMemo(() => {
    const start = (page - 1) * shellLayout.tablePageSizeDefault;
    return filteredResults.slice(start, start + shellLayout.tablePageSizeDefault);
  }, [filteredResults, page]);

  const hasPendingRows = matchResults.some((r) => r.lineStatus === 'pending');

  function updateRow(itemId: string, patch: Partial<BomMatchResult>) {
    persist(matchResults.map((r) => (r.itemId === itemId ? { ...r, ...patch } : r)));
  }

  function handleAccept(row: BomMatchResult) {
    updateRow(row.itemId, { lineStatus: 'accepted' });
    message.success('Line accepted.');
  }

  function handleSkip(row: BomMatchResult) {
    updateRow(row.itemId, { lineStatus: 'skipped' });
  }

  function handleAcceptAllHigh() {
    let acceptedHigh = 0;
    let skippedRest = 0;
    const next = matchResults.map((r) => {
      if (r.lineStatus !== 'pending') return r;
      if (rowBand(r) === 'high') {
        acceptedHigh += 1;
        return { ...r, lineStatus: 'accepted' as const };
      }
      skippedRest += 1;
      return { ...r, lineStatus: 'skipped' as const };
    });
    persist(next);
    if (acceptedHigh === 0 && skippedRest === 0) {
      message.info('No pending lines to update.');
      return;
    }
    message.success(
      `Accepted ${acceptedHigh} high-confidence match${acceptedHigh === 1 ? '' : 'es'}; skipped ${skippedRest} other pending line${skippedRest === 1 ? '' : 's'}.`,
    );
  }

  function handleCancelUpload() {
    modal.confirm({
      title: 'Cancel upload?',
      content: 'All matching progress for this file will be discarded.',
      icon: <ExclamationCircleOutlined style={{ color: token.colorWarning }} />,
      okText: 'Cancel upload',
      okType: 'danger',
      cancelText: 'Keep matching',
      onOk: () => {
        if (uploadId) dismissSession(uploadId);
        navigate('/bom');
      },
    });
  }

  function handleSaveAndImport() {
    const accepted = matchResults.filter((r) => r.lineStatus === 'accepted' || r.source === 'manual');
    const parsedItems = session?.parsedItems ?? [];
    const existingRows = rowsByProjectId[bomProjectId] ?? [];
    const startIndex = existingRows.length;
    const newRows = accepted.map((result, i) => {
      const parsedItem = parsedItems.find((p) => p.id === result.itemId);
      return buildWorkspaceRowFromMatch(result, parsedItem, startIndex + i + 1);
    });
    if (newRows.length > 0) {
      setWorkspaceRows(bomProjectId, (prev) => [...prev, ...newRows]);
    }
    if (uploadId) {
      updateProgress(uploadId, { currentStep: 'done' });
    }
    message.success(
      `Imported ${stats.total} items — ${stats.accepted} accepted · ${stats.manual} added manually · ${stats.skipped} skipped.`,
    );
    navigate(`/bom/projects/${bomProjectId}/workspace`, {
      state: {
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

  const columns: TableColumnsType<BomMatchResult> = [
    {
      title: 'Line',
      key: 'line',
      width: MATCHING_COLUMN_WIDTHS.line,
      render: (_, _row, index) => (page - 1) * shellLayout.tablePageSizeDefault + index + 1,
    },
    {
      title: 'Original part',
      dataIndex: 'originalRequest',
      key: 'originalRequest',
      width: MATCHING_COLUMN_WIDTHS.originalPart,
      ellipsis: true,
    },
    {
      title: 'Our Part',
      key: 'ourPart',
      width: MATCHING_COLUMN_WIDTHS.ourPart,
      render: (_, row) =>
        row.topMatch ? (
          <Flex align="flex-start" justify="space-between" gap={token.marginSM}>
            <Space orientation="vertical" size={token.marginXXS} style={{ minWidth: 0, flex: 1 }}>
              <Typography.Text strong ellipsis>
                {row.topMatch.partNumber}
              </Typography.Text>
              <Typography.Text type="secondary" ellipsis>
                {row.topMatch.description}
              </Typography.Text>
            </Space>
            <Typography.Text type="secondary" style={{ flexShrink: 0 }}>
              {row.suggestedParts.length} candidate{row.suggestedParts.length !== 1 ? 's' : ''}
            </Typography.Text>
          </Flex>
        ) : (
          <Typography.Text type="secondary">No matches — manual selection required</Typography.Text>
        ),
    },
    {
      title: 'Match score',
      key: 'matchScore',
      width: MATCHING_COLUMN_WIDTHS.matchScore,
      render: (_, row) => <MatchScoreCell row={row} />,
    },
    {
      title: 'Status',
      key: 'status',
      width: MATCHING_COLUMN_WIDTHS.status,
      render: (_, row) => <LineStatusCell status={row.lineStatus} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: MATCHING_COLUMN_WIDTHS.actions,
      render: (_, row) => (
        <Space size={token.marginXS} wrap>
          {row.lineStatus === 'pending' ? (
            <>
              <Button type="link" size="small" onClick={() => handleAccept(row)}>
                Accept
              </Button>
              <Button type="link" size="small" danger onClick={() => handleSkip(row)}>
                Skip
              </Button>
            </>
          ) : null}
          <Button
            type="link"
            size="small"
            onClick={() =>
              navigate(`/bom/projects/${bomProjectId}/matching/items/${row.itemId}/replacement`, {
                state: { returnTo: 'table', uploadId },
              })
            }
          >
            Refine
          </Button>
        </Space>
      ),
    },
  ];

  const hasSession = Boolean(session?.uploadId);

  if (bomProjectId && bomProjectId !== 'new' && !projectMeta) {
    return (
      <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
        <BomPageHeader
          title="BOM project not found"
          description="Unknown project id."
          actions={
            <Button type="primary" size="large" onClick={() => navigate('/bom')}>
              Go to BOM home
            </Button>
          }
        />
      </Space>
    );
  }

  if (!hasSession) {
    return (
      <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
        <PageBackButton to="/bom">Back to BOM</PageBackButton>
        <BomPageHeader
          title="Matching results"
          description={`Catalog candidates per BOM line. Project: ${projectTitle}.`}
          actions={
            <Button
              type="primary"
              size="large"
              onClick={() => navigate(`/bom/projects/${bomProjectId}/parsing-review`)}
            >
              Back to parsing review
            </Button>
          }
        />
        <Alert
          type="error"
          showIcon
          message="Matching session not found"
          description="No active upload session was found for this project. This can happen if the page was refreshed mid-import. Return to parsing review or start a new upload from BOM home."
        />
      </Space>
    );
  }

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to="/bom">Back to BOM</PageBackButton>
      <BomImportProgressStrip progress={session.progress} />

      <BomPageHeader
        title="Matching results"
        description={`Catalog candidates per BOM line. Project: ${projectTitle}.`}
        actions={
          <Space wrap>
            <Button
              size="large"
              icon={<UnorderedListOutlined />}
              onClick={() => navigate(`/bom/projects/${bomProjectId}/matching/progressive`)}
            >
              Review one by one
            </Button>
            <Button size="large" onClick={handleCancelUpload}>
              Cancel upload
            </Button>
            <Tooltip
              title={
                hasPendingRows
                  ? `${stats.pending} item${stats.pending === 1 ? '' : 's'} still pending — accept or skip all items before importing.`
                  : undefined
              }
            >
              <span>
                <Button
                  type="primary"
                  size="large"
                  disabled={hasPendingRows}
                  onClick={handleSaveAndImport}
                >
                  Save and import to BOM
                </Button>
              </span>
            </Tooltip>
          </Space>
        }
      />

      <Flex gap={token.margin} wrap="wrap" align="stretch">
        <MatchingStatCard
          label="Total items"
          accentColor={statAccentColor('total', token)}
          value={
            <Typography.Text
              strong
              style={{ ...hydraTextStyleToReactCss(hydraTitleHeading3), color: token.colorText }}
            >
              {stats.total}
            </Typography.Text>
          }
        />
        <MatchingStatCard
          label="Accepted"
          accentColor={statAccentColor('accepted', token)}
          value={
            <Typography.Text
              strong
              style={{ ...hydraTextStyleToReactCss(hydraTitleHeading3), color: token.colorText }}
            >
              {stats.accepted}
            </Typography.Text>
          }
        />
        <MatchingStatCard
          label="Pending"
          accentColor={statAccentColor('pending', token)}
          value={
            <Typography.Text
              strong
              style={{ ...hydraTextStyleToReactCss(hydraTitleHeading3), color: token.colorText }}
            >
              {stats.pending}
            </Typography.Text>
          }
        />
        <MatchingStatCard
          label="Skipped"
          accentColor={statAccentColor('skipped', token)}
          value={
            <Typography.Text
              strong
              style={{ ...hydraTextStyleToReactCss(hydraTitleHeading3), color: token.colorText }}
            >
              {stats.skipped}
            </Typography.Text>
          }
        />
        <MatchingStatCard
          label="Match Confidence"
          accentColor={statAccentColor('confidence', token)}
          flex="1 1 326px"
          minWidth={260}
          maxWidth={420}
          value={
            <BomConfidenceTag confidence="high" showIcon />
          }
        />
      </Flex>

      {matchResults.length === 0 ? (
        <Alert
          type="warning"
          showIcon
          message="No items to match"
          description="No parsed items were found in this session. Go back to parsing review or start a new upload."
        />
      ) : null}

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
          <Select<ConfidenceFilter>
            value={confidenceFilter}
            onChange={(v) => {
              setConfidenceFilter(v);
              setPage(1);
            }}
            style={{ minWidth: token.controlHeight * 5 }}
            options={[
              { value: 'all', label: 'All confidence level' },
              { value: 'high', label: 'High (≥90%)' },
              { value: 'medium', label: 'Medium (70–89%)' },
              { value: 'low', label: 'Low / none' },
            ]}
          />
          <Button
            type="primary"
            ghost
            disabled={!hasPendingRows}
            onClick={handleAcceptAllHigh}
          >
            Accept all high matches and skip rest
          </Button>
        </Flex>
        <Table<BomMatchResult>
          rowKey="itemId"
          columns={columns}
          dataSource={pagedResults}
          pagination={false}
          scroll={{ x: 'max-content' }}
          tableLayout="fixed"
          styles={tableStyles}
        />
        <BomTablePaginationBar
          current={page}
          total={filteredResults.length}
          onChange={setPage}
        />
      </Card>
    </Space>
  );
}
