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

/** Figma 72 px photo frame (BOM - RSFC): container fill, secondary border, radius, image set to Fit. */
const PHOTO = 72;

function PartPhoto({ name }: { name: string }) {
  const { token } = theme.useToken();
  return (
    <Flex
      align="center"
      justify="center"
      style={{
        flex: '0 0 auto',
        width: PHOTO,
        height: PHOTO,
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
 * The whole card is the one action (opens match details), like the catalog part cards (FeaturedPartCard):
 * no separate footer button. Hover and keyboard focus: 1 px primary border, tertiary shadow, mid-speed transition.
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
        outline: 'none',
        borderRadius: token.borderRadiusLG,
        background: token.colorBgContainer,
        boxShadow: token.boxShadowTertiary,
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

/** Section heading on a hairline: "Best of 2 RSFC matches ────". Separates the two parts and carries the count. */
function SectionRule({ children }: { children: ReactNode }) {
  const { token } = theme.useToken();
  return (
    <Flex align="center" gap={token.marginXS}>
      <Typography.Text type="secondary" style={{ ...hydraTextStyleToReactCss(hydraSmallNormal), flex: 'none' }}>
        {children}
      </Typography.Text>
      <div aria-hidden style={{ flex: 1, height: token.lineWidth, background: token.colorBorderSecondary }} />
    </Flex>
  );
}

/**
 * Photo row: 72 px photo beside exactly three lines, top and bottom edges aligned with the photo.
 * Line 1 = tags (with an optional short label on the left), line 2 = part name, line 3 = metadata.
 */
function PhotoRow({ photoOf, label, tags, name, details }: { photoOf: string; label?: ReactNode; tags: ReactNode; name: string; details: string }) {
  const { token } = theme.useToken();
  const small = hydraTextStyleToReactCss(hydraSmallNormal);
  return (
    <Flex gap={token.marginSM} align="center">
      <PartPhoto name={photoOf} />
      <Flex vertical justify="space-between" style={{ flex: 1, minWidth: 0, height: PHOTO }}>
        <Flex justify={label ? 'space-between' : 'flex-start'} align="center" gap={token.marginXS} style={{ minWidth: 0 }}>
          {label ? (
            <Typography.Text type="secondary" style={{ ...small, flex: 'none' }}>
              {label}
            </Typography.Text>
          ) : null}
          <Flex gap={token.marginXXS} style={{ flex: 'none' }}>
            {tags}
          </Flex>
        </Flex>
        <Typography.Text style={hydraTextStyleToReactCss(hydraBaseMedium)} ellipsis={{ tooltip: name }}>
          {name}
        </Typography.Text>
        <Typography.Text type="secondary" ellipsis style={small}>
          {details}
        </Typography.Text>
      </Flex>
    </Flex>
  );
}

/**
 * Figma B1 (7655:5453), distilled 17 Nov 2026: competitor part (2 lines), a section rule with the match count
 * ("Best of 2 RSFC matches"), then the best RSFC match as one photo row.
 */
export function CompetitorPartCard({ result, onOpen }: { result: CompetitorPartResult; onOpen: () => void }) {
  const { token } = theme.useToken();
  const { part, equivalents } = result;
  const best: RsfcEquivalent = equivalents[0];

  return (
    <CardShell onOpen={onOpen} label={`View matches for ${part.sku}`}>
      <Flex vertical gap={token.marginXXS}>
        <Flex justify="space-between" align="baseline" gap={token.marginXS}>
          <Typography.Text style={{ ...hydraTextStyleToReactCss(hydraBaseMedium), flex: 'none' }}>{part.sku}</Typography.Text>
          <Typography.Text type="secondary" ellipsis style={hydraTextStyleToReactCss(hydraSmallNormal)}>
            {meta(part.brand, `Fig. ${part.figure}`, `Size ${part.size}`)}
          </Typography.Text>
        </Flex>
        <Typography.Text ellipsis={{ tooltip: part.description }}>{part.description}</Typography.Text>
      </Flex>

      <Flex vertical gap={token.marginXS}>
        <SectionRule>{equivalents.length > 1 ? `Best of ${equivalents.length} RSFC matches` : 'RSFC match'}</SectionRule>
        <PhotoRow
        photoOf={best.name}
        tags={
          <>
            <MatchTypeTag type={best.matchType} />
            <OriginTag origin={best.origin} />
          </>
        }
        name={best.name}
        details={meta(best.brand, `Fig. ${best.figure}`, `SKU ${best.sku}`)}
        />
      </Flex>
    </CardShell>
  );
}

/** Figma B2 (7655:5560), distilled 17 Nov 2026: RSFC part as a photo row, a section rule with the count, then its best competitor match. */
export function RsfcPartCard({ result, onOpen }: { result: RsfcPartResult; onOpen: () => void }) {
  const { token } = theme.useToken();
  const { part, competitors } = result;
  const first = competitors[0];

  return (
    <CardShell onOpen={onOpen} label={`View matches for ${part.sku}`}>
      <PhotoRow
        photoOf={part.name}
        label="RSFC part"
        tags={<OriginTag origin={part.origin} />}
        name={part.name}
        details={meta(part.brand, `Fig. ${part.figure}`, `SKU ${part.sku}`)}
      />

      <Flex vertical gap={token.marginXS}>
        <SectionRule>{competitors.length > 1 ? `Best of ${competitors.length} competitor matches` : 'Competitor match'}</SectionRule>
        <Flex gap={token.marginXS} align="center" style={{ minWidth: 0 }}>
          <MatchTypeTag type={first.matchType} />
          <Typography.Text ellipsis style={{ flex: 1, minWidth: 0 }}>
            {meta(first.part.brand, `Fig. ${first.part.figure}`, first.part.sku)}
          </Typography.Text>
        </Flex>
      </Flex>
    </CardShell>
  );
}
