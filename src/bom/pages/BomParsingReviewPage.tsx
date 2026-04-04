import { useParams, Link, useNavigate } from 'react-router-dom';

import { BomFlowStepper } from '../components/BomFlowStepper';
import { BomPageHeader } from '../layout/BomPageHeader';
import { mockParsedItems, bomProjectTitleById } from '../data/mockData';
import type { BomItem } from '../data/types';
import { BomConfidenceTag } from '../components/BomTags';
import { Button, Card, Space, Table, theme } from '../../ui/antd';
import type { TableColumnsType } from '../../ui/antd';

export function BomParsingReviewPage() {
  const { token } = theme.useToken();
  const { bomProjectId = '' } = useParams<{ bomProjectId: string }>();
  const navigate = useNavigate();
  const title = bomProjectTitleById(bomProjectId) ?? 'BOM project';

  const columns: TableColumnsType<BomItem> = [
    { title: '#', dataIndex: 'rowNumber', key: 'rowNumber', width: 56 },
    { title: 'Original input', dataIndex: 'originalInput', key: 'originalInput' },
    { title: 'Parsed description', dataIndex: 'parsedDescription', key: 'parsedDescription' },
    { title: 'Size', dataIndex: 'size', key: 'size' },
    { title: 'Pressure', dataIndex: 'pressureClass', key: 'pressureClass' },
    { title: 'Connection', dataIndex: 'connectionType', key: 'connectionType' },
    { title: 'Qty', dataIndex: 'quantity', key: 'quantity', width: 72 },
    {
      title: 'Confidence',
      dataIndex: 'confidence',
      key: 'confidence',
      render: (c: BomItem['confidence']) => <BomConfidenceTag confidence={c} />,
    },
  ];

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <BomFlowStepper activeStep={0} projectLabel={title} />
      <BomPageHeader
        title="Parsing review"
        description={`Review extracted lines for ${title}. Demo content is the same for all projects.`}
      />
      <Card styles={{ body: { padding: 0 } }}>
        <Table<BomItem>
          rowKey="id"
          columns={columns}
          dataSource={mockParsedItems}
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
      </Card>
      <Space wrap>
        <Button type="primary" onClick={() => navigate(`/bom/projects/${bomProjectId}/matching`)}>
          Continue to matching
        </Button>
        <Link to="/bom">
          <Button>BOM home</Button>
        </Link>
      </Space>
    </Space>
  );
}
