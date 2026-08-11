import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { CatalogThumbnailPlaceholder } from '../../catalog/CatalogThumbnailPlaceholder';
import { catalogDemoKeyForHierarchyPartId } from '../../catalog/featuredPartContentListing';
import { catalogPartReturnFrom, unifiedSearchPartPath } from '../../catalog/catalogPartNavigation';
import { searchCatalogParts } from '../../catalog/productCatalogHierarchy.demo';
import {
  productCatalogHomePath,
  productCatalogSearchPath,
} from '../../catalog/productCatalogNavigation';
import { shellLayout } from '../../theme/hydraAlias';
import { BomPageHeader } from '../../bom/layout/BomPageHeader';
import { PageBackButton } from '../PageBackButton';
import { Button, Empty, Flex, Pagination, Space, Table, Typography, theme } from '../../ui/antd';
import type { TableColumnsType } from '../../ui/antd';

import { catalogBrowseTableHeaderStyles } from './catalogBrowseTableStyles';

type Row = {
  key: string;
  categoryId: string;
  subcategoryId: string;
  productLineId: string;
  partId: string;
  name: string;
  figureNumber: string;
  description: string;
};

export function ProductCatalogSearchPage() {
  const { token } = theme.useToken();
  const { projectId = '' } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const q = params.get('q') ?? '';
  const [page, setPage] = useState(1);
  const partReturnState = catalogPartReturnFrom(`${location.pathname}${location.search}`);

  const hits = useMemo(() => searchCatalogParts(q), [q]);

  const rows: Row[] = useMemo(
    () =>
      hits.map((h) => ({
        key: h.part.id,
        categoryId: h.categoryId,
        subcategoryId: h.subcategoryId,
        productLineId: h.productLineId,
        partId: h.part.id,
        name: h.part.name,
        figureNumber: h.part.figureNumber,
        description: h.part.description,
      })),
    [hits],
  );

  useEffect(() => {
    setPage(1);
  }, [q]);

  const paged = useMemo(() => {
    const start = (page - 1) * shellLayout.tablePageSizeDefault;
    return rows.slice(start, start + shellLayout.tablePageSizeDefault);
  }, [rows, page]);

  const title =
    !q.trim() || q.toLowerCase() === 'all' ? 'Catalog search — all prototype parts' : `Results for “${q}”`;

  const columns: TableColumnsType<Row> = [
    {
      title: 'Name',
      key: 'name',
      render: (_, row) => (
        <Flex align="center" gap={token.marginSM}>
          <CatalogThumbnailPlaceholder />
          <Link
            to={unifiedSearchPartPath(catalogDemoKeyForHierarchyPartId(row.partId))}
            state={partReturnState}
          >
            {row.name}
          </Link>
        </Flex>
      ),
    },
    { title: 'Figure Number', dataIndex: 'figureNumber', key: 'figureNumber' },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
  ];

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to={productCatalogHomePath(projectId)}>Back to Home</PageBackButton>
      <BomPageHeader
        title={title}
        description={`${rows.length} part${rows.length !== 1 ? 's' : ''} match in the prototype catalog.`}
      />
      {rows.length === 0 ? (
        <Empty
          description={
            <Space orientation="vertical" size={token.marginXXS}>
              <Typography.Text strong>No parts found</Typography.Text>
              <Typography.Text type="secondary">
                {q.trim() ? `Nothing matched “${q}”. Try “fire” or clear the query.` : 'No rows to show.'}
              </Typography.Text>
            </Space>
          }
        >
          <Button type="primary" onClick={() => navigate(productCatalogSearchPath(projectId, 'all'))}>
            Show all parts
          </Button>
        </Empty>
      ) : (
        <>
          <Table<Row>
            rowKey="key"
            pagination={false}
            columns={columns}
            dataSource={paged}
            styles={catalogBrowseTableHeaderStyles(token)}
          />
          <Flex justify="flex-end">
            <Pagination
              current={page}
              pageSize={shellLayout.tablePageSizeDefault}
              total={rows.length}
              onChange={setPage}
              showSizeChanger={false}
            />
          </Flex>
        </>
      )}
    </Space>
  );
}
