import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  ExportOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useEffect, useMemo, useRef, useState, type Key } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { useBomImportFlow } from '../context/BomImportFlowContext';
import { useBomWorkspaceRows } from '../../context/BomWorkspaceContext';
import { routeForImportStep, type BomImportSession } from '../bomImportProgressState';
import type { BomUploadFlowLocationState, BomWorkspaceAppendBannerState } from '../bomUploadFlowState';
import { BomPendingUploadsRegion } from '../components/BomPendingUploadsRegion';
import { MAX_UPLOAD_BYTES, VALID_UPLOAD_TYPES } from '../constants/uploadLimits';
import { bomProjectById, bomProjectTitleById } from '../data/mockData';
import type { BomItem, BomProject } from '../data/types';
import { resolveBomProjectStatus } from '../bomProjectStatus';
import { BomStatusBadge } from '../components/BomTags';
import { createAdHocCompetitorMatchSession } from '../bomAdHocMatchSession';
import { BomChoosePartModal } from '../components/BomChoosePartModal';
import {
  applyBrowserProductToWorkspaceRow,
  buildChoosePartContextFromWorkspaceRow,
  buildWorkspaceRowFromBrowserProduct,
} from '../bomWorkspaceChoosePart';
import { workspaceStatusAfterManualPick } from '../bomMatchingWorkspaceImport';
import type { AscBrowserProductRow } from '../data/ascBrowserProducts';
import { BomEditProjectModal } from '../components/BomEditProjectModal';
import { buildBomWorkspaceColumns } from '../bomWorkspaceColumns';
import {
  canExportBomProject,
  EXPORT_ENABLED_TOOLTIP,
  isWorkspaceRowConfirmed,
  resolveExportDisabledReason,
  workspacePageHeaderDescription,
} from '../bomWorkspaceHelpers';
import { useBomHubPath } from '../../context/ActiveProjectContext';
import { useActionTrail } from '../../context/ActionTrailContext';
import { PageBackButton } from '../../shell/PageBackButton';
import { ActionTrailNewTag } from '../../search/components/ActionTrailNewTag';
import { actionTrailTableRowProps } from '../../search/actionTrailStyles';
import { BomPageHeader } from '../layout/BomPageHeader';
import {
  Alert,
  App,
  AppSearchInput,
  Button,
  Card,
  Descriptions,
  Dropdown,
  Empty,
  Flex,
  Input,
  Modal,
  Space,
  Table,
  Tooltip,
  Typography,
  message,
  theme,
} from '../../ui/antd';
import { shellLayout } from '../../theme/hydraAlias';
import {
  hydraBaseNormal,
  hydraTextStyleToReactCss,
} from '../../theme/hydraTypography';


type WorkspaceActionErrorType = 'upload' | 'translate' | 'export' | 'request-service';

type AddedCatalogProduct = {
  ascNumber: string;
  description: string;
  size: string;
  partType: string;
  qty?: number;
};

function renumberRows(rows: BomItem[]): BomItem[] {
  return rows.map((row, idx) => ({ ...row, rowNumber: idx + 1 }));
}

function WorkspaceExportButton({
  disabled,
  onClick,
  disabledReason,
  enabledTooltip,
}: {
  disabled: boolean;
  onClick: () => void;
  disabledReason?: string;
  enabledTooltip?: string;
}) {
  const button = (
    <Button
      size="large"
      type="primary"
      icon={<ExportOutlined />}
      onClick={onClick}
      disabled={disabled}
    >
      Export
    </Button>
  );

  if (disabled) {
    return (
      <Tooltip title={disabledReason ?? 'Confirm all items before exporting'}>
        <span>{button}</span>
      </Tooltip>
    );
  }

  return <Tooltip title={enabledTooltip}>{button}</Tooltip>;
}

export function BomWorkspacePage() {
  const { token } = theme.useToken();
  const { modal } = App.useApp();
  const { bomProjectId = '' } = useParams<{ bomProjectId: string }>();
  const navigate = useNavigate();
  const bomHubPath = useBomHubPath();
  const location = useLocation();
  const project = bomProjectById(bomProjectId);
  const projectTitle = project?.name ?? bomProjectTitleById(bomProjectId) ?? 'BOM project';
  const isSeedEmptyProject = project != null && project.items === 0;
  const { rows, setRows } = useBomWorkspaceRows(bomProjectId);
  const { entries, pendingItemIds } = useActionTrail();
  const trailItemIds = useMemo(
    () => new Set(pendingItemIds('bom', bomProjectId)),
    [entries, pendingItemIds, bomProjectId],
  );
  const { pendingForProject, setActiveUploadId } = useBomImportFlow();
  const pendingUploadSessions = pendingForProject(bomProjectId);
  const [query, setQuery] = useState('');

  const [isTranslating, setIsTranslating] = useState(false);
  const [actionError, setActionError] = useState<{ type: WorkspaceActionErrorType; message: string } | null>(null);
  const [choosePartTarget, setChoosePartTarget] = useState<'add' | string | null>(null);
  const emptyWorkspaceFileRef = useRef<HTMLInputElement>(null);
  const [appendImportBanner, setAppendImportBanner] = useState<{ fileName: string; count: number } | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editProject, setEditProject] = useState<BomProject | null>(project ?? null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [competitorEntryOpen, setCompetitorEntryOpen] = useState(false);
  const [competitorEntryText, setCompetitorEntryText] = useState('');

  useEffect(() => {
    if (project) setEditProject(project);
  }, [project]);

  useEffect(() => {
    setSelectedRowKeys([]);
  }, [bomProjectId]);

  const tableRows = useMemo(
    () => renumberRows(rows.filter(isWorkspaceRowConfirmed)),
    [rows],
  );

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tableRows.filter((row) => {
      if (!q) return true;
      return [
        row.originalInput,
        row.parsedDescription,
        row.figureNumber ?? '',
        row.sku ?? '',
        row.category ?? '',
        row.unit ?? '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [tableRows, query]);

  const hasWorkspaceRows = rows.length > 0;
  const hasTableRows = tableRows.length > 0;
  const reviewCount = rows.filter((r) => !isWorkspaceRowConfirmed(r)).length;
  const canTranslate = reviewCount > 0;
  const canExport = canExportBomProject(rows, pendingUploadSessions.length);
  const workspaceDescription = useMemo(
    () => workspacePageHeaderDescription(rows, { pendingUploads: pendingUploadSessions.length }),
    [rows, pendingUploadSessions.length],
  );
  const projectStatus = useMemo(
    () => (bomProjectId && bomProjectId !== 'new' ? resolveBomProjectStatus(bomProjectId) : 'ready'),
    [bomProjectId, pendingUploadSessions.length],
  );
  const exportDisabledReason = resolveExportDisabledReason(rows, pendingUploadSessions.length);
  const hasSelection = selectedRowKeys.length > 0;

  const choosePartContext = useMemo(() => {
    if (!choosePartTarget || choosePartTarget === 'add') {
      return { matchRow: null, parsedItem: undefined as BomItem | undefined };
    }
    const row = rows.find((r) => r.id === choosePartTarget);
    if (!row) {
      return { matchRow: null, parsedItem: undefined as BomItem | undefined };
    }
    return buildChoosePartContextFromWorkspaceRow(row);
  }, [choosePartTarget, rows]);

  function closeChoosePart() {
    setChoosePartTarget(null);
  }

  function handleChoosePartSelect(product: AscBrowserProductRow) {
    if (choosePartTarget === 'add') {
      setRows((prev) =>
        renumberRows([...prev, buildWorkspaceRowFromBrowserProduct(product, prev.length + 1)]),
      );
      message.success('Part added — review and confirm before export.');
    } else if (choosePartTarget) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === choosePartTarget ? applyBrowserProductToWorkspaceRow(r, product) : r,
        ),
      );
      message.success('Replacement part selected — confirm the line when ready.');
    }
    closeChoosePart();
  }

  useEffect(() => {
    const st = (location.state ?? {}) as BomWorkspaceAppendBannerState;
    if (st.appendImportBanner) {
      setAppendImportBanner(st.appendImportBanner);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Pick up products added or swapped from the ASC Products page
  useEffect(() => {
    const state = (location.state ?? {}) as {
      addedProduct?: AddedCatalogProduct;
      swappedProduct?: AddedCatalogProduct;
      swapRowId?: string;
    };

    if (state.swappedProduct && state.swapRowId) {
      const { swappedProduct: p, swapRowId } = state;
      setRows((prev) => prev.map((r) =>
        r.id === swapRowId
          ? {
              ...r,
              originalInput: p.ascNumber,
              parsedDescription: p.description,
              size: p.size,
              category: p.partType,
              quantity: p.qty || r.quantity,
              status: 'confirmed' as const,
              confidence: 'high' as const,
            }
          : r,
      ));
      window.history.replaceState({}, '');
      message.success('Part replaced. Row is now confirmed.');
      return;
    }

    if (state.addedProduct) {
      const p = state.addedProduct;
      setRows((prev) => renumberRows([
        ...prev,
        {
          id: `ws-asc-${Date.now()}`,
          rowNumber: prev.length + 1,
          originalInput: p.ascNumber,
          parsedDescription: p.description,
          size: p.size,
          pressureClass: '',
          connectionType: '',
          quantity: p.qty || 1,
          confidence: 'medium',
          category: p.partType,
          unit: 'EA',
          status: workspaceStatusAfterManualPick('medium'),
        },
      ]));
      window.history.replaceState({}, '');
      message.success('ASC product added for BOM review.');
    }
  }, [location.state]);

  async function handleTranslateParts() {
    if (!canTranslate) return;
    setActionError(null);
    setIsTranslating(true);
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 1400));
      const unresolvedRows = rows.filter((r) => !isWorkspaceRowConfirmed(r));
      const updatedCount = unresolvedRows.length;
      setRows((prev) =>
        prev.map((row) => {
          if (isWorkspaceRowConfirmed(row)) return row;
          return {
            ...row,
            status: 'confirmed' as const,
            confidence: (row.confidence === 'low' ? 'medium' : 'high') as BomItem['confidence'],
          };
        }),
      );
      message.success(`Translation completed. ${updatedCount} item${updatedCount === 1 ? '' : 's'} confirmed.`);
    } catch (error) {
      setActionError({
        type: 'translate',
        message: error instanceof Error ? error.message : 'Translation failed.',
      });
    } finally {
      setIsTranslating(false);
    }
  }

  function handleUpload() {
    Modal.confirm({
      title: 'Re-upload BOM file?',
      content:
        'This will replace your current BOM run after you map columns again. Existing workspace rows stay until you complete a new import.',
      okText: 'Continue to column mapping',
      onOk: () => {
        setActionError(null);
        navigate(`/bom/projects/${bomProjectId}/mapping-summary`, {
          state: {
            uploadDestination: 'append',
            appendTargetId: bomProjectId,
            uploadFlowBackTo: `/bom/projects/${bomProjectId}/workspace`,
            uploadFlowBackLabel: 'Back to workspace',
          },
        });
      },
    });
  }

  function handleEmptyWorkspaceFileChange(e: React.ChangeEvent<HTMLInputElement>) {
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
      message.success('File received. Reviewing column mapping.');
      navigate(`/bom/projects/${bomProjectId}/mapping-summary`, {
        state: {
          uploadFileName: file.name,
          uploadDestination: 'append',
          appendTargetId: bomProjectId,
          uploadFlowBackTo: `/bom/projects/${bomProjectId}/workspace`,
          uploadFlowBackLabel: 'Back to workspace',
        },
      });
    }, 900);
  }

  function handleExport() {
    if (!canExport) return;
    setActionError(null);
    navigate(`/bom/projects/${bomProjectId}/export`);
  }

  function clearSearch() {
    setQuery('');
  }

  function handleRowDelete(row: BomItem) {
    setRows((prev) => renumberRows(prev.filter((r) => r.id !== row.id)));
    setSelectedRowKeys((prev) => prev.filter((k) => k !== row.id));
    message.success('Line item removed.');
  }

  function handleBulkDelete() {
    const ids = new Set(selectedRowKeys as string[]);
    const n = ids.size;
    setRows((prev) => renumberRows(prev.filter((r) => !ids.has(r.id))));
    setSelectedRowKeys([]);
    message.success(`${n} line item${n > 1 ? 's' : ''} removed.`);
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
          <div>
            <Typography.Text
              type="secondary"
              style={{
                ...hydraTextStyleToReactCss(hydraBaseNormal),
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Line to remove
            </Typography.Text>
            <Descriptions
              bordered
              column={2}
              style={{ marginTop: token.marginXS }}
            >
              <Descriptions.Item label="Part number">{row.originalInput}</Descriptions.Item>
              <Descriptions.Item label="Description">{row.parsedDescription}</Descriptions.Item>
              <Descriptions.Item label="Size">{row.size || '—'}</Descriptions.Item>
              <Descriptions.Item label="Quantity">
                {row.quantity} {row.unit || ''}
              </Descriptions.Item>
            </Descriptions>
          </div>
        </Space>
      ),
      onOk: () => {
        handleRowDelete(row);
      },
    });
  }

  function openBulkDeleteModal() {
    const n = selectedRowKeys.length;
    if (n === 0) return;
    modal.confirm({
      title: `Remove ${n} BOM line${n > 1 ? 's' : ''}?`,
      icon: (
        <ExclamationCircleOutlined style={{ color: token.colorError, fontSize: hydraBaseNormal.fontSize }} />
      ),
      width: 480,
      centered: true,
      okText: 'Remove all',
      okType: 'danger',
      cancelText: 'Cancel',
      content: (
        <Alert
          type="error"
          showIcon
          style={{ marginTop: token.marginSM }}
          message="Selected lines will be removed from the workspace"
          description="Row numbers will be renumbered. This demo action cannot be undone."
        />
      ),
      onOk: () => {
        handleBulkDelete();
      },
    });
  }

  function handleContinuePendingUpload(session: BomImportSession) {
    setActiveUploadId(session.uploadId);
    const { bomProjectId: projectId, currentStep, fileName } = session.progress;
    const uploadState: BomUploadFlowLocationState = {
      uploadId: session.uploadId,
      uploadFileName: fileName,
      fieldMapping: session.fieldMapping,
      uploadFlowBackTo: `/bom/projects/${projectId}/workspace`,
      uploadFlowBackLabel: 'Back to workspace',
    };
    navigate(routeForImportStep(projectId, currentStep), { state: uploadState });
  }

  function handleQuantityChange(row: BomItem, quantity: number) {
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, quantity } : r)));
  }

  const columns = useMemo(
    () => [
      {
        title: '',
        key: 'actionTrail',
        width: 56,
        render: (_: unknown, row: BomItem) => (
          <ActionTrailNewTag module="bom" subProjectId={bomProjectId} itemId={row.id} />
        ),
      },
      ...buildBomWorkspaceColumns({
        bomProjectId,
        onDelete: openDeleteModal,
        onQuantityChange: handleQuantityChange,
        showRowActions: !hasSelection,
      }),
    ],
    [bomProjectId, openDeleteModal, handleQuantityChange, hasSelection],
  );

  function renderTableEmptyState() {
    if (!hasTableRows) {
      return (
        <Empty
          description={
            <Space orientation="vertical" size={token.marginXXS}>
              <Typography.Text strong>No BOM items yet</Typography.Text>
              <Typography.Text type="secondary">
                Add a line manually or upload a file to create a new BOM run.
              </Typography.Text>
            </Space>
          }
        />
      );
    }
    return (
      <Empty
        description={
          <Space orientation="vertical" size={token.marginXXS}>
            <Typography.Text strong>No matching rows</Typography.Text>
            <Typography.Text type="secondary">
              No confirmed BOM lines match your search.
            </Typography.Text>
          </Space>
        }
      >
        <Button size="large" onClick={clearSearch}>
          Clear search
        </Button>
      </Empty>
    );
  }

  function workspaceTitleAddon() {
    if (!project) return null;
    return (
      <Flex align="center" gap={token.marginXXS} wrap="wrap">
        {projectStatus === 'needs-review' ? (
          <BomStatusBadge status="warning" text="Needs Review" />
        ) : null}
        <Button
          type="text"
          icon={<EditOutlined />}
          aria-label="Edit project name"
          onClick={() => setEditModalOpen(true)}
        />
      </Flex>
    );
  }

  if (isSeedEmptyProject && !hasWorkspaceRows && !hasTableRows) {
    return (
      <>
        <BomPendingUploadsRegion
          sessions={pendingUploadSessions}
          onContinue={handleContinuePendingUpload}
          defaultExpanded={pendingUploadSessions.length > 1}
        />
        <input
          ref={emptyWorkspaceFileRef}
          type="file"
          accept=".xlsx,.xls,.csv,.pdf,application/pdf,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          style={{ display: 'none' }}
          onChange={handleEmptyWorkspaceFileChange}
        />
        <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
          <BomPageHeader
            title={editProject?.name ?? projectTitle}
            titleVariant="heading3"
            titleAddon={workspaceTitleAddon()}
            description={workspaceDescription}
            actions={
              <WorkspaceExportButton
                disabled={!canExport}
                disabledReason={exportDisabledReason}
                enabledTooltip={EXPORT_ENABLED_TOOLTIP}
                onClick={handleExport}
              />
            }
          />

          <Card styles={{ body: { padding: `${token.paddingLG * 2}px ${token.paddingLG}px` } }}>
            <Empty
              description={
                <Space orientation="vertical" size={token.marginXS}>
                  <Typography.Text strong>No BOM items yet</Typography.Text>
                  <Typography.Text type="secondary">
                    Upload a BOM file to import parts, browse the ASC catalog, or add items one by one.
                  </Typography.Text>
                </Space>
              }
            >
              <Flex gap={token.marginSM} justify="center" wrap="wrap">
                <Dropdown
                  trigger={['click']}
                  menu={{
                    items: [
                      {
                        key: 'asc',
                        label: 'Find an ASC part',
                        onClick: () => setChoosePartTarget('add'),
                      },
                      {
                        key: 'competitor',
                        label: 'Add competitor / unknown part',
                        onClick: () => setCompetitorEntryOpen(true),
                      },
                    ],
                  }}
                >
                  <Button type="primary" size="large" icon={<PlusOutlined />}>
                    Add item
                  </Button>
                </Dropdown>
                <Button
                  size="large"
                  icon={<UploadOutlined />}
                  onClick={() => emptyWorkspaceFileRef.current?.click()}
                >
                  Upload BOM file
                </Button>
              </Flex>
            </Empty>
          </Card>
        </Space>
        <BomChoosePartModal
          open={choosePartTarget !== null}
          matchRow={choosePartContext.matchRow}
          parsedItem={choosePartContext.parsedItem}
          onClose={closeChoosePart}
          onSelectPart={handleChoosePartSelect}
          backLabel={choosePartTarget === 'add' ? 'Cancel' : 'Back to line review'}
        />
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
        <BomPageHeader title="Project not found" description="This BOM project id is not in the demo data." />
        <Button type="primary" onClick={() => navigate(bomHubPath)}>
          BOM home
        </Button>
      </Space>
    );
  }

  return (
    <>
      <BomPendingUploadsRegion
        sessions={pendingUploadSessions}
        onContinue={handleContinuePendingUpload}
        defaultExpanded={pendingUploadSessions.length > 1}
      />
      <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to={bomHubPath}>Back to BOM Projects</PageBackButton>
      <BomPageHeader
        title={editProject?.name ?? projectTitle}
        titleVariant="heading3"
        description={workspaceDescription}
        titleAddon={workspaceTitleAddon()}
        actions={
          <WorkspaceExportButton
            disabled={!canExport}
            disabledReason={exportDisabledReason}
            enabledTooltip={EXPORT_ENABLED_TOOLTIP}
            onClick={handleExport}
          />
        }
      />

      {appendImportBanner ? (
        <Alert
          type="info"
          showIcon
          closable
          onClose={() => setAppendImportBanner(null)}
          message={`Added from ${appendImportBanner.fileName}: ${appendImportBanner.count} item${appendImportBanner.count === 1 ? '' : 's'}.`}
          description="New lines are confirmed and ready in your BOM."
        />
      ) : null}

      {actionError ? (
        <Alert
          type="error"
          showIcon
          message={
            actionError.type === 'translate'
              ? 'Translate Parts failed'
              : actionError.type === 'upload'
                ? 'Upload failed'
                : actionError.type === 'export'
                  ? 'Export unavailable'
                  : 'Request Service failed'
          }
          description={actionError.message}
          action={
            actionError.type === 'translate' ? (
              <Button size="small" onClick={handleTranslateParts}>
                Retry
              </Button>
            ) : null
          }
          closable
          onClose={() => setActionError(null)}
        />
      ) : null}

      {isTranslating && (
        <Alert
          type="info"
          showIcon
          message="Translating unresolved BOM lines…"
          description="Running ASC matching on lines that need review. Table will update when complete."
        />
      )}

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
              <Space wrap size={token.marginXS}>
                <Dropdown
                  trigger={['click']}
                  menu={{
                    items: [
                      {
                        key: 'asc',
                        label: 'Find an ASC part',
                        onClick: () => setChoosePartTarget('add'),
                      },
                      {
                        key: 'competitor',
                        label: 'Add competitor / unknown part',
                        onClick: () => setCompetitorEntryOpen(true),
                      },
                    ],
                  }}
                >
                  <Button type="primary" icon={<PlusOutlined />}>
                    Add item
                  </Button>
                </Dropdown>
                <Button icon={<UploadOutlined />} onClick={handleUpload}>
                  Upload file
                </Button>
              </Space>
              <Flex align="center" gap={token.marginSM} wrap="wrap" style={{ marginLeft: 'auto' }}>
                {hasTableRows ? (
                  <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                    {tableRows.length} part{tableRows.length === 1 ? '' : 's'}
                  </Typography.Text>
                ) : null}
                <AppSearchInput
                  allowClear
                  size="middle"
                  placeholder="Search Items..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  style={{ width: 240, maxWidth: '100%' }}
                />
              </Flex>
            </>
          )}
        </Flex>
        <Table<BomItem>
          rowKey="id"
          columns={columns}
          dataSource={filteredRows}
          scroll={{ x: 'max-content' }}
          onRow={(record) =>
            actionTrailTableRowProps(token, trailItemIds.has(record.id))
          }
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
            preserveSelectedRowKeys: false,
          }}
          locale={{
            emptyText: renderTableEmptyState(),
          }}
          pagination={{
            pageSize: shellLayout.tablePageSizeDefault,
            showSizeChanger: false,
            position: ['bottomRight'],
          }}
          styles={{
            header: { cell: { background: token.colorFillAlter, borderBottomColor: token.colorBorderSecondary, fontWeight: token.fontWeightStrong } },
            body: { cell: { borderBottomColor: token.colorBorderSecondary, paddingBlock: token.paddingSM } },
          }}
        />
      </Card>

      <BomChoosePartModal
        open={choosePartTarget !== null}
        matchRow={choosePartContext.matchRow}
        parsedItem={choosePartContext.parsedItem}
        onClose={closeChoosePart}
        onSelectPart={handleChoosePartSelect}
        backLabel={choosePartTarget === 'add' ? 'Cancel' : 'Back to line review'}
      />

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

      <Modal
        open={competitorEntryOpen}
        title="Add competitor or unknown part"
        onCancel={() => {
          setCompetitorEntryOpen(false);
          setCompetitorEntryText('');
        }}
        footer={
          <Flex justify="flex-end" gap={token.marginXS}>
            <Button
              onClick={() => {
                setCompetitorEntryOpen(false);
                setCompetitorEntryText('');
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              disabled={!competitorEntryText.trim()}
              onClick={() => {
                const text = competitorEntryText.trim();
                if (!text) return;
                const session = createAdHocCompetitorMatchSession(bomProjectId, text);
                setCompetitorEntryOpen(false);
                setCompetitorEntryText('');
                navigate(`/bom/projects/${bomProjectId}/matching/review`, {
                  state: { uploadId: session.uploadId, uploadFileName: 'Manual entry' },
                });
              }}
            >
              Find match
            </Button>
          </Flex>
        }
      >
        <Space orientation="vertical" style={{ width: '100%' }} size={token.marginSM}>
          <Typography.Text type="secondary">
            Paste a part number, brand, or description. We&apos;ll run BOM matching for this line.
          </Typography.Text>
          <Input.TextArea
            autoFocus
            rows={3}
            placeholder="e.g. Grundfos CM5-8 centrifugal pump or competitor SKU"
            value={competitorEntryText}
            onChange={(e) => setCompetitorEntryText(e.target.value)}
          />
        </Space>
      </Modal>
      </Space>
    </>
  );
}
