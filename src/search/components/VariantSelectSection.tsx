import { DownOutlined, PictureOutlined } from '@ant-design/icons';
import type { CSSProperties, ReactNode } from 'react';
import { useMemo } from 'react';

import type { PartDetailContent, PartVariationRow } from '../partDetailDemoData';
import { useHydraColorMode } from '../../context/HydraThemeContext';
import { buttonPrimaryPalette, buttonPrimaryPaletteDark } from '../../theme/buttonPrimaryPalette';
import {
  hydraBaseNormal,
  hydraTextStyleToReactCss,
  hydraTitleHeading4,
  hydraTitleHeading5,
} from '../../theme/hydraTypography';
import { HydraTag } from '../../ui/HydraTag';
import { Button, Dropdown, Flex, Typography, theme } from '../../ui/antd';
import type { MenuProps } from '../../ui/antd';

type Props = {
  detail: PartDetailContent;
  selectedVariantKey: string | null;
  onChange: (variantKey: string | null) => void;
  /** Part-detail action row rendered below the variation picker. */
  actions?: ReactNode;
};

function VariationThumbnail({ variation, size = 28 }: { variation: PartVariationRow; size?: number }) {
  const { token } = theme.useToken();
  const placeholderIconSize =
    size >= token.controlHeight * 2
      ? token.fontSizeHeading3
      : size >= token.sizeUnit * 14
        ? token.fontSizeXL
        : token.fontSizeSM;

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
      <PictureOutlined style={{ fontSize: placeholderIconSize }} />
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
export function VariantSelectSection({ detail, selectedVariantKey, onChange, actions }: Props) {
  const { token } = theme.useToken();
  const { colorMode } = useHydraColorMode();
  const accentOrange =
    colorMode === 'dark' ? buttonPrimaryPaletteDark.text : buttonPrimaryPalette.text;

  const selectedVariation = detail.variations.find((v) => v.key === selectedVariantKey);

  const dropdownThumbnailSize = token.sizeUnit * 14;
  const selectedThumbnailSize = token.controlHeight * 2 + token.marginXXS;

  const menuItems: MenuProps['items'] = useMemo(
    () =>
      detail.variations.map((v) => ({
        key: v.key,
        label: (
          <Flex align="flex-start" gap={token.marginSM} style={{ minWidth: 0, paddingBlock: token.paddingXXS }}>
            <VariationThumbnail variation={v} size={dropdownThumbnailSize} />
            <Flex vertical gap={token.marginXXS} style={{ minWidth: 0 }}>
              <Typography.Text ellipsis style={{ ...hydraTextStyleToReactCss(hydraBaseNormal) }}>
                {v.name}
              </Typography.Text>
              <Typography.Text type="secondary" ellipsis style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                {optionMetadata(v)}
              </Typography.Text>
              <Typography.Text type="secondary" ellipsis style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                {v.description}
              </Typography.Text>
            </Flex>
          </Flex>
        ),
      })),
    [detail.variations, dropdownThumbnailSize, token],
  );

  const cardTitleStyle = {
    margin: 0,
    ...hydraTextStyleToReactCss(hydraTitleHeading4),
    color: accentOrange,
  };

  const selectedPanelStyle: CSSProperties = {
    width: '100%',
    padding: token.paddingMD,
    border: `${token.lineWidth}px ${token.lineType} ${token.colorBorder}`,
    borderRadius: token.borderRadiusLG,
    background: token.colorFillQuaternary,
    boxShadow: token.boxShadowTertiary,
  };

  const selectedInnerCardStyle: CSSProperties = {
    width: '100%',
    padding: token.padding,
    borderRadius: token.borderRadius,
    background: token.colorBgContainer,
    border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
  };

  const dropdownMenu = {
    items: menuItems,
    selectable: true as const,
    selectedKeys: selectedVariantKey ? [selectedVariantKey] : [],
    onSelect: ({ key }: { key: string }) => onChange(String(key)),
  };

  const dropdown = selectedVariation ? (
    <div style={selectedPanelStyle}>
      <Flex vertical gap={token.paddingMD} style={{ width: '100%' }}>
        <Flex vertical gap={token.marginSM} style={{ width: '100%' }}>
          <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
            Selected variation
          </Typography.Text>

          <Flex align="flex-start" gap={token.padding} style={selectedInnerCardStyle}>
            <VariationThumbnail variation={selectedVariation} size={selectedThumbnailSize} />
            <Flex vertical gap={token.marginSM} style={{ minWidth: 0, flex: 1 }}>
              <Typography.Text style={{ ...hydraTextStyleToReactCss(hydraTitleHeading5), margin: 0 }}>
                {selectedVariation.name}
              </Typography.Text>
              <Flex gap={token.marginSM} wrap="wrap">
                <HydraTag bordered={false}>{optionMetadata(selectedVariation)}</HydraTag>
                <HydraTag bordered={false}>{selectedVariation.description}</HydraTag>
              </Flex>
            </Flex>
          </Flex>
        </Flex>

        <Dropdown menu={dropdownMenu} trigger={['click']} disabled={detail.variations.length === 0}>
          <Button
            type="primary"
            size="large"
            icon={<DownOutlined aria-hidden />}
            iconPlacement="end"
            aria-haspopup="listbox"
            aria-label={`Change selected variation: ${selectedVariation.name}`}
            style={{ alignSelf: 'flex-start', width: 'auto', fontWeight: token.fontWeightStrong }}
          >
            Change variation
          </Button>
        </Dropdown>
      </Flex>
    </div>
  ) : (
    <Dropdown menu={dropdownMenu} trigger={['click']} disabled={detail.variations.length === 0}>
      <Button
        type="primary"
        size="large"
        aria-haspopup="listbox"
        style={{ fontWeight: token.fontWeightStrong, alignSelf: 'flex-start' }}
      >
        Select variation <DownOutlined aria-hidden />
      </Button>
    </Dropdown>
  );

  return (
    <Flex vertical gap={token.paddingMD} style={{ width: '100%' }}>
      <Flex vertical gap={token.marginXXS}>
        <Typography.Text style={cardTitleStyle}>Available Sizes &amp; Variations</Typography.Text>
        <Typography.Paragraph
          style={{
            margin: 0,
            color: token.colorTextLabel,
            ...hydraTextStyleToReactCss(hydraBaseNormal),
          }}
        >
          Select a size or variation to enable available actions.
        </Typography.Paragraph>
      </Flex>

      {dropdown}

      {actions}
    </Flex>
  );
}
