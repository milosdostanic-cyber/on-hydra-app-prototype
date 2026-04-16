import { SearchOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  CATALOG_DEMO_PARTS,
  CATALOG_QUICK_CATEGORIES,
  type CatalogPartRow,
} from '../catalog/catalogDemoData';
import { hydraBaseStrong } from '../theme/hydraTypography';
import { Button, Flex, Input, Space, Table, Tag, Typography, theme } from '../ui/antd';
import type { TableColumnsType } from '../ui/antd';

const PREVIEW_ROWS = CATALOG_DEMO_PARTS.slice(0, 2);

/** Top-level catalog entry: browse parts without selecting a project (Matt flow). */
export function CatalogHome() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const goResults = (query?: string) => {
    const next = (query ?? q).trim() || 'all';
    navigate(`/catalog/results?q=${encodeURIComponent(next)}`);
  };

  const previewColumns: TableColumnsType<CatalogPartRow> = [
    {
      title: 'SKU',
      key: 'sku',
      render: (_, row) => (
        <Link to={`/catalog/parts/${encodeURIComponent(row.key)}`}>{row.sku}</Link>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
  ];

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        Catalog
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
        Search the product catalog without creating or opening a project. When you need submittals or
        project-scoped downloads, we&apos;ll ask you to pick or create a project at that moment.
      </Typography.Paragraph>

      <Flex wrap="wrap" gap={token.margin} align="flex-end">
        <Input
          allowClear
          placeholder="Category, figure, keyword…"
          prefix={<SearchOutlined style={{ color: token.colorTextPlaceholder }} />}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onPressEnter={() => goResults()}
          style={{ minWidth: token.controlHeight * 10, flex: 1 }}
        />
        <Button type="primary" onClick={() => goResults()}>
          Search catalog
        </Button>
        <Button onClick={() => goResults('all')}>Browse all sample parts</Button>
      </Flex>

      <div>
        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: token.marginXS }}>
          Quick browse by category
        </Typography.Text>
        <Flex wrap="wrap" gap={token.marginXS}>
          {CATALOG_QUICK_CATEGORIES.map((cat) => (
            <Tag
              key={cat}
              style={{ cursor: 'pointer', margin: 0, paddingBlock: token.paddingXXS }}
              onClick={() => goResults(cat)}
            >
              {cat}
            </Tag>
          ))}
        </Flex>
      </div>

      <div>
        <Typography.Title level={5} style={{ marginBottom: token.marginSM }}>
          Featured sample parts
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginTop: 0, marginBottom: token.marginSM }}>
          Same data as full results — open a row to try quick download or add a cut sheet to a submittal.
        </Typography.Paragraph>
        <Table<CatalogPartRow>
          rowKey="key"
          pagination={false}
          size="small"
          columns={previewColumns}
          dataSource={PREVIEW_ROWS}
          styles={{
            header: {
              cell: {
                color: token.colorTextDescription,
                fontWeight: hydraBaseStrong.fontWeight,
              },
            },
          }}
        />
      </div>
    </Space>
  );
}
