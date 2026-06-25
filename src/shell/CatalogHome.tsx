import { SearchOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { BomPageHeader } from '../bom/layout/BomPageHeader';
import { BomCardTitle } from '../bom/components/BomCardTitle';
import { catalogPartReturnFrom } from '../catalog/catalogPartNavigation';
import { FeaturedParts } from '../catalog/FeaturedParts';
import {
  CATALOG_DEMO_PARTS,
  CATALOG_QUICK_CATEGORIES,
  type CatalogPartRow,
} from '../catalog/catalogDemoData';
import { PageBackButton } from './PageBackButton';
import { PageDescription } from './PageDescription';
import { shellLayout } from '../theme/hydraAlias';
import { shellTableCardStyle, shellTableLinkButtonStyle, shellTableStyles } from './shellTablePatterns';
import { AppSearchInput, INLINE_SEARCH_CONTROL_SIZE, Button, Card, Divider, Flex, Pagination, Space, Table, theme } from '../ui/antd';
import type { TableColumnsType } from '../ui/antd';
import { HydraTag } from '../ui/HydraTag';

const PREVIEW_ROWS = CATALOG_DEMO_PARTS.slice(0, 2);

/** Top-level catalog entry: browse parts without selecting a project (Matt flow). */
export function CatalogHome() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const partReturnState = catalogPartReturnFrom(location.pathname);
  const [q, setQ] = useState('');
  const [previewPage, setPreviewPage] = useState(1);

  const pagedPreviewRows = useMemo(() => {
    const start = (previewPage - 1) * shellLayout.tablePageSizeDefault;
    return PREVIEW_ROWS.slice(start, start + shellLayout.tablePageSizeDefault);
  }, [previewPage]);

  const goResults = (query?: string) => {
    const next = (query ?? q).trim() || 'all';
    navigate(`/catalog/results?q=${encodeURIComponent(next)}`);
  };

  const previewColumns: TableColumnsType<CatalogPartRow> = [
    {
      title: 'SKU',
      key: 'sku',
      render: (_, row) => (
        <Button
          type="link"
          style={shellTableLinkButtonStyle}
          onClick={() =>
            navigate(`/catalog/parts/${encodeURIComponent(row.key)}`, { state: partReturnState })
          }
        >
          {row.sku}
        </Button>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      align: 'right',
      render: (_, row) => (
        <Button
          type="link"
          style={shellTableLinkButtonStyle}
          onClick={() =>
            navigate(`/catalog/parts/${encodeURIComponent(row.key)}`, { state: partReturnState })
          }
        >
          Open
        </Button>
      ),
    },
  ];

  const tableShellStyle = shellTableCardStyle(token);

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to="/dashboard">Back to home</PageBackButton>

      <BomPageHeader
        title="Catalog"
        description="Search the product catalog without creating or opening a project. When you need submittals or project-scoped downloads, we'll ask you to pick or create a project at that moment."
      />

      <Card
        styles={{ body: { padding: token.paddingMD } }}
        style={{
          background: token.colorBgContainer,
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadowTertiary,
        }}
      >
        <Flex wrap="wrap" gap={token.marginSM} align="center">
          <AppSearchInput
            allowClear
            size={INLINE_SEARCH_CONTROL_SIZE}
            placeholder="Category, figure, keyword…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onPressEnter={() => goResults()}
            style={{ minWidth: token.controlHeight * 10, flex: 1 }}
          />
          <Button type="primary" size="large" icon={<SearchOutlined />} onClick={() => goResults()}>
            Search catalog
          </Button>
          <Button size="large" onClick={() => goResults('all')}>
            Browse all sample parts
          </Button>
        </Flex>
      </Card>

      <FeaturedParts panel />

      <Divider style={{ margin: 0, borderColor: token.colorSplit }} />

      <Space orientation="vertical" size={token.marginSM} style={{ width: '100%' }}>
        <Space orientation="vertical" size={token.marginXS} style={{ width: '100%' }}>
          <BomCardTitle>Catalog results preview</BomCardTitle>
          <PageDescription>
            Sample table rows — open a SKU to try quick download or add a cut sheet to a submittal. Full results
            use the same data as search.
          </PageDescription>
        </Space>
        <Card styles={{ body: { padding: 0 } }} style={tableShellStyle}>
          <Table<CatalogPartRow>
            rowKey="key"
            pagination={false}
            columns={previewColumns}
            dataSource={pagedPreviewRows}
            styles={shellTableStyles(token)}
          />
          <Flex
            justify="flex-end"
            align="center"
            style={{
              paddingInline: token.paddingMD,
              paddingBlock: token.paddingSM,
              borderTop: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
            }}
          >
            <Pagination
              current={previewPage}
              pageSize={shellLayout.tablePageSizeDefault}
              total={PREVIEW_ROWS.length}
              onChange={setPreviewPage}
              showSizeChanger={false}
            />
          </Flex>
        </Card>
      </Space>

      <Space orientation="vertical" size={token.marginSM} style={{ width: '100%' }}>
        <Space orientation="vertical" size={token.marginXS} style={{ width: '100%' }}>
          <BomCardTitle>Quick browse by category</BomCardTitle>
          <PageDescription>Sample category shortcuts — opens the same catalog search results.</PageDescription>
        </Space>
        <Flex wrap="wrap" gap={token.marginXS}>
          {CATALOG_QUICK_CATEGORIES.map((cat) => (
            <HydraTag
              key={cat}
              style={{ cursor: 'pointer', paddingBlock: token.paddingXXS }}
              onClick={() => goResults(cat)}
            >
              {cat}
            </HydraTag>
          ))}
        </Flex>
      </Space>
    </Space>
  );
}
