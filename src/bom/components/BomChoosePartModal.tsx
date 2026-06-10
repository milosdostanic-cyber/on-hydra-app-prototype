import { PictureOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';

import {
  filterAscBrowserProducts,
  getBomChooseFeaturedProducts,
} from '../bomChoosePartUtils';
import { ASC_BROWSER_PRODUCTS, type AscBrowserProductRow } from '../data/ascBrowserProducts';
import type { BomMatchResult } from '../data/types';
import { HydraTag } from '../../ui/HydraTag';
import {
  hydraBaseNormal,
  hydraBaseStrong,
  hydraLargeStrong,
  hydraTextStyleToReactCss,
} from '../../theme/hydraTypography';
import { shellLayout } from '../../theme/hydraAlias';
import {
  AppSearchInput,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Flex,
  Modal,
  Pagination,
  Row,
  Space,
  Typography,
  theme,
} from '../../ui/antd';

type BomChoosePartModalProps = {
  open: boolean;
  matchRow: BomMatchResult | null;
  onClose: () => void;
  onSelectPart: (product: AscBrowserProductRow) => void;
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
}: {
  product: AscBrowserProductRow;
  selected: boolean;
  onSelect: () => void;
}) {
  const { token } = theme.useToken();

  return (
    <Card
      hoverable
      size="small"
      onClick={onSelect}
      styles={{
        body: { padding: token.paddingSM },
      }}
      style={{
        borderColor: selected ? token.colorPrimary : token.colorBorderSecondary,
        background: selected ? token.colorPrimaryBgSubtle : token.colorBgContainer,
        boxShadow: selected ? token.boxShadowSecondary : token.boxShadowTertiary,
        cursor: 'pointer',
        height: '100%',
      }}
    >
      <Flex vertical gap={token.marginXS} style={{ minHeight: 108 }}>
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
  onClose,
  onSelectPart,
}: BomChoosePartModalProps) {
  const { token } = theme.useToken();
  const [search, setSearch] = useState('');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const featured = useMemo(() => getBomChooseFeaturedProducts(), []);
  const isSearching = search.trim().length > 0;
  const filtered = useMemo(() => filterAscBrowserProducts(search), [search]);

  const paged = useMemo(() => {
    const start = (page - 1) * shellLayout.tablePageSizeDefault;
    return filtered.slice(start, start + shellLayout.tablePageSizeDefault);
  }, [filtered, page]);

  const selectedProduct = useMemo(
    () => (selectedKey ? ASC_BROWSER_PRODUCTS.find((p) => p.key === selectedKey) ?? null : null),
    [selectedKey],
  );

  const hasSuggestion = Boolean(matchRow?.topMatch);

  function resetState() {
    setSearch('');
    setSelectedKey(null);
    setPage(1);
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
      title="Choose a part"
      open={open}
      onCancel={handleClose}
      width={760}
      centered
      destroyOnClose
      footer={
        <Flex align="center" justify="space-between" wrap="wrap" gap={token.marginSM}>
          <Button type="link" size="large" onClick={handleClose}>
            Back to review
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
      <Space orientation="vertical" size={token.marginMD} style={{ width: '100%' }}>
        {matchRow ? (
          <Flex
            vertical
            gap={token.marginXXS}
            style={{
              padding: token.paddingMD,
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

        {!isSearching ? (
          <>
            <div>
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
            <Divider style={{ margin: 0 }} />
          </>
        ) : null}

        <div>
          <Typography.Text strong style={hydraTextStyleToReactCss(hydraBaseStrong)}>
            {isSearching ? 'Search results' : 'Search the catalog'}
          </Typography.Text>
          <AppSearchInput
            allowClear
            size="large"
            placeholder="Search part number, figure, description, or manufacturer"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ marginTop: token.marginXS, marginBottom: token.marginMD }}
          />

          {isSearching ? (
            filtered.length === 0 ? (
              <Empty
                description="No parts match your search. Try a figure number or a shorter description."
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <>
                <Row gutter={[token.marginSM, token.marginSM]}>
                  {paged.map((product) => (
                    <Col key={product.key} xs={24} sm={12}>
                      <ChoosePartCard
                        product={product}
                        selected={selectedKey === product.key}
                        onSelect={() => handleSelectProduct(product)}
                      />
                    </Col>
                  ))}
                </Row>
                {filtered.length > shellLayout.tablePageSizeDefault ? (
                  <Flex justify="center" style={{ marginTop: token.marginMD }}>
                    <Pagination
                      current={page}
                      pageSize={shellLayout.tablePageSizeDefault}
                      total={filtered.length}
                      onChange={setPage}
                      showSizeChanger={false}
                    />
                  </Flex>
                ) : null}
              </>
            )
          ) : (
            <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
              Type above to find a specific ASC part, or choose one of the popular categories.
            </Typography.Text>
          )}
        </div>
      </Space>
    </Modal>
  );
}
