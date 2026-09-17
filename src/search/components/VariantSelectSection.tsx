import { CheckOutlined, PictureOutlined, SearchOutlined } from '@ant-design/icons';
import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { InputRef } from 'antd';

import type { PartDetailContent, PartVariationRow } from '../partDetailDemoData';
import { variationSpecValue } from '../partDetailDemoData';
import {
  hydraBaseNormal,
  hydraBaseStrong,
  hydraTextStyleToReactCss,
  hydraTitleHeading4,
  hydraTitleHeading5,
} from '../../theme/hydraTypography';
import { Button, Divider, Flex, Input, Modal, Typography, theme } from '../../ui/antd';

type Props = {
  detail: PartDetailContent;
  selectedVariantKey: string | null;
  onChange: (variantKey: string | null) => void;
  /** Full-width primary CTA — for sticky sidebar layout. */
  ctaFullWidth?: boolean;
  /** Part-detail action row rendered below the variation picker. */
  actions?: ReactNode;
};

const DISTINGUISHING_SPEC_KEYS = ['nominal-size', 'length', 'material', 'finish'] as const;

function normalizePimText(text: string): string {
  return text
    .toLowerCase()
    .replace(/["'`]/g, '')
    .replace(/\b(gal|galv|galvanized)\b/g, 'galv')
    .replace(/\b(at r|atr)\b/g, 'atr')
    .replace(/[^a-z0-9]/g, '');
}

/** PIM often repeats the same product text in name and description with minor abbreviations. */
export function isRedundantPimText(name: string, description: string): boolean {
  if (!name || !description) return true;
  if (name.trim() === description.trim()) return true;

  const normalizedName = normalizePimText(name);
  const normalizedDescription = normalizePimText(description);
  if (!normalizedName || !normalizedDescription) return true;
  if (normalizedName === normalizedDescription) return true;

  const shorter =
    normalizedName.length <= normalizedDescription.length ? normalizedName : normalizedDescription;
  const longer =
    normalizedName.length <= normalizedDescription.length ? normalizedDescription : normalizedName;

  return longer.includes(shorter) && shorter.length / longer.length >= 0.7;
}

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

function compactSpecLine(variation: PartVariationRow): string {
  return DISTINGUISHING_SPEC_KEYS.map((key) => variationSpecValue(variation, key))
    .filter((value): value is string => Boolean(value))
    .join(' · ');
}

function variationCardSubtitle(variation: PartVariationRow): string {
  if (isRedundantPimText(variation.name, variation.description)) {
    return compactSpecLine(variation);
  }
  const specLine = compactSpecLine(variation);
  return specLine ? `${variation.name} · ${specLine}` : variation.name;
}

function variationSearchHaystack(variation: PartVariationRow): string {
  const specText = variation.specifications.map((spec) => `${spec.label} ${spec.value}`).join(' ');
  return [variation.sku, variation.name, variation.description, specText].join(' ').toLowerCase();
}

function SelectedVariationSummary({
  variation,
  thumbnailSize,
}: {
  variation: PartVariationRow;
  thumbnailSize: number;
}) {
  const { token } = theme.useToken();
  const redundantPim = isRedundantPimText(variation.name, variation.description);
  const subtitle = redundantPim ? compactSpecLine(variation) : variation.name;

  const selectedInnerCardStyle: CSSProperties = {
    width: '100%',
    padding: token.padding,
    borderRadius: token.borderRadius,
    background: token.colorBgContainer,
    border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
  };

  return (
    <Flex align="center" gap={token.padding} style={selectedInnerCardStyle}>
      <VariationThumbnail variation={variation} size={thumbnailSize} />
      <Flex vertical gap={0} style={{ minWidth: 0, flex: 1 }}>
        <Typography.Text style={{ ...hydraTextStyleToReactCss(hydraTitleHeading5), margin: 0 }}>
          SKU: {variation.sku}
        </Typography.Text>
        {subtitle ? (
          <Typography.Text type="secondary" ellipsis style={hydraTextStyleToReactCss(hydraBaseNormal)}>
            {subtitle}
          </Typography.Text>
        ) : null}
      </Flex>
    </Flex>
  );
}

/** Figma-aligned variation picker — modal list, SKU-first, compact cards. */
export function VariantSelectSection({
  detail,
  selectedVariantKey,
  onChange,
  ctaFullWidth = false,
  actions,
}: Props) {
  const { token } = theme.useToken();

  const [modalOpen, setModalOpen] = useState(false);
  const [pendingKey, setPendingKey] = useState<string | null>(selectedVariantKey);
  const [searchText, setSearchText] = useState('');
  const searchInputRef = useRef<InputRef>(null);

  const selectedVariation = detail.variations.find((v) => v.key === selectedVariantKey);
  const selectedThumbnailSize = token.controlHeight * 2 + token.marginXXS;
  const listThumbnailSize = token.controlHeight;
  const variationCount = detail.variations.length;

  const sortedVariations = useMemo(
    () => [...detail.variations].sort((a, b) => a.sku.localeCompare(b.sku)),
    [detail.variations],
  );

  const filteredVariations = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return sortedVariations;
    return sortedVariations.filter((variation) => variationSearchHaystack(variation).includes(q));
  }, [sortedVariations, searchText]);

  useEffect(() => {
    if (!modalOpen) return;
    const timer = window.setTimeout(() => searchInputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [modalOpen]);

  function openModal() {
    setPendingKey(selectedVariantKey);
    setSearchText('');
    setModalOpen(true);
  }

  function handleConfirm() {
    onChange(pendingKey);
    setModalOpen(false);
  }

  function handleCancel() {
    setModalOpen(false);
  }

  function confirmSelection(key: string) {
    setPendingKey(key);
    onChange(key);
    setModalOpen(false);
  }

  const sectionHeadingStyle = {
    margin: 0,
    ...hydraTextStyleToReactCss(hydraTitleHeading4),
    color: token.colorText,
  };

  const helperText =
    variationCount > 8
      ? 'This part has many SKU-level variations. Search or scroll the list to find the exact size and finish.'
      : 'Select a size or variation to enable available actions.';

  const resultSummary =
    searchText.trim().length > 0
      ? `${filteredVariations.length} of ${variationCount} variations match your search`
      : `${variationCount} variations available — search by SKU, size, length, material, or finish`;

  return (
    <Flex vertical gap={token.paddingSM} style={{ width: '100%' }}>
      <Flex vertical gap={token.marginXXS}>
        <Typography.Text style={sectionHeadingStyle}>Available Sizes &amp; Variations</Typography.Text>
        <Typography.Paragraph
          style={{
            margin: 0,
            color: token.colorTextLabel,
            ...hydraTextStyleToReactCss(hydraBaseNormal),
          }}
        >
          {helperText}
        </Typography.Paragraph>
      </Flex>

      <Divider style={{ margin: 0 }} />

      {selectedVariation ? (
        <Flex vertical gap={token.paddingSM} style={{ width: '100%' }}>
          <Button
            type="primary"
            size="large"
            block={ctaFullWidth}
            disabled={variationCount === 0}
            aria-label={`Change selected variation: ${selectedVariation.sku}`}
            style={{ fontWeight: token.fontWeightStrong, alignSelf: ctaFullWidth ? undefined : 'flex-start' }}
            onClick={openModal}
          >
            Change variation
          </Button>
          <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
            Selected variation
          </Typography.Text>
          <SelectedVariationSummary variation={selectedVariation} thumbnailSize={selectedThumbnailSize} />
        </Flex>
      ) : (
        <Button
          type="primary"
          size="large"
          block={ctaFullWidth}
          disabled={variationCount === 0}
          style={{ fontWeight: token.fontWeightStrong, alignSelf: ctaFullWidth ? undefined : 'flex-start' }}
          onClick={openModal}
        >
          Select variation
        </Button>
      )}

      {actions ? (
        <>
          <Divider style={{ margin: 0 }} />
          {actions}
        </>
      ) : null}

      <Modal
        open={modalOpen}
        title="Select a variation"
        onCancel={handleCancel}
        width={640}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="confirm" type="primary" disabled={pendingKey === null} onClick={handleConfirm}>
            Confirm selection
          </Button>,
        ]}
      >
        <Flex vertical gap={token.marginMD} style={{ paddingBlock: token.paddingXS }}>
          <Flex vertical gap={token.marginXXS}>
            <Input
              ref={searchInputRef}
              placeholder="Search by SKU, size, length, material, or finish…"
              prefix={<SearchOutlined style={{ color: token.colorTextQuaternary }} />}
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={() => {
                if (pendingKey) handleConfirm();
                else if (filteredVariations[0]) setPendingKey(filteredVariations[0].key);
              }}
            />
            <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
              {resultSummary}
            </Typography.Text>
          </Flex>

          <Flex
            vertical
            gap={token.marginXS}
            style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: token.paddingXXS }}
          >
            {filteredVariations.length === 0 ? (
              <Typography.Text
                type="secondary"
                style={{
                  textAlign: 'center',
                  padding: token.paddingLG,
                  ...hydraTextStyleToReactCss(hydraBaseNormal),
                }}
              >
                No variations match your search. Try a SKU prefix, thread size, or finish.
              </Typography.Text>
            ) : (
              filteredVariations.map((variation) => {
                const isPending = pendingKey === variation.key;
                const subtitle = variationCardSubtitle(variation);

                return (
                  <Flex
                    key={variation.key}
                    align="center"
                    gap={token.marginSM}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isPending}
                    onClick={() => setPendingKey(variation.key)}
                    onDoubleClick={() => confirmSelection(variation.key)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') confirmSelection(variation.key);
                      if (e.key === ' ') setPendingKey(variation.key);
                    }}
                    style={{
                      padding: token.paddingSM,
                      cursor: 'pointer',
                      borderRadius: token.borderRadius,
                      border: `${token.lineWidth}px ${token.lineType} ${isPending ? token.colorPrimary : token.colorBorderSecondary}`,
                      background: isPending ? token.colorPrimaryBg : token.colorBgContainer,
                    }}
                  >
                    <VariationThumbnail variation={variation} size={listThumbnailSize} />
                    <Flex vertical gap={0} style={{ flex: 1, minWidth: 0 }}>
                      <Flex justify="space-between" align="center" gap={token.marginSM}>
                        <Typography.Text ellipsis style={hydraTextStyleToReactCss(hydraBaseStrong)}>
                          SKU: {variation.sku}
                        </Typography.Text>
                        {isPending && (
                          <CheckOutlined style={{ color: token.colorPrimary, flexShrink: 0 }} />
                        )}
                      </Flex>
                      <Typography.Text
                        type="secondary"
                        ellipsis
                        style={hydraTextStyleToReactCss(hydraBaseNormal)}
                      >
                        {subtitle}
                      </Typography.Text>
                    </Flex>
                  </Flex>
                );
              })
            )}
          </Flex>
        </Flex>
      </Modal>
    </Flex>
  );
}
