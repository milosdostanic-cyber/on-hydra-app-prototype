import { FilePdfOutlined, FolderOpenOutlined, UploadOutlined } from '@ant-design/icons';
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
  const { entries } = useActionTrail();
  const trailItemIds = useMemo(
    () =>
      new Set(
        entries
          .filter((e) => e.module === 'content' && e.subProjectId === projectId && e.newTagActive)
          .flatMap((e) => e.itemIds),
      ),
    [entries, projectId],
  );
  const title = projectTitleById(projectId) ?? 'Project';
  const { historyForProject } = useDownloadHistory();
  const projectHistory = historyForProject(projectId);

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to="/dashboard">Back to home</PageBackButton>

      <BomPageHeader
        title="Download Center"
        description={`${title} · Content downloads require project context before queuing.`}
      />

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
        {projectHistory.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No downloads queued yet for this project. Add files from part detail or search."
          />
        ) : (
          <List
            size="small"
            dataSource={projectHistory.slice(0, 20)}
            renderItem={(item) => (
              <List.Item style={actionTrailHighlightStyle(token, trailItemIds.has(item.id))}>
                <Flex vertical gap={2} style={{ minWidth: 0, width: '100%' }}>
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

      <Row gutter={[token.marginMD, token.marginMD]}>
        <Col xs={24} md={8}>
          <Card size="small" title="BOM">
            <Typography.Paragraph type="secondary">3 runs · 85% matched</Typography.Paragraph>
            <Button type="link" onClick={() => navigate('/bom')} style={{ padding: 0, height: 'auto' }}>
              Open BOM
            </Button>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card size="small" title="Submittal" extra={<FilePdfOutlined />}>
            <Typography.Paragraph type="secondary">12 docs · 2 pending</Typography.Paragraph>
            <Button
              type="link"
              onClick={() => navigate(`/projects/${projectId}/submittal`)}
              style={{ padding: 0, height: 'auto' }}
            >
              Open submittal
            </Button>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card size="small" title="SeisBrace">
            <Typography.Paragraph type="secondary">Setup module</Typography.Paragraph>
            <Button
              type="link"
              onClick={() => navigate(`/projects/${projectId}/seis-brace`)}
              style={{ padding: 0, height: 'auto' }}
            >
              Open SeisBrace
            </Button>
          </Card>
        </Col>
      </Row>

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
        <Flex gap={token.marginSM} wrap="wrap">
          <Button type="primary" size="large" icon={<UploadOutlined />} onClick={() => navigate('/bom')}>
            Upload BOM
          </Button>
          <Button size="large" onClick={() => navigate('/search/results?q=all')}>
            Part Search
          </Button>
          <Button
            size="large"
            icon={<FolderOpenOutlined />}
            onClick={() => navigate(`/projects/${projectId}/submittal`)}
          >
            New submittal
          </Button>
        </Flex>
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
