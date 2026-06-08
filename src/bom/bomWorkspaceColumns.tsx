import { FilePdfOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import {
  resolveWorkspaceSubmittalUrl,
  workspaceAscProductsPath,
  workspaceFigureLinkState,
  workspaceQuantityLabel,
  workspaceRowReviewStatus,
  workspaceSkuDisplayLabel,
} from './bomWorkspaceDashboard';
import { bomWorkspaceTableColumnWidths } from './data/bomWorkspaceSeed';
import { BomConfidenceTag, BomManualTag, BomMatchStatusTag } from './components/BomTags';
import type { BomItem } from './data/types';
import { hydraBaseNormal, hydraTextStyleToReactCss } from '../theme/hydraTypography';
import { Button, Flex, Space, Typography, theme } from '../ui/antd';
import type { TableColumnsType } from '../ui/antd';

export type BomWorkspaceRowActions = {
  bomProjectId: string;
  onViewOriginal: (row: BomItem) => void;
  onReview: (row: BomItem) => void;
  onDelete: (row: BomItem) => void;
  isConfirmed: (row: BomItem) => boolean;
};

function FigureLink({ row, bomProjectId }: { row: BomItem; bomProjectId: string }) {
  const navigate = useNavigate();
  const figure = row.figureNumber?.trim();
  if (!figure) return <Typography.Text type="secondary">—</Typography.Text>;

  return (
    <Typography.Link
      onClick={(e) => {
        e.preventDefault();
        navigate(workspaceAscProductsPath(bomProjectId), {
          state: workspaceFigureLinkState(figure),
        });
      }}
    >
      {figure}
    </Typography.Link>
  );
}

function SubmittalLink({ row }: { row: BomItem }) {
  const url = resolveWorkspaceSubmittalUrl(row);
  if (!url) return null;

  return (
    <Typography.Link href={url} target="_blank" rel="noopener noreferrer">
      <FilePdfOutlined aria-hidden /> Submittal
    </Typography.Link>
  );
}

export function buildBomWorkspaceColumns(actions: BomWorkspaceRowActions): TableColumnsType<BomItem> {
  return [
    {
      title: '#',
      dataIndex: 'rowNumber',
      key: 'rowNumber',
      width: bomWorkspaceTableColumnWidths.rowNumber,
    },
    {
      title: 'SKU / variant',
      key: 'skuVariant',
      width: bomWorkspaceTableColumnWidths.skuVariant,
      ellipsis: true,
      render: (_, row) => (
        <Space orientation="vertical" size={0}>
          <Typography.Text strong>{workspaceSkuDisplayLabel(row)}</Typography.Text>
          <Typography.Text type="secondary" ellipsis style={hydraTextStyleToReactCss(hydraBaseNormal)}>
            {row.parsedDescription || row.variantLabel || '—'}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Figure',
      key: 'figureNumber',
      width: bomWorkspaceTableColumnWidths.figureNumber,
      render: (_, row) => <FigureLink row={row} bomProjectId={actions.bomProjectId} />,
    },
    {
      title: 'Qty',
      key: 'quantity',
      width: bomWorkspaceTableColumnWidths.quantity,
      render: (_, row) => (
        <Typography.Text style={hydraTextStyleToReactCss(hydraBaseNormal)}>
          {workspaceQuantityLabel(row)}
        </Typography.Text>
      ),
    },
    {
      title: 'Match',
      key: 'match',
      width: bomWorkspaceTableColumnWidths.match,
      render: (_, row) => (
        <Flex gap={4} wrap="wrap" align="center">
          <BomConfidenceTag confidence={row.confidence} />
          {row.matchSource === 'manual' ? <BomManualTag /> : null}
        </Flex>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: bomWorkspaceTableColumnWidths.status,
      render: (_, row) => <BomMatchStatusTag status={workspaceRowReviewStatus(row)} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: bomWorkspaceTableColumnWidths.actions,
      render: (_, row) => <WorkspaceActionsCell row={row} actions={actions} />,
    },
  ];
}

function WorkspaceActionsCell({
  row,
  actions,
}: {
  row: BomItem;
  actions: BomWorkspaceRowActions;
}) {
  const { token } = theme.useToken();
  const linkButtonStyle = { padding: 0, height: 'auto' } as const;

  return (
    <Flex gap={token.marginXS} wrap="wrap" align="center">
      <Button
        type="link"
        size="small"
        style={linkButtonStyle}
        onClick={() => actions.onViewOriginal(row)}
      >
        Original
      </Button>
      <SubmittalLink row={row} />
      {!actions.isConfirmed(row) ? (
        <Button
          type="link"
          size="small"
          style={linkButtonStyle}
          onClick={() => actions.onReview(row)}
        >
          Review
        </Button>
      ) : null}
      <Button
        type="link"
        size="small"
        danger
        style={linkButtonStyle}
        onClick={() => actions.onDelete(row)}
      >
        Delete
      </Button>
    </Flex>
  );
}
