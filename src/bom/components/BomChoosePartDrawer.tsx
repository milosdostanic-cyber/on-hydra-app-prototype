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
  hydraSmallStrong,
  hydraTextStyleToReactCss,
} from '../../theme/hydraTypography';
import { shellLayout } from '../../theme/hydraAlias';
import {
  AppSearchInput,
  Button,
  Card,
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
  const title = hasSuggestion ? 'Choose a different part' : 'Choose a part';

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
      width={720}
      destroyOnClose
      footer={
        <Flex justify="flex-end" gap={token.marginSM}>
          <Button size="large" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="primary" size="large" disabled={!selectedKey} onClick={handleUseSelected}>
            Use selected part
          </Button>
        </Flex>
      }
    >
      <Space orientation="vertical" size={token.marginMD} style={{ width: '100%' }}>
        {matchRow ? (
          <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
            {hasSuggestion
              ? `Replacing suggested match for: ${matchRow.originalRequest}`
              : `No automatic match for: ${matchRow.originalRequest}`}
          </Typography.Text>
        ) : null}

        <div>
          <Typography.Text
            strong
            style={{
              ...hydraTextStyleToReactCss(hydraSmallStrong),
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

        <Card styles={{ body: { padding: 0 } }} style={{ width: '100%' }}>
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
                      selectedKey === product.key ? token.colorPrimaryBg : token.colorBgContainer,
                  }}
                >
                  <Radio value={product.key} style={{ marginTop: token.marginXXS }} />
                  <Flex vertical gap={token.marginXXS} style={{ flex: 1, minWidth: 0 }}>
                    <Typography.Text strong>{product.ascNumber}</Typography.Text>
                    <Typography.Text>{product.description}</Typography.Text>
                    <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                      {product.partType} · Fig. {product.figureNumber} · {product.size}
                    </Typography.Text>
                  </Flex>
                </Flex>
              ))}
            </Space>
          </Radio.Group>
          <BomTablePaginationBar current={page} total={filtered.length} onChange={setPage} />
        </Card>
      </Space>
    </Drawer>
  );
}
