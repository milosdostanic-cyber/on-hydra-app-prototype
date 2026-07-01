import { ExportOutlined, LinkOutlined, PictureOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import {
  hydraBaseNormal,
  hydraSmallNormal,
  hydraTextStyleToReactCss,
  hydraTitleHeading2,
  hydraTitleHeading4,
  hydraTitleHeading5,
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
  const { token } = theme.useToken();
  return (
    <Flex vertical gap={token.marginXXS}>
      <Typography.Text
        type="secondary"
        style={{
          display: 'block',
          ...hydraTextStyleToReactCss(hydraSmallNormal),
        }}
      >
        {label}
      </Typography.Text>
      <Typography.Text style={hydraTextStyleToReactCss(hydraBaseNormal)}>{value}</Typography.Text>
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
    ...hydraTextStyleToReactCss(hydraTitleHeading5),
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
              <Flex align="center" gap={token.marginLG} wrap="wrap">
                <Card
                  styles={{ body: { padding: token.padding } }}
                  style={{ ...cardShellStyle, flex: '0 0 auto' }}
                >
                  <Flex
                    align="center"
                    justify="center"
                    style={{
                      width: token.controlHeightLG * 3,
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
                    style={{ margin: 0, ...hydraTextStyleToReactCss(hydraBaseNormal) }}
                  >
                    {detail.description}
                  </Typography.Paragraph>
                </Flex>
              </Flex>

              <Space orientation="vertical" size={token.marginSM} style={{ width: '100%' }}>
                <Typography.Text style={sectionTitleStyle}>
                  Information &amp; Technical Specifications
                </Typography.Text>
                <Row gutter={[token.marginLG, token.marginMD]}>
                  {detail.specifications.map((field) => (
                    <Col key={field.key} xs={24} sm={12} lg={6}>
                      <SpecField label={field.label} value={field.value} />
                    </Col>
                  ))}
                </Row>
              </Space>

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

          <Card styles={{ body: { padding: token.paddingLG } }} style={cardShellStyle}>
            <Space orientation="vertical" size={token.marginMD} style={{ width: '100%' }}>
              <VariantSelectSection
                detail={detail}
                selectedVariantKey={selectedVariantKey}
                onChange={setSelectedVariantKey}
              />
              <ActionsPanel
                partKey={part.key}
                payload={actionPayload}
                selectedVariation={selectedVariation ?? null}
              />
            </Space>
          </Card>
        </Space>
      ) : null}
    </Space>
  );
}
