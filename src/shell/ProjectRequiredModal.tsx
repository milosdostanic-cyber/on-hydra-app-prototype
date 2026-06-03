import { useEffect, useState } from 'react';

import { useActiveProject } from '../context/ActiveProjectContext';
import { Button, Divider, Form, Modal, Select, Space, Typography, theme } from '../ui/antd';

import { ProjectFormFields, formValuesToProjectFields } from './ProjectFormFields';
import type { ProjectFormValues } from './projectSeed';

type ProjectRequiredModalProps = {
  open: boolean;
  /** Short verb for the gated action, e.g. "Download" or "Add to submittal". */
  actionLabel: string;
  /** Optional one-line explanation of why a project is needed. */
  actionDescription?: string;
  /** Called with the resolved project key after the user selects or creates one. */
  onResolved: (projectId: string) => void;
  onCancel: () => void;
};

/**
 * Project gate (PNG flow): when a workflow action is requested without an active Unified
 * Project, the user selects an existing project or creates one. On success the pending
 * action resumes via {@link ProjectRequiredModalProps.onResolved}.
 */
export function ProjectRequiredModal({
  open,
  actionLabel,
  actionDescription,
  onResolved,
  onCancel,
}: ProjectRequiredModalProps) {
  const { token } = theme.useToken();
  const { projects, addProject } = useActiveProject();
  const [mode, setMode] = useState<'select' | 'create'>(projects.length > 0 ? 'select' : 'create');
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) return;
    setMode(projects.length > 0 ? 'select' : 'create');
    setSelectedId(projects[0]?.key);
    form.resetFields();
  }, [open, projects, form]);

  const confirmSelect = () => {
    if (selectedId) onResolved(selectedId);
  };

  const confirmCreate = (values: ProjectFormValues) => {
    const key = addProject(formValuesToProjectFields(values));
    onResolved(key);
  };

  return (
    <Modal
      title={`${actionLabel} needs a project`}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={mode === 'create' ? 960 : 480}
      destroyOnClose
    >
      <Space orientation="vertical" size={token.margin} style={{ width: '100%' }}>
        <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
          {actionDescription ??
            'Workflow actions are organized under a Unified Project. Choose one to continue — we keep your place and finish the action automatically.'}
        </Typography.Paragraph>

        {mode === 'select' ? (
          <>
            <div>
              <Typography.Text
                type="secondary"
                style={{ display: 'block', marginBottom: token.marginXS }}
              >
                Project
              </Typography.Text>
              <Select
                showSearch
                optionFilterProp="label"
                style={{ width: '100%' }}
                placeholder="Select a project"
                value={selectedId}
                onChange={setSelectedId}
                options={projects.map((p) => ({ value: p.key, label: p.name }))}
              />
            </div>
            <Space>
              <Button type="primary" disabled={!selectedId} onClick={confirmSelect}>
                Use this project &amp; {actionLabel.toLowerCase()}
              </Button>
              <Button onClick={onCancel}>Cancel</Button>
            </Space>
            <Divider style={{ margin: 0 }} plain>
              <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                or
              </Typography.Text>
            </Divider>
            <Button type="link" style={{ paddingInline: 0 }} onClick={() => setMode('create')}>
              Create a new project instead
            </Button>
          </>
        ) : (
          <Form
            layout="vertical"
            form={form}
            initialValues={{ country: 'US', contacts: [{}] }}
            onFinish={confirmCreate}
          >
            <ProjectFormFields
              submitLabel={`Create & ${actionLabel.toLowerCase()}`}
              onCancel={projects.length > 0 ? () => setMode('select') : onCancel}
            />
          </Form>
        )}
      </Space>
    </Modal>
  );
}
