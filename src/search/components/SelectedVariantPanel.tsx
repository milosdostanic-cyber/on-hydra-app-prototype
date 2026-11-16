import type { CSSProperties } from 'react';
import { PictureOutlined } from '@ant-design/icons';

import type { PartSpecField, PartVariationRow } from '../partDetailDemoData';
import {
  hydraBaseNormal,
  hydraSmallNormal,
  hydraSmallStrong,
  hydraTextStyleToReactCss,
  hydraTitleHeading4,
} from '../../theme/hydraTypography';
import { VariantFileActions } from './VariantFileActions';
import { Card, Col, Flex, Row, Space, Typography, theme } from '../../ui/antd';

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

type Props = {
  partKey: string;
  variation: PartVariationRow;
  cardShellStyle: CSSProperties;
};

/** Expanded detail for the selected variant — image, SKU, specs, variant CTAs. */
export function SelectedVariantPanel({ partKey, variation, cardShellStyle }: Props) {
  const { token } = theme.useToken();

  const cardTitleStyle = {
    margin: 0,
    ...hydraTextStyleToReactCss(hydraTitleHeading4),
  };

  return (
    <Card
      title={<Typography.Text style={cardTitleStyle}>Selected variation</Typography.Text>}
      styles={{ header: { borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}` } }}
      style={cardShellStyle}
    >
      <Flex align="flex-start" gap={token.marginLG} wrap="wrap">
        <Flex
          align="center"
          justify="center"
          style={{
            flexShrink: 0,
            width: 200,
            height: 200,
            borderRadius: token.borderRadiusLG,
            border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
            background: token.colorFillAlter,
            color: token.colorTextQuaternary,
          }}
        >
          <Space orientation="vertical" align="center" size={token.marginXS}>
            <PictureOutlined style={{ fontSize: token.fontSizeHeading1 }} />
            <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraSmallNormal)}>
              Variant image
            </Typography.Text>
          </Space>
        </Flex>

        <Flex vertical gap={token.marginSM} style={{ flex: '1 1 280px', minWidth: 0 }}>
          <div>
            <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraSmallNormal)}>
              SKU
            </Typography.Text>
            <Typography.Text
              style={{ display: 'block', ...hydraTextStyleToReactCss(hydraSmallStrong) }}
            >
              {variation.sku}
            </Typography.Text>
          </div>
          <Typography.Paragraph style={{ margin: 0, ...hydraTextStyleToReactCss(hydraBaseNormal) }}>
            {variation.description}
          </Typography.Paragraph>

          <Row gutter={[token.marginLG, token.marginSM]} style={{ width: '100%' }}>
            {variation.specifications.map((field: PartSpecField) => (
              <Col key={field.key} xs={24} sm={12}>
                <SpecField label={field.label} value={field.value} />
              </Col>
            ))}
          </Row>

          <VariantFileActions partKey={partKey} variation={variation} />
        </Flex>
      </Flex>
    </Card>
  );
}
