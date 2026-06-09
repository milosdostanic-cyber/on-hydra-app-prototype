import { isReadyToConfirmMatch, matchRequiresSkuSelection } from './bomMatchSkuUtils';
import { matchScoreBand } from './data/bomImportFlowSeed';
import type { BomMatchResult } from './data/types';
import { BomTableRowActions, type BomTableRowAction } from './components/BomTableRowActions';
import { BomConfidenceTag, BomManualTag, BomMatchLineStatusTag } from './components/BomTags';
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
  onSkip: (row: BomMatchResult) => void;
  onChoose: (row: BomMatchResult) => void;
  onSelectSku: (row: BomMatchResult) => void;
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
              <Typography.Text type="secondary">Pick a SKU variant to confirm</Typography.Text>
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
      render: (_, row) => <BomMatchLineStatusTag status={row.lineStatus} />,
    },
    {
      title: 'Actions',
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
  if (row.lineStatus === 'accepted' || row.lineStatus === 'skipped') {
    return (
      <BomTableRowActions
        nowrap
        maxVisible={2}
        actions={[
          {
            key: 'change',
            label: 'Choose',
            onClick: () => actions.onChoose(row),
          },
        ]}
      />
    );
  }

  const overflow: BomTableRowAction[] = [];
  let visible: BomTableRowAction[];

  if (!row.topMatch) {
    visible = [
      { key: 'choose', label: 'Choose', onClick: () => actions.onChoose(row) },
      { key: 'skip', label: 'Skip', onClick: () => actions.onSkip(row) },
    ];
  } else if (matchRequiresSkuSelection(row)) {
    visible = [
      { key: 'pick-variant', label: 'Pick variant', onClick: () => actions.onSelectSku(row) },
      { key: 'skip', label: 'Skip', onClick: () => actions.onSkip(row) },
    ];
    overflow.push({
      key: 'choose',
      label: 'Choose',
      onClick: () => actions.onChoose(row),
    });
  } else {
    visible = [
      {
        key: 'confirm',
        label: 'Confirm',
        disabled: !isReadyToConfirmMatch(row),
        onClick: () => actions.onConfirm(row),
      },
      { key: 'skip', label: 'Skip', onClick: () => actions.onSkip(row) },
    ];
    overflow.push({
      key: 'choose',
      label: 'Choose',
      onClick: () => actions.onChoose(row),
    });
  }

  return <BomTableRowActions nowrap maxVisible={2} actions={[...visible, ...overflow]} />;
}
