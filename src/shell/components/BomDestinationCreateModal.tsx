import { useEffect, useState } from 'react';

import { Form, Input, Modal, theme } from '../../ui/antd';

type Props = {
  open: boolean;
  onCancel: () => void;
  onCreated: (name: string) => void;
};

/** Nested modal — name a new BOM, then return to the destination picker. */
export function BomDestinationCreateModal({ open, onCancel, onCreated }: Props) {
  const { token } = theme.useToken();
  const [name, setName] = useState('');

  useEffect(() => {
    if (!open) return;
    setName('');
  }, [open]);

  const trimmed = name.trim();
  const canSubmit = trimmed.length > 0;

  return (
    <Modal
      title="Create a new BOM"
      open={open}
      okText="Create BOM"
      okButtonProps={{ disabled: !canSubmit }}
      onOk={() => {
        if (!canSubmit) return;
        onCreated(trimmed);
      }}
      onCancel={onCancel}
      destroyOnClose
      width={token.screenSM}
    >
      <Form layout="vertical" requiredMark={false}>
        <Form.Item label="BOM name">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Level 2 Mechanical — BOM Rev 1"
            autoFocus
            maxLength={120}
            onPressEnter={() => {
              if (canSubmit) onCreated(trimmed);
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
