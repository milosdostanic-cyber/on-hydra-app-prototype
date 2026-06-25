import { Form, Input, Modal } from '../../ui/antd';
import { addBomProject } from '../data/mockData';
import type { BomProject } from '../data/types';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (project: BomProject) => void;
};

type FormValues = {
  name: string;
  description?: string;
};

export function BomCreateProjectModal({ open, onClose, onCreate }: Props) {
  const [form] = Form.useForm<FormValues>();

  function handleOk() {
    form.validateFields().then((values) => {
      const project = addBomProject(values.name.trim(), values.description?.trim());
      form.resetFields();
      onCreate(project);
    });
  }

  function handleCancel() {
    form.resetFields();
    onClose();
  }

  return (
    <Modal
      title="New BOM project"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Create"
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
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} placeholder="Optional description" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
