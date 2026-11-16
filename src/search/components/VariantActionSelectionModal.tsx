import { FilePdfOutlined, PictureOutlined, SearchOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import type { PartSpecField, PartVariationRow } from '../partDetailDemoData';
import { variationSpecValue } from '../partDetailDemoData';
import { shellLayout } from '../../theme/hydraAlias';
import {
  hydraBaseNormal,
  hydraBaseStrong,
  hydraLargeNormal,
  hydraLargeMedium,
  hydraLargeStrong,
  hydraSmallNormal,
  hydraTextStyleToReactCss,
} from '../../theme/hydraTypography';
import { catalogBrowseTableHeaderStyles } from '../../shell/content/catalogBrowseTableStyles';
import {
  Alert,
  Button,
  Checkbox,
  Flex,
  Input,
  Modal,
  Table,
  Tooltip,
  Typography,
  theme,
} from '../../ui/antd';
import type { TableColumnsType } from '../../ui/antd';

import { ContentFileTypeTags } from './ContentFileTypeTags';

import {
  isEmptyDistinguishingValue,
  selectDistinguishingAttributes,
} from './variantDistinguishingAttributes';
import {
  fileTypeForSelectionAction,
  isVariationEligibleForAction,
  type VariantFigureContext,
  type VariantSelectionAction,
  variationSearchHaystack,
  variantSelectionActionLabel,
  variantSelectionModalTitle,
} from './variantSelectionShared';

const VARIANT_TABLE_CLASS = 'variant-selection-table';
const VARIANT_EXPANDED_ROW_CLASS = 'variant-selection-expanded-row';
type Props = {
  open: boolean;
  action: VariantSelectionAction | null;
  variations: PartVariationRow[];
  figure?: VariantFigureContext;
  /** Visit-scoped session selection restored when this action modal opens. */
  selectedKeys: string[];
  /** Live-write checks into the visit session so other action CTAs see the same set. */
  onSessionKeysChange: (keys: string[]) => void;
  /** Confirm runs the bulk action with the current session selection. */
  onConfirm: (selectedKeys: string[]) => void;
  onCancel: () => void;
};

function VariationThumbnail({ variation, size }: { variation: PartVariationRow; size: number }) {
  const { token } = theme.useToken();
  const placeholderIconSize =
    size >= token.controlHeight * 2
      ? token.fontSizeHeading3
      : size >= token.sizeUnit * 14
        ? token.fontSizeXL
        : token.fontSizeSM;

  if (variation.thumbnailUrl) {
    return (
      <img
        src={variation.thumbnailUrl}
        alt=""
        style={{
          width: size,
          height: size,
          objectFit: 'cover',
          borderRadius: token.borderRadiusSM,
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <Flex
      align="center"
      justify="center"
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: token.borderRadiusSM,
        border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
        background: token.colorFillAlter,
        color: token.colorTextQuaternary,
      }}
    >
      <PictureOutlined style={{ fontSize: placeholderIconSize }} />
    </Flex>
  );
}

/**
 * Action-owned multi-select. Shared figure facts stay in the header.
 * The table shows only specs that differ, with the rest in the expanded row.
 * Checking variants writes the visit session immediately.
 */
export function VariantActionSelectionModal({
  open,
  action,
  variations,
  figure,
  selectedKeys,
  onSessionKeysChange,
  onConfirm,
  onCancel,
}: Props) {
  const { token } = theme.useToken();
  const [pendingKeys, setPendingKeys] = useState<string[]>([]);
  /** Snapshot of session keys at open — orange “already selected” highlight. */
  const [carriedKeys, setCarriedKeys] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const searchInputRef = useRef<InputRef>(null);
  const wasOpenRef = useRef(false);
  const [modalPanel, setModalPanel] = useState<HTMLDivElement | null>(null);
  const layoutRowRef = useRef<HTMLDivElement>(null);
  const mainColumnRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<{ tableBody?: number; row?: number }>({});
  const listThumbnailSize = token.controlHeight;
  /** Figma figure image is 48px = sizeUnit × 12. */
  const figureImageSize = token.sizeUnit * 12;

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setPendingKeys(selectedKeys);
      setCarriedKeys(selectedKeys);
      setSearchText('');
    }
    wasOpenRef.current = open;
  }, [open, selectedKeys]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => searchInputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  /**
   * Keeps the whole modal inside the viewport so the footer CTA never scrolls away.
   * The table body takes whatever height the summary, toolbar and pagination leave.
   */
  useLayoutEffect(() => {
    const row = layoutRowRef.current;
    const main = mainColumnRef.current;
    if (!modalPanel || !row || !main) return;

    const measure = () => {
      const tableBody = main.querySelector<HTMLElement>('.ant-table-body, .ant-table-content');
      if (!tableBody) return;
      const viewportCap = window.innerHeight - token.marginXXL * 2;
      const rowStyle = window.getComputedStyle(row);
      const rowPadding = parseFloat(rowStyle.paddingTop) + parseFloat(rowStyle.paddingBottom);
      const rowHeight = row.getBoundingClientRect().height;
      const rowContentCap = viewportCap - (modalPanel.getBoundingClientRect().height - rowHeight) - rowPadding;
      const tableBodyHeight = tableBody.getBoundingClientRect().height;
      const chromeAroundBody = rowHeight - rowPadding - tableBodyHeight;
      const next = {
        tableBody: Math.max(Math.floor(rowContentCap - chromeAroundBody), token.controlHeight * 3),
        row: Math.floor(rowContentCap),
      };
      setFit((prev) => (prev.tableBody === next.tableBody && prev.row === next.row ? prev : next));
    };

    measure();
    const observer = new ResizeObserver(measure);
    [modalPanel, row, main].forEach((element) => observer.observe(element));
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [modalPanel, token.marginXXL, token.controlHeight]);

  const sortedVariations = useMemo(
    () => [...variations].sort((a, b) => a.sku.localeCompare(b.sku)),
    [variations],
  );

  const filteredVariations = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return sortedVariations;
    return sortedVariations.filter((variation) => variationSearchHaystack(variation).includes(q));
  }, [sortedVariations, searchText]);

  const distinguishing = useMemo(() => selectDistinguishingAttributes(variations), [variations]);

  const columnSpecKeys = useMemo(
    () => new Set(distinguishing.map((attribute) => attribute.key)),
    [distinguishing],
  );

  const eligibleKeys = useMemo(() => {
    if (!action) return [];
    return sortedVariations
      .filter((variation) => isVariationEligibleForAction(variation, action))
      .map((variation) => variation.key);
  }, [sortedVariations, action]);

  const pendingSet = useMemo(() => new Set(pendingKeys), [pendingKeys]);
  const carriedSet = useMemo(() => new Set(carriedKeys), [carriedKeys]);

  const unavailableSelectedCount = useMemo(() => {
    if (!action) return 0;
    const fileType = fileTypeForSelectionAction(action);
    if (!fileType) return 0;
    return pendingKeys.filter((key) => {
      const variation = variations.find((entry) => entry.key === key);
      return variation ? !variation.drawingFileTypes.includes(fileType) : false;
    }).length;
  }, [action, pendingKeys, variations]);

  const selectedCount = pendingKeys.length;
  const canSubmit = selectedCount > 0 && unavailableSelectedCount === 0 && Boolean(action);
  const primaryLabel = action ? variantSelectionActionLabel(action) : 'Continue';
  const title = action ? variantSelectionModalTitle(action) : 'Select variants';
  const fileType = action ? fileTypeForSelectionAction(action) : null;
  const hasSubmittalPdf = variations.some((variation) => variation.drawingFileTypes.includes('PDF'));
  const categoryLabel = figure?.breadcrumb?.[figure.breadcrumb.length - 1];
  const categoryPath = figure?.breadcrumb?.join(' / ');
  const finishLabel = figure?.figureSpecs.find((spec) => spec.key === 'finish')?.value;
  const skuCountLabel = `${variations.length} ${variations.length === 1 ? 'SKU' : 'SKUs'}`;

  function commitKeys(next: string[]) {
    setPendingKeys(next);
    onSessionKeysChange(next);
  }

  function selectAllEligible() {
    const next = new Set(pendingKeys);
    eligibleKeys.forEach((key) => next.add(key));
    commitKeys([...next]);
  }

  function clearAll() {
    commitKeys([]);
  }

  function toggleKey(key: string, checked: boolean) {
    if (checked) {
      commitKeys(pendingKeys.includes(key) ? pendingKeys : [...pendingKeys, key]);
      return;
    }
    commitKeys(pendingKeys.filter((entry) => entry !== key));
  }

  // Figma "Expanded row" panel: colorFillQuaternary surface, colorPrimary accent line on the leading edge.
  // antd sets the expand button to `vertical-align: sub`, which sits it below the row checkbox; block centering aligns them.
  const expandedRowStyles = [
    `.${VARIANT_EXPANDED_ROW_CLASS} > td{padding:0!important;background:${token.colorFillQuaternary}!important;border-inline-start:${token.lineWidth}px ${token.lineType} ${token.colorPrimary}}`,
    `.${VARIANT_TABLE_CLASS} .ant-table-row-expand-icon-cell .ant-table-row-expand-icon{display:flex;margin-inline:auto}`,
  ].join('');

  const selectedEligibleCount = eligibleKeys.filter((key) => pendingSet.has(key)).length;
  const allEligibleSelected = eligibleKeys.length > 0 && selectedEligibleCount === eligibleKeys.length;

  const columns: TableColumnsType<PartVariationRow> = [
    {
      title: (
        <Checkbox
          checked={allEligibleSelected}
          indeterminate={selectedCount > 0 && !allEligibleSelected}
          disabled={eligibleKeys.length === 0}
          onChange={(event) => (event.target.checked ? selectAllEligible() : clearAll())}
          aria-label="Select all variants"
        />
      ),
      key: 'select',
      width: token.controlHeight,
      render: (_, variation) => {
        const eligible = action ? isVariationEligibleForAction(variation, action) : true;
        return (
          <Checkbox
            checked={pendingSet.has(variation.key)}
            onChange={(event) => toggleKey(variation.key, event.target.checked)}
            aria-label={`Select ${variation.sku}${!eligible && fileType ? ` — ${fileType} unavailable` : ''}`}
          />
        );
      },
    },
    {
      title: 'MPN / SKU',
      key: 'sku',
      // Live picker: 280px for expand + thumbnail + SKU; here the expand button has its own column.
      width: token.sizeUnit * 70 - token.controlHeight,
      sorter: (a, b) => a.sku.localeCompare(b.sku),
      render: (_, variation) => (
        <Flex align="center" gap={token.marginSM}>
          <VariationThumbnail variation={variation} size={listThumbnailSize} />
          <Flex vertical gap={0} style={{ flex: 1, minWidth: 0 }}>
            <Typography.Text strong style={hydraTextStyleToReactCss(hydraBaseStrong)}>
              {variation.sku}
            </Typography.Text>
            <Typography.Text
              type="secondary"
              ellipsis={{ tooltip: variantSubtitle(variation) }}
              style={hydraTextStyleToReactCss(hydraSmallNormal)}
            >
              {variantSubtitle(variation)}
            </Typography.Text>
          </Flex>
        </Flex>
      ),
    },
    ...distinguishing.map((attribute) => ({
      title: attribute.label,
      key: attribute.key,
      sorter: (a: PartVariationRow, b: PartVariationRow) =>
        (variationSpecValue(a, attribute.key) ?? '').localeCompare(variationSpecValue(b, attribute.key) ?? ''),
      render: (_: unknown, variation: PartVariationRow) => (
        <PlainAttributeValue value={variationSpecValue(variation, attribute.key)} />
      ),
    })),
    {
      title: 'Drawings',
      key: 'drawings',
      render: (_, variation) => {
        const eligible = action ? isVariationEligibleForAction(variation, action) : true;
        return (
          <Flex vertical gap={token.marginXXS}>
            <ContentFileTypeTags fileTypes={variation.drawingFileTypes} />
            {!eligible && fileType ? (
              <Typography.Text type="danger" style={hydraTextStyleToReactCss(hydraSmallNormal)}>
                {fileType} unavailable
              </Typography.Text>
            ) : null}
          </Flex>
        );
      },
    },
  ];

  return (
    <Modal
      open={open}
      title={title}
      onCancel={onCancel}
      width={token.screenXL}
      centered
      destroyOnClose
      modalRender={(panel) => <div ref={setModalPanel}>{panel}</div>}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="confirm"
          type="primary"
          disabled={!canSubmit}
          onClick={() => onConfirm(pendingKeys)}
          aria-label={primaryLabel}
        >
          {primaryLabel}
        </Button>,
      ]}
    >
      <Flex ref={layoutRowRef} vertical gap={token.marginSM} style={{ paddingBlock: token.paddingXS }}>
        {figure ? (
          <PartSummaryStrip
            figure={figure}
            imageSize={figureImageSize}
            categoryLabel={categoryLabel}
            categoryPath={categoryPath}
            hasSubmittalPdf={hasSubmittalPdf}
            skuCountLabel={skuCountLabel}
            finishLabel={finishLabel}
          />
        ) : null}

        <Flex ref={mainColumnRef} vertical gap={token.marginSM} style={{ flex: 1, minWidth: 0 }}>
          <Flex align="center" justify="space-between" gap={token.marginSM} wrap="wrap">
            <Input
              ref={searchInputRef}
              placeholder="Filter by size, finish..."
              prefix={<SearchOutlined style={{ color: token.colorTextQuaternary }} />}
              allowClear
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              aria-label="Search variations"
              style={{ width: token.sizeUnit * 75 }}
            />
            <Flex align="center" gap={token.marginSM} wrap="wrap">
              <Typography.Text strong style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                {selectedCount} selected
              </Typography.Text>
              <Flex gap={token.marginXS}>
                <Button onClick={selectAllEligible} disabled={eligibleKeys.length === 0}>
                  Select all
                </Button>
                <Button onClick={clearAll} disabled={selectedCount === 0}>
                  Clear all
                </Button>
              </Flex>
            </Flex>
          </Flex>

          {unavailableSelectedCount > 0 && fileType ? (
            <Alert
              type="error"
              showIcon
              title={`${unavailableSelectedCount} selected ${
                unavailableSelectedCount === 1 ? 'variation does' : 'variations do'
              } not include ${fileType}. Remove ${unavailableSelectedCount === 1 ? 'it' : 'them'} to continue.`}
            />
          ) : null}

          <style>{expandedRowStyles}</style>
          <Table<PartVariationRow>
            className={VARIANT_TABLE_CLASS}
            rowKey="key"
            size="small"
            tableLayout="fixed"
            scroll={fit.tableBody ? { y: fit.tableBody } : undefined}
            columns={columns}
            dataSource={filteredVariations}
            styles={catalogBrowseTableHeaderStyles(token)}
            pagination={{
              pageSize: shellLayout.tablePageSizeDefault,
              showSizeChanger: false,
              showTotal: (total, range) =>
                total === 0 ? 'No variants' : `Showing ${range[0]}–${range[1]} of ${total} variants`,
            }}
            locale={{
              emptyText: 'No variations match your search. Try a SKU prefix, thread size, or finish.',
            }}
            onRow={(variation) => {
              const isSelected = pendingSet.has(variation.key);
              const isCarried = isSelected && carriedSet.has(variation.key);
              return {
                'data-carried': isCarried ? 'true' : undefined,
                style: isCarried ? { background: token.colorActionBg } : undefined,
              };
            }}
            expandable={{
              columnWidth: token.controlHeight,
              expandedRowClassName: () => VARIANT_EXPANDED_ROW_CLASS,
              expandedRowRender: (variation) => (
                <ExpandedVariantDetails variation={variation} columnSpecKeys={columnSpecKeys} />
              ),
              rowExpandable: () => true,
            }}
          />
        </Flex>
      </Flex>
    </Modal>
  );
}

/** Horizontal figure strip above the variant table. Matches the Figma modal summary. */
function PartSummaryStrip({
  figure,
  imageSize,
  categoryLabel,
  categoryPath,
  hasSubmittalPdf,
  skuCountLabel,
  finishLabel,
}: {
  figure: VariantFigureContext;
  imageSize: number;
  categoryLabel?: string;
  categoryPath?: string;
  hasSubmittalPdf: boolean;
  skuCountLabel: string;
  finishLabel?: string;
}) {
  const { token } = theme.useToken();
  const metaStyle = hydraTextStyleToReactCss(hydraBaseNormal);

  return (
    <Flex
      align="flex-start"
      gap={token.marginSM}
      style={{
        padding: token.paddingSM,
        borderRadius: token.borderRadius,
        background: token.colorFillQuaternary,
        border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
      }}
    >
      {figure.imageUrl ? (
        <img
          src={figure.imageUrl}
          alt=""
          style={{
            width: imageSize,
            height: imageSize,
            objectFit: 'contain',
            borderRadius: token.borderRadius,
            flexShrink: 0,
            background: token.colorBgContainer,
          }}
        />
      ) : null}
      <Flex vertical gap={token.marginXXS} style={{ flex: 1, minWidth: 0 }}>
        <Flex align="baseline" gap={token.marginXS} wrap="wrap">
          <Typography.Text style={{ color: token.colorText, ...hydraTextStyleToReactCss(hydraLargeStrong) }}>
            {figure.figureNumber}
          </Typography.Text>
          <Typography.Text style={{ color: token.colorText, ...hydraTextStyleToReactCss(hydraLargeNormal) }}>
            {figure.productName}
          </Typography.Text>
        </Flex>
        <Flex align="center" gap={token.padding} wrap="wrap">
          {figure.brand ? (
            <Typography.Text type="secondary" style={metaStyle}>
              Brand: {figure.brand}
            </Typography.Text>
          ) : null}
          {categoryLabel ? (
            <Tooltip title={categoryPath} trigger={['hover', 'focus']}>
              <Typography.Text type="secondary" style={metaStyle} tabIndex={0}>
                Category: {categoryLabel}
              </Typography.Text>
            </Tooltip>
          ) : null}
          {hasSubmittalPdf ? (
            <Flex align="center" gap={token.marginXXS}>
              <FilePdfOutlined style={{ color: token.colorLink, fontSize: token.fontSize }} />
              <Typography.Text style={{ color: token.colorLink, ...metaStyle }}>Submittal sheet: PDF</Typography.Text>
            </Flex>
          ) : null}
          <Typography.Text type="secondary" style={metaStyle}>
            Variants: {skuCountLabel}
          </Typography.Text>
          {finishLabel ? (
            <Typography.Text type="secondary" style={metaStyle}>
              Finish: {finishLabel}
            </Typography.Text>
          ) : null}
        </Flex>
      </Flex>
    </Flex>
  );
}

function PlainAttributeValue({ value }: { value: string | undefined }) {
  if (isEmptyDistinguishingValue(value)) {
    return (
      <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
        —
      </Typography.Text>
    );
  }
  return (
    <Typography.Text style={hydraTextStyleToReactCss(hydraBaseNormal)}>{value}</Typography.Text>
  );
}

function SpecPair({ spec }: { spec: PartSpecField }) {
  const { token } = theme.useToken();
  return (
    <Typography.Text style={{ color: token.colorText, ...hydraTextStyleToReactCss(hydraBaseNormal) }}>
      <Typography.Text style={{ color: token.colorTextDescription, ...hydraTextStyleToReactCss(hydraBaseNormal) }}>
        {spec.label}:
      </Typography.Text>{' '}
      {spec.value}
    </Typography.Text>
  );
}

/** Same text under the SKU in the row and in the expanded panel (on-hydra-app `getVariantPickerRowSubtitle`). */
function variantSubtitle(variation: PartVariationRow): string {
  return variation.description.trim() || variation.name;
}

/**
 * Mirrors the on-hydra-app VariantPicker expanded row: `SKU {sku}` title, the row subtitle in full,
 * then every attribute that is not a table column (`remainingAttributes`), then Documents.
 */
function ExpandedVariantDetails({
  variation,
  columnSpecKeys,
}: {
  variation: PartVariationRow;
  columnSpecKeys: Set<string>;
}) {
  const { token } = theme.useToken();
  const remainingSpecs = variation.specifications.filter(
    (spec) =>
      !columnSpecKeys.has(spec.key) &&
      spec.key !== 'sku' &&
      spec.key !== 'configuration' &&
      !isEmptyDistinguishingValue(spec.value),
  );
  const subtitle = variantSubtitle(variation);
  const labelStyle = { color: token.colorTextDescription, ...hydraTextStyleToReactCss(hydraBaseNormal) };

  return (
    <Flex
      vertical
      gap={token.marginXXS}
      style={{
        paddingBlock: token.paddingSM,
        paddingInlineEnd: token.paddingSM,
        // Figma: details start under the SKU column (expand + select columns, minus the accent line).
        paddingInlineStart: token.controlHeight * 2 - token.lineWidth + token.paddingXS,
      }}
    >
      <Typography.Text style={{ color: token.colorText, ...hydraTextStyleToReactCss(hydraLargeMedium) }}>
        SKU {variation.sku}
      </Typography.Text>
      {subtitle ? <Typography.Text style={labelStyle}>{subtitle}</Typography.Text> : null}
      {remainingSpecs.length > 0 || variation.drawingFileTypes.length > 0 ? (
        <Flex wrap="wrap" align="center" gap={token.margin}>
          {remainingSpecs.map((spec) => (
            <SpecPair key={spec.key} spec={spec} />
          ))}
          {variation.drawingFileTypes.length > 0 ? (
            <Flex align="center" gap={token.marginXS}>
              <Typography.Text style={labelStyle}>Documents:</Typography.Text>
              <ContentFileTypeTags fileTypes={variation.drawingFileTypes} />
            </Flex>
          ) : null}
        </Flex>
      ) : null}
    </Flex>
  );
}
