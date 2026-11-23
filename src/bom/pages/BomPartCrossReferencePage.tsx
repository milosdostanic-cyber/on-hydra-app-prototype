import { AppstoreOutlined, TableOutlined } from '@ant-design/icons';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { AppliedFilterTag } from '../components/AppliedFilterTag';
import { CrossReferenceStatusTag, FIGURE_MATCH_TAG_PRESET, PartCrossReferenceCard } from '../components/PartCrossReferenceCard';
import { PartCrossReferenceFilters } from '../components/PartCrossReferenceFilters';
import { PartCrossReferenceMatchModal } from '../components/PartCrossReferenceMatchModal';
import {
  ALL_CATEGORIES,
  CROSS_REFERENCE_CATEGORY_GROUPS,
  EMPTY_CROSS_REFERENCE_FILTERS,
  FIGURE_MATCH,
  countActiveFilters,
  countForFilterValue,
  crossReferenceFacets,
  filterCrossReferenceResults,
  crossReferenceMatchTypeLabel,
  listCrossReferenceResults,
  summarizeCrossReferenceResult,
  type CrossReferenceFilters,
  type CrossReferenceResult,
} from '../data/partCrossReferenceData';
import { PIM_FILTER_LABELS, sizeLabel } from '../data/pimDisplayMapping';
import { BomPageHeader } from '../layout/BomPageHeader';
import { PageBackButton } from '../../shell/PageBackButton';
import { hydraBaseMedium, hydraTextStyleToReactCss } from '../../theme/hydraTypography';
import {
  AppSearchInput,
  Button,
  Card,
  Empty,
  EmptyStateBlock,
  Flex,
  Pagination,
  Result,
  Segmented,
  Select,
  Skeleton,
  Table,
  Typography,
  theme,
} from '../../ui/antd';
import type { SelectProps } from '../../ui/antd';

type Phase = 'loading' | 'results' | 'error';
type ResultsView = 'cards' | 'table';

const PAGE_SIZE = 20;
/** Prototype latency so the searching state is visible. */
const SEARCH_DELAY_MS = 450;

const CATEGORY_OPTIONS: SelectProps['options'] = [
  { value: ALL_CATEGORIES, label: 'All categories' },
  ...CROSS_REFERENCE_CATEGORY_GROUPS.map((group) => ({
    label: group.label,
    title: group.label,
    options: group.categories.map((category) => ({ value: category, label: category })),
  })),
];

const FILTER_LABELS: Array<{ key: keyof CrossReferenceFilters; prefix: string; format?: (value: string) => string }> = [
  { key: 'matchTypes', prefix: 'Match type', format: crossReferenceMatchTypeLabel },
  { key: 'origins', prefix: 'Origin' },
  { key: 'productTypes', prefix: PIM_FILTER_LABELS.productTypes },
  { key: 'sizes', prefix: PIM_FILTER_LABELS.sizes, format: sizeLabel },
  { key: 'brands', prefix: 'Brand' },
];

/** Browse or search competitor parts to find mapped RSFC replacements. */
export function BomPartCrossReferencePage() {
  const { token } = theme.useToken();
  const [params, setParams] = useSearchParams();
  const simulateError = params.get('simulateError') === '1';
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [category, setCategory] = useState(params.get('category') ?? ALL_CATEGORIES);
  const [submitted, setSubmitted] = useState({ q: query.trim(), category });
  const [filters, setFilters] = useState<CrossReferenceFilters>(EMPTY_CROSS_REFERENCE_FILTERS);
  const [phase, setPhase] = useState<Phase>('loading');
  const [page, setPage] = useState(1);
  const [view, setView] = useState<ResultsView>('cards');
  const [openMatch, setOpenMatch] = useState<CrossReferenceResult | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  /** Page height that fits the visible area, so only the cards scroll and the footer stays in view. */
  const [fitHeight, setFitHeight] = useState<number | undefined>();

  useLayoutEffect(() => {
    const root = rootRef.current;
    // The app shell's scrolling content area (`main`); the page must fit inside it.
    let area: HTMLElement | null = root?.parentElement ?? null;
    while (area && !['auto', 'scroll'].includes(getComputedStyle(area).overflowY)) area = area.parentElement;
    const fit = () => {
      if (!root || !area) return;
      const areaBox = area.getBoundingClientRect();
      const offset = root.getBoundingClientRect().top - areaBox.top + area.scrollTop;
      const bottom = parseFloat(getComputedStyle(area).paddingBottom) || token.marginLG;
      setFitHeight(Math.max(area.clientHeight - offset - bottom, token.controlHeight * 15));
    };
    fit();
    // The header above can still change height after the first paint (fonts, breadcrumb), which moves this page
    // down without resizing `main`. Measure again once fonts are ready and on the next frames.
    let frame = requestAnimationFrame(() => {
      fit();
      frame = requestAnimationFrame(fit);
    });
    void document.fonts?.ready.then(fit);
    const observer = new ResizeObserver(fit);
    if (area) observer.observe(area);
    if (root?.parentElement) observer.observe(root.parentElement);
    window.addEventListener('resize', fit);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', fit);
    };
  }, [token.controlHeight, token.marginLG]);

  // New page, search or filter: start at the top of the cards.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [page, submitted, filters, view]);

  const syncParams = useCallback(
    (q: string, cat: string) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (q) next.set('q', q);
          else next.delete('q');
          if (cat === ALL_CATEGORIES) next.delete('category');
          else next.set('category', cat);
          next.delete('dir');
          next.delete('start');
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const runSearch = useCallback(
    (q: string, cat: string) => {
      const trimmed = q.trim();
      window.clearTimeout(timer.current);
      setSubmitted({ q: trimmed, category: cat });
      setPhase('loading');
      setPage(1);
      syncParams(trimmed, cat);
      timer.current = window.setTimeout(() => setPhase(simulateError ? 'error' : 'results'), SEARCH_DELAY_MS);
    },
    [simulateError, syncParams],
  );

  // First load: show the loading state once, then the list (or the search from the URL).
  useEffect(() => {
    runSearch(query, category);
    return () => window.clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  const onCategoryChange = (next: string) => {
    setCategory(next);
    runSearch(submitted.q, next);
  };

  const clearFilters = () => {
    setFilters(EMPTY_CROSS_REFERENCE_FILTERS);
    setPage(1);
  };

  const clearSearch = () => {
    window.clearTimeout(timer.current);
    setQuery('');
    setCategory(ALL_CATEGORIES);
    setFilters(EMPTY_CROSS_REFERENCE_FILTERS);
    setPage(1);
    syncParams('', ALL_CATEGORIES);
    setSubmitted({ q: '', category: ALL_CATEGORIES });
    setPhase('results');
  };

  const changeFilters = (next: CrossReferenceFilters) => {
    setFilters(next);
    setPage(1);
  };

  const candidates = useMemo(
    () => listCrossReferenceResults(submitted.q, submitted.category),
    [submitted],
  );
  const facets = useMemo(() => crossReferenceFacets(candidates), [candidates]);
  const results = useMemo(() => filterCrossReferenceResults(candidates, filters), [candidates, filters]);
  const total = results.length;
  const from = (page - 1) * PAGE_SIZE;
  const to = Math.min(page * PAGE_SIZE, total);
  const visibleRows = results.slice(from, to).map((result) => ({ ...summarizeCrossReferenceResult(result), result }));
  const showResults = phase === 'results' && total > 0;
  const filtersCauseEmpty = candidates.length > 0 && countActiveFilters(filters) > 0;

  const removeFilter = (key: keyof CrossReferenceFilters, value: string) => {
    changeFilters({ ...filters, [key]: (filters[key] as string[]).filter((v) => v !== value) });
  };

  const renderGrid = () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${token.controlHeight * 8}px, 1fr))`,
        gap: token.padding,
        padding: token.paddingMD,
        alignItems: 'start',
      }}
    >
      {visibleRows.map(({ key, result }) => (
        <PartCrossReferenceCard
          key={key}
          result={result}
          onOpen={() => setOpenMatch(result)}
        />
      ))}
    </div>
  );

  const renderTable = () => (
    <Table<(typeof visibleRows)[number]>
      rowKey="key"
      pagination={false}
      dataSource={visibleRows}
      scroll={{ x: token.controlHeight * 23 }}
      columns={[
        {
          title: 'Description',
          key: 'description',
          render: (_, row) => (
            <Button
              type="link"
              aria-label={`View matches for ${row.brand} ${row.identifier}`}
              onClick={() => setOpenMatch(row.result)}
              style={{ padding: 0, height: 'auto', textAlign: 'start', whiteSpace: 'normal' }}
            >
              {row.description}
            </Button>
          ),
        },
        { title: 'Brand', dataIndex: 'brand' },
        {
          title: 'Part identifier',
          dataIndex: 'identifier',
          render: (_, row) => (
            <Typography.Text>
              {`${row.identifierLabel} `}
              <Typography.Text style={hydraTextStyleToReactCss(hydraBaseMedium)}>{row.identifierValue}</Typography.Text>
            </Typography.Text>
          ),
        },
        {
          title: 'Match type',
          dataIndex: 'matchType',
          render: (_, row) => <CrossReferenceStatusTag type={row.matchType} />,
        },
        { title: 'Matches', dataIndex: 'countLabel', align: 'end' },
      ]}
    />
  );

  const renderState = () => {
    if (phase === 'loading') {
      return (
        <div
          aria-busy="true"
          aria-label="Searching parts"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fill, minmax(${token.controlHeight * 8}px, 1fr))`,
            gap: token.padding,
            padding: token.paddingMD,
          }}
        >
          {Array.from({ length: PAGE_SIZE }, (_, index) => (
            <Card key={index} styles={{ body: { padding: token.paddingSM } }} style={{ borderColor: token.colorBorderSecondary }}>
              <Skeleton active title={{ width: '40%' }} paragraph={{ rows: 3 }} />
            </Card>
          ))}
        </div>
      );
    }

    if (phase === 'error') {
      return (
        <Result
          status="error"
          title="We couldn’t load results"
          subTitle="Something went wrong on our side. Your search and filters are kept. Try again in a moment."
          extra={
            <Button type="primary" onClick={() => runSearch(submitted.q, submitted.category)}>
              Try again
            </Button>
          }
        />
      );
    }

    if (filtersCauseEmpty) {
      return (
        <EmptyStateBlock
          title="No parts match these filters"
          description="Remove a filter or clear them all to see more parts."
          action={{ label: 'Clear filters', onClick: clearFilters }}
        />
      );
    }
    if (submitted.category !== ALL_CATEGORIES) {
      return (
        <EmptyStateBlock
          title={`No matches in ${submitted.category}`}
          description={submitted.q ? `Nothing in this category matches “${submitted.q}”.` : 'There are no parts in this category yet.'}
          action={{
            label: 'Search all categories',
            onClick: () => {
              setCategory(ALL_CATEGORIES);
              runSearch(submitted.q, ALL_CATEGORIES);
            },
          }}
          secondaryAction={{ label: 'Clear search', onClick: clearSearch }}
        />
      );
    }
    return (
      <EmptyStateBlock
        title={`No parts match “${submitted.q}”`}
        description="Try one keyword or a figure number, for example “valve” or “716”, and check the SKU spelling."
        action={{ label: 'Clear search', onClick: clearSearch }}
      />
    );
  };

  const chips = FILTER_LABELS.flatMap(({ key, prefix, format }) =>
    (filters[key] as string[]).map((value) => ({ key, value, label: `${prefix}: ${format ? format(value) : value}` })),
  );

  return (
    <Flex ref={rootRef} vertical gap={token.marginLG} style={{ width: '100%', ...(fitHeight ? { flex: '0 0 auto', height: fitHeight } : { flex: 1 }), minHeight: 0 }}>
      {/* UX-012: sub-page of the BOM hub, so it starts with the back button, 24 px above the title. */}
      <PageBackButton to="/bom">Back to BOM</PageBackButton>

      <BomPageHeader
        title="Search RSFC Parts"
        description="Find RSFC equivalents for a competitor part."
      />

      <Flex gap={token.padding} align="stretch" style={{ flex: 1, minHeight: 0 }}>
        {(candidates.length > 0 || countActiveFilters(filters) > 0) && (
          <PartCrossReferenceFilters
            value={filters}
            facets={facets}
            onChange={changeFilters}
            onClear={clearFilters}
            fitHeight={fitHeight}
            countFor={(key, value) => countForFilterValue(candidates, filters, key, value)}
          />
        )}

        {/* UX-007: card padding 0; toolbar and footer carry the spacing. UX-009: state cards fill down to the page padding. */}
        <Card
          variant="borderless"
          styles={{
            body: { padding: 0, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' as const },
          }}
          style={{
            flex: 1,
            minWidth: 0,
            borderRadius: token.borderRadiusLG,
            boxShadow: token.boxShadowTertiary,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          <Flex vertical style={{ flex: 1, minHeight: 0 }}>
            <Flex
              vertical
              gap={token.paddingSM}
              style={{
                paddingInline: token.paddingMD,
                paddingBlock: token.padding,
                borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
              }}
            >
              {/* UX-001: 20 px between independent controls; UX-005: Input + Search button, 8 px gap. */}
              <Flex gap={token.paddingMD} align="center" wrap="wrap">
                <Select
                  aria-label="Category"
                  size="middle"
                  value={category}
                  onChange={onCategoryChange}
                  options={CATEGORY_OPTIONS}
                  showSearch={{ optionFilterProp: 'label' }}
                  popupMatchSelectWidth={token.controlHeight * 12}
                  listHeight={token.controlHeight * 12}
                  notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No matching categories" />}
                  style={{ width: token.controlHeight * 6 }}
                />
                <Flex gap={token.paddingXS} align="center" style={{ flex: `1 1 ${token.controlHeight * 7}px`, minWidth: token.controlHeight * 7 }}>
                  <AppSearchInput
                    aria-label="Search competitor parts"
                    size="middle"
                    allowClear
                    placeholder="Search by competitor SKU, figure or description"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onPressEnter={() => runSearch(query, category)}
                    style={{ flex: 1 }}
                  />
                  <Button type="primary" size="middle" onClick={() => runSearch(query, category)}>
                    Search
                  </Button>
                </Flex>
                <Segmented<ResultsView>
                  aria-label="Results view"
                  value={view}
                  options={[
                    { value: 'cards', icon: <AppstoreOutlined aria-label="Cards" />, tooltip: 'Cards' },
                    { value: 'table', icon: <TableOutlined aria-label="Table" />, tooltip: 'Table' },
                  ]}
                  onChange={setView}
                />
              </Flex>

              {/* Applied filters only. The result count lives in the footer. */}
              {phase === 'results' && chips.length > 0 ? (
                <Flex gap={token.marginXS} wrap="wrap" align="center">
                  {chips.map((chip) => (
                    <AppliedFilterTag
                      key={`${chip.key}-${chip.value}`}
                      label={chip.label}
                      preset={chip.key === 'matchTypes' && chip.value === FIGURE_MATCH ? FIGURE_MATCH_TAG_PRESET : undefined}
                      onRemove={() => removeFilter(chip.key, chip.value)}
                    />
                  ))}
                  <Typography.Link onClick={clearFilters}>Clear all</Typography.Link>
                </Flex>
              ) : null}
            </Flex>

            {showResults ? (
              <>
                {/* Only this area scrolls. Toolbar above and pagination below stay in view. */}
                <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                  {view === 'cards' ? renderGrid() : renderTable()}
                </div>
                <Flex
                  justify="space-between"
                  align="center"
                  wrap="wrap"
                  gap={token.marginSM}
                  style={{
                    flex: '0 0 auto',
                    paddingInline: token.paddingMD,
                    paddingBlock: token.padding,
                    borderTop: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                  }}
                >
                  <Typography.Text type="secondary">
                    Showing {from + 1}–{to} of {total} result
                    {total === 1 ? '' : 's'}
                    {submitted.q ? ` matching “${submitted.q}”` : ''}
                    {submitted.category !== ALL_CATEGORIES ? ` in ${submitted.category}` : ''}
                  </Typography.Text>
                  <Pagination
                    current={page}
                    pageSize={PAGE_SIZE}
                    total={total}
                    onChange={setPage}
                    showSizeChanger={false}
                    hideOnSinglePage
                  />
                </Flex>
              </>
            ) : phase === 'loading' ? (
              <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                {renderState()}
              </div>
            ) : (
              <Flex vertical justify="center" style={{ flex: 1, padding: token.paddingLG }}>
                {renderState()}
              </Flex>
            )}
          </Flex>
        </Card>
      </Flex>

      <PartCrossReferenceMatchModal result={openMatch} onClose={() => setOpenMatch(null)} />
    </Flex>
  );
}
