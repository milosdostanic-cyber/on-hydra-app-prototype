import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { catalogPartReturnFrom, unifiedSearchPartPath } from './catalogPartNavigation';

import {
  FEATURED_PARTS_MAX,
  FEATURED_PARTS_MIN,
} from './catalogDemoData';
import { FeaturedPartCard } from './FeaturedPartCard';
import {
  getPublicFeaturedRowsForSnapshot,
  readFeaturedKeysRawSnapshot,
  subscribeFeaturedPartsKeys,
} from './featuredPartsConfig';
import { BomCardTitle } from '../bom/components/BomCardTitle';
import { PageDescription } from '../shell/PageDescription';
import {
  hydraLargeNormal,
  hydraTextStyleToReactCss,
  hydraTitleHeading3,
} from '../theme/hydraTypography';
import { Button, Col, Empty, Flex, Row, Space, Typography, theme } from '../ui/antd';

/** Visible featured cards per page; extra items use the arrows below the grid. */
const FEATURED_GRID_PAGE_SIZE = 6;
/** Auto-advance carousel interval when more than one page exists. */
const FEATURED_AUTO_ADVANCE_MS = 7000;

function motionDurationToMs(duration: string): number {
  const seconds = /^(\d+(?:\.\d+)?)s$/.exec(duration.trim());
  if (seconds) return Math.round(parseFloat(seconds[1]) * 1000);
  const millis = /^(\d+)ms$/.exec(duration.trim());
  if (millis) return parseInt(millis[1], 10);
  return 200;
}

type FeaturedPartsProps = {
  /** Appended to the intro line in the same paragraph (e.g. project vs global catalog). */
  contextNote?: string;
  /** Stronger hierarchy and spacing when embedded on project Content home. */
  emphasized?: boolean;
  /** Tinted panel, Heading 3 headline, and roomier spacing — global catalog home. */
  panel?: boolean;
};

/**
 * Featured-parts grid — Figma horizontal card layout; up to six cards per view; auto-advances every 7s when paginated.
 */
export function FeaturedParts({ contextNote, emphasized = false, panel = false }: FeaturedPartsProps) {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const partReturnState = useMemo(
    () => catalogPartReturnFrom(`${location.pathname}${location.search}`),
    [location.pathname, location.search],
  );
  const isProjectCatalogHome = useMemo(() => {
    const n = location.pathname.replace(/\/+$/, '') || '/';
    return /^\/projects\/[^/]+\/catalog$/.test(n);
  }, [location.pathname]);
  const storeRaw = useSyncExternalStore(
    subscribeFeaturedPartsKeys,
    readFeaturedKeysRawSnapshot,
    readFeaturedKeysRawSnapshot,
  );
  const parts = useMemo(() => getPublicFeaturedRowsForSnapshot(storeRaw), [storeRaw]);
  const [highlightedKey, setHighlightedKey] = useState<string | null>(null);
  const pageCount = Math.max(1, Math.ceil(parts.length / FEATURED_GRID_PAGE_SIZE));
  const [page, setPage] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const [gridOpacity, setGridOpacity] = useState(1);
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeMs = useMemo(() => motionDurationToMs(token.motionDurationMid), [token.motionDurationMid]);
  const gridFadeTransition = `opacity ${token.motionDurationMid} ${token.motionEaseInOut}`;

  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  const goToPage = useCallback(
    (resolveNext: (current: number) => number) => {
      if (prefersReducedMotion) {
        setPage(resolveNext);
        return;
      }
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
      setGridOpacity(0);
      fadeTimeoutRef.current = setTimeout(() => {
        setPage(resolveNext);
        setGridOpacity(1);
        fadeTimeoutRef.current = null;
      }, fadeMs);
    },
    [fadeMs, prefersReducedMotion],
  );

  const advanceFeaturedPage = useCallback(() => {
    goToPage((p) => (p >= pageCount - 1 ? 0 : p + 1));
  }, [goToPage, pageCount]);

  useEffect(
    () => () => {
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    },
    [],
  );

  useEffect(() => {
    setPage((prev) => Math.min(prev, Math.max(0, pageCount - 1)));
  }, [pageCount, parts.length]);

  useEffect(() => {
    if (pageCount <= 1 || carouselPaused) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const id = window.setInterval(advanceFeaturedPage, FEATURED_AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [advanceFeaturedPage, carouselPaused, pageCount]);

  const pagedParts = useMemo(() => {
    const start = page * FEATURED_GRID_PAGE_SIZE;
    return parts.slice(start, start + FEATURED_GRID_PAGE_SIZE);
  }, [parts, page]);

  /** Figma featured grid gap 16; flush row edges (no antd `Col` gutter inset on first/last column). */
  const isProminent = emphasized || panel;
  const featuredGridGap = isProminent ? token.marginMD : token.margin;
  const featuredGridHalfGap = featuredGridGap / 2;
  const sectionStackGap = isProminent ? token.marginLG : token.marginSM;

  const introCopy = (
    <>
      Hand-picked catalog entries.{' '}
      {isProjectCatalogHome
        ? 'Open a card to add the part to BOM, Submittal, or Download Center.'
        : 'Open a card for downloads and submittal actions on the part page.'}
      {contextNote ? <> {contextNote}</> : null}
    </>
  );

  const sectionHeader = (
    <Flex vertical gap={token.marginXS} style={{ width: '100%' }}>
      <Flex align="baseline" justify="space-between" wrap="wrap" gap={token.marginSM}>
        {isProminent ? (
          <Typography.Title
            level={3}
            style={{ margin: 0, color: token.colorLink, ...hydraTextStyleToReactCss(hydraTitleHeading3) }}
          >
            Featured parts
          </Typography.Title>
        ) : (
          <BomCardTitle>Featured parts</BomCardTitle>
        )}
        {parts.length >= FEATURED_PARTS_MIN ? (
          <Typography.Text type="secondary">
            {parts.length} curated highlight{parts.length !== 1 ? 's' : ''}
          </Typography.Text>
        ) : null}
      </Flex>
      {isProminent ? (
        <Typography.Paragraph
          style={{
            margin: 0,
            color: token.colorTextDescription,
            ...hydraTextStyleToReactCss(hydraLargeNormal),
          }}
        >
          {introCopy}
        </Typography.Paragraph>
      ) : (
        <PageDescription>{introCopy}</PageDescription>
      )}
    </Flex>
  );

  const wrapPanel = (node: ReactNode) =>
    panel ? (
      <div
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: token.paddingLG,
          background: token.colorPrimaryBg,
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadowTertiary,
        }}
      >
        {node}
      </div>
    ) : (
      node
    );

  if (parts.length < FEATURED_PARTS_MIN) {
    return wrapPanel(
      <Flex vertical gap={sectionStackGap} style={{ width: '100%' }}>
        {sectionHeader}
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Space orientation="vertical" size={token.marginXS}>
              <Typography.Text>No featured parts to show</Typography.Text>
              <Typography.Text type="secondary">
                In production, choose {FEATURED_PARTS_MIN}–{FEATURED_PARTS_MAX} catalog parts in Hydra Admin
                under Content → Featured parts, then save. Until then this section stays hidden for visitors.
              </Typography.Text>
            </Space>
          }
        />
      </Flex>,
    );
  }

  return wrapPanel(
    <Flex
      vertical
      gap={sectionStackGap}
      style={{ width: '100%' }}
      onMouseEnter={() => setCarouselPaused(true)}
      onMouseLeave={() => setCarouselPaused(false)}
      onFocusCapture={() => setCarouselPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setCarouselPaused(false);
        }
      }}
    >
      {sectionHeader}

      <div
        style={{
          opacity: gridOpacity,
          transition: prefersReducedMotion ? undefined : gridFadeTransition,
        }}
      >
        <Row
          role="region"
          aria-label="Featured parts"
          aria-roledescription="carousel"
          gutter={[featuredGridGap, featuredGridGap]}
          style={{
            width: `calc(100% + ${featuredGridGap}px)`,
            marginInline: -featuredGridHalfGap,
          }}
        >
          {pagedParts.map((part) => {
          const partPath = unifiedSearchPartPath(part.key);

          return (
            <Col key={part.key} xs={24} sm={12} lg={8} style={{ display: 'flex' }}>
              <FeaturedPartCard
                part={part}
                isHighlighted={highlightedKey === part.key}
                onLightSurface={isProminent}
                onOpen={() => navigate(partPath, { state: partReturnState })}
                onHighlight={() => setHighlightedKey(part.key)}
                onUnhighlight={() => setHighlightedKey(null)}
              />
            </Col>
          );
          })}
        </Row>
      </div>

      {pageCount > 1 ? (
        <Flex justify="center" align="center" wrap="wrap" gap={token.marginMD}>
          <Button
            type="default"
            size="large"
            icon={<LeftOutlined />}
            aria-label="Previous featured parts"
            onClick={() => goToPage((p) => (p <= 0 ? pageCount - 1 : p - 1))}
          />
          <Typography.Text type="secondary" aria-live="polite">
            {page + 1} / {pageCount}
          </Typography.Text>
          <Button
            type="default"
            size="large"
            icon={<RightOutlined />}
            aria-label="Next featured parts"
            onClick={() => goToPage((p) => (p >= pageCount - 1 ? 0 : p + 1))}
          />
        </Flex>
      ) : null}
    </Flex>,
  );
}
