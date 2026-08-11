import { DownloadOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

import { CatalogThumbnailPlaceholder } from '../../catalog/CatalogThumbnailPlaceholder';
import { catalogDemoKeyForHierarchyPartId } from '../../catalog/featuredPartContentListing';
import { catalogPartReturnFrom, unifiedSearchPartPath } from '../../catalog/catalogPartNavigation';
import { flattenLeafPartsInCategory, catalogCategoryById } from '../../catalog/productCatalogHierarchy.demo';
import { BomPageHeader } from '../../bom/layout/BomPageHeader';
import { productCatalogHomePath } from '../../catalog/productCatalogNavigation';
import { shellLayout } from '../../theme/hydraAlias';
import { PageBackButton } from '../PageBackButton';
import { Button, Empty, Flex, Pagination, Space, Table, Typography, message, theme } from '../../ui/antd';
import type { TableColumnsType } from '../../ui/antd';
import { HydraTag } from '../../ui/HydraTag';

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

export function CategoryAllPartsPage() {
  const { token } = theme.useToken();
  const { projectId = '', categoryId = '' } = useParams<{ projectId: string; categoryId: string }>();
  const location = useLocation();
  const [page, setPage] = useState(1);
  const partReturnState = catalogPartReturnFrom(`${location.pathname}${location.search}`);

  const hits = useMemo(() => flattenLeafPartsInCategory(categoryId), [categoryId]);

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
  }, [categoryId]);

  const paged = useMemo(() => {
    const start = (page - 1) * shellLayout.tablePageSizeDefault;
    return rows.slice(start, start + shellLayout.tablePageSizeDefault);
  }, [rows, page]);

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
      render: (v: string) => v || '—',
    },
  ];

  const cat = catalogCategoryById(categoryId);
  const categoryTitle = cat?.title ?? 'Category';

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to={productCatalogHomePath(projectId)}>Back to Home</PageBackButton>
      <BomPageHeader
        title={categoryTitle}
        actions={
          cat ? (
            <Flex align="center" gap={token.marginXS} wrap="wrap">
              <HydraTag tone="processing">{cat.totalParts} parts</HydraTag>
              <Button
                type="primary"
                size="large"
                icon={<DownloadOutlined />}
                onClick={() => message.info('Stub: download would start.')}
              >
                Download All Content
              </Button>
              <Button
                size="large"
                icon={<DownloadOutlined />}
                onClick={() => message.info('Stub: download would start.')}
              >
                Download Fabrication ITM Content
              </Button>
            </Flex>
          ) : undefined
        }
      />
      {rows.length === 0 ? (
        <Empty
          description={
            <Typography.Text type="secondary">
              No parts in this category for the prototype fixture.
            </Typography.Text>
          }
        />
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
