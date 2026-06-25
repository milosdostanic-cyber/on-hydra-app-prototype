import { DownloadOutlined } from '@ant-design/icons';
import { Link, useParams } from 'react-router-dom';

import { catalogSubcategory } from '../../catalog/productCatalogHierarchy.demo';
import { BomPageHeader } from '../../bom/layout/BomPageHeader';
import { productCatalogHomePath, productCatalogLinePath } from '../../catalog/productCatalogNavigation';
import { shellLayout } from '../../theme/hydraAlias';
import { PageBackButton } from '../PageBackButton';
import { PageDescription } from '../PageDescription';
import { Button, Flex, Space, Table, message, theme } from '../../ui/antd';
import type { TableColumnsType } from '../../ui/antd';
import { HydraTag } from '../../ui/HydraTag';

import { catalogBrowseTableHeaderStyles } from './catalogBrowseTableStyles';

type HubRow = {
  key: string;
  name: string;
  description: string;
  partCount: number;
};

export function SubcategoryHubPage() {
  const { token } = theme.useToken();
  const { projectId = '', categoryId = '', subcategoryId = '' } = useParams<{
    projectId: string;
    categoryId: string;
    subcategoryId: string;
  }>();
  const sub = catalogSubcategory(categoryId, subcategoryId);

  const rows: HubRow[] =
    sub?.productLines.map((pl) => ({
      key: pl.id,
      name: pl.name,
      description: pl.description,
      partCount: pl.directPartCount,
    })) ?? [];

  const columns: TableColumnsType<HubRow> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, row) => (
        <Link to={productCatalogLinePath(projectId, categoryId, subcategoryId, row.key)}>{name}</Link>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (v: string) => v || '—',
    },
    {
      title: 'Part Count',
      key: 'count',
      width: token.controlHeight * 4,
      render: (_, row) => (
        <HydraTag>
          {row.partCount} part{row.partCount !== 1 ? 's' : ''}
        </HydraTag>
      ),
    },
  ];

  if (!sub) {
    return <PageDescription>Subcategory not found in prototype data.</PageDescription>;
  }

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to={productCatalogHomePath(projectId)}>Back to Home</PageBackButton>
      <BomPageHeader
        title={sub.label}
        actions={
          <Flex align="center" gap={token.marginXS} wrap="wrap">
            <Button type="text">{sub.partCount} parts</Button>
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
        }
      />
      <Table<HubRow>
        rowKey="key"
        pagination={
          rows.length > shellLayout.tablePageSizeDefault
            ? { pageSize: shellLayout.tablePageSizeDefault }
            : false
        }
        columns={columns}
        dataSource={rows}
        styles={catalogBrowseTableHeaderStyles(token)}
      />
    </Space>
  );
}
