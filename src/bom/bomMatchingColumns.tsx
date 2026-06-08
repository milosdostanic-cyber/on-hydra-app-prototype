import { matchScoreBand } from './data/bomImportFlowSeed';
import type { BomMatchResult } from './data/types';
import { BomConfidenceTag, BomManualTag, BomMatchLineStatusTag } from './components/BomTags';
import { Button, Flex, Space, Typography, theme } from '../ui/antd';
import type { TableColumnsType } from '../ui/antd';

/** Figma `5026:21449` — Matching results table column widths. */
export const MATCHING_RESULTS_COLUMN_WIDTHS = {
  line: 56,
  originalPart: 401,
  ourPart: 392,
  candidates: 67,
  matchScore: 140,
  status: 101,
  actions: 191,
} as const;

type MatchRowActions = {
  onAccept: (row: BomMatchResult) => void;
  onSkip: (row: BomMatchResult) => void;
  onRefine: (row: BomMatchResult) => void;
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
            <Typography.Text strong>{row.topMatch.partNumber}</Typography.Text>
            <Typography.Text type="secondary">{row.topMatch.description}</Typography.Text>
          </Space>
        ) : (
          <Typography.Text type="secondary">—</Typography.Text>
        ),
    },
    {
      title: 'Candidates',
      key: 'candidates',
      width: MATCHING_RESULTS_COLUMN_WIDTHS.candidates,
      align: 'right',
      render: (_, row) => row.suggestedParts.length,
    },
    {
      title: 'Match score',
      key: 'matchScore',
      width: MATCHING_RESULTS_COLUMN_WIDTHS.matchScore,
      render: (_, row) => {
        if (!row.topMatch) return '—';
        const band = matchScoreBand(row.topMatch.matchConfidence);
        const confTag =
          band === 'processing' ? null : (
            <BomConfidenceTag confidence={band === 'high' ? 'high' : band === 'medium' ? 'medium' : 'low'} />
          );
        return (
          <Flex gap={4} wrap="wrap" align="center">
            {confTag}
            {row.source === 'manual' ? <BomManualTag /> : null}
          </Flex>
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
      render: (_, row) => (
        <MatchActionsCell row={row} actions={actions} />
      ),
    },
  ];
}

const linkButtonStyle = { padding: 0, height: 'auto' } as const;

function MatchActionsCell({
  row,
  actions,
}: {
  row: BomMatchResult;
  actions: MatchRowActions;
}) {
  const { token } = theme.useToken();
  const pendingPickLabel = row.topMatch ? 'Refine' : 'Choose';

  if (row.lineStatus === 'accepted' || row.lineStatus === 'skipped') {
    return (
      <Button
        type="link"
        size="small"
        style={linkButtonStyle}
        onClick={() => actions.onRefine(row)}
      >
        Refine
      </Button>
    );
  }

  return (
    <Flex gap={token.marginXS} wrap="wrap">
      <Button type="link" size="small" style={linkButtonStyle} onClick={() => actions.onAccept(row)}>
        Accept
      </Button>
      <Button type="link" size="small" style={linkButtonStyle} onClick={() => actions.onSkip(row)}>
        Skip
      </Button>
      <Button type="link" size="small" style={linkButtonStyle} onClick={() => actions.onRefine(row)}>
        {pendingPickLabel}
      </Button>
    </Flex>
  );
}
