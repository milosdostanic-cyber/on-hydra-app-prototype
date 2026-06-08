import { useMemo } from 'react';

import { variantMetadataLine } from '../bomMatchSkuUtils';
import { getSkuVariantsForFigure } from '../data/ascSkuVariants';
import type { AscSkuVariant } from '../data/types';
import {
  hydraBaseNormal,
  hydraSmallStrong,
  hydraTextStyleToReactCss,
} from '../../theme/hydraTypography';
import { Collapse, Flex, Radio, Space, Typography, theme } from '../../ui/antd';

type BomSkuVariantPickerProps = {
  figureNumber: string;
  figureDescription?: string;
  variants?: AscSkuVariant[];
  selectedVariantId?: string;
  onSelectVariant: (variant: AscSkuVariant) => void;
};

export function BomSkuVariantPicker({
  figureNumber,
  figureDescription,
  variants: variantsProp,
  selectedVariantId,
  onSelectVariant,
}: BomSkuVariantPickerProps) {
  const { token } = theme.useToken();
  const variants = useMemo(
    () => variantsProp ?? getSkuVariantsForFigure(figureNumber),
    [variantsProp, figureNumber],
  );

  if (variants.length === 0) return null;

  const collapseItems = [
    {
      key: 'variants',
      label: (
        <Flex vertical gap={token.marginXXS}>
          <Typography.Text strong style={hydraTextStyleToReactCss(hydraSmallStrong)}>
            Select SKU variant under figure {figureNumber}
          </Typography.Text>
          {figureDescription ? (
            <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
              {figureDescription}
            </Typography.Text>
          ) : null}
        </Flex>
      ),
      children: (
        <Radio.Group
          value={selectedVariantId}
          onChange={(e) => {
            const variant = variants.find((v) => v.id === e.target.value);
            if (variant) onSelectVariant(variant);
          }}
          style={{ width: '100%' }}
        >
          <Space orientation="vertical" size={0} style={{ width: '100%' }}>
            {variants.map((variant) => (
              <Flex
                key={variant.id}
                align="flex-start"
                gap={token.marginSM}
                style={{
                  width: '100%',
                  padding: token.paddingSM,
                  borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                  background:
                    selectedVariantId === variant.id ? token.colorPrimaryBg : token.colorBgContainer,
                }}
              >
                <Radio value={variant.id} style={{ marginTop: token.marginXXS }} />
                <Flex vertical gap={token.marginXXS} style={{ flex: 1, minWidth: 0 }}>
                  <Typography.Text strong>{variant.sku}</Typography.Text>
                  <Typography.Text style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                    {variant.description}
                  </Typography.Text>
                  <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                    {variantMetadataLine(variant)}
                  </Typography.Text>
                </Flex>
              </Flex>
            ))}
          </Space>
        </Radio.Group>
      ),
    },
  ];

  return (
    <Collapse
      defaultActiveKey={['variants']}
      items={collapseItems}
      style={{ width: '100%', background: token.colorBgContainer }}
    />
  );
}
