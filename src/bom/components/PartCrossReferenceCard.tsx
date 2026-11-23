import { useState, type ReactNode } from 'react';

import { FIGURE_MATCH, summarizeCrossReferenceResult, type CrossReferenceResult, type RsfcMatchType, type RsfcOrigin } from '../data/partCrossReferenceData';
import { hydraBaseMedium, hydraBaseNormal, hydraLargeMedium, hydraTextStyleToReactCss } from '../../theme/hydraTypography';
import { HydraColorfulTag, HydraTag } from '../../ui/HydraTag';
import { Card, Flex, Typography, theme } from '../../ui/antd';

/** Match quality is a status tag (`Tag__Status`), never a colourful tag or a dot badge (UX-011, UX-013). */
export function MatchTypeTag({ type }: { type: RsfcMatchType }) {
  return <HydraTag tone={type === 'Exact match' ? 'success' : 'warning'} bordered={false}>{type}</HydraTag>;
}

export const FIGURE_MATCH_TAG_PRESET = 'geekblue';

export function FigureMatchTag() {
  return <HydraColorfulTag preset={FIGURE_MATCH_TAG_PRESET}>{FIGURE_MATCH}</HydraColorfulTag>;
}

export function CrossReferenceStatusTag({ type }: { type: RsfcMatchType | typeof FIGURE_MATCH }) {
  return type === FIGURE_MATCH ? <FigureMatchTag /> : <MatchTypeTag type={type} />;
}

export function OriginTag({ origin }: { origin: RsfcOrigin }) {
  return <HydraColorfulTag preset={origin === 'Domestic' ? 'blue' : 'purple'}>{origin}</HydraColorfulTag>;
}

/** Figma photo frame pattern: container fill, secondary border, radius, image set to Fit. Used by the match details modal. */
export function PartPhoto({ src, size }: { src: string; size: number }) {
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
      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
    </Flex>
  );
}

/**
 * Same hover as the catalog part cards (FeaturedPartCard): primary 1 px border, tertiary shadow, mid-speed transition.
 * The whole card is the one action (opens the match details): mouse click, or Enter / Space when focused. Focus shows
 * the same border as hover.
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
      styles={{ body: { padding: 0 } }}
      style={{
        cursor: 'pointer',
        overflow: 'hidden',
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

export function PartCrossReferenceCard({ result, onOpen }: { result: CrossReferenceResult; onOpen: () => void }) {
  const { token } = theme.useToken();
  const { brand, description, identifier, identifierLabel, identifierValue, countLabel, matchType } = summarizeCrossReferenceResult(result);
  return (
    <CardShell onOpen={onOpen} label={`View matches for ${brand} ${identifier}`}>
      <Flex
        vertical
        gap={token.marginXXS}
        style={{ paddingBlock: token.padding, paddingInline: token.paddingSM, minWidth: 0 }}
      >
        <Typography.Text
          style={hydraTextStyleToReactCss(hydraLargeMedium)}
          ellipsis={{ tooltip: description }}
        >
          {description}
        </Typography.Text>
        <Typography.Text style={hydraTextStyleToReactCss(hydraBaseNormal)} ellipsis={{ tooltip: `${brand} · ${identifier}` }}>
          {`${brand} · ${identifierLabel} `}
          <Typography.Text style={hydraTextStyleToReactCss(hydraBaseMedium)}>{identifierValue}</Typography.Text>
        </Typography.Text>
      </Flex>
      <Flex
        justify="space-between"
        align="center"
        gap={token.marginXXS}
        style={{
          paddingBlock: token.paddingXS,
          paddingInline: token.paddingSM,
          borderTop: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
          background: token.colorFillAlter,
        }}
      >
        <CrossReferenceStatusTag type={matchType} />
        <HydraTag bordered={false}>{countLabel}</HydraTag>
      </Flex>
    </CardShell>
  );
}
