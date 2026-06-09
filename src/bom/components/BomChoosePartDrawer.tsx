import { useMemo, useState } from 'react';

import {
  filterAscBrowserProducts,
  getBomChooseFeaturedProducts,
} from '../bomChoosePartUtils';
import { ASC_BROWSER_PRODUCTS, type AscBrowserProductRow } from '../data/ascBrowserProducts';
import { BomTablePaginationBar } from './BomTablePaginationBar';
import type { BomMatchResult } from '../data/types';
import {
  hydraBaseNormal,
  hydraBaseStrong,
  hydraTextStyleToReactCss,
} from '../../theme/hydraTypography';
import { shellLayout } from '../../theme/hydraAlias';
import {
  Alert,
  AppSearchInput,
  Button,
  Drawer,
  Flex,
  Radio,
  Space,
  Typography,
  theme,
} from '../../ui/antd';

type BomChoosePartDrawerProps = {
  open: boolean;
  matchRow: BomMatchResult | null;
  onClose: () => void;
  onSelectPart: (product: AscBrowserProductRow) => void;
};

export function BomChoosePartDrawer({
  open,
  matchRow,
  onClose,
  onSelectPart,
}: BomChoosePartDrawerProps) {
  const { token } = theme.useToken();
  const [search, setSearch] = useState('');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const featured = useMemo(() => getBomChooseFeaturedProducts(), []);
  const filtered = useMemo(() => filterAscBrowserProducts(search), [search]);

  const paged = useMemo(() => {
    const start = (page - 1) * shellLayout.tablePageSizeDefault;
    return filtered.slice(start, start + shellLayout.tablePageSizeDefault);
  }, [filtered, page]);

  const hasSuggestion = Boolean(matchRow?.topMatch);
  const title = 'Choose a part';

  function handleClose() {
    setSearch('');
    setSelectedKey(null);
    setPage(1);
    onClose();
  }

  function handleUseSelected() {
    const row = ASC_BROWSER_PRODUCTS.find((p) => p.key === selectedKey);
    if (!row) return;
    onSelectPart(row);
    handleClose();
  }

  function handleFeaturedPick(product: AscBrowserProductRow) {
    setSelectedKey(product.key);
    setSearch('');
    setPage(1);
  }

  return (
    <Drawer
      title={title}
      open={open}
      onClose={handleClose}
      width={560}
      destroyOnClose
      styles={{
        body: {
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: 0,
          overflow: 'hidden',
        },
      }}
      footer={
        <Flex justify="flex-end" gap={token.marginXS} wrap="wrap">
          <Button size="large" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="primary" size="large" disabled={!selectedKey} onClick={handleUseSelected}>
            Use selected part
          </Button>
        </Flex>
      }
    >
      <Space
        orientation="vertical"
        size={token.marginMD}
        style={{ width: '100%', height: '100%', minHeight: 0 }}
      >
        {matchRow ? (
          <Alert
            type="info"
            showIcon
            message={hasSuggestion ? 'Replace the current match' : 'No automatic match'}
            description={
              hasSuggestion
                ? `Pick a different ASC part for: ${matchRow.originalRequest}`
                : `We could not suggest a part for: ${matchRow.originalRequest}. Search the catalog and select one.`
            }
          />
        ) : null}

        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: token.paddingMD }}>
          <Space orientation="vertical" size={token.marginMD} style={{ width: '100%' }}>
            <div>
              <Typography.Text
                strong
                style={{
                  ...hydraTextStyleToReactCss(hydraBaseStrong),
                  display: 'block',
                  marginBottom: token.marginXS,
                }}
              >
                Featured categories
              </Typography.Text>
              <Flex gap={token.marginXS} wrap="wrap">
                {featured.map((product) => (
                  <Button
                    key={product.key}
                    size="large"
                    type={selectedKey === product.key ? 'primary' : 'default'}
                    onClick={() => handleFeaturedPick(product)}
                  >
                    {product.partType}
                  </Button>
                ))}
              </Flex>
            </div>

            <AppSearchInput
              allowClear
              size="large"
              placeholder="Search by part number, figure, or description"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />

            <Radio.Group
              value={selectedKey ?? undefined}
              onChange={(e) => setSelectedKey(e.target.value)}
              style={{ width: '100%' }}
            >
              <Space orientation="vertical" size={0} style={{ width: '100%' }}>
                {paged.map((product) => (
                  <Flex
                    key={product.key}
                    align="flex-start"
                    gap={token.marginSM}
                    style={{
                      width: '100%',
                      padding: token.paddingSM,
                      borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                      background:
                        selectedKey === product.key ? token.colorPrimaryBgSubtle : token.colorBgContainer,
                      borderRadius: selectedKey === product.key ? token.borderRadius : undefined,
                    }}
                  >
                    <Radio value={product.key} style={{ marginTop: token.marginXXS }} />
                    <Flex vertical gap={token.marginXXS} style={{ flex: 1, minWidth: 0 }}>
                      <Typography.Text strong>{product.ascNumber}</Typography.Text>
                      <Typography.Text style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                        {product.description}
                      </Typography.Text>
                      <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                        {product.partType} · Fig. {product.figureNumber} · {product.size}
                      </Typography.Text>
                    </Flex>
                  </Flex>
                ))}
              </Space>
            </Radio.Group>

            <BomTablePaginationBar current={page} total={filtered.length} onChange={setPage} />
          </Space>
        </div>
      </Space>
    </Drawer>
  );
}
