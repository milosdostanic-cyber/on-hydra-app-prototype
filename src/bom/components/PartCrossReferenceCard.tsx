import { useState, type ReactNode } from 'react';

import { RSFC_OPTION_TAGS, RsfcOptionTag } from './RsfcOptionCard';
import { FIGURE_MATCH, summarizeCrossReferenceResult, type CrossReferenceResult, type RsfcMatchType } from '../data/partCrossReferenceData';
import { hydraBaseMedium, hydraBaseNormal, hydraLargeMedium, hydraTextStyleToReactCss } from '../../theme/hydraTypography';
import { HydraTag } from '../../ui/HydraTag';
import { Card, Flex, Typography, theme } from '../../ui/antd';

/**
 * Results grid and table: match quality is a status tag (`Tag__Status`, UX-013), the same green and gold family as the
 * RSFC Option Card tags. Figure match uses the RSFC Option Card colour (blue) everywhere.
 */
export function MatchTypeTag({ type }: { type: RsfcMatchType }) {
  return <HydraTag tone={type === 'Exact match' ? 'success' : 'warning'} bordered={false}>{type}</HydraTag>;
}

export const FIGURE_MATCH_TAG_PRESET = RSFC_OPTION_TAGS[FIGURE_MATCH].preset;

export function CrossReferenceStatusTag({ type }: { type: RsfcMatchType | typeof FIGURE_MATCH }) {
  return type === FIGURE_MATCH ? <RsfcOptionTag label={FIGURE_MATCH} /> : <MatchTypeTag type={type} />;
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
