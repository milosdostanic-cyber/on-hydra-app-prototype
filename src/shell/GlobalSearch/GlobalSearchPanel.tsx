import { ArrowRightOutlined, ClockCircleOutlined, SearchOutlined } from '@ant-design/icons';

import {
  groupGlobalSearchResults,
  MIN_GLOBAL_SEARCH_CHARS,
  SEARCH_ENTITY_LABELS,
  SEARCH_ENTITY_ORDER,
  SEARCH_SCOPE_LABELS,
  type GlobalSearchResult,
  type SearchScope,
} from '../../search/globalSearchModel';
import { Button, Empty, Flex, Result, Skeleton, Space, Tag, Typography, theme } from '../../ui/antd';

import { GlobalSearchResultRow } from './GlobalSearchResultRow';
import { hydraBaseStrong, hydraTextStyleToReactCss } from '../../theme/hydraTypography';

type Props = {
  scope: SearchScope;
  query: string;
  results: GlobalSearchResult[];
  loading: boolean;
  error: string | null;
  belowThreshold: boolean;
  selectedResultKey?: string;
  recentSearches: string[];
  onResultSelect: (result: GlobalSearchResult) => void;
  onResultHover: (index: number) => void;
  onRunSearch: () => void;
  onExampleSelect: (value: string) => void;
};

const EXAMPLES: Record<SearchScope, string[]> = {
  parts: ['500-E', 'grooved coupling', '6 inch gate valve', 'CPVC clamp'],
  connected: ['Downtown Convention Center', 'Hospital Wing Renovation', 'Submittal Rev 2', 'Roof Riser'],
  all: ['500-E', 'Riverside Office Park', 'Fire protection BOM', 'Seismic Bracing'],
};

export function GlobalSearchPanel({
  scope,
  query,
  results,
  loading,
  error,
  belowThreshold,
  selectedResultKey,
  recentSearches,
  onResultSelect,
  onResultHover,
  onRunSearch,
  onExampleSelect,
}: Props) {
  const { token } = theme.useToken();
  const trimmedQuery = query.trim();
  const grouped = groupGlobalSearchResults(results);

  const panelStyle = {
    width: '100%',
    maxHeight: 560,
    overflowY: 'auto' as const,
    background: token.colorBgElevated,
    border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowSecondary,
    padding: token.paddingSM,
  };

  if (error) {
    return (
      <div style={panelStyle}>
        <Result
          status="warning"
          title="Search is unavailable"
          subTitle={error}
          extra={<Button onClick={onRunSearch}>Open search results</Button>}
          style={{ padding: token.paddingMD }}
        />
      </div>
    );
  }

  if (!trimmedQuery) {
    return (
      <div style={panelStyle}>
        <Space orientation="vertical" size={token.marginMD} style={{ width: '100%' }}>
          {recentSearches.length > 0 ? (
            <div>
              <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>Recent searches</Typography.Text>
              <Flex gap={token.marginXS} wrap="wrap" style={{ marginTop: token.marginXS }}>
                {recentSearches.map((recent) => (
                  <Button
                    key={recent}
                    size="small"
                    icon={<ClockCircleOutlined />}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => onExampleSelect(recent)}
                  >
                    {recent}
                  </Button>
                ))}
              </Flex>
            </div>
          ) : null}

          <div>
            <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>Try a lookup</Typography.Text>
            <Flex gap={token.marginXS} wrap="wrap" style={{ marginTop: token.marginXS }}>
              {EXAMPLES[scope].map((example) => (
                <Button
                  key={example}
                  size="small"
                  icon={<SearchOutlined />}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => onExampleSelect(example)}
                >
                  {example}
                </Button>
              ))}
            </Flex>
          </div>
        </Space>
      </div>
    );
  }

  if (belowThreshold) {
    return (
      <div style={panelStyle}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={`Type at least ${MIN_GLOBAL_SEARCH_CHARS} characters to search ${SEARCH_SCOPE_LABELS[scope]}.`}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div style={panelStyle}>
        <Skeleton active paragraph={{ rows: 4 }} title={false} />
      </div>
    );
  }

  if (results.length === 0) {
    const domainCopy =
      scope === 'parts'
        ? 'No parts found. Try searching by figure number, description, size, or material.'
        : scope === 'connected'
          ? 'No ConnectED entities found. Try a project, BOM, submittal, spec, or design name.'
          : 'No results found. Try a shorter term or a different search mode.';
    return (
      <div style={panelStyle}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Space orientation="vertical" size={token.marginXXS}>
              <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>No results for “{trimmedQuery}”</Typography.Text>
              <Typography.Text type="secondary">{domainCopy}</Typography.Text>
            </Space>
          }
        >
          <Button onClick={onRunSearch}>Open full search</Button>
        </Empty>
      </div>
    );
  }

  let rowIndex = 0;
  return (
    <div style={panelStyle}>
      <Space orientation="vertical" size={token.marginSM} style={{ width: '100%' }}>
        {SEARCH_ENTITY_ORDER.filter((entityType) => grouped[entityType]?.length).map((entityType) => (
          <div key={entityType}>
            <Flex align="center" gap={token.marginXS} style={{ marginBottom: token.marginXS }}>
              <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>{SEARCH_ENTITY_LABELS[entityType]}</Typography.Text>
              <Tag style={{ margin: 0 }}>{grouped[entityType]?.length ?? 0}</Tag>
            </Flex>
            <Space orientation="vertical" size={token.marginXXS} style={{ width: '100%' }}>
              {(grouped[entityType] ?? []).slice(0, 5).map((result) => {
                const currentIndex = rowIndex;
                rowIndex += 1;
                return (
                  <GlobalSearchResultRow
                    key={result.key}
                    result={result}
                    selected={selectedResultKey === result.key}
                    onHover={() => onResultHover(currentIndex)}
                    onSelect={() => onResultSelect(result)}
                  />
                );
              })}
            </Space>
          </div>
        ))}
        <Button
          type="link"
          block
          icon={<ArrowRightOutlined />}
          onMouseDown={(event) => event.preventDefault()}
          onClick={onRunSearch}
        >
          See all results for “{trimmedQuery}”
        </Button>
      </Space>
    </div>
  );
}
