import { CopyOutlined, FilePdfOutlined, LinkOutlined } from '@ant-design/icons';
import { useState, type KeyboardEvent, type MouseEvent } from 'react';

import {
  FIGURE_MATCH,
  listPrototypeVariantsForFigure,
  rsfcSkuPhoto,
  rsfcSubmittal,
  type CrossReferenceFigure,
  type RsfcEquivalent,
  type RsfcMatchType,
  type RsfcOrigin,
} from '../data/partCrossReferenceData';
import { sizeLabel } from '../data/pimDisplayMapping';
import { hydraBaseMedium, hydraLargeMedium, hydraTextStyleToReactCss } from '../../theme/hydraTypography';
import { HydraColorfulTag, type HydraColorfulPreset } from '../../ui/HydraTag';
import { Alert, Button, Divider, Flex, Typography, message, theme } from '../../ui/antd';

/* -------------------------------------------------------------------------------------------------
 * Tag colours of the RSFC Option Card. One colour per label, the same in Figma and in code.
 * Figma: DS `Tag__Colorful`, border=false; legend "Tag colours · RSFC Option Card" in BOM - RSFC,
 * section "05 · Components", under the "RSFC Option Card" component set (8017:11748).
 * A card shows one match type tag and one origin tag. A new label gets a free preset and is added here and to the
 * Figma legend first.
 * ----------------------------------------------------------------------------------------------- */

export type RsfcOptionTagLabel = RsfcMatchType | typeof FIGURE_MATCH | RsfcOrigin;

export const RSFC_OPTION_TAGS: Readonly<Record<RsfcOptionTagLabel, {
  group: 'Match type' | 'Origin';
  preset: HydraColorfulPreset;
  meaning: string;
}>> = {
  'Exact match': { group: 'Match type', preset: 'green', meaning: 'Same part and size as the competitor SKU' },
  Substitute: { group: 'Match type', preset: 'gold', meaning: 'Works as a replacement, check the specs' },
  [FIGURE_MATCH]: { group: 'Match type', preset: 'blue', meaning: 'Matched by figure number, pick the SKU' },
  Domestic: { group: 'Origin', preset: 'cyan', meaning: 'Domestic product (origin D in the ASC data)' },
  Import: { group: 'Origin', preset: 'purple', meaning: 'Imported product (origin I in the ASC data)' },
};

export function RsfcOptionTag({ label }: { label: RsfcOptionTagLabel }) {
  return <HydraColorfulTag preset={RSFC_OPTION_TAGS[label].preset}>{label}</HydraColorfulTag>;
}

async function copySku(sku: string) {
  try {
    await navigator.clipboard.writeText(sku);
    message.success(`SKU ${sku} copied`);
  } catch {
    message.error('Could not copy the SKU. Select it and copy it by hand.');
  }
}

/** The SKU is the label of its own copy button (Figma "Copy SKU · Hydra Button": default, small, copy icon). */
export function CopySkuButton({ sku }: { sku: string }) {
  return (
    <Button size="small" icon={<CopyOutlined aria-hidden />} aria-label={`Copy SKU ${sku}`} onClick={() => copySku(sku)}>
      {`SKU ${sku}`}
    </Button>
  );
}

function FigureSkuList({ variants }: { variants: RsfcEquivalent[] }) {
  const { token } = theme.useToken();
  return (
    <Flex vertical gap={token.paddingXXS}>
      <Typography.Text type="secondary">Check the size and specifications before choosing a SKU.</Typography.Text>
      {variants.map((variant) => (
        <Flex key={variant.sku} justify="space-between" align="center" gap={token.paddingXS} wrap="wrap">
          <Typography.Text>{sizeLabel(variant.size)}</Typography.Text>
          <CopySkuButton sku={variant.sku} />
        </Flex>
      ))}
    </Flex>
  );
}

/** Figma "Photo" frame: 64 × 64, `colorBgContainer`, `colorBorderSecondary`, small radius, image set to Fit. */
function OptionPhoto({ src }: { src: string }) {
  const { token } = theme.useToken();
  const size = token.controlHeight * 2;
  return (
    <Flex
      align="center"
      justify="center"
      style={{
        flex: '0 0 auto',
        width: size,
        height: size,
        background: token.colorBgContainer,
        border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusSM,
        overflow: 'hidden',
      }}
    >
      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
    </Flex>
  );
}

/** Clicks on the copy button, the links and "Show N SKUs" must not select the card. */
function isInnerControl(target: EventTarget) {
  return target instanceof HTMLElement && target.closest('button, a') !== null;
}

/**
 * Figma BOM - RSFC "RSFC Option Card" (8017:11748), variants state=default, hover and selected.
 * - Card: vertical, gap `paddingXS`, padding `paddingSM`, radius `borderRadiusLG`.
 *   default `colorBgContainer` + `colorBorderSecondary`; hover `colorPrimaryBorderHover` + `boxShadowSecondary`;
 *   selected `colorBgElevated` + `colorPrimary`.
 * - Product row: gap `paddingSM`, photo 64, info column gap `paddingXS`, tags gap `paddingXS`.
 * - Name `Large/Medium` `colorTextHeading`, divider (`paddingXXS` above and below), meta `Base/Medium` `colorText`,
 *   name and meta gap `paddingXXS`.
 * - Divider, then the SKU row: Copy SKU button on the left, link buttons (gap `paddingXXS`) on the right.
 * When `onSelect` is set the whole card is a radio option (click, Enter or Space).
 */
export function RsfcOptionCard({
  part,
  selected = false,
  onSelect,
}: {
  part: RsfcEquivalent | CrossReferenceFigure;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const { token } = theme.useToken();
  const [showSkus, setShowSkus] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const skuPart = 'sku' in part ? part : undefined;
  const name = 'name' in part ? part.name : part.description;
  const photo = 'sku' in part ? rsfcSkuPhoto(part.sku) : part.photo;
  const submittal = rsfcSubmittal(part);
  const productUrl = skuPart?.productUrl;
  const variants = 'sku' in part ? [] : listPrototypeVariantsForFigure(part);
  const meta = [`${part.brand} · Fig. ${part.figure}`, skuPart?.size && sizeLabel(skuPart.size)].filter(Boolean).join(' · ');
  const selectable = Boolean(onSelect);
  const state = selected ? 'selected' : selectable && (hovered || focused) ? 'hover' : 'default';
  const divider = <Divider style={{ margin: 0, marginBlock: token.paddingXXS }} />;

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!onSelect || isInnerControl(event.target)) return;
    onSelect();
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onSelect || event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect();
    }
  };

  return (
    <Flex
      vertical
      gap={token.paddingXS}
      role={selectable ? 'radio' : undefined}
      aria-checked={selectable ? selected : undefined}
      aria-label={selectable ? `${name}, ${meta}` : undefined}
      tabIndex={selectable ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={(event) => event.target === event.currentTarget && setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        boxSizing: 'border-box',
        padding: token.paddingSM,
        background: state === 'selected' ? token.colorBgElevated : token.colorBgContainer,
        border: `${token.lineWidth}px ${token.lineType} ${
          state === 'selected' ? token.colorPrimary : state === 'hover' ? token.colorPrimaryBorderHover : token.colorBorderSecondary
        }`,
        borderRadius: token.borderRadiusLG,
        boxShadow: state === 'hover' ? token.boxShadowSecondary : undefined,
        cursor: selectable ? 'pointer' : undefined,
        outline: 'none',
        transition: `border-color ${token.motionDurationMid}, box-shadow ${token.motionDurationMid}, background ${token.motionDurationMid}`,
      }}
    >
      <Flex gap={token.paddingSM} align="start">
        {photo && <OptionPhoto src={photo} />}
        <Flex vertical gap={token.paddingXS} style={{ flex: '1 1 0', minWidth: 0 }}>
          <Flex gap={token.paddingXS} wrap="wrap">
            <RsfcOptionTag label={skuPart ? skuPart.matchType : FIGURE_MATCH} />
            {skuPart && <RsfcOptionTag label={skuPart.origin} />}
          </Flex>
          <Flex vertical gap={token.paddingXXS}>
            <Typography.Text style={{ ...hydraTextStyleToReactCss(hydraLargeMedium), color: token.colorTextHeading, overflowWrap: 'anywhere' }}>
              {name}
            </Typography.Text>
            {divider}
            <Typography.Text style={{ ...hydraTextStyleToReactCss(hydraBaseMedium), color: token.colorText }}>{meta}</Typography.Text>
          </Flex>
        </Flex>
      </Flex>
      {skuPart?.note && (
        <Alert
          type={skuPart.matchType === 'Substitute' ? 'warning' : 'info'}
          showIcon
          title={skuPart.note.title}
          description={skuPart.note.description}
        />
      )}
      {divider}
      <Flex gap={token.paddingXS} justify="space-between" align="center" wrap="wrap">
        {skuPart && <CopySkuButton sku={skuPart.sku} />}
        {!skuPart && variants.length > 0 && (
          <Button size="small" aria-expanded={showSkus} onClick={() => setShowSkus((open) => !open)}>
            {showSkus ? 'Hide SKUs' : `Show ${variants.length} ${variants.length === 1 ? 'SKU' : 'SKUs'}`}
          </Button>
        )}
        {!skuPart && variants.length === 0 && (
          <Typography.Text type="secondary">No SKUs for this figure in the prototype</Typography.Text>
        )}
        {/* Each link shows only when the ASC data has it: product URL per SKU, submittal PDF per figure. */}
        {(productUrl || submittal) && (
          <Flex gap={token.paddingXXS} wrap="wrap">
            {productUrl && (
              <Button type="link" size="small" href={productUrl} target="_blank" rel="noopener noreferrer" icon={<LinkOutlined aria-hidden />}>
                View Product
              </Button>
            )}
            {submittal && (
              <Button type="link" size="small" href={submittal} target="_blank" rel="noopener noreferrer" icon={<FilePdfOutlined aria-hidden />}>
                Submittal PDF
              </Button>
            )}
          </Flex>
        )}
      </Flex>
      {showSkus && <FigureSkuList variants={variants} />}
    </Flex>
  );
}
