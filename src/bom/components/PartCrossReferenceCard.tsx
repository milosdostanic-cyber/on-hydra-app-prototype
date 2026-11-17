import { useState, type ReactNode } from 'react';

import type {
  CompetitorPartResult,
  RsfcEquivalent,
  RsfcMatchType,
  RsfcOrigin,
  RsfcPartResult,
} from '../data/partCrossReferenceData';
import { hydraBaseMedium, hydraSmallNormal, hydraTextStyleToReactCss } from '../../theme/hydraTypography';
import { HydraColorfulTag } from '../../ui/HydraTag';
import { Card, Flex, Typography, theme } from '../../ui/antd';

/** Sample product photos from the prototype catalog (real PIM images come with the attribute work). */
function productImage(name: string): string {
  return /valve|vlv/i.test(name)
    ? '/assets/catalog/featured-tiles/angle-hose-valve.png'
    : '/assets/catalog/featured-tiles/pipe-fittings-group.png';
}

export function MatchTypeTag({ type }: { type: RsfcMatchType }) {
  return <HydraColorfulTag bordered preset={type === 'Exact match' ? 'green' : 'gold'}>{type}</HydraColorfulTag>;
}

export function OriginTag({ origin }: { origin: RsfcOrigin }) {
  return <HydraColorfulTag bordered preset={origin === 'Domestic' ? 'blue' : 'purple'}>{origin}</HydraColorfulTag>;
}

/** Figma photo frame pattern: container fill, secondary border, radius, image set to Fit. */
export function PartPhoto({ name, size }: { name: string; size: number }) {
  const { token } = theme.useToken();
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
        borderRadius: token.borderRadius,
        overflow: 'hidden',
      }}
    >
      <img src={productImage(name)} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
    </Flex>
  );
}

/**
 * Same hover as the catalog part cards (FeaturedPartCard): primary 1 px border, tertiary shadow, mid-speed transition.
 * The whole card is the one action (opens the match details): mouse click, or Enter / Space when focused. Focus shows
 * the same border as hover. There is no separate button; the match count is in the block label ("Best of 2 matches").
 */
function CardShell({ children, onOpen, label }: { children: ReactNode; onOpen: () => void; label: string }) {
  const { token } = theme.useToken();
  const [highlighted, setHighlighted] = useState(false);
  return (
    <Card
      variant="borderless"
      hoverable={false}
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen();
        }
      }}
      onMouseEnter={() => setHighlighted(true)}
      onMouseLeave={() => setHighlighted(false)}
      onFocus={() => setHighlighted(true)}
      onBlur={() => setHighlighted(false)}
      styles={{ body: { padding: token.paddingSM, display: 'flex', flexDirection: 'column', gap: token.paddingSM, height: '100%' } }}
      style={{
        height: '100%',
        cursor: 'pointer',
        borderRadius: token.borderRadiusLG,
        background: token.colorBgContainer,
        boxShadow: token.boxShadowTertiary,
        outline: 'none',
        border: `${token.lineWidth}px ${token.lineType} ${highlighted ? token.colorPrimary : token.colorBorderSecondary}`,
        transition: `box-shadow ${token.motionDurationMid}, border-color ${token.motionDurationMid}`,
      }}
    >
      {children}
    </Card>
  );
}

function meta(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(' · ');
}

/** Soft surface that holds the best match inside the card (Figma B1 "Best RSFC match" block). */
function MatchBlock({ children }: { children: ReactNode }) {
  const { token } = theme.useToken();
  return (
    <Flex
      vertical
      gap={token.marginXS}
      style={{ padding: token.paddingSM, background: token.colorFillAlter, borderRadius: token.borderRadius, flex: 1 }}
    >
      {children}
    </Flex>
  );
}

/** Figma B1 (7655:5453) card: competitor part on top, best RSFC match on a soft surface, footer action with the count. */
export function CompetitorPartCard({ result, onOpen }: { result: CompetitorPartResult; onOpen: () => void }) {
  const { token } = theme.useToken();
  const { part, equivalents } = result;
  const best: RsfcEquivalent = equivalents[0];
  const small = hydraTextStyleToReactCss(hydraSmallNormal);

  return (
    <CardShell onOpen={onOpen} label={`View matches for ${part.sku}`}>
      <Flex vertical gap={token.marginXXS}>
        <Flex justify="space-between" align="baseline" gap={token.marginXS}>
          <Typography.Text style={{ ...hydraTextStyleToReactCss(hydraBaseMedium), flex: 'none' }}>{part.sku}</Typography.Text>
          <Typography.Text type="secondary" ellipsis style={small}>
            {meta(part.brand, `Fig. ${part.figure}`, `Size ${part.size}`)}
          </Typography.Text>
        </Flex>
        <Typography.Text ellipsis={{ tooltip: part.description }}>{part.description}</Typography.Text>
      </Flex>

      <MatchBlock>
        <Flex justify="space-between" align="center" gap={token.marginXS} wrap="wrap">
          <Typography.Text type="secondary" style={small}>
            {equivalents.length > 1 ? `Best of ${equivalents.length} matches` : 'Only match'}
          </Typography.Text>
          <Flex gap={token.marginXXS}>
            <MatchTypeTag type={best.matchType} />
            <OriginTag origin={best.origin} />
          </Flex>
        </Flex>
        <Flex gap={token.marginSM} align="center">
          <PartPhoto name={best.name} size={token.controlHeightLG + token.marginXS} />
          <Flex vertical gap={token.marginXXS} style={{ minWidth: 0 }}>
            <Typography.Text style={hydraTextStyleToReactCss(hydraBaseMedium)} ellipsis={{ tooltip: best.name }}>
              {best.name}
            </Typography.Text>
            <Typography.Text type="secondary" ellipsis style={small}>
              {meta(best.brand, `Fig. ${best.figure}`, `SKU ${best.sku}`)}
            </Typography.Text>
          </Flex>
        </Flex>
      </MatchBlock>

    </CardShell>
  );
}

/** Figma B2 (7655:5560) card: RSFC part on top (80 px photo aligned with its text), best competitor match below. */
export function RsfcPartCard({ result, onOpen }: { result: RsfcPartResult; onOpen: () => void }) {
  const { token } = theme.useToken();
  const { part, competitors } = result;
  const first = competitors[0];
  const small = hydraTextStyleToReactCss(hydraSmallNormal);
  const photo = token.controlHeightLG * 2;

  return (
    <CardShell onOpen={onOpen} label={`View matches for ${part.sku}`}>
      <Flex gap={token.marginSM} align="center">
        <PartPhoto name={part.name} size={photo} />
        <Flex vertical justify="space-between" gap={token.marginXXS} style={{ minWidth: 0, flex: 1, height: photo }}>
          <Flex>
            <OriginTag origin={part.origin} />
          </Flex>
          <Typography.Text style={hydraTextStyleToReactCss(hydraBaseMedium)} ellipsis={{ tooltip: part.name }}>
            {part.name}
          </Typography.Text>
          <Typography.Text type="secondary" ellipsis style={small}>
            {meta(part.brand, `Fig. ${part.figure}`, `SKU ${part.sku}`)}
          </Typography.Text>
        </Flex>
      </Flex>

      <MatchBlock>
        <Typography.Text type="secondary" style={small}>
          {competitors.length > 1 ? `Best of ${competitors.length} matches` : 'Only match'}
        </Typography.Text>
        <Flex gap={token.marginXS} align="center" style={{ minWidth: 0 }}>
          <MatchTypeTag type={first.matchType} />
          <Typography.Text ellipsis style={{ flex: 1, minWidth: 0 }}>
            {meta(first.part.brand, `Fig. ${first.part.figure}`, first.part.sku)}
          </Typography.Text>
        </Flex>
      </MatchBlock>

    </CardShell>
  );
}
