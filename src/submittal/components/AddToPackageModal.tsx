import { useSubmittalPackages } from '../../context/SubmittalPackagesContext';
import { SubmittalDestinationFields } from '../../shell/components/SubmittalDestinationFields';
import { useSubmittalDestinationFields } from '../../shell/components/useSubmittalDestinationFields';
import { Modal, Typography, theme } from '../../ui/antd';

export type AddToPackagePart = {
  partKey: string;
  displayName: string;
  figureNumber: string;
};

type Props = {
  open: boolean;
  projectId: string;
  part: AddToPackagePart | null;
  title?: string;
  /** Fired after the part is added; receives the resolved package id + name for the success toast. */
  onAdded: (info: { packageId: string; packageName: string }) => void;
  onCancel: () => void;
};

/**
 * Pick an existing submittal package or create one on the fly, then add the current part.
 * Used when the active project is already known (skips project selection).
 */
export function AddToPackageModal({
  open,
  projectId,
  part,
  title = 'Add to submittal package',
  onAdded,
  onCancel,
}: Props) {
  const { token } = theme.useToken();
  const { addPartToPackage } = useSubmittalPackages();
  const fields = useSubmittalDestinationFields(projectId);

  const handleOk = () => {
    if (!part) return;
    const dest = fields.resolve();
    if (!dest) return;

    addPartToPackage(dest.packageId, {
      partKey: part.partKey,
      displayName: part.displayName,
      figureNumber: part.figureNumber,
    });
    onAdded(dest);
  };

  return (
    <Modal
      open={open}
      title={title}
      okText="Add to package"
      okButtonProps={{ disabled: !fields.canSubmit }}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnClose
    >
      {part && (
        <Typography.Paragraph type="secondary" style={{ marginBottom: token.margin }}>
          Adding <Typography.Text strong>{part.displayName}</Typography.Text> (Fig. {part.figureNumber}).
        </Typography.Paragraph>
      )}

      <SubmittalDestinationFields
        packages={fields.packages}
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
