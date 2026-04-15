import { FilterOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import {
  ASC_BROWSER_PRODUCTS,
  type AscBrowserProductRow,
} from '../data/ascBrowserProducts';
import { BomPageHeader } from '../layout/BomPageHeader';
import {
  Alert,
  AppSearchInput,
  Button,
  Card,
  Checkbox,
  Drawer,
  Flex,
  InputNumber,
  Space,
  Table,
  Tabs,
  Typography,
  message,
  theme,
} from '../../ui/antd';
import type { TableColumnsType, TabsProps } from '../../ui/antd';

type AscProduct = AscBrowserProductRow;
type BrowserTab = AscProduct['browserCategory'];

const MFR_OPTIONS = ['Victaulic', 'ASC', 'Tyco', 'Viking'];
const INSTALL_TYPE_OPTIONS = ['Ceiling', 'Wall', 'Overhead', 'Floor'];
const SIZE_OPTIONS = ['1/2 inch', '2 inch', '2.5 inch', '3 inch', '4 inch', '6 inch'];

type LocationState = {
  swapRowId?: string;
  swapSource?: {
    partNumber: string;
    description: string;
    size?: string;
    category?: string;
  };
} | null;

export function BomAscProductsPage() {
  const { token } = theme.useToken();
  const { bomProjectId = '' } = useParams<{ bomProjectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const state = (location.state ?? {}) as NonNullable<LocationState>;
  const swapRowId = state.swapRowId ?? null;
  const swapSource = state.swapSource;
  const isSwapMode = !!swapRowId;

  const [tab, setTab] = useState<BrowserTab>('pre-engineered');
  const [search, setSearch] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [selectedMfr, setSelectedMfr] = useState<string[]>([]);
  const [selectedInstall, setSelectedInstall] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState<string[]>([]);
  const [draftMfr, setDraftMfr] = useState<string[]>([]);
  const [draftInstall, setDraftInstall] = useState<string[]>([]);
  const [draftSize, setDraftSize] = useState<string[]>([]);

  const activeFilterCount = selectedMfr.length + selectedInstall.length + selectedSize.length;

  function matchesSearch(p: AscProduct): boolean {
    const q = search.trim().toLowerCase();
    return (
      !q ||
      p.description.toLowerCase().includes(q) ||
      p.ascNumber.toLowerCase().includes(q) ||
      p.figureNumber.toLowerCase().includes(q) ||
      p.partType.toLowerCase().includes(q) ||
      p.mfr.toLowerCase().includes(q)
    );
  }

  const catalogForTab = useMemo(
    () => ASC_BROWSER_PRODUCTS.filter((p) => p.browserCategory === tab),
    [tab],
  );

  const filtered = useMemo(() => {
    return catalogForTab.filter(
      (p) =>
        matchesSearch(p) &&
        (selectedMfr.length === 0 || selectedMfr.includes(p.mfr)) &&
        (selectedInstall.length === 0 || selectedInstall.includes(p.installType)) &&
        (selectedSize.length === 0 || selectedSize.includes(p.size)),
    );
  }, [catalogForTab, search, selectedMfr, selectedInstall, selectedSize]);

  function handleSelectProduct(product: AscProduct) {
    const qty = quantities[product.key] ?? 1;
    if (!isSwapMode && qty < 1) {
      message.warning('Enter a quantity greater than 0.');
      return;
    }
    if (isSwapMode && swapSource?.partNumber === product.ascNumber) {
      message.warning('This is the same product already assigned.');
      return;
    }
    if (isSwapMode) {
      navigate(`/bom/projects/${bomProjectId}/workspace`, {
        state: { swappedProduct: { ...product, qty }, swapRowId },
      });
    } else {
      navigate(`/bom/projects/${bomProjectId}/workspace`, {
        state: { addedProduct: { ...product, qty } },
      });
    }
  }

  function openFilterDrawer() {
    setDraftMfr(selectedMfr);
    setDraftInstall(selectedInstall);
    setDraftSize(selectedSize);
    setIsFilterDrawerOpen(true);
  }

  function applyFilters() {
    setSelectedMfr(draftMfr);
    setSelectedInstall(draftInstall);
    setSelectedSize(draftSize);
    setIsFilterDrawerOpen(false);
  }

  function resetDraftFilters() {
    setDraftMfr([]);
    setDraftInstall([]);
    setDraftSize([]);
  }

  function clearAppliedFilters() {
    setSelectedMfr([]);
    setSelectedInstall([]);
    setSelectedSize([]);
  }

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
      width: 100,
      sorter: (a, b) => a.partType.localeCompare(b.partType),
    },
    {
      title: 'Figure Number',
      dataIndex: 'figureNumber',
      key: 'figureNumber',
      width: 150,
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
      width: 80,
    },
    {
      title: 'Brand',
      dataIndex: 'mfr',
      key: 'mfr',
      width: 100,
      sorter: (a, b) => a.mfr.localeCompare(b.mfr),
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      width: 90,
      sorter: (a, b) => a.size.localeCompare(b.size),
    },
    {
      title: 'Install Type',
      dataIndex: 'installType',
      key: 'installType',
      width: 110,
    },
    {
      title: 'Qty',
      key: 'qty',
      width: 90,
      hidden: isSwapMode,
      render: (_, row) => (
        <InputNumber
          size="small"
          min={1}
          value={quantities[row.key] ?? 1}
          onChange={(v) => setQuantities((prev) => ({ ...prev, [row.key]: v ?? 1 }))}
          style={{ width: 70 }}
        />
      ),
    },
    {
      key: 'action',
      width: 100,
      render: (_, row) => (
        <Button
          size="small"
          type="primary"
          onClick={() => handleSelectProduct(row)}
        >
          {isSwapMode ? 'Swap' : 'Add to BOM'}
        </Button>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <BomPageHeader
        title={isSwapMode ? 'Select ASC replacement part' : 'ASC products'}
        description={
          isSwapMode
            ? 'Choose an ASC product to replace the current suggested match for this BOM line.'
            : 'Browse ASC products to validate matches or manually add parts to your BOM workspace.'
        }
        actions={
          <Button size="large" onClick={() => navigate(`/bom/projects/${bomProjectId}/workspace`)}>
            {isSwapMode ? 'Return to workspace' : 'Back to workspace'}
          </Button>
        }
      />

      {!isSwapMode ? (
        <Tabs
          activeKey={tab}
          items={tabItems}
          onChange={(k) => setTab(k as BrowserTab)}
        />
      ) : (
        <Alert
          type="info"
          showIcon
          message={`Manual Swap: ${(swapSource?.partNumber ?? 'Selected BOM part')} — ${(swapSource?.description ?? 'Part details unavailable.')}${swapSource?.category || swapSource?.size ? ` · ${[swapSource.category, swapSource.size].filter(Boolean).join(' · ')}` : ''}`}
        />
      )}

      <Card
        style={{ borderRadius: token.borderRadiusLG, boxShadow: token.boxShadowTertiary }}
        styles={{ body: { padding: 0 } }}
      >
        <div
          style={{
            paddingInline: token.paddingMD,
            paddingBlock: token.paddingSM,
            borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
          }}
        >
          <Flex align="center" justify="space-between" gap={token.marginSM} wrap="wrap">
            <AppSearchInput
              allowClear
              placeholder="Search by description, ASC #, figure number, brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 420, maxWidth: '100%' }}
            />
            <Space size={token.marginXS} wrap>
              <Button icon={<FilterOutlined />} onClick={openFilterDrawer}>
                Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </Button>
              {activeFilterCount > 0 ? (
                <Button onClick={clearAppliedFilters}>Clear</Button>
              ) : null}
              <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM, whiteSpace: 'nowrap' }}>
                {filtered.length} product{filtered.length !== 1 ? 's' : ''}
              </Typography.Text>
            </Space>
          </Flex>
        </div>
        <Table<AscProduct>
          rowKey="key"
          columns={columns}
          dataSource={filtered}
          size="small"
          scroll={{ x: 'max-content' }}
          pagination={{
            pageSize: 12,
            showSizeChanger: false,
            showTotal: (total) => `${total} product${total === 1 ? '' : 's'}`,
            position: ['bottomRight'],
          }}
          styles={{
            header: { cell: { background: token.colorFillAlter, borderBottomColor: token.colorBorderSecondary, fontWeight: token.fontWeightStrong } },
            body: { cell: { borderBottomColor: token.colorBorderSecondary, paddingBlock: token.paddingSM } },
          }}
        />
      </Card>

      <Drawer
        title="Filters"
        placement="right"
        width={360}
        open={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        extra={
          <Space>
            <Button size="small" onClick={resetDraftFilters}>Reset</Button>
            <Button size="small" type="primary" onClick={applyFilters}>Apply</Button>
          </Space>
        }
      >
        <Space direction="vertical" size={token.marginMD} style={{ width: '100%' }}>
          <Space direction="vertical" size={token.marginXXS} style={{ width: '100%' }}>
            <Typography.Text type="secondary">Brand</Typography.Text>
            <Checkbox.Group
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: token.marginXS }}
              options={MFR_OPTIONS}
              value={draftMfr}
              onChange={(vals) => setDraftMfr(vals as string[])}
            />
          </Space>
          <Space direction="vertical" size={token.marginXXS} style={{ width: '100%' }}>
            <Typography.Text type="secondary">Install Type</Typography.Text>
            <Checkbox.Group
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: token.marginXS }}
              options={INSTALL_TYPE_OPTIONS}
              value={draftInstall}
              onChange={(vals) => setDraftInstall(vals as string[])}
            />
          </Space>
          <Space direction="vertical" size={token.marginXXS} style={{ width: '100%' }}>
            <Typography.Text type="secondary">Size</Typography.Text>
            <Checkbox.Group
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: token.marginXS }}
              options={SIZE_OPTIONS}
              value={draftSize}
              onChange={(vals) => setDraftSize(vals as string[])}
            />
          </Space>
        </Space>
      </Drawer>
    </Space>
  );
}
