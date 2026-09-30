import type { CSSProperties, ReactNode } from 'react';
import type { GlobalToken } from 'antd/es/theme/interface';
import { CloseCircleOutlined } from '@ant-design/icons';

import { BomImportedValueCell, bomImportedColumnHeaderStyle } from './bomImportedDataEmphasis';
import type { BomFieldAliasMap } from './bomFieldMappingConfig';
import { isAscFieldMapped } from './bomFieldMappingUtils';
import type { BomItem, BomParsingReviewColumnProfile } from './data/types';
import {
  isParsingReviewLowConfidenceRow,
  isParsingReviewUnusableRow,
  parsingReviewFieldNeedsAttention,
  parsingReviewHasUpcIssue,
  parsingReviewUpcTooltip,
  type ParsingReviewField,
} from './bomParsingReviewAlert';
import { BomConfidenceTag } from './components/BomTags';
import { EditableSizeInchesInput } from './components/EditableSizeInchesInput';
import {
  editableTableNumber,
  editableTableText,
  readOnlyTableText,
} from './bomImportTableCells';
import { HydraTag } from '../ui/HydraTag';
import { Button, Typography } from '../ui/antd';
import type { TableColumnsType } from '../ui/antd';
import { hydraBaseDelete, hydraBaseNormal, hydraBaseStrong, hydraTextStyleToReactCss } from '../theme/hydraTypography';

/** Fields persisted when saving a parsing review row from the edit modal. */
export function parsingReviewEditableRowPatch(
  row: BomItem,
  profile: BomParsingReviewColumnProfile,
): Partial<BomItem> {
  const patch: Partial<BomItem> = {
    originalInput: row.originalInput,
    size: row.size,
    manufacturer: row.manufacturer,
    figureNumber: row.figureNumber,
    quantity: row.quantity,
  };

  if (profile === 'description') {
    patch.parsedDescription = row.parsedDescription;
    patch.upc = row.upc;
  }

  if (profile === 'description' || profile === 'sku-only' || profile === 'upc') {
    patch.sku = row.sku;
  }

  if (profile === 'upc') {
    patch.upc = row.upc;
  }

  return patch;
}

export const PARSING_REVIEW_COLUMN_WIDTHS = {
  rowNumber: 56,
  quality: 110,
  originalDescription: 220,
  parsedDescription: 200,
  sku: 110,
  upc: 110,
  sizeInches: 100,
  manufacturer: 110,
  figureNumber: 110,
  qty: 80,
  actions: 112,
  skuOnlyWide: 280,
  upcWide: 200,
} as const;

type RowUpdater = (rowId: string, patch: Partial<BomItem>) => void;

function originalInputColumn(token: GlobalToken): TableColumnsType<BomItem>[number] {
  return {
    title: 'From your file',
    dataIndex: 'originalInput',
    key: 'originalInput',
    width: PARSING_REVIEW_COLUMN_WIDTHS.originalDescription,
    ellipsis: true,
    onHeaderCell: () => ({ style: bomImportedColumnHeaderStyle(token) }),
    render: (v: string) => <BomImportedValueCell value={v} />,
  };
}

function readOnlyAttentionText(
  value: string | undefined,
  row: BomItem,
  field: ParsingReviewField,
  profile: BomParsingReviewColumnProfile,
) {
  const needsAttention = parsingReviewFieldNeedsAttention(row, field, profile);
  const hasValue = Boolean(value?.trim());
  const hasUpcIssue = field === 'upc' && parsingReviewHasUpcIssue(row, profile);
  const isEmptyAttention = needsAttention && !hasValue;

  const display = hasValue ? value!.trim() : isEmptyAttention ? '?' : '—';
  const tooltip =
    hasUpcIssue
      ? parsingReviewUpcTooltip(row)
      : isEmptyAttention
        ? 'Missing — we could not read this'
      : hasValue
        ? display
        : undefined;

  return (
    <Typography.Text
      type={hasUpcIssue ? 'danger' : isEmptyAttention ? 'warning' : undefined}
      ellipsis={{ tooltip }}
      style={{
        display: 'block',
        ...hydraTextStyleToReactCss(
          hasUpcIssue && hasValue
            ? hydraBaseDelete
            : isEmptyAttention || hasUpcIssue
              ? hydraBaseStrong
              : hydraBaseNormal,
        ),
      }}
      aria-label={tooltip}
    >
      {display}
    </Typography.Text>
  );
}

function readOnlyQty(value: number, row: BomItem, profile: BomParsingReviewColumnProfile) {
  const needsAttention = parsingReviewFieldNeedsAttention(row, 'quantity', profile);
  const missing = needsAttention && (!value || value <= 0);
  return (
    <Typography.Text
      type={missing ? 'warning' : undefined}
      aria-label={missing ? 'Missing — we could not read this' : undefined}
      style={hydraTextStyleToReactCss(missing ? hydraBaseStrong : hydraBaseNormal)}
    >
      {missing ? '?' : value}
    </Typography.Text>
  );
}

function qualityColumn(profile: BomParsingReviewColumnProfile): TableColumnsType<BomItem>[number] {
  return {
    title: 'Quality',
    key: 'quality',
    width: PARSING_REVIEW_COLUMN_WIDTHS.quality,
    render: (_, record) => {
      if (isParsingReviewUnusableRow(record, profile)) {
        return (
          <HydraTag tone="error" icon={<CloseCircleOutlined />}>
            Can&apos;t match
          </HydraTag>
        );
      }
      return <BomConfidenceTag confidence={record.confidence} showIcon />;
    },
  };
}

function readOnlyMiddleColumns(
  profile: BomParsingReviewColumnProfile,
  fieldMapping?: BomFieldAliasMap,
): TableColumnsType<BomItem> {
  const columns: TableColumnsType<BomItem> = [
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      width: PARSING_REVIEW_COLUMN_WIDTHS.sizeInches,
      render: (v: string, record) => readOnlyAttentionText(v, record, 'size', profile),
    },
  ];

  if (isAscFieldMapped(fieldMapping, 'MANUFACTURER')) {
    columns.push({
      title: 'Manufacturer',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      width: PARSING_REVIEW_COLUMN_WIDTHS.manufacturer,
      render: (v: string | undefined, record) =>
        readOnlyAttentionText(v, record, 'manufacturer', profile),
    });
  }

  if (isAscFieldMapped(fieldMapping, 'FIGURE NUM')) {
    columns.push({
      title: 'Figure Number',
      dataIndex: 'figureNumber',
      key: 'figureNumber',
      width: PARSING_REVIEW_COLUMN_WIDTHS.figureNumber,
      render: (v: string | undefined, record) =>
        readOnlyAttentionText(v, record, 'figureNumber', profile),
    });
  }

  return columns;
}

function actionsColumn(
  profile: BomParsingReviewColumnProfile,
  onEditRow: (row: BomItem) => void,
): TableColumnsType<BomItem>[number] {
  return {
    title: '',
    key: 'actions',
    width: 112,
    render: (_, record) => {
      const unusable = isParsingReviewUnusableRow(record, profile);
      const needsInfo = isParsingReviewLowConfidenceRow(record, profile);
      const label = unusable ? 'Fix to match' : needsInfo ? 'Add info' : 'Edit';
      return (
        <Button type={needsInfo ? 'primary' : 'default'} size="small" onClick={() => onEditRow(record)}>
          {label}
        </Button>
      );
    },
  };
}

/** Read-only parsing table — Edit/Add info opens the row modal. */
export function buildParsingReviewReadOnlyColumns(
  profile: BomParsingReviewColumnProfile,
  onEditRow: (row: BomItem) => void,
  token: GlobalToken,
  fieldMapping?: BomFieldAliasMap,
): TableColumnsType<BomItem> {
  const base: TableColumnsType<BomItem> = [
    {
      title: '#',
      dataIndex: 'rowNumber',
      key: 'rowNumber',
      width: PARSING_REVIEW_COLUMN_WIDTHS.rowNumber,
    },
    qualityColumn(profile),
  ];

  const qtyColumnDef: TableColumnsType<BomItem>[number] = {
    title: 'Qty',
    dataIndex: 'quantity',
    key: 'quantity',
    width: PARSING_REVIEW_COLUMN_WIDTHS.qty,
    render: (v: number, record) => readOnlyQty(v, record, profile),
  };

  if (profile === 'description') {
    const columns: TableColumnsType<BomItem> = [
      {
        title: '#',
        dataIndex: 'rowNumber',
        key: 'rowNumber',
        width: PARSING_REVIEW_COLUMN_WIDTHS.rowNumber,
      },
      originalInputColumn(token),
      qualityColumn(profile),
    ];

    if (isAscFieldMapped(fieldMapping, 'DESCRIPTION')) {
      columns.push({
        title: 'How we read this',
        dataIndex: 'parsedDescription',
        key: 'parsedDescription',
        width: PARSING_REVIEW_COLUMN_WIDTHS.parsedDescription,
        render: (v: string, record) =>
          readOnlyAttentionText(v, record, 'parsedDescription', profile),
      });
    }

    if (isAscFieldMapped(fieldMapping, 'SKU')) {
      columns.push({
        title: 'SKU',
        dataIndex: 'sku',
        key: 'sku',
        width: PARSING_REVIEW_COLUMN_WIDTHS.sku,
        render: (v: string | undefined, record) =>
          readOnlyAttentionText(v, record, 'sku', profile),
      });
    }

    columns.push(...readOnlyMiddleColumns(profile, fieldMapping));

    if (isAscFieldMapped(fieldMapping, 'UPC')) {
      columns.push({
        title: 'UPC',
        dataIndex: 'upc',
        key: 'upc',
        width: PARSING_REVIEW_COLUMN_WIDTHS.upc,
        render: (v: string | undefined, record) =>
          readOnlyAttentionText(v, record, 'upc', profile),
      });
    }

    if (isAscFieldMapped(fieldMapping, 'QTY')) {
      columns.push(qtyColumnDef);
    }

    columns.push(actionsColumn(profile, onEditRow));
    return columns;
  }

  if (profile === 'sku-only') {
    const columns: TableColumnsType<BomItem> = [
      ...base,
      originalInputColumn(token),
      {
        title: 'SKU',
        dataIndex: 'sku',
        key: 'sku',
        width: PARSING_REVIEW_COLUMN_WIDTHS.skuOnlyWide,
        render: (v: string | undefined, record) =>
          readOnlyAttentionText(v, record, 'sku', profile),
      },
      ...readOnlyMiddleColumns(profile, fieldMapping),
    ];

    if (isAscFieldMapped(fieldMapping, 'QTY')) {
      columns.push(qtyColumnDef);
    }

    columns.push(actionsColumn(profile, onEditRow));
    return columns;
  }

  const columns: TableColumnsType<BomItem> = [
    ...base,
    originalInputColumn(token),
    {
      title: 'UPC',
      dataIndex: 'upc',
      key: 'upc',
      width: PARSING_REVIEW_COLUMN_WIDTHS.upcWide,
      render: (v: string | undefined, record) =>
        readOnlyAttentionText(v, record, 'upc', profile),
    },
  ];

  if (isAscFieldMapped(fieldMapping, 'SKU')) {
    columns.push({
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: PARSING_REVIEW_COLUMN_WIDTHS.sku,
      render: (v: string | undefined, record) =>
        readOnlyAttentionText(v, record, 'sku', profile),
    });
  }

  columns.push(...readOnlyMiddleColumns(profile, fieldMapping));

  if (isAscFieldMapped(fieldMapping, 'QTY')) {
    columns.push(qtyColumnDef);
  }

  columns.push(actionsColumn(profile, onEditRow));
  return columns;
}

/** Row background — uniform rows; quality is shown in the Quality column and Add info action. */
export function parsingReviewRowStyle(): CSSProperties | undefined {
  return undefined;
}

function qtyColumn(profile: BomParsingReviewColumnProfile, updateRow: RowUpdater): TableColumnsType<BomItem>[number] {
  return {
    title: 'Qty',
    dataIndex: 'quantity',
    key: 'quantity',
    width: PARSING_REVIEW_COLUMN_WIDTHS.qty,
    render: (v: number, record) => (
      editableTableNumber({
        value: v,
        needsAttention: parsingReviewFieldNeedsAttention(record, 'quantity', profile),
        onChange: (n) =>
          updateRow(record.id, { quantity: typeof n === 'number' ? n : record.quantity }),
      })
    ),
  };
}

function sharedMiddleColumns(
  profile: BomParsingReviewColumnProfile,
  updateRow: RowUpdater,
): TableColumnsType<BomItem> {
  return [
    {
      title: 'Size (inches)',
      dataIndex: 'size',
      key: 'size',
      width: PARSING_REVIEW_COLUMN_WIDTHS.sizeInches,
      render: (v: string, record) => (
        <EditableSizeInchesInput
          value={v}
          needsAttention={parsingReviewFieldNeedsAttention(record, 'size', profile)}
          onChange={(next) => updateRow(record.id, { size: next })}
        />
      ),
    },
    {
      title: 'Manufacturer',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      width: PARSING_REVIEW_COLUMN_WIDTHS.manufacturer,
      render: (v: string | undefined, record) =>
        editableTableText({
          value: v,
          needsAttention: parsingReviewFieldNeedsAttention(record, 'manufacturer', profile),
          onChange: (next) => updateRow(record.id, { manufacturer: next }),
        }),
    },
    {
      title: 'Figure Number',
      dataIndex: 'figureNumber',
      key: 'figureNumber',
      width: PARSING_REVIEW_COLUMN_WIDTHS.figureNumber,
      render: (v: string | undefined, record) =>
        editableTableText({
          value: v,
          needsAttention: parsingReviewFieldNeedsAttention(record, 'figureNumber', profile),
          onChange: (next) => updateRow(record.id, { figureNumber: next }),
        }),
    },
  ];
}

function fieldInputStatus(
  row: BomItem,
  field: ParsingReviewField,
  profile: BomParsingReviewColumnProfile,
): 'warning' | 'error' | undefined {
  if (!parsingReviewFieldNeedsAttention(row, field, profile)) return undefined;
  if (field === 'upc' && parsingReviewHasUpcIssue(row, profile)) return 'error';
  return 'warning';
}

function fieldExtraHint(row: BomItem, field: ParsingReviewField): ReactNode {
  if (field !== 'upc' || !row.upcParseIssue) return null;
  const raw = row.upcParseIssue.rawSource?.trim();
  if (!raw) return null;
  return (
    <Typography.Text type="secondary" style={{ display: 'block' }}>
      From your file: {raw}
    </Typography.Text>
  );
}

/** Editable fields for the row edit modal — mirrors visible table columns (except # and Quality). */
export function buildParsingReviewEditableFields(
  profile: BomParsingReviewColumnProfile,
  fieldMapping?: BomFieldAliasMap,
): { key: string; label: string; render: (row: BomItem, update: RowUpdater) => ReactNode }[] {
  const fields: { key: string; label: string; render: (row: BomItem, update: RowUpdater) => ReactNode }[] = [];

  fields.push({
    key: 'originalInput',
    label: 'From your file',
    render: (row, update) =>
      editableTableText({
        value: row.originalInput,
        onChange: (next) => update(row.id, { originalInput: next }),
      }),
  });

  const pushMiddleFields = () => {
    fields.push({
      key: 'size',
      label: 'Size (inches)',
      render: (row, update) => (
        <EditableSizeInchesInput
          value={row.size}
          needsAttention={parsingReviewFieldNeedsAttention(row, 'size', profile)}
          onChange={(next) => update(row.id, { size: next })}
        />
      ),
    });

    if (isAscFieldMapped(fieldMapping, 'MANUFACTURER')) {
      fields.push({
        key: 'manufacturer',
        label: 'Manufacturer',
        render: (row, update) =>
          editableTableText({
            value: row.manufacturer,
            needsAttention: parsingReviewFieldNeedsAttention(row, 'manufacturer', profile),
            onChange: (next) => update(row.id, { manufacturer: next }),
          }),
      });
    }

    if (isAscFieldMapped(fieldMapping, 'FIGURE NUM')) {
      fields.push({
        key: 'figureNumber',
        label: 'Figure Number',
        render: (row, update) =>
          editableTableText({
            value: row.figureNumber,
            needsAttention: parsingReviewFieldNeedsAttention(row, 'figureNumber', profile),
            onChange: (next) => update(row.id, { figureNumber: next }),
          }),
      });
    }
  };

  if (profile === 'description') {
    if (isAscFieldMapped(fieldMapping, 'DESCRIPTION')) {
      fields.push({
        key: 'parsedDescription',
        label: 'How we read this',
        render: (row, update) =>
          editableTableText({
            value: row.parsedDescription,
            needsAttention: parsingReviewFieldNeedsAttention(row, 'parsedDescription', profile),
            onChange: (next) => update(row.id, { parsedDescription: next }),
          }),
      });
    }

    if (isAscFieldMapped(fieldMapping, 'SKU')) {
      fields.push({
        key: 'sku',
        label: 'SKU',
        render: (row, update) =>
          editableTableText({
            value: row.sku,
            needsAttention: parsingReviewFieldNeedsAttention(row, 'sku', profile),
            onChange: (next) => update(row.id, { sku: next }),
          }),
      });
    }

    pushMiddleFields();

    if (isAscFieldMapped(fieldMapping, 'UPC')) {
      fields.push({
        key: 'upc',
        label: 'UPC',
        render: (row, update) => (
          <>
            {editableTableText({
              value: row.upc,
              needsAttention: parsingReviewFieldNeedsAttention(row, 'upc', profile),
              status: fieldInputStatus(row, 'upc', profile),
              onChange: (next) => update(row.id, { upc: next }),
            })}
            {fieldExtraHint(row, 'upc')}
          </>
        ),
      });
    }
  } else if (profile === 'sku-only') {
    fields.push({
      key: 'sku',
      label: 'SKU',
      render: (row, update) =>
        editableTableText({
          value: row.sku,
          needsAttention: parsingReviewFieldNeedsAttention(row, 'sku', profile),
          onChange: (next) => update(row.id, { sku: next }),
        }),
    });

    pushMiddleFields();
  } else {
    fields.push({
      key: 'upc',
      label: 'UPC',
      render: (row, update) => (
        <>
          {editableTableText({
            value: row.upc,
            needsAttention: parsingReviewFieldNeedsAttention(row, 'upc', profile),
            status: fieldInputStatus(row, 'upc', profile),
            onChange: (next) => update(row.id, { upc: next }),
          })}
          {fieldExtraHint(row, 'upc')}
        </>
      ),
    });

    if (isAscFieldMapped(fieldMapping, 'SKU')) {
      fields.push({
        key: 'sku',
        label: 'SKU',
        render: (row, update) =>
          editableTableText({
            value: row.sku,
            needsAttention: parsingReviewFieldNeedsAttention(row, 'sku', profile),
            onChange: (next) => update(row.id, { sku: next }),
          }),
      });
    }

    pushMiddleFields();
  }

  if (isAscFieldMapped(fieldMapping, 'QTY')) {
    fields.push({
      key: 'quantity',
      label: 'Qty',
      render: (row, update) =>
        editableTableNumber({
          value: row.quantity,
          needsAttention: parsingReviewFieldNeedsAttention(row, 'quantity', profile),
          min: 1,
          onChange: (n) => update(row.id, { quantity: typeof n === 'number' ? n : row.quantity }),
        }),
    });
  }

  return fields;
}

/** @deprecated Inline spreadsheet columns — superseded by {@link buildParsingReviewReadOnlyColumns}. */
export function buildParsingReviewColumns(
  profile: BomParsingReviewColumnProfile,
  updateRow: RowUpdater,
): TableColumnsType<BomItem> {
  const base: TableColumnsType<BomItem> = [
    {
      title: '#',
      dataIndex: 'rowNumber',
      key: 'rowNumber',
      width: PARSING_REVIEW_COLUMN_WIDTHS.rowNumber,
    },
  ];

  if (profile === 'description') {
    return [
      ...base,
      {
        title: 'Original Description',
        dataIndex: 'originalInput',
        key: 'originalInput',
        width: PARSING_REVIEW_COLUMN_WIDTHS.originalDescription,
        ellipsis: true,
        render: (v: string) => readOnlyTableText(v),
      },
      {
        title: 'How we read this',
        dataIndex: 'parsedDescription',
        key: 'parsedDescription',
        width: PARSING_REVIEW_COLUMN_WIDTHS.parsedDescription,
        render: (v: string, record) =>
          editableTableText({
            value: v,
            needsAttention: parsingReviewFieldNeedsAttention(record, 'parsedDescription', profile),
            onChange: (next) => updateRow(record.id, { parsedDescription: next }),
          }),
      },
      {
        title: 'SKU',
        dataIndex: 'sku',
        key: 'sku',
        width: PARSING_REVIEW_COLUMN_WIDTHS.sku,
        render: (v: string | undefined, record) =>
          editableTableText({
            value: v,
            needsAttention: parsingReviewFieldNeedsAttention(record, 'sku', profile),
            onChange: (next) => updateRow(record.id, { sku: next }),
          }),
      },
      ...sharedMiddleColumns(profile, updateRow),
      {
        title: 'UPC',
        dataIndex: 'upc',
        key: 'upc',
        width: PARSING_REVIEW_COLUMN_WIDTHS.upc,
        render: (v: string | undefined, record) =>
          editableTableText({
            value: v,
            needsAttention: parsingReviewFieldNeedsAttention(record, 'upc', profile),
            onChange: (next) => updateRow(record.id, { upc: next }),
          }),
      },
      qtyColumn(profile, updateRow),
    ];
  }

  if (profile === 'sku-only') {
    return [
      ...base,
      {
        title: 'SKU',
        dataIndex: 'sku',
        key: 'sku',
        width: PARSING_REVIEW_COLUMN_WIDTHS.skuOnlyWide,
        render: (v: string | undefined, record) =>
          editableTableText({
            value: v,
            needsAttention: parsingReviewFieldNeedsAttention(record, 'sku', profile),
            onChange: (next) => updateRow(record.id, { sku: next }),
          }),
      },
      ...sharedMiddleColumns(profile, updateRow),
      qtyColumn(profile, updateRow),
    ];
  }

  return [
    ...base,
    {
      title: 'UPC',
      dataIndex: 'upc',
      key: 'upc',
      width: PARSING_REVIEW_COLUMN_WIDTHS.upcWide,
      render: (v: string | undefined, record) =>
        editableTableText({
          value: v,
          needsAttention: parsingReviewFieldNeedsAttention(record, 'upc', profile),
          onChange: (next) => updateRow(record.id, { upc: next }),
        }),
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: PARSING_REVIEW_COLUMN_WIDTHS.sku,
      render: (v: string | undefined, record) =>
        editableTableText({
          value: v,
          needsAttention: parsingReviewFieldNeedsAttention(record, 'sku', profile),
          onChange: (next) => updateRow(record.id, { sku: next }),
        }),
    },
    ...sharedMiddleColumns(profile, updateRow),
    qtyColumn(profile, updateRow),
  ];
}
