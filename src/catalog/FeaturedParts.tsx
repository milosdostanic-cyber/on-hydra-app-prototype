import { Link } from 'react-router-dom';

import {
  FEATURED_PARTS_FALLBACK_IMAGE_URL,
  FEATURED_PARTS_MIN,
  featuredPartsListForPrototype,
} from './catalogDemoData';
import { Card, Empty, Flex, Space, Typography, theme } from '../ui/antd';

type FeaturedPartsProps = {
  /** Extra line under the PRD-aligned description (e.g. Content vs catalog landing). */
  contextNote?: string;
};

/**
 * Public featured-parts row (PRD): horizontal cards, navigation to part detail, 3–10 items when data allows.
 * Prototype: global ordered list from stub catalog; production would call the public GET API.
 */
export function FeaturedParts({ contextNote }: FeaturedPartsProps) {
  const { token } = theme.useToken();
  const parts = featuredPartsListForPrototype();
  const cardSide = token.controlHeight * 7;

  if (parts.length < FEATURED_PARTS_MIN) {
    return (
      <div>
        <Typography.Title level={4} style={{ marginTop: 0, marginBottom: token.marginSM }}>
          Featured parts
        </Typography.Title>
        <Empty
          description={
            <Space orientation="vertical" size={token.marginXS}>
              <Typography.Text>Featured list is not available yet.</Typography.Text>
              <Typography.Text type="secondary">
                At least {FEATURED_PARTS_MIN} curated parts are required (PRD FR-2). Add catalog rows or
                configure the service list.
              </Typography.Text>
            </Space>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <Typography.Title level={4} style={{ marginTop: 0, marginBottom: token.marginXS }}>
        Featured parts
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginTop: 0, marginBottom: token.marginSM }}>
        Globally curated highlights (prototype: mock data). Production: ordered list from the public featured
        API; admins manage 3–10 parts in the admin panel.
      </Typography.Paragraph>
      {contextNote ? (
        <Typography.Paragraph type="secondary" style={{ marginTop: 0, marginBottom: token.marginSM }}>
          {contextNote}
        </Typography.Paragraph>
      ) : null}
      <div
        role="region"
        aria-label="Featured parts"
        style={{
          overflowX: 'auto',
          width: '100%',
          paddingBottom: token.paddingXS,
          marginBottom: token.marginMD,
        }}
      >
        <Flex gap={token.margin} wrap="nowrap" style={{ width: 'max-content' }}>
          {parts.map((part) => (
            <Link
              key={part.key}
              to={`/catalog/parts/${encodeURIComponent(part.key)}`}
              style={{
                display: 'block',
                flex: '0 0 auto',
                width: cardSide,
                height: cardSide,
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <Card
                hoverable
                size="small"
                style={{
                  width: cardSide,
                  height: cardSide,
                  overflow: 'hidden',
                }}
                styles={{
                  body: {
                    padding: 0,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
                  },
                }}
              >
                <div
                  style={{
                    flex: 1,
                    minHeight: 0,
                    borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                  }}
                >
                  <img
                    src={part.featuredImageUrl ?? FEATURED_PARTS_FALLBACK_IMAGE_URL}
                    alt={`${part.sku}, ASC product category image (asc-es.com/products)`}
                    loading="lazy"
                    decoding="async"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </div>
                <div style={{ flexShrink: 0, padding: token.paddingXS }}>
                  <Typography.Text strong ellipsis style={{ display: 'block', marginBottom: token.marginXXS }}>
                    {part.sku}
                  </Typography.Text>
                  <Typography.Paragraph
                    type="secondary"
                    ellipsis={{ rows: 1 }}
                    style={{ marginBottom: 0 }}
                  >
                    {part.description}
                  </Typography.Paragraph>
                </div>
              </Card>
            </Link>
          ))}
        </Flex>
      </div>
    </div>
  );
}
