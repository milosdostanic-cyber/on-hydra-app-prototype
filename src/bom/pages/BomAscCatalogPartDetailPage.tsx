import { PaperClipOutlined, LeftOutlined, PictureOutlined, PlusOutlined, SwapOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { buildBomAscPartDetailView } from '../bomAscCatalogPartDetail';
import {
  catalogPickNeedsSkuStep,
  catalogProductByKey,
  matchingCatalogPickRoute,
  readCatalogPickState,
  type BomCatalogPickReturnState,
} from '../bomCatalogPickNavigation';
import { demoProductUrlForFigure, demoSubmittalUrlForFigure } from '../bomWorkspaceDashboard';
import { BomCatalogSkuPickModal } from '../components/BomCatalogSkuPickModal';
import { catalogBrowseTableHeaderStyles } from '../../shell/content/catalogBrowseTableStyles';
import { CatalogThumbnailPlaceholder } from '../../catalog/CatalogThumbnailPlaceholder';
import {
  hydraBaseNormal,
  hydraTextStyleToReactCss,
} from '../../theme/hydraTypography';
import { Button, Card, Flex, Space, Table, Typography, theme } from '../../ui/antd';
import type { TableColumnsType } from '../../ui/antd';

export function BomAscCatalogPartDetailPage() {
  const { token } = theme.useToken();
  const { bomProjectId = '', productKey = '' } = useParams<{
    bomProjectId: string;
    productKey: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const pickState = readCatalogPickState(location.state);
  const product = catalogProductByKey(decodeURIComponent(productKey));
  const detail = useMemo(() => (product ? buildBomAscPartDetailView(product) : undefined), [product]);

  const [skuModalOpen, setSkuModalOpen] = useState(false);
  const [initialVariantId, setInitialVariantId] = useState<string | undefined>();

  const catalogRoute = matchingCatalogPickRoute(bomProjectId);

  if (!pickState || !product || !detail) {
    return (
      <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
        <Typography.Paragraph type="secondary">
          Part not found or catalog session expired.
        </Typography.Paragraph>
        <Button type="primary" onClick={() => navigate(catalogRoute)}>
          Back to catalog
        </Button>
      </Space>
    );
  }

  const activePick = pickState;
  const activeProduct = product;
  const activeDetail = detail;
  const hasSkuVariants = catalogPickNeedsSkuStep(activeProduct);

  function finishPick(variantId?: string) {
    const returnState: BomCatalogPickReturnState = {
      ...(activePick.uploadFlowState ?? {}),
      focusItemId: activePick.matchingPickItemId,
      matchingPickApplied: {
        itemId: activePick.matchingPickItemId,
        productKey: activeProduct.key,
        variantId,
      },
    };
    navigate(activePick.returnTo, { state: returnState });
  }

  function openSkuModal(variantId?: string) {
    setInitialVariantId(variantId);
    setSkuModalOpen(true);
  }

  function handleUseAsReplacement() {
    if (hasSkuVariants) {
      openSkuModal();
      return;
    }
    finishPick();
  }

  function handleRowReplacement(variantId?: string) {
    if (hasSkuVariants && variantId) {
      finishPick(variantId);
      return;
    }
    if (hasSkuVariants) {
      openSkuModal(variantId);
      return;
    }
    finishPick();
  }

  const sizeColumns: TableColumnsType<(typeof activeDetail.sizeRows)[number]> = [
    {
      title: 'Name',
      key: 'name',
      render: (_, row) => (
        <Flex align="center" gap={token.marginSM}>
          <CatalogThumbnailPlaceholder sizePx={token.controlHeight} />
          <Typography.Text style={hydraTextStyleToReactCss(hydraBaseNormal)}>{row.name}</Typography.Text>
        </Flex>
      ),
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 140,
    },
    {
      title: 'Use as replacement',
      key: 'action',
      width: 160,
      align: 'center',
      render: (_, row) => (
        <Button
          type="text"
          icon={<SwapOutlined />}
          aria-label={`Use ${row.sku} as replacement`}
          onClick={() => handleRowReplacement(row.variantId)}
        />
      ),
    },
  ];

  const submittalUrl = demoSubmittalUrlForFigure(activeProduct.figureNumber);
  const productUrl = demoProductUrlForFigure(activeProduct.figureNumber);

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <Button
        type="default"
        icon={<LeftOutlined />}
        onClick={() => navigate(catalogRoute, { state: location.state })}
        style={{ alignSelf: 'flex-start', margin: 0 }}
      >
        {activePick.returnLabel ?? 'Back to catalog'}
      </Button>

      <Flex gap={token.marginLG} align="flex-start" wrap="wrap">
        <Space orientation="vertical" size={token.marginSM} style={{ flex: '1 1 280px', minWidth: 0 }}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            {activeDetail.title}
          </Typography.Title>
          <Typography.Text type="secondary">{activeDetail.modelCode}</Typography.Text>
          <Flex gap={token.marginSM} wrap="wrap" align="center">
            <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleUseAsReplacement}>
              Use as replacement
            </Button>
            <Button
              type="link"
              icon={<PaperClipOutlined />}
              href={submittalUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Submittal
            </Button>
            {productUrl ? (
              <Button
                type="link"
                icon={<PaperClipOutlined />}
                href={productUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Product Page
              </Button>
            ) : null}
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
            boxShadow: token.boxShadowTertiary,
            overflow: 'hidden',
          }}
        >
          {activeDetail.imageUrl ? (
            <img
              src={activeDetail.imageUrl}
              alt=""
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          ) : (
            <PictureOutlined style={{ fontSize: token.fontSizeHeading2, color: token.colorTextTertiary }} />
          )}
        </Flex>
      </Flex>

      <Card title="Product Description" styles={{ header: { borderBottom: 'none' } }}>
        <Typography.Paragraph style={{ marginBottom: token.marginSM }}>
          {activeDetail.productDescription}
        </Typography.Paragraph>
        <Typography.Title level={5} style={{ marginTop: token.marginMD, marginBottom: token.marginXS }}>
          Regulatory
        </Typography.Title>
        <Typography.Paragraph style={{ margin: 0 }}>{activeDetail.regulatory}</Typography.Paragraph>
      </Card>

      <Card title="Available Sizes & Variations" styles={{ header: { borderBottom: 'none' } }}>
        <Typography.Paragraph type="secondary" style={{ marginBottom: token.marginMD }}>
          {activeDetail.sizeVariationIntro}
        </Typography.Paragraph>
        <Table
          rowKey="key"
          pagination={false}
          columns={sizeColumns}
          dataSource={activeDetail.sizeRows}
          styles={catalogBrowseTableHeaderStyles(token)}
        />
      </Card>

      <BomCatalogSkuPickModal
        open={skuModalOpen}
        product={activeProduct}
        initialVariantId={initialVariantId}
        onClose={() => setSkuModalOpen(false)}
        onConfirm={(variantId) => finishPick(variantId)}
      />
    </Space>
  );
}
