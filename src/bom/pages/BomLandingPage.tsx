import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  FileSearchOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Key } from 'react';

import { useActiveProject } from '../../context/ActiveProjectContext';
import { PageBackButton } from '../../shell/PageBackButton';
import { BomCreateProjectModal } from '../components/BomCreateProjectModal';
import { BomUploadDestinationModal } from '../components/BomUploadDestinationModal';
import { BomPageHeader } from '../layout/BomPageHeader';
import { mockBomProjects } from '../data/mockData';
import { MAX_UPLOAD_BYTES, VALID_UPLOAD_TYPES } from '../constants/uploadLimits';
import { BomProjectStatusTag } from '../components/BomTags';
import type { BomProject } from '../data/types';
import { shellLayout } from '../../theme/hydraAlias';
import {
  hydraBaseNormal,
  hydraSmallNormal,
  hydraTextStyleToReactCss,
  hydraTitleHeading3,
  hydraTitleHeading4,
} from '../../theme/hydraTypography';
import {
  Alert,
  App,
  AppSearchInput,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Flex,
  Pagination,
  Row,
  Select,
  Space,
  Table,
  Typography,
  message,
  theme,
} from '../../ui/antd';
import type { TableColumnsType } from '../../ui/antd';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'needs-review', label: 'Needs Review' },
  { value: 'partial', label: 'Partial' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
];

const SORT_OPTIONS = [
  { value: 'desc', label: 'Last edited' },
  { value: 'asc', label: 'Last edited: oldest' },
];

export function BomLandingPage() {
  const { token } = theme.useToken();
  const { modal } = App.useApp();
  const navigate = useNavigate();
  const { projectId, project } = useActiveProject();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<BomProject['status'] | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [projectsPage, setProjectsPage] = useState(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [hoveredQuickAction, setHoveredQuickAction] = useState<'upload' | 'search' | null>(null);
  const [uploadDestModalOpen, setUploadDestModalOpen] = useState(false);
  const [pendingUpload, setPendingUpload] = useState<{ name: string; size: number } | null>(null);

  // Reset selection and page when switching projects
  useEffect(() => {
    setSelectedRowKeys([]);
    setSearchText('');
    setStatusFilter('all');
    setProjectsPage(1);
  }, [projectId]);

  // BOMs scoped to the active project, excluding locally deleted ones
  const projectBoms = useMemo(
    () => mockBomProjects.filter((p) => p.projectId === projectId && !deletedIds.has(p.id)),
    [projectId, deletedIds],
  );

  const filteredProjects = useMemo(() => {
    let list = [...projectBoms];
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') {
      list = list.filter((p) => p.status === statusFilter);
    }
    list.sort((a, b) => {
      const diff = new Date(b.lastEdited).getTime() - new Date(a.lastEdited).getTime();
      return sortOrder === 'desc' ? diff : -diff;
    });
    return list;
  }, [projectBoms, searchText, statusFilter, sortOrder]);

  const paginatedProjects = useMemo(() => {
    const start = (projectsPage - 1) * shellLayout.tablePageSizeDefault;
    return filteredProjects.slice(start, start + shellLayout.tablePageSizeDefault);
  }, [filteredProjects, projectsPage]);

  const hasSelection = selectedRowKeys.length > 0;

  const handleBulkDelete = () => {
    const n = selectedRowKeys.length;
    setDeletedIds((prev) => {
      const next = new Set(prev);
      (selectedRowKeys as string[]).forEach((k) => next.add(k));
      return next;
    });
    setSelectedRowKeys([]);
    message.success(`${n} BOM project${n > 1 ? 's' : ''} deleted.`);
  };

  const handleRowDelete = (id: string) => {
    setDeletedIds((prev) => new Set(prev).add(id));
    setSelectedRowKeys((prev) => prev.filter((k) => k !== id));
    message.success('BOM project deleted.');
  };

  function openDeleteProjectModal(row: BomProject) {
    modal.confirm({
      title: 'Delete BOM project',
      icon: (
        <ExclamationCircleOutlined style={{ color: token.colorError, fontSize: hydraBaseNormal.fontSize }} />
      ),
      width: 560,
      centered: true,
      okText: 'Delete project',
      okType: 'danger',
      cancelText: 'Cancel',
      content: (
        <Space orientation="vertical" size={token.marginMD} style={{ width: '100%', marginTop: token.marginSM }}>
          <Alert
            type="error"
            showIcon
            message="This project will be removed from your list"
            description="In this demo the project is only hidden locally until you refresh; there is no server delete."
          />
          <Descriptions bordered size="small" column={1}>
            <Descriptions.Item label="Project name">{row.name}</Descriptions.Item>
            <Descriptions.Item label="Items">{row.items}</Descriptions.Item>
            <Descriptions.Item label="Last edited">{row.lastEdited}</Descriptions.Item>
          </Descriptions>
        </Space>
      ),
      onOk: () => {
        handleRowDelete(row.id);
      },
    });
  }

  function openBulkDeleteModal() {
    const n = selectedRowKeys.length;
    if (n === 0) return;
    modal.confirm({
      title: `Delete ${n} BOM project${n > 1 ? 's' : ''}?`,
      icon: (
        <ExclamationCircleOutlined style={{ color: token.colorError, fontSize: hydraBaseNormal.fontSize }} />
      ),
      width: 480,
      centered: true,
      okText: 'Delete all',
      okType: 'danger',
      cancelText: 'Cancel',
      content: (
        <Alert
          type="error"
          showIcon
          style={{ marginTop: token.marginSM }}
          message="Selected projects will be removed from the list"
          description="This demo only hides them locally. This action matches bulk delete in the toolbar."
        />
      ),
      onOk: () => {
        handleBulkDelete();
      },
    });
  }

  const tableLinkButtonStyle = { padding: 0, height: 'auto' as const };

  const columns: TableColumnsType<BomProject> = [
    {
      title: 'Project name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, row) => (
        <Button
          type="link"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/bom/projects/${row.id}/workspace`);
          }}
          style={tableLinkButtonStyle}
        >
          {name}
        </Button>
      ),
    },
    {
      title: 'Last edited',
      dataIndex: 'lastEdited',
      key: 'lastEdited',
      sorter: (a, b) => new Date(a.lastEdited).getTime() - new Date(b.lastEdited).getTime(),
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      align: 'center',
      sorter: (a, b) => a.items - b.items,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'left',
      render: (s: BomProject['status']) => <BomProjectStatusTag status={s} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: unknown, row: BomProject) => (
        <Space size={token.marginSM}>
          <Button
            type="link"
            style={tableLinkButtonStyle}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/bom/projects/${row.id}/workspace`);
            }}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            style={tableLinkButtonStyle}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openDeleteProjectModal(row);
            }}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const triggerUpload = () => fileInputRef.current?.click();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!VALID_UPLOAD_TYPES.has(file.type)) {
      message.error('Please upload a CSV, Excel, or PDF file.');
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      message.error('File size exceeds 50MB limit.');
      return;
    }
    setPendingUpload({ name: file.name, size: file.size });
    setUploadDestModalOpen(true);
  };

  const finishUploadNavigation = (state: {
    uploadFileName: string;
    uploadDestination: 'new' | 'append';
    appendTargetId?: string;
  }) => {
    const closeLoading = message.loading('Processing your file…', 0);
    window.setTimeout(() => {
      closeLoading();
      message.success('File received. Opening field mapping.');
      if (state.uploadDestination === 'new') {
        navigate('/bom/projects/new/field-mapping', { state });
      } else if (state.appendTargetId) {
        navigate(`/bom/projects/${state.appendTargetId}/field-mapping`, { state });
      }
      setPendingUpload(null);
    }, 900);
  };

  const cardFlatStyle = {
    background: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
    cursor: 'pointer' as const,
  };

  const getQuickActionStyle = (kind: 'upload' | 'search') => ({
    ...cardFlatStyle,
    borderColor: hoveredQuickAction === kind ? token.colorPrimaryBorderHover : token.colorBorderSecondary,
    boxShadow: 'none',
    transition: `border-color ${token.motionDurationMid}`,
  });

  const tableShellStyle = {
    background: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowTertiary,
    overflow: 'hidden' as const,
  };

  const hasNoProjects = projectBoms.length === 0;
  const hasNoResults = !hasNoProjects && filteredProjects.length === 0;
  const isFiltered = searchText.trim() !== '' || statusFilter !== 'all';

  return (
    <>
      <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
        <PageBackButton to="/dashboard">Back to home</PageBackButton>
        {!project ? (
          <Alert
            type="info"
            showIcon
            message="Select a construction project"
            description="Pick a project from the top bar to scope BOM runs to the right job site."
          />
        ) : null}
        <BomPageHeader
          title="Get started"
          description="Upload files, search parts, or start from scratch to create your BOM."
          actions={
            <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
              New BOM project
            </Button>
          }
        />

        {/* Upload + Search cards — matched type scale + equal card height */}
        <Row gutter={[token.marginMD, token.marginMD]} align="stretch">
          <Col xs={24} md={12} style={{ display: 'flex' }}>
            <Card
              style={{ ...getQuickActionStyle('upload'), width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
              styles={{
                body: {
                  padding: `${token.paddingMD}px ${token.paddingLG}px`,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                },
              }}
              onClick={triggerUpload}
              onMouseEnter={() => setHoveredQuickAction('upload')}
              onMouseLeave={() => setHoveredQuickAction(null)}
            >
              <Flex vertical gap={token.marginXS} style={{ flex: 1 }}>
                <Flex align="center" gap={token.marginSM}>
                  <UploadOutlined style={{ fontSize: hydraTitleHeading3.fontSize, color: token.colorSuccess }} />
                  <Typography.Title level={4} style={{ margin: 0, ...hydraTextStyleToReactCss(hydraTitleHeading4) }}>
                    Upload a file
                  </Typography.Title>
                </Flex>
                <Typography.Paragraph
                  type="secondary"
                  style={{ margin: 0, ...hydraTextStyleToReactCss(hydraBaseNormal) }}
                >
                  After you pick a file, choose whether it starts a{' '}
                  <Typography.Text strong>new BOM project</Typography.Text> or{' '}
                  <Typography.Text strong>adds lines</Typography.Text> to a BOM you already have in this
                  construction project.
                </Typography.Paragraph>
                <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                  CSV, Excel, or PDF up to 50MB. Next: column mapping, then parsing review.
                </Typography.Text>
              </Flex>
            </Card>
          </Col>
          <Col xs={24} md={12} style={{ display: 'flex' }}>
            <Card
              style={{ ...getQuickActionStyle('search'), width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
              styles={{
                body: {
                  padding: `${token.paddingMD}px ${token.paddingLG}px`,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                },
              }}
              onClick={() => navigate('/bom/search')}
              onMouseEnter={() => setHoveredQuickAction('search')}
              onMouseLeave={() => setHoveredQuickAction(null)}
            >
              <Flex vertical gap={token.marginXS} style={{ flex: 1 }}>
                <Flex align="center" gap={token.marginSM}>
                  <FileSearchOutlined style={{ fontSize: hydraTitleHeading3.fontSize, color: token.colorPrimary }} />
                  <Typography.Title level={4} style={{ margin: 0, ...hydraTextStyleToReactCss(hydraTitleHeading4) }}>
                    Search Catalogue Parts
                  </Typography.Title>
                </Flex>
                <Typography.Paragraph
                  type="secondary"
                  style={{ margin: 0, ...hydraTextStyleToReactCss(hydraBaseNormal) }}
                >
                  Look up <Typography.Text strong>ASC catalog</Typography.Text> parts by number or description to
                  validate lines before you add them to a BOM in this construction project.
                </Typography.Paragraph>
                <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                  Same search bar pattern as the workspace; results open in the catalog flow.
                </Typography.Text>
              </Flex>
            </Card>
          </Col>
        </Row>

        <Space orientation="vertical" size={token.marginSM} style={{ width: '100%' }}>
          <BomPageHeader
            title="Your BOM projects"
            description="BOM runs scoped to the active construction project in the top bar."
          />

          <Card styles={{ body: { padding: 0 } }} style={tableShellStyle}>
            {hasNoProjects ? (
              /* ── Empty state: no BOMs in this project ── */
              <Flex
                vertical
                align="center"
                justify="center"
                style={{ padding: `${token.paddingLG * 3}px ${token.paddingLG}px` }}
              >
                <Empty
                  description={
                    <Space orientation="vertical" size={token.marginXS}>
                      <Typography.Text strong>No BOM projects yet</Typography.Text>
                      <Typography.Text type="secondary">
                        Create your first BOM project or upload a file to get started.
                      </Typography.Text>
                    </Space>
                  }
                >
                  <Flex gap={token.marginSM} justify="center" wrap="wrap">
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setCreateModalOpen(true)}
                    >
                      Create New BOM Project
                    </Button>
                    <Button icon={<UploadOutlined />} onClick={triggerUpload}>
                      Upload a file
                    </Button>
                  </Flex>
                </Empty>
              </Flex>
            ) : hasNoResults ? (
              /* ── Empty state: filter/search returned nothing ── */
              <Flex
                vertical
                align="center"
                justify="center"
                style={{ padding: `${token.paddingLG * 3}px ${token.paddingLG}px` }}
              >
                <Empty
                  description={
                    <Space orientation="vertical" size={token.marginXS}>
                      <Typography.Text strong>No projects match your filters</Typography.Text>
                      <Typography.Text type="secondary">
                        Try adjusting the search term or status filter.
                      </Typography.Text>
                    </Space>
                  }
                >
                  <Button
                    onClick={() => {
                      setSearchText('');
                      setStatusFilter('all');
                      setProjectsPage(1);
                    }}
                  >
                    Clear filters
                  </Button>
                </Empty>
              </Flex>
            ) : (
              <div>
                <Flex
                  align="center"
                  justify="space-between"
                  gap={token.marginSM}
                  wrap="wrap"
                  style={{
                    paddingInline: token.paddingMD,
                    paddingBlock: token.padding,
                    borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                  }}
                >
                  {hasSelection ? (
                    <Flex align="center" justify="space-between" gap={token.marginSM} style={{ width: '100%' }} wrap="wrap">
                      <Typography.Text type="secondary">
                        {selectedRowKeys.length} selected
                      </Typography.Text>
                      <Space size={token.marginSM}>
                        <Button danger icon={<DeleteOutlined />} onClick={openBulkDeleteModal}>
                          Bulk Delete
                        </Button>
                        <Button onClick={() => setSelectedRowKeys([])}>Clear Selection</Button>
                      </Space>
                    </Flex>
                  ) : (
                    <>
                      <AppSearchInput
                        placeholder="Search Items..."
                        value={searchText}
                        onChange={(e) => {
                          setSearchText(e.target.value);
                          setProjectsPage(1);
                        }}
                        allowClear
                        style={{ flex: '1 1 220px', maxWidth: 360, background: token.colorBgContainer }}
                      />
                      <Flex gap={token.marginSM} wrap="wrap">
                        <Select
                          value={statusFilter}
                          onChange={(v) => {
                            setStatusFilter(v as BomProject['status'] | 'all');
                            setProjectsPage(1);
                          }}
                          options={STATUS_OPTIONS}
                          style={{ width: 164, background: token.colorBgContainer }}
                        />
                        <Select
                          value={sortOrder}
                          onChange={(v) => {
                            setSortOrder(v as 'desc' | 'asc');
                            setProjectsPage(1);
                          }}
                          options={SORT_OPTIONS}
                          style={{ width: 200, background: token.colorBgContainer }}
                        />
                      </Flex>
                    </>
                  )}
                </Flex>
                <Table<BomProject>
                  rowKey="id"
                  columns={columns}
                  dataSource={paginatedProjects}
                  pagination={false}
                  rowSelection={{
                    selectedRowKeys,
                    onChange: (keys) => setSelectedRowKeys(keys),
                    preserveSelectedRowKeys: false,
                  }}
                  styles={{
                    header: { cell: { background: token.colorFillAlter, borderBottomColor: token.colorBorderSecondary, fontWeight: token.fontWeightStrong } },
                    body: { cell: { borderBottomColor: token.colorBorderSecondary, paddingBlock: token.paddingSM } },
                  }}
                />
                <Flex
                  justify="space-between"
                  align="center"
                  style={{
                    paddingInline: token.paddingMD,
                    paddingBlock: token.paddingSM,
                    borderTop: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                  }}
                >
                  <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraSmallNormal)}>
                    {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
                    {isFiltered ? ' found' : ' total'}
                  </Typography.Text>
                  <Pagination
                    current={projectsPage}
                    pageSize={shellLayout.tablePageSizeDefault}
                    total={filteredProjects.length}
                    onChange={setProjectsPage}
                    showSizeChanger={false}
                  />
                </Flex>
              </div>
            )}
          </Card>
        </Space>
      </Space>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv,.pdf,application/pdf,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        style={{ display: 'none' }}
        onChange={onFileChange}
      />

      <BomCreateProjectModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={(project) => {
          setCreateModalOpen(false);
          navigate(`/bom/projects/${project.id}/workspace`);
        }}
      />

      {pendingUpload ? (
        <BomUploadDestinationModal
          open={uploadDestModalOpen}
          fileName={pendingUpload.name}
          fileSizeBytes={pendingUpload.size}
          projectBoms={projectBoms}
          hasConstructionProject={Boolean(project)}
          onCancel={() => {
            setUploadDestModalOpen(false);
            setPendingUpload(null);
          }}
          onContinue={(payload) => {
            setUploadDestModalOpen(false);
            if (payload.mode === 'new') {
              finishUploadNavigation({
                uploadFileName: pendingUpload.name,
                uploadDestination: 'new',
              });
            } else {
              finishUploadNavigation({
                uploadFileName: pendingUpload.name,
                uploadDestination: 'append',
                appendTargetId: payload.projectId,
              });
            }
          }}
        />
      ) : null}
    </>
  );
}
