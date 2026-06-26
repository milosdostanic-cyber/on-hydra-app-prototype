import { ExportOutlined, LinkOutlined, PictureOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import { hydraBaseNormal, hydraTextStyleToReactCss } from '../theme/hydraTypography';
import { BomCardTitle } from '../bom/components/BomCardTitle';
import { BomPageHeader } from '../bom/layout/BomPageHeader';
import { PageBackButton } from '../shell/PageBackButton';
import { pageDescriptionStyle } from '../shell/pageDescriptionStyle';
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

import {
  PartDetailActionModals,
  PartDownloadActions,
  PartProjectActions,
  usePartDetailActionFlows,
} from './components/ActionsPanel';
import { VariantSelectSection } from './components/VariantSelectSection';
import { partDetailContentFor, variationByKey, type PartDetailContent } from './partDetailDemoData';
import type { CatalogPartRow } from '../catalog/catalogDemoData';
import type { PartActionPayload } from './usePartActionFlows';
import { unifiedPartByKey } from './unifiedSearchData';

function specFieldLabelStyle() {
  return {
    ...hydraTextStyleToReactCss(hydraBaseNormal),
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
  };
}

function SpecField({ label, value }: { label: string; value: string }) {
  const { token } = theme.useToken();
  return (
    <div>
      <Typography.Text
        type="secondary"
        style={{
          display: 'block',
          marginBottom: token.marginXXS,
          ...specFieldLabelStyle(),
        }}
      >
        {label}
      </Typography.Text>
      <Typography.Text style={hydraTextStyleToReactCss(hydraBaseNormal)}>{value}</Typography.Text>
    </div>
  );
}

function ProductImagePlaceholder() {
  const { token } = theme.useToken();

  return (
    <Flex
      align="center"
      justify="center"
      style={{
        width: token.sizeUnit * 36,
        maxWidth: '100%',
        aspectRatio: '1',
        borderRadius: token.borderRadiusLG,
        background: token.colorFillAlter,
        border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
        color: token.colorTextQuaternary,
        flexShrink: 0,
      }}
    >
      <PictureOutlined style={{ fontSize: token.fontSizeHeading4 }} />
    </Flex>
  );
}

function PartDetailBody({
  part,
  detail,
  actionPayload,
  figureNumber,
  deepLinkVariant,
}: {
  part: CatalogPartRow;
  detail: PartDetailContent;
  actionPayload: PartActionPayload;
  figureNumber: string;
  deepLinkVariant: string | null;
}) {
  const { token } = theme.useToken();
  const [selectedVariantKey, setSelectedVariantKey] = useState<string | null>(null);

  useEffect(() => {
    if (deepLinkVariant && detail.variations.some((v) => v.key === deepLinkVariant)) {
      setSelectedVariantKey(deepLinkVariant);
    }
  }, [deepLinkVariant, detail]);

  const selectedVariation = useMemo(
    () => variationByKey(detail, selectedVariantKey),
    [detail, selectedVariantKey],
  );

  const actionFlows = usePartDetailActionFlows(part.key, actionPayload, selectedVariation ?? null);

  const cardShellStyle = {
    background: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
    boxShadow: token.boxShadowTertiary,
  };

  const cardStyles = {
    header: {
      borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
      paddingInline: token.paddingMD,
      paddingBlock: token.paddingSM,
    },
    body: { padding: token.paddingMD },
  };

  return (
    <>
      <Space orientation="vertical" size={token.marginMD} style={{ width: '100%' }}>
        <Flex align="flex-start" gap={token.marginMD} wrap="wrap" justify="space-between">
          <div style={{ flex: '1 1 280px', minWidth: 0 }}>
            <BomPageHeader
              eyebrow="Figure number"
              title={figureNumber}
              description={part.description}
              titleVariant="heading3"
            />
          </div>
          <ProductImagePlaceholder />
        </Flex>

        <Card
          title={<BomCardTitle>Configure &amp; add</BomCardTitle>}
          styles={cardStyles}
          style={cardShellStyle}
        >
          <Space orientation="vertical" size={token.marginSM} style={{ width: '100%' }}>
            <VariantSelectSection
              compact
              detail={detail}
              selectedVariantKey={selectedVariantKey}
              onChange={setSelectedVariantKey}
            />

            <PartProjectActions
              bare
              figureFlows={actionFlows.figureFlows}
              variantFlows={actionFlows.variantFlows}
              selectedVariation={selectedVariation ?? null}
            />

            {!selectedVariation ? (
              <Typography.Text type="secondary" style={pageDescriptionStyle(token)}>
                Select a variation, then add it to a project or queue files for download.
              </Typography.Text>
            ) : null}

            <Divider style={{ margin: 0 }} />

            <Space orientation="vertical" size={token.marginXS} style={{ width: '100%' }}>
              <Typography.Text type="secondary" style={specFieldLabelStyle()}>
                Download files
              </Typography.Text>
              <PartDownloadActions
                layout="compact"
                figureFlows={actionFlows.figureFlows}
                variantFlows={actionFlows.variantFlows}
                selectedVariation={selectedVariation ?? null}
              />
            </Space>
          </Space>
        </Card>

        <Card title={<BomCardTitle>Part information</BomCardTitle>} styles={cardStyles} style={cardShellStyle}>
          <Space orientation="vertical" size={token.marginMD} style={{ width: '100%' }}>
            <Row gutter={[token.marginMD, token.marginMD]}>
              <Col xs={24} md={12}>
                <SpecField label="Product description" value={part.description} />
              </Col>
              <Col xs={24} md={12}>
                <SpecField label="Part info" value={detail.description} />
              </Col>
              <Col xs={24}>
                <SpecField label="Regulatory" value={detail.regulatory} />
              </Col>
            </Row>

            <Divider style={{ margin: 0 }} />

            <Row gutter={[token.marginMD, token.marginMD]}>
              {detail.specifications.map((field) => (
                <Col key={field.key} xs={24} sm={12} lg={8}>
                  <SpecField label={field.label} value={field.value} />
                </Col>
              ))}
            </Row>

            <Flex gap={token.marginSM} wrap="wrap">
              <Button type="link" icon={<LinkOutlined />} style={{ padding: 0, height: 'auto' }}>
                View submittal
              </Button>
              <Button type="link" icon={<ExportOutlined />} style={{ padding: 0, height: 'auto' }}>
                View product page
              </Button>
            </Flex>
          </Space>
        </Card>
      </Space>
      <PartDetailActionModals {...actionFlows} />
    </>
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
        <PartDetailBody
          part={part}
          detail={detail}
          actionPayload={actionPayload}
          figureNumber={figureNumber}
          deepLinkVariant={deepLinkVariant}
        />
      ) : null}
    </Space>
  );
}
