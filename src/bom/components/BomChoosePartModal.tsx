import { PictureOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';

import {
  excludeSuggestedBrowserProducts,
  filterAscBrowserProducts,
  getBomChooseAlternativeProducts,
  getBomChooseFeaturedProducts,
} from '../bomChoosePartUtils';
import { ASC_BROWSER_PRODUCTS, type AscBrowserProductRow } from '../data/ascBrowserProducts';
import type { BomItem, BomMatchResult } from '../data/types';
import { HydraTag } from '../../ui/HydraTag';
import {
  hydraBaseNormal,
  hydraBaseStrong,
  hydraLargeStrong,
  hydraTextStyleToReactCss,
} from '../../theme/hydraTypography';
import {
  AppSearchInput,
  INLINE_SEARCH_CONTROL_SIZE,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Flex,
  Modal,
  Row,
  Space,
  Typography,
  theme,
} from '../../ui/antd';

type BomChoosePartModalProps = {
  open: boolean;
  matchRow: BomMatchResult | null;
  parsedItem?: BomItem;
  onClose: () => void;
  onSelectPart: (product: AscBrowserProductRow) => void;
  /** Footer back link — defaults to matching-flow copy. */
  backLabel?: string;
};

const FEATURED_CATEGORY_LABEL: Record<AscBrowserProductRow['browserCategory'], string> = {
  'pre-engineered': 'Pre-engineered kits',
  'individual-parts': 'Individual parts',
  'quantity-parts': 'Bulk / quantity parts',
};

function ChoosePartCard({
  product,
  selected,
  onSelect,
  compact,
}: {
  product: AscBrowserProductRow;
  selected: boolean;
  onSelect: () => void;
  compact?: boolean;
}) {
  const { token } = theme.useToken();

  return (
    <Card
      hoverable
      size="small"
      onClick={onSelect}
      styles={{
        body: { padding: compact ? token.paddingXS : token.paddingSM },
      }}
      style={{
        borderColor: selected ? token.colorPrimary : token.colorBorderSecondary,
        background: selected ? token.colorPrimaryBgSubtle : token.colorBgContainer,
        boxShadow: selected ? token.boxShadowSecondary : token.boxShadowTertiary,
        cursor: 'pointer',
      }}
    >
      <Flex vertical gap={token.marginXXS}>
        <Flex align="center" justify="space-between" gap={token.marginXS}>
          <HydraTag tone={selected ? 'processing' : 'default'}>{product.partType}</HydraTag>
          <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
            Fig. {product.figureNumber}
          </Typography.Text>
        </Flex>
        <Typography.Text strong style={hydraTextStyleToReactCss(hydraLargeStrong)}>
          {product.ascNumber}
        </Typography.Text>
        <Typography.Text
          ellipsis={{ tooltip: product.description }}
          style={hydraTextStyleToReactCss(hydraBaseNormal)}
        >
          {product.description}
        </Typography.Text>
        <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
          {product.size} · {product.mfr}
        </Typography.Text>
      </Flex>
    </Card>
  );
}

function FeaturedCategoryCard({
  product,
  selected,
  onSelect,
}: {
  product: AscBrowserProductRow;
  selected: boolean;
  onSelect: () => void;
}) {
  const { token } = theme.useToken();
  const categoryLabel = FEATURED_CATEGORY_LABEL[product.browserCategory];

  return (
    <Card
      hoverable
      onClick={onSelect}
      styles={{
        body: {
          padding: token.paddingMD,
          display: 'flex',
          flexDirection: 'column',
          gap: token.marginSM,
          height: '100%',
        },
      }}
      style={{
        borderColor: selected ? token.colorPrimary : token.colorBorderSecondary,
        background: selected ? token.colorPrimaryBgSubtle : token.colorFillAlter,
        cursor: 'pointer',
        height: '100%',
      }}
    >
      <Flex
        align="center"
        justify="center"
        style={{
          width: 56,
          height: 56,
          borderRadius: token.borderRadiusLG,
          background: token.colorBgContainer,
          border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
        }}
      >
        <PictureOutlined style={{ fontSize: token.fontSizeHeading3, color: token.colorTextQuaternary }} />
      </Flex>
      <Flex vertical gap={token.marginXXS}>
        <Typography.Text strong style={hydraTextStyleToReactCss(hydraBaseStrong)}>
          {categoryLabel}
        </Typography.Text>
        <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
          e.g. {product.ascNumber} · {product.partType}
        </Typography.Text>
        <Typography.Paragraph
          ellipsis={{ rows: 2, tooltip: product.description }}
          style={{ ...hydraTextStyleToReactCss(hydraBaseNormal), margin: 0 }}
        >
          {product.description}
        </Typography.Paragraph>
      </Flex>
    </Card>
  );
}

export function BomChoosePartModal({
  open,
  matchRow,
  parsedItem,
  onClose,
  onSelectPart,
  backLabel = 'Back to review',
}: BomChoosePartModalProps) {
  const { token } = theme.useToken();
  const [search, setSearch] = useState('');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const hasSuggestion = Boolean(matchRow?.topMatch);
  const suggestedParts = useMemo(
    () => matchRow?.suggestedParts.filter(Boolean) ?? [],
    [matchRow?.suggestedParts],
  );
  const isSearching = search.trim().length > 0;

  useEffect(() => {
    if (open) {
      setSearch('');
      setSelectedKey(null);
    }
  }, [open, matchRow?.itemId]);

  const featured = useMemo(() => getBomChooseFeaturedProducts(), []);
  const alternativeProposals = useMemo(
    () => getBomChooseAlternativeProducts(matchRow, parsedItem, suggestedParts),
    [matchRow, parsedItem, suggestedParts],
  );

  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    const queried = filterAscBrowserProducts(search);
    return hasSuggestion ? excludeSuggestedBrowserProducts(queried, suggestedParts) : queried;
  }, [hasSuggestion, isSearching, search, suggestedParts]);

  const selectedProduct = useMemo(
    () => (selectedKey ? ASC_BROWSER_PRODUCTS.find((p) => p.key === selectedKey) ?? null : null),
    [selectedKey],
  );

  const showFeatured = !hasSuggestion && !isSearching;
  const showAlternativeProposals = hasSuggestion && !isSearching;
  const showSearchResults = isSearching;

  const modalBodyMaxHeight = token.controlHeightLG * 11;
  const scrollAreaMaxHeight = token.controlHeightLG * 5;

  function resetState() {
    setSearch('');
    setSelectedKey(null);
  }

  function handleClose() {
    resetState();
    onClose();
  }

  function handleConfirm() {
    if (!selectedProduct) return;
    onSelectPart(selectedProduct);
    handleClose();
  }

  function handleSelectProduct(product: AscBrowserProductRow) {
    setSelectedKey(product.key);
  }

  return (
    <Modal
      title={hasSuggestion ? 'Choose a different part' : 'Choose a part'}
      open={open}
      onCancel={handleClose}
      width={760}
      centered
      destroyOnClose
      styles={{
        body: {
          maxHeight: modalBodyMaxHeight,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
      footer={
        <Flex align="center" justify="space-between" wrap="wrap" gap={token.marginSM}>
          <Button type="link" size="large" onClick={handleClose}>
            {backLabel}
          </Button>
          <Flex vertical align="flex-end" gap={token.marginXXS} style={{ flex: 1, minWidth: 200 }}>
            {selectedProduct ? (
              <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                Selected: <Typography.Text strong>{selectedProduct.ascNumber}</Typography.Text>
                {' — '}
                {selectedProduct.description}
              </Typography.Text>
            ) : (
              <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                Pick a part below, then confirm your selection.
              </Typography.Text>
            )}
            <Button type="primary" size="large" disabled={!selectedProduct} onClick={handleConfirm}>
              Select part
            </Button>
          </Flex>
        </Flex>
      }
    >
      <Flex vertical gap={token.marginMD} style={{ minHeight: 0, flex: 1 }}>
        {matchRow ? (
          <Flex
            vertical
            gap={token.marginXXS}
            style={{
              flexShrink: 0,
              padding: token.paddingSM,
              borderRadius: token.borderRadiusLG,
              background: token.colorFillAlter,
              border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
            }}
          >
            <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
              {hasSuggestion ? 'Replace the match for this imported line' : 'No automatic match for this line'}
            </Typography.Text>
            <Typography.Text strong style={hydraTextStyleToReactCss(hydraLargeStrong)}>
              {matchRow.originalRequest}
            </Typography.Text>
          </Flex>
        ) : null}

        {showAlternativeProposals ? (
          <div style={{ flexShrink: 0 }}>
            <Typography.Text strong style={hydraTextStyleToReactCss(hydraBaseStrong)}>
              Other options
            </Typography.Text>
            <Typography.Paragraph
              type="secondary"
              style={{ ...hydraTextStyleToReactCss(hydraBaseNormal), marginBottom: token.marginSM }}
            >
              Pick one of these catalog matches, or search below if none fit.
            </Typography.Paragraph>
            <Space orientation="vertical" size={token.marginXS} style={{ width: '100%' }}>
              {alternativeProposals.map((product) => (
                <ChoosePartCard
                  key={product.key}
                  product={product}
                  selected={selectedKey === product.key}
                  onSelect={() => handleSelectProduct(product)}
                  compact
                />
              ))}
            </Space>
          </div>
        ) : null}

        {showFeatured ? (
          <>
            <div style={{ flexShrink: 0 }}>
              <Typography.Text strong style={hydraTextStyleToReactCss(hydraBaseStrong)}>
                Popular starting points
              </Typography.Text>
              <Typography.Paragraph
                type="secondary"
                style={{ ...hydraTextStyleToReactCss(hydraBaseNormal), marginBottom: token.marginSM }}
              >
                Pick a category that fits your line, or search the catalog below.
              </Typography.Paragraph>
              <Row gutter={[token.marginSM, token.marginSM]}>
                {featured.map((product) => (
                  <Col key={product.key} xs={24} sm={8}>
                    <FeaturedCategoryCard
                      product={product}
                      selected={selectedKey === product.key}
                      onSelect={() => handleSelectProduct(product)}
                    />
                  </Col>
                ))}
              </Row>
            </div>
            <Divider style={{ margin: 0, flexShrink: 0 }} />
          </>
        ) : null}

        <div style={{ flexShrink: 0 }}>
          <Typography.Text strong style={hydraTextStyleToReactCss(hydraBaseStrong)}>
            {showSearchResults ? 'Search results' : 'Search the catalog'}
          </Typography.Text>
          <AppSearchInput
            allowClear
            size={INLINE_SEARCH_CONTROL_SIZE}
            placeholder="Search part number, figure, description, or manufacturer"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ marginTop: token.marginXS }}
          />
        </div>

        {showSearchResults ? (
          <div
            style={{
              flex: 1,
              minHeight: 0,
              maxHeight: scrollAreaMaxHeight,
              overflowY: 'auto',
              paddingRight: token.paddingXXS,
            }}
          >
            {searchResults.length === 0 ? (
              <Empty
                description="No parts match your search. Try a figure number or a shorter description."
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <Space orientation="vertical" size={token.marginXS} style={{ width: '100%' }}>
                {searchResults.map((product) => (
                  <ChoosePartCard
                    key={product.key}
                    product={product}
                    selected={selectedKey === product.key}
                    onSelect={() => handleSelectProduct(product)}
                    compact
                  />
                ))}
              </Space>
            )}
          </div>
        ) : (
          <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
            {hasSuggestion
              ? 'Type above to search the full catalog.'
              : 'Type above to find a specific ASC part, or choose one of the popular categories.'}
          </Typography.Text>
        )}
      </Flex>
    </Modal>
  );
}
