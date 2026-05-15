import { DownloadOutlined } from '@ant-design/icons';
import { Link, useParams } from 'react-router-dom';

import { CatalogThumbnailPlaceholder } from '../../catalog/CatalogThumbnailPlaceholder';
import { catalogLeafPart } from '../../catalog/productCatalogHierarchy.demo';
import {
  productCatalogLinePath,
  productCatalogVariantDetailPath,
} from '../../catalog/productCatalogNavigation';
import { PageBackButton } from '../PageBackButton';
import { Button, Flex, Space, Table, Tag, Typography, message, theme } from '../../ui/antd';
import type { TableColumnsType } from '../../ui/antd';

import { catalogBrowseTableHeaderStyles } from './catalogBrowseTableStyles';

type VariantRow = {
  key: string;
  name: string;
  figureNumber: string;
  description: string;
};

export function PartVariantsPage() {
  const { token } = theme.useToken();
  const { projectId = '', categoryId = '', subcategoryId = '', productLineId = '', partId = '' } =
    useParams<{
      projectId: string;
      categoryId: string;
      subcategoryId: string;
      productLineId: string;
      partId: string;
    }>();
  const part = catalogLeafPart(categoryId, subcategoryId, productLineId, partId);

  const rows: VariantRow[] =
    part?.variants.map((v) => ({
      key: v.id,
      name: v.name,
      figureNumber: v.figureNumber,
      description: v.description,
    })) ?? [];

  const columns: TableColumnsType<VariantRow> = [
    {
      title: 'Name',
      key: 'name',
      render: (_, row) => (
        <Flex align="center" gap={token.marginSM}>
          <CatalogThumbnailPlaceholder />
          <Link
            to={productCatalogVariantDetailPath(
              projectId,
              categoryId,
              subcategoryId,
              productLineId,
              partId,
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
    },
  ];

  if (!part) {
    return <Typography.Paragraph type="secondary">Part not found.</Typography.Paragraph>;
  }

  const linePath = productCatalogLinePath(projectId, categoryId, subcategoryId, productLineId);

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to={linePath}>Back to product line</PageBackButton>
      <Flex align="flex-start" justify="space-between" gap={token.margin} wrap="wrap">
        <Typography.Title level={3} style={{ margin: 0 }}>
          {part.name}
        </Typography.Title>
        <Flex align="center" gap={token.marginXS} wrap="wrap">
          <Tag>{part.variants.length} parts</Tag>
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
      <Typography.Title level={5} type="secondary" style={{ margin: 0 }}>
        Parts
      </Typography.Title>
      <Table<VariantRow>
        rowKey="key"
        pagination={false}
        columns={columns}
        dataSource={rows}
        styles={catalogBrowseTableHeaderStyles(token)}
      />
    </Space>
  );
}
