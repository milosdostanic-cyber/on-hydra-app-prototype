import {
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  PlusOutlined,
  SearchOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { BomCardTitle } from '../components/BomCardTitle';
import { BomPageHeader } from '../layout/BomPageHeader';
import { bomProjectTitleById, mockWorkspaceItems } from '../data/mockData';
import type { BomItem } from '../data/types';
import { BomConfidenceTag, BomMatchStatusTag } from '../components/BomTags';
import {
  Button,
  Card,
  Col,
  Flex,
  Input,
  InputNumber,
  Popconfirm,
  Progress,
  Row,
  Space,
  Table,
  Typography,
  message,
  theme,
} from '../../ui/antd';
import type { TableColumnsType } from '../../ui/antd';

export function BomWorkspacePage() {
  const { token } = theme.useToken();
  const { bomProjectId = '' } = useParams<{ bomProjectId: string }>();
  const navigate = useNavigate();
  const projectTitle = bomProjectTitleById(bomProjectId) ?? 'BOM project';
  const [rows, setRows] = useState<BomItem[]>(() => [...mockWorkspaceItems]);
  const [query, setQuery] = useState('');

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      [row.originalInput, row.parsedDescription, row.category ?? '']
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [rows, query]);

  const totalItems = rows.length;
  const confirmedCount = rows.filter((row) => row.status === 'confirmed').length;
  const reviewCount = rows.filter((row) => row.status === 'needs-review').length;
  const readinessScore = totalItems === 0 ? 0 : Math.round((confirmedCount / totalItems) * 100);

  const columns: TableColumnsType<BomItem> = [
    { title: '#', dataIndex: 'rowNumber', key: 'rowNumber', width: 56 },
    {
      title: 'Part number',
      dataIndex: 'originalInput',
      key: 'originalInput',
      render: (partNumber: string, row) => (
        <Link to={`/bom/projects/${bomProjectId}/items/${row.id}/recommend`}>{partNumber}</Link>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'parsedDescription',
      key: 'parsedDescription',
      render: (description: string, row) => (
        <Space orientation="vertical" size={0}>
          <span>{description}</span>
          <Typography.Text type="secondary">{row.size}</Typography.Text>
        </Space>
      ),
    },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'Size', dataIndex: 'size', key: 'size' },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 132,
      render: (qty: number, row) => (
        <InputNumber
          min={0}
          value={qty}
          style={{ width: '100%' }}
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
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, row) => (
        <Space size={token.marginXXS}>
          <Button
            type="text"
            icon={<EditOutlined />}
            aria-label={`Edit row ${row.rowNumber}`}
            onClick={() => navigate(`/bom/projects/${bomProjectId}/items/${row.id}/recommend`)}
          />
          <Popconfirm
            title="Remove line item?"
            description="This line will be removed from the workspace."
            onConfirm={() => {
              setRows((prev) => prev.filter((r) => r.id !== row.id).map((r, idx) => ({ ...r, rowNumber: idx + 1 })));
              message.success('Line item removed.');
            }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} aria-label={`Delete row ${row.rowNumber}`} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <Flex align="flex-start" justify="space-between" gap={token.marginSM} wrap="wrap">
        <BomPageHeader
          title={projectTitle}
          description="Manage and adjust your bill of materials. Confirm lines, resolve review items, and generate your output."
          eyebrow="BOM workspace"
        />
        <Space wrap>
          <Button onClick={() => navigate(`/bom/projects/${bomProjectId}/service-request`)}>
            Request service
          </Button>
          <Button
            type="primary"
            icon={<FileTextOutlined />}
            onClick={() => navigate(`/bom/projects/${bomProjectId}/export`)}
          >
            Generate submittal
          </Button>
        </Space>
      </Flex>

      <Row gutter={[token.marginSM, token.marginSM]}>
        <Col xs={24} md={8}>
          <Card>
            <Typography.Text type="secondary">Total items</Typography.Text>
            <BomCardTitle>{totalItems}</BomCardTitle>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Typography.Text type="secondary">Needs review</Typography.Text>
            <BomCardTitle>{reviewCount}</BomCardTitle>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Typography.Text type="secondary">Readiness</Typography.Text>
            <Space orientation="vertical" size={token.marginXXS} style={{ width: '100%' }}>
              <Progress
                percent={readinessScore}
                showInfo={false}
                strokeColor={token.colorSuccess}
                trailColor={token.colorFillSecondary}
              />
              <Typography.Text>{readinessScore}% ready for export</Typography.Text>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card styles={{ body: { padding: token.paddingSM } }}>
        <Flex align="center" justify="space-between" gap={token.marginSM} wrap="wrap">
          <Space wrap>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setRows((prev) => [
                  ...prev,
                  {
                    id: `ws-new-${Date.now()}`,
                    rowNumber: prev.length + 1,
                    originalInput: `NEW-PART-${prev.length + 1}`,
                    parsedDescription: 'New line item',
                    size: 'N/A',
                    pressureClass: '',
                    connectionType: '',
                    quantity: 1,
                    confidence: 'low',
                    category: 'Uncategorized',
                    unit: 'EA',
                    status: 'pending',
                  },
                ]);
                message.success('New line item added.');
              }}
            >
              Add item
            </Button>
            <Button icon={<SearchOutlined />} onClick={() => navigate('/bom/search')}>
              Search part
            </Button>
            <Button icon={<UploadOutlined />} onClick={() => navigate(`/bom/projects/${bomProjectId}/parsing-review`)}>
              Upload file
            </Button>
          </Space>
          <Space wrap>
            <Input
              allowClear
              placeholder="Search rows..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ width: 260, maxWidth: '100%' }}
            />
          </Space>
        </Flex>
      </Card>

      <Card styles={{ body: { padding: 0 } }}>
        <Table<BomItem>
          rowKey="id"
          columns={columns}
          dataSource={filteredRows}
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <Space wrap>
        <Link to="/bom">
          <Button>BOM home</Button>
        </Link>
      </Space>
    </Space>
  );
}
