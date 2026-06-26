import { DownOutlined, PictureOutlined } from '@ant-design/icons';
import { useMemo } from 'react';

import type { PartDetailContent, PartVariationRow } from '../partDetailDemoData';
import { pageDescriptionStyle } from '../../shell/pageDescriptionStyle';
import { Button, Dropdown, Flex, Typography, theme } from '../../ui/antd';
import type { MenuProps } from '../../ui/antd';
import { hydraBaseNormal, hydraTextStyleToReactCss } from '../../theme/hydraTypography';

type Props = {
  detail: PartDetailContent;
  selectedVariantKey: string | null;
  onChange: (variantKey: string | null) => void;
  /** Primary full-width picker in the configure-and-add card. */
  compact?: boolean;
};

function fieldLabelStyle() {
  return {
    ...hydraTextStyleToReactCss(hydraBaseNormal),
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
  };
}

function VariationThumbnail({ variation }: { variation: PartVariationRow }) {
  const { token } = theme.useToken();

  if (variation.thumbnailUrl) {
    return (
      <img
        src={variation.thumbnailUrl}
        alt=""
        style={{
          width: token.controlHeight,
          height: token.controlHeight,
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
        width: token.controlHeight,
        height: token.controlHeight,
        flexShrink: 0,
        borderRadius: token.borderRadiusSM,
        border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
        background: token.colorFillAlter,
        color: token.colorTextQuaternary,
      }}
    >
      <PictureOutlined style={{ fontSize: token.fontSize }} />
    </Flex>
  );
}

function FieldLabel({ children }: { children: string }) {
  const { token } = theme.useToken();
  return (
    <Typography.Text
      type="secondary"
      style={{
        display: 'block',
        marginBottom: token.marginXXS,
        ...fieldLabelStyle(),
      }}
    >
      {children}
    </Typography.Text>
  );
}

function VariationDropdownButton({
  detail,
  selectedVariantKey,
  onChange,
  primary = false,
}: {
  detail: PartDetailContent;
  selectedVariantKey: string | null;
  onChange: (variantKey: string | null) => void;
  primary?: boolean;
}) {
  const { token } = theme.useToken();
  const selectedVariation = detail.variations.find((v) => v.key === selectedVariantKey);

  const menuItems: MenuProps['items'] = useMemo(
    () =>
      detail.variations.map((v) => ({
        key: v.key,
        label: (
          <Flex align="center" gap={token.marginSM} style={{ minWidth: 0, paddingBlock: token.paddingXXS }}>
            <VariationThumbnail variation={v} />
            <Flex vertical gap={0} style={{ minWidth: 0 }}>
              <Typography.Text ellipsis style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                {v.name}
              </Typography.Text>
              <Typography.Text type="secondary" style={pageDescriptionStyle(token)}>
                {v.sku}
              </Typography.Text>
            </Flex>
          </Flex>
        ),
      })),
    [detail.variations, token],
  );

  const buttonLabel = selectedVariation
    ? `${selectedVariation.name} · ${selectedVariation.sku}`
    : 'Select variation';

  return (
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
      <Button
        type={primary ? 'primary' : 'default'}
        size={primary ? 'large' : 'middle'}
        block={primary}
        style={{ fontWeight: primary ? token.fontWeightStrong : undefined }}
      >
        {primary ? (
          <Flex align="center" justify="space-between" gap={token.marginSM} style={{ width: '100%' }}>
            <Typography.Text ellipsis style={{ color: 'inherit', flex: 1, textAlign: 'left' }}>
              {buttonLabel}
            </Typography.Text>
            <DownOutlined />
          </Flex>
        ) : (
          <>
            <Typography.Text ellipsis style={{ maxWidth: token.sizeUnit * 50 }}>
              {buttonLabel}
            </Typography.Text>{' '}
            <DownOutlined />
          </>
        )}
      </Button>
    </Dropdown>
  );
}

/** Variation picker — primary dropdown in configure card, or expanded block with helper copy. */
export function VariantSelectSection({ detail, selectedVariantKey, onChange, compact = false }: Props) {
  const { token } = theme.useToken();

  if (compact) {
    return (
      <div style={{ width: '100%' }}>
        <VariationDropdownButton
          primary
          detail={detail}
          selectedVariantKey={selectedVariantKey}
          onChange={onChange}
        />
      </div>
    );
  }

  return (
    <Flex vertical gap={token.marginXS}>
      <FieldLabel>Available sizes &amp; variations</FieldLabel>
      <Typography.Paragraph type="secondary" style={{ margin: 0, ...pageDescriptionStyle(token) }}>
        Pick the size or finish you need. Specifications are shared; only dimensions differ by
        variation.
      </Typography.Paragraph>
      <VariationDropdownButton
        detail={detail}
        selectedVariantKey={selectedVariantKey}
        onChange={onChange}
      />
    </Flex>
  );
}
