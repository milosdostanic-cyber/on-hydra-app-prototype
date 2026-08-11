import { DownloadOutlined, LeftOutlined } from '@ant-design/icons';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { CatalogThumbnailPlaceholder } from '../../catalog/CatalogThumbnailPlaceholder';
import { catalogLeafPart } from '../../catalog/productCatalogHierarchy.demo';
import { BomPageHeader } from '../../bom/layout/BomPageHeader';
import { PageDescription } from '../PageDescription';
import {
  productCatalogLinePath,
  productCatalogVariantDetailPath,
} from '../../catalog/productCatalogNavigation';
import { Button, Flex, Space, Table, Typography, message, theme } from '../../ui/antd';
import type { TableColumnsType } from '../../ui/antd';
import { HydraTag } from '../../ui/HydraTag';

import { catalogBrowseTableHeaderStyles } from './catalogBrowseTableStyles';

type VariantRow = {
  key: string;
  name: string;
  figureNumber: string;
  description: string;
};

export function PartVariantsPage() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
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
    return <PageDescription>Part not found.</PageDescription>;
  }

  const linePath = productCatalogLinePath(projectId, categoryId, subcategoryId, productLineId);

  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(linePath);
  };

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <Button
        type="default"
        icon={<LeftOutlined />}
        onClick={goBack}
        style={{ alignSelf: 'flex-start', margin: 0 }}
      >
        Back
      </Button>
      <BomPageHeader
        title={part.name}
        actions={
          <Flex align="center" gap={token.marginXS} wrap="wrap">
            <HydraTag>{part.variants.length} parts</HydraTag>
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
