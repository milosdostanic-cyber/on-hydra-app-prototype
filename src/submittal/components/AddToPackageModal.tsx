import { useMemo } from 'react';

import { useSubmittalPackages } from '../../context/SubmittalPackagesContext';
import { SubmittalDestinationFields } from '../../shell/components/SubmittalDestinationFields';
import { useSubmittalDestinationFields } from '../../shell/components/useSubmittalDestinationFields';
import { Flex, Modal, Space, Typography, theme } from '../../ui/antd';

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

  const packageAvailability = useMemo(() => {
    if (!part) return {};
    return fields.packages.reduce<Record<string, { disabled?: boolean; label?: string; description?: string }>>(
      (acc, pkg) => {
        if (pkg.parts.some((existing) => existing.partKey === part.partKey)) {
          acc[pkg.id] = {
            disabled: true,
            label: 'Already contains item',
            description: 'Choose another package or create a new package to add this item elsewhere.',
          };
        }
        return acc;
      },
      {},
    );
  }, [fields.packages, part]);

  const selectedPackageAlreadyContainsItem =
    fields.mode === 'existing' && fields.selectedId ? Boolean(packageAvailability[fields.selectedId]?.disabled) : false;

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
      okButtonProps={{ disabled: !fields.canSubmit || selectedPackageAlreadyContainsItem }}
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
            <Typography.Text type="secondary">Figure {part.figureNumber}</Typography.Text>
          </Flex>
        )}

        <SubmittalDestinationFields
          packages={fields.packages}
          packageAvailability={packageAvailability}
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
