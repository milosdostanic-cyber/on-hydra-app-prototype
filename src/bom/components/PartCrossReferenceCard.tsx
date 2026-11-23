import { useState, type ReactNode } from 'react';

import type {
  CompetitorPartResult,
  RsfcMatchType,
  RsfcOrigin,
  RsfcPartResult,
} from '../data/partCrossReferenceData';
import { hydraBaseMedium, hydraSmallMedium, hydraSmallNormal, hydraTextStyleToReactCss } from '../../theme/hydraTypography';
import { HydraColorfulTag, HydraTag } from '../../ui/HydraTag';
import { Card, Flex, Tooltip, Typography, theme } from '../../ui/antd';

/** Sample product photos from the prototype catalog (real PIM images come with the attribute work). */
function productImage(name: string): string {
  return /valve|vlv/i.test(name)
    ? '/assets/catalog/featured-tiles/angle-hose-valve.png'
    : '/assets/catalog/featured-tiles/pipe-fittings-group.png';
}

/** Match quality is a status tag (`Tag__Status`), never a colourful tag or a dot badge (UX-011, UX-013). */
export function MatchTypeTag({ type, label }: { type: RsfcMatchType; label?: string }) {
  return <HydraTag tone={type === 'Exact match' ? 'success' : 'warning'}>{label ?? type}</HydraTag>;
}

export function OriginTag({ origin }: { origin: RsfcOrigin }) {
  return <HydraColorfulTag bordered preset={origin === 'Domestic' ? 'blue' : 'purple'}>{origin}</HydraColorfulTag>;
}

/** Figma photo frame pattern: container fill, secondary border, radius, image set to Fit. Used by the match details modal. */
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
      styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%' } }}
      style={{
        height: '100%',
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

/** The photo and name represent the RSFC part in both search directions. */
function PartTile({
  matchType,
  count,
  countNoun,
  countScope,
  name,
  competitor,
  note,
}: {
  matchType: RsfcMatchType;
  count: number;
  countNoun: { one: string; plural: string };
  countScope: string;
  name: string;
  competitor: string;
  note?: string;
}) {
  const { token } = theme.useToken();
  const small = hydraTextStyleToReactCss(hydraSmallNormal);
  const smallMedium = hydraTextStyleToReactCss(hydraSmallMedium);
  const noun = count === 1 ? countNoun.one : countNoun.plural;
  const photoHeight = token.controlHeightLG * 3;

  return (
    <>
      <Flex
        align="center"
        justify="center"
        style={{
          position: 'relative',
          height: photoHeight,
          flex: 'none',
          padding: `${token.paddingSM}px ${token.paddingLG}px`,
          borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
        }}
      >
        <img
          src={productImage(name)}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
        <span style={{ position: 'absolute', top: token.paddingXS, left: token.paddingXS, display: 'inline-flex' }}>
          <Tooltip title={note}>
            <span>
              <MatchTypeTag type={matchType} label={note ? `${matchType} · check` : undefined} />
            </span>
          </Tooltip>
        </span>
        <span
          title={`${count} ${countScope} ${noun}`}
          style={{ position: 'absolute', top: token.paddingXS, right: token.paddingXS, display: 'inline-flex' }}
        >
          <HydraTag bordered={false}>{`${count} ${noun}`}</HydraTag>
        </span>
      </Flex>
      <Flex vertical gap={token.marginXXS} style={{ padding: `${token.paddingXS}px ${token.paddingSM}px ${token.paddingSM}px`, minWidth: 0 }}>
        <Typography.Text style={hydraTextStyleToReactCss(hydraBaseMedium)} ellipsis={{ tooltip: name }}>
          {name}
        </Typography.Text>
        <Typography.Text
          type="secondary"
          ellipsis={{ tooltip: `Competitor · ${competitor}` }}
          style={small}
        >
          <Typography.Text type="secondary" style={smallMedium}>Competitor</Typography.Text>
          {` · ${competitor}`}
        </Typography.Text>
      </Flex>
    </>
  );
}

/** Competitor part → RSFC: the tile shows the best RSFC match, with the competitor part it replaces as the second line. */
export function CompetitorPartCard({ result, onOpen }: { result: CompetitorPartResult; onOpen: () => void }) {
  const { part, equivalents } = result;
  const best = equivalents[0];

  return (
    <CardShell onOpen={onOpen} label={`View matches for ${part.sku}`}>
      <PartTile
        matchType={best.matchType}
        count={equivalents.length}
        countNoun={{ one: 'option', plural: 'options' }}
        countScope="RSFC"
        name={best.name}
        competitor={`${part.brand} ${part.sku}`}
        note={best.note}
      />
    </CardShell>
  );
}

/** RSFC part → competitor: the tile shows the RSFC part, with its first competitor match as the second line. */
export function RsfcPartCard({ result, onOpen }: { result: RsfcPartResult; onOpen: () => void }) {
  const { part, competitors } = result;
  const first = competitors[0];

  return (
    <CardShell onOpen={onOpen} label={`View matches for ${part.sku}`}>
      <PartTile
        matchType={first.matchType}
        count={competitors.length}
        countNoun={{ one: 'match', plural: 'matches' }}
        countScope="competitor"
        name={part.name}
        competitor={`${first.part.brand} ${first.part.sku}`}
      />
    </CardShell>
  );
}
