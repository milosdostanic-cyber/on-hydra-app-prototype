import { useMemo, useState, type CSSProperties } from 'react';

import {
  ASC_BROWSER_PRODUCTS,
  type AscBrowserProductRow,
} from '../data/ascBrowserProducts';
import {
  AppSearchInput,
  Button,
  Checkbox,
  Flex,
  InputNumber,
  Modal,
  Space,
  Table,
  Tabs,
  Typography,
  theme,
} from '../../ui/antd';
import type { TableColumnsType, TabsProps } from '../../ui/antd';

type AscProduct = AscBrowserProductRow;
type BrowserTab = AscProduct['browserCategory'];

const INSTALL_TYPE_OPTIONS = ['Ceiling', 'Wall', 'Overhead', 'Floor'];
const MFR_OPTIONS = ['Victaulic', 'ASC', 'Tyco', 'Viking'];
const SIZE_OPTIONS = ['1/2 inch', '2 inch', '2.5 inch', '3 inch', '4 inch', '6 inch'];

interface AscProductsDrawerProps {
  open: boolean;
  onClose: () => void;
  onAddProduct?: (product: AscProduct) => void;
  mode?: 'browse' | 'swap';
}

export function AscProductsDrawer({ open, onClose, onAddProduct, mode = 'browse' }: AscProductsDrawerProps) {
  const { token } = theme.useToken();
  const [tab, setTab] = useState<BrowserTab>('pre-engineered');
  const [search, setSearch] = useState('');
  const [selectedInstall, setSelectedInstall] = useState<string[]>([]);
  const [selectedMfr, setSelectedMfr] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState<string[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const hasActiveFilters = selectedInstall.length > 0 || selectedMfr.length > 0 || selectedSize.length > 0;

  function clearAllFilters() {
    setSelectedInstall([]);
    setSelectedMfr([]);
    setSelectedSize([]);
  }

  // Base filter: search only (for computing facet counts)
  function matchesSearch(p: AscProduct): boolean {
    const q = search.trim().toLowerCase();
    return (
      !q ||
      p.description.toLowerCase().includes(q) ||
      p.ascNumber.toLowerCase().includes(q) ||
      p.figureNumber.toLowerCase().includes(q) ||
      p.partType.toLowerCase().includes(q)
    );
  }

  const catalogForTab = useMemo(
    () => ASC_BROWSER_PRODUCTS.filter((p) => p.browserCategory === tab),
    [tab],
  );

  // Faceted counts: count per value excluding that group's own filter
  function mfrCount(mfr: string): number {
    return catalogForTab.filter(
      (p) =>
        matchesSearch(p) &&
        p.mfr === mfr &&
        (selectedInstall.length === 0 || selectedInstall.includes(p.installType)) &&
        (selectedSize.length === 0 || selectedSize.includes(p.size)),
    ).length;
  }

  function installCount(install: string): number {
    return catalogForTab.filter(
      (p) =>
        matchesSearch(p) &&
        p.installType === install &&
        (selectedMfr.length === 0 || selectedMfr.includes(p.mfr)) &&
        (selectedSize.length === 0 || selectedSize.includes(p.size)),
    ).length;
  }

  function sizeCount(size: string): number {
    return catalogForTab.filter(
      (p) =>
        matchesSearch(p) &&
        p.size === size &&
        (selectedMfr.length === 0 || selectedMfr.includes(p.mfr)) &&
        (selectedInstall.length === 0 || selectedInstall.includes(p.installType)),
    ).length;
  }

  const filtered = catalogForTab.filter((p) => {
    const matchesInstall = selectedInstall.length === 0 || selectedInstall.includes(p.installType);
    const matchesMfr = selectedMfr.length === 0 || selectedMfr.includes(p.mfr);
    const matchesSize = selectedSize.length === 0 || selectedSize.includes(p.size);
    return matchesSearch(p) && matchesInstall && matchesMfr && matchesSize;
  });

  const tabItems: TabsProps['items'] = [
    { key: 'pre-engineered', label: 'Pre-engineered' },
    { key: 'individual-parts', label: 'Individual parts' },
    { key: 'quantity-parts', label: 'Quantity parts' },
  ];

  const columns: TableColumnsType<AscProduct> = [
    {
      title: 'Part Type',
      dataIndex: 'partType',
      key: 'partType',
      width: 90,
    },
    {
      title: 'Figure Number',
      dataIndex: 'figureNumber',
      key: 'figureNumber',
      width: 130,
      render: (v: string) => (
        <Typography.Text style={{ color: token.colorPrimary }}>{v}</Typography.Text>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'ASC #',
      dataIndex: 'ascNumber',
      key: 'ascNumber',
      width: 70,
    },
    {
      title: 'Qty',
      key: 'qty',
      width: 80,
      render: (_, row) => (
        <InputNumber
          size="small"
          min={1}
          value={quantities[row.key] ?? 1}
          onChange={(v) => setQuantities((prev) => ({ ...prev, [row.key]: v ?? 1 }))}
          style={{ width: 64 }}
        />
      ),
    },
    {
      key: 'add',
      width: 70,
      render: (_, row) => (
        <Button
          size="small"
          type="primary"
          onClick={() => onAddProduct?.({ ...row, qty: quantities[row.key] ?? 1 })}
        >
          {mode === 'swap' ? 'Select' : 'Add'}
        </Button>
      ),
    },
  ];

  const filterLabelStyle: CSSProperties = {
    fontSize: token.fontSizeSM,
    fontWeight: token.fontWeightStrong,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: token.colorTextSecondary,
    display: 'block',
    marginBottom: token.marginXXS,
  };

  const filterItemStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  };

  function FilterGroup({
    label,
    options,
    selected,
    countFn,
    onChange,
  }: {
    label: string;
    options: string[];
    selected: string[];
    countFn: (v: string) => number;
    onChange: (next: string[]) => void;
  }) {
    return (
      <div>
        <span style={filterLabelStyle}>{label}</span>
        <Space direction="vertical" size={token.marginXXS} style={{ width: '100%' }}>
          {options.map((opt) => {
            const count = countFn(opt);
            return (
              <Checkbox
                key={opt}
                checked={selected.includes(opt)}
                disabled={count === 0 && !selected.includes(opt)}
                onChange={(e) =>
                  onChange(
                    e.target.checked ? [...selected, opt] : selected.filter((x) => x !== opt),
                  )
                }
                style={{ width: '100%' }}
              >
                <span style={filterItemStyle}>
                  <span>{opt}</span>
                  <Typography.Text
                    type="secondary"
                    style={{ fontSize: token.fontSizeSM, marginLeft: token.marginXXS }}
                  >
                    {count}
                  </Typography.Text>
                </span>
              </Checkbox>
            );
          })}
        </Space>
      </div>
    );
  }

  return (
    <Modal
      title={mode === 'swap' ? 'Select ASC Replacement Part' : 'ASC Products'}
      width={980}
      open={open}
      onCancel={onClose}
      footer={null}
      styles={{
        body: { padding: 0 },
      }}
    >
      <Flex style={{ minHeight: 520 }}>
        {/* Left: tabs + search + table */}
        <div style={{ flex: 1, minWidth: 0, padding: token.paddingMD, paddingTop: token.paddingSM }}>
          <Tabs
            activeKey={tab}
            items={tabItems}
            onChange={(k) => setTab(k as BrowserTab)}
            style={{ marginBottom: token.marginSM }}
          />

          {mode === 'swap' && (
            <Typography.Text type="secondary" style={{ display: 'block', marginBottom: token.marginSM }}>
              Choose an ASC product to replace the current suggested match for this BOM line.
            </Typography.Text>
          )}

          <AppSearchInput
            allowClear
            placeholder="Search by description, ASC #, figure number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ marginBottom: token.marginXS }}
          />

          <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM, display: 'block', marginBottom: token.marginXS }}>
            {filtered.length} product{filtered.length !== 1 ? 's' : ''}
          </Typography.Text>

          <Table<AscProduct>
            rowKey="key"
            columns={columns}
            dataSource={filtered}
            size="small"
            pagination={{ pageSize: 8, showSizeChanger: false }}
            scroll={{ x: 'max-content' }}
          />
        </div>

        {/* Right: filter panel */}
        <div
          style={{
            width: 220,
            flexShrink: 0,
            borderLeft: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
            padding: token.paddingMD,
            background: token.colorFillAlter,
          }}
        >
          <Flex align="center" justify="space-between" style={{ marginBottom: token.marginSM }}>
            <Typography.Text strong>Filters</Typography.Text>
            {hasActiveFilters && (
              <Typography.Link
                onClick={clearAllFilters}
                style={{ fontSize: token.fontSizeSM }}
              >
                Clear All Filters
              </Typography.Link>
            )}
          </Flex>

          <Space direction="vertical" size={token.marginMD} style={{ width: '100%' }}>
            <FilterGroup
              label="Brand"
              options={MFR_OPTIONS}
              selected={selectedMfr}
              countFn={mfrCount}
              onChange={setSelectedMfr}
            />
            <FilterGroup
              label="Install Type"
              options={INSTALL_TYPE_OPTIONS}
              selected={selectedInstall}
              countFn={installCount}
              onChange={setSelectedInstall}
            />
            <FilterGroup
              label="Size"
              options={SIZE_OPTIONS}
              selected={selectedSize}
              countFn={sizeCount}
              onChange={setSelectedSize}
            />
          </Space>
        </div>
      </Flex>
    </Modal>
  );
}
