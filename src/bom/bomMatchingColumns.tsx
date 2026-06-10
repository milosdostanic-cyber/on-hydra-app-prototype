import { matchRequiresSkuSelection } from './bomMatchSkuUtils';
import {
  reviewCanConfirm,
  summaryTableRowActionLabel,
} from './bomMatchingReviewCtas';
import { matchScoreBand } from './data/bomImportFlowSeed';
import type { BomMatchResult } from './data/types';
import { BomTableRowActions, type BomTableRowAction } from './components/BomTableRowActions';
import { BomConfidenceTag, BomManualTag, BomReviewDisplayStatusTag } from './components/BomTags';
import { Space, Typography } from '../ui/antd';
import type { TableColumnsType } from '../ui/antd';

/** Figma `5026:21449` — Matching results table column widths. */
export const MATCHING_RESULTS_COLUMN_WIDTHS = {
  line: 56,
  originalPart: 401,
  ourPart: 392,
  matchScore: 120,
  status: 101,
  actions: 168,
} as const;

type MatchRowActions = {
  onConfirm: (row: BomMatchResult) => void;
  onChoose: (row: BomMatchResult) => void;
  onSelectSku: (row: BomMatchResult) => void;
  onReview: (row: BomMatchResult) => void;
};

type RowNumberLookup = (itemId: string) => number | undefined;

export function buildMatchingResultsColumns(
  rowNumberFor: RowNumberLookup,
  actions: MatchRowActions,
): TableColumnsType<BomMatchResult> {
  return [
    {
      title: 'Line',
      key: 'line',
      width: MATCHING_RESULTS_COLUMN_WIDTHS.line,
      render: (_, row) => rowNumberFor(row.itemId) ?? '—',
    },
    {
      title: 'Original part',
      dataIndex: 'originalRequest',
      key: 'originalRequest',
      width: MATCHING_RESULTS_COLUMN_WIDTHS.originalPart,
      ellipsis: true,
    },
    {
      title: 'Our Part',
      key: 'ourPart',
      width: MATCHING_RESULTS_COLUMN_WIDTHS.ourPart,
      render: (_, row) =>
        row.topMatch ? (
          <Space orientation="vertical" size={0}>
            {row.figureNumber ? (
              <Typography.Text type="secondary">Fig. {row.figureNumber}</Typography.Text>
            ) : null}
            <Typography.Text strong>
              {matchRequiresSkuSelection(row)
                ? `${row.topMatch.partNumber} (figure)`
                : row.topMatch.partNumber}
            </Typography.Text>
            <Typography.Text type="secondary">{row.topMatch.description}</Typography.Text>
            {matchRequiresSkuSelection(row) ? (
              <Typography.Text type="secondary">Select a SKU variant to confirm</Typography.Text>
            ) : null}
          </Space>
        ) : (
          <Typography.Text type="secondary">—</Typography.Text>
        ),
    },
    {
      title: 'Match score',
      key: 'matchScore',
      width: MATCHING_RESULTS_COLUMN_WIDTHS.matchScore,
      render: (_, row) => {
        if (!row.topMatch) return '—';
        if (row.source === 'manual') return <BomManualTag />;
        const band = matchScoreBand(row.topMatch.matchConfidence);
        if (band === 'processing') return '—';
        return (
          <BomConfidenceTag
            confidence={band === 'high' ? 'high' : band === 'medium' ? 'medium' : 'low'}
            percent={row.topMatch.matchConfidence}
          />
        );
      },
    },
    {
      title: 'Status',
      key: 'status',
      width: MATCHING_RESULTS_COLUMN_WIDTHS.status,
      render: (_, row) => <BomReviewDisplayStatusTag row={row} />,
    },
    {
      title: 'Action',
      key: 'actions',
      width: MATCHING_RESULTS_COLUMN_WIDTHS.actions,
      render: (_, row) => <MatchActionsCell row={row} actions={actions} />,
    },
  ];
}

function MatchActionsCell({
  row,
  actions,
}: {
  row: BomMatchResult;
  actions: MatchRowActions;
}) {
  const label = summaryTableRowActionLabel(row);
  if (!label) return null;

  let action: BomTableRowAction;
  if (row.lineStatus === 'skipped') {
    action = { key: 'review', label, onClick: () => actions.onReview(row) };
  } else if (!row.topMatch) {
    action = { key: 'choose', label, onClick: () => actions.onChoose(row) };
  } else if (matchRequiresSkuSelection(row)) {
    action = { key: 'select-sku', label, onClick: () => actions.onSelectSku(row) };
  } else if (row.lineStatus === 'accepted') {
    action = { key: 'change', label, onClick: () => actions.onChoose(row) };
  } else {
    action = {
      key: 'confirm',
      label,
      disabled: !reviewCanConfirm(row),
      onClick: () => actions.onConfirm(row),
    };
  }

  return <BomTableRowActions nowrap maxVisible={1} actions={[action]} />;
}
