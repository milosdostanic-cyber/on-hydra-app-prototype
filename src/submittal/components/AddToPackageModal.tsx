import { useSubmittalPackages } from '../../context/SubmittalPackagesContext';
import { SubmittalDestinationFields } from '../../shell/components/SubmittalDestinationFields';
import { useSubmittalDestinationFields } from '../../shell/components/useSubmittalDestinationFields';
import { Flex, Modal, Space, Typography, theme } from '../../ui/antd';
import { hydraBaseStrong, hydraTextStyleToReactCss } from '../../theme/hydraTypography';

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
      width={token.screenSM}
      okText="Add to package"
      okButtonProps={{ disabled: !fields.canSubmit }}
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
            <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>{part.displayName}</Typography.Text>
            <Typography.Text type="secondary">Figure {part.figureNumber}</Typography.Text>
          </Flex>
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
      </Space>
    </Modal>
  );
}
