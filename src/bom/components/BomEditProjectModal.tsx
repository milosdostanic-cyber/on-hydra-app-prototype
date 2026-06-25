import { useEffect } from 'react';

import { Form, Input, Modal } from '../../ui/antd';
import { updateBomProjectName } from '../data/mockData';
import type { BomProject } from '../data/types';

type Props = {
  open: boolean;
  project: BomProject | null;
  onClose: () => void;
  onSave: (project: BomProject) => void;
};

type FormValues = {
  name: string;
};

export function BomEditProjectModal({ open, project, onClose, onSave }: Props) {
  const [form] = Form.useForm<FormValues>();

  useEffect(() => {
    if (open && project) {
      form.setFieldsValue({ name: project.name });
    }
  }, [open, project, form]);

  function handleOk() {
    if (!project) return;
    form.validateFields().then((values) => {
      const trimmed = values.name.trim();
      const updated = updateBomProjectName(project.id, trimmed);
      if (updated) {
        form.resetFields();
        onSave(updated);
      }
    });
  }

  function handleCancel() {
    form.resetFields();
    onClose();
  }

  return (
    <Modal
      title="Edit BOM project"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Save"
      cancelText="Cancel"
      destroyOnClose
    >
      <Form form={form} layout="vertical" requiredMark={false}>
        <Form.Item
          name="name"
          label="Project name"
          rules={[{ required: true, message: 'Project name is required' }]}
        >
          <Input placeholder="e.g. Hospital Wing Renovation" autoFocus />
        </Form.Item>
      </Form>
    </Modal>
  );
}
