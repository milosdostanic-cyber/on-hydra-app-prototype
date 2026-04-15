import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { CATALOG_DEMO_PARTS } from '../catalog/catalogDemoData';
import { shellLayout } from '../theme/hydraAlias';
import { PageBackButton } from './PageBackButton';
import { hydraBaseStrong } from '../theme/hydraTypography';
import type { CatalogPartRow } from '../catalog/catalogDemoData';
import { Button, Empty, Flex, Pagination, Space, Table, Typography, theme } from '../ui/antd';
import type { TableColumnsType } from '../ui/antd';

function matchesCatalogQuery(part: CatalogPartRow, rawQuery: string): boolean {
  const q = rawQuery.trim().toLowerCase();
  if (!q || q === 'all') return true;
  return (
    part.sku.toLowerCase().includes(q) ||
    part.description.toLowerCase().includes(q) ||
    part.key.toLowerCase().includes(q)
  );
}

export function CatalogResults() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const q = params.get('q') ?? '';
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => CATALOG_DEMO_PARTS.filter((p) => matchesCatalogQuery(p, q)), [q]);

  const title = useMemo(() => {
    if (!q.trim() || q === 'all') return 'Catalog results';
    return `Results for “${q}”`;
  }, [q]);

  useEffect(() => {
    setPage(1);
  }, [q]);

  const pagedParts = useMemo(() => {
    const start = (page - 1) * shellLayout.tablePageSizeDefault;
    return filtered.slice(start, start + shellLayout.tablePageSizeDefault);
  }, [filtered, page]);

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
      <PageBackButton to="/catalog">Back to catalog</PageBackButton>
      <Typography.Title level={4} style={{ margin: 0 }}>
        {title}
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
        {filtered.length} part{filtered.length !== 1 ? 's' : ''} match your search.
      </Typography.Paragraph>
      {filtered.length === 0 ? (
        <Empty
          description={
            <Space orientation="vertical" size={token.marginXXS}>
              <Typography.Text strong>No parts found</Typography.Text>
              <Typography.Text type="secondary">
                {q.trim() ? `Nothing matched “${q}”. Try a shorter term or clear the search.` : 'No rows to show.'}
              </Typography.Text>
            </Space>
          }
        >
          <Button type="primary" onClick={() => navigate('/catalog/results?q=all')}>
            Show all parts
          </Button>
        </Empty>
      ) : (
        <>
          <Table<CatalogPartRow>
            rowKey="key"
            pagination={false}
            columns={columns}
            dataSource={pagedParts}
            styles={{
              header: {
                cell: {
                  color: token.colorTextDescription,
                  fontWeight: hydraBaseStrong.fontWeight,
                },
              },
            }}
          />
          <Flex justify="flex-end" style={{ paddingTop: token.paddingMD }}>
            <Pagination
              current={page}
              pageSize={shellLayout.tablePageSizeDefault}
              total={filtered.length}
              onChange={setPage}
              showSizeChanger={false}
            />
          </Flex>
        </>
      )}
    </Space>
  );
}
