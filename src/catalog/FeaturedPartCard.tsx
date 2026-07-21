import type { CSSProperties } from 'react';

import {
  hydraBaseNormal,
  hydraTextStyleToReactCss,
  hydraTitleHeading4,
} from '../theme/hydraTypography';
import type { GlobalToken } from 'antd/es/theme/interface';

import { Card, Divider, Flex, Typography, theme } from '../ui/antd';

import { CatalogPartListingLink } from './CatalogPartListingLink';
import { FEATURED_PARTS_FALLBACK_IMAGE_URL } from './catalogDemoData';
import type { CatalogPartRow } from './catalogDemoData';
import { getFeaturedPartCardLayout } from './featuredPartCardLayout';

const VIEW_PART_LISTING_LABEL = 'View Part Listing';

function featuredCardSubtitle(part: CatalogPartRow): string {
  return part.featuredCardSubtitle ?? part.description;
}

function featuredCardBorderStyle(
  token: GlobalToken,
  isHighlighted: boolean,
  onLightSurface = false,
): CSSProperties['border'] {
  const color = isHighlighted
    ? token.colorPrimary
    : onLightSurface
      ? token.colorBorderSecondary
      : 'transparent';
  return `${token.lineWidth}px ${token.lineType} ${color}`;
}

type FeaturedPartCardCopyProps = {
  part: CatalogPartRow;
  layout: ReturnType<typeof getFeaturedPartCardLayout>;
};

function FeaturedPartCardCopy({ part, layout }: FeaturedPartCardCopyProps) {
  const { token } = theme.useToken();
  const titleStyle = { ...hydraTextStyleToReactCss(hydraTitleHeading4), color: token.colorLink };
  const bodyStyle = { ...hydraTextStyleToReactCss(hydraBaseNormal), color: token.colorTextDescription };

  return (
    <Flex vertical gap={layout.copyGap} style={{ flexShrink: 0, minWidth: 0 }}>
      <Typography.Title level={4} ellipsis={{ tooltip: true }} style={{ margin: 0, ...titleStyle }}>
        {part.sku}
      </Typography.Title>
      <Typography.Paragraph
        ellipsis={{ rows: 2, tooltip: true }}
        style={{
          margin: 0,
          minHeight: layout.subtitleMinHeight,
          ...bodyStyle,
          textWrap: 'pretty',
        }}
      >
        {featuredCardSubtitle(part)}
      </Typography.Paragraph>
    </Flex>
  );
}

type FeaturedPartCardFooterProps = {
  layout: ReturnType<typeof getFeaturedPartCardLayout>;
};

function FeaturedPartCardFooter({ layout }: FeaturedPartCardFooterProps) {
  return (
    <Flex vertical style={{ flexShrink: 0, width: '100%' }}>
      <Flex style={{ paddingBlock: layout.dividerInset, flexShrink: 0 }}>
        <Divider style={{ margin: 0, width: '100%' }} />
      </Flex>
      <CatalogPartListingLink tabIndex={-1} preventInteraction>
        {VIEW_PART_LISTING_LABEL}
      </CatalogPartListingLink>
    </Flex>
  );
}

type FeaturedPartCardImageProps = {
  part: CatalogPartRow;
  layout: ReturnType<typeof getFeaturedPartCardLayout>;
};

function FeaturedPartCardImage({ part, layout }: FeaturedPartCardImageProps) {
  const { token } = theme.useToken();

  return (
    <Flex
      align="center"
      justify="center"
      style={{
        flex: `0 0 ${layout.imageColumnWidth}px`,
        width: layout.imageColumnWidth,
        height: '100%',
        padding: layout.imagePadding,
        background: token.colorFillQuaternary,
        borderInlineStart: `${token.lineWidth}px ${token.lineType} ${token.colorSplit}`,
        overflow: 'hidden',
      }}
    >
      <img
        src={part.featuredImageUrl ?? FEATURED_PARTS_FALLBACK_IMAGE_URL}
        alt=""
        loading="lazy"
        decoding="async"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    </Flex>
  );
}

export type FeaturedPartCardProps = {
  part: CatalogPartRow;
  isHighlighted: boolean;
  /** Cards on a white panel need a visible edge so they do not blend into the surface. */
  onLightSurface?: boolean;
  onOpen: () => void;
  onHighlight: () => void;
  onUnhighlight: () => void;
};

/**
 * Horizontal featured catalog card (Figma `Frame 183`) — SKU, 2-line subtitle, divider, link, image.
 * Local catalog composition; reuse on Content and `/catalog` landing.
 */
export function FeaturedPartCard({
  part,
  isHighlighted,
  onLightSurface = false,
  onOpen,
  onHighlight,
  onUnhighlight,
}: FeaturedPartCardProps) {
  const { token } = theme.useToken();
  const layout = getFeaturedPartCardLayout(token);

  return (
    <Card
      bordered={false}
      size="small"
      hoverable={false}
      role="link"
      tabIndex={0}
      aria-label={`Open part listing for ${part.sku}`}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      onMouseEnter={onHighlight}
      onMouseLeave={onUnhighlight}
      onFocus={onHighlight}
      onBlur={onUnhighlight}
      styles={{
        body: {
          padding: 0,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'stretch',
          height: layout.cardHeight,
          minHeight: layout.cardHeight,
        },
      }}
      style={{
        width: '100%',
        height: layout.cardHeight,
        overflow: 'hidden',
        cursor: 'pointer',
        borderRadius: token.borderRadiusLG,
        background: token.colorBgContainer,
        boxShadow: isHighlighted ? token.boxShadowSecondary : token.boxShadowTertiary,
        border: featuredCardBorderStyle(token, isHighlighted, onLightSurface),
        transition: layout.cardChromeTransition,
      }}
    >
      <Flex
        vertical
        justify="space-between"
        style={{
          flex: 1,
          minWidth: 0,
          height: '100%',
          padding: layout.contentPadding,
          overflow: 'hidden',
        }}
      >
        <FeaturedPartCardCopy part={part} layout={layout} />
        <FeaturedPartCardFooter layout={layout} />
      </Flex>
      <FeaturedPartCardImage part={part} layout={layout} />
    </Card>
  );
}
