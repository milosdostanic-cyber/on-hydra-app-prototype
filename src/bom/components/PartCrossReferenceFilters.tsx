import { RightOutlined } from '@ant-design/icons';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import { PIM_FILTER_LABELS, sizeLabel } from '../data/pimDisplayMapping';
import {
  countActiveFilters,
  crossReferenceMatchTypeLabel,
  type CrossReferenceFacets,
  type CrossReferenceFilters,
} from '../data/partCrossReferenceData';
import { hydraBaseMedium, hydraBaseNormal, hydraTextStyleToReactCss, hydraTitleHeading5 } from '../../theme/hydraTypography';
import { AppSearchInput, Card, Checkbox, Flex, Popover, Typography, theme } from '../../ui/antd';

type Props = {
  value: CrossReferenceFilters;
  facets: CrossReferenceFacets;
  onChange: (next: CrossReferenceFilters) => void;
  onClear: () => void;
  /** Results if this value were the only one picked in its group. Omit to hide counts (no search yet). */
  countFor?: (key: keyof CrossReferenceFilters, value: string) => number;
  /**
   * Height the page fits into. The panel measures itself again whenever it changes: the row it sits in only gets its
   * final height after the first paint, and a ResizeObserver alone can miss that change (the panel then stays open
   * and is cut off). Until the page height is known the panel stays hidden, so it never flashes open before compact.
   */
  fitHeight?: number;
};

/** 208 px (controlHeight x 6.5) + 30 px, widened on 17 Nov 2026 so long PIM values fit. */
const FILTER_PANEL_WIDTH = 238;
/** Long lists show the first values, a search (sizes) and "Show all". */
const VISIBLE_VALUES = 6;

type GroupDef = {
  key: keyof CrossReferenceFilters;
  label: string;
  options: readonly string[];
  format?: (value: string) => string;
  columns?: 1 | 2;
  searchLabel?: string;
};

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
  const baseText = hydraTextStyleToReactCss(hydraBaseNormal);

  return (
    <Flex vertical gap={token.marginXS} role="group" aria-label={group.label}>
      {hideTitle ? null : (
        <Typography.Text style={hydraTextStyleToReactCss(hydraBaseMedium)}>
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
                      ...baseText,
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

/** Filters use the fields available in the current search. Compact mode keeps the sidebar reachable. */
export function PartCrossReferenceFilters({ value, facets, onChange, onClear, countFor, fitHeight }: Props) {
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

  // The page height changed: measure again once the row has its final height.
  useLayoutEffect(() => {
    measure();
  }, [fitHeight, measure]);

  const toggleValue = (key: keyof CrossReferenceFilters) => (option: string) =>
    onChange({ ...value, [key]: toggle(value[key] as string[], option) });

  const sourceGroups: GroupDef[] = [
    { key: 'brands', label: 'Brand', options: facets.brands },
    { key: 'matchTypes', label: 'Match type', options: facets.matchTypes, format: crossReferenceMatchTypeLabel },
  ];
  const originGroup: GroupDef = { key: 'origins', label: 'Origin', options: facets.origins };
  const rsfcGroups: GroupDef[] = [
    { key: 'productTypes', label: PIM_FILTER_LABELS.productTypes, options: facets.productTypes },
    { key: 'sizes', label: PIM_FILTER_LABELS.sizes, options: facets.sizes, format: sizeLabel, columns: 2, searchLabel: 'Search sizes' },
  ];
  const visibleRsfcGroups = rsfcGroups.filter((group) => group.options.length > 0);

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
        visibility: fitHeight === undefined ? 'hidden' : 'visible',
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

        {sourceGroups.filter((group) => group.options.length > 0).map((group) => renderGroup(group))}

        {(facets.origins.length > 0 || visibleRsfcGroups.length > 0) && (
          <Flex
            vertical
            gap={compact ? token.marginXXS : token.padding}
            style={{
              paddingTop: token.padding,
              borderTop: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
            }}
          >
            <Typography.Text style={hydraTextStyleToReactCss(hydraBaseMedium)}>RSFC part</Typography.Text>
            {facets.origins.length > 0 && renderGroup(originGroup)}
            {compact ? (
              visibleRsfcGroups.map((group) => {
                const picked = (value[group.key] as string[]).length;
                return (
                  <Popover
                    key={group.key}
                    trigger="click"
                    placement="rightTop"
                    // Always level with its own row. The default overflow adjustment moved the flyout to another row
                    // when its content changed (for example after a value was checked).
                    autoAdjustOverflow={false}
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
              visibleRsfcGroups.map((group) => renderGroup(group))
            )}
          </Flex>
        )}
      </Flex>
    </Card>
  );
}
