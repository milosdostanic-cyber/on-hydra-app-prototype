import { useMemo } from 'react';

import { BomDestinationFields } from '../../shell/components/BomDestinationFields';
import { useBomDestinationFields } from '../../shell/components/useBomDestinationFields';
import { initialWorkspaceRowsForBomProject, useBomWorkspace } from '../../context/BomWorkspaceContext';
import { isSkuInBomRows } from '../../search/catalogBomAdd';
import { Flex, Modal, Space, Typography, theme } from '../../ui/antd';

export type AddToBomPart = {
  partKey: string;
  sku: string;
  displayName: string;
};

type Props = {
  open: boolean;
  projectId: string;
  part: AddToBomPart | null;
  onAdded: (info: { bomProjectId: string; bomProjectName: string }) => void;
  onCancel: () => void;
};

/**
 * Pick an existing BOM project or create one, then confirm adding the part.
 * Used when the active project is already known (skips project selection).
 */
export function AddToBomModal({ open, projectId, part, onAdded, onCancel }: Props) {
  const { token } = theme.useToken();
  const fields = useBomDestinationFields(projectId);
  const { rowsByProjectId } = useBomWorkspace();

  const bomAvailability = useMemo(() => {
    if (!part) return {};
    return fields.boms.reduce<Record<string, { disabled?: boolean; label?: string; description?: string }>>(
      (acc, bom) => {
        const rows = rowsByProjectId[bom.id] ?? initialWorkspaceRowsForBomProject(bom.id);
        if (isSkuInBomRows(rows, part.sku)) {
          acc[bom.id] = {
            disabled: true,
            label: 'Already contains item',
            description: 'Choose another BOM or create a new BOM to add this item elsewhere.',
          };
        }
        return acc;
      },
      {},
    );
  }, [fields.boms, part, rowsByProjectId]);

  const selectedBomAlreadyContainsItem =
    fields.mode === 'existing' && fields.selectedId ? Boolean(bomAvailability[fields.selectedId]?.disabled) : false;

  const handleOk = () => {
    if (!part) return;
    const dest = fields.resolve();
    if (!dest) return;
    onAdded(dest);
  };

  return (
    <Modal
      open={open}
      title="Add to BOM"
      width={token.screenSM}
      okText="Add to BOM"
      okButtonProps={{ disabled: !fields.canSubmit || selectedBomAlreadyContainsItem }}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnClose
    >
      <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
        {part && (
          <Flex
            vertical
            gap={token.marginXXS}
            style={{
              padding: token.padding,
              border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadiusLG,
              background: token.colorFillQuaternary,
            }}
          >
            <Typography.Text type="secondary">Adding</Typography.Text>
            <Typography.Text strong>{part.displayName}</Typography.Text>
            <Typography.Text type="secondary">SKU {part.sku}</Typography.Text>
          </Flex>
        )}

        <BomDestinationFields
          boms={fields.boms}
          bomAvailability={bomAvailability}
          mode={fields.mode}
          onModeChange={fields.setMode}
          selectedId={fields.selectedId}
          onSelectedIdChange={fields.setSelectedId}
          newName={fields.newName}
          onNewNameChange={fields.setNewName}
        />
      </Space>
    </Modal>
  );
}
