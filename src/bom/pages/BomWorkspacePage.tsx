import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { BomFlowStepper } from '../components/BomFlowStepper';
import { BomPageHeader } from '../layout/BomPageHeader';
import { bomProjectTitleById, mockWorkspaceItems } from '../data/mockData';
import type { BomItem } from '../data/types';
import { BomConfidenceTag, BomMatchStatusTag } from '../components/BomTags';
import { Button, Card, InputNumber, Space, Table, theme } from '../../ui/antd';
import type { TableColumnsType } from '../../ui/antd';

export function BomWorkspacePage() {
  const { token } = theme.useToken();
  const { bomProjectId = '' } = useParams<{ bomProjectId: string }>();
  const navigate = useNavigate();
  const projectTitle = bomProjectTitleById(bomProjectId) ?? 'BOM project';
  const [rows, setRows] = useState<BomItem[]>(() => [...mockWorkspaceItems]);

  const columns: TableColumnsType<BomItem> = [
    { title: '#', dataIndex: 'rowNumber', key: 'rowNumber', width: 56 },
    {
      title: 'Part / description',
      dataIndex: 'parsedDescription',
      key: 'parsedDescription',
      render: (t: string, row) => (
        <Space orientation="vertical" size={0}>
          <span>{row.originalInput}</span>
          <span>{t}</span>
        </Space>
      ),
    },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'Size', dataIndex: 'size', key: 'size' },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      render: (qty: number, row) => (
        <InputNumber
          min={0}
          value={qty}
          onChange={(v) => {
            const n = typeof v === 'number' ? v : 0;
            setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, quantity: n } : r)));
          }}
        />
      ),
    },
    { title: 'Unit', dataIndex: 'unit', key: 'unit', width: 72 },
    {
      title: 'Confidence',
      dataIndex: 'confidence',
      key: 'confidence',
      render: (c: BomItem['confidence']) => <BomConfidenceTag confidence={c} />,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s: BomItem['status']) => (s ? <BomMatchStatusTag status={s} /> : '—'),
    },
  ];

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <BomFlowStepper activeStep={4} projectLabel={projectTitle} />
      <BomPageHeader
        title="BOM workspace"
        description={`Edit quantities and review statuses for ${projectTitle}.`}
      />
      <Card styles={{ body: { padding: 0 } }}>
        <Table<BomItem>
          rowKey="id"
          columns={columns}
          dataSource={rows}
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
      </Card>
      <Space wrap>
        <Button type="primary" onClick={() => navigate(`/bom/projects/${bomProjectId}/export`)}>
          Export
        </Button>
        <Button onClick={() => navigate(`/bom/projects/${bomProjectId}/service-request`)}>
          Service request
        </Button>
        <Button onClick={() => navigate(`/bom/projects/${bomProjectId}/matching`)}>
          Back to matching
        </Button>
        <Link to="/bom">
          <Button>BOM home</Button>
        </Link>
      </Space>
    </Space>
  );
}
