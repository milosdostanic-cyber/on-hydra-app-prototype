import { DeleteOutlined } from '@ant-design/icons';
import { Outlet, useParams } from 'react-router-dom';

import { useSubmittalDraft } from '../context/SubmittalDraftContext';
import { PageBackButton } from './PageBackButton';
import { Button, Empty, List, Popconfirm, Space, Typography, theme } from '../ui/antd';

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
      <Typography.Title level={3} style={{ margin: 0 }}>
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

/** Child routes under `/projects/:projectId/content/*` render catalog UI. */
export function ContentModule() {
  return <Outlet />;
}
