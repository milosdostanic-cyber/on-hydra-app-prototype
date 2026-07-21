import { useEffect } from 'react';

import { Form, Input, Modal } from '../../ui/antd';

type Props = {
  open: boolean;
  /** When provided, the modal edits an existing package; otherwise it creates a new one. */
  initialName?: string;
  onSubmit: (name: string) => void;
  onCancel: () => void;
};

type FormValues = { name: string };

/** Create or rename a submittal package (ZIP `PackageCreateEditModal`, name field only). */
export function PackageCreateEditModal({ open, initialName, onSubmit, onCancel }: Props) {
  const [form] = Form.useForm<FormValues>();
  const isEdit = initialName !== undefined;

  useEffect(() => {
    if (open) form.setFieldsValue({ name: initialName ?? '' });
  }, [open, initialName, form]);

  const handleOk = () => {
    form
      .validateFields()
      .then(({ name }) => {
        onSubmit(name.trim());
        form.resetFields();
      })
      .catch(() => undefined);
  };

  return (
    <Modal
      open={open}
      title={isEdit ? 'Rename package' : 'New submittal package'}
      okText={isEdit ? 'Save' : 'Create'}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      destroyOnClose
    >
      <Form form={form} layout="vertical" requiredMark={false} onFinish={handleOk}>
        <Form.Item
          name="name"
          label="Package name"
          rules={[{ required: true, message: 'Enter a package name' }]}
        >
          <Input placeholder="e.g. Level 2 Mechanical Room — Submittal Rev 2" autoFocus maxLength={120} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
