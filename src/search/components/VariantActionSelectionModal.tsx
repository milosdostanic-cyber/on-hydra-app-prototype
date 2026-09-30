import { FilePdfOutlined, PictureOutlined, SearchOutlined, SettingOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { PartSpecField, PartVariationRow } from '../partDetailDemoData';
import { variationSpecValue } from '../partDetailDemoData';
import { buttonPrimaryPalette } from '../../theme/buttonPrimaryPalette';
import {
  hydraBaseNormal,
  hydraBaseStrong,
  hydraLargeStrong,
  hydraSmallNormal,
  hydraTextStyleToReactCss,
} from '../../theme/hydraTypography';
import { catalogBrowseTableHeaderStyles } from '../../shell/content/catalogBrowseTableStyles';
import {
  Badge,
  Breadcrumb,
  Button,
  Checkbox,
  Divider,
  Flex,
  Input,
  Modal,
  Popover,
  Table,
  Typography,
  theme,
} from '../../ui/antd';
import type { TableColumnsType } from '../../ui/antd';

import {
  fileTypeForSelectionAction,
  isPlaceholderSpecValue,
  isRedundantPimText,
  isVariationEligibleForAction,
  partitionVariationSpecs,
  type VariantFigureContext,
  type VariantSelectionAction,
  variationSearchHaystack,
  variantSelectionActionLabel,
  variantSelectionModalTitle,
} from './variantSelectionShared';

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

const PAGE_SIZE = 8;

const FIGURE_SPEC_SKIP_KEYS = new Set(['manufacturer', 'figure', 'product-line']);

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
  const [hiddenColumnKeys, setHiddenColumnKeys] = useState<string[]>([]);
  const searchInputRef = useRef<InputRef>(null);
  const wasOpenRef = useRef(false);
  const listThumbnailSize = token.controlHeight;
  const figureImageSize = token.controlHeightLG * 2;

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setPendingKeys(selectedKeys);
      setCarriedKeys(selectedKeys);
      setSearchText('');
      setHiddenColumnKeys([]);
    }
    wasOpenRef.current = open;
  }, [open, selectedKeys]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => searchInputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  const sortedVariations = useMemo(
    () => [...variations].sort((a, b) => a.sku.localeCompare(b.sku)),
    [variations],
  );

  const filteredVariations = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return sortedVariations;
    return sortedVariations.filter((variation) => variationSearchHaystack(variation).includes(q));
  }, [sortedVariations, searchText]);

  const { uniform, varying } = useMemo(() => partitionVariationSpecs(variations), [variations]);

  const visibleVarying = useMemo(
    () => varying.filter((column) => !hiddenColumnKeys.includes(column.key)),
    [varying, hiddenColumnKeys],
  );

  const uniformKeys = useMemo(() => new Set(uniform.map((spec) => spec.key)), [uniform]);
  const visibleColumnKeys = useMemo(
    () => new Set(visibleVarying.map((column) => column.key)),
    [visibleVarying],
  );

  const headerSpecs = useMemo(() => {
    const seen = new Set(uniform.map((spec) => spec.key));
    const varyingKeys = new Set(varying.map((column) => column.key));
    const fromFigure = (figure?.figureSpecs ?? []).filter((spec) => {
      if (FIGURE_SPEC_SKIP_KEYS.has(spec.key) || seen.has(spec.key) || varyingKeys.has(spec.key)) {
        return false;
      }
      return !isPlaceholderSpecValue(spec.value);
    });
    return [...fromFigure, ...uniform];
  }, [figure?.figureSpecs, uniform, varying]);

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

  const columns: TableColumnsType<PartVariationRow> = [
    {
      title: '',
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
      sorter: (a, b) => a.sku.localeCompare(b.sku),
      render: (_, variation) => (
        <Flex align="center" gap={token.marginSM}>
          <VariationThumbnail variation={variation} size={listThumbnailSize} />
          <Flex vertical gap={0} style={{ minWidth: 0 }}>
            <Typography.Text strong style={hydraTextStyleToReactCss(hydraBaseStrong)}>
              {variation.sku}
            </Typography.Text>
            <Typography.Text type="secondary" ellipsis style={hydraTextStyleToReactCss(hydraSmallNormal)}>
              {variation.name}
            </Typography.Text>
          </Flex>
        </Flex>
      ),
    },
    ...visibleVarying.map((column) => ({
      title: column.label,
      key: column.key,
      sorter: (a: PartVariationRow, b: PartVariationRow) =>
        (variationSpecValue(a, column.key) ?? '').localeCompare(variationSpecValue(b, column.key) ?? ''),
      render: (_: unknown, variation: PartVariationRow) => (
        <Typography.Text style={hydraTextStyleToReactCss(hydraBaseNormal)}>
          {variationSpecValue(variation, column.key) ?? '—'}
        </Typography.Text>
      ),
    })),
    {
      title: 'Drawings',
      key: 'drawings',
      render: (_, variation) => {
        const eligible = action ? isVariationEligibleForAction(variation, action) : true;
        return (
          <Flex vertical gap={0}>
            <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraSmallNormal)}>
              {variation.drawingFileTypes.length > 0 ? variation.drawingFileTypes.join(', ') : 'None'}
            </Typography.Text>
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
      width={token.screenLG}
      destroyOnClose
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
      <Flex vertical gap={token.marginMD} style={{ paddingBlock: token.paddingXS }}>
        {figure?.breadcrumb && figure.breadcrumb.length > 0 ? (
          <Breadcrumb items={figure.breadcrumb.map((label) => ({ title: label }))} />
        ) : null}

        {figure ? (
          <Flex gap={token.padding} align="flex-start" wrap="wrap">
            {figure.imageUrl ? (
              <img
                src={figure.imageUrl}
                alt=""
                style={{
                  width: figureImageSize,
                  height: figureImageSize,
                  objectFit: 'cover',
                  borderRadius: token.borderRadius,
                  flexShrink: 0,
                  border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                }}
              />
            ) : null}
            <Flex vertical gap={token.marginXXS} style={{ flex: 1, minWidth: 0 }}>
              <Typography.Text style={{ color: token.colorText, ...hydraTextStyleToReactCss(hydraLargeStrong) }}>
                {figure.figureNumber}
              </Typography.Text>
              <Typography.Text style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                {figure.productName}
              </Typography.Text>
              <Flex gap={token.marginSM} wrap="wrap" align="center">
                {figure.brand ? (
                  <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraSmallNormal)}>
                    Brand: {figure.brand}
                  </Typography.Text>
                ) : null}
                {categoryLabel ? (
                  <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraSmallNormal)}>
                    Category: {categoryLabel}
                  </Typography.Text>
                ) : null}
                {hasSubmittalPdf ? (
                  <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraSmallNormal)}>
                    <FilePdfOutlined /> Submittal sheet: PDF
                  </Typography.Text>
                ) : null}
              </Flex>
              {headerSpecs.length > 0 ? (
                <Flex gap={token.marginXS} wrap="wrap" align="baseline" style={{ marginTop: token.marginXS }}>
                  <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraSmallNormal)}>
                    Shared on this figure:
                  </Typography.Text>
                  {headerSpecs.map((spec) => (
                    <SpecChip key={spec.key} spec={spec} />
                  ))}
                </Flex>
              ) : null}
            </Flex>
          </Flex>
        ) : null}

        <Divider style={{ margin: 0 }} />

        <Flex align="center" justify="space-between" gap={token.marginSM} wrap="wrap">
          <Typography.Text strong style={hydraTextStyleToReactCss(hydraBaseStrong)}>
            Variants ({variations.length} {variations.length === 1 ? 'SKU' : 'SKUs'})
          </Typography.Text>
          <Flex gap={token.marginXS} wrap="wrap" align="center">
            <Input
              ref={searchInputRef}
              placeholder="Filter by size, finish…"
              prefix={<SearchOutlined style={{ color: token.colorTextQuaternary }} />}
              allowClear
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              aria-label="Search variations"
              style={{ width: token.sizeUnit * 56 }}
            />
            {varying.length > 0 ? (
              <Popover
                trigger="click"
                placement="bottomRight"
                content={
                  <Flex vertical gap={token.marginXS}>
                    {varying.map((column) => (
                      <Checkbox
                        key={column.key}
                        checked={!hiddenColumnKeys.includes(column.key)}
                        onChange={(event) => {
                          setHiddenColumnKeys((current) =>
                            event.target.checked
                              ? current.filter((key) => key !== column.key)
                              : [...current, column.key],
                          );
                        }}
                      >
                        {column.label}
                      </Checkbox>
                    ))}
                  </Flex>
                }
              >
                <Button icon={<SettingOutlined />} aria-label="Choose columns">
                  Columns ({visibleVarying.length}/{varying.length})
                </Button>
              </Popover>
            ) : null}
          </Flex>
        </Flex>

        <Flex align="center" justify="space-between" gap={token.marginSM} wrap="wrap">
          <Flex align="center" gap={token.marginXS}>
            <Badge
              count={selectedCount}
              showZero
              overflowCount={999}
              color={token.colorPrimary}
              aria-label={`${selectedCount} variants selected`}
            />
            <Typography.Text strong style={hydraTextStyleToReactCss(hydraBaseNormal)}>
              {selectedCount} selected
            </Typography.Text>
          </Flex>
          <Flex gap={token.marginXS} wrap="wrap">
            <Button size="small" onClick={selectAllEligible} disabled={eligibleKeys.length === 0}>
              Select all
            </Button>
            <Button size="small" onClick={clearAll} disabled={selectedCount === 0}>
              Clear all
            </Button>
          </Flex>
        </Flex>

        {unavailableSelectedCount > 0 && fileType ? (
          <Typography.Text type="danger" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
            {unavailableSelectedCount} selected{' '}
            {unavailableSelectedCount === 1 ? 'variation does' : 'variations do'} not include {fileType}.
            Remove {unavailableSelectedCount === 1 ? 'it' : 'them'} to continue.
          </Typography.Text>
        ) : null}

        <Table<PartVariationRow>
          rowKey="key"
          size="middle"
          columns={columns}
          dataSource={filteredVariations}
          styles={catalogBrowseTableHeaderStyles(token)}
          pagination={{
            pageSize: PAGE_SIZE,
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
              style: isCarried ? { background: buttonPrimaryPalette.bg } : undefined,
            };
          }}
          expandable={{
            expandedRowRender: (variation) => (
              <ExpandedVariantDetails
                variation={variation}
                hiddenSpecKeys={new Set([...uniformKeys, ...visibleColumnKeys, 'sku'])}
              />
            ),
            rowExpandable: () => true,
          }}
        />
      </Flex>
    </Modal>
  );
}

function SpecChip({ spec }: { spec: PartSpecField }) {
  const { token } = theme.useToken();
  return (
    <Typography.Text style={hydraTextStyleToReactCss(hydraSmallNormal)}>
      <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraSmallNormal)}>
        {spec.label}:
      </Typography.Text>{' '}
      <Typography.Text style={{ color: token.colorText, ...hydraTextStyleToReactCss(hydraSmallNormal) }}>
        {spec.value}
      </Typography.Text>
    </Typography.Text>
  );
}

function ExpandedVariantDetails({
  variation,
  hiddenSpecKeys,
}: {
  variation: PartVariationRow;
  hiddenSpecKeys: Set<string>;
}) {
  const { token } = theme.useToken();
  const extraSpecs = variation.specifications.filter((spec) => !hiddenSpecKeys.has(spec.key));
  const showDescription = !isRedundantPimText(variation.name, variation.description);

  return (
    <Flex vertical gap={token.marginXS} style={{ paddingInline: token.paddingSM }}>
      <Typography.Text strong style={hydraTextStyleToReactCss(hydraBaseStrong)}>
        SKU {variation.sku}
      </Typography.Text>
      {showDescription ? (
        <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
          {variation.description}
        </Typography.Text>
      ) : null}
      <Flex gap={token.marginMD} wrap="wrap">
        {extraSpecs.map((spec) => (
          <SpecChip key={spec.key} spec={spec} />
        ))}
        <Typography.Text style={hydraTextStyleToReactCss(hydraSmallNormal)}>
          <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraSmallNormal)}>
            Documents:
          </Typography.Text>{' '}
          {variation.drawingFileTypes.length > 0 ? variation.drawingFileTypes.join(', ') : 'None'}
        </Typography.Text>
      </Flex>
    </Flex>
  );
}
