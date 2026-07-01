import { PlusOutlined } from '@ant-design/icons';

import { Divider, Flex, Form, Input, Radio, Space, Tag, Typography, theme } from '../../ui/antd';
import type { BomProject } from '../../bom/data/types';

export type BomDestinationMode = 'existing' | 'new';

export type BomDestinationValue = {
  bomProjectId: string;
  bomProjectName: string;
};

type BomDestinationFieldsProps = {
  boms: BomProject[];
  bomAvailability?: Record<string, { disabled?: boolean; label?: string; description?: string }>;
  mode: BomDestinationMode;
  onModeChange: (mode: BomDestinationMode) => void;
  selectedId: string | null;
  onSelectedIdChange: (id: string) => void;
  newName: string;
  onNewNameChange: (name: string) => void;
};

/**
 * Pick or create a BOM within a construction project.
 * Shared by {@link ProjectRequiredModal} (step 2) and {@link AddToBomModal}.
 */
export function BomDestinationFields({
  boms,
  bomAvailability,
  mode,
  onModeChange,
  selectedId,
  onSelectedIdChange,
  newName,
  onNewNameChange,
}: BomDestinationFieldsProps) {
  const { token } = theme.useToken();

  return (
    <Space orientation="vertical" size={token.marginMD} style={{ width: '100%' }}>
      {mode === 'existing' && boms.length > 0 ? (
        <Space orientation="vertical" size={token.marginSM} style={{ width: '100%' }}>
          <Typography.Text strong>Select BOM</Typography.Text>
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
                {boms.map((bom, index) => {
                  const availability = bomAvailability?.[bom.id];
                  const selected = selectedId === bom.id;
                  return (
                    <Radio
                      key={bom.id}
                      value={bom.id}
                      disabled={availability?.disabled}
                      style={{
                        width: '100%',
                        margin: 0,
                        padding: token.paddingSM,
                        borderBottom:
                          index === boms.length - 1
                            ? undefined
                            : `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                        background: selected ? token.colorFillQuaternary : token.colorBgContainer,
                      }}
                    >
                      <Flex align="center" justify="space-between" gap={token.marginMD} style={{ width: '100%' }}>
                        <Flex vertical gap={token.marginXXS} style={{ minWidth: 0 }}>
                          <Space size={token.marginXS} wrap>
                            <Typography.Text strong ellipsis>
                              {bom.name}
                            </Typography.Text>
                            {availability?.label ? <Tag color="warning">{availability.label}</Tag> : null}
                          </Space>
                          {availability?.description ? (
                            <Typography.Text type="secondary">{availability.description}</Typography.Text>
                          ) : null}
                        </Flex>
                        <Typography.Text type="secondary" style={{ whiteSpace: 'nowrap' }}>
                          {bom.items} item{bom.items === 1 ? '' : 's'}
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
          <Form.Item label="New BOM project name">
            <Input
              value={newName}
              onChange={(e) => onNewNameChange(e.target.value)}
              placeholder="e.g. Level 2 Mechanical — BOM Rev 1"
              autoFocus
              maxLength={120}
            />
          </Form.Item>
        </Form>
      )}

      {mode === 'existing' && boms.length > 0 && (
        <>
          <Divider style={{ margin: 0 }} />
          <Typography.Link onClick={() => onModeChange('new')}>
            <Space size={token.marginXS}>
              <PlusOutlined />
              <span>Create a new BOM instead</span>
            </Space>
          </Typography.Link>
        </>
      )}
    </Space>
  );
}
