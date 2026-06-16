import { ExportOutlined, LinkOutlined, PictureOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import {
  hydraBaseNormal,
  hydraSmallNormal,
  hydraSmallStrong,
  hydraTextStyleToReactCss,
  hydraTitleHeading2,
  hydraTitleHeading4,
} from '../theme/hydraTypography';
import { PageBackButton } from '../shell/PageBackButton';
import {
  Button,
  Card,
  Col,
  Empty,
  Flex,
  Row,
  Space,
  Typography,
  theme,
} from '../ui/antd';

import { ActionsPanel } from './components/ActionsPanel';
import { VariantSelectSection } from './components/VariantSelectSection';
import { partDetailContentFor, variationByKey } from './partDetailDemoData';
import { unifiedPartByKey } from './unifiedSearchData';

/** Fixed width for the image + actions column (aligned edges). */
const PART_DETAIL_LEFT_COLUMN_WIDTH = 280;

function SpecField({ label, value }: { label: string; value: string }) {
  const { token } = theme.useToken();
  return (
    <div style={{ marginBottom: token.marginMD }}>
      <Typography.Text
        type="secondary"
        style={{
          display: 'block',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: token.marginXXS,
          ...hydraTextStyleToReactCss(hydraSmallNormal),
        }}
      >
        {label}
      </Typography.Text>
      <Typography.Text style={hydraTextStyleToReactCss(hydraBaseNormal)}>{value}</Typography.Text>
    </div>
  );
}

export function UnifiedPartDetailPage() {
  const { token } = theme.useToken();
  const { partId } = useParams<{ partId: string }>();
  const [searchParams] = useSearchParams();
  const deepLinkVariant = searchParams.get('variant');

  const part = partId ? unifiedPartByKey(partId) : undefined;
  const detail = useMemo(() => (part ? partDetailContentFor(part) : null), [part]);
  const figureNumber = part?.sku ?? partId ?? '—';

  const [selectedVariantKey, setSelectedVariantKey] = useState<string | null>(null);

  useEffect(() => {
    if (deepLinkVariant && detail?.variations.some((v) => v.key === deepLinkVariant)) {
      setSelectedVariantKey(deepLinkVariant);
    }
  }, [deepLinkVariant, detail]);

  const selectedVariation = useMemo(
    () => variationByKey(detail, selectedVariantKey),
    [detail, selectedVariantKey],
  );

  const cardShellStyle = {
    background: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
    boxShadow: token.boxShadowTertiary,
  };

  const leftColumnStyle = {
    width: PART_DETAIL_LEFT_COLUMN_WIDTH,
    maxWidth: '100%',
    flexShrink: 0,
  };

  const sectionTitleStyle = {
    margin: 0,
    ...hydraTextStyleToReactCss(hydraTitleHeading4),
    color: token.colorTextHeading,
  };

  const actionsTitleStyle = {
    ...sectionTitleStyle,
    color: token.colorTextSecondary,
  };

  const actionPayload = part
    ? {
        partKey: part.key,
        sku: part.sku,
        displayName: `${part.sku} — ${part.description}`,
        figureNumber: part.sku,
      }
    : null;

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to="/dashboard">Back to home</PageBackButton>

      {!part ? (
        <Empty description="This part is not in the demo catalog. Try another result from search." />
      ) : detail && actionPayload ? (
        <>
          <Flex align="flex-start" gap={token.marginLG} wrap="wrap">
            {/* Fixed left column: image + actions share one width */}
            <Flex vertical gap={token.marginMD} style={leftColumnStyle}>
              <Card
                styles={{ body: { padding: token.padding } }}
                style={{ ...cardShellStyle, width: '100%' }}
              >
                <Flex
                  align="center"
                  justify="center"
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    borderRadius: token.borderRadius,
                    background: token.colorFillAlter,
                    color: token.colorTextQuaternary,
                  }}
                >
                  <Space orientation="vertical" align="center" size={token.marginXS}>
                    <PictureOutlined style={{ fontSize: token.fontSizeHeading2 }} />
                    <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraSmallNormal)}>
                      Product image
                    </Typography.Text>
                  </Space>
                </Flex>
              </Card>

              <Card
                title={<Typography.Text style={actionsTitleStyle}>Actions</Typography.Text>}
                styles={{
                  header: { borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}` },
                  body: { padding: token.paddingMD },
                }}
                style={{ ...cardShellStyle, width: '100%' }}
              >
                <ActionsPanel
                  partKey={part.key}
                  payload={actionPayload}
                  selectedVariation={selectedVariation ?? null}
                />
              </Card>
            </Flex>

            {/* Fluid right column: figure info, variations, product info, specs */}
            <Flex vertical gap={token.marginMD} style={{ flex: '1 1 360px', minWidth: 0 }}>
              <div>
                <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraSmallNormal)}>
                  Figure Number
                </Typography.Text>
                <Typography.Title
                  level={2}
                  style={{ margin: 0, ...hydraTextStyleToReactCss(hydraTitleHeading2) }}
                >
                  {figureNumber}
                </Typography.Title>
              </div>

              <Card styles={{ body: { padding: token.paddingLG } }} style={cardShellStyle}>
                <VariantSelectSection
                  detail={detail}
                  selectedVariantKey={selectedVariantKey}
                  onChange={setSelectedVariantKey}
                />
              </Card>

              <Row gutter={[token.marginLG, token.marginLG]} align="stretch">
                <Col xs={24} md={12}>
                  <Card
                    title={<Typography.Text style={sectionTitleStyle}>Product Info</Typography.Text>}
                    styles={{
                      header: {
                        borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                      },
                      body: { padding: token.paddingLG },
                    }}
                    style={{ ...cardShellStyle, height: '100%' }}
                  >
                    <Space orientation="vertical" size={token.marginMD} style={{ width: '100%' }}>
                      <div>
                        <Typography.Text
                          strong
                          style={{
                            display: 'block',
                            marginBottom: token.marginXXS,
                            ...hydraTextStyleToReactCss(hydraSmallStrong),
                          }}
                        >
                          Product Description
                        </Typography.Text>
                        <Typography.Paragraph style={{ margin: 0, ...hydraTextStyleToReactCss(hydraBaseNormal) }}>
                          {part.description}
                        </Typography.Paragraph>
                      </div>

                      <div>
                        <Typography.Text
                          strong
                          style={{
                            display: 'block',
                            marginBottom: token.marginXXS,
                            ...hydraTextStyleToReactCss(hydraSmallStrong),
                          }}
                        >
                          Part Info
                        </Typography.Text>
                        <Typography.Paragraph style={{ margin: 0, ...hydraTextStyleToReactCss(hydraBaseNormal) }}>
                          {detail.description}
                        </Typography.Paragraph>
                      </div>

                      <div>
                        <Typography.Text
                          strong
                          style={{
                            display: 'block',
                            marginBottom: token.marginXXS,
                            ...hydraTextStyleToReactCss(hydraSmallStrong),
                          }}
                        >
                          Regulatory
                        </Typography.Text>
                        <Typography.Paragraph style={{ margin: 0, ...hydraTextStyleToReactCss(hydraBaseNormal) }}>
                          {detail.regulatory}
                        </Typography.Paragraph>
                      </div>

                      <Flex gap={token.marginMD} wrap="wrap">
                        <Button type="link" icon={<LinkOutlined />} style={{ padding: 0, height: 'auto' }}>
                          View Submittal
                        </Button>
                        <Button type="link" icon={<ExportOutlined />} style={{ padding: 0, height: 'auto' }}>
                          View Product Page
                        </Button>
                      </Flex>
                    </Space>
                  </Card>
                </Col>

                <Col xs={24} md={12}>
                  <Card
                    title={
                      <Typography.Text style={sectionTitleStyle}>
                        Part Information &amp; Technical Specifications
                      </Typography.Text>
                    }
                    styles={{
                      header: {
                        borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                      },
                      body: { padding: token.paddingLG },
                    }}
                    style={{ ...cardShellStyle, height: '100%' }}
                  >
                    <Row gutter={[token.marginMD, token.marginSM]}>
                      {detail.specifications.map((field) => (
                        <Col key={field.key} xs={24} sm={12}>
                          <SpecField label={field.label} value={field.value} />
                        </Col>
                      ))}
                    </Row>
                  </Card>
                </Col>
              </Row>
            </Flex>
          </Flex>
        </>
      ) : null}
    </Space>
  );
}
