import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { AppliedFilterTag } from '../components/AppliedFilterTag';
import {
  CompetitorPartCard,
  FIGURE_MATCH_TAG_PRESET,
  FigureMatchCard,
  RsfcPartCard,
  UnmatchedCompetitorCard,
} from '../components/PartCrossReferenceCard';
import { PartCrossReferenceFigureModal } from '../components/PartCrossReferenceFigureModal';
import { PartCrossReferenceFilters } from '../components/PartCrossReferenceFilters';
import { PartCrossReferenceMatchModal } from '../components/PartCrossReferenceMatchModal';
import {
  ALL_CATEGORIES,
  CROSS_REFERENCE_CATEGORY_GROUPS,
  EMPTY_CROSS_REFERENCE_FILTERS,
  FIGURE_MATCH,
  countActiveFilters,
  countForFilterValue,
  crossReferenceMatchTypeLabel,
  listCrossReferenceResults,
  type CrossReferenceDirection,
  type CrossReferenceFilters,
  type CrossReferenceResult,
} from '../data/partCrossReferenceData';
import { PIM_FILTER_LABELS, endConnectionLabel, sizeLabel } from '../data/pimDisplayMapping';
import { BomPageHeader } from '../layout/BomPageHeader';
import { PageBackButton } from '../../shell/PageBackButton';
import {
  AppSearchInput,
  Button,
  Card,
  Empty,
  EmptyStateBlock,
  Flex,
  Modal,
  Pagination,
  Result,
  Segmented,
  Select,
  Skeleton,
  Typography,
  message,
  theme,
} from '../../ui/antd';
import type { SelectProps } from '../../ui/antd';

type Phase = 'idle' | 'loading' | 'results' | 'error';

const PAGE_SIZE = 20;
/** Prototype latency so the searching state is visible. */
const SEARCH_DELAY_MS = 450;

const DIRECTION_OPTIONS = [
  { value: 'competitor', label: 'Competitor part → RSFC' },
  { value: 'rsfc', label: 'RSFC part → competitor' },
] satisfies Array<{ value: CrossReferenceDirection; label: string }>;

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
  { key: 'endConnections', prefix: PIM_FILTER_LABELS.endConnections, format: endConnectionLabel },
  { key: 'materials', prefix: PIM_FILTER_LABELS.materials },
  { key: 'certifications', prefix: PIM_FILTER_LABELS.certifications },
  { key: 'brands', prefix: PIM_FILTER_LABELS.brands },
];

/**
 * BOM · Part Cross-Reference, concept B (part cards). Figma BOM - RSFC frame `7651:4917`:
 * B1 `7655:5453` (competitor → RSFC), B2 `7655:5560` (RSFC → competitor), filters column from A1 `7651:11285`.
 *
 * Open decision (BOM-360): the page lists all parts before a search. `?start=search` restores search-first.
 * `?simulateError=1` shows the error state. Filters apply client-side in this prototype.
 */
export function BomPartCrossReferencePage() {
  const { token } = theme.useToken();
  const [params, setParams] = useSearchParams();
  const simulateError = params.get('simulateError') === '1';
  const searchFirst = params.get('start') === 'search';

  const [direction, setDirection] = useState<CrossReferenceDirection>(params.get('dir') === 'rsfc' ? 'rsfc' : 'competitor');
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [category, setCategory] = useState(params.get('category') ?? ALL_CATEGORIES);
  const [submitted, setSubmitted] = useState<{ q: string; category: string; direction: CrossReferenceDirection } | null>(
    searchFirst ? null : { q: params.get('q') ?? '', category: params.get('category') ?? ALL_CATEGORIES, direction },
  );
  const [filters, setFilters] = useState<CrossReferenceFilters>(EMPTY_CROSS_REFERENCE_FILTERS);
  const [phase, setPhase] = useState<Phase>(searchFirst && !params.get('q') ? 'idle' : 'results');
  const [page, setPage] = useState(1);
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
  }, [page, submitted, filters]);

  const syncParams = useCallback(
    (q: string, cat: string, dir: CrossReferenceDirection) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (q) next.set('q', q);
          else next.delete('q');
          if (cat === ALL_CATEGORIES) next.delete('category');
          else next.set('category', cat);
          if (dir === 'rsfc') next.set('dir', 'rsfc');
          else next.delete('dir');
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const runSearch = useCallback(
    (q: string, cat: string, dir: CrossReferenceDirection) => {
      const trimmed = q.trim();
      if (!trimmed && searchFirst) {
        message.warning('Enter a figure number, SKU, description or keyword.');
        return;
      }
      window.clearTimeout(timer.current);
      setSubmitted({ q: trimmed, category: cat, direction: dir });
      setPhase('loading');
      setPage(1);
      syncParams(trimmed, cat, dir);
      timer.current = window.setTimeout(() => setPhase(simulateError ? 'error' : 'results'), SEARCH_DELAY_MS);
    },
    [searchFirst, simulateError, syncParams],
  );

  // First load: show the loading state once, then the list (or the search from the URL).
  useEffect(() => {
    if (!searchFirst || params.get('q')) runSearch(params.get('q') ?? '', params.get('category') ?? ALL_CATEGORIES, direction);
    return () => window.clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  const onDirectionChange = (next: CrossReferenceDirection) => {
    setDirection(next);
    if (submitted) runSearch(submitted.q, category, next);
  };

  const onCategoryChange = (next: string) => {
    setCategory(next);
    if (submitted) runSearch(submitted.q, next, direction);
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
    syncParams('', ALL_CATEGORIES, direction);
    if (searchFirst) {
      setSubmitted(null);
      setPhase('idle');
    } else {
      setSubmitted({ q: '', category: ALL_CATEGORIES, direction });
      setPhase('results');
    }
  };

  const changeFilters = (next: CrossReferenceFilters) => {
    setFilters(next);
    setPage(1);
  };

  const results = useMemo(
    () => submitted ? listCrossReferenceResults(submitted.direction, submitted.q, submitted.category, filters) : [],
    [filters, submitted],
  );
  const total = results.length;
  const filterCount = countActiveFilters(filters);
  const from = (page - 1) * PAGE_SIZE;
  const to = Math.min(page * PAGE_SIZE, total);
  const showResults = phase === 'results' && submitted != null && total > 0;
  // The "no parts match these filters" message is only right when the filters are the cause. If the search or category
  // alone finds nothing, the search message below is the honest one (filter values with 0 results are disabled, so the
  // filters alone can only empty the list after the search or category changed).
  const filtersCauseEmpty = useMemo(() => {
    if (!submitted || filterCount === 0) return false;
    return listCrossReferenceResults(
      submitted.direction, submitted.q, submitted.category, EMPTY_CROSS_REFERENCE_FILTERS,
    ).length > 0;
  }, [filterCount, submitted]);
  const noun = results.some((result) => result.kind === 'figure' || result.kind === 'unmatched-competitor')
    ? 'result'
    : submitted?.direction === 'rsfc' ? 'RSFC part' : 'competitor part';

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
      {results.slice(from, to).map((result) => {
        const onOpen = () => setOpenMatch(result);
        switch (result.kind) {
          case 'figure':
            return <FigureMatchCard key={`figure:${result.key}`} result={result} onOpen={onOpen} />;
          case 'rsfc-sku':
            return <RsfcPartCard key={result.part.sku} result={result} onOpen={onOpen} />;
          case 'competitor-sku':
            return <CompetitorPartCard key={result.part.sku} result={result} onOpen={onOpen} />;
          case 'unmatched-competitor':
            return <UnmatchedCompetitorCard key={result.part.sku} result={result} onOpen={onOpen} />;
        }
      })}
    </div>
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
            <Button type="primary" onClick={() => submitted && runSearch(submitted.q, submitted.category, submitted.direction)}>
              Try again
            </Button>
          }
        />
      );
    }

    if (phase === 'results' && submitted) {
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
                runSearch(submitted.q, ALL_CATEGORIES, submitted.direction);
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
    }

    return (
      <EmptyStateBlock
        title={direction === 'rsfc' ? 'Find competitor parts for an RSFC part' : 'Find an RSFC equivalent'}
        description={
          direction === 'rsfc'
            ? 'Enter an RSFC figure number, SKU or description. For example: 7811, 2200750046 or check valve.'
            : 'Enter a competitor figure number, SKU, description or keyword. For example: 716, V024716PE0 or check valve.'
        }
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
        description="Find RSFC equivalents for a competitor part, or see which competitor parts match an RSFC part."
      />

      <Flex gap={token.padding} align="stretch" style={{ flex: 1, minHeight: 0 }}>
        <PartCrossReferenceFilters
          value={filters}
          onChange={changeFilters}
          onClear={clearFilters}
          fitHeight={fitHeight}
          countFor={
            submitted
              ? (key, value) => countForFilterValue(submitted.direction, submitted.q, submitted.category, filters, key, value)
              : undefined
          }
        />

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
                <Segmented
                  aria-label="Search direction"
                  value={direction}
                  onChange={(value) => onDirectionChange(value as CrossReferenceDirection)}
                  options={DIRECTION_OPTIONS}
                />
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
                    aria-label={direction === 'rsfc' ? 'Search RSFC parts' : 'Search competitor parts'}
                    size="middle"
                    allowClear
                    placeholder={
                      direction === 'rsfc'
                        ? 'Search by RSFC figure, SKU or description'
                        : 'Search by figure, SKU or description'
                    }
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onPressEnter={() => runSearch(query, category, direction)}
                    style={{ flex: 1 }}
                  />
                  <Button type="primary" size="middle" onClick={() => runSearch(query, category, direction)}>
                    Search
                  </Button>
                </Flex>
              </Flex>

              {/* Applied filters only. The result count lives in the footer. */}
              {phase === 'results' && submitted && chips.length > 0 ? (
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
                  {renderGrid()}
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
                    Showing {from + 1}–{to} of {total} {noun}
                    {total === 1 ? '' : 's'}
                    {submitted?.q ? ` matching “${submitted.q}”` : ''}
                    {submitted && submitted.category !== ALL_CATEGORIES ? ` in ${submitted.category}` : ''}
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

      <PartCrossReferenceMatchModal
        result={openMatch?.kind === 'competitor-sku' || openMatch?.kind === 'rsfc-sku' ? openMatch : null}
        onClose={() => setOpenMatch(null)}
      />
      <PartCrossReferenceFigureModal
        result={openMatch?.kind === 'figure' ? openMatch : null}
        onClose={() => setOpenMatch(null)}
      />
      <Modal
        title="No verified RSFC replacement"
        open={openMatch?.kind === 'unmatched-competitor'}
        onCancel={() => setOpenMatch(null)}
        destroyOnHidden
        footer={<Button onClick={() => setOpenMatch(null)}>Close</Button>}
      >
        {openMatch?.kind === 'unmatched-competitor' && (
          <Flex vertical gap={token.marginXS}>
            <Typography.Text strong>{`${openMatch.part.brand} SKU ${openMatch.part.sku} · Fig. ${openMatch.part.figure}`}</Typography.Text>
            <Typography.Text>{openMatch.part.description}</Typography.Text>
            <Typography.Text type="secondary">
              The prototype recognizes this competitor part. Search using another SKU, figure number or description.
            </Typography.Text>
          </Flex>
        )}
      </Modal>
    </Flex>
  );
}
