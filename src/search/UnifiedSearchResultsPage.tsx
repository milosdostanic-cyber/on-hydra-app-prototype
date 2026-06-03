import { SearchOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { PageBackButton } from '../shell/PageBackButton';
import { hydraBaseStrong } from '../theme/hydraTypography';
import {
  AppSearchInput,
  Badge,
  Button,
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

function PartsTable({ rows }: { rows: UnifiedResultRow[] }) {
  const { token } = theme.useToken();
  const columns: TableColumnsType<UnifiedResultRow> = [
    {
      title: 'SKU',
      key: 'sku',
      render: (_, row) => (
        <Link to={`/search/parts/${encodeURIComponent(row.partKey ?? '')}`}>{row.title}</Link>
      ),
    },
    { title: 'Description', dataIndex: 'subtitle', key: 'subtitle' },
  ];
  return (
    <Table<UnifiedResultRow>
      rowKey="key"
      pagination={false}
      size="small"
      columns={columns}
      dataSource={rows}
      styles={{
        header: { cell: { color: token.colorTextDescription, fontWeight: hydraBaseStrong.fontWeight } },
      }}
    />
  );
}

/** Non-actionable preview list for stub domains (Content/Submittal/BOM/SeisBrace). */
function StubDomainList({ domain, rows }: { domain: SearchDomain; rows: UnifiedResultRow[] }) {
  const { token } = theme.useToken();
  return (
    <Space orientation="vertical" size={token.marginSM} style={{ width: '100%' }}>
      <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
        {SEARCH_DOMAIN_LABELS[domain]} matches (preview) — open the linked part to download or package it.
      </Typography.Text>
      <List<UnifiedResultRow>
        bordered
        dataSource={rows}
        renderItem={(row) => (
          <List.Item>
            <List.Item.Meta title={row.title} description={row.subtitle} />
          </List.Item>
        )}
      />
    </Space>
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
  }, [q]);

  const byDomain = useMemo(() => searchByDomain(q), [q]);
  const totalCount = useMemo(
    () => SEARCH_DOMAIN_ORDER.reduce((sum, d) => sum + byDomain[d].length, 0),
    [byDomain],
  );

  const runSearch = (next?: string) => {
    const value = (next ?? draft).trim() || 'all';
    setParams({ q: value });
  };

  const title = !q.trim() || q === 'all' ? 'Search results' : `Results for “${q}”`;

  const renderDomainContent = (domain: SearchDomain) => {
    const rows = byDomain[domain];
    if (rows.length === 0) {
      return (
        <Typography.Text type="secondary">
          No {SEARCH_DOMAIN_LABELS[domain].toLowerCase()} matches for this search.
        </Typography.Text>
      );
    }
    return domain === 'parts' ? <PartsTable rows={rows} /> : <StubDomainList domain={domain} rows={rows} />;
  };

  const allContent = (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      {SEARCH_DOMAIN_ORDER.filter((d) => byDomain[d].length > 0).map((domain) => (
        <div key={domain}>
          <Flex align="center" gap={token.marginXS} style={{ marginBottom: token.marginSM }}>
            <Typography.Title level={5} style={{ margin: 0 }}>
              {SEARCH_DOMAIN_LABELS[domain]}
            </Typography.Title>
            <Tag>{byDomain[domain].length}</Tag>
          </Flex>
          {renderDomainContent(domain)}
        </div>
      ))}
    </Space>
  );

  const tabItems: TabsProps['items'] = [
    {
      key: 'all',
      label: (
        <Badge count={totalCount} size="small" offset={[token.marginXS, -2]} color={token.colorPrimary}>
          <span style={{ paddingRight: token.marginSM }}>All</span>
        </Badge>
      ),
      children: allContent,
    },
    ...SEARCH_DOMAIN_ORDER.map((domain) => ({
      key: domain,
      label: (
        <Badge
          count={byDomain[domain].length}
          size="small"
          offset={[token.marginXS, -2]}
          color={token.colorPrimary}
        >
          <span style={{ paddingRight: token.marginSM }}>{SEARCH_DOMAIN_LABELS[domain]}</span>
        </Badge>
      ),
      children: renderDomainContent(domain),
    })),
  ];

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to="/dashboard">Back to home</PageBackButton>
      <Typography.Title level={4} style={{ margin: 0 }}>
        {title}
      </Typography.Title>

      <Flex wrap="wrap" gap={token.margin} align="center">
        <AppSearchInput
          allowClear
          placeholder="Search parts, SKUs, descriptions…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onPressEnter={() => runSearch()}
          style={{ minWidth: token.controlHeight * 10, flex: 1 }}
        />
        <Button type="primary" icon={<SearchOutlined />} onClick={() => runSearch()}>
          Search
        </Button>
      </Flex>

      <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
        {totalCount} result{totalCount !== 1 ? 's' : ''} across parts, content, submittals, BOM, and SeisBrace.
      </Typography.Paragraph>

      {totalCount === 0 ? (
        <Empty
          description={
            <Space orientation="vertical" size={token.marginXXS}>
              <Typography.Text strong>No results found</Typography.Text>
              <Typography.Text type="secondary">
                {q.trim() ? `Nothing matched “${q}”. Try a shorter term.` : 'No rows to show.'}
              </Typography.Text>
            </Space>
          }
        >
          <Button type="primary" onClick={() => navigate('/search/results?q=all')}>
            Show everything
          </Button>
        </Empty>
      ) : (
        <Tabs
          activeKey={activeTab}
          items={tabItems}
          onChange={(key) => setActiveTab(key as 'all' | SearchDomain)}
        />
      )}
    </Space>
  );
}
