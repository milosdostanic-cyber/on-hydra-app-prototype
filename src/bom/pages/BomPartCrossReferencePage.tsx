import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { PartCrossReferenceMatchModal } from '../components/PartCrossReferenceMatchModal';
import {
  ALL_CATEGORIES,
  CROSS_REFERENCE_CATEGORY_GROUPS,
  searchCompetitorParts,
  type CompetitorPart,
} from '../data/partCrossReferenceData';
import { BomPageHeader } from '../layout/BomPageHeader';
import { hydraBaseMedium, hydraTextStyleToReactCss } from '../../theme/hydraTypography';
import { HydraColorfulTag } from '../../ui/HydraTag';
import {
  AppSearchInput,
  Button,
  Card,
  EmptyStateBlock,
  Empty,
  Flex,
  Pagination,
  Result,
  Select,
  Spin,
  Table,
  Typography,
  message,
  theme,
} from '../../ui/antd';
import type { SelectProps, TableColumnsType } from '../../ui/antd';

type Phase = 'idle' | 'loading' | 'results' | 'error';

const PAGE_SIZE = 10;
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

/**
 * BOM · Part Cross-Reference (live `/bom/projects/:id/static-matches`).
 * Figma BOM - RSFC section `7560:210686`: category dropdown replaces the 43 live tabs;
 * search = Input + primary Search button (UX-005); Action column last, right-aligned (UX-004).
 */
export function BomPartCrossReferencePage() {
  const { token } = theme.useToken();
  const [params, setParams] = useSearchParams();
  const simulateError = params.get('simulateError') === '1';

  const [query, setQuery] = useState(params.get('q') ?? '');
  const [category, setCategory] = useState(params.get('category') ?? ALL_CATEGORIES);
  const [submitted, setSubmitted] = useState<{ q: string; category: string } | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [results, setResults] = useState<CompetitorPart[]>([]);
  const [page, setPage] = useState(1);
  const [openPart, setOpenPart] = useState<CompetitorPart | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const runSearch = useCallback(
    (q: string, cat: string) => {
      const trimmed = q.trim();
      if (!trimmed) {
        message.warning('Enter a figure number, SKU, description or keyword.');
        return;
      }
      window.clearTimeout(timer.current);
      setSubmitted({ q: trimmed, category: cat });
      setPhase('loading');
      setPage(1);
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('q', trimmed);
          if (cat === ALL_CATEGORIES) next.delete('category');
          else next.set('category', cat);
          return next;
        },
        { replace: true },
      );
      timer.current = window.setTimeout(() => {
        if (simulateError) {
          setPhase('error');
          return;
        }
        setResults(searchCompetitorParts(trimmed, cat));
        setPhase('results');
      }, SEARCH_DELAY_MS);
    },
    [setParams, simulateError],
  );

  // Restore a search from the URL (back navigation, shared links).
  useEffect(() => {
    const q = params.get('q');
    if (q) runSearch(q, params.get('category') ?? ALL_CATEGORIES);
    return () => window.clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  const onCategoryChange = (next: string) => {
    setCategory(next);
    if (submitted) runSearch(submitted.q, next);
  };

  const clearSearch = () => {
    window.clearTimeout(timer.current);
    setQuery('');
    setCategory(ALL_CATEGORIES);
    setSubmitted(null);
    setResults([]);
    setPhase('idle');
    setParams({}, { replace: true });
  };

  const matchesElsewhere = useMemo(
    () =>
      submitted && submitted.category !== ALL_CATEGORIES && results.length === 0
        ? searchCompetitorParts(submitted.q, ALL_CATEGORIES).length
        : 0,
    [results.length, submitted],
  );

  const columns: TableColumnsType<CompetitorPart> = [
    { title: 'Figure No.', dataIndex: 'figure', key: 'figure', width: 120, sorter: (a, b) => a.figure.localeCompare(b.figure) },
    { title: 'Competitor SKU', dataIndex: 'sku', key: 'sku', width: 170 },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (description: string) => <Typography.Link>{description}</Typography.Link>,
    },
    { title: 'Brand', dataIndex: 'brand', key: 'brand', width: 150 },
    {
      title: 'RSFC matches',
      key: 'matches',
      width: 150,
      sorter: (a, b) => a.equivalents.length - b.equivalents.length,
      render: (_, row) => (
        <HydraColorfulTag preset="blue" bordered={false}>
          {row.equivalents.length} {row.equivalents.length === 1 ? 'match' : 'matches'}
        </HydraColorfulTag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right',
      // UX-004: "View matches" link (≈85px, measured) + 16/16 cell padding; Description is the FILL column.
      width: 124,
      render: (_, row) => (
        <Typography.Link
          style={{ whiteSpace: 'nowrap' }}
          onClick={(event) => {
            event.stopPropagation();
            setOpenPart(row);
          }}
        >
          View matches
        </Typography.Link>
      ),
    },
  ];

  const showResults = phase === 'results' && submitted != null && results.length > 0;
  /** UX-009: every non-data phase is a state card. */
  const fillsHeight = !showResults;
  const pageFrom = (page - 1) * PAGE_SIZE + 1;
  const pageTo = Math.min(page * PAGE_SIZE, results.length);

  const renderBody = () => {
    if (phase === 'loading') {
      return (
        <Flex vertical align="center" justify="center" gap={token.marginSM} style={{ minHeight: token.controlHeight * 10 }}>
          <Spin size="large" />
          <Typography.Text type="secondary">Searching RSFC parts…</Typography.Text>
        </Flex>
      );
    }

    if (phase === 'error') {
      return (
        <Result
          status="error"
          title="We couldn’t load results"
          subTitle="Something went wrong on our side. Your search is kept — try again in a moment."
          extra={
            <Button type="primary" onClick={() => submitted && runSearch(submitted.q, submitted.category)}>
              Try again
            </Button>
          }
        />
      );
    }

    if (phase === 'results' && submitted) {
      if (results.length === 0) {
        if (matchesElsewhere > 0) {
          return (
            <EmptyStateBlock
              title={`No matches in ${submitted.category}`}
              description={`${matchesElsewhere} part${matchesElsewhere === 1 ? '' : 's'} match “${submitted.q}” in other categories.`}
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
      }

      // UX-007: table edge to edge; the count lives in the toolbar and paging in the footer (below).
      return (
        <Table<CompetitorPart>
          rowKey="sku"
          size="large"
          columns={columns}
          dataSource={results}
          onRow={(row) => ({ onClick: () => setOpenPart(row), style: { cursor: 'pointer' } })}
          onChange={(_pagination, _filters, _sorter, extra) => {
            if (extra.action === 'sort') setPage(1);
          }}
          pagination={{ current: page, pageSize: PAGE_SIZE, position: ['none'] }}
        />
      );
    }

    // A category only narrows a keyword search (BOM-360: no browse / list-all), so say what to do next.
    if (category !== ALL_CATEGORIES) {
      return (
        <EmptyStateBlock
          title={`Search in ${category}`}
          description={`Enter a figure number, SKU or keyword to search in ${category}.`}
        />
      );
    }

    return (
      <EmptyStateBlock
        title="Find an RSFC equivalent"
        description="Enter a competitor figure number, SKU, description or keyword. For example: 716, V024716PE0 or check valve."
      />
    );
  };

  return (
    <Flex vertical gap={token.marginLG} style={{ width: '100%', flex: 1 }}>
      <BomPageHeader
        title="Part Cross-Reference"
        description="Find the RSFC equivalent for a competitor part. Search by figure number, SKU, description or keyword."
      />

      {/* UX-007: card padding 0; toolbar (16/20) and footer (16/20) carry the spacing.
          UX-009: while the card shows a state (start, loading, empty, error) it fills down to the page padding. */}
      <Card
        variant="borderless"
        styles={{
          body: { padding: 0, ...(fillsHeight ? { flex: 1, display: 'flex', flexDirection: 'column' as const } : {}) },
        }}
        style={{
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadowTertiary,
          overflow: 'hidden',
          ...(fillsHeight ? { flex: 1, display: 'flex', flexDirection: 'column' as const } : {}),
        }}
      >
        <Flex vertical style={fillsHeight ? { flex: 1 } : undefined}>
          <Flex
            vertical
            gap={token.paddingSM}
            style={{
              paddingInline: token.paddingMD,
              paddingBlock: token.padding,
              borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
            }}
          >
          {/* UX-001: 20px between independent controls; UX-005: Input + Search button, 8px gap. */}
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
              style={{ width: token.controlHeight * 9 }}
            />
            <Flex gap={token.paddingXS} align="center" style={{ flex: `1 1 ${token.controlHeight * 10}px`, minWidth: 0 }}>
              <AppSearchInput
                aria-label="Search competitor parts"
                size="middle"
                allowClear
                placeholder="Search by figure number, SKU, description or keyword"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onPressEnter={() => runSearch(query, category)}
                style={{ flex: 1 }}
              />
              <Button type="primary" size="middle" onClick={() => runSearch(query, category)}>
                Search
              </Button>
            </Flex>
          </Flex>

          {showResults && submitted ? (
            <Flex justify="space-between" align="center" wrap="wrap" gap={token.marginXS}>
              <Typography.Text style={hydraTextStyleToReactCss(hydraBaseMedium)}>
                {results.length} competitor part{results.length === 1 ? '' : 's'} match “{submitted.q}”
                {submitted.category === ALL_CATEGORIES ? '' : ` in ${submitted.category}`}
              </Typography.Text>
              <Typography.Text type="secondary">Select a part to see its RSFC equivalents</Typography.Text>
            </Flex>
          ) : null}
          </Flex>

          {showResults ? (
            <>
              {renderBody()}
              <Flex
                justify="space-between"
                align="center"
                wrap="wrap"
                gap={token.marginSM}
                style={{
                  paddingInline: token.paddingMD,
                  paddingBlock: token.padding,
                  borderTop: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                }}
              >
                <Typography.Text type="secondary">
                  Showing {pageFrom}–{pageTo} of {results.length}
                </Typography.Text>
                <Pagination
                  current={page}
                  pageSize={PAGE_SIZE}
                  total={results.length}
                  onChange={setPage}
                  showSizeChanger={false}
                  hideOnSinglePage
                />
              </Flex>
            </>
          ) : (
            <Flex vertical justify="center" style={{ flex: 1, padding: token.paddingLG }}>
              {renderBody()}
            </Flex>
          )}
        </Flex>
      </Card>

      <PartCrossReferenceMatchModal part={openPart} onClose={() => setOpenPart(null)} />
    </Flex>
  );
}
