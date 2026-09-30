import { ExportOutlined, LinkOutlined } from '@ant-design/icons';
import type { CSSProperties, ReactNode } from 'react';
import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import {
  hydraBaseNormal,
  hydraBaseStrong,
  hydraTextStyleToReactCss,
  hydraTitleHeading1,
  hydraTitleHeading3,
  hydraTitleHeading4,
} from '../theme/hydraTypography';
import { readCatalogPartReturnState } from '../catalog/catalogPartNavigation';
import { featuredPartContentListingTarget } from '../catalog/featuredPartContentListing';
import {
  catalogCategoryById,
  catalogProductLine,
  catalogSubcategory,
} from '../catalog/productCatalogHierarchy.demo';
import { PageBackButton } from '../shell/PageBackButton';
import {
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Flex,
  Row,
  Space,
  Typography,
  theme,
} from '../ui/antd';

import { VariantSelectSection } from './components/VariantSelectSection';
import { ActionsPanel } from './components/ActionsPanel';
import type { VariantFigureContext } from './components/variantSelectionShared';
import { partDetailContentFor } from './partDetailDemoData';
import { unifiedPartByKey } from './unifiedSearchData';

function InnerPanel({ children }: { children: ReactNode }) {
  const { token } = theme.useToken();

  return (
    <div
      style={{
        width: '100%',
        padding: token.padding,
        borderRadius: token.borderRadius,
        border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
        background: token.colorFillQuaternary,
      }}
    >
      {children}
    </div>
  );
}

function figureContextForPart(
  partKey: string,
  figureNumber: string,
  productName: string,
  imageUrl: string | undefined,
  specifications: { key: string; label: string; value: string }[],
): VariantFigureContext {
  const target = featuredPartContentListingTarget(partKey);
  const category = target ? catalogCategoryById(target.categoryId) : undefined;
  const subcategory = target
    ? catalogSubcategory(target.categoryId, target.subcategoryId)
    : undefined;
  const line = target
    ? catalogProductLine(target.categoryId, target.subcategoryId, target.productLineId)
    : undefined;
  const breadcrumb = [category?.title, subcategory?.label, line?.name].filter(
    (label): label is string => Boolean(label),
  );
  const brand = specifications.find((spec) => spec.key === 'manufacturer')?.value;

  return {
    figureNumber,
    productName,
    imageUrl,
    brand,
    breadcrumb: breadcrumb.length > 0 ? breadcrumb : undefined,
    figureSpecs: specifications,
  };
}

function SpecField({ label, value }: { label: string; value: string }) {
  const { token } = theme.useToken();

  return (
    <Flex vertical>
      <Typography.Text
        style={{
          display: 'block',
          color: token.colorTextLabel,
          ...hydraTextStyleToReactCss(hydraBaseNormal),
        }}
      >
        {label}
      </Typography.Text>
      <Typography.Text
        style={{
          color: token.colorText,
          ...hydraTextStyleToReactCss(hydraBaseStrong),
        }}
      >
        {value}
      </Typography.Text>
    </Flex>
  );
}

export function UnifiedPartDetailPage() {
  const { token } = theme.useToken();
  const { partId } = useParams<{ partId: string }>();
  const location = useLocation();
  const partReturn = readCatalogPartReturnState(location.state);

  const part = partId ? unifiedPartByKey(partId) : undefined;
  const detail = useMemo(() => (part ? partDetailContentFor(part) : null), [part]);
  const figureNumber = part?.sku ?? partId ?? '—';
  const productImageFrameSize = token.sizeUnit * 60;
  const productImageSize = token.sizeUnit * 47;

  const surfaceCardStyle: CSSProperties = {
    background: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
  };

  const variationsRailCardStyle: CSSProperties = {
    ...surfaceCardStyle,
    border: 'none',
    boxShadow: token.boxShadowTertiary,
  };

  const sectionHeadingStyle = {
    margin: 0,
    ...hydraTextStyleToReactCss(hydraTitleHeading4),
    color: token.colorText,
  };

  const bodyTextStyle = {
    margin: 0,
    color: token.colorTextLabel,
    ...hydraTextStyleToReactCss(hydraBaseNormal),
  };

  const actionPayload = part
    ? {
        partKey: part.key,
        sku: part.sku,
        displayName: `${part.sku} — ${part.description}`,
        figureNumber: part.sku,
      }
    : null;

  const variationRail = detail && actionPayload && part && (
    <VariantSelectSection
      detail={detail}
      actions={
        <ActionsPanel
          layout="stack"
          partKey={part.key}
          payload={actionPayload}
          variations={detail.variations}
          figure={figureContextForPart(
            part.key,
            figureNumber,
            detail.hero.productName,
            part.featuredImageUrl,
            detail.specifications,
          )}
        />
      }
    />
  );

  return (
    <Space orientation="vertical" size={token.paddingLG} style={{ width: '100%' }}>
      <PageBackButton to={partReturn.catalogReturnTo}>{partReturn.catalogReturnLabel}</PageBackButton>

      {!part ? (
        <Empty description="This part is not in the demo catalog. Try another result from search." />
      ) : detail && actionPayload ? (
        <Row gutter={[token.paddingLG, token.paddingLG]} align="top">
          <Col xs={24} lg={16}>
            <div style={{ ...surfaceCardStyle, padding: token.paddingLG, width: '100%' }}>
              <Space orientation="vertical" size={token.paddingLG} style={{ width: '100%' }}>
                <Flex align="flex-start" gap={token.paddingMD} wrap="wrap">
                  <Card
                    styles={{ body: { padding: token.paddingMD } }}
                    style={{
                      ...surfaceCardStyle,
                      flex: `0 0 ${productImageFrameSize}px`,
                      width: productImageFrameSize,
                      margin: 0,
                    }}
                  >
                    {part.featuredImageUrl ? (
                      <img
                        src={part.featuredImageUrl}
                        alt=""
                        style={{
                          width: productImageSize,
                          height: productImageSize,
                          objectFit: 'cover',
                          borderRadius: token.borderRadiusSM,
                          display: 'block',
                        }}
                      />
                    ) : null}
                  </Card>

                  <Flex vertical gap={token.marginXS} style={{ minWidth: 0, flex: '1 1 240px' }}>
                    <Typography.Title
                      level={1}
                      style={{ margin: 0, ...hydraTextStyleToReactCss(hydraTitleHeading1) }}
                    >
                      {figureNumber}
                    </Typography.Title>
                    <Typography.Title
                      level={3}
                      style={{ margin: 0, ...hydraTextStyleToReactCss(hydraTitleHeading3) }}
                    >
                      {detail.hero.productName}
                    </Typography.Title>
                  </Flex>
                </Flex>

                <Space orientation="vertical" size={token.paddingLG} style={{ width: '100%' }}>
                  <InnerPanel>
                    <Row gutter={[token.paddingMD, token.paddingMD]}>
                      <Col xs={24} xl={24}>
                        <Flex vertical gap={token.paddingSM}>
                          <Typography.Text style={sectionHeadingStyle}>Product Description</Typography.Text>
                          <Typography.Paragraph style={bodyTextStyle}>
                            {detail.description}
                          </Typography.Paragraph>
                        </Flex>
                      </Col>
                      <Col xs={24}>
                        <Divider style={{ margin: 0 }} />
                      </Col>
                      <Col xs={24}>
                        <Flex vertical gap={token.paddingSM}>
                          <Typography.Text style={sectionHeadingStyle}>Regulatory</Typography.Text>
                          <Typography.Paragraph style={bodyTextStyle}>
                            {detail.regulatory}
                          </Typography.Paragraph>
                        </Flex>
                      </Col>
                    </Row>
                  </InnerPanel>

                  <InnerPanel>
                    <Space orientation="vertical" size={token.paddingSM} style={{ width: '100%' }}>
                      <Typography.Text style={sectionHeadingStyle}>
                        Information &amp; Technical Specifications
                      </Typography.Text>

                      <Row gutter={[token.marginXL, token.paddingMD]}>
                        {detail.specifications.map((field) => (
                          <Col key={field.key} xs={24} sm={12} lg={12} xl={6}>
                            <SpecField label={field.label} value={field.value} />
                          </Col>
                        ))}
                      </Row>

                      <Flex gap={token.paddingSM} wrap="wrap" align="center">
                        <Button
                          type="link"
                          icon={<LinkOutlined />}
                          style={hydraTextStyleToReactCss(hydraBaseNormal)}
                        >
                          View Submittal
                        </Button>
                        <Button
                          type="link"
                          icon={<ExportOutlined />}
                          style={hydraTextStyleToReactCss(hydraBaseNormal)}
                        >
                          View Product Page
                        </Button>
                      </Flex>
                    </Space>
                  </InnerPanel>
                </Space>
              </Space>
            </div>
          </Col>

          <Col xs={24} lg={8}>
            <div
              style={{
                position: 'sticky',
                top: token.paddingLG,
                alignSelf: 'flex-start',
              }}
            >
              <div style={{ ...variationsRailCardStyle, padding: token.paddingLG, width: '100%' }}>
                {variationRail}
              </div>
            </div>
          </Col>
        </Row>
      ) : null}
    </Space>
  );
}
