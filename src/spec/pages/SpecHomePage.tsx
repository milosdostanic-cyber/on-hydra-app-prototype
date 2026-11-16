import { DownloadOutlined, ExclamationCircleOutlined, UploadOutlined } from '@ant-design/icons';
import type { BadgeProps } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { BomTablePaginationBar } from '../../bom/components/BomTablePaginationBar';
import { BomPageHeader } from '../../bom/layout/BomPageHeader';
import { PageBackButton } from '../../shell/PageBackButton';
import { shellLayout } from '../../theme/hydraAlias';
import { projectTitleById } from '../../shell/projectSeed';
import {
  Alert,
  App,
  AppSearchInput,
  Badge,
  Button,
  Card,
  Descriptions,
  Empty,
  Flex,
  Space,
  Table,
  Tooltip,
  Typography,
  theme,
} from '../../ui/antd';
import type { TableColumnsType } from '../../ui/antd';
import { SpecAddDocumentWizardModal } from '../components/SpecAddDocumentWizardModal';
import { SpecAnalysisFailedModal } from '../components/SpecAnalysisFailedModal';
import { SpecConfirmReanalysisModal } from '../components/SpecConfirmReanalysisModal';
import { SpecDownloadMasterModal } from '../components/SpecDownloadMasterModal';
import { systemTypeDivision } from '../constants/specStatusVocabulary';
import {
  SPEC_UPLOAD_ACCEPT_ATTRIBUTE,
  specFileTypeFromName,
  validateSpecUpload,
} from '../constants/specUploadLimits';
import {
  deriveSpecWorkflowStatus,
  specWorkflowPrimaryActionLabel,
  specWorkflowStatusLabel,
  v2ProcessingPercent,
  v2ReanalysisPercent,
  type SpecWorkflowStatus,
} from '../constants/specWorkflowStatus';
import { mockSpecDocumentRepository, mockSpecReanalysisRepository } from '../data/repositories/specRepositories';
import { useSpecMockStore } from '../data/specMockStore';
import type { SpecDocument, SpecSystemType } from '../data/types';
import { trackSpecEvent } from '../specAnalytics';
import { specAnalyzePath, specDocumentPrimaryPath } from '../specNavigation';
import { hydraBaseStrong, hydraTextStyleToReactCss } from '../../theme/hydraTypography';

type AntBadgeStatus = NonNullable<BadgeProps['status']>;

/** Figma list column — Division 21 uses "Fire Suppression" (not "Fire Protection"). */
const systemTypeDivisionTitle: Record<SpecSystemType, string> = {
  'fire-protection': 'Fire Suppression',
  plumbing: 'Plumbing',
  hvac: 'HVAC',
};

function specDivisionColumnLabel(document: SpecDocument): string {
  const division = document.divisionHint ?? systemTypeDivision[document.systemType];
  return `${division} — ${systemTypeDivisionTitle[document.systemType]}`;
}

/** Division lives in its own column — never repeat it in SPEC name (Figma 8023:33336). */
function specNameColumnLabel(title: string): string {
  return title
    .replace(/^Division \d+ — /i, '')
    .replace(/ — Division \d+ /gi, ' — ')
    .trim();
}

/** Compact column widths — fixed only where needed; name/progress columns flex to fill the rail. */
function specListColumnWidths(token: ReturnType<typeof theme.useToken>['token']) {
  return {
    division: token.sizeUnit * 44,
    lastUpdated: token.sizeUnit * 32,
    status: token.sizeUnit * 36,
    /** Figma Actions column 8029:4067 — 214px. */
    actions: token.sizeUnit * 53 + token.sizeUnit / 2,
  } as const;
}

/** Figma Screen 01 status copy (node 8023:33296). */
function specListStatusLabel(status: SpecWorkflowStatus): string {
  if (status === 'ready-to-export') return 'Review complete';
  return specWorkflowStatusLabel[status];
}

/** Figma Screen 01 badge colours — processing uses warning (yellow), in-review uses info (blue). */
function specListBadgeStatus(status: SpecWorkflowStatus): AntBadgeStatus {
  if (status === 'analysis-failed' || status === 'export-failed') return 'error';
  if (status === 'ready-to-review' || status === 'ready-to-export' || status === 'exported') {
    return 'success';
  }
  if (status === 'processing' || status === 'reanalyzing' || status === 'reanalysis-required') {
    return 'warning';
  }
  if (status === 'in-review') return 'processing';
  return 'default';
}

function formatUpdated(iso: string) {
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function reviewProgressCopy(document: SpecDocument, status: SpecWorkflowStatus): string {
  if (status === 'analysis-failed' || status === 'export-failed') return 'Retry required';
  if (status === 'reanalyzing' && document.reanalysisRun) {
    return `Analysis ${v2ReanalysisPercent(document.reanalysisRun.stages)}%`;
  }
  if (status === 'processing' || status === 'reanalyzing') {
    const percent = v2ProcessingPercent(document.stages, document.processingState);
    return `Analysis ${percent}%`;
  }
  const total = document.requirementCount;
  const reviewed = Math.min(document.reviewedRequirementCount, total);
  if (total === 0) return '—';
  return `${reviewed} of ${total} recommendations reviewed`;
}

/**
 * Screen 01 — Project SPEC List (audit §5.1). Selected-Project scope only —
 * no organization-wide library view in Release 1 (Phase 0 decision record,
 * decision 1). Reuses BOM list/table chrome (audit §10).
 */
export function SpecHomePage() {
  const { token } = theme.useToken();
  const { message, modal } = App.useApp();
  const navigate = useNavigate();
  const { projectId = '' } = useParams<{ projectId: string }>();
  const store = useSpecMockStore();
  const projectTitle = projectTitleById(projectId) ?? 'Project';

  const [docs, setDocs] = useState<SpecDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>();
  const [reloadKey, setReloadKey] = useState(0);
  const [confirmReanalysis, setConfirmReanalysis] = useState<SpecDocument>();
  const [startingReanalysis, setStartingReanalysis] = useState(false);
  const [query, setQuery] = useState('');
  const [sortField, setSortField] = useState<'title' | 'updatedAt'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend'>('descend');
  const [page, setPage] = useState(1);
  const pageSize = shellLayout.tablePageSizeDefault;

  const [addOpen, setAddOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [failedDocId, setFailedDocId] = useState<string>();
  const [retryingFailed, setRetryingFailed] = useState(false);
  const failedReplaceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    trackSpecEvent('spec_project_viewed');
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(undefined);
    void mockSpecDocumentRepository
      .list({ projectId })
      .then((documents) => {
        if (cancelled) return;
        setDocs(documents);
      })
      .catch(() => {
        if (!cancelled) setLoadError('SPEC documents could not be loaded. Try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId, store.documents, store.scenarioId, reloadKey]);

  const failedDoc = docs.find((d) => d.id === failedDocId);

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = docs.filter((document) => {
      const matchesQuery =
        !normalizedQuery ||
        document.title.toLowerCase().includes(normalizedQuery) ||
        document.fileName.toLowerCase().includes(normalizedQuery);
      return matchesQuery;
    });
    filtered.sort((a, b) => {
      const diff =
        sortField === 'title'
          ? a.title.localeCompare(b.title)
          : new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      return sortOrder === 'ascend' ? diff : -diff;
    });
    return filtered;
  }, [docs, query, sortField, sortOrder]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  const pagedDocuments = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredDocuments.slice(start, start + pageSize);
  }, [filteredDocuments, page, pageSize]);

  function clearSearch() {
    setQuery('');
  }

  async function runPrimaryAction(document: SpecDocument) {
    const status = deriveSpecWorkflowStatus(document);
    if (status === 'analysis-failed') {
      setFailedDocId(document.id);
      return;
    }
    if (status === 'reanalysis-required') {
      setConfirmReanalysis(document);
      return;
    }
    navigate(specDocumentPrimaryPath(document));
  }

  function openDeleteConfirm(document: SpecDocument) {
    modal.confirm({
      title: 'Delete SPEC',
      icon: <ExclamationCircleOutlined style={{ color: token.colorError }} />,
      width: 480,
      centered: true,
      okText: 'Delete SPEC',
      okType: 'danger',
      cancelText: 'Cancel',
      content: (
        <Space orientation="vertical" size={token.marginMD} style={{ width: '100%', marginTop: token.marginSM }}>
          <Alert
            type="error"
            showIcon
            message="This SPEC will be removed"
            description="This demo only hides it locally. There is no server delete."
          />
          <Descriptions bordered column={1}>
            <Descriptions.Item label="SPEC document">{document.title}</Descriptions.Item>
            <Descriptions.Item label="Last updated">{formatUpdated(document.updatedAt)}</Descriptions.Item>
          </Descriptions>
        </Space>
      ),
      onOk: async () => {
        await mockSpecDocumentRepository.remove(document.id);
        message.success('SPEC deleted.');
        setReloadKey((k) => k + 1);
      },
    });
  }

  const tableShellStyle = {
    background: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    border: 'none' as const,
    boxShadow: token.boxShadowTertiary,
    overflow: 'hidden' as const,
  };

  const col = specListColumnWidths(token);

  const columns: TableColumnsType<SpecDocument> = [
    {
      title: 'SPEC name',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      sorter: true,
      sortOrder: sortField === 'title' ? sortOrder : null,
      render: (title: string, document) => {
        const name = specNameColumnLabel(title);
        return (
          <Tooltip title={document.fileName}>
            <Typography.Link
              ellipsis
              style={{ color: token.colorPrimaryText, maxWidth: '100%' }}
              onClick={(event) => {
                event.preventDefault();
                navigate(specDocumentPrimaryPath(document));
              }}
            >
              {name}
            </Typography.Link>
          </Tooltip>
        );
      },
    },
    {
      title: 'Status',
      key: 'status',
      width: col.status,
      align: 'left',
      ellipsis: true,
      render: (_, document) => {
        const status = deriveSpecWorkflowStatus(document);
        const label = specListStatusLabel(status);
        return (
          <Tooltip title={label}>
            <Badge status={specListBadgeStatus(status)} text={label} />
          </Tooltip>
        );
      },
    },
    {
      title: 'Review progress',
      key: 'reviewProgress',
      align: 'left',
      ellipsis: true,
      render: (_, document) => {
        const status = deriveSpecWorkflowStatus(document);
        const copy = reviewProgressCopy(document, status);
        return <Typography.Text ellipsis={{ tooltip: copy }}>{copy}</Typography.Text>;
      },
    },
    {
      title: 'Division',
      key: 'division',
      width: col.division,
      ellipsis: true,
      render: (_, document) => (
        <Typography.Text ellipsis={{ tooltip: specDivisionColumnLabel(document) }}>
          {specDivisionColumnLabel(document)}
        </Typography.Text>
      ),
    },
    {
      title: 'Last updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: col.lastUpdated,
      sorter: true,
      sortOrder: sortField === 'updatedAt' ? sortOrder : null,
      render: (value: string) => formatUpdated(value),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: col.actions,
      render: (_, document) => {
        const status = deriveSpecWorkflowStatus(document);
        return (
          <Flex align="center" justify="space-between" style={{ width: '100%' }}>
            <Button
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                void runPrimaryAction(document);
              }}
            >
              {specWorkflowPrimaryActionLabel[status]}
            </Button>
            <Button
              size="small"
              danger
              onClick={(event) => {
                event.stopPropagation();
                openDeleteConfirm(document);
              }}
            >
              Delete
            </Button>
          </Flex>
        );
      },
    },
  ];

  const hasNoDocuments = docs.length === 0 && !loading;
  const hasNoResults = !hasNoDocuments && filteredDocuments.length === 0 && !loading;

  return (
    <>
      <Flex vertical gap={token.marginLG} style={{ width: '100%' }}>
        <PageBackButton to="/projects">Back to Projects</PageBackButton>
        <BomPageHeader
          title="SPEC documents"
          description="Validate your specification against ASC's master specs and product catalog."
          titleVariant="heading4"
          descriptionVariant="large-strong"
          actions={
            <Flex gap={token.marginXS} wrap="nowrap">
              <Button size="large" icon={<DownloadOutlined />} onClick={() => setDownloadOpen(true)}>
                Download ASC Master SPEC
              </Button>
              <Button type="primary" size="large" icon={<UploadOutlined />} onClick={() => setAddOpen(true)}>
                Upload SPEC
              </Button>
            </Flex>
          }
        />

        {loadError ? (
          <Alert
            type="error"
            showIcon
            message="SPEC documents could not be loaded"
            description="Try loading the workspace again."
            action={<Button onClick={() => setReloadKey((value) => value + 1)}>Try again</Button>}
          />
        ) : hasNoDocuments ? (
          <Card>
            <Empty
              description={
                <Flex vertical gap={token.marginXS}>
                  <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>No SPECs in this Project</Typography.Text>
                  <Typography.Text type="secondary">
                    Upload a customer specification to start analysis, or download an editable ASC Master.
                  </Typography.Text>
                </Flex>
              }
            >
              <Flex gap={token.marginXS} justify="center" wrap="wrap">
                <Button size="large" onClick={() => setDownloadOpen(true)}>
                  Download ASC Master SPEC
                </Button>
                <Button type="primary" size="large" onClick={() => setAddOpen(true)}>
                  Upload SPEC
                </Button>
              </Flex>
            </Empty>
          </Card>
        ) : (
          <Card variant="borderless" styles={{ body: { padding: 0 } }} style={tableShellStyle}>
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
              <Typography.Text type="secondary">
                {filteredDocuments.length === 1
                  ? '1 specification'
                  : `${filteredDocuments.length} specifications`}
              </Typography.Text>
              <AppSearchInput
                allowClear
                size="middle"
                placeholder="Search specifications"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                style={{
                  flex: '0 1 auto',
                  width: token.controlHeight * 12,
                  maxWidth: '100%',
                  background: token.colorBgContainer,
                }}
              />
            </Flex>

            {hasNoResults ? (
              <div style={{ padding: token.paddingLG * 2 }}>
                <Empty description="No SPEC documents match your search.">
                  <Button type="primary" size="large" onClick={clearSearch}>
                    Clear search
                  </Button>
                </Empty>
              </div>
            ) : (
              <>
                <Table<SpecDocument>
                  rowKey="id"
                  columns={columns}
                  dataSource={pagedDocuments}
                  loading={loading}
                  pagination={false}
                  tableLayout="fixed"
                  onChange={(_pagination, _filters, sorter) => {
                    const active = Array.isArray(sorter) ? sorter[0] : sorter;
                    if (!active?.field) return;
                    const field = active.field === 'title' ? 'title' : 'updatedAt';
                    setSortField(field);
                    setSortOrder(active.order ?? 'descend');
                  }}
                  styles={{
                    header: {
                      cell: {
                        background: token.colorFillAlter,
                        borderBottomColor: token.colorBorderSecondary,
                        ...hydraTextStyleToReactCss(hydraBaseStrong),
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
                <BomTablePaginationBar
                  current={page}
                  total={filteredDocuments.length}
                  onChange={setPage}
                  pageSize={pageSize}
                />
              </>
            )}
          </Card>
        )}
      </Flex>

      <SpecAddDocumentWizardModal
        open={addOpen}
        projectId={projectId}
        projectTitle={projectTitle}
        onCancel={() => setAddOpen(false)}
        onCreated={(document) => {
          setAddOpen(false);
          setReloadKey((k) => k + 1);
          navigate(specAnalyzePath(document.id));
        }}
      />

      <SpecDownloadMasterModal open={downloadOpen} onCancel={() => setDownloadOpen(false)} />

      <SpecAnalysisFailedModal
        open={Boolean(failedDocId)}
        document={failedDoc}
        retrying={retryingFailed}
        onCancel={() => setFailedDocId(undefined)}
        onRetry={() => {
          if (!failedDoc) return;
          setRetryingFailed(true);
          void mockSpecDocumentRepository
            .retryProcessing(failedDoc.id)
            .then(() => {
              message.success('Processing restarted.');
              setFailedDocId(undefined);
              navigate(specAnalyzePath(failedDoc.id));
            })
            .finally(() => setRetryingFailed(false));
        }}
        onReplaceFile={() => failedReplaceInputRef.current?.click()}
      />

      <input
        ref={failedReplaceInputRef}
        type="file"
        accept={SPEC_UPLOAD_ACCEPT_ATTRIBUTE}
        style={{ display: 'none' }}
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          event.target.value = '';
          if (!file || !failedDoc) return;
          const rejection = validateSpecUpload(file);
          if (rejection) {
            message.error(rejection.message);
            return;
          }
          const fileType = specFileTypeFromName(file.name);
          if (!fileType) {
            message.error(`${file.name} is not a supported file.`);
            return;
          }
          void mockSpecDocumentRepository
            .replaceProcessingFile(failedDoc.id, {
              fileName: file.name,
              fileType,
              fileSizeBytes: file.size,
            })
            .then(() => {
              message.success('File replaced. Analysis restarted.');
              setFailedDocId(undefined);
              navigate(specAnalyzePath(failedDoc.id));
            });
        }}
      />

      <SpecConfirmReanalysisModal
        open={Boolean(confirmReanalysis)}
        documentTitle={confirmReanalysis?.title ?? ''}
        division={
          confirmReanalysis
            ? confirmReanalysis.divisionHint ??
              systemTypeDivision[confirmReanalysis.systemType]
            : ''
        }
        masterVersion={confirmReanalysis?.ascMaster?.version ?? 'Not recorded'}
        confirming={startingReanalysis}
        onCancel={() => setConfirmReanalysis(undefined)}
        onConfirm={() => {
          if (!confirmReanalysis) return;
          setStartingReanalysis(true);
          void mockSpecReanalysisRepository
            .start(confirmReanalysis.id)
            .then(() => {
              const id = confirmReanalysis.id;
              setConfirmReanalysis(undefined);
              navigate(specAnalyzePath(id));
            })
            .finally(() => setStartingReanalysis(false));
        }}
      />
    </>
  );
}
