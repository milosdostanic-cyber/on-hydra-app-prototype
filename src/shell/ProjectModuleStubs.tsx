import { FilePdfOutlined, FolderOpenOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { BomPageHeader } from '../bom/layout/BomPageHeader';
import { useActionTrail, useActionTrailModuleLifecycle } from '../context/ActionTrailContext';
import { useDownloadHistory } from '../search/revitDownloadQueue';
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
  Col,
  Empty,
  Flex,
  List,
  Row,
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
        description="Sales brace (stub): this level will show design names and brace visuals — a different layout than Submittal / Download Center, by product design."
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
  const showHistoryHighlight = trailItemIds.size > 0;
  const title = projectTitleById(projectId) ?? 'Project';
  const { historyForProject } = useDownloadHistory();
  const projectHistory = historyForProject(projectId);

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to="/dashboard">Back to home</PageBackButton>

      <BomPageHeader
        title="Download Center"
        description={`${title} · Queued files from part search and detail. Direct downloads do not appear here.`}
        actions={
          <Tooltip title="Search parts">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/search/results?q=all')}
              aria-label="Search parts"
            />
          </Tooltip>
        }
      />

      <Card
        style={actionTrailHighlightStyle(token, showHistoryHighlight)}
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
        {projectHistory.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No downloads queued yet. Use + above or add files from part detail."
          />
        ) : (
          <List
            size="small"
            dataSource={projectHistory.slice(0, 20)}
            renderItem={(item) => (
              <List.Item style={actionTrailHighlightStyle(token, trailItemIds.has(item.id))}>
                <Flex vertical gap={token.marginXXS} style={{ minWidth: 0, width: '100%' }}>
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

      <Card
        title={
          <Typography.Text style={{ ...hydraTextStyleToReactCss(hydraTitleHeading4) }}>
            Related modules
          </Typography.Text>
        }
        styles={{
          header: { borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}` },
          body: { padding: token.paddingMD },
        }}
      >
        <Row gutter={[token.marginMD, token.marginMD]}>
          <Col xs={24} sm={8}>
            <Flex vertical gap={token.marginXS}>
              <Typography.Text strong>BOM</Typography.Text>
              <Typography.Text type="secondary">3 runs · 85% matched</Typography.Text>
              <Button type="link" onClick={() => navigate('/bom')} style={{ padding: 0, height: 'auto', alignSelf: 'flex-start' }}>
                Open BOM
              </Button>
            </Flex>
          </Col>
          <Col xs={24} sm={8}>
            <Flex vertical gap={token.marginXS}>
              <Flex align="center" gap={token.marginXXS}>
                <Typography.Text strong>Submittal</Typography.Text>
                <FilePdfOutlined style={{ color: token.colorTextSecondary }} />
              </Flex>
              <Typography.Text type="secondary">12 docs · 2 pending</Typography.Text>
              <Button
                type="link"
                onClick={() => navigate(`/projects/${projectId}/submittal`)}
                style={{ padding: 0, height: 'auto', alignSelf: 'flex-start' }}
              >
                Open submittal
              </Button>
            </Flex>
          </Col>
          <Col xs={24} sm={8}>
            <Flex vertical gap={token.marginXS}>
              <Typography.Text strong>SeisBrace</Typography.Text>
              <Typography.Text type="secondary">Setup module</Typography.Text>
              <Button
                type="link"
                onClick={() => navigate(`/projects/${projectId}/seis-brace`)}
                style={{ padding: 0, height: 'auto', alignSelf: 'flex-start' }}
              >
                Open SeisBrace
              </Button>
            </Flex>
          </Col>
        </Row>
      </Card>

      <Card
        title={
          <Typography.Text style={{ ...hydraTextStyleToReactCss(hydraTitleHeading4) }}>
            Quick actions
          </Typography.Text>
        }
        styles={{
          header: { borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}` },
          body: { padding: token.paddingMD },
        }}
      >
        <Space size={token.marginSM} wrap>
          <Tooltip title="Upload BOM">
            <Button type="default" icon={<UploadOutlined />} onClick={() => navigate('/bom')} aria-label="Upload BOM" />
          </Tooltip>
          <Tooltip title="Part search">
            <Button icon={<FolderOpenOutlined />} onClick={() => navigate('/search/results?q=all')} aria-label="Part search" />
          </Tooltip>
          <Tooltip title="New submittal package">
            <Button
              icon={<PlusOutlined />}
              onClick={() => navigate(`/projects/${projectId}/submittal`)}
              aria-label="New submittal package"
            />
          </Tooltip>
        </Space>
      </Card>
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
