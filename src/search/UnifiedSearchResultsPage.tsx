import { SearchOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { BomPageHeader } from '../bom/layout/BomPageHeader';
import { PageBackButton } from '../shell/PageBackButton';
import { PageDescription } from '../shell/PageDescription';
import { shellTableCardStyle, shellTableStyles } from '../shell/shellTablePatterns';
import {
  hydraTextStyleToReactCss,
  hydraTitleHeading4,
} from '../theme/hydraTypography';
import {
  AppSearchInput,
  INLINE_SEARCH_CONTROL_SIZE,
  Button,
  Card,
  Divider,
  Empty,
  Flex,
  List,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  theme,
} from '../ui/antd';
import type { TableColumnsType, TabsProps } from '../ui/antd';

import {
  SEARCH_DOMAIN_LABELS,
  SEARCH_DOMAIN_ORDER,
  searchByDomain,
  type SearchDomain,
  type UnifiedResultRow,
} from './unifiedSearchData';

function TabCountLabel({ label, count }: { label: string; count: number }) {
  const { token } = theme.useToken();
  const hasResults = count > 0;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: token.marginXS }}>
      {label}
      {hasResults ? (
        <Tag style={{ margin: 0 }}>{count}</Tag>
      ) : (
        <Typography.Text type="secondary">0</Typography.Text>
      )}
    </span>
  );
}

function ResultsTabPanel({ children }: { children: ReactNode }) {
  const { token } = theme.useToken();
  return (
    <div
      style={{
        marginInline: -token.paddingMD,
        padding: token.paddingMD,
        background: token.colorFillAlter,
        borderTop: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
        minHeight: token.paddingLG * 6,
      }}
    >
      {children}
    </div>
  );
}

function DomainEmptyState({ domain, query }: { domain: SearchDomain | 'all'; query: string }) {
  const { token } = theme.useToken();
  const label = domain === 'all' ? 'results' : SEARCH_DOMAIN_LABELS[domain].toLowerCase();
  return (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <Space orientation="vertical" size={token.marginXS}>
          <Typography.Text strong>No {label} matches</Typography.Text>
          <Typography.Text type="secondary">
            {query.trim() && query !== 'all'
              ? `Nothing in ${label} matched “${query}”. Try another tab or a shorter search term.`
              : 'Try another category or search term.'}
          </Typography.Text>
        </Space>
      }
    />
  );
}

function PartsTable({ rows }: { rows: UnifiedResultRow[] }) {
  const { token } = theme.useToken();
  const navigate = useNavigate();

  const openPart = (row: UnifiedResultRow) => {
    navigate(`/search/parts/${encodeURIComponent(row.partKey ?? '')}`);
  };

  const columns: TableColumnsType<UnifiedResultRow> = [
    {
      title: 'SKU',
      dataIndex: 'title',
      key: 'sku',
      render: (title: string) => (
        <Typography.Text style={{ color: token.colorPrimary }}>{title}</Typography.Text>
      ),
    },
    { title: 'Description', dataIndex: 'subtitle', key: 'subtitle', ellipsis: true },
  ];

  return (
    <Table<UnifiedResultRow>
      rowKey="key"
      pagination={false}
      columns={columns}
      dataSource={rows}
      onRow={(row) => ({
        onClick: () => openPart(row),
        style: { cursor: 'pointer' },
      })}
      styles={shellTableStyles(token)}
    />
  );
}

/** Non-actionable preview list for stub domains (Content/Submittal/BOM/SeisBrace). */
function StubDomainList({ domain, rows }: { domain: SearchDomain; rows: UnifiedResultRow[] }) {
  const { token } = theme.useToken();
  const tableShellStyle = shellTableCardStyle(token);
  return (
    <Card styles={{ body: { padding: 0 } }} style={tableShellStyle}>
      <div
        style={{
          padding: token.paddingMD,
          borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
        }}
      >
        <PageDescription>
          {SEARCH_DOMAIN_LABELS[domain]} matches (preview) — open the linked part to download or package it.
        </PageDescription>
      </div>
      <List<UnifiedResultRow>
        dataSource={rows}
        renderItem={(row) => (
          <List.Item
            style={{
              paddingInline: token.paddingMD,
              borderBlockEndColor: token.colorBorderSecondary,
            }}
          >
            <List.Item.Meta title={row.title} description={row.subtitle} />
          </List.Item>
        )}
      />
    </Card>
  );
}

export function UnifiedSearchResultsPage() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const [draft, setDraft] = useState(q);
  const [activeTab, setActiveTab] = useState<'all' | SearchDomain>('all');

  useEffect(() => {
    setDraft(q);
    setActiveTab('all');
  }, [q]);

  const byDomain = useMemo(() => searchByDomain(q), [q]);
  const totalCount = useMemo(
    () => SEARCH_DOMAIN_ORDER.reduce((sum, d) => sum + byDomain[d].length, 0),
    [byDomain],
  );
  const activeDomains = useMemo(
    () => SEARCH_DOMAIN_ORDER.filter((d) => byDomain[d].length > 0),
    [byDomain],
  );

  const runSearch = (next?: string) => {
    const value = (next ?? draft).trim() || 'all';
    setParams({ q: value });
  };

  const title = !q.trim() || q === 'all' ? 'Part search' : `Results for “${q}”`;
  const tableShellStyle = shellTableCardStyle(token);
  const resultsPanelStyle = shellTableCardStyle(token);

  const headerDescription =
    totalCount === 0
      ? 'Search parts, content, submittals, BOM, and SeisBrace — open a part to download or add to a package.'
      : `${totalCount} result${totalCount !== 1 ? 's' : ''} across parts, content, submittals, BOM, and SeisBrace.`;

  const activeTabLabel =
    activeTab === 'all' ? 'All categories' : SEARCH_DOMAIN_LABELS[activeTab as SearchDomain];

  const renderDomainContent = (domain: SearchDomain) => {
    const rows = byDomain[domain];
    if (rows.length === 0) {
      return <DomainEmptyState domain={domain} query={q} />;
    }
    return domain === 'parts' ? (
      <Card styles={{ body: { padding: 0 } }} style={tableShellStyle}>
        <PartsTable rows={rows} />
      </Card>
    ) : (
      <StubDomainList domain={domain} rows={rows} />
    );
  };

  const allContent =
    activeDomains.length === 0 ? (
      <DomainEmptyState domain="all" query={q} />
    ) : (
      <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
        {activeDomains.map((domain, index) => (
          <div key={domain}>
            {index > 0 ? <Divider style={{ marginBlock: token.marginLG }} /> : null}
            <Space orientation="vertical" size={token.marginSM} style={{ width: '100%' }}>
              <Flex align="center" gap={token.marginXS}>
                <Typography.Title
                  level={4}
                  style={{ margin: 0, ...hydraTextStyleToReactCss(hydraTitleHeading4) }}
                >
                  {SEARCH_DOMAIN_LABELS[domain]}
                </Typography.Title>
                <Tag>{byDomain[domain].length}</Tag>
              </Flex>
              {renderDomainContent(domain)}
            </Space>
          </div>
        ))}
      </Space>
    );

  const tabItems: TabsProps['items'] = [
    {
      key: 'all',
      label: <TabCountLabel label="All" count={totalCount} />,
      children: <ResultsTabPanel>{allContent}</ResultsTabPanel>,
    },
    ...SEARCH_DOMAIN_ORDER.map((domain) => ({
      key: domain,
      label: <TabCountLabel label={SEARCH_DOMAIN_LABELS[domain]} count={byDomain[domain].length} />,
      children: <ResultsTabPanel>{renderDomainContent(domain)}</ResultsTabPanel>,
    })),
  ];

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to="/dashboard">Back to home</PageBackButton>

      <BomPageHeader title={title} description={headerDescription} />

      <Card styles={{ body: { padding: 0 } }} style={resultsPanelStyle}>
        <div
          style={{
            padding: token.paddingMD,
            borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
          }}
        >
          <Flex wrap="wrap" gap={token.marginSM} align="center">
            <AppSearchInput
              allowClear
              size={INLINE_SEARCH_CONTROL_SIZE}
              placeholder="Search parts, SKUs, descriptions…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onPressEnter={() => runSearch()}
              style={{ minWidth: token.controlHeight * 10, flex: 1 }}
            />
            <Button type="primary" size="large" icon={<SearchOutlined />} onClick={() => runSearch()}>
              Search
            </Button>
          </Flex>
        </div>

        {totalCount === 0 ? (
          <div style={{ padding: token.paddingLG * 2 }}>
            <Empty
              description={
                <Space orientation="vertical" size={token.marginXS}>
                  <Typography.Text strong>No results found</Typography.Text>
                  <PageDescription>
                    {q.trim() ? `Nothing matched “${q}”. Try a shorter term.` : 'No rows to show.'}
                  </PageDescription>
                </Space>
              }
            >
              <Button type="primary" size="large" onClick={() => navigate('/search/results?q=all')}>
                Show everything
              </Button>
            </Empty>
          </div>
        ) : (
          <div style={{ paddingInline: token.paddingMD, paddingTop: token.paddingSM }}>
            <Tabs
              activeKey={activeTab}
              items={tabItems}
              onChange={(key) => setActiveTab(key as 'all' | SearchDomain)}
              tabBarStyle={{ marginBottom: 0 }}
              tabBarExtraContent={
                <Typography.Text type="secondary" style={{ whiteSpace: 'nowrap' }}>
                  Showing {activeTabLabel}
                </Typography.Text>
              }
            />
          </div>
        )}
      </Card>
    </Space>
  );
}
