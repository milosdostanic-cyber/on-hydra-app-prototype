import {
  ExclamationCircleOutlined,
  ExportOutlined,
  FileSearchOutlined,
  PlusOutlined,
  SwapOutlined,
  TranslationOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { useBomWorkspaceRows } from '../../context/BomWorkspaceContext';
import { bomProjectById, bomProjectTitleById } from '../data/mockData';
import type { BomItem } from '../data/types';
import { AscProductsDrawer } from '../components/AscProductsDrawer';
import { PartTranslationModal } from '../components/PartTranslationModal';
import { BomConfidenceTag, BomMatchStatusTag } from '../components/BomTags';
import { isWorkspaceRowConfirmed, suggestedAscPartForRow } from '../bomWorkspaceHelpers';
import { PageBackButton } from '../../shell/PageBackButton';
import { BomPageHeader } from '../layout/BomPageHeader';
import {
  Alert,
  App,
  AppSearchInput,
  Button,
  Card,
  Descriptions,
  Divider,
  Empty,
  Flex,
  Input,
  Modal,
  Progress,
  Rate,
  Space,
  Table,
  Typography,
  message,
  theme,
} from '../../ui/antd';
import type { TableColumnsType } from '../../ui/antd';
import { shellLayout } from '../../theme/hydraAlias';
import { hydraBaseNormal, hydraTextStyleToReactCss, hydraTitleHeading3 } from '../../theme/hydraTypography';


type WorkspaceStatusFilter = 'all' | 'confirmed' | 'needs-review' | 'missing';

type WorkspaceActionErrorType = 'upload' | 'translate' | 'export' | 'request-service';

type AddedCatalogProduct = {
  ascNumber: string;
  description: string;
  size: string;
  partType: string;
  qty?: number;
};

function confidenceSummaryPercent(rows: BomItem[]): number {
  if (rows.length === 0) return 0;
  const weight = (c: BomItem['confidence']) => (c === 'high' ? 1 : c === 'medium' ? 0.5 : 0);
  const sum = rows.reduce((acc, r) => acc + weight(r.confidence), 0);
  return Math.round((sum / rows.length) * 100);
}

function confidenceRank(confidence: BomItem['confidence']): number {
  if (confidence === 'high') return 3;
  if (confidence === 'medium') return 2;
  return 1;
}

function statusRank(status: BomItem['status']): number {
  if (status === 'confirmed') return 3;
  if (status === 'needs-review') return 2;
  if (status === 'matched') return 1;
  return 0;
}

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

  const [isTranslating, setIsTranslating] = useState(false);
  const [actionError, setActionError] = useState<{ type: WorkspaceActionErrorType; message: string } | null>(null);
  const [resolveModalRow, setResolveModalRow] = useState<BomItem | null>(null);
  const [resolvePhase, setResolvePhase] = useState<'review' | 'feedback'>('review');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [statusFilter, setStatusFilter] = useState<WorkspaceStatusFilter>('all');
  const [ascDrawerOpen, setAscDrawerOpen] = useState(false);
  const [translationOpen, setTranslationOpen] = useState(false);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesQuery =
        !q ||
        [row.originalInput, row.parsedDescription, row.category ?? '', row.unit ?? '']
          .join(' ')
          .toLowerCase()
          .includes(q);
      if (!matchesQuery) return false;
      if (statusFilter === 'confirmed') return isWorkspaceRowConfirmed(row);
      if (statusFilter === 'needs-review') return !isWorkspaceRowConfirmed(row) && row.status === 'needs-review';
      if (statusFilter === 'missing') return row.status === 'pending' || row.status === undefined;
      return true;
    });
  }, [rows, query, statusFilter]);

  const totalItems = rows.length;
  const confirmedCount = rows.filter(isWorkspaceRowConfirmed).length;
  const needsReviewCount = rows.filter((row) => row.status === 'needs-review').length;
  const missingCount = rows.filter((row) => row.status === 'pending' || row.status === undefined).length;
  const reviewCount = totalItems - confirmedCount;
  const confidencePercent = confidenceSummaryPercent(rows);
  const canTranslate = reviewCount > 0;
  const hasWorkspaceRows = totalItems > 0;

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
          status: 'needs-review',
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
      okText: 'Continue to field mapping',
      onOk: () => {
        setActionError(null);
        navigate(`/bom/projects/${bomProjectId}/field-mapping`);
      },
    });
  }

  function handleRequestService() {
    setActionError(null);
    if (reviewCount > 0) {
      Modal.confirm({
        title: 'Request service with unresolved rows?',
        content: `${reviewCount} line item${reviewCount === 1 ? '' : 's'} still need review. The current workspace state will be sent for this project.`,
        okText: 'Send request',
        onOk: () => navigate(`/bom/projects/${bomProjectId}/service-request`),
      });
      return;
    }
    navigate(`/bom/projects/${bomProjectId}/service-request`);
  }

  function handleExport() {
    setActionError(null);
    navigate(`/bom/projects/${bomProjectId}/export`);
  }

  function clearSearchAndFilters() {
    setQuery('');
    setStatusFilter('all');
  }

  function openResolveModal(row: BomItem) {
    setResolveModalRow(row);
    setResolvePhase('review');
    setFeedbackText('');
    setFeedbackRating(0);
  }

  function closeResolveModal() {
    setResolveModalRow(null);
    setResolvePhase('review');
    setFeedbackText('');
  }

  function openDeleteModal(row: BomItem) {
    setResolveModalRow(null);
    modal.confirm({
      title: 'Remove BOM line',
      icon: <ExclamationCircleOutlined style={{ color: token.colorError, fontSize: token.fontSizeLG }} />,
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
              style={{ fontSize: token.fontSizeSM, textTransform: 'uppercase', letterSpacing: '0.04em' }}
            >
              Line to remove
            </Typography.Text>
            <Descriptions
              bordered
              size="small"
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
        setRows((prev) => renumberRows(prev.filter((r) => r.id !== row.id)));
        message.success('Line item removed.');
      },
    });
  }

  function handleApprove(row: BomItem) {
    setRows((prev) => prev.map((r) => r.id === row.id ? { ...r, status: 'confirmed' } : r));
    closeResolveModal();
    message.success('Item confirmed successfully.');
  }

  function handleReopen(row: BomItem) {
    setRows((prev) => prev.map((r) => r.id === row.id ? { ...r, status: 'needs-review' } : r));
    setResolveModalRow((prev) => (
      prev && prev.id === row.id
        ? { ...prev, status: 'needs-review' }
        : prev
    ));
    setResolvePhase('review');
    message.info('Row moved to Needs Review. Continue with approve, feedback, or manual swap.');
  }

  function handleSubmitFeedback(row: BomItem) {
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: 'confirmed' as const } : r)));
    closeResolveModal();
    message.success(
      feedbackRating > 0
        ? `Feedback submitted (${feedbackRating}/5). Item confirmed.`
        : 'Feedback submitted. Item confirmed.',
    );
  }

  function handleManualSwap(row: BomItem) {
    closeResolveModal();
    navigate(`/bom/projects/${bomProjectId}/asc-products`, {
      state: {
        swapRowId: row.id,
        swapSource: {
          partNumber: row.originalInput,
          description: row.parsedDescription,
          size: row.size,
          category: row.category,
        },
      },
    });
  }

  const statCardShell = {
    background: token.colorBgContainer,
    border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowTertiary,
    paddingBlock: token.padding,
    paddingInlineStart: token.paddingMD,
    paddingInlineEnd: token.paddingMD,
  };
  const statCardAccentWidth = token.lineWidth * 2;

  const columns: TableColumnsType<BomItem> = [
    { title: '#', dataIndex: 'rowNumber', key: 'rowNumber', width: 50 },
    {
      title: 'Part number',
      dataIndex: 'originalInput',
      key: 'originalInput',
      width: 157,
      sorter: (a, b) => a.originalInput.localeCompare(b.originalInput),
      render: (partNumber: string, row) => (
        <Typography.Link onClick={() => openResolveModal(row)}>{partNumber}</Typography.Link>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'parsedDescription',
      key: 'parsedDescription',
      ellipsis: true,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 110,
      sorter: (a, b) => (a.category ?? '').localeCompare(b.category ?? ''),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 110,
      sorter: (a, b) => a.quantity - b.quantity,
    },
    { title: 'Unit', dataIndex: 'unit', key: 'unit', width: 110 },
    {
      title: 'Confidence',
      dataIndex: 'confidence',
      key: 'confidence',
      width: 110,
      sorter: (a, b) => confidenceRank(a.confidence) - confidenceRank(b.confidence),
      render: (c: BomItem['confidence']) => <BomConfidenceTag confidence={c} />,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      sorter: (a, b) => statusRank(a.status) - statusRank(b.status),
      render: (s: BomItem['status']) => (s ? <BomMatchStatusTag status={s} /> : '—'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, row) => (
        <Space size={token.margin}>
          <Typography.Link onClick={() => openResolveModal(row)}>
            {isWorkspaceRowConfirmed(row) ? 'Review' : 'Resolve'}
          </Typography.Link>
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
        </Space>
      ),
    },
  ];

  function renderTableEmptyState() {
    if (!hasWorkspaceRows) {
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
              No BOM lines match your search or status filter.
            </Typography.Text>
          </Space>
        }
      >
        <Button onClick={clearSearchAndFilters}>Reset filters</Button>
      </Empty>
    );
  }

  function renderResolveModal() {
    if (!resolveModalRow) return null;
    const isConfirmed = isWorkspaceRowConfirmed(resolveModalRow);
    const suggestedPart = suggestedAscPartForRow(resolveModalRow);

    return (
      <Modal
        title={isConfirmed ? 'Review BOM Line' : 'Resolve BOM Line'}
        open={!!resolveModalRow}
        onCancel={closeResolveModal}
        footer={null}
        width={720}
        destroyOnClose
      >
        {resolvePhase === 'review' ? (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Original BOM Line
              </Typography.Text>
              <Descriptions
                bordered
                size="small"
                column={2}
                style={{ marginTop: token.marginXS }}
              >
                <Descriptions.Item label="Part number">{resolveModalRow.originalInput}</Descriptions.Item>
                <Descriptions.Item label="Description">{resolveModalRow.parsedDescription}</Descriptions.Item>
                <Descriptions.Item label="Size">{resolveModalRow.size || '—'}</Descriptions.Item>
                <Descriptions.Item label="Category">{resolveModalRow.category || '—'}</Descriptions.Item>
                <Descriptions.Item label="Quantity">{resolveModalRow.quantity} {resolveModalRow.unit || ''}</Descriptions.Item>
                <Descriptions.Item label="Confidence">
                  <BomConfidenceTag confidence={resolveModalRow.confidence} />
                </Descriptions.Item>
              </Descriptions>
            </div>

            <Divider style={{ margin: 0 }} />

            <div>
              <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Suggested ASC Part
              </Typography.Text>
              <Descriptions
                bordered
                size="small"
                column={2}
                style={{ marginTop: token.marginXS }}
              >
                <Descriptions.Item label="Part number">{suggestedPart.partNumber}</Descriptions.Item>
                <Descriptions.Item label="Description">{suggestedPart.description}</Descriptions.Item>
                <Descriptions.Item label="Family">{suggestedPart.productFamily}</Descriptions.Item>
                <Descriptions.Item label="Dimensions">{suggestedPart.dimensions}</Descriptions.Item>
                <Descriptions.Item label="Pressure">{suggestedPart.pressureRating}</Descriptions.Item>
                <Descriptions.Item label="Connection">{suggestedPart.connectionType}</Descriptions.Item>
                <Descriptions.Item label="Match confidence" span={2}>
                  <Progress percent={suggestedPart.matchConfidence} size="small" style={{ maxWidth: 280 }} />
                </Descriptions.Item>
              </Descriptions>
            </div>

            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              Review the suggested ASC part and confirm or replace it before final export.
            </Typography.Text>

            <Flex justify="flex-end" gap={token.marginXS} wrap="wrap">
              {isConfirmed ? (
                <>
                  <Button onClick={closeResolveModal}>Done</Button>
                  <Button icon={<SwapOutlined />} onClick={() => handleManualSwap(resolveModalRow)}>
                    Manual Swap
                  </Button>
                  <Button danger onClick={() => handleReopen(resolveModalRow)}>
                    Reopen for Review
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={closeResolveModal}>Cancel</Button>
                  <Button onClick={() => setResolvePhase('feedback')}>
                    Approve with Feedback
                  </Button>
                  <Button
                    onClick={() => {
                      setTranslationOpen(true);
                    }}
                  >
                    Review translation
                  </Button>
                  <Button icon={<SwapOutlined />} onClick={() => handleManualSwap(resolveModalRow)}>
                    Manual Swap
                  </Button>
                  <Button type="primary" onClick={() => handleApprove(resolveModalRow)}>
                    Approve
                  </Button>
                </>
              )}
            </Flex>
          </Space>
        ) : (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Typography.Text>
              Confirm this match and attach feedback for review. Your feedback helps improve future matching.
            </Typography.Text>
            <div>
              <Typography.Text type="secondary" style={{ display: 'block', marginBottom: token.marginXS }}>
                Optional rating
              </Typography.Text>
              <Rate value={feedbackRating} onChange={setFeedbackRating} />
            </div>
            <Input.TextArea
              rows={4}
              placeholder="Describe any issues or notes about this match..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            />
            <Flex justify="flex-end" gap={token.marginXS}>
              <Button onClick={() => setResolvePhase('review')}>Back</Button>
              <Button type="primary" onClick={() => handleSubmitFeedback(resolveModalRow)}>
                Submit &amp; Confirm
              </Button>
            </Flex>
          </Space>
        )}
      </Modal>
    );
  }

  if (isSeedEmptyProject && !hasWorkspaceRows) {
    return (
      <>
        <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
          <BomPageHeader
            eyebrow="Draft"
            title={projectTitle}
            description="Upload a file to parse your BOM, browse ASC products, or use the quick picker."
            actions={
              <Space wrap>
                <Button size="large" type="primary" icon={<ExportOutlined />} onClick={handleExport}>
                  Export
                </Button>
                <Button size="large" onClick={handleRequestService}>
                  Request service
                </Button>
              </Space>
            }
          />

          <Card styles={{ body: { padding: `${token.paddingLG * 2}px ${token.paddingLG}px` } }}>
            <Empty
              description={
                <Space orientation="vertical" size={token.marginXS}>
                  <Typography.Text strong>No BOM items yet</Typography.Text>
                  <Typography.Text type="secondary">
                    Upload a file to parse your BOM, browse ASC products, or use the quick picker.
                  </Typography.Text>
                </Space>
              }
            >
              <Flex gap={token.marginSM} justify="center" wrap="wrap">
                <Button
                  type="primary"
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={() => setAscDrawerOpen(true)}
                >
                  Add item
                </Button>
                <Button size="large" icon={<UploadOutlined />} onClick={handleUpload}>
                  Upload BOM file
                </Button>
                <Button
                  size="large"
                  icon={<FileSearchOutlined />}
                  onClick={() => navigate('/bom/search')}
                >
                  Search parts
                </Button>
              </Flex>
            </Empty>
          </Card>
        </Space>
        <AscProductsDrawer
          open={ascDrawerOpen}
          onClose={() => setAscDrawerOpen(false)}
          onAddProduct={(p) => {
            setRows((prev) =>
              renumberRows([
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
                  status: 'needs-review',
                },
              ]),
            );
            setAscDrawerOpen(false);
            message.success('Product added from quick picker.');
          }}
        />
        <PartTranslationModal
          open={translationOpen}
          onClose={() => setTranslationOpen(false)}
          items={resolveModalRow ? [resolveModalRow] : []}
          ascParts={resolveModalRow ? [suggestedAscPartForRow(resolveModalRow)] : []}
          onConfirm={(itemId, ascPart) => {
            setRows((prev) =>
              prev.map((r) =>
                r.id === itemId
                  ? {
                      ...r,
                      status: 'confirmed' as const,
                      confidence: 'high' as const,
                      originalInput: ascPart.partNumber,
                      parsedDescription: ascPart.description,
                      size: ascPart.dimensions,
                    }
                  : r,
              ),
            );
            setTranslationOpen(false);
            closeResolveModal();
            message.success('Translation reviewed and line confirmed.');
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
      <PageBackButton to="/bom">Back to BOM projects</PageBackButton>
      <BomPageHeader
        title={`${projectTitle} workspace`}
        description="Active project BOM review workspace. Confirm lines, resolve review items, and finalize project output."
        actions={
          <Space wrap>
            <Button size="large" type="primary" icon={<ExportOutlined />} onClick={handleExport}>
              Export
            </Button>
            <Button size="large" onClick={handleRequestService}>
              Request service
            </Button>
          </Space>
        }
      />

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

      <Flex gap={token.margin} wrap="wrap" align="stretch">
        <div
          style={{
            ...statCardShell,
            flex: '1 1 160px',
            minWidth: 0,
            cursor: 'pointer',
            borderInlineStartWidth: statCardAccentWidth,
            borderInlineStartStyle: 'solid',
            borderInlineStartColor: token.colorPrimaryBorder,
          }}
          onClick={() => setStatusFilter('all')}
        >
          <Flex align="center" justify="space-between" gap={token.marginXS}>
            <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
              Total items
            </Typography.Text>
            <Typography.Title level={3} style={{ margin: 0, ...hydraTextStyleToReactCss(hydraTitleHeading3) }}>
              {totalItems}
            </Typography.Title>
          </Flex>
        </div>
        <div
          style={{
            ...statCardShell,
            flex: '1 1 160px',
            minWidth: 0,
            cursor: 'pointer',
            borderInlineStartWidth: statCardAccentWidth,
            borderInlineStartStyle: 'solid',
            borderInlineStartColor: token.colorSuccessBorder,
          }}
          onClick={() => setStatusFilter('confirmed')}
        >
          <Flex align="center" justify="space-between" gap={token.marginXS}>
            <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
              Confirmed
            </Typography.Text>
            <Typography.Title level={3} style={{ margin: 0, ...hydraTextStyleToReactCss(hydraTitleHeading3) }}>
              {confirmedCount}
            </Typography.Title>
          </Flex>
        </div>
        <div
          style={{
            ...statCardShell,
            flex: '1 1 160px',
            minWidth: 0,
            cursor: 'pointer',
            borderInlineStartWidth: statCardAccentWidth,
            borderInlineStartStyle: 'solid',
            borderInlineStartColor: token.colorWarningBorder,
          }}
          onClick={() => setStatusFilter('needs-review')}
        >
          <Flex align="center" justify="space-between" gap={token.marginXS}>
            <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
              Needs Review
            </Typography.Text>
            <Typography.Title level={3} style={{ margin: 0, ...hydraTextStyleToReactCss(hydraTitleHeading3) }}>
              {needsReviewCount}
            </Typography.Title>
          </Flex>
        </div>
        <div
          style={{
            ...statCardShell,
            flex: '1 1 160px',
            minWidth: 0,
            cursor: 'pointer',
            borderInlineStartWidth: statCardAccentWidth,
            borderInlineStartStyle: 'solid',
            borderInlineStartColor: token.colorErrorBorder,
          }}
          onClick={() => setStatusFilter('missing')}
        >
          <Flex align="center" justify="space-between" gap={token.marginXS}>
            <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
              Missing
            </Typography.Text>
            <Typography.Title level={3} style={{ margin: 0, ...hydraTextStyleToReactCss(hydraTitleHeading3) }}>
              {missingCount}
            </Typography.Title>
          </Flex>
        </div>
        <div
          style={{
            ...statCardShell,
            flex: '1 1 220px',
            maxWidth: 368,
            minWidth: 200,
            borderInlineStartWidth: statCardAccentWidth,
            borderInlineStartStyle: 'solid',
            borderInlineStartColor: token.colorInfoBorder,
          }}
        >
          <Flex vertical justify="center" gap={token.marginXXS} style={{ width: '100%', minHeight: '100%' }}>
            <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
              Match Confidence
            </Typography.Text>
            <Progress
              percent={confidencePercent}
              size="small"
              strokeColor={token.colorInfo}
              trailColor={token.colorFillSecondary}
              style={{ margin: 0 }}
            />
          </Flex>
        </div>
      </Flex>

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
            paddingBlock: token.paddingSM,
            borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
          }}
        >
          <Space wrap size={token.marginXS}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setAscDrawerOpen(true)}>
              Add Item
            </Button>
            <Button onClick={() => navigate(`/bom/projects/${bomProjectId}/asc-products`)}>Browse products</Button>
            <Button icon={<UploadOutlined />} onClick={handleUpload}>
              Upload file
            </Button>
            {canTranslate ? (
              <Button icon={<TranslationOutlined />} onClick={() => navigate(`/bom/projects/${bomProjectId}/translate`)}>
                Translate all
              </Button>
            ) : null}
          </Space>
          <Flex align="center" gap={token.marginXS} wrap="wrap">
            <AppSearchInput
              allowClear
              placeholder="Search items..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ width: 240, maxWidth: '100%' }}
            />
          </Flex>
        </Flex>
        <Table<BomItem>
          rowKey="id"
          columns={columns}
          dataSource={filteredRows}
          scroll={{ x: 'max-content' }}
          locale={{
            emptyText: renderTableEmptyState(),
          }}
          pagination={{
            pageSize: shellLayout.tablePageSizeDefault,
            showSizeChanger: false,
            showTotal: (total) => `${total} row${total === 1 ? '' : 's'}`,
            position: ['bottomRight'],
          }}
          styles={{
            header: { cell: { background: token.colorFillAlter, borderBottomColor: token.colorBorderSecondary, fontWeight: token.fontWeightStrong } },
            body: { cell: { borderBottomColor: token.colorBorderSecondary, paddingBlock: token.paddingSM } },
          }}
        />
      </Card>

      {renderResolveModal()}

      <AscProductsDrawer
        open={ascDrawerOpen}
        onClose={() => setAscDrawerOpen(false)}
        onAddProduct={(p) => {
          setRows((prev) =>
            renumberRows([
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
                status: 'needs-review',
              },
            ]),
          );
          setAscDrawerOpen(false);
          message.success('Product added from quick picker.');
        }}
      />

      <PartTranslationModal
        open={translationOpen}
        onClose={() => setTranslationOpen(false)}
        items={resolveModalRow ? [resolveModalRow] : []}
        ascParts={resolveModalRow ? [suggestedAscPartForRow(resolveModalRow)] : []}
        onConfirm={(itemId, ascPart) => {
          setRows((prev) =>
            prev.map((r) =>
              r.id === itemId
                ? {
                    ...r,
                    status: 'confirmed' as const,
                    confidence: 'high' as const,
                    originalInput: ascPart.partNumber,
                    parsedDescription: ascPart.description,
                    size: ascPart.dimensions,
                  }
                : r,
            ),
          );
          setTranslationOpen(false);
          closeResolveModal();
          message.success('Translation reviewed and line confirmed.');
        }}
      />
    </Space>
  );
}
