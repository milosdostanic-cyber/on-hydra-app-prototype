import {
  CheckOutlined,
  FileTextOutlined,
  FileWordOutlined,
} from '@ant-design/icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { registerEntry } from '../../context/actionTrailStore';
import { BomPageHeader } from '../../bom/layout/BomPageHeader';
import { PageBackButton } from '../../shell/PageBackButton';
import { ExportCard } from '../../ui/ExportCard';
import { HydraTag } from '../../ui/HydraTag';
import {
  Alert,
  App,
  AppSearchInput,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Flex,
  INLINE_SEARCH_CONTROL_SIZE,
  Input,
  Modal,
  Row,
  Select,
  Skeleton,
  Typography,
  theme,
} from '../../ui/antd';
import { SpecPermissionBoundary } from '../components/SpecPermissionBoundary';
import {
  GUIDE_EXPORT_CHOICES,
  canEdit,
  guideApprovalBadgeStatus,
  guideApprovalStatusLabel,
} from '../constants/specStatusVocabulary';
import { useSpecDemo } from '../context/SpecDemoContext';
import { mockSpecGuideSpecRepository } from '../data/repositories/specRepositories';
import { useSpecMockStore } from '../data/specMockStore';
import type {
  SpecGuideApprovalStatus,
  SpecGuideMergePreview,
  SpecGuideSnippet,
  SpecGuideSpec,
} from '../data/types';
import { trackSpecEvent } from '../specAnalytics';
import { specEditPath, specHomePath } from '../specNavigation';
import { hydraBaseStrong, hydraTextStyleToReactCss } from '../../theme/hydraTypography';

type ExportKey = (typeof GUIDE_EXPORT_CHOICES)[number]['key'];

/**
 * I5 — Get Specified / guide-language library (AC-035, AC-036).
 * Browse approved language, preview merge, insert pending Edit change, mock export.
 */
export function SpecGuideSpecsPage() {
  const { token } = theme.useToken();
  const { message, modal } = App.useApp();
  const navigate = useNavigate();
  const store = useSpecMockStore();
  const demo = useSpecDemo();
  const access = demo.role;
  const editable = canEdit(access);

  const [guides, setGuides] = useState<SpecGuideSpec[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [draftQuery, setDraftQuery] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SpecGuideApprovalStatus | 'all'>('all');
  const [divisionFilter, setDivisionFilter] = useState<string | 'all'>('all');
  const [targetDocumentId, setTargetDocumentId] = useState<string | undefined>();
  const [selectedSnippetId, setSelectedSnippetId] = useState<string | undefined>();
  const [editorDraft, setEditorDraft] = useState('');
  const [preview, setPreview] = useState<SpecGuideMergePreview | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [exportKey, setExportKey] = useState<ExportKey>('docx');
  const [inserting, setInserting] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const list = await mockSpecGuideSpecRepository.listGuideSpecs();
      setGuides(list);
      setSelectedId((prev) => prev ?? list[0]?.id);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    trackSpecEvent('spec_guide_opened');
    void reload();
  }, [reload, store.scenarioId, store.guideSpecs]);

  const readyDocuments = useMemo(
    () =>
      store.documents.filter(
        (d) => !d.archived && (d.processingState === 'ready' || d.processingState === 'partial'),
      ),
    [store.documents],
  );

  useEffect(() => {
    if (!targetDocumentId && readyDocuments[0]) {
      setTargetDocumentId(readyDocuments[0].id);
    }
  }, [readyDocuments, targetDocumentId]);

  const selected = useMemo(
    () => guides.find((g) => g.id === selectedId),
    [guides, selectedId],
  );

  useEffect(() => {
    if (selected) {
      setEditorDraft(selected.content);
      setSelectedSnippetId(selected.snippets[0]?.id);
    }
  }, [selected?.id]);

  const divisions = useMemo(
    () => [...new Set(guides.map((g) => g.division))].sort(),
    [guides],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guides.filter((g) => {
      if (statusFilter !== 'all' && g.approvalStatus !== statusFilter) return false;
      if (divisionFilter !== 'all' && g.division !== divisionFilter) return false;
      if (!q) return true;
      return (
        g.title.toLowerCase().includes(q) ||
        g.sectionNumber.toLowerCase().includes(q) ||
        g.productFamily.toLowerCase().includes(q) ||
        g.application.toLowerCase().includes(q) ||
        g.jurisdiction.toLowerCase().includes(q)
      );
    });
  }, [guides, query, statusFilter, divisionFilter]);

  const selectedSnippet: SpecGuideSnippet | undefined = selected?.snippets.find(
    (s) => s.id === selectedSnippetId,
  );

  const openMergePreview = async () => {
    if (!selected || !selectedSnippet || !targetDocumentId) {
      message.warning('Choose guide language, a snippet, and a target specification.');
      return;
    }
    if (selected.insertPermission === 'blocked') {
      message.error('This guide language is superseded and cannot be inserted.');
      return;
    }

    const runPreview = async () => {
      const next = await mockSpecGuideSpecRepository.buildMergePreview({
        guideSpecId: selected.id,
        snippetId: selectedSnippet.id,
        documentId: targetDocumentId,
      });
      if (!next) {
        message.error('Could not build a merge preview for this target.');
        return;
      }
      setPreview(next);
      setPreviewOpen(true);
    };

    if (selected.insertPermission === 'warn') {
      modal.confirm({
        title: 'Insert non-approved guide language?',
        content: `${guideApprovalStatusLabel[selected.approvalStatus]} language normally needs approval. Continue only if you accept the risk for this prototype insert.`,
        okText: 'Continue to preview',
        cancelText: 'Cancel',
        onOk: () => runPreview(),
      });
      return;
    }

    await runPreview();
  };

  const confirmInsert = async (resolveConflicts: boolean) => {
    if (!preview || !selected) return;
    setInserting(true);
    try {
      const change = await mockSpecGuideSpecRepository.insertSnippet({
        preview,
        author: 'Alex Rivera',
        resolvePendingConflicts: resolveConflicts,
      });
      if (!change) {
        message.error('Insert failed — check approval status and try again.');
        return;
      }
      trackSpecEvent('spec_guide_language_inserted', {
        guideSpecId: selected.id,
        guideVersion: selected.version,
        approvalStatus: selected.approvalStatus,
      });
      registerEntry({
        module: 'spec',
        subProjectId: preview.documentId,
        subProjectLabel: selected.title,
        partKey: 'guide-insert',
        itemIds: [change.id],
      });
      setPreviewOpen(false);
      setPreview(null);
      message.success('Pending change created in Edit — source text is unchanged until Accept.');
      navigate(specEditPath(preview.documentId));
    } finally {
      setInserting(false);
    }
  };

  const saveGuideDraft = async () => {
    if (!selected || !editable) return;
    if (selected.approvalStatus === 'approved' || selected.approvalStatus === 'superseded') {
      message.warning('Approved and superseded guide language is read-only in this prototype.');
      return;
    }
    const updated = await mockSpecGuideSpecRepository.updateGuideContent(selected.id, editorDraft);
    if (updated) message.success('Guide draft saved locally.');
  };

  const runMockExport = () => {
    if (!selected) return;
    const choice = GUIDE_EXPORT_CHOICES.find((c) => c.key === exportKey);
    trackSpecEvent('spec_guide_export_mocked', {
      guideSpecId: selected.id,
      exportFormat: exportKey,
    });
    message.success(`Mock export ready: ${choice?.title ?? exportKey} (no file generated).`);
  };

  if (loading && guides.length === 0) {
    return <Skeleton active paragraph={{ rows: 10 }} />;
  }

  return (
    <Flex vertical gap={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to={specHomePath()}>Back to Spec</PageBackButton>

      <BomPageHeader
        title="Get Specified"
        description="Browse approved ASC guide language, preview how it merges into a working copy, then create a pending Edit change. Exports are mocked."
        actions={
          <Button size="large" onClick={() => navigate(specHomePath())}>
            Spec library
          </Button>
        }
      />

      {!editable ? (
        <SpecPermissionBoundary access={access} actionLabel="edit or insert guide language" />
      ) : null}

      {guides.length === 0 ? (
        <Card>
          <Empty
            description={
              <Flex vertical gap={token.marginXS}>
                <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>No guide language yet</Typography.Text>
                <Typography.Text type="secondary">
                  Switch to Clean Division 22 (or another full scenario) in the demo drawer to load
                  the guide-language library.
                </Typography.Text>
              </Flex>
            }
          />
        </Card>
      ) : (
        <Row gutter={[token.marginLG, token.marginLG]}>
          <Col xs={24} lg={10}>
            <Card styles={{ body: { padding: 0 } }}>
              <div
                style={{
                  padding: token.paddingMD,
                  borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                }}
              >
                <Flex vertical gap={token.marginSM}>
                  <Flex wrap="wrap" gap={token.marginSM} align="center">
                    <AppSearchInput
                      allowClear
                      size={INLINE_SEARCH_CONTROL_SIZE}
                      placeholder="Search division, section, product…"
                      value={draftQuery}
                      onChange={(e) => setDraftQuery(e.target.value)}
                      onPressEnter={() => setQuery(draftQuery)}
                      style={{ minWidth: token.controlHeight * 8, flex: 1 }}
                    />
                    <Button
                      type="primary"
                      size="large"
                      onClick={() => setQuery(draftQuery)}
                    >
                      Search
                    </Button>
                  </Flex>
                  <Flex wrap="wrap" gap={token.marginSM}>
                    <Select
                      size="large"
                      style={{ minWidth: token.controlHeight * 6 }}
                      value={statusFilter}
                      onChange={setStatusFilter}
                      options={[
                        { value: 'all', label: 'All statuses' },
                        { value: 'approved', label: 'Approved' },
                        { value: 'in-review', label: 'In review' },
                        { value: 'draft', label: 'Draft' },
                        { value: 'superseded', label: 'Superseded' },
                      ]}
                    />
                    <Select
                      size="large"
                      style={{ minWidth: token.controlHeight * 5 }}
                      value={divisionFilter}
                      onChange={setDivisionFilter}
                      options={[
                        { value: 'all', label: 'All divisions' },
                        ...divisions.map((d) => ({ value: d, label: `Division ${d}` })),
                      ]}
                    />
                  </Flex>
                </Flex>
              </div>

              {filtered.length === 0 ? (
                <div style={{ padding: token.paddingLG * 2 }}>
                  <Empty description="No guide language matches these filters.">
                    <Button
                      type="primary"
                      size="large"
                      onClick={() => {
                        setDraftQuery('');
                        setQuery('');
                        setStatusFilter('all');
                        setDivisionFilter('all');
                      }}
                    >
                      Clear filters
                    </Button>
                  </Empty>
                </div>
              ) : (
                <Flex vertical>
                  {filtered.map((guide) => {
                    const active = guide.id === selectedId;
                    return (
                      <div
                        key={guide.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedId(guide.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setSelectedId(guide.id);
                          }
                        }}
                        style={{
                          cursor: 'pointer',
                          paddingBlock: token.padding,
                          paddingInline: token.paddingMD,
                          background: active ? token.colorPrimaryBg : undefined,
                          borderBlockEnd: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                          borderInlineStart: `${token.lineWidthBold}px ${token.lineType} ${
                            active ? token.colorPrimary : 'transparent'
                          }`,
                        }}
                      >
                        <Flex vertical gap={token.marginXXS} style={{ width: '100%' }}>
                          <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>{guide.title}</Typography.Text>
                          <Flex gap={token.marginXS} wrap="wrap" align="center">
                            <Badge
                              status={guideApprovalBadgeStatus(guide.approvalStatus)}
                              text={guideApprovalStatusLabel[guide.approvalStatus]}
                            />
                            <HydraTag style={{ borderWidth: 0 }}>{guide.version}</HydraTag>
                            <Typography.Text type="secondary">
                              {guide.sectionNumber} · {guide.productFamily}
                            </Typography.Text>
                          </Flex>
                        </Flex>
                      </div>
                    );
                  })}
                </Flex>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={14}>
            {!selected ? (
              <Card>
                <Empty description="Select guide language to review." />
              </Card>
            ) : (
              <Flex vertical gap={token.marginMD}>
                {selected.approvalStatus === 'superseded' ? (
                  <Alert
                    type="error"
                    showIcon
                    title="Superseded — insert blocked"
                    description="This fixture marks insert as blocked. Choose an Approved version instead."
                  />
                ) : selected.insertPermission === 'warn' ? (
                  <Alert
                    type="warning"
                    showIcon
                    title={`${guideApprovalStatusLabel[selected.approvalStatus]} — insert needs confirmation`}
                    description="Approved guide language inserts normally. Draft and In review require an explicit warning before the merge preview."
                  />
                ) : (
                  <Alert
                    type="success"
                    showIcon
                    title="Approved — ready to insert"
                    description="Preview the merge into a working copy. Insert creates a pending Edit change; it does not rewrite the source."
                  />
                )}

                <Card title={selected.title}>
                  <Descriptions
                    size="small"
                    column={1}
                    items={[
                      {
                        key: 'meta',
                        label: 'Section',
                        children: `${selected.sectionNumber} — ${selected.sectionTitle}`,
                      },
                      {
                        key: 'product',
                        label: 'Product family',
                        children: selected.productFamily,
                      },
                      {
                        key: 'app',
                        label: 'Application',
                        children: selected.application,
                      },
                      {
                        key: 'jur',
                        label: 'Jurisdiction',
                        children: selected.jurisdiction,
                      },
                      {
                        key: 'owner',
                        label: 'Content owner',
                        children: selected.owner,
                      },
                      {
                        key: 'ver',
                        label: 'Version',
                        children: selected.version,
                      },
                      {
                        key: 'reviewed',
                        label: 'Last reviewed',
                        children: new Date(selected.lastReviewedAt).toLocaleDateString(),
                      },
                    ]}
                  />
                  {selected.adoptionPlaceholder ? (
                    <Typography.Paragraph type="secondary" style={{ marginTop: token.marginMD }}>
                      {selected.adoptionPlaceholder}
                    </Typography.Paragraph>
                  ) : null}
                </Card>

                <Card title="Guide language editor">
                  <Flex vertical gap={token.marginSM}>
                    <Input.TextArea
                      rows={4}
                      value={editorDraft}
                      onChange={(e) => setEditorDraft(e.target.value)}
                      disabled={
                        !editable ||
                        selected.approvalStatus === 'approved' ||
                        selected.approvalStatus === 'superseded'
                      }
                    />
                    <Flex gap={token.marginXS} wrap="wrap">
                      <Button
                        size="large"
                        disabled={
                          !editable ||
                          selected.approvalStatus === 'approved' ||
                          selected.approvalStatus === 'superseded'
                        }
                        onClick={() => void saveGuideDraft()}
                      >
                        Save draft
                      </Button>
                      <Typography.Text type="secondary">
                        Approved and superseded entries stay read-only.
                      </Typography.Text>
                    </Flex>
                  </Flex>
                </Card>

                <Card title="Snippets">
                  <Flex vertical gap={token.marginSM}>
                    <Select
                      size="large"
                      style={{ width: '100%' }}
                      value={selectedSnippetId}
                      onChange={setSelectedSnippetId}
                      options={selected.snippets.map((s) => ({
                        value: s.id,
                        label: `${s.title} (${s.suggestedLabel})`,
                      }))}
                    />
                    {selectedSnippet ? (
                      <div
                        style={{
                          padding: token.paddingMD,
                          background: token.colorFillQuaternary,
                          borderRadius: token.borderRadiusLG,
                        }}
                      >
                        <Typography.Paragraph style={{ marginBottom: 0 }}>
                          {selectedSnippet.body}
                        </Typography.Paragraph>
                      </div>
                    ) : null}

                    <Select
                      size="large"
                      style={{ width: '100%' }}
                      placeholder="Insert into specification…"
                      value={targetDocumentId}
                      onChange={setTargetDocumentId}
                      options={readyDocuments.map((d) => ({
                        value: d.id,
                        label: d.title,
                      }))}
                      notFoundContent={
                        <Typography.Text type="secondary">
                          No ready specifications in this scenario.
                        </Typography.Text>
                      }
                    />

                    <Button
                      type="primary"
                      size="large"
                      disabled={!editable || selected.insertPermission === 'blocked' || !targetDocumentId}
                      onClick={() => void openMergePreview()}
                    >
                      Preview insert into working copy
                    </Button>
                  </Flex>
                </Card>

                <Card title="Export choices (mocked)">
                  <Flex vertical gap={token.marginMD}>
                    <Row gutter={[token.marginSM, token.marginSM]}>
                      {GUIDE_EXPORT_CHOICES.map((choice) => (
                        <Col key={choice.key} xs={24} sm={8}>
                          <ExportCard
                            title={choice.title}
                            description={choice.description}
                            selected={exportKey === choice.key}
                            onClick={() => setExportKey(choice.key)}
                            icon={
                              choice.key === 'docx' ? (
                                <FileWordOutlined />
                              ) : (
                                <FileTextOutlined />
                              )
                            }
                            endAffordance={
                              exportKey === choice.key ? <CheckOutlined /> : undefined
                            }
                          />
                        </Col>
                      ))}
                    </Row>
                    <Button size="large" disabled={!editable} onClick={runMockExport}>
                      Mock export selected format
                    </Button>
                  </Flex>
                </Card>
              </Flex>
            )}
          </Col>
        </Row>
      )}

      <Modal
        title="Merge preview"
        open={previewOpen}
        onCancel={() => {
          setPreviewOpen(false);
          setPreview(null);
        }}
        destroyOnHidden
        footer={
          <Flex gap={token.marginXS} justify="flex-end" wrap="wrap">
            <Button
              size="large"
              onClick={() => {
                setPreviewOpen(false);
                setPreview(null);
              }}
            >
              Cancel — no change
            </Button>
            <Button
              type="primary"
              size="large"
              loading={inserting}
              disabled={!preview?.canInsert}
              onClick={() => void confirmInsert((preview?.conflicts.length ?? 0) > 0)}
            >
              {preview && preview.conflicts.length > 0
                ? 'Resolve conflicts and insert'
                : 'Insert as pending change'}
            </Button>
          </Flex>
        }
        width={720}
      >
        {preview ? (
          <Flex vertical gap={token.marginMD}>
            <Alert
              type="info"
              showIcon
              title="Review before inserting"
              description="Cancel leaves the working copy unchanged. Confirm creates a pending Edit change with a guide version trace."
            />
            <Descriptions
              size="small"
              column={1}
              items={[
                {
                  key: 'guide',
                  label: 'Guide version',
                  children: preview.guideVersion,
                },
                {
                  key: 'numbering',
                  label: 'Numbering',
                  children: preview.numberingNote,
                },
                {
                  key: 'labels',
                  label: 'Clause labels',
                  children: `${preview.currentLabel ?? '—'} → ${preview.proposedLabel}`,
                },
              ]}
            />
            {preview.conflicts.length > 0 ? (
              <Alert
                type="warning"
                showIcon
                title="Conflicts to resolve"
                description={
                  <Flex vertical gap={token.marginXXS}>
                    {preview.conflicts.map((c) => (
                      <Typography.Text key={c}>{c}</Typography.Text>
                    ))}
                  </Flex>
                }
              />
            ) : null}
            <Card size="small" title="Affected paragraph">
              <Flex vertical gap={token.marginSM}>
                <Typography.Text delete type="secondary">
                  {preview.originalText}
                </Typography.Text>
                <Typography.Text>{preview.proposedText}</Typography.Text>
              </Flex>
            </Card>
          </Flex>
        ) : null}
      </Modal>
    </Flex>
  );
}
