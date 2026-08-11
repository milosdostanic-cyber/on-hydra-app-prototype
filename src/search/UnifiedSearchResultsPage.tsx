import { SearchOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { BomPageHeader } from '../bom/layout/BomPageHeader';
import { useActiveProject } from '../context/ActiveProjectContext';
import { PageBackButton } from '../shell/PageBackButton';
import { PageDescription } from '../shell/PageDescription';
import { shellTableCardStyle } from '../shell/shellTablePatterns';
import {
  hydraBaseNormal,
  hydraTextStyleToReactCss,
  hydraTitleHeading5,
} from '../theme/hydraTypography';
import { HydraColorfulTag, HydraTag } from '../ui/HydraTag';
import {
  AppSearchInput,
  INLINE_SEARCH_CONTROL_SIZE,
  Button,
  Card,
  Empty,
  Flex,
  List,
  Space,
  Tabs,
  Typography,
  theme,
} from '../ui/antd';
import type { TabsProps } from '../ui/antd';

import { SEARCH_DOMAIN_TAG_PRESET } from './searchDomainTagPresets';

import {
  SEARCH_DOMAIN_LABELS,
  SEARCH_DOMAIN_ORDER,
  searchByDomain,
  type SearchDomain,
  type UnifiedResultRow,
} from './unifiedSearchData';

function tabFromParams(domain: string | null, scope: string | null): 'all' | SearchDomain {
  if (domain && (SEARCH_DOMAIN_ORDER as string[]).includes(domain)) return domain as SearchDomain;
  if (scope === 'parts') return 'parts';
  return 'all';
}

function TabCountLabel({ label, count }: { label: string; count: number }) {
  const { token } = theme.useToken();
  const hasResults = count > 0;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: token.marginXS }}>
      {label}
      {hasResults ? (
        <HydraTag bordered={false} style={{ margin: 0 }}>
          {count}
        </HydraTag>
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

/**
 * Figma `List Item (BOM)` detail row (node 6067:43068 / 6067:43058).
 * Fixed-width label column keeps `ASC part` and `Used In` tag columns aligned; gap = Figma `paddingXS` (8px).
 */
function SearchResultLabeledRow({
  label,
  align = 'flex-start',
  children,
}: {
  label: string;
  align?: 'flex-start' | 'center';
  children?: ReactNode;
}) {
  const { token } = theme.useToken();
  // Figma label column min-width 56px = controlHeightLG (40) + marginXS * 2 (16).
  const labelColMinWidth = token.controlHeightLG + token.marginXS * 2;

  return (
    <Flex gap={token.paddingXS} align={align} style={{ width: '100%' }}>
      <Typography.Text
        style={{
          ...hydraTextStyleToReactCss(hydraBaseNormal),
          color: token.colorTextDescription,
          flexShrink: 0,
          minWidth: labelColMinWidth,
          paddingBlock: token.paddingXXS,
        }}
      >
        {label}
      </Typography.Text>
      <Flex gap={token.paddingXS} wrap="wrap" align="center" style={{ flex: 1, minWidth: 0 }}>
        {children}
      </Flex>
    </Flex>
  );
}

function UsageContextList({ row }: { row: UnifiedResultRow }) {
  const contexts = row.usageContexts ?? [];
  if (contexts.length === 0) return null;

  const visibleContexts = contexts.slice(0, 4);
  const remainingCount = contexts.length - visibleContexts.length;

  return (
    <SearchResultLabeledRow label="Used In" align="flex-start">
      {visibleContexts.map((context) => (
        <HydraColorfulTag
          key={`${context.module}-${context.destinationName}`}
          preset={SEARCH_DOMAIN_TAG_PRESET[context.module]}
        >
          {context.label}: {context.destinationName}
          {context.projectName ? ` · ${context.projectName}` : ''}
          {context.detail ? ` · ${context.detail}` : ''}
        </HydraColorfulTag>
      ))}
      {remainingCount > 0 ? (
        <Typography.Text
          type="secondary"
          style={{ ...hydraTextStyleToReactCss(hydraBaseNormal), flexShrink: 0 }}
        >
          +{remainingCount} more
        </Typography.Text>
      ) : null}
    </SearchResultLabeledRow>
  );
}

function ResultRowAttributeSection({ row }: { row: UnifiedResultRow }) {
  const hasAttributes = Boolean(row.context || row.meta?.length);
  if (!hasAttributes) return null;

  const attributeLabel = row.context ?? (row.meta?.length ? 'Details' : '');
  if (!attributeLabel) return null;

  return (
    <SearchResultLabeledRow label={attributeLabel} align="center">
      {(row.meta ?? []).slice(0, 3).map((meta) => (
        <HydraTag key={meta}>
          {meta}
        </HydraTag>
      ))}
    </SearchResultLabeledRow>
  );
}

/** Figma metadata panel (node 222:511) — `colorFillQuaternary` fill, `borderRadius` (6px), `paddingSm`, no border. */
function ResultRowMetadataSection({ row }: { row: UnifiedResultRow }) {
  const { token } = theme.useToken();
  const hasAttributes = Boolean(row.context || row.meta?.length);
  const hasUsage = Boolean(row.usageContexts?.length);
  if (!hasAttributes && !hasUsage) return null;

  return (
    <Flex
      vertical
      gap={token.paddingXS}
      style={{
        width: '100%',
        padding: token.paddingSM,
        borderRadius: token.borderRadius,
        background: token.colorFillQuaternary,
      }}
    >
      <ResultRowAttributeSection row={row} />
      <UsageContextList row={row} />
    </Flex>
  );
}

/**
 * Figma identity block (node 222:505).
 * SKU = Title/Heading 5 in `colorPrimaryText`; subtitle = Base/Normal in `colorTextSecondary`;
 * domain tag sits directly after the SKU (gap = Figma `paddingSm`, vertically centered).
 */
function ResultRowIdentitySection({
  row,
  showDomainTag,
  onSelect,
}: {
  row: UnifiedResultRow;
  showDomainTag: boolean;
  onSelect: (row: UnifiedResultRow) => void;
}) {
  const { token } = theme.useToken();
  const subtitleStyle = {
    ...hydraTextStyleToReactCss(hydraBaseNormal),
    color: token.colorTextSecondary,
  };
  const headlineStyle = {
    ...hydraTextStyleToReactCss(hydraTitleHeading5),
    color: token.colorPrimaryText,
  };

  return (
    <Flex vertical gap={token.paddingXXS} style={{ width: '100%' }}>
      <Flex align="center" gap={token.paddingSM} wrap="wrap">
        <Link to={row.href} onClick={() => onSelect(row)} style={{ minWidth: 0, ...headlineStyle }}>
          {row.title}
        </Link>
        {showDomainTag ? (
          <HydraColorfulTag preset={SEARCH_DOMAIN_TAG_PRESET[row.domain]}>
            {SEARCH_DOMAIN_LABELS[row.domain]}
          </HydraColorfulTag>
        ) : null}
      </Flex>

      <Typography.Paragraph
        ellipsis={{ rows: 2, tooltip: row.subtitle }}
        style={{ margin: 0, width: '100%', ...subtitleStyle }}
      >
        {row.subtitle}
      </Typography.Paragraph>
    </Flex>
  );
}

/** Figma root `List Item (BOM)` (node 6067:42905) — px `paddingMd`, py `padding`, container gap `padding`. */
function ResultRow({
  row,
  onSelect,
  showDomainTag,
}: {
  row: UnifiedResultRow;
  onSelect: (row: UnifiedResultRow) => void;
  showDomainTag: boolean;
}) {
  const { token } = theme.useToken();

  return (
    <List.Item
      style={{
        paddingBlock: token.padding,
        paddingInline: token.paddingMD,
        borderBlockEndColor: token.colorBorderSecondary,
      }}
    >
      <Flex vertical gap={token.padding} style={{ width: '100%' }}>
        <ResultRowIdentitySection row={row} showDomainTag={showDomainTag} onSelect={onSelect} />
        <ResultRowMetadataSection row={row} />
      </Flex>
    </List.Item>
  );
}

function ResultsList({
  rows,
  onSelect,
  showDomainTag,
}: {
  rows: UnifiedResultRow[];
  onSelect: (row: UnifiedResultRow) => void;
  showDomainTag: boolean;
}) {
  const { token } = theme.useToken();
  const tableShellStyle = shellTableCardStyle(token);
  return (
    <Card styles={{ body: { padding: 0 } }} style={tableShellStyle}>
      <List<UnifiedResultRow>
        dataSource={rows}
        renderItem={(row) => (
          <ResultRow row={row} onSelect={onSelect} showDomainTag={showDomainTag} />
        )}
      />
    </Card>
  );
}

export function UnifiedSearchResultsPage() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const { setProjectId } = useActiveProject();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const scopeParam = params.get('scope');
  const domainParam = params.get('domain');
  const [draft, setDraft] = useState(q);
  const [activeTab, setActiveTab] = useState<'all' | SearchDomain>(() =>
    tabFromParams(domainParam, scopeParam),
  );

  useEffect(() => {
    setDraft(q);
  }, [q]);

  useEffect(() => {
    setActiveTab(tabFromParams(domainParam, scopeParam));
  }, [domainParam, scopeParam]);

  const byDomain = useMemo(() => searchByDomain(q), [q]);
  const totalCount = useMemo(
    () => SEARCH_DOMAIN_ORDER.reduce((sum, d) => sum + byDomain[d].length, 0),
    [byDomain],
  );
  const allRows = useMemo(
    () => SEARCH_DOMAIN_ORDER.flatMap((domain) => byDomain[domain]),
    [byDomain],
  );

  const runSearch = (next?: string) => {
    const value = (next ?? draft).trim() || 'all';
    setParams({
      q: value,
      ...(activeTab === 'all' ? { scope: scopeParam ?? 'all' } : { domain: activeTab }),
    });
  };

  const title = !q.trim() || q === 'all' ? 'Part search' : `Results for “${q}”`;
  const resultsPanelStyle = shellTableCardStyle(token);

  const headerDescription =
    totalCount === 0
      ? 'Search parts, content, submittals, BOM, and SeisBrace — open a part to download or add to a package.'
      : `${totalCount} result${totalCount !== 1 ? 's' : ''} across parts, content, submittals, BOM, and SeisBrace.`;

  const activeTabLabel =
    activeTab === 'all' ? 'All categories' : SEARCH_DOMAIN_LABELS[activeTab as SearchDomain];

  const changeTab = (key: string) => {
    const nextTab = key as 'all' | SearchDomain;
    setActiveTab(nextTab);
    setParams({
      q: q || 'all',
      ...(nextTab === 'all' ? { scope: scopeParam ?? 'all' } : { domain: nextTab }),
    });
  };

  const renderDomainContent = (domain: SearchDomain) => {
    const rows = byDomain[domain];
    if (rows.length === 0) {
      return <DomainEmptyState domain={domain} query={q} />;
    }
    return (
      <ResultsList
        rows={rows}
        showDomainTag={false}
        onSelect={(row) => {
          if (row.projectId) setProjectId(row.projectId);
        }}
      />
    );
  };

  const allContent =
    allRows.length === 0 ? (
      <DomainEmptyState domain="all" query={q} />
    ) : (
      <ResultsList
        rows={allRows}
        showDomainTag
        onSelect={(row) => {
          if (row.projectId) setProjectId(row.projectId);
        }}
      />
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
              onChange={changeTab}
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
