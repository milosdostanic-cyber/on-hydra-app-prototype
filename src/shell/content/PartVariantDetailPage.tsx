import {
  DownloadOutlined,
  FileAddOutlined,
  PaperClipOutlined,
  PictureOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { CatalogThumbnailPlaceholder } from '../../catalog/CatalogThumbnailPlaceholder';
import {
  buildSyntheticPartFamilyDetail,
  getVariantDetailView,
  type DemoPartFamilyDetail,
} from '../../catalog/productCatalogHierarchy.demo';
import { productCatalogPartVariantsPath } from '../../catalog/productCatalogNavigation';
import { BomPageHeader } from '../../bom/layout/BomPageHeader';
import { PageBackButton } from '../PageBackButton';
import { PageDescription } from '../PageDescription';
import {
  Badge,
  Button,
  Card,
  Col,
  FloatButton,
  Flex,
  Pagination,
  Row,
  Space,
  Table,
  Typography,
  message,
  theme,
} from '../../ui/antd';
import type { TableColumnsType } from '../../ui/antd';

import { catalogBrowseTableHeaderStyles } from './catalogBrowseTableStyles';

const SIZES_TABLE_PAGE_SIZE = 10;

type SizeRow = {
  key: string;
  name: string;
  sku: string;
  fileTypes: string;
  downloadEnabled: boolean;
};

function detailToSizeRows(detail: DemoPartFamilyDetail): SizeRow[] {
  return detail.sizeRows.map((r, i) => ({
    key: `${r.sku}-${i}`,
    name: r.name,
    sku: r.sku,
    fileTypes: r.fileTypes,
    downloadEnabled: r.downloadEnabled,
  }));
}

export function PartVariantDetailPage() {
  const { token } = theme.useToken();
  const {
    projectId = '',
    categoryId = '',
    subcategoryId = '',
    productLineId = '',
    partId = '',
    variantId = '',
  } = useParams<{
    projectId: string;
    categoryId: string;
    subcategoryId: string;
    productLineId: string;
    partId: string;
    variantId: string;
  }>();

  const view = useMemo(() => getVariantDetailView(partId, variantId), [partId, variantId]);
  const backTo = productCatalogPartVariantsPath(
    projectId,
    categoryId,
    subcategoryId,
    productLineId,
    partId,
  );

  const effectiveDetail = useMemo(
    () => (view ? view.detail ?? buildSyntheticPartFamilyDetail(view.resolved.part) : undefined),
    [view],
  );

  const sizeRows = useMemo(
    () => (effectiveDetail ? detailToSizeRows(effectiveDetail) : []),
    [effectiveDetail],
  );

  const [sizesPage, setSizesPage] = useState(1);

  useEffect(() => {
    setSizesPage(1);
  }, [partId, variantId]);

  const pagedSizeRows = useMemo(() => {
    const start = (sizesPage - 1) * SIZES_TABLE_PAGE_SIZE;
    return sizeRows.slice(start, start + SIZES_TABLE_PAGE_SIZE);
  }, [sizeRows, sizesPage]);

  const sizeColumns: TableColumnsType<SizeRow> = useMemo(
    () => [
      {
        title: 'Thumbnail',
        key: 'thumb',
        width: token.controlHeight + token.paddingSM,
        render: () => <CatalogThumbnailPlaceholder sizePx={token.controlHeight} />,
      },
      { title: 'Name', dataIndex: 'name', key: 'name' },
      { title: 'SKU', dataIndex: 'sku', key: 'sku' },
      { title: 'File Types', dataIndex: 'fileTypes', key: 'fileTypes' },
      {
        title: 'Download',
        key: 'dl',
        width: token.controlHeightLG,
        render: (_: unknown, row: SizeRow) => (
          <Button
            type="text"
            icon={<DownloadOutlined />}
            disabled={!row.downloadEnabled}
            aria-label="Download"
            onClick={() => message.info('Stub: download would start.')}
          />
        ),
      },
    ],
    [token],
  );

  if (!view || !effectiveDetail) {
    return <PageDescription>Variant not found.</PageDescription>;
  }

  const { partTitle, resolved } = view;
  const modelCode = effectiveDetail.modelCode;

  const cartCount = resolved.category.totalParts;

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%', paddingBottom: token.marginXXL }}>
      <PageBackButton to={backTo}>Back to Parts</PageBackButton>
      <Flex gap={token.marginLG} align="flex-start" wrap="wrap">
        <Space orientation="vertical" size={token.marginSM} style={{ flex: '1 1 280px', minWidth: 0 }}>
          <BomPageHeader title={partTitle} />
          <PageDescription>{modelCode}</PageDescription>
          <Flex gap={token.marginSM} wrap="wrap" align="center">
            <Button
              type="primary"
              size="large"
              icon={<FileAddOutlined />}
              onClick={() => message.info('Stub: 3D file request.')}
            >
              Request 3D File
            </Button>
            <Button type="link" icon={<PaperClipOutlined />} onClick={() => message.info('Stub: submittal.')}>
              Submittal
            </Button>
            <Button type="link" icon={<PaperClipOutlined />} onClick={() => message.info('Stub: product page.')}>
              Product Page
            </Button>
          </Flex>
        </Space>
        <Flex
          align="center"
          justify="center"
          style={{
            flex: '0 1 400px',
            width: '100%',
            maxWidth: token.sizeUnit * 100,
            minHeight: token.controlHeight * 10,
            borderRadius: token.borderRadiusLG,
            background: token.colorBgContainer,
            border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
            boxShadow: token.boxShadowTertiary,
          }}
        >
          <PictureOutlined style={{ fontSize: token.fontSizeHeading2, color: token.colorTextTertiary }} />
        </Flex>
      </Flex>

      <Card title="Product Description" styles={{ header: { borderBottom: 'none' } }}>
        <Typography.Paragraph style={{ marginBottom: token.marginSM }}>
          {effectiveDetail.productDescription}
        </Typography.Paragraph>
        <Typography.Title level={5} style={{ marginTop: token.marginMD, marginBottom: token.marginXS }}>
          Regulatory
        </Typography.Title>
        <Typography.Paragraph style={{ margin: 0 }}>{effectiveDetail.regulatory}</Typography.Paragraph>
      </Card>

      <Card title="Available Sizes & Variations" styles={{ header: { borderBottom: 'none' } }}>
        <PageDescription style={{ marginBottom: token.marginMD }}>
          {effectiveDetail.sizeVariationIntro}
        </PageDescription>
        <Table<SizeRow>
          rowKey="key"
          pagination={false}
          columns={sizeColumns}
          dataSource={pagedSizeRows}
          styles={catalogBrowseTableHeaderStyles(token)}
        />
        {sizeRows.length > SIZES_TABLE_PAGE_SIZE ? (
          <Flex justify="flex-end" style={{ marginTop: token.paddingMD }}>
            <Pagination
              current={sizesPage}
              pageSize={SIZES_TABLE_PAGE_SIZE}
              total={sizeRows.length}
              onChange={setSizesPage}
              showSizeChanger={false}
            />
          </Flex>
        ) : null}
      </Card>

      <Card title="Part Information & Technical Specifications" styles={{ header: { borderBottom: 'none' } }}>
        <Row gutter={[token.marginMD, token.marginMD]}>
          {effectiveDetail.technicalSpecs.map((spec) => (
            <Col xs={24} sm={12} md={8} key={spec.label}>
              <Typography.Text
                type="secondary"
                style={{
                  display: 'block',
                  marginBottom: token.marginXXS,
                  textTransform: 'uppercase',
                  fontSize: token.fontSizeSM,
                }}
              >
                {spec.label}
              </Typography.Text>
              <Typography.Text>{spec.value}</Typography.Text>
            </Col>
          ))}
        </Row>
      </Card>

      <Badge count={cartCount} offset={[-4, 4]}>
        <FloatButton
          type="primary"
          icon={<ShoppingCartOutlined />}
          aria-label="Cart"
          onClick={() => message.info('Stub: cart is not wired in this prototype.')}
        />
      </Badge>
    </Space>
  );
}
