import { useMemo, useState, type Key, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { BomPageHeader } from '../../bom/layout/BomPageHeader';
import { CatalogThumbnailPlaceholder } from '../../catalog/CatalogThumbnailPlaceholder';
import { useActionTrail, useActionTrailModuleLifecycle } from '../../context/ActionTrailContext';
import { actionTrailTableRowProps } from '../../search/actionTrailStyles';
import { useDownloadHistory } from '../../search/revitDownloadQueue';
import { HydraTag } from '../../ui/HydraTag';
import {
  App,
  Avatar,
  Button,
  Card,
  Empty,
  Flex,
  Space,
  Table,
  Tooltip,
  Typography,
  theme,
  type TableColumnsType,
} from '../../ui/antd';
import { PageBackButton } from '../PageBackButton';
import { projectTitleById } from '../projectSeed';
import { shellTableCardStyle, shellTableStyles } from '../shellTablePatterns';
import { ContentDownloadDemoControls } from './ContentDownloadDemoControls';
import { useContentDownloadAccess } from './contentDownloadAccess';
import { CreateBomFromHistoryModal } from './CreateBomFromHistoryModal';
import { CreateSubmittalFromHistoryModal } from './CreateSubmittalFromHistoryModal';
import { buildDownloadHistoryRows, isHistoryFigureRow, type HistoryTableRow } from './downloadHistoryRows';
import {
  countSelectedGranularity,
  resolveSelection,
} from './downloadHistorySelection';
import { historyEntriesForProject } from './downloadHistorySeed';
import { ActionTrailNewTag } from '../../search/components/ActionTrailNewTag';

/** Ties variant rows visually to their parent figure — antd nesting alone reads as sibling rows once expanded. */
const HISTORY_VARIANT_ROW_CLASS = 'download-history-variant-row';
const HISTORY_TABLE_CLASS = 'download-history-table';

const COPY = {
  title: 'Content Downloads',
  back: 'Back to Part Search',
  description: (figures: number, variations: number, project: string) =>
    `${figures} figure${figures === 1 ? '' : 's'} · ${variations} variation${variations === 1 ? '' : 's'} downloaded · ${project}`,
  emptyTitle: 'No downloads yet',
  emptyDescription:
    'Download history starts from the release date — anything downloaded before then is not shown.',
  emptyCta: 'Browse Part Search',
  selectHint: 'Select figures or variations to create a submittal package or a BOM.',
  selectionSummary: (figures: number, variations: number) => {
    const figureLabel = `${figures} figure${figures === 1 ? '' : 's'}`;
    const variationLabel = `${variations} variation${variations === 1 ? '' : 's'}`;
    return `${figureLabel}, ${variationLabel} selected`;
  },
  clearSelection: 'Clear selection',
  createSubmittal: 'Create Submittal Package',
  createBom: 'Create BOM',
  needSelection: 'Select at least one figure or variation.',
  needBomAccess: 'You need BOM create access to do this.',
  needSubmittalAccess: 'You need Submittal create access to do this.',
  colPart: 'Part / figure',
  colType: 'Type',
  colFormats: 'Formats',
  colDownloaded: 'Downloaded',
  colBy: 'By',
  typeFigure: 'Figure',
  typeVariation: 'Variation',
  figurePrefix: (value: string) => `Fig. ${value}`,
  skuPrefix: (value: string) => `SKU ${value}`,
  variantsOnly: 'Variants only',
};

function formatDownloadedDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function GatedActionButton({
  label,
  disabled,
  tooltip,
  type,
  onClick,
}: {
  label: string;
  disabled: boolean;
  tooltip: string;
  type?: 'primary' | 'default';
  onClick: () => void;
}) {
  const button = (
    <Button
      type={type}
      size="large"
      disabled={disabled}
      aria-disabled={disabled}
      onClick={disabled ? undefined : onClick}
    >
      {label}
    </Button>
  );

  return disabled ? (
    <Tooltip title={tooltip}>
      <span>{button}</span>
    </Tooltip>
  ) : (
    button
  );
}

function RepeatTag({ count, firstAt, latestAt }: { count: number; firstAt: string; latestAt: string }) {
  if (count <= 1) return null;
  return (
    <Tooltip title={`First ${formatDownloadedDate(firstAt)} · Latest ${formatDownloadedDate(latestAt)}`}>
      <span>
        <HydraTag bordered={false}>×{count}</HydraTag>
      </span>
    </Tooltip>
  );
}

function HistoryPartCell({
  row,
  projectId,
}: {
  row: HistoryTableRow;
  projectId: string;
}) {
  const { token } = theme.useToken();
  const isFigure = isHistoryFigureRow(row);
  const code = isFigure ? COPY.figurePrefix(row.figureNumber) : COPY.skuPrefix(row.sku);

  /** Fixed-size thumbnail slot keeps figure and variant names on the same left edge. */
  const thumbSlotStyle = {
    display: 'inline-flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    width: token.controlHeight,
    minWidth: token.controlHeight,
    height: token.controlHeight,
    flexShrink: 0,
  };

  return (
    <Flex align="center" gap={token.marginSM} style={{ minWidth: 0 }}>
      <span style={thumbSlotStyle} aria-hidden={!isFigure}>
        {isFigure ? (
          row.thumbnailUrl ? (
            <Avatar
              shape="square"
              size={token.controlHeight}
              src={row.thumbnailUrl}
              alt=""
              style={{ flexShrink: 0, borderRadius: token.borderRadiusSM }}
            />
          ) : (
            <CatalogThumbnailPlaceholder />
          )
        ) : null}
      </span>
      <Flex align="center" gap={token.marginXS} wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
        <Typography.Text strong ellipsis={{ tooltip: row.name }} style={{ minWidth: 0 }}>
          {row.name}
        </Typography.Text>
        <Typography.Text type="secondary" style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
          · {code}
        </Typography.Text>
        <ActionTrailNewTag module="content" subProjectId={projectId} itemId={row.key} />
      </Flex>
    </Flex>
  );
}

function AttributionCell({
  downloaders,
  compactName,
}: {
  downloaders: { name: string; latestAt: string }[];
  compactName?: string;
}) {
  const { token } = theme.useToken();
  if (downloaders.length === 0) {
    return <Typography.Text type="secondary">{compactName || '—'}</Typography.Text>;
  }
  const primary = downloaders[0];
  const overflow = downloaders.length - 1;
  const tooltip = (
    <Space orientation="vertical" size={token.marginXXS}>
      {downloaders.map((person) => (
        <span key={person.name}>
          {person.name} · {formatDownloadedDate(person.latestAt)}
        </span>
      ))}
    </Space>
  );

  return (
    <Tooltip title={tooltip}>
      <Flex align="center" gap={token.marginXS} style={{ minWidth: 0 }}>
        <Avatar.Group size="small">
          {downloaders.map((person) => (
            <Avatar key={person.name} style={{ backgroundColor: token.colorPrimary }}>
              {initials(person.name)}
            </Avatar>
          ))}
        </Avatar.Group>
        <Typography.Text ellipsis>
          {primary.name}
          {overflow > 0 ? ` +${overflow}` : ''}
        </Typography.Text>
      </Flex>
    </Tooltip>
  );
}

/**
 * Content module download history — two-level figure/variant table replacing the cart (FR-7–FR-13).
 * Pattern: BomPageHeader + shell table card, mixed-granularity selection, gated create actions.
 */
export function DownloadCenterPage() {
  const { token } = theme.useToken();
  const { notification } = App.useApp();
  const { projectId = '' } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  useActionTrailModuleLifecycle('content');
  const { entries, pendingItemIds } = useActionTrail();
  const trailItemIds = useMemo(
    () => new Set(pendingItemIds('content', projectId)),
    [entries, pendingItemIds, projectId],
  );
  const title = projectTitleById(projectId) ?? 'Project';

  const { historyForProject } = useDownloadHistory();
  const liveHistory = historyForProject(projectId);
  const rows = useMemo(
    () => buildDownloadHistoryRows(historyEntriesForProject(projectId, liveHistory)),
    [projectId, liveHistory],
  );

  const figureCount = rows.length;
  const variationCount = rows.reduce((sum, row) => sum + (row.children?.length ?? 0), 0);

  /**
   * Subtle tint + left accent on variant rows — same scoped-`<style>` technique as HomeHubPage's expanded rows.
   * The expand icon rules drop antd's float + single-line `marginTop`, which centres the icon on the first text
   * line rather than the cell. Same `float:none` / `inline-flex` pairing antd uses for its own expand-icon cell.
   */
  const downloadHistoryTableStyles = useMemo(
    () =>
      `.${HISTORY_TABLE_CLASS} .${HISTORY_VARIANT_ROW_CLASS} > td{background:${token.colorFillAlter}!important}` +
      `.${HISTORY_TABLE_CLASS} .${HISTORY_VARIANT_ROW_CLASS} > td:first-child{box-shadow:inset ${token.lineWidthFocus}px 0 0 0 ${token.colorBorderSecondary}!important}` +
      `.${HISTORY_TABLE_CLASS} .ant-table-row-indent + .ant-table-row-expand-icon{float:none;display:inline-flex;vertical-align:middle;margin-top:0}` +
      `.${HISTORY_TABLE_CLASS} td.ant-table-cell-with-append > .ant-flex{display:inline-flex;vertical-align:middle}`,
    [token.colorFillAlter, token.colorBorderSecondary, token.lineWidthFocus],
  );


  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [submittalOpen, setSubmittalOpen] = useState(false);
  const [bomOpen, setBomOpen] = useState(false);

  const access = useContentDownloadAccess();
  const resolution = useMemo(
    () => resolveSelection(rows, selectedRowKeys),
    [rows, selectedRowKeys],
  );
  const granularity = useMemo(
    () => countSelectedGranularity(rows, selectedRowKeys),
    [rows, selectedRowKeys],
  );
  const hasSelection = selectedRowKeys.length > 0;

  const submittalDisabled = !access.canCreateSubmittal || !hasSelection;
  const bomDisabled = !access.canCreateBom || !hasSelection;
  const submittalTooltip = !access.canCreateSubmittal
    ? COPY.needSubmittalAccess
    : COPY.needSelection;
  const bomTooltip = !access.canCreateBom ? COPY.needBomAccess : COPY.needSelection;

  const createActions = (
    <Flex align="center" gap={token.marginXS} wrap="wrap">
      <GatedActionButton
        label={COPY.createSubmittal}
        type="primary"
        disabled={submittalDisabled}
        tooltip={submittalTooltip}
        onClick={() => setSubmittalOpen(true)}
      />
      <GatedActionButton
        label={COPY.createBom}
        disabled={bomDisabled}
        tooltip={bomTooltip}
        onClick={() => setBomOpen(true)}
      />
    </Flex>
  );

  const columns: TableColumnsType<HistoryTableRow> = [
    {
      title: COPY.colPart,
      key: 'part',
      render: (_, row) => <HistoryPartCell row={row} projectId={projectId} />,
    },
    {
      title: COPY.colType,
      key: 'type',
      render: (_, row) => (
        <HydraTag>{isHistoryFigureRow(row) ? COPY.typeFigure : COPY.typeVariation}</HydraTag>
      ),
    },
    {
      title: COPY.colFormats,
      key: 'formats',
      render: (_, row) => {
        if (isHistoryFigureRow(row) && !row.figureLevelDownloaded) {
          return <HydraTag bordered={false}>{COPY.variantsOnly}</HydraTag>;
        }
        return (
          <Flex gap={token.marginXXS} wrap="wrap">
            {row.formats.map((format) => (
              <HydraTag key={format} tone="processing">
                {format}
              </HydraTag>
            ))}
          </Flex>
        );
      },
    },
    {
      title: COPY.colDownloaded,
      key: 'downloaded',
      render: (_, row) => (
        <Flex align="center" gap={token.marginXS} wrap="wrap">
          <Typography.Text>{formatDownloadedDate(row.latestAt)}</Typography.Text>
          <RepeatTag count={row.occurrenceCount} firstAt={row.firstAt} latestAt={row.latestAt} />
        </Flex>
      ),
    },
    {
      title: COPY.colBy,
      key: 'by',
      width: token.controlHeightLG * 8,
      render: (_, row) =>
        isHistoryFigureRow(row) ? (
          <AttributionCell downloaders={row.downloaders} />
        ) : (
          <AttributionCell
            downloaders={row.downloaders.slice(0, 1)}
            compactName={row.downloadedBy}
          />
        ),
    },
  ];

  const emptyState: ReactNode = (
    <Flex
      align="center"
      justify="center"
      style={{ paddingBlock: token.paddingLG, paddingInline: token.paddingMD }}
    >
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <Space orientation="vertical" size={token.marginXXS}>
            <Typography.Text strong>{COPY.emptyTitle}</Typography.Text>
            <Typography.Text type="secondary">{COPY.emptyDescription}</Typography.Text>
          </Space>
        }
      >
        <Button type="primary" size="large" onClick={() => navigate('/search/results?q=all')}>
          {COPY.emptyCta}
        </Button>
      </Empty>
    </Flex>
  );

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to="/search/results?q=all">{COPY.back}</PageBackButton>

      <BomPageHeader
        title={COPY.title}
        description={COPY.description(figureCount, variationCount, title)}
      />

      <Flex
        align="center"
        justify="space-between"
        gap={token.marginMD}
        wrap="wrap"
        style={{
          paddingBlock: token.paddingSM,
          paddingInline: token.paddingMD,
          background: token.colorFillAlter,
          borderRadius: token.borderRadiusLG,
        }}
      >
        <Flex vertical gap={token.marginXXS} style={{ minWidth: 0 }}>
          <Typography.Text>
            {hasSelection
              ? COPY.selectionSummary(granularity.figureCount, granularity.variationCount)
              : COPY.selectHint}
          </Typography.Text>
          {hasSelection ? (
            <Button type="text" onClick={() => setSelectedRowKeys([])}>
              {COPY.clearSelection}
            </Button>
          ) : null}
        </Flex>
        {createActions}
      </Flex>

      <Card style={shellTableCardStyle(token)} styles={{ body: { padding: 0 } }}>
        {figureCount === 0 ? (
          emptyState
        ) : (
          <>
            <style>{downloadHistoryTableStyles}</style>
            <Table<HistoryTableRow>
              className={HISTORY_TABLE_CLASS}
              rowKey="key"
              size="middle"
              pagination={false}
              columns={columns}
              dataSource={rows}
              indentSize={0}
              expandable={{ defaultExpandAllRows: true, childrenColumnName: 'children' }}
              rowSelection={{
                selectedRowKeys,
                onChange: (keys) => setSelectedRowKeys(keys),
                preserveSelectedRowKeys: false,
                checkStrictly: false,
              }}
              scroll={{ x: 'max-content' }}
              styles={shellTableStyles(token)}
              rowClassName={(row) => (isHistoryFigureRow(row) ? '' : HISTORY_VARIANT_ROW_CLASS)}
              onRow={(row) => actionTrailTableRowProps(token, trailItemIds.has(row.key))}
            />
          </>
        )}
      </Card>

      <ContentDownloadDemoControls />

      <CreateSubmittalFromHistoryModal
        open={submittalOpen}
        projectId={projectId}
        partKeys={resolution.partKeys}
        rows={rows}
        onCancel={() => setSubmittalOpen(false)}
        onCreated={({ packageName, partCount }) => {
          setSubmittalOpen(false);
          setSelectedRowKeys([]);
          notification.success({
            message: 'Added to submittal package',
            description: `${partCount} part${partCount === 1 ? '' : 's'} added to “${packageName}”.`,
            btn: (
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  notification.destroy();
                  navigate(`/projects/${projectId}/submittal`);
                }}
              >
                Go to packages
              </Button>
            ),
          });
        }}
      />

      <CreateBomFromHistoryModal
        open={bomOpen}
        projectId={projectId}
        variants={resolution.variants}
        unresolvedFigures={resolution.unresolvedFigures}
        onCancel={() => setBomOpen(false)}
        onCreated={({ bomProjectId, bomProjectName, itemCount, alreadyInBomCount }) => {
          setBomOpen(false);
          setSelectedRowKeys([]);
          const extra =
            alreadyInBomCount > 0
              ? ` ${alreadyInBomCount} already in the BOM were skipped.`
              : '';
          notification.success({
            message: 'Added to BOM',
            description: `${itemCount} item${itemCount === 1 ? '' : 's'} added to “${bomProjectName}”.${extra}`,
            btn: (
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  notification.destroy();
                  navigate(`/bom/projects/${bomProjectId}/workspace`);
                }}
              >
                Open BOM
              </Button>
            ),
          });
        }}
      />
    </Space>
  );
}
