import type { BomItem } from '../data/types';
import { workspaceQuantityLabel } from '../bomWorkspaceDashboard';
import { BomConfidenceTag } from './BomTags';
import {
  hydraBaseNormal,
  hydraSmallNormal,
  hydraTextStyleToReactCss,
} from '../../theme/hydraTypography';
import { Descriptions, Drawer, Space, Typography, theme } from '../../ui/antd';

type BomWorkspaceImportDetailDrawerProps = {
  open: boolean;
  row: BomItem | null;
  onClose: () => void;
};

export function BomWorkspaceImportDetailDrawer({
  open,
  row,
  onClose,
}: BomWorkspaceImportDetailDrawerProps) {
  const { token } = theme.useToken();
  if (!row) return null;

  return (
    <Drawer
      title="Original import data"
      open={open}
      onClose={onClose}
      width={480}
      destroyOnClose
    >
      <Space orientation="vertical" size={token.marginMD} style={{ width: '100%' }}>
        <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraSmallNormal)}>
          Data from your uploaded BOM file. ASC match details stay in the main table.
        </Typography.Text>

        <Descriptions bordered size="small" column={1}>
          {row.importedRowNumber != null ? (
            <Descriptions.Item label="Import row">{row.importedRowNumber}</Descriptions.Item>
          ) : null}
          <Descriptions.Item label="Original line">{row.originalInput || '—'}</Descriptions.Item>
          <Descriptions.Item label="Parsed description">
            {row.importedDescription?.trim() || '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Manufacturer">{row.manufacturer?.trim() || '—'}</Descriptions.Item>
          <Descriptions.Item label="UPC / barcode">{row.upc?.trim() || '—'}</Descriptions.Item>
          <Descriptions.Item label="Original quantity">{workspaceQuantityLabel(row)}</Descriptions.Item>
          <Descriptions.Item label="Size">{row.size?.trim() || '—'}</Descriptions.Item>
          <Descriptions.Item label="Pressure class">{row.pressureClass?.trim() || '—'}</Descriptions.Item>
          <Descriptions.Item label="Connection">{row.connectionType?.trim() || '—'}</Descriptions.Item>
          <Descriptions.Item label="Import confidence">
            <BomConfidenceTag confidence={row.confidence} showIcon />
          </Descriptions.Item>
        </Descriptions>

        <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
          Fields above were used during parsing and matching. The selected ASC figure and SKU in the
          workspace table reflect your confirmed match.
        </Typography.Text>
      </Space>
    </Drawer>
  );
}
