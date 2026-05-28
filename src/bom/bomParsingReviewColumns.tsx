import type { BomItem, BomParsingReviewColumnProfile } from './data/types';
import {
  editableTableNumber,
  editableTableText,
  formatSizeInches,
  parseSizeInches,
  readOnlyTableText,
} from './bomImportTableCells';
import type { TableColumnsType } from '../ui/antd';

export const PARSING_REVIEW_COLUMN_WIDTHS = {
  rowNumber: 56,
  originalDescription: 252,
  parsedDescription: 252,
  sku: 127,
  upc: 127,
  sizeInches: 110,
  manufacturer: 120,
  figureNumber: 127,
  qty: 110,
  skuOnlyWide: 758,
  upcWide: 631,
} as const;

type RowUpdater = (rowId: string, patch: Partial<BomItem>) => void;

function qtyColumn(updateRow: RowUpdater): TableColumnsType<BomItem>[number] {
  return {
    title: 'Qty',
    dataIndex: 'quantity',
    key: 'quantity',
    width: PARSING_REVIEW_COLUMN_WIDTHS.qty,
    render: (v: number, record) => (
      editableTableNumber({
        value: v,
        warnIfEmpty: true,
        onChange: (n) =>
          updateRow(record.id, { quantity: typeof n === 'number' ? n : record.quantity }),
      })
    ),
  };
}

/** Size → Manufacturer → Figure Number (Qty and UPC added per profile). */
function sharedMiddleColumns(updateRow: RowUpdater): TableColumnsType<BomItem> {
  return [
    {
      title: 'Size (inches)',
      dataIndex: 'size',
      key: 'size',
      width: PARSING_REVIEW_COLUMN_WIDTHS.sizeInches,
      render: (v: string, record) => (
        editableTableNumber({
          value: parseSizeInches(v),
          warnIfEmpty: true,
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
          warnIfEmpty: true,
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
          warnIfEmpty: true,
          onChange: (next) => updateRow(record.id, { figureNumber: next }),
        }),
    },
  ];
}

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
        title: 'Parsed Description',
        dataIndex: 'parsedDescription',
        key: 'parsedDescription',
        width: PARSING_REVIEW_COLUMN_WIDTHS.parsedDescription,
        render: (v: string, record) =>
          editableTableText({
            value: v,
            warnIfEmpty: true,
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
            warnIfEmpty: true,
            onChange: (next) => updateRow(record.id, { sku: next }),
          }),
      },
      ...sharedMiddleColumns(updateRow),
      {
        title: 'UPC',
        dataIndex: 'upc',
        key: 'upc',
        width: PARSING_REVIEW_COLUMN_WIDTHS.upc,
        render: (v: string | undefined, record) =>
          editableTableText({
            value: v,
            warnIfEmpty: true,
            onChange: (next) => updateRow(record.id, { upc: next }),
          }),
      },
      qtyColumn(updateRow),
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
            warnIfEmpty: true,
            onChange: (next) => updateRow(record.id, { sku: next }),
          }),
      },
      ...sharedMiddleColumns(updateRow),
      qtyColumn(updateRow),
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
          warnIfEmpty: true,
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
          warnIfEmpty: true,
          onChange: (next) => updateRow(record.id, { sku: next }),
        }),
    },
    ...sharedMiddleColumns(updateRow),
    qtyColumn(updateRow),
  ];
}
