import {
  CalculatorOutlined,
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  GlobalOutlined,
  InboxOutlined,
  PlusOutlined,
  RightOutlined,
  SearchOutlined,
  StarFilled,
  StarOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { useEffect, useMemo, useState, type Key, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { mockBomProjects } from '../bom/data/mockData';
import { useActiveProject } from '../context/ActiveProjectContext';
import { useSubmittalDraft } from '../context/SubmittalDraftContext';
import {
  AppSearchInput,
  Button,
  Card,
  Col,
  Empty,
  Flex,
  Form,
  Modal,
  Pagination,
  Popconfirm,
  Row,
  Space,
  Table,
  Tabs,
  Tooltip,
  Typography,
  theme,
} from '../ui/antd';
import type { TableColumnsType, TabsProps } from '../ui/antd';

import { hydraBaseStrong } from '../theme/hydraTypography';
import { lastDeliverableForProject } from './projectLastDeliverable';
import {
  ProjectFormFields,
  formValuesToProjectFields,
  projectRowToFormValues,
} from './ProjectFormFields';
import { PROJECT_SEED_ROWS, type ProjectFormValues, type ProjectRow } from './projectSeed';
import {
  UMBRELLA_COMPANY_LABEL,
  UMBRELLA_COMPANY_SLUG,
  flatProjectWorkspacePath,
} from './umbrellaCompany';

function hashSeed(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h << 5) - h + key.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function takeCount(seed: number, salt: number, min: number, max: number): number {
  const span = max - min + 1;
  return min + (seed + salt * 17) % span;
}

const HOME_HUB_PROJECTS_PAGE_SIZE = 10;
const HOME_HUB_EXPANDED_PANEL_ROW_CLASS = 'home-hub-expanded-panel-row';

function firstVisibleProjectKey(rows: ProjectRow[], page: number): string | undefined {
  const start = (page - 1) * HOME_HUB_PROJECTS_PAGE_SIZE;
  return rows.slice(start, start + HOME_HUB_PROJECTS_PAGE_SIZE)[0]?.key;
}

function initialExpandedRowKeys(): Key[] {
  const recentRows = PROJECT_SEED_ROWS.filter((r) => r.recent);
  const key = recentRows[0]?.key ?? PROJECT_SEED_ROWS[0]?.key;
  return key ? [key] : [];
}

function bomCountForUmbrellaProject(projectKey: string): number {
  return mockBomProjects.filter((p) => p.projectId === projectKey).length;
}

type ModuleRollupCardProps = {
  title: string;
  countLabel: string;
  icon: ReactNode;
  onNavigate: () => void;
};

/** Dense clickable module card — only used inside expanded project rows. */
function ModuleRollupCard({ title, countLabel, icon, onNavigate }: ModuleRollupCardProps) {
  const { token } = theme.useToken();
  const label = `Open ${title} module`;
  return (
    <Card
      size="small"
      bordered
      hoverable
      role="button"
      tabIndex={0}
      aria-label={label}
      styles={{
        root: {
          cursor: 'pointer',
          borderColor: token.colorBorderSecondary,
          transition: `box-shadow ${token.motionDurationMid}, border-color ${token.motionDurationMid}`,
        },
        body: { padding: token.paddingSM },
      }}
      onClick={(e) => {
        e.stopPropagation();
        onNavigate();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          onNavigate();
        }
      }}
    >
      <Flex vertical gap={token.marginXS}>
        <Flex align="flex-start" gap={token.marginSM}>
          <span
            aria-hidden
            style={{
              color: token.colorPrimary,
              fontSize: token.fontSizeHeading4,
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            {icon}
          </span>
          <Flex vertical gap={token.marginXXS} style={{ flex: 1, minWidth: 0 }}>
            <Typography.Text strong ellipsis={{ tooltip: title }}>
              {title}
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }} ellipsis={{ tooltip: countLabel }}>
              {countLabel}
            </Typography.Text>
          </Flex>
        </Flex>
        <Flex justify="flex-end" align="center" gap={token.marginXXS}>
          <span
            style={{
              color: token.colorPrimary,
              fontSize: token.fontSizeSM,
              userSelect: 'none',
              textDecoration: 'underline',
              textDecorationColor: token.colorPrimaryBorder,
              textUnderlineOffset: 3,
            }}
          >
            Open module <RightOutlined style={{ fontSize: token.fontSizeSM }} aria-hidden />
          </span>
        </Flex>
      </Flex>
    </Card>
  );
}

/** Roll-up counts as module entry cards — only rendered inside an expanded table row. */
function ProjectModuleRollupCards({ project }: { project: ProjectRow }) {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const { setProjectId } = useActiveProject();
  const { countForProject } = useSubmittalDraft();
  const pid = project.key;
  const seed = hashSeed(pid);
  const bomCount = useMemo(() => bomCountForUmbrellaProject(pid), [pid]);
  const specCount = takeCount(seed, 2, 0, 12);
  const seisBraceCount = takeCount(seed, 1, 1, 5);
  const draftSubmittals = countForProject(pid);
  const submittalPackagesCount =
    draftSubmittals > 0 ? draftSubmittals : takeCount(seed, 3, 1, 4);

  const go = (path: 'bom' | 'sales-brace' | 'seis-brace' | 'submittal') => {
    setProjectId(pid);
    if (path === 'bom') {
      navigate('/bom');
      return;
    }
    navigate(flatProjectWorkspacePath(pid, path));
  };

  return (
    <Flex vertical gap={token.marginXS} style={{ width: '100%' }}>
      <Typography.Title level={5} style={{ margin: 0, lineHeight: 1.35 }}>
        Modules
      </Typography.Title>
      <Row gutter={[token.marginSM, token.marginSM]}>
        <Col xs={24} sm={12} xl={6}>
          <ModuleRollupCard
            title="BOM"
            icon={<UnorderedListOutlined />}
            countLabel={`${bomCount} BOM${bomCount === 1 ? '' : 's'}`}
            onNavigate={() => go('bom')}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <ModuleRollupCard
            title="Spec"
            icon={<FileTextOutlined />}
            countLabel={`${specCount} spec item${specCount === 1 ? '' : 's'}`}
            onNavigate={() => go('sales-brace')}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <ModuleRollupCard
            title="SeisBrace"
            icon={<CalculatorOutlined />}
            countLabel={`${seisBraceCount} design${seisBraceCount === 1 ? '' : 's'}`}
            onNavigate={() => go('seis-brace')}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <ModuleRollupCard
            title="Submittal Manager"
            icon={<InboxOutlined />}
            countLabel={`${submittalPackagesCount} package${submittalPackagesCount === 1 ? '' : 's'}`}
            onNavigate={() => go('submittal')}
          />
        </Col>
      </Row>
    </Flex>
  );
}

/** Company Home — global search + dense projects table with inline expand for roll-ups (flat routing). */
export function HomeHubPage() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const companyLabel = UMBRELLA_COMPANY_LABEL;
  const companySlug = UMBRELLA_COMPANY_SLUG;
  const { setProjectId } = useActiveProject();
  const [tab, setTab] = useState<string>('recent');
  const [starredKeys, setStarredKeys] = useState<Set<string>>(() => new Set(['1', '3']));
  const [rows, setRows] = useState<ProjectRow[]>(() => [...PROJECT_SEED_ROWS]);
  const [projectsPage, setProjectsPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [globalSearchText, setGlobalSearchText] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm] = Form.useForm();
  const [editOpen, setEditOpen] = useState(false);
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editForm] = Form.useForm();
  const [expandedRowKeys, setExpandedRowKeys] = useState<Key[]>(initialExpandedRowKeys);

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

  const firstVisibleKey = firstVisibleProjectKey(filteredRows, projectsPage);

  useEffect(() => {
    if (firstVisibleKey) {
      setExpandedRowKeys([firstVisibleKey]);
      setProjectId(firstVisibleKey);
    } else {
      setExpandedRowKeys([]);
    }
  }, [firstVisibleKey, tab, searchText, projectsPage, setProjectId]);

  const pagedProjectRows = useMemo(() => {
    const start = (projectsPage - 1) * HOME_HUB_PROJECTS_PAGE_SIZE;
    return filteredRows.slice(start, start + HOME_HUB_PROJECTS_PAGE_SIZE);
  }, [filteredRows, projectsPage]);

  const tabItems: TabsProps['items'] = [
    { key: 'recent', label: 'Recent' },
    { key: 'all', label: 'All' },
    { key: 'starred', label: 'Starred' },
  ];

  const openEdit = (key: string) => {
    const row = rows.find((r) => r.key === key);
    if (!row) return;
    setEditKey(key);
    editForm.setFieldsValue(projectRowToFormValues(row));
    setEditOpen(true);
  };

  const deleteProject = (key: string) => {
    setRows((prev) => prev.filter((r) => r.key !== key));
    setStarredKeys((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    setExpandedRowKeys((prev) => prev.filter((k) => String(k) !== key));
    if (editKey === key) {
      setEditOpen(false);
      setEditKey(null);
      editForm.resetFields();
    }
  };

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
      title: 'Project name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Typography.Text>{name}</Typography.Text>,
    },
    {
      title: 'Last worked on',
      key: 'lastWorkedOn',
      ellipsis: true,
      render: (_, record) => {
        const deliverable = lastDeliverableForProject(record.key);
        if (!deliverable) {
          return (
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              —
            </Typography.Text>
          );
        }
        return (
          <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            Last worked on:{' '}
            <Typography.Link
              title={deliverable.displayLabel}
              onClick={(e) => {
                e.stopPropagation();
                setProjectId(record.key);
                navigate(deliverable.path);
              }}
            >
              {deliverable.displayLabel}
            </Typography.Link>
          </Typography.Text>
        );
      },
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
      title: 'Last opened',
      dataIndex: 'lastOpened',
      key: 'lastOpened',
      align: 'right',
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      width: token.controlHeightLG * 2 + token.marginSM,
      render: (_, record) => (
        <Flex justify="flex-end" gap={token.marginXXS} onClick={(e) => e.stopPropagation()}>
          <Tooltip title="Edit">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              aria-label="Edit project"
              onClick={() => openEdit(record.key)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this project?"
            description="This removes the project from your list."
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => deleteProject(record.key)}
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                aria-label="Delete project"
              />
            </Tooltip>
          </Popconfirm>
        </Flex>
      ),
    },
  ];

  /** Align expanded body with Project name column: expand + cell gutters + star (matches column widths). */
  const expandedRollupAlignStart =
    token.controlHeightLG + token.padding + token.controlHeightLG + token.padding;

  const hasAnyProjects = rows.length > 0;
  const showEmpty = !hasAnyProjects;
  const showNoMatches = hasAnyProjects && filteredRows.length === 0;
  const starredEmpty = tab === 'starred' && hasAnyProjects && filteredRows.length === 0 && searchText.trim() === '';
  const recentEmpty = tab === 'recent' && hasAnyProjects && filteredRows.length === 0 && searchText.trim() === '';

  const listPanelStyle = {
    background: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowTertiary,
    overflow: 'hidden' as const,
  };

  const homeHubExpandedRowStyles = useMemo(
    () =>
      `.${HOME_HUB_EXPANDED_PANEL_ROW_CLASS} > td{border-bottom:${token.lineWidth}px ${token.lineType} ${token.colorPrimary}!important;background:${token.colorBgContainer}!important}`,
    [token.colorBgContainer, token.colorPrimary, token.lineType, token.lineWidth],
  );

  const runGlobalSearch = () => {
    const q = globalSearchText.trim();
    if (q) {
      navigate(`/catalog/results?q=${encodeURIComponent(q)}`);
    } else {
      navigate('/catalog');
    }
  };

  return (
    <Space orientation="vertical" size={token.marginMD} style={{ width: '100%' }}>
      <Flex justify="space-between" align="flex-start" wrap="wrap" gap={token.margin}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Typography.Text type="secondary" style={{ display: 'block', marginBottom: token.marginXXS }}>
            {companyLabel} · unified hub
          </Typography.Text>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Home
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ margin: `${token.marginXXS}px 0 0`, maxWidth: 720 }}>
            Projects list below defaults to <strong>Recent</strong>. Expand a row for site details, roll-up counts, and
            module cards (BOM, Spec, SeisBrace, Submittal Manager).
          </Typography.Paragraph>
          <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM, display: 'block', marginTop: token.marginXS }}>
            Home (demo): /dashboard · company {companySlug}
          </Typography.Text>
        </div>
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
          New project
        </Button>
      </Flex>

      <Card
        size="small"
        styles={{ body: { paddingBlock: token.paddingSM, paddingInline: token.paddingMD } }}
        title={
          <Typography.Text strong style={{ fontSize: token.fontSize }}>
            Global search
          </Typography.Text>
        }
      >
        <Typography.Paragraph type="secondary" style={{ margin: `0 0 ${token.marginSM}px`, fontSize: token.fontSizeSM }}>
          Search catalog and parts. Opens results; browse catalog without a query if you prefer.
        </Typography.Paragraph>
        <Flex gap={token.marginSM} wrap="wrap" align="stretch">
          <AppSearchInput
            allowClear
            placeholder="Search catalog, SKUs, descriptions…"
            value={globalSearchText}
            onChange={(e) => setGlobalSearchText(e.target.value)}
            onPressEnter={runGlobalSearch}
            style={{ flex: 1, minWidth: 200 }}
          />
          <Button type="primary" icon={<SearchOutlined />} size="large" onClick={runGlobalSearch}>
            Search
          </Button>
          <Button size="large" icon={<GlobalOutlined />} onClick={() => navigate('/catalog')}>
            Browse catalog
          </Button>
        </Flex>
      </Card>

      <Typography.Title level={4} style={{ marginBottom: token.marginXS }}>
        Projects
      </Typography.Title>

      <Card styles={{ body: { padding: 0 } }} style={listPanelStyle}>
        <div style={{ padding: token.paddingMD, paddingBottom: token.paddingSM }}>
          <AppSearchInput
            allowClear
            placeholder="Filter by name, address, city, or state…"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: '100%', marginBottom: token.marginSM }}
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
                    {starredEmpty
                      ? 'No starred projects yet'
                      : recentEmpty
                        ? 'No projects match Recent right now'
                        : 'No projects match your filter'}
                  </Typography.Text>
                  <Typography.Text type="secondary">
                    {starredEmpty
                      ? 'Star a project from the list to pin it here.'
                      : recentEmpty
                        ? 'Switch to All or clear filters to see more job sites.'
                        : 'Try another search term or clear filters.'}
                  </Typography.Text>
                </Space>
              }
            >
              <Button
                onClick={() => {
                  setSearchText('');
                  if (starredEmpty || recentEmpty) setTab('all');
                }}
              >
                {starredEmpty || recentEmpty ? 'View all projects' : 'Clear filters'}
              </Button>
            </Empty>
          </div>
        ) : (
          <>
            <style>{homeHubExpandedRowStyles}</style>
            <Table<ProjectRow & { starred: boolean }>
              rowKey="key"
              pagination={false}
              columns={columns}
              dataSource={pagedProjectRows}
              scroll={{ x: 'max-content' }}
              onRow={(record) => {
                const isExpanded = expandedRowKeys.map(String).includes(record.key);
                return {
                  style: isExpanded
                    ? {
                        boxShadow: `inset 0 ${token.lineWidth}px 0 0 ${token.colorPrimary}`,
                      }
                    : undefined,
                };
              }}
              expandable={{
                columnWidth: token.controlHeightLG,
                expandedRowClassName: () => HOME_HUB_EXPANDED_PANEL_ROW_CLASS,
                expandedRowRender: (record) => (
                  <div
                    style={{
                      paddingBlock: token.paddingXS,
                      paddingInline: 0,
                    }}
                  >
                    <Flex
                      vertical
                      gap={token.marginXS}
                      style={{
                        width: '100%',
                        maxWidth: '100%',
                        boxSizing: 'border-box',
                        paddingInlineStart: expandedRollupAlignStart + token.marginMD,
                        paddingInlineEnd: token.paddingMD,
                        borderInlineStart: `${token.lineWidthFocus}px solid ${token.colorPrimary}`,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div
                        title={`${record.address} · ${record.city}, ${record.state} · Last opened ${record.lastOpened}`}
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '100%',
                          lineHeight: token.lineHeight,
                        }}
                      >
                        <Typography.Text strong>{record.address}</Typography.Text>
                        <Typography.Text type="secondary"> · </Typography.Text>
                        <Typography.Text type="secondary">
                          {record.city}, {record.state}
                        </Typography.Text>
                        <Typography.Text type="secondary"> · Last opened </Typography.Text>
                        <Typography.Text>{record.lastOpened}</Typography.Text>
                      </div>
                      <ProjectModuleRollupCards project={record} />
                    </Flex>
                  </div>
                ),
                expandedRowKeys,
                onExpandedRowsChange: (keys) => {
                  const next = [...keys].map(String);
                  const prevArr = expandedRowKeys.map(String);
                  const opened = next.filter((k) => !prevArr.includes(k));
                  if (opened.length > 0) {
                    setProjectId(opened[opened.length - 1]);
                  }
                  setExpandedRowKeys([...keys]);
                },
                expandRowByClick: true,
              }}
              styles={{
                header: {
                  cell: {
                    color: token.colorTextDescription,
                    fontWeight: hydraBaseStrong.fontWeight,
                  },
                },
              }}
            />
            <Flex justify="flex-end" style={{ padding: token.paddingMD, paddingTop: token.paddingSM }}>
              <Pagination
                current={projectsPage}
                pageSize={HOME_HUB_PROJECTS_PAGE_SIZE}
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
        width={960}
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
          initialValues={{ country: 'US', contacts: [{}] }}
          onFinish={(values: ProjectFormValues) => {
            const key = `p-${Date.now()}`;
            setRows((prev) => [
              {
                key,
                ...formValuesToProjectFields(values),
                lastOpened: 'Just now',
                recent: true,
              },
              ...prev,
            ]);
            setCreateOpen(false);
            createForm.resetFields();
            navigate(flatProjectWorkspacePath(key, 'content'));
          }}
        >
          <ProjectFormFields
            submitLabel="Create"
            onCancel={() => {
              setCreateOpen(false);
              createForm.resetFields();
            }}
          />
        </Form>
      </Modal>

      <Modal
        title="Edit project"
        open={editOpen}
        width={960}
        onCancel={() => {
          setEditOpen(false);
          setEditKey(null);
          editForm.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          layout="vertical"
          form={editForm}
          onFinish={(values: ProjectFormValues) => {
            if (!editKey) return;
            setRows((prev) =>
              prev.map((r) => (r.key === editKey ? { ...r, ...formValuesToProjectFields(values) } : r)),
            );
            setEditOpen(false);
            setEditKey(null);
            editForm.resetFields();
          }}
        >
          <ProjectFormFields
            submitLabel="Save"
            onCancel={() => {
              setEditOpen(false);
              setEditKey(null);
              editForm.resetFields();
            }}
          />
        </Form>
      </Modal>
    </Space>
  );
}
