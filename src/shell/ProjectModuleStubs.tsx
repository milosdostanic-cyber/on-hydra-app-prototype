import { FilePdfOutlined, FolderOpenOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

import { useDownloadHistory } from '../search/revitDownloadQueue';
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
      <Typography.Paragraph style={{ margin: 0, color: token.colorTextSecondary }}>
        Sales brace (stub): this level will show design names and brace visuals — a different layout than
        Submittal / Download Center, by product design.
      </Typography.Paragraph>
    </Space>
  );
}

export function ContentModule() {
  const { token } = theme.useToken();
  const { projectId = '' } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const title = projectTitleById(projectId) ?? 'Project';
  const { historyForProject } = useDownloadHistory();
  const projectHistory = historyForProject(projectId);

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to="/dashboard">Back to home</PageBackButton>
      <Typography.Title level={3} style={{ margin: 0 }}>
        Download Center
      </Typography.Title>
      <Typography.Text type="secondary">
        {title} · Content downloads require project context before queuing.
      </Typography.Text>

      <Card title="Download history" size="small">
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
              <List.Item>
                <Flex vertical gap={2} style={{ minWidth: 0 }}>
                  <Typography.Text strong ellipsis>
                    {item.fileName}
                  </Typography.Text>
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

      <Card title="Quick actions" size="small">
        <Flex gap={token.marginSM} wrap="wrap">
          <Button icon={<UploadOutlined />} onClick={() => navigate('/bom')}>
            Upload BOM
          </Button>
          <Button onClick={() => navigate('/search/results?q=all')}>Part Search</Button>
          <Button icon={<FolderOpenOutlined />} onClick={() => navigate(`/projects/${projectId}/submittal`)}>
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
      <Typography.Title level={3} style={{ margin: 0 }}>
        Project Reframing Proposal
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
        Proposal workspace (stub). Use this route for Project Reframing Proposal flow and content.
      </Typography.Paragraph>
    </Space>
  );
}
