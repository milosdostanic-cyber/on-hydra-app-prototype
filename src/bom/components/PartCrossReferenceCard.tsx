import { useState, type ReactNode } from 'react';

import {
  FIGURE_MATCH,
  crossReferenceFigureLabel,
  rsfcSkuPhoto,
  type CompetitorPartResult,
  type CrossReferenceDirection,
  type FigureMatchResult,
  type RsfcMatchType,
  type RsfcOrigin,
  type RsfcPartResult,
  type UnmatchedCompetitorResult,
} from '../data/partCrossReferenceData';
import { CatalogThumbnailPlaceholder } from '../../catalog/CatalogThumbnailPlaceholder';
import { hydraBaseMedium, hydraSmallMedium, hydraSmallNormal, hydraTextStyleToReactCss } from '../../theme/hydraTypography';
import { HydraColorfulTag, HydraTag } from '../../ui/HydraTag';
import { Card, Flex, Tooltip, Typography, theme } from '../../ui/antd';

/** Match quality is a status tag (`Tag__Status`), never a colourful tag or a dot badge (UX-011, UX-013). */
export function MatchTypeTag({ type, label }: { type: RsfcMatchType; label?: string }) {
  return <HydraTag tone={type === 'Exact match' ? 'success' : 'warning'}>{label ?? type}</HydraTag>;
}

export const FIGURE_MATCH_TAG_PRESET = 'geekblue';

export function FigureMatchTag() {
  return <HydraColorfulTag preset={FIGURE_MATCH_TAG_PRESET} bordered>{FIGURE_MATCH}</HydraColorfulTag>;
}

export function OriginTag({ origin }: { origin: RsfcOrigin }) {
  return <HydraColorfulTag bordered preset={origin === 'Domestic' ? 'blue' : 'purple'}>{origin}</HydraColorfulTag>;
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

function SkuMatchTag({ type, note }: { type: RsfcMatchType; note?: string }) {
  return (
    <Tooltip title={note}>
      <span><MatchTypeTag type={type} label={`SKU · ${type}`} /></span>
    </Tooltip>
  );
}

/** Lead with the part the user can look up on this tab. */
function PartTile({
  direction,
  status,
  count,
  countNoun,
  countScope,
  rsfc,
  rsfcDescription,
  competitor,
  photo,
}: {
  direction: CrossReferenceDirection;
  status: ReactNode;
  count: number;
  countNoun: { one: string; plural: string };
  countScope: string;
  rsfc: string;
  rsfcDescription: string;
  competitor: string;
  photo?: string;
}) {
  const { token } = theme.useToken();
  const small = hydraTextStyleToReactCss(hydraSmallNormal);
  const smallMedium = hydraTextStyleToReactCss(hydraSmallMedium);
  const noun = count === 1 ? countNoun.one : countNoun.plural;
  const rsfcSource = direction === 'rsfc';
  const source = rsfcSource ? `RSFC · ${rsfc}` : `Competitor · ${competitor}`;
  const matchLabel = rsfcSource ? 'Competitor' : 'RSFC';
  const match = rsfcSource ? competitor : rsfc;
  const sourcePadding = rsfcSource ? token.paddingXXS : token.paddingSM;
  const [failedPhoto, setFailedPhoto] = useState<string>();
  const imageSrc = photo !== failedPhoto ? photo : undefined;

  return (
    <Flex vertical>
      <Flex
        align="center"
        justify="space-between"
        gap={token.paddingXXS}
        style={{ padding: token.paddingXS, paddingBottom: 0 }}
      >
        {status}
        {count > 0 && (
          <span title={`${count} ${countScope} ${noun}`}>
            <HydraTag bordered={false}>{`${count} ${noun}`}</HydraTag>
          </span>
        )}
      </Flex>
      {rsfcSource && (
        <Flex
          align="center"
          justify="center"
          style={{
            height: token.controlHeightLG * 2 + token.paddingXS,
            paddingInline: token.paddingLG,
            paddingBottom: token.paddingXS,
          }}
        >
          {imageSrc ? (
            <img
              src={imageSrc}
              alt=""
              onError={() => setFailedPhoto(imageSrc)}
              style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <Flex vertical align="center" gap={token.paddingXXS}>
              <span aria-hidden="true"><CatalogThumbnailPlaceholder sizePx={token.controlHeightLG} /></span>
              <Typography.Text type="secondary" style={small}>No photo available</Typography.Text>
            </Flex>
          )}
        </Flex>
      )}
      <Flex vertical style={{ padding: `${sourcePadding}px ${token.paddingSM}px`, minWidth: 0 }}>
        <Typography.Text
          title={rsfcSource ? rsfcDescription : undefined}
          style={hydraTextStyleToReactCss(hydraBaseMedium)}
          ellipsis={{ tooltip: source }}
        >
          {source}
        </Typography.Text>
      </Flex>
      <Flex
        vertical
        style={{
          padding: `${token.paddingXS}px ${token.paddingSM}px`,
          borderTop: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
          background: token.colorFillAlter,
          minWidth: 0,
        }}
      >
        <Typography.Text
          title={rsfcSource ? undefined : rsfcDescription}
          ellipsis={{ tooltip: `${matchLabel} · ${match}` }}
          style={small}
        >
          <Typography.Text style={smallMedium}>{matchLabel}</Typography.Text>
          {` · ${match}`}
        </Typography.Text>
      </Flex>
    </Flex>
  );
}

export function CompetitorPartCard({ result, onOpen }: { result: CompetitorPartResult; onOpen: () => void }) {
  const { part, equivalents } = result;
  const best = equivalents[0];

  return (
    <CardShell onOpen={onOpen} label={`View matches for ${part.sku} (SKU match)`}>
      <PartTile
        direction="competitor"
        status={<SkuMatchTag type={best.matchType} note={best.note?.description} />}
        count={equivalents.length}
        countNoun={{ one: 'option', plural: 'options' }}
        countScope="RSFC"
        rsfc={`${best.brand} SKU ${best.sku}`}
        rsfcDescription={best.name}
        competitor={`${part.brand} SKU ${part.sku}`}
      />
    </CardShell>
  );
}

export function RsfcPartCard({ result, onOpen }: { result: RsfcPartResult; onOpen: () => void }) {
  const { part, competitors } = result;
  const first = competitors[0];
  const note = first.part.equivalents.find((equivalent) => equivalent.sku === part.sku)?.note?.description;

  return (
    <CardShell onOpen={onOpen} label={`View matches for ${part.sku} (SKU match)`}>
      <PartTile
        direction="rsfc"
        status={<SkuMatchTag type={first.matchType} note={note} />}
        count={competitors.length}
        countNoun={{ one: 'match', plural: 'matches' }}
        countScope="competitor"
        rsfc={`${part.brand} SKU ${part.sku}`}
        rsfcDescription={part.name}
        competitor={`${first.part.brand} SKU ${first.part.sku}`}
        photo={rsfcSkuPhoto(part.sku)}
      />
    </CardShell>
  );
}

export function FigureMatchCard({ result, onOpen }: { result: FigureMatchResult; onOpen: () => void }) {
  const { direction, source, targets } = result;
  const reverse = direction === 'rsfc';
  const rsfc = reverse ? source : targets[0];
  const competitor = reverse ? targets[0] : source;

  return (
    <CardShell onOpen={onOpen} label={`View matches for ${crossReferenceFigureLabel(source)} (Figure match)`}>
      <PartTile
        direction={direction}
        status={<FigureMatchTag />}
        count={targets.length}
        countNoun={{ one: 'figure', plural: 'figures' }}
        countScope={reverse ? 'competitor' : 'RSFC'}
        rsfc={crossReferenceFigureLabel(rsfc)}
        rsfcDescription={rsfc.description}
        competitor={crossReferenceFigureLabel(competitor)}
        photo={rsfc.photo}
      />
    </CardShell>
  );
}

export function UnmatchedCompetitorCard({ result, onOpen }: { result: UnmatchedCompetitorResult; onOpen: () => void }) {
  const { part } = result;

  return (
    <CardShell onOpen={onOpen} label={`View lookup details for ${part.sku} (no verified match)`}>
      <PartTile
        direction="competitor"
        status={<HydraTag>No verified match</HydraTag>}
        count={0}
        countNoun={{ one: 'option', plural: 'options' }}
        countScope="RSFC"
        rsfc="No verified replacement"
        rsfcDescription="No verified RSFC replacement is available in the prototype for this SKU."
        competitor={`${part.brand} SKU ${part.sku}`}
      />
    </CardShell>
  );
}
