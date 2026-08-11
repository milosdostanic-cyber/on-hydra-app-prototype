import { DownloadOutlined } from '@ant-design/icons';
import { Link, useLocation, useParams } from 'react-router-dom';

import { CatalogThumbnailPlaceholder } from '../../catalog/CatalogThumbnailPlaceholder';
import { catalogDemoKeyForHierarchyPartId } from '../../catalog/featuredPartContentListing';
import { catalogPartReturnFrom, unifiedSearchPartPath } from '../../catalog/catalogPartNavigation';
import { catalogProductLine, catalogSubcategory } from '../../catalog/productCatalogHierarchy.demo';
import { BomPageHeader } from '../../bom/layout/BomPageHeader';
import { productCatalogHubPath } from '../../catalog/productCatalogNavigation';
import { PageBackButton } from '../PageBackButton';
import { PageDescription } from '../PageDescription';
import { Button, Flex, Space, Table, message, theme } from '../../ui/antd';
import type { TableColumnsType } from '../../ui/antd';
import { HydraTag } from '../../ui/HydraTag';

import { catalogBrowseTableHeaderStyles } from './catalogBrowseTableStyles';

type LeafRow = {
  key: string;
  name: string;
  figureNumber: string;
  description: string;
};

export function ProductLinePartsPage() {
  const { token } = theme.useToken();
  const location = useLocation();
  const { projectId = '', categoryId = '', subcategoryId = '', productLineId = '' } = useParams<{
    projectId: string;
    categoryId: string;
    subcategoryId: string;
    productLineId: string;
  }>();
  const partReturnState = catalogPartReturnFrom(`${location.pathname}${location.search}`);
  const line = catalogProductLine(categoryId, subcategoryId, productLineId);
  const sub = catalogSubcategory(categoryId, subcategoryId);

  const rows: LeafRow[] =
    line?.parts.map((p) => ({
      key: p.id,
      name: p.name,
      figureNumber: p.figureNumber,
      description: p.description,
    })) ?? [];

  const columns: TableColumnsType<LeafRow> = [
    {
      title: 'Name',
      key: 'name',
      render: (_, row) => (
        <Flex align="center" gap={token.marginSM}>
          <CatalogThumbnailPlaceholder />
          <Link
            to={unifiedSearchPartPath(catalogDemoKeyForHierarchyPartId(row.key))}
            state={partReturnState}
          >
            {row.name}
          </Link>
        </Flex>
      ),
    },
    {
      title: 'Figure Number',
      dataIndex: 'figureNumber',
      key: 'figureNumber',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (v: string) => v || '—',
    },
  ];

  if (!line) {
    return <PageDescription>Product line not found.</PageDescription>;
  }

  const hubPath = productCatalogHubPath(projectId, categoryId, subcategoryId);
  const backLabel = sub?.label ?? 'Home';

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to={hubPath}>{`Back to ${backLabel}`}</PageBackButton>
      <BomPageHeader
        title={line.name}
        actions={
          <Flex align="center" gap={token.marginXS} wrap="wrap">
            <HydraTag>{line.parts.length} parts</HydraTag>
            <Button
              type="primary"
              size="large"
              icon={<DownloadOutlined />}
              onClick={() => message.info('Stub: download would start.')}
            >
              Download Fabrication BIM Content
            </Button>
            <Button
              size="large"
              icon={<DownloadOutlined />}
              onClick={() => message.info('Stub: download would start.')}
            >
              Download All Content
            </Button>
          </Flex>
        }
      />
      <Table<LeafRow>
        rowKey="key"
        pagination={false}
        columns={columns}
        dataSource={rows}
        styles={catalogBrowseTableHeaderStyles(token)}
      />
    </Space>
  );
}
