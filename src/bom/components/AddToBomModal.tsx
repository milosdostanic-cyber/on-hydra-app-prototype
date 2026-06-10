import { BomDestinationFields } from '../../shell/components/BomDestinationFields';
import { useBomDestinationFields } from '../../shell/components/useBomDestinationFields';
import { Modal, Typography, theme } from '../../ui/antd';

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
      okText="Add to BOM"
      okButtonProps={{ disabled: !fields.canSubmit }}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnClose
    >
      {part && (
        <Typography.Paragraph type="secondary" style={{ marginBottom: token.margin }}>
          Adding <Typography.Text strong>{part.displayName}</Typography.Text> (SKU {part.sku}).
        </Typography.Paragraph>
      )}

      <BomDestinationFields
        boms={fields.boms}
        mode={fields.mode}
        onModeChange={fields.setMode}
        selectedId={fields.selectedId}
        onSelectedIdChange={fields.setSelectedId}
        newName={fields.newName}
        onNewNameChange={fields.setNewName}
      />
    </Modal>
  );
}
