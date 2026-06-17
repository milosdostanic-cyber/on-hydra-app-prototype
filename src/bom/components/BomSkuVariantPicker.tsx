import { FilePdfOutlined } from '@ant-design/icons';
import { useMemo, type CSSProperties } from 'react';

import { variantMetadataLine } from '../bomMatchSkuUtils';
import { demoSubmittalUrlForFigure } from '../bomWorkspaceDashboard';
import { getSkuVariantsForFigure } from '../data/ascSkuVariants';
import type { AscSkuVariant } from '../data/types';
import { HydraTag } from '../../ui/HydraTag';
import {
  hydraBaseNormal,
  hydraBaseStrong,
  hydraTextStyleToReactCss,
} from '../../theme/hydraTypography';
import { Col, Empty, Flex, Row, Space, Typography, theme } from '../../ui/antd';
import type { GlobalToken } from 'antd/es/theme/interface';

type BomSkuVariantPickerProps = {
  figureNumber: string;
  figureDescription?: string;
  variants?: AscSkuVariant[];
  selectedVariantId?: string;
  onChange: (variantId: string) => void;
  /** `stack` — single column for side panels; default `grid` for modals. */
  layout?: 'grid' | 'stack';
};

export function matchingReviewSelectableCardStyle(
  token: GlobalToken,
  selected: boolean,
): CSSProperties {
  return {
    width: '100%',
    display: 'block',
    textAlign: 'left',
    cursor: 'pointer',
    padding: token.paddingMD,
    borderRadius: token.borderRadiusLG,
    border: `${token.lineWidth}px ${token.lineType} ${
      selected ? token.colorPrimary : token.colorBorderSecondary
    }`,
    background: selected ? token.colorPrimaryBgSubtle : token.colorBgContainer,
    boxShadow: 'none',
    font: 'inherit',
    fontFamily: 'inherit',
    color: 'inherit',
  };
}

function SkuVariantCard({
  variant,
  selected,
  onSelect,
}: {
  variant: AscSkuVariant;
  selected: boolean;
  onSelect: () => void;
}) {
  const { token } = theme.useToken();
  const meta = variantMetadataLine(variant);

  return (
    <button type="button" onClick={onSelect} style={matchingReviewSelectableCardStyle(token, selected)}>
      <Flex vertical gap={token.marginXS} style={{ width: '100%' }}>
        <Flex align="center" justify="space-between" gap={token.marginSM} wrap="wrap">
          <Typography.Text
            style={{
              ...hydraTextStyleToReactCss(hydraBaseStrong),
              color: token.colorTextHeading,
              wordBreak: 'break-word',
            }}
          >
            {variant.sku}
          </Typography.Text>
          {variant.finish ? (
            <HydraTag tone={selected ? 'processing' : 'default'}>{variant.finish}</HydraTag>
          ) : null}
        </Flex>

        <Typography.Text
          style={{
            ...hydraTextStyleToReactCss(hydraBaseNormal),
            color: token.colorText,
            wordBreak: 'break-word',
          }}
        >
          {variant.description}
        </Typography.Text>

        {meta ? (
          <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
            {meta}
          </Typography.Text>
        ) : null}

        {variant.domesticImport !== 'Import' ? (
          <Typography.Link
            href={demoSubmittalUrlForFigure(variant.figureNumber)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              ...hydraTextStyleToReactCss(hydraBaseNormal),
              color: token.colorLink,
            }}
          >
            <FilePdfOutlined aria-hidden /> View submittal
          </Typography.Link>
        ) : null}
      </Flex>
    </button>
  );
}

export function BomSkuVariantPicker({
  figureNumber,
  figureDescription,
  variants: variantsProp,
  selectedVariantId,
  onChange,
  layout = 'grid',
}: BomSkuVariantPickerProps) {
  const { token } = theme.useToken();
  const variants = useMemo(
    () => variantsProp ?? getSkuVariantsForFigure(figureNumber),
    [variantsProp, figureNumber],
  );

  if (variants.length === 0) {
    return (
      <Empty
        description="No SKU variants are available for this figure in the catalog demo."
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  if (layout === 'stack') {
    return (
      <Space orientation="vertical" size={token.marginSM} style={{ width: '100%' }}>
        {variants.map((variant) => (
          <SkuVariantCard
            key={variant.id}
            variant={variant}
            selected={selectedVariantId === variant.id}
            onSelect={() => onChange(variant.id)}
          />
        ))}
      </Space>
    );
  }

  return (
    <Space orientation="vertical" size={token.marginMD} style={{ width: '100%' }}>
      <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
        Figure {figureNumber} · {variants.length} SKU option{variants.length === 1 ? '' : 's'}
        {figureDescription ? ` — ${figureDescription}` : ''}
      </Typography.Text>
      <Row gutter={[token.marginSM, token.marginSM]}>
        {variants.map((variant) => (
          <Col key={variant.id} xs={24} sm={12}>
            <SkuVariantCard
              variant={variant}
              selected={selectedVariantId === variant.id}
              onSelect={() => onChange(variant.id)}
            />
          </Col>
        ))}
      </Row>
    </Space>
  );
}
