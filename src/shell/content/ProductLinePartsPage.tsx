import { DownloadOutlined } from '@ant-design/icons';
import { Link, useParams } from 'react-router-dom';

import { CatalogThumbnailPlaceholder } from '../../catalog/CatalogThumbnailPlaceholder';
import { catalogProductLine, catalogSubcategory } from '../../catalog/productCatalogHierarchy.demo';
import {
  productCatalogHubPath,
  productCatalogPartVariantsPath,
} from '../../catalog/productCatalogNavigation';
import { PageBackButton } from '../PageBackButton';
import { Button, Flex, Space, Table, Tag, Typography, message, theme } from '../../ui/antd';
import type { TableColumnsType } from '../../ui/antd';

import { catalogBrowseTableHeaderStyles } from './catalogBrowseTableStyles';

type LeafRow = {
  key: string;
  name: string;
  figureNumber: string;
  description: string;
};

export function ProductLinePartsPage() {
  const { token } = theme.useToken();
  const { projectId = '', categoryId = '', subcategoryId = '', productLineId = '' } = useParams<{
    projectId: string;
    categoryId: string;
    subcategoryId: string;
    productLineId: string;
  }>();
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
            to={productCatalogPartVariantsPath(
              projectId,
              categoryId,
              subcategoryId,
              productLineId,
              row.key,
            )}
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
    return <Typography.Paragraph type="secondary">Product line not found.</Typography.Paragraph>;
  }

  const hubPath = productCatalogHubPath(projectId, categoryId, subcategoryId);
  const backLabel = sub?.label ?? 'Home';

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to={hubPath}>{`Back to ${backLabel}`}</PageBackButton>
      <Flex align="flex-start" justify="space-between" gap={token.margin} wrap="wrap">
        <Typography.Title level={3} style={{ margin: 0 }}>
          {line.name}
        </Typography.Title>
        <Flex align="center" gap={token.marginXS} wrap="wrap">
          <Tag>{line.parts.length} parts</Tag>
          <Button
            size="large"
            icon={<DownloadOutlined />}
            onClick={() => message.info('Stub: download would start.')}
          >
            Download All Content
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<DownloadOutlined />}
            onClick={() => message.info('Stub: download would start.')}
          >
            Download Fabrication BIM Content
          </Button>
        </Flex>
      </Flex>
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
