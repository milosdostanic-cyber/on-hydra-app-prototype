import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { catalogPartReturnFrom } from './catalogPartNavigation';
import { featuredPartContentListingPath } from './featuredPartContentListing';

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
import {
  hydraBaseNormal,
  hydraLargeNormal,
  hydraTextStyleToReactCss,
  hydraTitleHeading4,
} from '../theme/hydraTypography';
import { Button, Col, Empty, Flex, Row, Space, Typography, theme } from '../ui/antd';

/** Visible featured cards per page; extra items use the arrows below the grid. */
const FEATURED_GRID_PAGE_SIZE = 6;

type FeaturedPartsProps = {
  /** Appended to the intro line in the same paragraph (e.g. project vs global catalog). */
  contextNote?: string;
};

/**
 * Featured-parts grid — Figma horizontal card layout; up to six cards per view; arrows below when the list is longer.
 */
export function FeaturedParts({ contextNote }: FeaturedPartsProps) {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const partReturnState = useMemo(
    () => catalogPartReturnFrom(`${location.pathname}${location.search}`),
    [location.pathname, location.search],
  );
  const { projectId } = useParams<{ projectId?: string }>();
  const isProjectContentHome = useMemo(() => {
    const n = location.pathname.replace(/\/+$/, '') || '/';
    return /^\/projects\/[^/]+\/content$/.test(n);
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

  useEffect(() => {
    setPage((prev) => Math.min(prev, Math.max(0, pageCount - 1)));
  }, [pageCount, parts.length]);

  const pagedParts = useMemo(() => {
    const start = page * FEATURED_GRID_PAGE_SIZE;
    return parts.slice(start, start + FEATURED_GRID_PAGE_SIZE);
  }, [parts, page]);

  /** Figma featured grid gap 16; flush row edges (no antd `Col` gutter inset on first/last column). */
  const featuredGridGap = token.margin;
  const featuredGridHalfGap = featuredGridGap / 2;

  const sectionHeader = (
    <Flex vertical gap={token.marginXXS} style={{ width: '100%' }}>
      <Flex align="baseline" justify="space-between" wrap="wrap" gap={token.marginSM}>
        <Typography.Title level={4} style={{ margin: 0, ...hydraTextStyleToReactCss(hydraTitleHeading4) }}>
          Featured parts
        </Typography.Title>
        {parts.length >= FEATURED_PARTS_MIN ? (
          <Typography.Text style={{ ...hydraTextStyleToReactCss(hydraBaseNormal), color: token.colorTextDescription }}>
            {parts.length} curated highlight{parts.length !== 1 ? 's' : ''}
          </Typography.Text>
        ) : null}
      </Flex>
      <Typography.Paragraph
        style={{
          margin: 0,
          color: token.colorTextDescription,
          ...hydraTextStyleToReactCss(hydraLargeNormal),
        }}
      >
        Hand-picked catalog entries.{' '}
        {isProjectContentHome
          ? 'Open a card to jump straight to that part’s listing (variants table) in this product catalog.'
          : 'Open a card for downloads and submittal actions on the part page.'}
        {contextNote ? <> {contextNote}</> : null}
      </Typography.Paragraph>
    </Flex>
  );

  if (parts.length < FEATURED_PARTS_MIN) {
    return (
      <Flex vertical gap={token.marginMD} style={{ width: '100%' }}>
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
      </Flex>
    );
  }

  return (
    <Flex vertical gap={token.marginMD} style={{ width: '100%' }}>
      {sectionHeader}

      <Row
        role="region"
        aria-label="Featured parts"
        gutter={[featuredGridGap, featuredGridGap]}
        style={{
          width: `calc(100% + ${featuredGridGap}px)`,
          marginInline: -featuredGridHalfGap,
        }}
      >
        {pagedParts.map((part) => {
          const catalogPartPath = `/catalog/parts/${encodeURIComponent(part.key)}`;
          const contentListingPath =
            isProjectContentHome && projectId
              ? featuredPartContentListingPath(projectId, part.key)
              : undefined;
          const partPath = contentListingPath ?? catalogPartPath;

          return (
            <Col key={part.key} xs={24} sm={12} lg={8} style={{ display: 'flex' }}>
              <FeaturedPartCard
                part={part}
                isHighlighted={highlightedKey === part.key}
                onOpen={() =>
                  navigate(partPath, contentListingPath ? undefined : { state: partReturnState })
                }
                onHighlight={() => setHighlightedKey(part.key)}
                onUnhighlight={() => setHighlightedKey(null)}
              />
            </Col>
          );
        })}
      </Row>

      {pageCount > 1 ? (
        <Flex justify="center" align="center" wrap="wrap" gap={token.marginMD}>
          <Button
            type="default"
            size="large"
            icon={<LeftOutlined />}
            disabled={page <= 0}
            aria-label="Previous featured parts"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          />
          <Typography.Text type="secondary" aria-live="polite">
            {page + 1} / {pageCount}
          </Typography.Text>
          <Button
            type="default"
            size="large"
            icon={<RightOutlined />}
            disabled={page >= pageCount - 1}
            aria-label="Next featured parts"
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
          />
        </Flex>
      ) : null}
    </Flex>
  );
}
