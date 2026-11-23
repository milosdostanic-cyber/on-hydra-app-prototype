import { useState, type ReactNode } from 'react';
import { RightOutlined } from '@ant-design/icons';

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

/**
 * Design canvas "T2 · Status on photo": photo on top with the match quality as a status tag (UX-013) in the
 * top-left corner, then two lines: the part name, and one secondary line with the option count as plain text
 * on the right (UX-011). A substitute's caveat is on the tag ("Substitute · check", full text in a tooltip and
 * in the match details), so the secondary line always stays.
 */
function PartTile({
  photoName,
  matchType,
  count,
  countNoun,
  name,
  secondary,
  note,
}: {
  photoName: string;
  matchType: RsfcMatchType;
  count: number;
  /** "option" on competitor part → RSFC (RSFC replacements), "match" on RSFC part → competitor. */
  countNoun: { one: string; plural: string };
  name: string;
  secondary: ReactNode;
  note?: string;
}) {
  const { token } = theme.useToken();
  const small = hydraTextStyleToReactCss(hydraSmallNormal);
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
          src={productImage(photoName)}
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
      </Flex>
      <Flex vertical gap={token.marginXXS} style={{ padding: `${token.paddingXS}px ${token.paddingSM}px ${token.paddingSM}px`, minWidth: 0 }}>
        <Typography.Text style={hydraTextStyleToReactCss(hydraBaseMedium)} ellipsis={{ tooltip: name }}>
          {name}
        </Typography.Text>
        <Flex justify="space-between" align="baseline" gap={token.marginXS} style={{ minWidth: 0 }}>
          <Typography.Text type="secondary" ellipsis style={{ ...small, flex: 1, minWidth: 0 }}>
            {secondary}
          </Typography.Text>
          {count > 1 ? (
            <Typography.Text
              style={{
                ...hydraTextStyleToReactCss(hydraSmallMedium),
                flex: 'none',
                color: token.colorLink,
                display: 'inline-flex',
                alignItems: 'center',
                gap: token.marginXXS,
              }}
            >
              {`${count} ${countNoun.plural}`}
              <RightOutlined aria-hidden style={{ fontSize: token.fontSizeSM }} />
            </Typography.Text>
          ) : (
            <Typography.Text type="secondary" style={{ ...small, flex: 'none' }}>
              {`1 ${countNoun.one}`}
            </Typography.Text>
          )}
        </Flex>
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
        photoName={best.name}
        matchType={best.matchType}
        count={equivalents.length}
        countNoun={{ one: 'option', plural: 'options' }}
        name={best.name}
        secondary={`For ${part.brand} ${part.sku}`}
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
        photoName={part.name}
        matchType={first.matchType}
        count={competitors.length}
        countNoun={{ one: 'match', plural: 'matches' }}
        name={part.name}
        secondary={`Matches ${first.part.brand} ${first.part.sku}`}
      />
    </CardShell>
  );
}
