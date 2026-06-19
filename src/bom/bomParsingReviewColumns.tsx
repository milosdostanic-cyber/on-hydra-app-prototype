import type { CSSProperties } from 'react';
import type { GlobalToken } from 'antd/es/theme/interface';

import { BomImportedValueCell, bomImportedColumnHeaderStyle } from './bomImportedDataEmphasis';
import type { BomItem, BomParsingReviewColumnProfile } from './data/types';
import {
  isParsingReviewLowConfidenceRow,
  parsingReviewFieldNeedsAttention,
} from './bomParsingReviewAlert';
import { BomConfidenceTag } from './components/BomTags';
import {
  editableTableNumber,
  editableTableText,
  formatSizeInches,
  parseSizeInches,
  readOnlyTableText,
} from './bomImportTableCells';
import { Button, Typography } from '../ui/antd';
import type { TableColumnsType } from '../ui/antd';

export const PARSING_REVIEW_COLUMN_WIDTHS = {
  rowNumber: 56,
  quality: 100,
  originalDescription: 220,
  parsedDescription: 200,
  sku: 110,
  upc: 110,
  sizeInches: 100,
  manufacturer: 110,
  figureNumber: 110,
  qty: 80,
  actions: 100,
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

function readOnlyAttentionText(value: string | undefined, needsAttention: boolean) {
  const hasValue = Boolean(value?.trim());
  const display = hasValue ? value!.trim() : needsAttention ? '?' : '—';
  return (
    <Typography.Text
      type={needsAttention && !hasValue ? 'warning' : undefined}
      strong={needsAttention && !hasValue}
      ellipsis={{ tooltip: hasValue ? display : 'Missing — we could not read this' }}
      style={{ display: 'block' }}
    >
      {display}
    </Typography.Text>
  );
}

function readOnlyQty(value: number, needsAttention: boolean) {
  const missing = needsAttention && (!value || value <= 0);
  return (
    <Typography.Text type={missing ? 'warning' : undefined} strong={missing}>
      {missing ? '?' : value}
    </Typography.Text>
  );
}

function qualityColumn(): TableColumnsType<BomItem>[number] {
  return {
    title: 'Quality',
    key: 'quality',
    width: PARSING_REVIEW_COLUMN_WIDTHS.quality,
    render: (_, record) => <BomConfidenceTag confidence={record.confidence} showIcon />,
  };
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
      const needsInfo = isParsingReviewLowConfidenceRow(record, profile);
      return (
        <Button type={needsInfo ? 'primary' : 'default'} size="small" onClick={() => onEditRow(record)}>
          {needsInfo ? 'Add info' : 'Edit'}
        </Button>
      );
    },
  };
}

function readOnlyMiddleColumns(profile: BomParsingReviewColumnProfile): TableColumnsType<BomItem> {
  return [
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      width: PARSING_REVIEW_COLUMN_WIDTHS.sizeInches,
      render: (v: string, record) =>
        readOnlyAttentionText(v, parsingReviewFieldNeedsAttention(record, 'size', profile)),
    },
    {
      title: 'Manufacturer',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      width: PARSING_REVIEW_COLUMN_WIDTHS.manufacturer,
      render: (v: string | undefined, record) =>
        readOnlyAttentionText(v, parsingReviewFieldNeedsAttention(record, 'manufacturer', profile)),
    },
    {
      title: 'Figure Number',
      dataIndex: 'figureNumber',
      key: 'figureNumber',
      width: PARSING_REVIEW_COLUMN_WIDTHS.figureNumber,
      render: (v: string | undefined, record) =>
        readOnlyAttentionText(v, parsingReviewFieldNeedsAttention(record, 'figureNumber', profile)),
    },
  ];
}

/** Read-only parsing table — editing opens from row action (drawer), not inline cells. */
export function buildParsingReviewReadOnlyColumns(
  profile: BomParsingReviewColumnProfile,
  onEditRow: (row: BomItem) => void,
  token: GlobalToken,
): TableColumnsType<BomItem> {
  const base: TableColumnsType<BomItem> = [
    {
      title: '#',
      dataIndex: 'rowNumber',
      key: 'rowNumber',
      width: PARSING_REVIEW_COLUMN_WIDTHS.rowNumber,
    },
    qualityColumn(),
  ];

  if (profile === 'description') {
    return [
      {
        title: '#',
        dataIndex: 'rowNumber',
        key: 'rowNumber',
        width: PARSING_REVIEW_COLUMN_WIDTHS.rowNumber,
      },
      originalInputColumn(token),
      qualityColumn(),
      {
        title: 'How we read this',
        dataIndex: 'parsedDescription',
        key: 'parsedDescription',
        width: PARSING_REVIEW_COLUMN_WIDTHS.parsedDescription,
        render: (v: string, record) =>
          readOnlyAttentionText(v, parsingReviewFieldNeedsAttention(record, 'parsedDescription', profile)),
      },
      {
        title: 'SKU',
        dataIndex: 'sku',
        key: 'sku',
        width: PARSING_REVIEW_COLUMN_WIDTHS.sku,
        render: (v: string | undefined, record) =>
          readOnlyAttentionText(v, parsingReviewFieldNeedsAttention(record, 'sku', profile)),
      },
      ...readOnlyMiddleColumns(profile),
      {
        title: 'UPC',
        dataIndex: 'upc',
        key: 'upc',
        width: PARSING_REVIEW_COLUMN_WIDTHS.upc,
        render: (v: string | undefined, record) =>
          readOnlyAttentionText(v, parsingReviewFieldNeedsAttention(record, 'upc', profile)),
      },
      {
        title: 'Qty',
        dataIndex: 'quantity',
        key: 'quantity',
        width: PARSING_REVIEW_COLUMN_WIDTHS.qty,
        render: (v: number, record) =>
          readOnlyQty(v, parsingReviewFieldNeedsAttention(record, 'quantity', profile)),
      },
      actionsColumn(profile, onEditRow),
    ];
  }

  if (profile === 'sku-only') {
    return [
      ...base,
      originalInputColumn(token),
      {
        title: 'SKU',
        dataIndex: 'sku',
        key: 'sku',
        width: PARSING_REVIEW_COLUMN_WIDTHS.skuOnlyWide,
        render: (v: string | undefined, record) =>
          readOnlyAttentionText(v, parsingReviewFieldNeedsAttention(record, 'sku', profile)),
      },
      ...readOnlyMiddleColumns(profile),
      {
        title: 'Qty',
        dataIndex: 'quantity',
        key: 'quantity',
        width: PARSING_REVIEW_COLUMN_WIDTHS.qty,
        render: (v: number, record) =>
          readOnlyQty(v, parsingReviewFieldNeedsAttention(record, 'quantity', profile)),
      },
      actionsColumn(profile, onEditRow),
    ];
  }

  return [
    ...base,
    originalInputColumn(token),
    {
      title: 'UPC',
      dataIndex: 'upc',
      key: 'upc',
      width: PARSING_REVIEW_COLUMN_WIDTHS.upcWide,
      render: (v: string | undefined, record) =>
        readOnlyAttentionText(v, parsingReviewFieldNeedsAttention(record, 'upc', profile)),
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: PARSING_REVIEW_COLUMN_WIDTHS.sku,
      render: (v: string | undefined, record) =>
        readOnlyAttentionText(v, parsingReviewFieldNeedsAttention(record, 'sku', profile)),
    },
    ...readOnlyMiddleColumns(profile),
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      width: PARSING_REVIEW_COLUMN_WIDTHS.qty,
      render: (v: number, record) =>
        readOnlyQty(v, parsingReviewFieldNeedsAttention(record, 'quantity', profile)),
    },
    actionsColumn(profile, onEditRow),
  ];
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
        editableTableNumber({
          value: parseSizeInches(v),
          needsAttention: parsingReviewFieldNeedsAttention(record, 'size', profile),
          onChange: (n) => updateRow(record.id, { size: formatSizeInches(n, record.size) }),
        })
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

/** Legacy editable columns — used only inside the row edit drawer. */
export function buildParsingReviewEditableFields(
  profile: BomParsingReviewColumnProfile,
  row: BomItem,
  updateRow: RowUpdater,
): { key: string; label: string; node: React.ReactNode }[] {
  const fields: { key: string; label: string; node: React.ReactNode }[] = [];

  if (profile === 'description') {
    fields.push({
      key: 'parsedDescription',
      label: 'How we read this',
      node: editableTableText({
        value: row.parsedDescription,
        needsAttention: parsingReviewFieldNeedsAttention(row, 'parsedDescription', profile),
        onChange: (next) => updateRow(row.id, { parsedDescription: next }),
      }),
    });
  }

  if (profile === 'upc') {
    fields.push({
      key: 'upc',
      label: 'UPC',
      node: editableTableText({
        value: row.upc,
        needsAttention: parsingReviewFieldNeedsAttention(row, 'upc', profile),
        onChange: (next) => updateRow(row.id, { upc: next }),
      }),
    });
  }

  if (profile === 'description' || profile === 'sku-only' || profile === 'upc') {
    fields.push({
      key: 'sku',
      label: 'SKU',
      node: editableTableText({
        value: row.sku,
        needsAttention: parsingReviewFieldNeedsAttention(row, 'sku', profile),
        onChange: (next) => updateRow(row.id, { sku: next }),
      }),
    });
  }

  if (profile === 'description') {
    fields.push({
      key: 'upc',
      label: 'UPC',
      node: editableTableText({
        value: row.upc,
        needsAttention: parsingReviewFieldNeedsAttention(row, 'upc', profile),
        onChange: (next) => updateRow(row.id, { upc: next }),
      }),
    });
  }

  fields.push(
    {
      key: 'size',
      label: 'Size',
      node: editableTableText({
        value: row.size,
        needsAttention: parsingReviewFieldNeedsAttention(row, 'size', profile),
        onChange: (next) => updateRow(row.id, { size: next }),
      }),
    },
    {
      key: 'manufacturer',
      label: 'Manufacturer',
      node: editableTableText({
        value: row.manufacturer,
        needsAttention: parsingReviewFieldNeedsAttention(row, 'manufacturer', profile),
        onChange: (next) => updateRow(row.id, { manufacturer: next }),
      }),
    },
    {
      key: 'figureNumber',
      label: 'Figure Number',
      node: editableTableText({
        value: row.figureNumber,
        needsAttention: parsingReviewFieldNeedsAttention(row, 'figureNumber', profile),
        onChange: (next) => updateRow(row.id, { figureNumber: next }),
      }),
    },
    {
      key: 'quantity',
      label: 'Quantity',
      node: editableTableNumber({
        value: row.quantity,
        needsAttention: parsingReviewFieldNeedsAttention(row, 'quantity', profile),
        min: 1,
        onChange: (n) => updateRow(row.id, { quantity: typeof n === 'number' ? n : row.quantity }),
      }),
    },
  );

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
