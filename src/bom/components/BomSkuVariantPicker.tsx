import { FilePdfOutlined } from '@ant-design/icons';
import { useMemo } from 'react';

import { variantMetadataLine } from '../bomMatchSkuUtils';
import { demoSubmittalUrlForFigure } from '../bomWorkspaceDashboard';
import { getSkuVariantsForFigure } from '../data/ascSkuVariants';
import type { AscSkuVariant } from '../data/types';
import {
  hydraBaseNormal,
  hydraTextStyleToReactCss,
} from '../../theme/hydraTypography';
import { Flex, Radio, Space, Typography, theme } from '../../ui/antd';

type BomSkuVariantPickerProps = {
  figureNumber: string;
  figureDescription?: string;
  variants?: AscSkuVariant[];
  selectedVariantId?: string;
  onChange: (variantId: string) => void;
};

export function BomSkuVariantPicker({
  figureNumber,
  figureDescription,
  variants: variantsProp,
  selectedVariantId,
  onChange,
}: BomSkuVariantPickerProps) {
  const { token } = theme.useToken();
  const variants = useMemo(
    () => variantsProp ?? getSkuVariantsForFigure(figureNumber),
    [variantsProp, figureNumber],
  );

  if (variants.length === 0) return null;

  return (
    <Space orientation="vertical" size={token.marginSM} style={{ width: '100%' }}>
      <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
        Figure {figureNumber} · {variants.length} SKU option{variants.length === 1 ? '' : 's'}
        {figureDescription ? ` — ${figureDescription}` : ''}
      </Typography.Text>

      <Radio.Group
        value={selectedVariantId}
        onChange={(e) => onChange(e.target.value)}
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
                  selectedVariantId === variant.id ? token.colorPrimaryBgSubtle : token.colorBgContainer,
                borderRadius:
                  selectedVariantId === variant.id ? token.borderRadius : undefined,
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
                <Typography.Link
                  href={demoSubmittalUrlForFigure(variant.figureNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={hydraTextStyleToReactCss(hydraBaseNormal)}
                >
                  <FilePdfOutlined aria-hidden /> Submittal
                </Typography.Link>
              </Flex>
            </Flex>
          ))}
        </Space>
      </Radio.Group>
    </Space>
  );
}
