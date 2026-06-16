import { DownOutlined, PictureOutlined } from '@ant-design/icons';
import { useMemo } from 'react';

import type { PartDetailContent, PartVariationRow } from '../partDetailDemoData';
import { useHydraColorMode } from '../../context/HydraThemeContext';
import { buttonPrimaryPalette, buttonPrimaryPaletteDark } from '../../theme/buttonPrimaryPalette';
import { Button, Dropdown, Flex, Typography, theme } from '../../ui/antd';
import type { MenuProps } from '../../ui/antd';
import {
  hydraBaseNormal,
  hydraSmallNormal,
  hydraTextStyleToReactCss,
  hydraTitleHeading4,
} from '../../theme/hydraTypography';

type Props = {
  detail: PartDetailContent;
  selectedVariantKey: string | null;
  onChange: (variantKey: string | null) => void;
};

function VariationThumbnail({ variation }: { variation: PartVariationRow }) {
  const { token } = theme.useToken();

  if (variation.thumbnailUrl) {
    return (
      <img
        src={variation.thumbnailUrl}
        alt=""
        style={{
          width: 28,
          height: 28,
          objectFit: 'cover',
          borderRadius: token.borderRadiusSM,
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <Flex
      align="center"
      justify="center"
      style={{
        width: 28,
        height: 28,
        flexShrink: 0,
        borderRadius: token.borderRadiusSM,
        border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
        background: token.colorFillAlter,
        color: token.colorTextQuaternary,
      }}
    >
      <PictureOutlined style={{ fontSize: token.fontSizeSM }} />
    </Flex>
  );
}

/** Interactive "Select Variation" dropdown with thumbnail options. */
export function VariantSelectSection({ detail, selectedVariantKey, onChange }: Props) {
  const { token } = theme.useToken();
  const { colorMode } = useHydraColorMode();
  const accentOrange =
    colorMode === 'dark' ? buttonPrimaryPaletteDark.text : buttonPrimaryPalette.text;

  const selectedVariation = detail.variations.find((v) => v.key === selectedVariantKey);

  const menuItems: MenuProps['items'] = useMemo(
    () =>
      detail.variations.map((v) => ({
        key: v.key,
        label: (
          <Flex align="center" gap={token.marginSM} style={{ minWidth: 0, paddingBlock: token.paddingXXS }}>
            <VariationThumbnail variation={v} />
            <Flex vertical gap={0} style={{ minWidth: 0 }}>
              <Typography.Text ellipsis style={{ ...hydraTextStyleToReactCss(hydraBaseNormal) }}>
                {v.name}
              </Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                {v.sku}
              </Typography.Text>
            </Flex>
          </Flex>
        ),
      })),
    [detail.variations, token],
  );

  const cardTitleStyle = {
    margin: 0,
    ...hydraTextStyleToReactCss(hydraTitleHeading4),
    color: accentOrange,
  };

  return (
    <Flex vertical gap={token.marginSM}>
      <Typography.Text style={cardTitleStyle}>Available Sizes &amp; Variations</Typography.Text>
      <Typography.Paragraph
        type="secondary"
        style={{ margin: 0, ...hydraTextStyleToReactCss(hydraSmallNormal) }}
      >
        View all available product variations. All variations have the same specifications with
        size-specific differences.
      </Typography.Paragraph>

      <Dropdown
        menu={{
          items: menuItems,
          selectable: true,
          selectedKeys: selectedVariantKey ? [selectedVariantKey] : [],
          onSelect: ({ key }) => onChange(String(key)),
        }}
        trigger={['click']}
        disabled={detail.variations.length === 0}
      >
        <Button type="primary" size="large" style={{ fontWeight: token.fontWeightStrong }}>
          {selectedVariation ? selectedVariation.name : 'Select Variation'} <DownOutlined />
        </Button>
      </Dropdown>
    </Flex>
  );
}
