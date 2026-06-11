import { PlusOutlined } from '@ant-design/icons';

import { Button, Divider, Form, Input, Radio, Space, Typography, theme } from '../../ui/antd';
import type { BomProject } from '../../bom/data/types';

export type BomDestinationMode = 'existing' | 'new';

export type BomDestinationValue = {
  bomProjectId: string;
  bomProjectName: string;
};

type BomDestinationFieldsProps = {
  boms: BomProject[];
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
  mode,
  onModeChange,
  selectedId,
  onSelectedIdChange,
  newName,
  onNewNameChange,
}: BomDestinationFieldsProps) {
  const { token } = theme.useToken();

  return (
    <>
      {mode === 'existing' && boms.length > 0 ? (
        <Radio.Group
          value={selectedId}
          onChange={(e) => onSelectedIdChange(e.target.value as string)}
          style={{ width: '100%' }}
        >
          <Space orientation="vertical" size={token.marginXS} style={{ width: '100%' }}>
            {boms.map((bom) => (
              <Radio key={bom.id} value={bom.id}>
                {bom.name}{' '}
                <Typography.Text type="secondary">
                  · {bom.items} item{bom.items === 1 ? '' : 's'}
                </Typography.Text>
              </Radio>
            ))}
          </Space>
        </Radio.Group>
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
          <Divider style={{ margin: `${token.marginSM}px 0` }} />
          <Button type="link" icon={<PlusOutlined />} style={{ padding: 0 }} onClick={() => onModeChange('new')}>
            Create a new BOM instead
          </Button>
        </>
      )}
    </>
  );
}
