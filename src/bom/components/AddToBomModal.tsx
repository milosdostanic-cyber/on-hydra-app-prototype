import { PlusOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';

import { addBomProject, mockBomProjects } from '../data/mockData';
import { Button, Divider, Form, Input, Modal, Radio, Space, Typography, theme } from '../../ui/antd';
import type { BomProject } from '../data/types';

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

type Mode = 'existing' | 'new';

/**
 * Pick an existing BOM project or create one, then confirm adding the part.
 * Same pick-or-create pattern as {@link AddToPackageModal} — not a separate modal system.
 */
export function AddToBomModal({ open, projectId, part, onAdded, onCancel }: Props) {
  const { token } = theme.useToken();
  const boms = useMemo(
    () => mockBomProjects.filter((p) => p.projectId === projectId),
    [projectId],
  );

  const [mode, setMode] = useState<Mode>('existing');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (!open) return;
    if (boms.length > 0) {
      setMode('existing');
      setSelectedId(boms[0].id);
    } else {
      setMode('new');
      setSelectedId(null);
    }
    setNewName('');
  }, [open, boms]);

  const canSubmit = mode === 'existing' ? Boolean(selectedId) : newName.trim().length > 0;

  const handleOk = () => {
    if (!part) return;
    let bomProjectId = selectedId;
    let bomProjectName = boms.find((p) => p.id === selectedId)?.name ?? '';

    if (mode === 'new') {
      const trimmed = newName.trim();
      if (!trimmed) return;
      const created: BomProject = addBomProject(projectId, trimmed);
      bomProjectId = created.id;
      bomProjectName = created.name;
    }
    if (!bomProjectId) return;

    onAdded({ bomProjectId, bomProjectName });
  };

  return (
    <Modal
      open={open}
      title="Add to BOM"
      okText="Add to BOM"
      okButtonProps={{ disabled: !canSubmit }}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnClose
    >
      {part && (
        <Typography.Paragraph type="secondary" style={{ marginBottom: token.margin }}>
          Adding <Typography.Text strong>{part.displayName}</Typography.Text> (SKU {part.sku}).
        </Typography.Paragraph>
      )}

      {boms.length > 0 && (
        <Radio.Group
          value={mode}
          onChange={(e) => setMode(e.target.value as Mode)}
          style={{ marginBottom: token.margin }}
        >
          <Radio.Button value="existing">Existing BOM</Radio.Button>
          <Radio.Button value="new">New BOM</Radio.Button>
        </Radio.Group>
      )}

      {mode === 'existing' && boms.length > 0 ? (
        <Radio.Group
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value as string)}
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
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Level 2 Mechanical — BOM Rev 1"
              autoFocus
              maxLength={120}
              onPressEnter={handleOk}
            />
          </Form.Item>
        </Form>
      )}

      {mode === 'existing' && boms.length > 0 && (
        <>
          <Divider style={{ margin: `${token.marginSM}px 0` }} />
          <Button type="link" icon={<PlusOutlined />} style={{ padding: 0 }} onClick={() => setMode('new')}>
            Create a new BOM instead
          </Button>
        </>
      )}
    </Modal>
  );
}
