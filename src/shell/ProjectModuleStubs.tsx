import { CloudDownloadOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { BomPageHeader } from '../bom/layout/BomPageHeader';
import { useActionTrail, useActionTrailModuleLifecycle } from '../context/ActionTrailContext';
import { useDownloadHistory, useRevitDownloadQueue } from '../search/revitDownloadQueue';
import { ActionTrailNewTag } from '../search/components/ActionTrailNewTag';
import { actionTrailHighlightStyle } from '../search/actionTrailStyles';
import {
  hydraTextStyleToReactCss,
  hydraTitleHeading4,
} from '../theme/hydraTypography';
import { PageBackButton } from './PageBackButton';
import { projectTitleById } from './projectSeed';
import {
  Button,
  Card,
  Empty,
  Flex,
  List,
  Space,
  Tooltip,
  Typography,
  theme,
} from '../ui/antd';

export function SalesBraceModule() {
  const { token } = theme.useToken();
  const { projectId = '' } = useParams<{ projectId: string }>();
  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to={`/projects/${projectId}/content`}>Back to project workspace</PageBackButton>
      <BomPageHeader
        title="Spec"
        description="Sales brace (stub): this level will show design names and brace visuals — a different layout than Submittal / Content, by product design."
      />
    </Space>
  );
}

export function ContentModule() {
  const { token } = theme.useToken();
  const { projectId = '' } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  useActionTrailModuleLifecycle('content');
  const { entries, pendingItemIds } = useActionTrail();
  const trailItemIds = useMemo(
    () => new Set(pendingItemIds('content', projectId)),
    [entries, pendingItemIds, projectId],
  );
  const showQueueHighlight = trailItemIds.size > 0;
  const title = projectTitleById(projectId) ?? 'Project';

  const { items: queueItems, clearQueue, removeItem } = useRevitDownloadQueue();
  const projectQueueItems = useMemo(
    () => queueItems.filter((item) => item.projectId === projectId),
    [queueItems, projectId],
  );

  const { historyForProject } = useDownloadHistory();
  const projectHistory = historyForProject(projectId);

  const handleDownloadAll = () => {
    clearQueue();
  };

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to="/dashboard">Back to home</PageBackButton>

      <BomPageHeader
        title="Download center"
        description={`${title} · Review your queued files, then download as a zip.`}
        actions={
          <Tooltip title="Add files from Part Search">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/search/results?q=all')}
              aria-label="Add files from Part Search"
            />
          </Tooltip>
        }
      />

      {/* Download queue — primary action surface */}
      <Card
        style={actionTrailHighlightStyle(token, showQueueHighlight)}
        title={
          <Flex align="center" gap={token.marginXS}>
            <Typography.Text style={{ ...hydraTextStyleToReactCss(hydraTitleHeading4) }}>
              Download queue
            </Typography.Text>
            {projectQueueItems.length > 0 && (
              <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                {projectQueueItems.length} file{projectQueueItems.length === 1 ? '' : 's'}
              </Typography.Text>
            )}
          </Flex>
        }
        extra={
          projectQueueItems.length > 0 ? (
            <Flex gap={token.marginXS}>
              <Button
                size="small"
                onClick={clearQueue}
                aria-label="Clear queue"
              >
                Clear
              </Button>
              <Button
                type="primary"
                size="small"
                icon={<CloudDownloadOutlined />}
                onClick={handleDownloadAll}
              >
                Download all
              </Button>
            </Flex>
          ) : null
        }
        styles={{
          header: { borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}` },
          body: { padding: token.paddingMD },
        }}
      >
        {projectQueueItems.length === 0 ? (
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
        ) : (
          <List
            size="small"
            dataSource={projectQueueItems}
            renderItem={(item) => (
              <List.Item
                style={actionTrailHighlightStyle(token, trailItemIds.has(item.id))}
                actions={[
                  <Tooltip title="Remove from queue" key="remove">
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${item.fileName} from queue`}
                      danger
                    />
                  </Tooltip>,
                ]}
              >
                <Flex vertical gap={token.marginXXS} style={{ minWidth: 0, flex: 1 }}>
                  <Flex align="center" gap={token.marginXS} wrap="wrap">
                    <Typography.Text strong ellipsis>
                      {item.fileName}
                    </Typography.Text>
                    <ActionTrailNewTag module="content" subProjectId={projectId} itemId={item.id} />
                  </Flex>
                  <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                    {item.kind === 'revit' ? 'Revit' : 'Drawing'} · SKU {item.sku}
                    {item.variationKey ? ` · variant ${item.variationKey}` : ''}
                  </Typography.Text>
                </Flex>
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* Download history — secondary reference */}
      {projectHistory.length > 0 && (
        <Card
          title={
            <Typography.Text style={{ ...hydraTextStyleToReactCss(hydraTitleHeading4) }}>
              Download history
            </Typography.Text>
          }
          styles={{
            header: { borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}` },
            body: { padding: token.paddingMD },
          }}
        >
          <List
            size="small"
            dataSource={projectHistory.slice(0, 20)}
            renderItem={(item) => (
              <List.Item>
                <Flex vertical gap={token.marginXXS} style={{ minWidth: 0, width: '100%' }}>
                  <Typography.Text ellipsis>{item.fileName}</Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                    {item.kind === 'revit' ? 'Revit' : 'Drawing'} · SKU {item.sku}
                    {item.variationKey ? ` · variant ${item.variationKey}` : ''}
                  </Typography.Text>
                </Flex>
              </List.Item>
            )}
          />
        </Card>
      )}
    </Space>
  );
}

export function ProjectReframingProposalModule() {
  const { token } = theme.useToken();
  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to="/dashboard">Back to home</PageBackButton>
      <BomPageHeader
        title="Project Reframing Proposal"
        description="Proposal workspace (stub). Use this route for Project Reframing Proposal flow and content."
      />
    </Space>
  );
}

/** Top-level nav destination — no plug-in content in prototype yet (same stub pattern as Spec). */
export function RevitPlugInModule() {
  const { token } = theme.useToken();
  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to="/dashboard">Back to home</PageBackButton>
      <BomPageHeader
        title="Revit Plug-in"
        description="Plug-in overview, download, installation, and support will live here. No content in this prototype yet."
      />
    </Space>
  );
}

/** Top-level nav destination — no knowledge-center content in prototype yet (same stub pattern as Spec). */
export function KnowledgeCenterModule() {
  const { token } = theme.useToken();
  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to="/dashboard">Back to home</PageBackButton>
      <BomPageHeader
        title="Knowledge Center"
        description="Documentation, guides, and shared resources will live here. No content in this prototype yet."
      />
    </Space>
  );
}
