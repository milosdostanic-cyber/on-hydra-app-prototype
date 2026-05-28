import { DownloadOutlined, RightOutlined, SearchOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { PRODUCT_CATALOG_CATEGORIES } from '../../catalog/productCatalogHierarchy.demo';
import {
  productCatalogCategoryAllPartsPath,
  productCatalogHubPath,
  productCatalogSearchPath,
} from '../../catalog/productCatalogNavigation';
import { FeaturedParts } from '../../catalog/FeaturedParts';
import { hydraFeaturedPartsPanelBgLight } from '../../theme/hydraSemanticColors';
import { shellContentRailStyle } from '../shellContentRail';
import {
  Button,
  Card,
  Divider,
  Flex,
  Input,
  Space,
  Typography,
  message,
  theme,
} from '../../ui/antd';
import { HydraTag } from '../../ui/HydraTag';

import {
  ProductCatalogHeroMultiplyGradient,
  productCatalogHeroImageLuminosityWrapperStyle,
  productCatalogHeroImageObjectCoverStyle,
} from './productCatalogHeroFigmaCover';

const HERO_BG_SRC = '/content-catalog-hero-bg.png';

const RIBBON_LABELS = ['Native Content', 'Trusted Data', 'Open, Free, Unlocked'] as const;

type CategoryCardProps = {
  token: ReturnType<typeof theme.useToken>['token'];
  projectId: string;
  categoryId: string;
  title: string;
  totalParts: number;
  subcategories: { id: string; label: string; partCount: number }[];
  viewAllPartsLabel: string;
};

function CategoryCard({ token, projectId, categoryId, title, totalParts, subcategories, viewAllPartsLabel }: CategoryCardProps) {
  const navigate = useNavigate();
  return (
    <Card
      bordered={false}
      style={{
        borderRadius: token.borderRadiusLG,
        boxShadow: token.boxShadowTertiary,
        overflow: 'hidden',
      }}
      styles={{ body: { padding: 0 } }}
    >
      <Flex
        align="center"
        justify="space-between"
        style={{
          background: token.colorFillQuaternary,
          paddingBlock: token.padding,
          paddingInline: token.paddingLG,
        }}
      >
        <Typography.Title level={4} style={{ margin: 0, color: token.colorLink }}>
          {title}
        </Typography.Title>
        <Flex align="center" gap={token.marginXS}>
          <Button type="text">{`${totalParts} parts`}</Button>
          <Button icon={<DownloadOutlined />} size="large" onClick={() => message.info('Stub: download would start.')}>
            Download All Content
          </Button>
        </Flex>
      </Flex>
      <Flex
        vertical
        gap={token.marginSM}
        style={{
          borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorSplit}`,
          paddingBlock: token.paddingLG,
          paddingInline: token.paddingLG,
        }}
      >
        <Typography.Title level={5} style={{ margin: 0 }}>
          Categories Overview
        </Typography.Title>
        <Flex wrap="wrap" gap={token.marginXS}>
          {subcategories.map((sub) => (
            <Button
              key={sub.id}
              size="large"
              onClick={() => navigate(productCatalogHubPath(projectId, categoryId, sub.id))}
            >
              {`${sub.label} (${sub.partCount})`}
            </Button>
          ))}
        </Flex>
      </Flex>
      <div
        style={{
          background: token.colorFillQuaternary,
          paddingBlock: token.padding,
          paddingInline: token.paddingLG,
        }}
      >
        <Button
          type="link"
          icon={<RightOutlined />}
          iconPosition="end"
          onClick={() => navigate(productCatalogCategoryAllPartsPath(projectId, categoryId))}
          styles={{
            root: {
              padding: 0,
              margin: 0,
              height: 'auto',
              alignSelf: 'flex-start',
            },
          }}
        >
          {viewAllPartsLabel}
        </Button>
      </div>
    </Card>
  );
}

/**
 * Project **Content → Product Catalog** body (below app shell breadcrumbs).
 * Mirrors Figma `02 - CONTENT Flow / Product Catalog` main column — hero, ribbons, categories.
 */
function isProjectContentSearchRoot(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  const parts = normalized.split('/').filter(Boolean);
  return parts.length === 3 && parts[0] === 'projects' && parts[2] === 'content';
}

export function ProductCatalogContent() {
  const { token } = theme.useToken();
  const { pathname } = useLocation();
  const { projectId = '' } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [searchDraft, setSearchDraft] = useState('');
  const showFeaturedParts = isProjectContentSearchRoot(pathname);

  const runSearch = (query?: string) => {
    const next = (query ?? searchDraft).trim() || 'all';
    navigate(productCatalogSearchPath(projectId, next));
  };
  /** Figma hero column 600px + 100px wider search row (`sizeUnit` × 175). */
  const heroContentMaxWidth = token.sizeUnit * 175;
  /** Figma hero horizontal inset (`48` = `paddingLG` × 2). */
  const heroPaddingInline = token.paddingLG + token.paddingLG;
  const heroRibbonTagStyle = {
    paddingBlock: token.paddingXXS,
    paddingInline: token.paddingSM,
  } as const;
  return (
    <Space orientation="vertical" size={0} style={{ width: '100%' }}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          /** Underlay matches Figma main column (`colorBgLayout`); `colorPrimaryBg` skewed multiply stack toward cyan. */
          background: token.colorBgLayout,
          isolation: 'isolate',
        }}
      >
        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={productCatalogHeroImageLuminosityWrapperStyle}>
            <img alt="" src={HERO_BG_SRC} style={productCatalogHeroImageObjectCoverStyle} />
          </div>
          <ProductCatalogHeroMultiplyGradient />
        </div>
        <Flex
          vertical
          align="center"
          gap={token.margin}
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: heroContentMaxWidth,
            marginInline: 'auto',
            paddingBlock: token.paddingLG,
            paddingInline: heroPaddingInline,
          }}
        >
          <Typography.Title level={3} style={{ margin: 0, textAlign: 'center' }}>
            Get Production Level BIM Content
          </Typography.Title>
          <Flex gap={token.marginSM} align="center" style={{ width: '100%' }}>
            <Input
              size="large"
              placeholder="Search by System, Part Number, or Trade"
              prefix={<SearchOutlined style={{ color: token.colorTextPlaceholder }} />}
              style={{ flex: 1, minWidth: 0 }}
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              onPressEnter={() => runSearch()}
            />
            <Button type="primary" size="large" onClick={() => runSearch()}>
              Search
            </Button>
          </Flex>
          <Flex gap={token.marginXS} wrap="wrap" justify="center">
            {RIBBON_LABELS.map((text) => (
              <HydraTag key={text} tone="processing" style={heroRibbonTagStyle}>
                {text}
              </HydraTag>
            ))}
          </Flex>
        </Flex>
      </div>

      <div
        style={{
          width: '100%',
          boxSizing: 'border-box',
          paddingInline: token.paddingLG,
          paddingTop: token.paddingLG,
          paddingBottom: token.paddingLG,
          background: token.colorBgLayout,
        }}
      >
        <div style={shellContentRailStyle}>
          <Flex vertical style={{ width: '100%' }}>
            {showFeaturedParts ? (
              <Flex
                vertical
                style={{
                  width: '100%',
                  padding: token.paddingXL,
                  background: hydraFeaturedPartsPanelBgLight,
                  borderRadius: token.borderRadiusLG,
                  boxShadow: token.boxShadowTertiary,
                  border: `${token.lineWidth}px ${token.lineType} ${token.colorInfoBorder}`,
                }}
              >
                <FeaturedParts emphasized />
              </Flex>
            ) : null}
            {showFeaturedParts ? (
              <Divider
                style={{
                  margin: 0,
                  marginBlock: token.marginXXL,
                  borderColor: token.colorSplit,
                }}
              />
            ) : null}
            <Flex vertical gap={token.marginMD} style={{ width: '100%' }}>
              <Flex align="center" justify="space-between" wrap="wrap" gap={token.marginXS}>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  Categories
                </Typography.Title>
                <Button type="primary" size="large" icon={<DownloadOutlined />} onClick={() => message.info('Stub: download would start.')}>
                  Download All Content
                </Button>
              </Flex>
              <Space orientation="vertical" size={token.marginMD} style={{ width: '100%' }}>
                {PRODUCT_CATALOG_CATEGORIES.map((cat) => (
                  <CategoryCard
                    key={cat.id}
                    token={token}
                    projectId={projectId}
                    categoryId={cat.id}
                    title={cat.title}
                    totalParts={cat.totalParts}
                    subcategories={cat.subcategories.map((s) => ({
                      id: s.id,
                      label: s.label,
                      partCount: s.partCount,
                    }))}
                    viewAllPartsLabel={`View all ${cat.title} parts`}
                  />
                ))}
              </Space>
            </Flex>
          </Flex>
        </div>
      </div>
    </Space>
  );
}
