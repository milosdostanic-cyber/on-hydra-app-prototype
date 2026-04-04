import { Link, useNavigate, useParams } from 'react-router-dom';

import { BomFlowStepper } from '../components/BomFlowStepper';
import { BomPageHeader } from '../layout/BomPageHeader';
import { bomProjectTitleById, mockMatchResults, mockParsedItems } from '../data/mockData';
import { Button, Card, Progress, Space, Table, Typography, theme } from '../../ui/antd';
import type { TableColumnsType } from '../../ui/antd';
import type { BomMatchResult } from '../data/types';
import { BomRiskTag } from '../components/BomTags';

export function BomMatchingPage() {
  const { token } = theme.useToken();
  const { bomProjectId = '' } = useParams<{ bomProjectId: string }>();
  const navigate = useNavigate();
  const projectTitle = bomProjectTitleById(bomProjectId) ?? 'BOM project';

  const columns: TableColumnsType<BomMatchResult> = [
    {
      title: 'Line',
      key: 'line',
      width: 64,
      render: (_, row) => {
        const line = mockParsedItems.find((i) => i.id === row.itemId)?.rowNumber ?? '—';
        return line;
      },
    },
    {
      title: 'Original request',
      dataIndex: 'originalRequest',
      key: 'originalRequest',
    },
    {
      title: 'Top match',
      key: 'top',
      render: (_, row) =>
        row.topMatch ? (
          <Space orientation="vertical" size={token.marginXXS}>
            <Typography.Text strong>{row.topMatch.partNumber}</Typography.Text>
            <Typography.Text type="secondary">{row.topMatch.description}</Typography.Text>
            <Progress percent={row.topMatch.matchConfidence} size="small" />
          </Space>
        ) : (
          '—'
        ),
    },
    {
      title: 'Risk',
      key: 'risk',
      width: 120,
      render: (_, row) =>
        row.topMatch ? <BomRiskTag risk={row.topMatch.substitutionRisk} /> : '—',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_, row) => (
        <Button
          type="link"
          style={{ padding: 0 }}
          onClick={() => navigate(`/bom/projects/${bomProjectId}/items/${row.itemId}/narrow`)}
        >
          Refine
        </Button>
      ),
    },
  ];

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <BomFlowStepper activeStep={1} projectLabel={projectTitle} />
      <BomPageHeader
        title="Matching results"
        description={`Suggested catalog matches for ${projectTitle}. Open a line to run guided narrowing.`}
      />
      <Card styles={{ body: { padding: 0 } }}>
        <Table<BomMatchResult>
          rowKey="itemId"
          columns={columns}
          dataSource={mockMatchResults}
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
      </Card>
      <Space wrap>
        <Button type="primary" onClick={() => navigate(`/bom/projects/${bomProjectId}/workspace`)}>
          Skip to workspace
        </Button>
        <Button onClick={() => navigate(`/bom/projects/${bomProjectId}/parsing-review`)}>
          Back to parsing
        </Button>
        <Link to="/bom">
          <Button>BOM home</Button>
        </Link>
      </Space>
    </Space>
  );
}
