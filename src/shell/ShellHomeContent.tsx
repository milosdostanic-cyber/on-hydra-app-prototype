import { GlobalOutlined, PlusOutlined, StarFilled, StarOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  AppSearchInput,
  Button,
  Card,
  Empty,
  Flex,
  Form,
  Input,
  Modal,
  Pagination,
  Space,
  Table,
  Tabs,
  Typography,
  theme,
} from '../ui/antd';
import type { TableColumnsType, TabsProps } from '../ui/antd';

import { shellLayout } from '../theme/hydraAlias';
import { hydraBaseStrong } from '../theme/hydraTypography';
import { PROJECT_SEED_ROWS, type ProjectRow } from './projectSeed';
import { ProjectDetailDrawer } from './ProjectDetailDrawer';

/** Projects shell view — spacing, color, and radii from `theme.useToken()` only. */
export function ShellHomeContent() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const [tab, setTab] = useState<string>('all');
  const [starredKeys, setStarredKeys] = useState<Set<string>>(() => new Set(['1', '3']));
  const [rows, setRows] = useState<ProjectRow[]>(() => [...PROJECT_SEED_ROWS]);
  const [projectsPage, setProjectsPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm] = Form.useForm();
  const [drawerProject, setDrawerProject] = useState<ProjectRow | null>(null);

  const toggleStar = (key: string) => {
    setStarredKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const filteredRows = useMemo(() => {
    let list = rows;
    if (tab === 'recent') list = list.filter((r) => r.recent);
    if (tab === 'starred') list = list.filter((r) => starredKeys.has(r.key));
    const q = searchText.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.address.toLowerCase().includes(q) ||
          r.city.toLowerCase().includes(q) ||
          r.state.toLowerCase().includes(q),
      );
    }
    return list.map((r) => ({ ...r, starred: starredKeys.has(r.key) }));
  }, [rows, tab, starredKeys, searchText]);

  useEffect(() => {
    setProjectsPage(1);
  }, [tab, searchText, filteredRows.length]);

  const pagedProjectRows = useMemo(() => {
    const start = (projectsPage - 1) * shellLayout.tablePageSizeDefault;
    return filteredRows.slice(start, start + shellLayout.tablePageSizeDefault);
  }, [filteredRows, projectsPage]);

  const tabItems: TabsProps['items'] = [
    { key: 'all', label: 'All' },
    { key: 'recent', label: 'Recent' },
    { key: 'starred', label: 'Starred' },
  ];

  const columns: TableColumnsType<ProjectRow & { starred: boolean }> = [
    {
      key: 'star',
      width: token.controlHeightLG,
      align: 'center',
      render: (_, record) => (
        <Button
          type="text"
          icon={
            record.starred ? (
              <StarFilled style={{ color: token.colorWarning }} />
            ) : (
              <StarOutlined style={{ color: token.colorTextSecondary }} />
            )
          }
          onClick={(e) => {
            e.stopPropagation();
            toggleStar(record.key);
          }}
          aria-label={record.starred ? 'Remove star' : 'Star project'}
        />
      ),
    },
    {
      title: 'Project Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Typography.Text strong>{name}</Typography.Text>,
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      width: token.controlHeightSM * 2,
    },
    {
      title: 'Last Opened',
      dataIndex: 'lastOpened',
      key: 'lastOpened',
      align: 'right',
    },
  ];

  const hasAnyProjects = rows.length > 0;
  const showEmpty = !hasAnyProjects;
  const showNoMatches = hasAnyProjects && filteredRows.length === 0;
  const starredEmpty = tab === 'starred' && hasAnyProjects && filteredRows.length === 0 && searchText.trim() === '';

  const listPanelStyle = {
    background: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowTertiary,
    overflow: 'hidden' as const,
  };

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <Flex justify="space-between" align="flex-start" wrap="wrap" gap={token.margin}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Projects
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ margin: `${token.marginXXS}px 0 0`, maxWidth: 720 }}>
            Pick a job site, then open Spec, Submittal, Content, or BOM from the slide-in. You can browse the catalog
            anytime without a project.
          </Typography.Paragraph>
        </div>
        <Flex gap={token.marginSM} wrap="wrap" style={{ flexShrink: 0 }}>
          <Button type="default" size="large" icon={<GlobalOutlined />} onClick={() => navigate('/catalog')}>
            Browse catalog
          </Button>
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            Create project
          </Button>
        </Flex>
      </Flex>

      <Card styles={{ body: { padding: 0 } }} style={listPanelStyle}>
        <div style={{ padding: token.paddingLG, paddingBottom: token.paddingMD }}>
          <AppSearchInput
            allowClear
            placeholder="Search by name, address, city, or state…"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: '100%', marginBottom: token.marginMD }}
          />
          <Tabs activeKey={tab} items={tabItems} onChange={setTab} />
        </div>

      {showEmpty ? (
        <div style={{ padding: `${token.paddingLG * 2}px ${token.paddingLG}px` }}>
          <Empty
            description={
              <Space orientation="vertical" size={token.marginXS}>
                <Typography.Text strong>No projects found</Typography.Text>
                <Typography.Text type="secondary">Create your first project to get started.</Typography.Text>
              </Space>
            }
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
              Create project
            </Button>
          </Empty>
        </div>
      ) : showNoMatches ? (
        <div style={{ padding: `${token.paddingLG * 2}px ${token.paddingLG}px` }}>
          <Empty
            description={
              <Space orientation="vertical" size={token.marginXS}>
                <Typography.Text strong>
                  {starredEmpty ? 'No starred projects yet' : 'No projects match your filter'}
                </Typography.Text>
                <Typography.Text type="secondary">
                  {starredEmpty
                    ? 'Star a project from the table to pin it here.'
                    : 'Try another search term or clear filters.'}
                </Typography.Text>
              </Space>
            }
          >
            <Button
              onClick={() => {
                setSearchText('');
                setTab('all');
              }}
            >
              {starredEmpty ? 'View all projects' : 'Clear filters'}
            </Button>
          </Empty>
        </div>
      ) : (
        <>
          <Table<ProjectRow & { starred: boolean }>
            rowKey="key"
            pagination={false}
            columns={columns}
            dataSource={pagedProjectRows}
            onRow={(record) => ({
              onClick: () => setDrawerProject(record),
              style: { cursor: 'pointer' },
            })}
            styles={{
              header: {
                cell: {
                  color: token.colorTextDescription,
                  fontWeight: hydraBaseStrong.fontWeight,
                },
              },
            }}
          />
          <Flex justify="flex-end" style={{ padding: token.paddingLG, paddingTop: token.paddingMD }}>
            <Pagination
              current={projectsPage}
              pageSize={shellLayout.tablePageSizeDefault}
              total={filteredRows.length}
              onChange={setProjectsPage}
              showSizeChanger={false}
            />
          </Flex>
        </>
      )}
      </Card>

      <Modal
        title="Create construction project"
        open={createOpen}
        onCancel={() => {
          setCreateOpen(false);
          createForm.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          layout="vertical"
          form={createForm}
          onFinish={(values: { name: string; client?: string; city?: string; state?: string }) => {
            const key = `p-${Date.now()}`;
            setRows((prev) => [
              {
                key,
                name: values.name,
                address: values.client ? `${values.client} HQ` : 'TBD',
                city: values.city || 'TBD',
                state: values.state || '—',
                lastOpened: 'Just now',
                recent: true,
              },
              ...prev,
            ]);
            setCreateOpen(false);
            createForm.resetFields();
            navigate(`/projects/${key}/content`);
          }}
        >
          <Form.Item label="Project name" name="name" rules={[{ required: true, message: 'Enter a project name' }]}>
            <Input placeholder="Downtown Office Tower" />
          </Form.Item>
          <Form.Item label="Client" name="client">
            <Input placeholder="ABC Corp" />
          </Form.Item>
          <Form.Item label="City" name="city">
            <Input placeholder="Chicago" />
          </Form.Item>
          <Form.Item label="State / region" name="state">
            <Input placeholder="IL" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create
              </Button>
              <Button
                onClick={() => {
                  setCreateOpen(false);
                  createForm.resetFields();
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <ProjectDetailDrawer
        project={drawerProject}
        open={drawerProject !== null}
        onClose={() => setDrawerProject(null)}
      />
    </Space>
  );
}
