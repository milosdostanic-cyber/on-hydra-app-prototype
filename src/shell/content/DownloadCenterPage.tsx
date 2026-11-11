import { useMemo, useState, type Key, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { BomPageHeader } from '../../bom/layout/BomPageHeader';
import { CatalogThumbnailPlaceholder } from '../../catalog/CatalogThumbnailPlaceholder';
import { useActionTrail, useActionTrailModuleLifecycle } from '../../context/ActionTrailContext';
import { actionTrailTableRowProps } from '../../search/actionTrailStyles';
import { useDownloadHistory } from '../../search/revitDownloadQueue';
import { contentFileTypeTagPreset } from '../../search/contentFileTypeTags';
import { HydraColorfulTag, HydraTag } from '../../ui/HydraTag';
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
import { hydraBaseNormal, hydraBaseStrong, hydraTextStyleToReactCss } from '../../theme/hydraTypography';

/** Ties variant rows visually to their parent figure — antd nesting alone reads as sibling rows once expanded. */
const HISTORY_VARIANT_ROW_CLASS = 'download-history-variant-row';
const HISTORY_TABLE_CLASS = 'download-history-table';
const HISTORY_INDENT = (token: ReturnType<typeof theme.useToken>['token']) => token.marginLG;

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
  clearSelection: 'Clear Selection',
  createSubmittal: 'Create Submittal Package',
  createBom: 'Create BOM',
  needSelection: 'Select at least one figure or variation.',
  needBomAccess: 'You need BOM create access to do this.',
  needSubmittalAccess: 'You need Submittal create access to do this.',
  colPart: 'Part / figure',
  colFigureNumber: 'Figure Number',
  colFormats: 'Formats',
  colDownloaded: 'Downloaded',
  colBy: 'By',
  skuPrefix: (value: string) => `SKU ${value}`,
  variantsOnly: 'Variants only',
  roleVariation: 'Variation',
  empty: '—',
};

function formatDownloadedDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Part actions panel order; unknown codes follow in their original order. */
const FORMAT_ORDER = ['RFA', 'PDF', 'DWG', 'STEP'];

function sortFormats(formats: string[]): string[] {
  const known = FORMAT_ORDER.filter((code) => formats.includes(code));
  const unknown = formats.filter((code) => !FORMAT_ORDER.includes(code));
  return [...known, ...unknown];
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
  /** Figure rows carry their code in the Figure Number column; variants are identified by SKU. */
  const code = isFigure ? '' : COPY.skuPrefix(row.sku);

  /**
   * The figure name starts after its thumbnail. The variation indent is smaller than that slot, so the
   * variation block needs the remainder to start on the same left edge.
   */
  const nameAlignInset = isFigure
    ? 0
    : Math.max(0, token.controlHeight + token.marginSM - HISTORY_INDENT(token));
  /**
   * antd renders the row indent and expand icon inline before this cell; without a bounded width the
   * content wraps below the icon. Icon box = `controlInteractiveSize + lineWidth`, trailing gap = `paddingXS`.
   */
  const reservedInline =
    (isFigure ? 0 : HISTORY_INDENT(token) + nameAlignInset) +
    token.controlInteractiveSize +
    token.lineWidth +
    token.paddingXS;

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
    <Flex
      align="center"
      gap={token.marginSM}
      style={{
        minWidth: 0,
        width: `calc(100% - ${reservedInline}px)`,
        marginInlineStart: nameAlignInset,
      }}
    >
      {isFigure ? (
        <span style={thumbSlotStyle}>
          {row.thumbnailUrl ? (
            <Avatar
              shape="square"
              size={token.controlHeight}
              src={row.thumbnailUrl}
              alt=""
              style={{ flexShrink: 0, borderRadius: token.borderRadiusSM }}
            />
          ) : (
            <CatalogThumbnailPlaceholder />
          )}
        </span>
      ) : null}
      <Flex align="center" gap={token.marginXS} wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
        <Typography.Text
          type={isFigure ? undefined : 'secondary'}
          ellipsis={{ tooltip: row.name }}
          style={{ minWidth: 0, ...hydraTextStyleToReactCss(hydraBaseNormal) }}
        >
          {row.name}
        </Typography.Text>
        {isFigure ? null : (
          <HydraTag bordered={false}>{COPY.roleVariation}</HydraTag>
        )}
        {isFigure && row.figureLevelDownloaded ? <HydraTag>Figure-level file</HydraTag> : null}
        {code ? (
          <Typography.Text type="secondary" style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
            · {code}
          </Typography.Text>
        ) : null}
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
   * While a figure is open, one primary line runs down the left of that figure and its variations.
   * The mark overlaps each row border by `lineWidth`, so the row separators do not cut it.
   * The fill on variation rows steps aside for hover and selection.
   * The expand icon rules drop antd's float + single-line `marginTop`, which centres the icon on the first text
   * line rather than the cell. Same `float:none` / `inline-flex` pairing antd uses for its own expand-icon cell.
   */
  const groupMark =
    `content:"";position:absolute;inset-inline-start:0;top:0;bottom:-${token.lineWidth}px;` +
    `width:${token.lineWidthBold}px;background:${token.colorPrimary};z-index:1;pointer-events:none`;
  const downloadHistoryTableStyles = useMemo(
    () =>
      `.${HISTORY_TABLE_CLASS} tr:has(.ant-table-row-expand-icon-expanded) > td:first-child,` +
      `.${HISTORY_TABLE_CLASS} .${HISTORY_VARIANT_ROW_CLASS} > td:first-child{position:relative;overflow:visible}` +
      `.${HISTORY_TABLE_CLASS} tr:has(.ant-table-row-expand-icon-expanded) > td:first-child::after,` +
      `.${HISTORY_TABLE_CLASS} .${HISTORY_VARIANT_ROW_CLASS} > td:first-child::after{${groupMark}}` +
      `.${HISTORY_TABLE_CLASS} tr:has(.ant-table-row-expand-icon-expanded):not(.ant-table-row-selected):not(:hover) > td{background:color-mix(in srgb, ${token.colorPrimaryBg} 45%, ${token.colorBgContainer})}` +
      `.${HISTORY_TABLE_CLASS} .${HISTORY_VARIANT_ROW_CLASS}:not(.ant-table-row-selected):not(:hover) > td{background:${token.colorFillAlter}}` +
      `.${HISTORY_TABLE_CLASS} .ant-table-row-indent + .ant-table-row-expand-icon{float:none;display:inline-flex;vertical-align:middle;margin-top:0}` +
      `.${HISTORY_TABLE_CLASS} td.ant-table-cell-with-append{white-space:nowrap}` +
      `.${HISTORY_TABLE_CLASS} td.ant-table-cell-with-append > .ant-flex{display:inline-flex;vertical-align:middle}`,
    [groupMark, token.colorFillAlter, token.colorPrimaryBg, token.colorBgContainer],
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

  /** Clear sits last in the action group — same order as the BOM workspace bulk-selection toolbar. */
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
      {hasSelection ? (
        <Button size="large" onClick={() => setSelectedRowKeys([])}>
          {COPY.clearSelection}
        </Button>
      ) : null}
    </Flex>
  );

  /**
   * Every column except `part` is width-pinned so expanding/collapsing or selecting rows can never
   * reflow the grid — `part` is the single flexible column that absorbs the remaining space.
   */
  const columnWidth = {
    selection: token.controlHeight,
    partMin: token.controlHeightLG * 8,
    figureNumber: token.controlHeight * 4,
    formats: token.controlHeightLG * 5,
    downloaded: token.controlHeightLG * 4,
    by: token.controlHeightLG * 6,
  };
  const tableMinWidth =
    columnWidth.selection +
    columnWidth.partMin +
    columnWidth.figureNumber +
    columnWidth.formats +
    columnWidth.downloaded +
    columnWidth.by;

  const columns: TableColumnsType<HistoryTableRow> = [
    {
      title: COPY.colPart,
      key: 'part',
      render: (_, row) => <HistoryPartCell row={row} projectId={projectId} />,
    },
    {
      title: COPY.colFigureNumber,
      key: 'figureNumber',
      width: columnWidth.figureNumber,
      render: (_, row) =>
        row.figureNumber ? (
          <Typography.Text
            type={isHistoryFigureRow(row) ? undefined : 'secondary'}
            ellipsis={{ tooltip: row.figureNumber }}
          >
            {row.figureNumber}
          </Typography.Text>
        ) : (
          <Typography.Text type="secondary">{COPY.empty}</Typography.Text>
        ),
    },
    {
      title: COPY.colFormats,
      key: 'formats',
      width: columnWidth.formats,
      render: (_, row) => {
        if (isHistoryFigureRow(row) && !row.figureLevelDownloaded) {
          return <HydraTag bordered={false}>{COPY.variantsOnly}</HydraTag>;
        }
        return (
          <Flex gap={token.marginXXS} wrap="wrap">
            {sortFormats(row.formats).map((format) => {
              const preset = contentFileTypeTagPreset(format);
              return preset ? (
                <HydraColorfulTag key={format} preset={preset} bordered>
                  {format}
                </HydraColorfulTag>
              ) : (
                <HydraTag key={format}>{format}</HydraTag>
              );
            })}
          </Flex>
        );
      },
    },
    {
      title: COPY.colDownloaded,
      key: 'downloaded',
      width: columnWidth.downloaded,
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
      width: columnWidth.by,
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
            <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>{COPY.emptyTitle}</Typography.Text>
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
        {/* Single line in both states so the table never shifts vertically on select. */}
        <Typography.Text type="secondary" style={{ minWidth: 0 }}>
          {hasSelection
            ? COPY.selectionSummary(granularity.figureCount, granularity.variationCount)
            : COPY.selectHint}
        </Typography.Text>
        {createActions}
      </Flex>

      <Card variant="borderless" style={shellTableCardStyle(token)} styles={{ body: { padding: 0 } }}>
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
              indentSize={HISTORY_INDENT(token)}
              expandable={{ defaultExpandAllRows: true, childrenColumnName: 'children' }}
              rowSelection={{
                selectedRowKeys,
                onChange: (keys) => setSelectedRowKeys(keys),
                preserveSelectedRowKeys: false,
                checkStrictly: false,
                columnWidth: columnWidth.selection,
              }}
              /** `fixed` + pinned widths: auto layout re-measured the grid on every expand/collapse. */
              tableLayout="fixed"
              scroll={{ x: tableMinWidth }}
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
