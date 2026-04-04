import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { CATALOG_DEMO_PARTS } from '../catalog/catalogDemoData';
import type { CatalogPartRow } from '../catalog/catalogDemoData';
import { Space, Table, Typography, theme } from '../ui/antd';
import type { TableColumnsType } from '../ui/antd';

export function CatalogResults() {
  const { token } = theme.useToken();
  const [params] = useSearchParams();
  const q = params.get('q') ?? '';

  const title = useMemo(() => (q === 'all' || !q ? 'Sample results' : `Results for “${q}”`), [q]);

  const columns: TableColumnsType<CatalogPartRow> = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      render: (_: string, row) => (
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
      <Typography.Title level={4} style={{ margin: 0 }}>
        {title}
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
        Stub listing — links open a part detail used to demo quick download vs. project-gated actions.
      </Typography.Paragraph>
      <Table<CatalogPartRow>
        rowKey="key"
        pagination={false}
        columns={columns}
        dataSource={CATALOG_DEMO_PARTS}
        styles={{
          header: {
            cell: {
              color: token.colorTextDescription,
              fontWeight: token.fontWeightStrong,
            },
          },
        }}
      />
    </Space>
  );
}
