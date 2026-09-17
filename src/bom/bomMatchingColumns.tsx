import { MoreOutlined } from '@ant-design/icons';
import { matchRequiresSkuSelection, figureLevelMatchTableHint, resolveFigureNumber } from './bomMatchSkuUtils';
import {
  reviewCanConfirm,
  summaryTableRowActionLabel,
} from './bomMatchingReviewCtas';
import { matchScoreBand } from './data/bomImportFlowSeed';
import type { BomMatchResult } from './data/types';
import { BomAscFigureLink } from './components/BomAscFigureLink';
import { BomTableRowActions, type BomTableRowAction } from './components/BomTableRowActions';
import { BomConfidenceTag, BomManualTag, BomMatchLevelTag, BomReviewDisplayStatusTag } from './components/BomTags';
import { Button, Dropdown, Flex, Space, Typography } from '../ui/antd';
import type { MenuProps, TableColumnsType } from '../ui/antd';
import { hydraBaseStrong, hydraTextStyleToReactCss } from '../theme/hydraTypography';

/** Figma `5026:21449` — Matching results table column widths. */
export const MATCHING_RESULTS_COLUMN_WIDTHS = {
  line: 56,
  originalPart: 280,
  ourPart: 392,
  matchScore: 120,
  status: 210,
  actions: 168,
} as const;

type MatchRowActions = {
  bomProjectId: string;
  onConfirm: (row: BomMatchResult) => void;
  onChoose: (row: BomMatchResult) => void;
  onSelectSku: (row: BomMatchResult) => void;
  onReview: (row: BomMatchResult) => void;
  onDelete?: (row: BomMatchResult) => void;
  resolveSubmittalUrl?: (row: BomMatchResult) => string | undefined;
};

type RowNumberLookup = (itemId: string) => number | undefined;

function ourPartSkuLabel(row: BomMatchResult): string | undefined {
  if (!row.topMatch || matchRequiresSkuSelection(row)) return undefined;
  const sku = row.topMatch.partNumber?.trim();
  if (!sku) return undefined;
  const figure = resolveFigureNumber(row)?.trim();
  if (figure && sku === figure) return undefined;
  return sku;
}

function OurPartCell({ row, bomProjectId }: { row: BomMatchResult; bomProjectId: string }) {
  const needsSku = matchRequiresSkuSelection(row);
  const figureRef = resolveFigureNumber(row);
  const sku = ourPartSkuLabel(row);

  return (
    <Space orientation="vertical" size={0}>
      {figureRef ? (
        <BomAscFigureLink bomProjectId={bomProjectId} figureNumber={figureRef} prefix="Fig. " />
      ) : null}
      {sku ? (
        <Typography.Text>
          <Typography.Text type="secondary">SKU </Typography.Text>
          <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>{sku}</Typography.Text>
        </Typography.Text>
      ) : null}
      {row.topMatch?.description ? (
        <Typography.Text type="secondary">{row.topMatch.description}</Typography.Text>
      ) : null}
      {needsSku ? (
        <>
          <BomMatchLevelTag level="figure" />
          <Typography.Text type="secondary">{figureLevelMatchTableHint()}</Typography.Text>
        </>
      ) : null}
    </Space>
  );
}

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
          <OurPartCell row={row} bomProjectId={actions.bomProjectId} />
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
      render: (_, row) => (
        <span style={{ whiteSpace: 'nowrap' }}>
          <BomReviewDisplayStatusTag row={row} />
        </span>
      ),
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
    ...(submittalUrl
      ? [{ key: 'submittal', label: 'Go to submittal', onClick: () => window.open(submittalUrl, '_blank', 'noopener,noreferrer') }]
      : []),
    ...(actions.onDelete
      ? [
          ...(submittalUrl ? [{ type: 'divider' as const }] : []),
          { key: 'delete', label: 'Delete', danger: true, onClick: () => actions.onDelete!(row) },
        ]
      : []),
  ];

  const moreButton = menuItems.length > 0 ? (
    <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
      <Button size="small" icon={<MoreOutlined />} onClick={(e) => e.stopPropagation()} />
    </Dropdown>
  ) : null;

  const inlineAction = (action: BomTableRowAction) => (
    <Flex gap={4} align="center">
      <BomTableRowActions nowrap maxVisible={1} actions={[action]} />
      {moreButton}
    </Flex>
  );

  // Accepted after guided review — row click opens detail drawer; inline change + overflow for secondary items.
  if (isAcceptedAfterGuided) {
    return inlineAction({ key: 'change', label: 'Change match', onClick: () => actions.onChoose(row) });
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

  return inlineAction(action);
}
