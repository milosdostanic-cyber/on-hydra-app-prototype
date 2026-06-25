import { DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import {
  workspaceAscProductsPath,
  workspaceFigureLinkState,
  workspaceSkuDisplayLabel,
} from './bomWorkspaceDashboard';
import { bomWorkspaceTableColumnWidths } from './data/bomWorkspaceSeed';
import type { BomItem } from './data/types';
import { hydraBaseNormal, hydraTextStyleToReactCss } from '../theme/hydraTypography';
import { Button, InputNumber, Space, Typography } from '../ui/antd';
import type { TableColumnsType } from '../ui/antd';

export type BomWorkspaceRowActions = {
  bomProjectId: string;
  onDelete: (row: BomItem) => void;
  onQuantityChange: (row: BomItem, quantity: number) => void;
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
        <InputNumber
          size="small"
          min={1}
          value={row.quantity}
          onChange={(value) => {
            if (value != null && value >= 1) {
              actions.onQuantityChange(row, value);
            }
          }}
          style={{ width: 72 }}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: bomWorkspaceTableColumnWidths.actions,
      render: (_, row) => (
        <Button
          type="link"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => actions.onDelete(row)}
          style={{ padding: 0 }}
        >
          Delete
        </Button>
      ),
    },
  ];
}
