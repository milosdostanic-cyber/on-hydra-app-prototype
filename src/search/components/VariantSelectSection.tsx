import { DownOutlined, PictureOutlined } from '@ant-design/icons';
import type { CSSProperties } from 'react';
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

function VariationThumbnail({ variation, size = 28 }: { variation: PartVariationRow; size?: number }) {
  const { token } = theme.useToken();

  if (variation.thumbnailUrl) {
    return (
      <img
        src={variation.thumbnailUrl}
        alt=""
        style={{
          width: size,
          height: size,
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
        width: size,
        height: size,
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

function variationMetadata(variation: PartVariationRow) {
  const preferredKeys = new Set(['nominal-size', 'material', 'finish']);
  const preferred = variation.specifications
    .filter((spec) => preferredKeys.has(spec.key))
    .map((spec) => `${spec.label}: ${spec.value}`)
    .filter((value) => value && value !== variation.name);
  return preferred.slice(0, 3).join(' · ');
}

function optionMetadata(variation: PartVariationRow) {
  const metadata = variationMetadata(variation);
  return metadata ? `Figure: ${variation.sku} · ${metadata}` : `Figure: ${variation.sku}`;
}

/** Interactive "Select Variation" dropdown with thumbnail options. */
export function VariantSelectSection({ detail, selectedVariantKey, onChange }: Props) {
  const { token } = theme.useToken();
  const { colorMode } = useHydraColorMode();
  const accentOrange =
    colorMode === 'dark' ? buttonPrimaryPaletteDark.text : buttonPrimaryPalette.text;
  const primaryPalette = colorMode === 'dark' ? buttonPrimaryPaletteDark : buttonPrimaryPalette;

  const selectedVariation = detail.variations.find((v) => v.key === selectedVariantKey);

  const menuItems: MenuProps['items'] = useMemo(
    () =>
      detail.variations.map((v) => ({
        key: v.key,
        label: (
          <Flex align="flex-start" gap={token.marginSM} style={{ minWidth: 0, paddingBlock: token.paddingXXS }}>
            <VariationThumbnail variation={v} />
            <Flex vertical gap={token.marginXXS} style={{ minWidth: 0 }}>
              <Typography.Text ellipsis style={{ ...hydraTextStyleToReactCss(hydraBaseNormal) }}>
                {v.name}
              </Typography.Text>
              <Typography.Text type="secondary" ellipsis style={hydraTextStyleToReactCss(hydraSmallNormal)}>
                {optionMetadata(v)}
              </Typography.Text>
              <Typography.Text type="secondary" ellipsis style={{ fontSize: token.fontSizeSM }}>
                {v.description}
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

  const selectedTriggerStyle: CSSProperties = {
    width: '100%',
    padding: token.paddingMD,
    textAlign: 'left',
    cursor: 'pointer',
    border: `${token.lineWidth}px ${token.lineType} ${token.colorBorder}`,
    borderRadius: token.borderRadiusLG,
    background: token.colorBgContainer,
    boxShadow: token.boxShadowTertiary,
  };

  const changeVariationControlStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: token.marginXXS,
    alignSelf: 'flex-start',
    paddingBlock: token.paddingXXS,
    paddingInline: token.paddingSM,
    border: `${token.lineWidth}px ${token.lineType} ${primaryPalette.rest}`,
    borderRadius: token.borderRadius,
    background: primaryPalette.rest,
    color: token.colorTextLightSolid,
    fontWeight: token.fontWeightStrong,
  };

  const dropdown = (
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
      {selectedVariation ? (
        <button
          type="button"
          aria-haspopup="listbox"
          aria-label={`Selected variation: ${selectedVariation.name}. Change variation.`}
          style={selectedTriggerStyle}
        >
          <Flex vertical gap={token.marginXS}>
            <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraSmallNormal)}>
              Selected variation
            </Typography.Text>
            <Flex align="flex-start" gap={token.marginSM}>
              <VariationThumbnail variation={selectedVariation} size={40} />
              <Flex vertical gap={token.marginXXS} style={{ minWidth: 0 }}>
                <Typography.Text strong ellipsis style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                  {selectedVariation.name}
                </Typography.Text>
                <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraSmallNormal)}>
                  {optionMetadata(selectedVariation)}
                </Typography.Text>
                <Typography.Text type="secondary" ellipsis style={hydraTextStyleToReactCss(hydraSmallNormal)}>
                  {selectedVariation.description}
                </Typography.Text>
              </Flex>
            </Flex>
            <span style={changeVariationControlStyle}>
              Change variation <DownOutlined aria-hidden />
            </span>
          </Flex>
        </button>
      ) : (
        <Button
          type="primary"
          size="large"
          aria-haspopup="listbox"
          style={{ fontWeight: token.fontWeightStrong, alignSelf: 'flex-start' }}
        >
          Select variation <DownOutlined aria-hidden />
        </Button>
      )}
    </Dropdown>
  );

  return (
    <Flex vertical gap={token.marginSM}>
      <Typography.Text style={cardTitleStyle}>Available Sizes &amp; Variations</Typography.Text>
      <Typography.Paragraph
        type="secondary"
        style={{ margin: 0, ...hydraTextStyleToReactCss(hydraSmallNormal) }}
      >
        Select a size or variation to enable available actions.
      </Typography.Paragraph>

      {dropdown}
    </Flex>
  );
}
