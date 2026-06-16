import { MoreOutlined } from '@ant-design/icons';
import { matchRequiresSkuSelection } from './bomMatchSkuUtils';
import {
  reviewCanConfirm,
  summaryTableRowActionLabel,
} from './bomMatchingReviewCtas';
import { matchScoreBand } from './data/bomImportFlowSeed';
import type { BomMatchResult } from './data/types';
import { BomTableRowActions, type BomTableRowAction } from './components/BomTableRowActions';
import { BomConfidenceTag, BomManualTag, BomReviewDisplayStatusTag } from './components/BomTags';
import { Button, Dropdown, Flex, Space, Typography } from '../ui/antd';
import type { MenuProps, TableColumnsType } from '../ui/antd';

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
  onViewOriginal?: (row: BomMatchResult) => void;
  onDelete?: (row: BomMatchResult) => void;
  resolveSubmittalUrl?: (row: BomMatchResult) => string | undefined;
};

type RowNumberLookup = (itemId: string) => number | undefined;

export function buildMatchingResultsColumns(
  rowNumberFor: RowNumberLookup,
  actions: MatchRowActions,
  guidedReviewComplete = false,
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
      render: (_, row) => (
        <MatchActionsCell row={row} actions={actions} guidedReviewComplete={guidedReviewComplete} />
      ),
    },
  ];
}

function MatchActionsCell({
  row,
  actions,
  guidedReviewComplete,
}: {
  row: BomMatchResult;
  actions: MatchRowActions;
  guidedReviewComplete: boolean;
}) {
  const submittalUrl = actions.resolveSubmittalUrl?.(row);
  const isAcceptedAfterGuided = guidedReviewComplete && row.lineStatus === 'accepted';

  const menuItems: MenuProps['items'] = [
    ...(actions.onViewOriginal
      ? [{ key: 'view-original', label: 'View original info', onClick: () => actions.onViewOriginal!(row) }]
      : []),
    ...(submittalUrl
      ? [{ key: 'submittal', label: 'Go to submittal', onClick: () => window.open(submittalUrl, '_blank', 'noopener,noreferrer') }]
      : []),
    // Accepted rows already passed guided review — keep "Change match" available for edge cases,
    // but tucked into the menu so it does not look like a required step.
    ...(isAcceptedAfterGuided
      ? [
          { type: 'divider' as const },
          { key: 'change-match', label: 'Change match', onClick: () => actions.onChoose(row) },
        ]
      : []),
    ...(actions.onDelete
      ? [
          { type: 'divider' as const },
          { key: 'delete', label: 'Delete', danger: true, onClick: () => actions.onDelete!(row) },
        ]
      : []),
  ];

  const moreButton = menuItems.length > 0 ? (
    <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
      <Button size="small" icon={<MoreOutlined />} />
    </Dropdown>
  ) : null;

  // Confirmed / chosen rows are done — Status column already shows the badge,
  // so the actions cell is intentionally quiet (only the overflow menu).
  if (isAcceptedAfterGuided) {
    return moreButton;
  }

  const label = summaryTableRowActionLabel(row);
  if (!label) return moreButton;

  let action: BomTableRowAction;
  if (row.lineStatus === 'skipped') {
    action = { key: 'review', label: 'Resolve', onClick: () => actions.onReview(row) };
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

  return (
    <Flex gap={4} align="center">
      <BomTableRowActions nowrap maxVisible={1} actions={[action]} />
      {moreButton}
    </Flex>
  );
}
