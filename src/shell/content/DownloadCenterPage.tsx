import { DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { BomPageHeader } from '../../bom/layout/BomPageHeader';
import { CatalogThumbnailPlaceholder } from '../../catalog/CatalogThumbnailPlaceholder';
import { useActionTrail, useActionTrailModuleLifecycle } from '../../context/ActionTrailContext';
import { actionTrailTableRowProps } from '../../search/actionTrailStyles';
import { ActionTrailNewTag } from '../../search/components/ActionTrailNewTag';
import {
  type DownloadQueueItem,
  useDownloadHistory,
  useRevitDownloadQueue,
} from '../../search/revitDownloadQueue';
import {
  hydraTextStyleToReactCss,
  hydraTitleHeading4,
} from '../../theme/hydraTypography';
import {
  App,
  Avatar,
  Button,
  Card,
  Empty,
  Flex,
  List,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  theme,
  type TableColumnsType,
} from '../../ui/antd';
import { PageBackButton } from '../PageBackButton';
import { projectTitleById } from '../projectSeed';
import { shellTableCardStyle, shellTableStyles } from '../shellTablePatterns';

type CategoryRow = {
  key: string;
  categoryName: string;
  partCount: number;
};

function fileBadgeLabel(item: DownloadQueueItem): string {
  if (item.fileType) return item.fileType.toUpperCase();
  if (item.kind === 'revit') return 'RFA';
  const ext = item.fileName.split('.').pop();
  return (ext ?? 'FILE').toUpperCase();
}

function partDisplayName(item: DownloadQueueItem): string {
  return item.displayName?.trim() || item.fileName;
}

/**
 * Content module Download Center — queued files table, category empty state, download footer.
 * Pattern: Submittal `PackageCard` table + `shellTablePatterns` card chrome.
 */
export function DownloadCenterPage() {
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const { projectId = '' } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  useActionTrailModuleLifecycle('content');
  const { entries, pendingItemIds } = useActionTrail();
  const trailItemIds = useMemo(
    () => new Set(pendingItemIds('content', projectId)),
    [entries, pendingItemIds, projectId],
  );
  const title = projectTitleById(projectId) ?? 'Project';

  const { items: queueItems, clearQueue, removeItem } = useRevitDownloadQueue();
  const projectQueueItems = useMemo(
    () => queueItems.filter((item) => item.projectId === projectId),
    [queueItems, projectId],
  );

  const { historyForProject } = useDownloadHistory();
  const projectHistory = historyForProject(projectId);

  const partsCount = projectQueueItems.length;
  const groupsCount = 0;
  const categoryRows: CategoryRow[] = [];

  const handleDownloadAll = () => {
    if (partsCount === 0) return;
    message.success(
      `Downloading ${partsCount} file${partsCount === 1 ? '' : 's'} as zip (stub) · ${title}.`,
    );
    clearQueue();
  };

  const handleClearAll = () => {
    clearQueue();
    message.info('Download queue cleared.');
  };

  const partColumns: TableColumnsType<DownloadQueueItem> = [
    {
      title: 'Part Name',
      key: 'partName',
      render: (_, row) => (
        <Flex align="flex-start" gap={token.marginSM} style={{ minWidth: 0 }}>
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
          <Flex vertical gap={token.marginXXS} style={{ minWidth: 0, flex: 1 }}>
            <Flex align="center" gap={token.marginXS} wrap="wrap">
              <Typography.Text strong ellipsis={{ tooltip: partDisplayName(row) }}>
                {partDisplayName(row)}
              </Typography.Text>
              <ActionTrailNewTag module="content" subProjectId={projectId} itemId={row.id} />
            </Flex>
            <Tag color="purple" style={{ width: 'fit-content', marginInlineEnd: 0 }}>
              {fileBadgeLabel(row)}
            </Tag>
          </Flex>
        </Flex>
      ),
    },
    {
      title: 'Type',
      key: 'type',
      width: 120,
      render: (_, row) => (
        <Tag style={{ marginInlineEnd: 0 }}>{row.variationKey ? 'Variation' : 'Part'}</Tag>
      ),
    },
    {
      title: 'Figure Number',
      key: 'figureNumber',
      width: 140,
      render: (_, row) => (
        <Typography.Text type="secondary">{row.figureNumber?.trim() || ''}</Typography.Text>
      ),
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 140,
    },
    {
      title: '',
      key: 'remove',
      width: 48,
      render: (_, row) => (
        <Tooltip title="Remove from queue">
          <Button
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => removeItem(row.id)}
            aria-label={`Remove ${partDisplayName(row)} from queue`}
            danger
          />
        </Tooltip>
      ),
    },
  ];

  const categoryColumns: TableColumnsType<CategoryRow> = [
    { title: 'Category Name', dataIndex: 'categoryName', key: 'categoryName' },
    { title: 'Number of parts', dataIndex: 'partCount', key: 'partCount', width: 160 },
  ];

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to="/search/results?q=all">Back to Part Search</PageBackButton>

      <BomPageHeader
        title="Download Center"
        description={`${partsCount} Individual Parts / Variations · ${groupsCount} Groups · ${title}`}
        actions={
          <Button
            icon={<DeleteOutlined />}
            onClick={handleClearAll}
            disabled={partsCount === 0}
            aria-label="Clear all items"
          >
            Clear all Items
          </Button>
        }
      />

      <Card
        style={shellTableCardStyle(token)}
        styles={{ body: { padding: 0 } }}
      >
        {partsCount === 0 ? (
          <Flex
            align="center"
            justify="center"
            style={{ paddingBlock: token.paddingLG, paddingInline: token.paddingMD }}
          >
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span>
                  Queue is empty.{' '}
                  <Typography.Link onClick={() => navigate('/search/results?q=all')}>
                    Add files from Part Search.
                  </Typography.Link>
                </span>
              }
            />
          </Flex>
        ) : (
          <Table<DownloadQueueItem>
            rowKey="id"
            size="middle"
            pagination={false}
            columns={partColumns}
            dataSource={projectQueueItems}
            styles={shellTableStyles(token)}
            onRow={(row) => actionTrailTableRowProps(token, trailItemIds.has(row.id))}
          />
        )}

        <Table<CategoryRow>
          rowKey="key"
          size="middle"
          pagination={false}
          columns={categoryColumns}
          dataSource={categoryRows}
          locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No data" /> }}
          styles={shellTableStyles(token)}
        />

        <Flex
          align="center"
          justify="space-between"
          gap={token.marginMD}
          wrap="wrap"
          style={{
            paddingBlock: token.paddingMD,
            paddingInline: token.paddingLG,
            background: token.colorPrimaryBg,
            borderTop: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
          }}
        >
          <Flex vertical gap={token.marginXXS}>
            <Typography.Text strong>Total: {partsCount} items</Typography.Text>
            <Typography.Text type="secondary">
              {partsCount === 0
                ? 'No parts / variations queued'
                : `${partsCount} part${partsCount === 1 ? '' : 's'} / variations will be downloaded`}
            </Typography.Text>
          </Flex>
          <Button
            type="primary"
            size="large"
            icon={<DownloadOutlined />}
            onClick={handleDownloadAll}
            disabled={partsCount === 0}
          >
            Download All Files
          </Button>
        </Flex>
      </Card>

      {projectHistory.length > 0 ? (
        <Card
          title={
            <Typography.Text style={{ ...hydraTextStyleToReactCss(hydraTitleHeading4) }}>
              Download history
            </Typography.Text>
          }
          styles={{
            header: {
              borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
            },
            body: { padding: token.paddingMD },
          }}
        >
          <List
            size="small"
            dataSource={projectHistory.slice(0, 20)}
            renderItem={(item) => (
              <List.Item>
                <Flex vertical gap={token.marginXXS} style={{ minWidth: 0, width: '100%' }}>
                  <Typography.Text ellipsis>
                    {item.displayName?.trim() || item.fileName}
                  </Typography.Text>
                  <Typography.Text type="secondary">
                    {item.kind === 'revit' ? 'Revit' : 'Drawing'} · SKU {item.sku}
                    {item.variationKey ? ` · variant ${item.variationKey}` : ''}
                  </Typography.Text>
                </Flex>
              </List.Item>
            )}
          />
        </Card>
      ) : null}
    </Space>
  );
}
