import {
  EditOutlined,
  ExclamationCircleOutlined,
  ExportOutlined,
  FileSearchOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { useBomWorkspaceRows } from '../../context/BomWorkspaceContext';
import { useBomImportFlow } from '../context/BomImportFlowContext';
import {
  overallProgressPercent,
  routeForImportStep,
  stepIndex,
  stepLabel,
} from '../bomImportProgressState';
import { PageBackButton } from '../../shell/PageBackButton';
import { MAX_UPLOAD_BYTES, VALID_UPLOAD_TYPES } from '../constants/uploadLimits';
import { bomProjectById, bomProjectTitleById } from '../data/mockData';
import { bomWorkspaceTableColumnWidths, ensureWorkspaceRowDisplayFields } from '../data/bomWorkspaceSeed';
import type { BomItem, BomProject } from '../data/types';
import { AscProductsDrawer } from '../components/AscProductsDrawer';
import { BomEditProjectModal } from '../components/BomEditProjectModal';
import { BomTablePaginationBar } from '../components/BomTablePaginationBar';
import {
  Alert,
  App,
  AppSearchInput,
  Button,
  Card,
  Descriptions,
  Empty,
  Flex,
  InputNumber,
  Progress,
  Space,
  Table,
  Typography,
  message,
  theme,
} from '../../ui/antd';
import type { TableColumnsType } from '../../ui/antd';
import { shellLayout } from '../../theme/hydraAlias';
import {
  hydraBaseNormal,
  hydraTextStyleToReactCss,
  hydraTitleHeading3,
} from '../../theme/hydraTypography';

const WORKSPACE_HEADER_DESCRIPTION =
  'Active project BOM review workspace. Confirm lines, resolve review items, and finalize project output.';

type AddedCatalogProduct = {
  ascNumber: string;
  description: string;
  figureNumber?: string;
  size: string;
  partType: string;
  qty?: number;
};

type ImportSummaryState = {
  fileName?: string;
  total: number;
  accepted: number;
  manual: number;
  skipped: number;
};

function renumberRows(rows: BomItem[]): BomItem[] {
  return rows.map((row, idx) => ({ ...row, rowNumber: idx + 1 }));
}

export function BomWorkspacePage() {
  const { token } = theme.useToken();
  const { modal } = App.useApp();
  const { bomProjectId = '' } = useParams<{ bomProjectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const project = bomProjectById(bomProjectId);
  const projectTitle = project?.name ?? bomProjectTitleById(bomProjectId) ?? 'BOM project';
  const isSeedEmptyProject = project != null && project.items === 0;
  const { rows, setRows } = useBomWorkspaceRows(bomProjectId);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [ascDrawerOpen, setAscDrawerOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editProject, setEditProject] = useState<BomProject | null>(project ?? null);
  const { pendingForProject, setActiveUploadId, ensureSession } = useBomImportFlow();
  const pendingImports = pendingForProject(bomProjectId);
  const workspaceFileRef = useRef<HTMLInputElement>(null);
  const [importSummary, setImportSummary] = useState<ImportSummaryState | null>(null);

  const hasWorkspaceRows = rows.length > 0;

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      [row.originalInput, row.figureNumber ?? '', row.sku ?? '', row.parsedDescription]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [rows, query]);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * shellLayout.tablePageSizeDefault;
    return filteredRows.slice(start, start + shellLayout.tablePageSizeDefault);
  }, [filteredRows, page]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    if (project) setEditProject(project);
  }, [project]);

  useEffect(() => {
    const state = (location.state ?? {}) as {
      addedProduct?: AddedCatalogProduct;
      swappedProduct?: AddedCatalogProduct;
      swapRowId?: string;
      importSummary?: ImportSummaryState;
    };

    if (state.importSummary) {
      setImportSummary(state.importSummary);
      window.history.replaceState({}, '');
    }

    if (state.swappedProduct && state.swapRowId) {
      const { swappedProduct: p, swapRowId } = state;
      setRows((prev) =>
        prev.map((r) =>
          r.id === swapRowId
            ? ensureWorkspaceRowDisplayFields({
                ...r,
                originalInput: p.ascNumber,
                parsedDescription: p.description,
                figureNumber: p.figureNumber || p.ascNumber,
                sku: p.ascNumber,
                size: p.size,
                category: p.partType,
                quantity: p.qty || r.quantity,
                status: 'confirmed' as const,
                confidence: 'high' as const,
              })
            : r,
        ),
      );
      window.history.replaceState({}, '');
      message.success('Part updated.');
      return;
    }

    if (state.addedProduct) {
      const p = state.addedProduct;
      setRows((prev) =>
        renumberRows([
          ...prev,
          ensureWorkspaceRowDisplayFields({
            id: `ws-asc-${Date.now()}`,
            rowNumber: prev.length + 1,
            originalInput: p.ascNumber,
            parsedDescription: p.description,
            figureNumber: p.figureNumber || p.ascNumber,
            sku: p.ascNumber,
            size: p.size,
            pressureClass: '',
            connectionType: '',
            quantity: p.qty || 1,
            confidence: 'high',
            category: p.partType,
            unit: 'EA',
            status: 'confirmed',
          }),
        ]),
      );
      window.history.replaceState({}, '');
      message.success('Item added to BOM.');
    }
  }, [location.state, setRows]);

  function handleExport() {
    navigate(`/bom/projects/${bomProjectId}/export`);
  }

  function handleWorkspaceFileChange(e: React.ChangeEvent<HTMLInputElement>) {
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
    const closeLoading = message.loading('Processing your file…', 0);
    window.setTimeout(() => {
      closeLoading();
      message.success('File received. Opening field mapping.');
      const session = ensureSession(bomProjectId, file.name);
      navigate(`/bom/projects/${bomProjectId}/field-mapping`, {
        state: {
          uploadFileName: file.name,
          uploadDestination: 'append',
          appendTargetId: bomProjectId,
          uploadId: session.uploadId,
        },
      });
    }, 900);
  }

  function updateRowQuantity(rowId: string, nextQuantity: number | null) {
    if (typeof nextQuantity !== 'number' || nextQuantity < 0) return;
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, quantity: nextQuantity } : r)),
    );
  }

  function handlePartClick(row: BomItem) {
    navigate(`/bom/projects/${bomProjectId}/asc-products`, {
      state: {
        swapSource: {
          partNumber: row.originalInput,
          description: row.parsedDescription,
          size: row.size,
          category: row.category,
        },
      },
    });
  }

  function openDeleteModal(row: BomItem) {
    modal.confirm({
      title: 'Remove BOM line',
      icon: (
        <ExclamationCircleOutlined style={{ color: token.colorError, fontSize: hydraBaseNormal.fontSize }} />
      ),
      width: 720,
      centered: true,
      okText: 'Remove line',
      okType: 'danger',
      cancelText: 'Cancel',
      content: (
        <Space orientation="vertical" size={token.marginMD} style={{ width: '100%', marginTop: token.marginSM }}>
          <Alert
            type="error"
            showIcon
            message="This line will be permanently removed from the workspace"
            description="Row numbers will be renumbered. You cannot undo this from the demo."
          />
          <Descriptions bordered size="small" column={2} style={{ marginTop: token.marginXS }}>
            <Descriptions.Item label="Part">{row.parsedDescription}</Descriptions.Item>
            <Descriptions.Item label="Figure Number">{row.figureNumber || '—'}</Descriptions.Item>
            <Descriptions.Item label="SKU">{row.sku || '—'}</Descriptions.Item>
            <Descriptions.Item label="Quantity">{row.quantity}</Descriptions.Item>
          </Descriptions>
        </Space>
      ),
      onOk: () => {
        setRows((prev) => renumberRows(prev.filter((r) => r.id !== row.id)));
        message.success('Line item removed.');
      },
    });
  }

  const columns: TableColumnsType<BomItem> = [
    {
      title: '#',
      dataIndex: 'rowNumber',
      key: 'rowNumber',
      width: bomWorkspaceTableColumnWidths.rowNumber,
    },
    {
      title: 'Part',
      dataIndex: 'parsedDescription',
      key: 'part',
      width: bomWorkspaceTableColumnWidths.part,
      ellipsis: true,
      sorter: (a, b) => a.parsedDescription.localeCompare(b.parsedDescription),
      render: (partLabel: string, row) => (
        <Typography.Link ellipsis onClick={() => handlePartClick(row)}>
          {partLabel}
        </Typography.Link>
      ),
    },
    {
      title: 'Figure Number',
      dataIndex: 'figureNumber',
      key: 'figureNumber',
      width: bomWorkspaceTableColumnWidths.figureNumber,
      ellipsis: true,
      render: (v: string | undefined) => v || '—',
      sorter: (a, b) => (a.figureNumber ?? '').localeCompare(b.figureNumber ?? ''),
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: bomWorkspaceTableColumnWidths.sku,
      ellipsis: true,
      render: (v: string | undefined) => v || '—',
      sorter: (a, b) => (a.sku ?? '').localeCompare(b.sku ?? ''),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: bomWorkspaceTableColumnWidths.quantity,
      sorter: (a, b) => a.quantity - b.quantity,
      render: (value: number, record) => (
        <InputNumber
          min={0}
          value={value}
          onChange={(n) => updateRowQuantity(record.id, n)}
          style={{ width: '100%', maxWidth: bomWorkspaceTableColumnWidths.quantity - token.paddingSM * 2 }}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: bomWorkspaceTableColumnWidths.actions,
      render: (_, row) => (
        <Typography.Link
          type="danger"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openDeleteModal(row);
          }}
        >
          Delete
        </Typography.Link>
      ),
    },
  ];

  function renderWorkspaceHeader() {
    const title = editProject?.name ?? projectTitle;
    return (
      <Flex align="flex-start" justify="space-between" gap={token.marginMD} wrap="wrap">
        <Space orientation="vertical" size={token.marginXXS}>
          <Flex align="center" gap={token.marginXXS} wrap="wrap">
            <Typography.Title level={3} style={{ margin: 0, ...hydraTextStyleToReactCss(hydraTitleHeading3) }}>
              {title}
            </Typography.Title>
            {project ? (
              <Button
                type="text"
                icon={<EditOutlined />}
                aria-label="Edit project name"
                onClick={() => setEditModalOpen(true)}
              />
            ) : null}
          </Flex>
          <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
            {WORKSPACE_HEADER_DESCRIPTION}
          </Typography.Text>
        </Space>
        <Button size="large" type="primary" icon={<ExportOutlined />} onClick={handleExport}>
          Export
        </Button>
      </Flex>
    );
  }

  function renderImportSummaryAlert() {
    if (!importSummary) return null;
    const label = importSummary.fileName ?? 'your upload';
    return (
      <Alert
        type="success"
        showIcon
        closable
        onClose={() => setImportSummary(null)}
        message={`Imported ${importSummary.total} items from ${label}`}
        description={`${importSummary.accepted} accepted · ${importSummary.manual} added manually · ${importSummary.skipped} skipped.`}
      />
    );
  }

  function renderPendingUploadAlerts() {
    if (pendingImports.length === 0) return null;
    return (
      <Space orientation="vertical" size={token.marginSM} style={{ width: '100%' }}>
        {pendingImports.map((importSession) => {
          const { progress } = importSession;
          const pct = overallProgressPercent(progress);
          const stepNum = Math.min(3, stepIndex(progress.currentStep) + 1);
          return (
            <Alert
              key={importSession.uploadId}
              type="warning"
              showIcon
              message={`Continue file upload process for "${progress.fileName}"?`}
              description={
                <Space orientation="vertical" size={token.marginSM} style={{ width: '100%' }}>
                  <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                    Stopped at: {stepLabel(progress.currentStep)} · {stepNum} of 3 steps complete
                  </Typography.Text>
                  <Progress percent={pct} size="small" showInfo strokeColor={token.colorPrimary} />
                  <Flex justify="flex-end" style={{ marginTop: token.marginXXS }}>
                    <Button
                      size="large"
                      type="primary"
                      onClick={() => {
                        setActiveUploadId(importSession.uploadId);
                        navigate(routeForImportStep(bomProjectId, progress.currentStep), {
                          state: {
                            uploadId: importSession.uploadId,
                            uploadFileName: progress.fileName,
                            fieldMapping: importSession.fieldMapping,
                            uploadDestination: 'append',
                            appendTargetId: bomProjectId,
                          },
                        });
                      }}
                    >
                      Continue
                    </Button>
                  </Flex>
                </Space>
              }
            />
          );
        })}
      </Space>
    );
  }

  function renderWorkspaceTable() {
    return (
      <Card
        style={{ borderRadius: token.borderRadiusLG, boxShadow: token.boxShadowTertiary }}
        styles={{ body: { padding: 0 } }}
      >
        <Flex
          align="center"
          justify="space-between"
          gap={token.marginSM}
          wrap="wrap"
          style={{
            paddingInline: token.paddingMD,
            paddingBlock: token.paddingSM,
            borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
          }}
        >
          <Space wrap size={token.marginXS}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setAscDrawerOpen(true)}>
              Add Item
            </Button>
            <Button icon={<UploadOutlined />} onClick={() => workspaceFileRef.current?.click()}>
              Upload file
            </Button>
          </Space>
          <AppSearchInput
            allowClear
            placeholder="Search Items..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: 280, maxWidth: '100%' }}
          />
        </Flex>
        <Table<BomItem>
          rowKey="id"
          columns={columns}
          dataSource={pagedRows}
          pagination={false}
          scroll={{
            x:
              bomWorkspaceTableColumnWidths.rowNumber +
              bomWorkspaceTableColumnWidths.part +
              bomWorkspaceTableColumnWidths.figureNumber +
              bomWorkspaceTableColumnWidths.sku +
              bomWorkspaceTableColumnWidths.quantity +
              bomWorkspaceTableColumnWidths.actions,
          }}
          tableLayout="fixed"
          locale={{
            emptyText: (
              <Empty
                description={
                  <Space orientation="vertical" size={token.marginXXS}>
                    <Typography.Text strong>
                      {hasWorkspaceRows ? 'No matching rows' : 'No BOM items yet'}
                    </Typography.Text>
                    <Typography.Text type="secondary">
                      {hasWorkspaceRows
                        ? 'Try a different search term.'
                        : 'Add an item or upload a file to populate this BOM.'}
                    </Typography.Text>
                  </Space>
                }
              />
            ),
          }}
          styles={{
            header: {
              cell: {
                background: token.colorFillAlter,
                borderBottomColor: token.colorBorderSecondary,
                fontWeight: token.fontWeightStrong,
              },
            },
            body: {
              cell: {
                borderBottomColor: token.colorBorderSecondary,
                paddingBlock: token.paddingSM,
              },
            },
          }}
        />
        <BomTablePaginationBar current={page} total={filteredRows.length} onChange={setPage} />
      </Card>
    );
  }

  function renderAscDrawer() {
    return (
      <AscProductsDrawer
        open={ascDrawerOpen}
        onClose={() => setAscDrawerOpen(false)}
        onAddProduct={(p) => {
          setRows((prev) =>
            renumberRows([
              ...prev,
              ensureWorkspaceRowDisplayFields({
                id: `ws-asc-${Date.now()}`,
                rowNumber: prev.length + 1,
                originalInput: p.ascNumber,
                parsedDescription: p.description,
                figureNumber: p.figureNumber,
                sku: p.ascNumber,
                size: p.size,
                pressureClass: '',
                connectionType: '',
                quantity: p.qty || 1,
                confidence: 'high',
                category: p.partType,
                unit: 'EA',
                status: 'confirmed',
              }),
            ]),
          );
          setAscDrawerOpen(false);
          message.success('Item added to BOM.');
        }}
      />
    );
  }

  function renderHiddenFileInput() {
    return (
      <input
        ref={workspaceFileRef}
        type="file"
        accept=".xlsx,.xls,.csv,.pdf,application/pdf,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        style={{ display: 'none' }}
        onChange={handleWorkspaceFileChange}
      />
    );
  }

  if (isSeedEmptyProject && !hasWorkspaceRows) {
    return (
      <>
        {renderHiddenFileInput()}
        <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
          <PageBackButton to="/bom">Back to BOM projects</PageBackButton>
          {renderWorkspaceHeader()}
          <Card styles={{ body: { padding: `${token.paddingLG * 2}px ${token.paddingLG}px` } }}>
            <Empty
              description={
                <Space orientation="vertical" size={token.marginXS}>
                  <Typography.Text strong>No BOM items yet</Typography.Text>
                  <Typography.Text type="secondary">
                    Upload a file to parse your BOM or add items manually.
                  </Typography.Text>
                </Space>
              }
            >
              <Flex gap={token.marginSM} justify="center" wrap="wrap">
                <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setAscDrawerOpen(true)}>
                  Add Item
                </Button>
                <Button
                  size="large"
                  icon={<UploadOutlined />}
                  onClick={() => workspaceFileRef.current?.click()}
                >
                  Upload file
                </Button>
                <Button size="large" icon={<FileSearchOutlined />} onClick={() => navigate('/bom/search')}>
                  Search parts
                </Button>
              </Flex>
            </Empty>
          </Card>
        </Space>
        {renderAscDrawer()}
        <BomEditProjectModal
          open={editModalOpen}
          project={editProject}
          onClose={() => setEditModalOpen(false)}
          onSave={(updated) => {
            setEditProject(updated);
            setEditModalOpen(false);
            message.success('Project name updated.');
          }}
        />
      </>
    );
  }

  if (bomProjectId && bomProjectId !== 'new' && !project) {
    return (
      <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Project not found
        </Typography.Title>
        <Typography.Paragraph type="secondary">This BOM project id is not in the demo data.</Typography.Paragraph>
        <Button type="primary" onClick={() => navigate('/bom')}>
          BOM home
        </Button>
      </Space>
    );
  }

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      {renderHiddenFileInput()}
      <PageBackButton to="/bom">Back to BOM projects</PageBackButton>
      {renderWorkspaceHeader()}
      {renderImportSummaryAlert()}
      {renderPendingUploadAlerts()}
      {renderWorkspaceTable()}
      {renderAscDrawer()}
      <BomEditProjectModal
        open={editModalOpen}
        project={editProject}
        onClose={() => setEditModalOpen(false)}
        onSave={(updated) => {
          setEditProject(updated);
          setEditModalOpen(false);
          message.success('Project name updated.');
        }}
      />
    </Space>
  );
}
