import { RightOutlined } from '@ant-design/icons';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import {
  PIM_FILTER_COLUMNS,
  PIM_FILTER_LABELS,
  endConnectionLabel,
  sizeLabel,
  type PimFilterAttribute,
} from '../data/pimDisplayMapping';
import {
  CROSS_REFERENCE_FACETS,
  countActiveFilters,
  type CrossReferenceFilters,
  type RsfcMatchType,
  type RsfcOrigin,
} from '../data/partCrossReferenceData';
import { hydraBaseMedium, hydraSmallNormal, hydraTextStyleToReactCss, hydraTitleHeading5 } from '../../theme/hydraTypography';
import { AppSearchInput, Card, Checkbox, Flex, Popover, Typography, theme } from '../../ui/antd';

type Props = {
  value: CrossReferenceFilters;
  onChange: (next: CrossReferenceFilters) => void;
  onClear: () => void;
  /** Results if this value were the only one picked in its group. Omit to hide counts (no search yet). */
  countFor?: (key: keyof CrossReferenceFilters, value: string) => number;
};

/** 208 px (controlHeight x 6.5) + 30 px, widened on 17 Nov 2026 so long PIM values fit. */
const FILTER_PANEL_WIDTH = 238;
/** Long lists show the first values, a search (sizes) and "Show all". */
const VISIBLE_VALUES = 6;

type GroupDef = {
  key: keyof CrossReferenceFilters;
  label: string;
  options: readonly string[];
  /** PIM column(s) shown as a tooltip on the group title. */
  pim?: string;
  format?: (value: string) => string;
  columns?: 1 | 2;
  searchLabel?: string;
};

const MATCH_TYPES: RsfcMatchType[] = ['Exact match', 'Substitute'];
const ORIGINS: RsfcOrigin[] = ['Domestic', 'Import'];

const BASE_GROUPS: GroupDef[] = [
  { key: 'matchTypes', label: 'Match type', options: MATCH_TYPES },
  { key: 'origins', label: 'RSFC origin', options: ORIGINS },
];

/** RSFC attribute groups in panel order (PIM display mapping, CON-347). Groups with no values stay hidden. */
const PIM_ATTRIBUTES: PimFilterAttribute[] = ['productTypes', 'sizes', 'endConnections', 'materials', 'certifications', 'brands'];

const PIM_GROUPS: GroupDef[] = PIM_ATTRIBUTES.filter((key) => CROSS_REFERENCE_FACETS[key].length > 0).map((key) => ({
  key,
  label: PIM_FILTER_LABELS[key],
  options: CROSS_REFERENCE_FACETS[key],
  pim: PIM_FILTER_COLUMNS[key],
  format: key === 'sizes' ? sizeLabel : key === 'endConnections' ? endConnectionLabel : undefined,
  columns: key === 'sizes' ? 2 : 1,
  searchLabel: key === 'sizes' ? 'Search sizes' : undefined,
}));

function toggle(values: string[], item: string): string[] {
  return values.includes(item) ? values.filter((v) => v !== item) : [...values, item];
}

function FilterGroup({
  group,
  selected,
  onToggle,
  countFor,
  hideTitle = false,
}: {
  group: GroupDef;
  selected: string[];
  onToggle: (value: string) => void;
  countFor?: Props['countFor'];
  /** Compact mode: the Collapse header already carries the title. */
  hideTitle?: boolean;
}) {
  const { token } = theme.useToken();
  const [term, setTerm] = useState('');
  const [showAll, setShowAll] = useState(false);
  const format = group.format ?? ((v: string) => v);
  const long = group.options.length > VISIBLE_VALUES;
  const filtered = group.options.filter((option) => format(option).toLowerCase().includes(term.trim().toLowerCase()));
  const shown = long && !showAll && !term ? filtered.slice(0, VISIBLE_VALUES) : filtered;
  const smallText = hydraTextStyleToReactCss(hydraSmallNormal);

  return (
    <Flex vertical gap={token.marginXS} role="group" aria-label={group.label}>
      {hideTitle ? null : (
        <Typography.Text style={hydraTextStyleToReactCss(hydraBaseMedium)} title={group.pim ? `PIM: ${group.pim}` : undefined}>
          {group.label}
          {selected.length > 0 ? ` (${selected.length})` : ''}
        </Typography.Text>
      )}

      {group.searchLabel && long ? (
        <AppSearchInput
          aria-label={group.searchLabel}
          size="small"
          allowClear
          placeholder={group.searchLabel}
          value={term}
          onChange={(event) => setTerm(event.target.value)}
        />
      ) : null}

      {shown.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${group.columns ?? 1}, minmax(0, 1fr))`,
            rowGap: token.marginXS,
            columnGap: token.marginSM,
          }}
        >
          {shown.map((option) => {
            const checked = selected.includes(option);
            const count = countFor?.(group.key, option);
            const disabled = count === 0 && !checked;
            return (
              <Checkbox
                key={option}
                checked={checked}
                disabled={disabled}
                onChange={() => onToggle(option)}
                style={{ minWidth: 0 }}
                styles={{ label: { flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: token.marginXS } }}
              >
                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {format(option)}
                </span>
                {count !== undefined ? (
                  <span
                    style={{
                      ...smallText,
                      color: disabled ? token.colorTextDisabled : token.colorTextTertiary,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {count}
                  </span>
                ) : null}
              </Checkbox>
            );
          })}
        </div>
      ) : (
        <Typography.Text type="secondary">No values match.</Typography.Text>
      )}

      {long && !term ? (
        <Typography.Link onClick={() => setShowAll((v) => !v)} style={{ alignSelf: 'flex-start' }}>
          {showAll ? 'Show fewer' : `Show all ${group.options.length}`}
        </Typography.Link>
      ) : null}
    </Flex>
  );
}

/**
 * Filter version 2 (artifact "Cross-Reference Filter Options", chosen 17 Nov 2026): every group open,
 * each value shows how many parts it leaves, values that give 0 are disabled.
 * Placement from Figma A1 (7651:11285). Attributes follow Sofija's PIM display mapping (CON-347).
 *
 * Spacing: card padding 20 (paddingMD); 16 between groups (padding); 8 title → values and value → value (marginXS);
 * 12 between size columns (marginSM); "RSFC attributes" block starts with a split line and 16 above it.
 *
 * Edge case, no inner scroll: the page itself does not scroll (only the cards do), so the panel must fit the row it
 * sits in. When the open version is taller than that row it switches to compact: each RSFC attribute becomes one row (with its selected count) that opens its
 * values in a flyout to the right, so every group stays reachable without scrolling the panel. It switches back when
 * there is room again.
 */
export function PartCrossReferenceFilters({ value, onChange, onClear, countFor }: Props) {
  const { token } = theme.useToken();
  const active = countActiveFilters(value);
  const cardRef = useRef<HTMLDivElement>(null);
  const openHeight = useRef(0);
  const [compact, setCompact] = useState(false);
  const [openKey, setOpenKey] = useState<string | undefined>();

  const measure = useCallback(() => {
    const card = cardRef.current;
    const parent = card?.parentElement;
    if (!card || !parent) return;
    if (!compact) openHeight.current = card.offsetHeight;
    // The panel sits in a row as tall as the visible page, so it must fit that row.
    setCompact(openHeight.current > parent.clientHeight);
  }, [compact]);

  useLayoutEffect(() => {
    measure();
    const card = cardRef.current;
    const parent = card?.parentElement;
    const observer = new ResizeObserver(measure);
    if (card) observer.observe(card);
    if (parent) observer.observe(parent);
    return () => observer.disconnect();
  }, [measure]);

  const toggleValue = (key: keyof CrossReferenceFilters) => (option: string) =>
    onChange({ ...value, [key]: toggle(value[key] as string[], option) });

  const renderGroup = (group: GroupDef, hideTitle = false) => (
    <FilterGroup
      key={group.key}
      group={group}
      selected={value[group.key] as string[]}
      onToggle={toggleValue(group.key)}
      countFor={countFor}
      hideTitle={hideTitle}
    />
  );

  return (
    <Card
      ref={cardRef}
      variant="borderless"
      style={{
        width: FILTER_PANEL_WIDTH,
        flex: '0 0 auto',
        borderRadius: token.borderRadiusLG,
        boxShadow: token.boxShadowTertiary,
        alignSelf: 'flex-start',
      }}
      styles={{ body: { padding: token.paddingMD } }}
    >
      <Flex vertical gap={token.padding} aria-label="Filters" role="region">
        <Flex justify="space-between" align="center" style={{ minHeight: token.controlHeightSM }}>
          <Typography.Text style={hydraTextStyleToReactCss(hydraTitleHeading5)}>
            Filters{active > 0 ? ` (${active})` : ''}
          </Typography.Text>
          {active > 0 ? <Typography.Link onClick={onClear}>Clear all</Typography.Link> : null}
        </Flex>

        {BASE_GROUPS.map((group) => renderGroup(group))}

        <Flex
          vertical
          gap={compact ? token.marginXXS : token.padding}
          style={{
            paddingTop: token.padding,
            borderTop: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
          }}
        >
          <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraSmallNormal)}>
            RSFC attributes
          </Typography.Text>
          {compact ? (
            PIM_GROUPS.map((group) => {
              const picked = (value[group.key] as string[]).length;
              return (
                <Popover
                  key={group.key}
                  trigger="click"
                  placement="rightTop"
                  arrow={false}
                  open={openKey === group.key}
                  onOpenChange={(next) => setOpenKey(next ? group.key : undefined)}
                  styles={{ container: { width: token.controlHeight * 8, padding: token.paddingSM } }}
                  content={renderGroup(group, true)}
                >
                  <button
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded={openKey === group.key}
                    title={group.pim ? `PIM: ${group.pim}` : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: token.marginXS,
                      width: '100%',
                      height: token.controlHeight,
                      padding: 0,
                      border: 0,
                      background: 'transparent',
                      cursor: 'pointer',
                      color: openKey === group.key ? token.colorPrimary : token.colorText,
                      ...hydraTextStyleToReactCss(hydraBaseMedium),
                    }}
                  >
                    <span>
                      {group.label}
                      {picked > 0 ? ` (${picked})` : ''}
                    </span>
                    <RightOutlined style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }} />
                  </button>
                </Popover>
              );
            })
          ) : (
            PIM_GROUPS.map((group) => renderGroup(group))
          )}
        </Flex>
      </Flex>
    </Card>
  );
}
