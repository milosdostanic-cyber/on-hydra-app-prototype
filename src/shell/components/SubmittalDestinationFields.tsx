import { PlusOutlined } from '@ant-design/icons';

import type { SubmittalPackage } from '../../submittal/types';
import { Button, Divider, Form, Input, Radio, Space, Typography, theme } from '../../ui/antd';

export type SubmittalDestinationMode = 'existing' | 'new';

export type SubmittalDestinationValue = {
  packageId: string;
  packageName: string;
};

type SubmittalDestinationFieldsProps = {
  packages: SubmittalPackage[];
  mode: SubmittalDestinationMode;
  onModeChange: (mode: SubmittalDestinationMode) => void;
  selectedId: string | null;
  onSelectedIdChange: (id: string) => void;
  newName: string;
  onNewNameChange: (name: string) => void;
};

/**
 * Pick or create a submittal package within a construction project.
 * Shared by {@link ProjectRequiredModal} (step 2) and {@link AddToPackageModal}.
 */
export function SubmittalDestinationFields({
  packages,
  mode,
  onModeChange,
  selectedId,
  onSelectedIdChange,
  newName,
  onNewNameChange,
}: SubmittalDestinationFieldsProps) {
  const { token } = theme.useToken();

  return (
    <>
      {mode === 'existing' && packages.length > 0 ? (
        <Radio.Group
          value={selectedId}
          onChange={(e) => onSelectedIdChange(e.target.value as string)}
          style={{ width: '100%' }}
        >
          <Space orientation="vertical" size={token.marginXS} style={{ width: '100%' }}>
            {packages.map((pkg) => (
              <Radio key={pkg.id} value={pkg.id}>
                {pkg.name}{' '}
                <Typography.Text type="secondary">
                  · {pkg.parts.length} part{pkg.parts.length === 1 ? '' : 's'}
                </Typography.Text>
              </Radio>
            ))}
          </Space>
        </Radio.Group>
      ) : (
        <Form layout="vertical" requiredMark={false}>
          <Form.Item label="New package name">
            <Input
              value={newName}
              onChange={(e) => onNewNameChange(e.target.value)}
              placeholder="e.g. Level 2 Mechanical Room — Submittal Rev 2"
              autoFocus
              maxLength={120}
            />
          </Form.Item>
        </Form>
      )}

      {mode === 'existing' && packages.length > 0 && (
        <>
          <Divider style={{ margin: `${token.marginSM}px 0` }} />
          <Button type="link" icon={<PlusOutlined />} style={{ padding: 0 }} onClick={() => onModeChange('new')}>
            Create a new package instead
          </Button>
        </>
      )}
    </>
  );
}
