import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { BomTablePaginationBar } from '../../bom/components/BomTablePaginationBar';
import { BomPageHeader } from '../../bom/layout/BomPageHeader';
import { projectTitleById } from '../../shell/projectSeed';
import { shellLayout } from '../../theme/hydraAlias';
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  Divider,
  Drawer,
  Empty,
  Flex,
  Radio,
  Row,
  Select,
  Skeleton,
  Tabs,
  Tooltip,
  Typography,
  theme,
} from '../../ui/antd';
import { SpecAnalysisFailedModal } from '../components/SpecAnalysisFailedModal';
import { SpecAnalysisProgressStrip } from '../components/SpecAnalysisProgressStrip';
import { SpecDocumentViewer } from '../components/SpecDocumentViewer';
import { SpecRecommendationCard } from '../components/SpecRecommendationCard';
import { SpecReanalysisCompletion } from '../components/SpecReanalysisCompletion';
import { SpecReanalysisProgress } from '../components/SpecReanalysisProgress';
import {
  RECOMMENDATION_ACTION_ORDER,
  recommendationActionLabel,
  systemTypeDivision,
  systemTypeLabel,
} from '../constants/specStatusVocabulary';
import {
  SPEC_UPLOAD_ACCEPT_ATTRIBUTE,
  specFileTypeFromName,
  validateSpecUpload,
} from '../constants/specUploadLimits';
import {
  projectStagesToV2,
  specWorkflowPrimaryActionLabel,
  v2CurrentStepCopy,
  v2ProcessingPercent,
  V2_PROCESSING_STAGE_ORDER,
} from '../constants/specWorkflowStatus';
import { useSpecWorkspace } from '../context/SpecWorkspaceContext';
import {
  mockSpecAnalysisRepository,
  mockSpecSectionRepository,
} from '../data/repositories/specRepositories';
import { ensureSpecReanalysisTicker, useSpecMockStore } from '../data/specMockStore';
import type {
  SpecCitation,
  SpecDocumentBlock,
  SpecRecommendation,
  SpecRecommendationAction,
  SpecRecommendationDecision,
  SpecSection,
} from '../data/types';
import { useSpecDeepLink } from '../hooks/useSpecDeepLink';
import { useSpecDocument } from '../hooks/useSpecDocument';
import { useSpecProcessingSimulation } from '../hooks/useSpecProcessingSimulation';
import { trackSpecEvent } from '../specAnalytics';
import { specEditPath, specExportPath } from '../specNavigation';

type RecommendationActionFilter = 'all' | SpecRecommendationAction;
type RecommendationStatusFilter = 'all' | SpecRecommendationDecision;

function specEditPathForRecommendation(
  specId: string,
  recommendation: SpecRecommendation,
): string {
  const params = new URLSearchParams({
    recommendation: recommendation.id,
    section: recommendation.sectionId,
    citation: recommendation.sourceCitation.id,
    version: recommendation.customerVersionLabel,
  });
  return `${specEditPath(specId)}?${params.toString()}`;
}

function isToReviewDecision(decision: SpecRecommendationDecision): boolean {
  return decision === 'not-reviewed' || decision === 'later';
}

function isClosedDecision(decision: SpecRecommendationDecision): boolean {
  return decision === 'accepted' || decision === 'denied';
}

function analysisSummary(recommendations: SpecRecommendation[]): string {
  const remaining = recommendations.filter((recommendation) =>
    isToReviewDecision(recommendation.decision),
  ).length;
  const product = recommendations.filter(
    (recommendation) => recommendation.type === 'product',
  ).length;
  if (remaining === 0) {
    return 'All recommended changes have been reviewed. Export when you are ready, or continue in the editor if you need further edits.';
  }
  if (product > 0) {
    return 'The specification can be improved with clearer ASC-friendly language and several product-related updates. Review the remaining recommended changes before continuing to the editor.';
  }
  return 'The specification is generally aligned. Review the recommended changes before continuing to the editor.';
}

export function SpecAnalyzePage() {
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { specId = '' } = useParams<{ specId: string }>();
  const { document, loading, error } = useSpecDocument(specId);
  const store = useSpecMockStore();
  const workspace = useSpecWorkspace();
  const deepLink = useSpecDeepLink();
  const { retry, replaceFile } = useSpecProcessingSimulation(document);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const pageSize = shellLayout.tablePageSizeDefault;

  const [sections, setSections] = useState<SpecSection[]>([]);
  const [recommendations, setRecommendations] = useState<SpecRecommendation[]>([]);
  const [blocks, setBlocks] = useState<SpecDocumentBlock[]>([]);
  const [panelLoading, setPanelLoading] = useState(true);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<RecommendationActionFilter>('all');
  const [statusFilter, setStatusFilter] = useState<RecommendationStatusFilter>('all');
  const [listPage, setListPage] = useState(1);
  const [sourceCitation, setSourceCitation] = useState<SpecCitation>();
  const [documentOpen, setDocumentOpen] = useState(false);
  const [failedModalOpen, setFailedModalOpen] = useState(false);
  const [retryingFailed, setRetryingFailed] = useState(false);
  const [dismissedReanalysisRunId, setDismissedReanalysisRunId] = useState<string>();

  useEffect(() => {
    if (document) {
      workspace.setDocumentId(document.id);
      trackSpecEvent('spec_analyze_opened', { documentId: document.id });
      if (document.processingState === 'failed') {
        setFailedModalOpen(true);
      }
      if (
        document.reanalysisRun?.status === 'queued' ||
        document.reanalysisRun?.status === 'processing'
      ) {
        ensureSpecReanalysisTicker();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document?.id, document?.processingState, document?.reanalysisRun?.status]);

  useEffect(() => {
    if (!document) return;
    const analysisRunning =
      document.processingState === 'queued' ||
      document.processingState === 'processing';
    if (analysisRunning) {
      setPanelLoading(false);
      setRecommendations([]);
      setSections([]);
      setBlocks([]);
      return;
    }
    let cancelled = false;
    setPanelLoading(true);
    void Promise.all([
      mockSpecSectionRepository.listByDocument(document.id),
      mockSpecAnalysisRepository.listRecommendations(document.id),
      mockSpecAnalysisRepository.listBlocks(document.id),
    ])
      .then(([sectionList, recommendationList, blockList]) => {
        if (cancelled) return;
        setSections(sectionList);
        setRecommendations(recommendationList);
        setBlocks(blockList);
        if (deepLink.section && sectionList.some((section) => section.id === deepLink.section)) {
          setSelectedSectionId(deepLink.section);
        }
      })
      .finally(() => {
        if (!cancelled) setPanelLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    document?.id,
    document?.processingState,
    document?.reanalysisRun?.status,
    store.scenarioId,
    store.documents,
  ]);

  useEffect(() => {
    if (!deepLink.citation) {
      setSourceCitation(undefined);
      return;
    }
    let cancelled = false;
    void mockSpecAnalysisRepository.getCitation(deepLink.citation).then((citation) => {
      if (!cancelled && citation) {
        setSourceCitation(citation);
        setDocumentOpen(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [deepLink.citation]);

  const openCitation = (citation: SpecCitation) => {
    setSourceCitation(citation);
    setDocumentOpen(true);
    workspace.openCitation(citation);
    deepLink.writeDeepLink({
      section: citation.sectionId,
      citation: citation.id,
      version: document?.versionLabel,
    });
    trackSpecEvent('spec_citation_opened', {
      citationId: citation.id,
      anchorType: citation.anchorType,
    });
  };

  const filteredRecommendations = useMemo(
    () =>
      recommendations.filter((recommendation) => {
        if (
          selectedSectionId !== 'all' &&
          recommendation.sectionId !== selectedSectionId
        ) {
          return false;
        }
        if (actionFilter !== 'all' && recommendation.action !== actionFilter) {
          return false;
        }
        if (statusFilter === 'not-reviewed') {
          if (!isToReviewDecision(recommendation.decision)) {
            return false;
          }
        } else if (statusFilter !== 'all' && recommendation.decision !== statusFilter) {
          return false;
        }
        return true;
      }),
    [actionFilter, recommendations, selectedSectionId, statusFilter],
  );

  const assessmentCounts = useMemo(
    () => ({
      total: recommendations.length,
      toReview: recommendations.filter((recommendation) =>
        isToReviewDecision(recommendation.decision),
      ).length,
      reviewed: recommendations.filter((recommendation) =>
        isClosedDecision(recommendation.decision),
      ).length,
    }),
    [recommendations],
  );

  const actionCounts = useMemo(() => {
    const countsByAction = Object.fromEntries(
      RECOMMENDATION_ACTION_ORDER.map((action) => [action, 0]),
    ) as Record<SpecRecommendationAction, number>;
    for (const recommendation of recommendations) {
      countsByAction[recommendation.action] += 1;
    }
    return {
      all: recommendations.length,
      ...countsByAction,
    };
  }, [recommendations]);

  useEffect(() => {
    setListPage(1);
  }, [selectedSectionId, actionFilter, statusFilter]);

  useEffect(() => {
    const pageCount = Math.max(1, Math.ceil(filteredRecommendations.length / pageSize));
    if (listPage > pageCount) setListPage(pageCount);
  }, [filteredRecommendations.length, listPage, pageSize]);

  useEffect(() => {
    if (actionFilter !== 'all' && actionCounts[actionFilter] === 0) {
      setActionFilter('all');
    }
    if (statusFilter === 'later') {
      setStatusFilter('not-reviewed');
    }
  }, [actionFilter, actionCounts, statusFilter]);

  const pagedRecommendations = useMemo(() => {
    const start = (listPage - 1) * pageSize;
    return filteredRecommendations.slice(start, start + pageSize);
  }, [filteredRecommendations, listPage, pageSize]);

  if (loading) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

  if (error || !document) {
    return (
      <Alert type="error" showIcon title={error ?? 'Specification not found.'} />
    );
  }

  const division = document.divisionHint ?? systemTypeDivision[document.systemType];
  const projectName = document.projectId
    ? projectTitleById(document.projectId)
    : undefined;
  const analysisIsCurrent = !document.reanalysisRequired;
  const analysisRunning =
    document.processingState === 'queued' || document.processingState === 'processing';
  const analysisFailed = document.processingState === 'failed';
  const exportBlocked = analysisFailed || !analysisIsCurrent;
  const exportExplanation = analysisFailed
    ? 'Export is unavailable until analysis finishes successfully.'
    : analysisIsCurrent
      ? undefined
      : 'Export is blocked until the document is re-analyzed.';
  const reanalysisInProgress =
    document.reanalysisRun?.status === 'queued' ||
    document.reanalysisRun?.status === 'processing';
  const reanalysisSummary =
    document.reanalysisRun?.status === 'complete' ? document.reanalysisRun.summary : undefined;
  const showReanalysisCompletion =
    reanalysisSummary != null &&
    document.reanalysisRun != null &&
    dismissedReanalysisRunId !== document.reanalysisRun.id;
  const reviewBusy = analysisRunning || reanalysisInProgress || analysisFailed;
  const hasStartedReview = recommendations.some(
    (recommendation) => recommendation.decision !== 'not-reviewed',
  );
  const reviewCtaLabel =
    specWorkflowPrimaryActionLabel[hasStartedReview ? 'in-review' : 'ready-to-review'];
  const focusRecommendation =
    recommendations.find((recommendation) => recommendation.decision === 'not-reviewed') ??
    recommendations[0];

  const openRecommendation = (recommendation: SpecRecommendation) => {
    workspace.setSectionId(recommendation.sectionId);
    trackSpecEvent('spec_recommendation_review_started', {
      documentId: document.id,
      recommendationId: recommendation.id,
      source: 'dashboard',
    });
    navigate(specEditPathForRecommendation(document.id, recommendation));
  };

  const retryAnalysis = () => {
    setRetryingFailed(true);
    void retry()
      .then(() => {
        message.success('Processing restarted.');
        setFailedModalOpen(false);
      })
      .finally(() => setRetryingFailed(false));
  };

  const closeDocument = () => {
    setDocumentOpen(false);
    setSourceCitation(undefined);
    workspace.clearHighlight();
    deepLink.writeDeepLink({ citation: '' });
  };

  const statusTabItems = [
    { key: 'all', label: 'All' },
    { key: 'not-reviewed', label: 'To review' },
    { key: 'accepted', label: 'Resolved' },
    { key: 'denied', label: 'Denied' },
  ];

  const actionTabOptions: { value: RecommendationActionFilter; label: string }[] = [
    { value: 'all', label: `All actions (${actionCounts.all})` },
    ...RECOMMENDATION_ACTION_ORDER.filter((action) => actionCounts[action] > 0).map(
      (action) => ({
        value: action,
        label: `${recommendationActionLabel[action]} (${actionCounts[action]})`,
      }),
    ),
  ];

  const metricCardStyle = (accent: string) => ({
    flex: '1 1 0%',
    minWidth: token.controlHeight * 4,
    background: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowTertiary,
    borderLeft: `${token.sizeUnit}px solid ${accent}`,
    paddingBlock: token.paddingSM,
    paddingInlineStart: token.paddingLG,
    paddingInlineEnd: token.paddingMD,
  });

  const headerActions = (
    <Flex gap={token.marginXS} wrap="wrap">
      <Tooltip title={exportExplanation}>
        <Button
          size="large"
          disabled={exportBlocked || analysisRunning || reanalysisInProgress}
          onClick={() => navigate(specExportPath(document.id))}
        >
          Export
        </Button>
      </Tooltip>
      {recommendations.length > 0 && !reviewBusy ? (
        <Button
          type="primary"
          size="large"
          onClick={() => openRecommendation(focusRecommendation)}
        >
          {reviewCtaLabel}
        </Button>
      ) : null}
    </Flex>
  );

  return (
    <>
      <Flex vertical gap={token.marginLG} style={{ width: '100%' }}>
        <BomPageHeader
          title={document.title}
          titleVariant="heading4"
          description={
            <Flex gap={token.marginXS} wrap="wrap" align="center">
              <Typography.Text type="secondary">
                {analysisRunning
                  ? 'Analysis in progress'
                  : reanalysisInProgress
                    ? 'Re-analysis in progress'
                    : document.processingState === 'partial'
                      ? 'Partial analysis'
                      : document.processingState === 'failed'
                        ? 'Analysis failed'
                        : 'Analysis complete'}
              </Typography.Text>
              <Typography.Text type="secondary">•</Typography.Text>
              <Typography.Text type="secondary">
                Division {division} — {systemTypeLabel[document.systemType]}
              </Typography.Text>
              <Typography.Text type="secondary">•</Typography.Text>
              <Typography.Text type="secondary">
                Master SPEC Version {document.ascMaster?.version ?? 'Not recorded'}
              </Typography.Text>
            </Flex>
          }
          actions={headerActions}
        />

        {analysisRunning ? (
          <SpecAnalysisProgressStrip
            title={`Analysis in progress for "${document.title}"`}
            stepDetail={`Current step: ${v2CurrentStepCopy(document, document.stages)} · ${
              projectStagesToV2(document.stages).filter((stage) => stage.state === 'done').length
            } of ${V2_PROCESSING_STAGE_ORDER.length} steps complete`}
            percent={v2ProcessingPercent(document.stages, document.processingState)}
            categoryLine={`Division ${division} — ${systemTypeLabel[document.systemType]}`}
          />
        ) : null}

        {reanalysisInProgress && document.reanalysisRun ? (
          <SpecReanalysisProgress document={document} run={document.reanalysisRun} />
        ) : null}

        {showReanalysisCompletion && reanalysisSummary ? (
          <Card>
            <SpecReanalysisCompletion
              summary={reanalysisSummary}
              onReturn={() => {
                setDismissedReanalysisRunId(document.reanalysisRun?.id);
              }}
            />
            <Flex justify="flex-end" style={{ marginTop: token.marginSM }}>
              <Button
                type="link"
                onClick={() => setDismissedReanalysisRunId(document.reanalysisRun?.id)}
              >
                Dismiss
              </Button>
            </Flex>
          </Card>
        ) : null}

        {document.processingState === 'partial' ? (
          <Alert
            type="warning"
            showIcon
            title="Partial results"
            description="Some sections are still processing. Finished sections are available below."
          />
        ) : null}

        {panelLoading ? (
          <Skeleton active paragraph={{ rows: 10 }} />
        ) : analysisRunning ? (
          <Flex vertical gap={token.marginLG} style={{ width: '100%' }}>
            <Skeleton active paragraph={{ rows: 4 }} />
            <Card>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Analysis is still running. Recommendations will appear here when it finishes."
              />
            </Card>
          </Flex>
        ) : analysisFailed ? (
          <Card>
            <Flex vertical gap={token.marginLG}>
              <Alert
                type="error"
                showIcon
                title="Analysis could not finish"
                description={
                  document.failureReason ??
                  'Retry analysis or replace the file. The current customer version is kept.'
                }
              />
              <Flex vertical gap={token.marginXXS}>
                <Typography.Text type="secondary">Saved analysis input</Typography.Text>
                <Typography.Text>File: {document.fileName}</Typography.Text>
                <Typography.Text>
                  Division {division} — {systemTypeLabel[document.systemType]}
                </Typography.Text>
                <Typography.Text>
                  Master SPEC Version {document.ascMaster?.version ?? 'Not recorded'}
                </Typography.Text>
              </Flex>
              <Flex gap={token.marginXS} wrap="wrap">
                <Button size="large" onClick={() => replaceInputRef.current?.click()}>
                  Replace file
                </Button>
                <Button
                  type="primary"
                  size="large"
                  loading={retryingFailed}
                  onClick={retryAnalysis}
                >
                  Retry analysis
                </Button>
              </Flex>
            </Flex>
          </Card>
        ) : recommendations.length === 0 ? (
          <Card>
            <Flex vertical gap={token.marginLG} align="center">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Flex vertical gap={token.marginXS} align="center">
                    <Typography.Title level={4} style={{ margin: 0 }}>
                      0 recommendations
                    </Typography.Title>
                    <Typography.Text type="secondary">
                      Analysis completed successfully. This customer SPEC already aligns
                      with Master SPEC Version {document.ascMaster?.version ?? 'Not recorded'} and the selected checks.
                    </Typography.Text>
                  </Flex>
                }
              />
              <Flex gap={token.marginXS} wrap="wrap">
                <Button
                  size="large"
                  onClick={() => {
                    setSourceCitation(undefined);
                    setDocumentOpen(true);
                  }}
                >
                  Open document
                </Button>
                <Tooltip title={exportExplanation}>
                  <Button
                    type="primary"
                    size="large"
                    disabled={exportBlocked}
                    onClick={() => navigate(specExportPath(document.id))}
                  >
                    Export
                  </Button>
                </Tooltip>
              </Flex>
              {!analysisIsCurrent ? (
                <Typography.Text type="secondary">
                  Export is blocked until the document is re-analyzed.
                </Typography.Text>
              ) : null}
            </Flex>
          </Card>
        ) : (
          <>
            <Flex
              align="center"
              gap={token.marginSM}
              wrap="nowrap"
              style={{
                width: '100%',
                background: token.colorFillQuaternary,
                padding: token.paddingMD,
                borderRadius: token.borderRadius,
              }}
            >
              <Flex
                vertical
                gap={token.marginXS}
                style={{ flex: '1 1 0%', minWidth: 0 }}
              >
                <Typography.Title level={5} style={{ margin: 0 }}>
                  Overall assessment
                </Typography.Title>
                <Typography.Text style={{ color: token.colorTextDescription }}>
                  {analysisSummary(recommendations)}
                </Typography.Text>
              </Flex>
              <Flex gap={token.padding} wrap="nowrap" style={{ flex: '1 1 0%', minWidth: 0 }}>
                {(
                  [
                    {
                      label: 'Recommendations',
                      value: String(assessmentCounts.total),
                      accent: token.colorSuccessBorder,
                    },
                    {
                      label: 'To review',
                      value: String(assessmentCounts.toReview),
                      accent: token.colorWarningBorder,
                    },
                    {
                      label: 'Reviewed',
                      value: `${assessmentCounts.reviewed} / ${assessmentCounts.total}`,
                      accent: token.colorInfoBorder,
                    },
                  ] as const
                ).map((metric) => (
                  <Flex
                    key={metric.label}
                    align="center"
                    justify="space-between"
                    gap={token.marginSM}
                    style={metricCardStyle(metric.accent)}
                  >
                    <Typography.Text style={{ color: token.colorTextDescription }}>
                      {metric.label}
                    </Typography.Text>
                    <Typography.Title
                      level={3}
                      style={{
                        margin: 0,
                        textAlign: 'right',
                        color: token.colorText,
                        flexShrink: 0,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {metric.value}
                    </Typography.Title>
                  </Flex>
                ))}
              </Flex>
            </Flex>

            <Card
              style={{
                borderRadius: token.borderRadiusLG,
                boxShadow: token.boxShadowTertiary,
              }}
              styles={{ body: { padding: token.padding } }}
            >
              <Flex vertical gap={token.paddingSM}>
                <Flex vertical gap={token.paddingSM}>
                  <Typography.Title level={5} style={{ margin: 0 }}>
                    {`Recommendations (${recommendations.length})`}
                  </Typography.Title>
                  <Divider style={{ margin: 0 }} />
                </Flex>

                <Tabs
                  activeKey={statusFilter === 'later' ? 'not-reviewed' : statusFilter}
                  aria-label="Review status"
                  tabBarGutter={token.paddingXL}
                  tabBarStyle={{ marginBottom: 0 }}
                  styles={{ content: { display: 'none' } }}
                  onChange={(key) =>
                    setStatusFilter(key as RecommendationStatusFilter)
                  }
                  items={statusTabItems}
                />

                <Flex gap={token.marginSM} align="center" wrap="wrap">
                  <Select
                    value={selectedSectionId}
                    aria-label="All sections"
                    onChange={(value) => {
                      setSelectedSectionId(value);
                      if (value === 'all') {
                        deepLink.writeDeepLink({ section: '' });
                        return;
                      }
                      workspace.setSectionId(value);
                      deepLink.writeDeepLink({
                        section: value,
                        version: document.versionLabel,
                      });
                      trackSpecEvent('spec_section_selected', { sectionId: value });
                    }}
                    style={{ width: token.controlHeight * 8 }}
                    options={[
                      { value: 'all', label: 'All sections' },
                      ...sections.map((section) => ({
                        value: section.id,
                        label: `${section.sectionNumber} — ${section.title}`,
                      })),
                    ]}
                  />
                  <Radio.Group
                    value={actionFilter}
                    optionType="button"
                    aria-label="Recommendation action"
                    onChange={(event) =>
                      setActionFilter(event.target.value as RecommendationActionFilter)
                    }
                    options={actionTabOptions}
                    style={{ display: 'flex', flexWrap: 'wrap', rowGap: token.marginXXS }}
                  />
                </Flex>

                {filteredRecommendations.length === 0 ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No recommendations match these filters."
                  >
                    <Button
                      onClick={() => {
                        setSelectedSectionId('all');
                        setActionFilter('all');
                        setStatusFilter('all');
                        deepLink.writeDeepLink({ section: '' });
                      }}
                    >
                      Clear filters
                    </Button>
                  </Empty>
                ) : (
                  <Row gutter={[token.paddingXS, token.paddingXS]}>
                    {pagedRecommendations.map((recommendation) => (
                      <Col key={recommendation.id} xs={24} lg={8}>
                        <SpecRecommendationCard
                          recommendation={recommendation}
                          onReview={openRecommendation}
                        />
                      </Col>
                    ))}
                  </Row>
                )}
              </Flex>
              {filteredRecommendations.length > 0 ? (
                <BomTablePaginationBar
                  current={listPage}
                  total={filteredRecommendations.length}
                  onChange={setListPage}
                  pageSize={pageSize}
                  summary={
                    <Typography.Text type="secondary">
                      {filteredRecommendations.length} of {recommendations.length} recommendations
                    </Typography.Text>
                  }
                />
              ) : null}
            </Card>
          </>
        )}

        <Drawer
          title={sourceCitation ? 'Source evidence' : document.title}
          open={documentOpen}
          onClose={closeDocument}
          width={token.controlHeight * 18}
        >
          <Flex vertical gap={token.marginSM}>
            {sourceCitation ? (
              <Typography.Text type="secondary">
                Exact source · Page {sourceCitation.page}
              </Typography.Text>
            ) : (
              <Typography.Text type="secondary">
                Customer SPEC {document.versionLabel} · {projectName ?? 'Project document'}
              </Typography.Text>
            )}
            <SpecDocumentViewer
              blocks={
                sourceCitation
                  ? blocks.filter((block) => block.sectionId === sourceCitation.sectionId)
                  : selectedSectionId === 'all'
                    ? blocks
                    : blocks.filter((block) => block.sectionId === selectedSectionId)
              }
              highlightBlockId={sourceCitation?.blockId}
              approximateCitation={
                sourceCitation ? sourceCitation.anchorType !== 'exact' : undefined
              }
            />
          </Flex>
        </Drawer>
      </Flex>

      <SpecAnalysisFailedModal
        open={failedModalOpen && document.processingState === 'failed'}
        document={document}
        retrying={retryingFailed}
        onCancel={() => setFailedModalOpen(false)}
        onRetry={retryAnalysis}
        onReplaceFile={() => replaceInputRef.current?.click()}
      />

      <input
        ref={replaceInputRef}
        type="file"
        accept={SPEC_UPLOAD_ACCEPT_ATTRIBUTE}
        style={{ display: 'none' }}
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          event.target.value = '';
          if (!file) return;
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
          void replaceFile({
            fileName: file.name,
            fileType,
            fileSizeBytes: file.size,
          }).then(() => {
            message.success('File replaced. Analysis restarted.');
            setFailedModalOpen(false);
          });
        }}
      />
    </>
  );
}
