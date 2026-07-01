import { PlusOutlined } from '@ant-design/icons';

import type { SubmittalPackage } from '../../submittal/types';
import { Divider, Flex, Form, Input, Radio, Space, Tag, Typography, theme } from '../../ui/antd';

export type SubmittalDestinationMode = 'existing' | 'new';

export type SubmittalDestinationValue = {
  packageId: string;
  packageName: string;
};

type SubmittalDestinationFieldsProps = {
  packages: SubmittalPackage[];
  packageAvailability?: Record<string, { disabled?: boolean; label?: string; description?: string }>;
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
  packageAvailability,
  mode,
  onModeChange,
  selectedId,
  onSelectedIdChange,
  newName,
  onNewNameChange,
}: SubmittalDestinationFieldsProps) {
  const { token } = theme.useToken();

  return (
    <Space orientation="vertical" size={token.marginMD} style={{ width: '100%' }}>
      {mode === 'existing' && packages.length > 0 ? (
        <Space orientation="vertical" size={token.marginSM} style={{ width: '100%' }}>
          <Typography.Text strong>Select Submittal Package</Typography.Text>
          <div
            style={{
              maxHeight: token.controlHeightLG * 8,
              overflowY: 'auto',
              border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadiusLG,
              background: token.colorBgContainer,
            }}
          >
            <Radio.Group
              value={selectedId}
              onChange={(e) => onSelectedIdChange(e.target.value as string)}
              style={{ width: '100%' }}
            >
              <Space orientation="vertical" size={0} style={{ width: '100%' }}>
                {packages.map((pkg, index) => {
                  const availability = packageAvailability?.[pkg.id];
                  const selected = selectedId === pkg.id;
                  return (
                    <Radio
                      key={pkg.id}
                      value={pkg.id}
                      disabled={availability?.disabled}
                      style={{
                        width: '100%',
                        margin: 0,
                        padding: token.paddingSM,
                        borderBottom:
                          index === packages.length - 1
                            ? undefined
                            : `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                        background: selected ? token.colorFillQuaternary : token.colorBgContainer,
                      }}
                    >
                      <Flex align="center" justify="space-between" gap={token.marginMD} style={{ width: '100%' }}>
                        <Flex vertical gap={token.marginXXS} style={{ minWidth: 0 }}>
                          <Space size={token.marginXS} wrap>
                            <Typography.Text strong ellipsis>
                              {pkg.name}
                            </Typography.Text>
                            {availability?.label ? <Tag color="warning">{availability.label}</Tag> : null}
                          </Space>
                          {availability?.description ? (
                            <Typography.Text type="secondary">{availability.description}</Typography.Text>
                          ) : null}
                        </Flex>
                        <Typography.Text type="secondary" style={{ whiteSpace: 'nowrap' }}>
                          {pkg.parts.length} part{pkg.parts.length === 1 ? '' : 's'}
                        </Typography.Text>
                      </Flex>
                    </Radio>
                  );
                })}
              </Space>
            </Radio.Group>
          </div>
        </Space>
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
          <Divider style={{ margin: 0 }} />
          <Typography.Link onClick={() => onModeChange('new')}>
            <Space size={token.marginXS}>
              <PlusOutlined />
              <span>Create a new package instead</span>
            </Space>
          </Typography.Link>
        </>
      )}
    </Space>
  );
}
