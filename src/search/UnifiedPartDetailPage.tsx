import { PictureOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import {
  hydraBaseNormal,
  hydraLargeNormal,
  hydraLargeStrong,
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

import { VariantSelectSection } from './components/VariantSelectSection';
import { ActionsPanel } from './components/ActionsPanel';
import { partDetailContentFor, variationByKey } from './partDetailDemoData';
import { unifiedPartByKey } from './unifiedSearchData';

function SpecField({ label, value }: { label: string; value: string }) {
  return (
    <Flex vertical>
      <Typography.Text
        type="secondary"
        style={{
          display: 'block',
          ...hydraTextStyleToReactCss(hydraBaseNormal),
        }}
      >
        {label}
      </Typography.Text>
      <Typography.Text style={hydraTextStyleToReactCss(hydraLargeNormal)}>{value}</Typography.Text>
    </Flex>
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

  const sectionTitleStyle = {
    margin: 0,
    ...hydraTextStyleToReactCss(hydraLargeStrong),
    color: token.colorTextHeading,
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
        <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
          <Card styles={{ body: { padding: token.paddingLG } }} style={cardShellStyle}>
            <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
              <Flex align="center" gap={token.padding} wrap="wrap">
                <Card
                  styles={{ body: { padding: token.padding } }}
                  style={{ ...cardShellStyle, flex: '0 0 auto' }}
                >
                  <Flex
                    align="center"
                    justify="center"
                    style={{
                      width: token.sizeUnit * 30,
                      height: token.sizeUnit * 30,
                      borderRadius: token.borderRadiusSM,
                      background: token.colorFillAlter,
                      color: token.colorTextQuaternary,
                    }}
                  >
                    <Space orientation="vertical" align="center" size={token.marginXS}>
                      <PictureOutlined style={{ fontSize: token.fontSizeHeading2 }} />
                      <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                        Product image
                      </Typography.Text>
                    </Space>
                  </Flex>
                </Card>

                <Flex vertical gap={token.marginXXS} style={{ minWidth: 0, flex: '1 1 360px' }}>
                  <Typography.Title
                    level={2}
                    style={{ margin: 0, ...hydraTextStyleToReactCss(hydraTitleHeading2) }}
                  >
                    {figureNumber}
                  </Typography.Title>
                  <Typography.Title
                    level={4}
                    style={{ margin: 0, ...hydraTextStyleToReactCss(hydraTitleHeading4) }}
                  >
                    {part.description}
                  </Typography.Title>
                  <Typography.Paragraph
                    type="secondary"
                    style={{ margin: 0, ...hydraTextStyleToReactCss(hydraLargeNormal) }}
                  >
                    {detail.description}
                  </Typography.Paragraph>
                </Flex>
              </Flex>

              <Space orientation="vertical" size={token.marginSM} style={{ width: '100%' }}>
                <Typography.Text style={sectionTitleStyle}>
                  Information &amp; Technical Specifications
                </Typography.Text>
                <Row gutter={[0, token.marginMD]}>
                  {detail.specifications.map((field) => (
                    <Col key={field.key} xs={24} sm={12} lg={6}>
                      <SpecField label={field.label} value={field.value} />
                    </Col>
                  ))}
                </Row>
              </Space>

              <Flex gap={token.marginSM} wrap="wrap" align="center">
                <Button type="primary" ghost style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                  View Submittal
                </Button>
                <Button type="primary" ghost style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                  View Product Page
                </Button>
              </Flex>
            </Space>
          </Card>

          <Card styles={{ body: { padding: token.paddingLG } }} style={cardShellStyle}>
            <VariantSelectSection
              detail={detail}
              selectedVariantKey={selectedVariantKey}
              onChange={setSelectedVariantKey}
              actions={
                <ActionsPanel
                  partKey={part.key}
                  payload={actionPayload}
                  selectedVariation={selectedVariation ?? null}
                />
              }
            />
          </Card>
        </Space>
      ) : null}
    </Space>
  );
}
