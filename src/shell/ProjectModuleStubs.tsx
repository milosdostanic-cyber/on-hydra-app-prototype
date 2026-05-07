import { DeleteOutlined, FilePdfOutlined, FolderOpenOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

import { useSubmittalDraft } from '../context/SubmittalDraftContext';
import { PageBackButton } from './PageBackButton';
import { projectTitleById } from './projectSeed';
import {
  Button,
  Card,
  Col,
  Empty,
  Flex,
  List,
  Popconfirm,
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
        Submittal / Content, by product design.
      </Typography.Paragraph>
    </Space>
  );
}

export function SubmittalModule() {
  const { token } = theme.useToken();
  const { projectId = '' } = useParams<{ projectId: string }>();
  const { linesForProject, removeLine } = useSubmittalDraft();
  const lines = linesForProject(projectId);

  if (lines.length === 0) {
    return (
      <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
        <PageBackButton to={`/projects/${projectId}/content`}>Back to project workspace</PageBackButton>
        <Empty
        description={
          <Space orientation="vertical" size={token.marginXS}>
            <Typography.Text>No PDFs in this submittal yet.</Typography.Text>
            <Typography.Text type="secondary">
              Add cut sheets from the catalog or a part page — they appear here for this project.
            </Typography.Text>
          </Space>
        }
      />
      </Space>
    );
  }

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to={`/projects/${projectId}/content`}>Back to project workspace</PageBackButton>
      <Typography.Title level={4} style={{ margin: 0 }}>
        Submittal manager
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
        Draft lines for this project (stub). Same underlying catalog as Content; actions here focus on the
        submittal package.
      </Typography.Paragraph>
      <List
        bordered
        dataSource={lines}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Popconfirm
                key="remove"
                title="Remove this PDF from the draft?"
                okText="Remove"
                onConfirm={() => removeLine(projectId, item.id)}
              >
                <Button type="text" danger icon={<DeleteOutlined />} aria-label="Remove from submittal" />
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta title={item.title} description={`Cut sheet · ${item.partSku}`} />
          </List.Item>
        )}
      />
    </Space>
  );
}

export function ContentModule() {
  const { token } = theme.useToken();
  const { projectId = '' } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const title = projectTitleById(projectId) ?? 'Project';

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to="/projects">Back to all projects</PageBackButton>
      <Typography.Title level={3} style={{ margin: 0 }}>
        {title}
      </Typography.Title>
      <Typography.Text type="secondary">
        Client workspace · ID {projectId}
      </Typography.Text>

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

      <Card title="Recent activity" size="small">
        <Space orientation="vertical" size={token.marginSM}>
          <Typography.Text>BOM &quot;Mechanical Piping&quot; — 85% matched</Typography.Text>
          <Typography.Text type="secondary">Submittal Rev 2 — exported 2h ago</Typography.Text>
          <Typography.Text type="secondary">SeisBrace layout — draft saved</Typography.Text>
        </Space>
      </Card>

      <Card title="Quick actions" size="small">
        <Flex gap={token.marginSM} wrap="wrap">
          <Button icon={<UploadOutlined />} onClick={() => navigate('/bom')}>
            Upload BOM
          </Button>
          <Button onClick={() => navigate('/catalog')}>Browse catalog</Button>
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
      <PageBackButton to="/projects">Back to all projects</PageBackButton>
      <Typography.Title level={3} style={{ margin: 0 }}>
        Project Reframing Proposal
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
        Proposal workspace (stub). Use this route for Project Reframing Proposal flow and content.
      </Typography.Paragraph>
    </Space>
  );
}
