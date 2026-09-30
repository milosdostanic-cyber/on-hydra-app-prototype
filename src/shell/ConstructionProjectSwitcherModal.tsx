import {
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { bomSitePath, useActiveProject } from '../context/ActiveProjectContext';
import {
  hydraBaseNormal,
  hydraBaseStrong,
  hydraLargeNormal,
  hydraTextStyleToReactCss,
} from '../theme/hydraTypography';
import type { ConstructionProjectInput } from './projectSeed';
import type { ProjectRow } from './projectSeed';
import {
  App,
  Button,
  Dropdown,
  Flex,
  Form,
  Input,
  List,
  Modal,
  Typography,
  message,
  theme,
} from '../ui/antd';
import type { MenuProps } from '../ui/antd';

type ProjectFormValues = {
  name: string;
  address?: string;
  city?: string;
  state?: string;
};

type ConstructionProjectSwitcherModalProps = {
  open: boolean;
  onClose: () => void;
};

export function ConstructionProjectSwitcherModal({ open, onClose }: ConstructionProjectSwitcherModalProps) {
  const { token } = theme.useToken();
  const { modal } = App.useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    projectId,
    projects,
    setProjectId,
    createProject,
    updateProject,
    deleteProject,
  } = useActiveProject();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectRow | null>(null);
  const [form] = Form.useForm<ProjectFormValues>();

  function switchToProject(row: ProjectRow) {
    setProjectId(row.key);
    if (location.pathname === '/bom' || location.pathname.startsWith('/bom/site/')) {
      navigate(bomSitePath(row.key), { replace: true });
    }
    onClose();
  }

  function openCreate() {
    setEditingProject(null);
    form.resetFields();
    setEditorOpen(true);
  }

  function openEdit(row: ProjectRow) {
    setEditingProject(row);
    form.setFieldsValue({
      name: row.name,
      address: row.address === '—' ? '' : row.address,
      city: row.city === '—' ? '' : row.city,
      state: row.state === '—' ? '' : row.state,
    });
    setEditorOpen(true);
  }

  function confirmDelete(row: ProjectRow) {
    modal.confirm({
      title: 'Delete project',
      icon: (
        <ExclamationCircleOutlined style={{ color: token.colorError, fontSize: hydraBaseNormal.fontSize }} />
      ),
      width: 480,
      centered: true,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      content: (
        <Typography.Paragraph style={{ marginTop: token.marginSM, marginBottom: 0 }}>
          Remove <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>{row.name}</Typography.Text> from your list? This demo only updates local
          state.
        </Typography.Paragraph>
      ),
      onOk: () => {
        const wasOnBom = location.pathname === '/bom' || location.pathname.startsWith('/bom/site/');
        const nextActiveId = deleteProject(row.key);
        message.success('Project deleted.');
        if (wasOnBom) navigate(bomSitePath(nextActiveId), { replace: true });
      },
    });
  }

  function rowActionMenu(row: ProjectRow): MenuProps['items'] {
    return [
      {
        key: 'edit',
        label: 'Edit',
        icon: <EditOutlined />,
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
          openEdit(row);
        },
      },
      {
        key: 'delete',
        label: 'Delete',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
          confirmDelete(row);
        },
      },
    ];
  }

  function handleEditorOk() {
    form.validateFields().then((values) => {
      const input: ConstructionProjectInput = {
        name: values.name,
        address: values.address,
        city: values.city,
        state: values.state,
      };
      if (editingProject) {
        updateProject(editingProject.key, input);
        message.success('Project updated.');
      } else {
        const created = createProject(input);
        if (location.pathname === '/bom' || location.pathname.startsWith('/bom/site/')) {
          navigate(bomSitePath(created.key), { replace: true });
        }
        message.success('Project created.');
        onClose();
      }
      form.resetFields();
      setEditorOpen(false);
      setEditingProject(null);
    });
  }

  return (
    <>
      <Modal
        title="Construction projects"
        open={open}
        onCancel={onClose}
        footer={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            New project
          </Button>
        }
        width={520}
        styles={{ body: { padding: 0 } }}
      >
        {projects.length === 0 ? (
          <Flex vertical align="center" style={{ padding: token.paddingLG }} gap={token.marginSM}>
            <Typography.Text type="secondary">No projects yet. Create one to get started.</Typography.Text>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              New project
            </Button>
          </Flex>
        ) : (
          <List<ProjectRow>
            dataSource={projects}
            renderItem={(row) => {
              const isActive = row.key === projectId;
              return (
                <List.Item
                  onClick={() => switchToProject(row)}
                  style={{
                    cursor: 'pointer',
                    paddingInline: token.paddingMD,
                    background: isActive ? token.colorFillAlter : undefined,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) =>
                    !isActive &&
                    ((e.currentTarget as HTMLElement).style.background = token.colorFillTertiary)
                  }
                  onMouseLeave={(e) =>
                    !isActive &&
                    ((e.currentTarget as HTMLElement).style.background = 'transparent')
                  }
                  actions={[
                    <Dropdown
                      key="actions"
                      menu={{ items: rowActionMenu(row) }}
                      trigger={['click']}
                      placement="bottomRight"
                    >
                      <Button
                        type="text"
                        icon={<MoreOutlined />}
                        aria-label={`Actions for ${row.name}`}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Dropdown>,
                  ]}
                >
                  <Flex align="center" justify="space-between" style={{ width: '100%', minWidth: 0 }}>
                    <Flex vertical gap={2} style={{ minWidth: 0, flex: 1 }}>
                      <Typography.Text ellipsis style={hydraTextStyleToReactCss(isActive ? hydraBaseStrong : hydraBaseNormal)}>
                        {row.name}
                      </Typography.Text>
                      <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraLargeNormal)} ellipsis>
                        {row.city}, {row.state} · Last opened {row.lastOpened}
                      </Typography.Text>
                    </Flex>
                    {isActive ? (
                      <CheckOutlined style={{ color: token.colorPrimary, flexShrink: 0, marginLeft: token.marginSM }} />
                    ) : null}
                  </Flex>
                </List.Item>
              );
            }}
          />
        )}
      </Modal>

      <Modal
        title={editingProject ? 'Edit project' : 'New project'}
        open={editorOpen}
        onOk={handleEditorOk}
        onCancel={() => {
          form.resetFields();
          setEditorOpen(false);
          setEditingProject(null);
        }}
        okText={editingProject ? 'Save' : 'Create'}
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
          <Form.Item name="address" label="Address">
            <Input placeholder="Street address" />
          </Form.Item>
          <Form.Item name="city" label="City">
            <Input placeholder="City" />
          </Form.Item>
          <Form.Item name="state" label="State">
            <Input placeholder="State" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
