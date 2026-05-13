import { DeleteOutlined, FilePdfOutlined, FolderOpenOutlined, UploadOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { FeaturedParts } from '../catalog/FeaturedParts';
import { CATALOG_QUICK_CATEGORIES } from '../catalog/catalogDemoData';
import { useSubmittalDraft } from '../context/SubmittalDraftContext';
import { PageBackButton } from './PageBackButton';
import { projectTitleById } from './projectSeed';
import {
  AppSearchInput,
  Button,
  Card,
  Col,
  Empty,
  Flex,
  List,
  Popconfirm,
  Row,
  Space,
  Tag,
  Typography,
  theme,
} from '../ui/antd';

const CONTENT_FEATURED_NOTE =
  'Same global featured list as the product catalog landing page (PRD: not per-project).';

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
  const [contentSearch, setContentSearch] = useState('');

  const goCatalogResults = (query?: string) => {
    const next = (query ?? contentSearch).trim() || 'all';
    navigate(`/catalog/results?q=${encodeURIComponent(next)}`);
  };

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to="/projects">Back to all projects</PageBackButton>
      <Typography.Title level={3} style={{ margin: 0 }}>
        {title}
      </Typography.Title>
      <Typography.Text type="secondary">
        Client workspace · ID {projectId}
      </Typography.Text>

      <div>
        <Flex wrap="wrap" gap={token.margin} align="flex-end" style={{ marginBottom: token.marginMD }}>
          <AppSearchInput
            allowClear
            placeholder="Search ASC parts by SKU, figure, or keyword…"
            value={contentSearch}
            onChange={(e) => setContentSearch(e.target.value)}
            onPressEnter={() => goCatalogResults()}
            style={{ minWidth: token.controlHeight * 10, flex: 1 }}
          />
          <Button type="primary" onClick={() => goCatalogResults()}>
            Search catalog
          </Button>
        </Flex>

        <FeaturedParts contextNote={CONTENT_FEATURED_NOTE} />

        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: token.marginXS }}>
          Quick browse by category
        </Typography.Text>
        <Flex wrap="wrap" gap={token.marginXS}>
          {CATALOG_QUICK_CATEGORIES.map((cat) => (
            <Tag
              key={cat}
              style={{ cursor: 'pointer', margin: 0, paddingBlock: token.paddingXXS }}
              onClick={() => goCatalogResults(cat)}
            >
              {cat}
            </Tag>
          ))}
        </Flex>
      </div>

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
