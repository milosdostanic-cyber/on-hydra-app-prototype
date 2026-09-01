import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { BomPageHeader } from '../../bom/layout/BomPageHeader';
import { PageBackButton } from '../../shell/PageBackButton';
import { projectTitleById } from '../../shell/projectSeed';
import {
  Alert,
  App,
  Button,
  Card,
  Divider,
  Flex,
  Modal,
  Progress,
  Radio,
  Typography,
  theme,
} from '../../ui/antd';
import { SpecProjectOutputModal } from '../components/SpecProjectOutputModal';
import { systemTypeDivision } from '../constants/specStatusVocabulary';
import {
  mockSpecAnalysisRepository,
  mockSpecExportRepository,
  mockSpecProjectOutputRepository,
} from '../data/repositories/specRepositories';
import {
  ensureSpecExportTicker,
  useSpecMockStore,
} from '../data/specMockStore';
import type {
  SpecDocument,
  SpecProjectOutputKind,
  SpecProjectOutputMode,
  SpecRecommendation,
} from '../data/types';
import { specAnalyzePath, specHomePath } from '../specNavigation';

const DOCUMENT_CHOICES = [
  {
    value: 'clean-final' as const,
    title: 'Clean final document',
    description: 'Accepted edits only. No revision history.',
  },
  {
    value: 'revision-history' as const,
    title: 'Revised document with revision history',
    description: 'Accepted edits in the document, plus a change log appendix.',
  },
  {
    value: 'comparison-appendix' as const,
    title: 'Original document with comparison appendix',
    description: 'Original document, with suggested changes in a detailed appendix.',
  },
];

function customerVersionCopy(document: SpecDocument): string {
  if (document.versionNumber != null) return `Version ${document.versionNumber}`;
  const stripped = document.versionLabel.replace(/^v/i, '');
  return /^\d+$/.test(stripped) ? `Version ${stripped}` : document.versionLabel;
}

function acceptedProductRecommendations(recommendations: SpecRecommendation[]) {
  return recommendations.filter(
    (recommendation) =>
      recommendation.decision === 'accepted' && recommendation.productEvidence.length > 0,
  );
}

function exportAssessmentCopy({
  title,
  versionCopy,
  division,
  masterVersion,
  accepted,
  undecided,
}: {
  title: string;
  versionCopy: string;
  division: string;
  masterVersion: string;
  accepted: number;
  undecided: number;
}): string {
  const identity = `${title} — ${versionCopy} was analyzed with ASC Master SPEC — Division ${division} — Version ${masterVersion}.`;
  if (undecided > 0) {
    return `${identity} Export is available even when some recommendations are still to review. Those items remain as they appear in the working copy.`;
  }
  if (accepted > 0) {
    return `${identity} Accepted edits are ready to export. You can also create ConnectED Actions from approved product recommendations.`;
  }
  return `${identity} No recommendations were accepted. Export keeps the working copy as it stands.`;
}

function downloadMockDocument(fileName: string, body: string) {
  const blob = new Blob([body], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const anchor = window.document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  window.document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function SpecExportPage() {
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { specId = '' } = useParams<{ specId: string }>();
  const store = useSpecMockStore();
  const document = store.documents.find((entry) => entry.id === specId);
  const [recommendations, setRecommendations] = useState<SpecRecommendation[]>([]);
  const [choice, setChoice] = useState<(typeof DOCUMENT_CHOICES)[number]['value']>(
    'clean-final',
  );
  const [starting, setStarting] = useState(false);
  const [undecidedWarningOpen, setUndecidedWarningOpen] = useState(false);
  const [outputKind, setOutputKind] = useState<SpecProjectOutputKind | null>(null);
  const [outputMode, setOutputMode] = useState<SpecProjectOutputMode>('create');
  const [outputName, setOutputName] = useState('');
  const [existingId, setExistingId] = useState<string>();
  const [submittingOutput, setSubmittingOutput] = useState(false);

  useEffect(() => {
    if (document?.exportRun?.status === 'generating') {
      ensureSpecExportTicker();
    }
  }, [document?.id, document?.exportRun?.status]);

  useEffect(() => {
    if (!document) return;
    void mockSpecAnalysisRepository.listRecommendations(document.id).then(setRecommendations);
  }, [document?.id, store.recommendationReviews, store.scenarioId]);

  const projectTitle = document?.projectId
    ? projectTitleById(document.projectId) ?? 'Project'
    : 'Not linked to a Project';
  const accepted = recommendations.filter((item) => item.decision === 'accepted').length;
  const denied = recommendations.filter((item) => item.decision === 'denied').length;
  const undecided = recommendations.filter(
    (item) => item.decision === 'not-reviewed' || item.decision === 'later',
  ).length;
  const approvedProducts = acceptedProductRecommendations(recommendations);
  const stale = Boolean(document?.reanalysisRequired);
  const run = document?.exportRun;
  const generating = run?.status === 'generating';
  const ready = run?.status === 'ready';
  const failed = run?.status === 'failed';

  const bomOptions = useMemo(
    () =>
      document?.projectId
        ? store.projectBomOptions.filter((option) => option.projectId === document.projectId)
        : [],
    [document?.projectId, store.projectBomOptions],
  );
  const packageOptions = useMemo(() => {
    if (!document?.projectId) {
      return store.submittalPackages.filter((pkg) => pkg.documentId === document?.id);
    }
    const documentIds = new Set(
      store.documents
        .filter((entry) => entry.projectId === document.projectId)
        .map((entry) => entry.id),
    );
    return store.submittalPackages.filter((pkg) => documentIds.has(pkg.documentId));
  }, [document?.id, document?.projectId, store.documents, store.submittalPackages]);

  if (!document) {
    return (
      <Flex vertical gap={token.marginLG}>
        <PageBackButton to={specHomePath()}>Back to Spec</PageBackButton>
        <Alert type="error" showIcon title="Specification not found." />
      </Flex>
    );
  }

  const division = document.divisionHint ?? systemTypeDivision[document.systemType];
  const versionCopy = customerVersionCopy(document);
  const existingOptions =
    outputKind === 'bom'
      ? bomOptions.map((option) => ({ id: option.id, name: option.name }))
      : packageOptions.map((pkg) => ({ id: pkg.id, name: pkg.name }));
  const canSubmitOutput =
    outputMode === 'create' ? outputName.trim().length > 0 : Boolean(existingId);

  const startExport = () => {
    setUndecidedWarningOpen(false);
    setStarting(true);
    void mockSpecExportRepository.start(document.id, choice).finally(() => {
      setStarting(false);
    });
  };

  const requestExport = () => {
    if (stale) return;
    if (undecided > 0) {
      setUndecidedWarningOpen(true);
      return;
    }
    startExport();
  };

  const openOutput = (kind: SpecProjectOutputKind, mode: SpecProjectOutputMode) => {
    setOutputKind(kind);
    setOutputMode(mode);
    setOutputName(
      kind === 'bom'
        ? `${document.title} — Recommended Products`
        : `${document.title} — Product Submittal`,
    );
    setExistingId(
      mode === 'update'
        ? kind === 'bom'
          ? bomOptions[0]?.id
          : packageOptions[0]?.id
        : undefined,
    );
  };

  const selectedStyle = (selected: boolean) => ({
    border: `${token.lineWidth}px ${token.lineType} ${
      selected ? token.colorPrimary : token.colorBorder
    }`,
    background: selected ? token.colorFillAlter : token.colorBgContainer,
    padding: token.paddingSM,
    borderRadius: token.borderRadiusLG,
    cursor: generating || stale ? 'default' : ('pointer' as const),
  });

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

  return (
    <Flex vertical gap={token.marginLG} style={{ width: '100%' }}>
      <BomPageHeader
        title="Export and create outputs"
        titleVariant="heading4"
        description="Download the revised document or create ConnectED Actions from approved recommendations."
      />

      {stale ? (
        <Alert
          type="warning"
          showIcon
          title="Re-analysis required"
          description="Export stays unavailable until analysis is current. Return to Review and Edit to re-run analysis."
        />
      ) : null}

      <Flex
        align="center"
        gap={token.marginSM}
        wrap="wrap"
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
          style={{ flex: '1 1 0%', minWidth: token.controlHeight * 7 }}
        >
          <Typography.Title level={5} style={{ margin: 0 }}>
            Overall assessment
          </Typography.Title>
          <Typography.Text type="secondary">
            {exportAssessmentCopy({
              title: document.title,
              versionCopy,
              division,
              masterVersion: document.ascMaster?.version ?? 'Not recorded',
              accepted,
              undecided,
            })}
          </Typography.Text>
        </Flex>
        <Flex gap={token.padding} wrap="wrap" style={{ flex: '1 1 0%', minWidth: 0 }}>
          {(
            [
              { label: 'Accepted', value: accepted, accent: token.colorSuccessBorder },
              { label: 'Denied', value: denied, accent: token.colorErrorBorder },
              { label: 'To review', value: undecided, accent: token.colorInfoBorder },
            ] as const
          ).map((metric) => (
            <Flex
              key={metric.label}
              align="center"
              justify="space-between"
              gap={token.marginSM}
              style={metricCardStyle(metric.accent)}
            >
              <Typography.Text type="secondary">{metric.label}</Typography.Text>
              <Typography.Title level={3} style={{ margin: 0 }}>
                {metric.value}
              </Typography.Title>
            </Flex>
          ))}
        </Flex>
      </Flex>

      <Flex gap={token.marginLG} wrap="wrap" align="flex-start" style={{ width: '100%' }}>
        <Card style={{ flex: '2 1 0%', minWidth: 0 }}>
          <Flex vertical gap={token.marginMD}>
            <Typography.Title level={5} style={{ margin: 0 }}>
              Revised document
            </Typography.Title>
            <Typography.Text type="secondary">
              Choose the document format to generate.
            </Typography.Text>
            {ready && run.fileName ? (
              <Flex vertical gap={token.marginMD}>
                <Alert
                  type="success"
                  showIcon
                  title="Document ready"
                  description={run.fileName}
                />
                <Flex justify="flex-end" gap={token.marginXS}>
                  <Button
                    size="large"
                    onClick={() => void mockSpecExportRepository.dismiss(document.id)}
                  >
                    Close
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    onClick={() =>
                      downloadMockDocument(
                        run.fileName ?? 'spec-export.docx',
                        `${document.title}\n${run.choice}\nMaster ${document.ascMaster?.version ?? ''}`,
                      )
                    }
                  >
                    Download
                  </Button>
                </Flex>
              </Flex>
            ) : failed ? (
              <Flex vertical gap={token.marginMD}>
                <Alert
                  type="error"
                  showIcon
                  title="Export could not finish"
                  description={run?.failureReason}
                />
                <Flex justify="flex-end" gap={token.marginXS}>
                  <Button
                    size="large"
                    onClick={() => void mockSpecExportRepository.dismiss(document.id)}
                  >
                    Close
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    loading={starting}
                    onClick={() => {
                      setStarting(true);
                      void mockSpecExportRepository.retry(document.id).finally(() => {
                        setStarting(false);
                      });
                    }}
                  >
                    Retry export
                  </Button>
                </Flex>
              </Flex>
            ) : (
              <>
                <Radio.Group
                  value={choice}
                  disabled={generating || stale}
                  onChange={(event) => setChoice(event.target.value)}
                  style={{ width: '100%' }}
                >
                  <Flex vertical gap={token.marginSM}>
                    {DOCUMENT_CHOICES.map((option) => (
                      <div
                        key={option.value}
                        style={selectedStyle(choice === option.value)}
                        onClick={() => {
                          if (!generating && !stale) setChoice(option.value);
                        }}
                      >
                        <Radio value={option.value}>
                          <Flex vertical gap={token.marginXXS}>
                            <Typography.Text strong>{option.title}</Typography.Text>
                            <Typography.Text type="secondary">
                              {option.description}
                            </Typography.Text>
                          </Flex>
                        </Radio>
                      </div>
                    ))}
                  </Flex>
                </Radio.Group>
                <Card size="small" style={{ background: token.colorFillQuaternary }}>
                  <Flex vertical gap={token.marginXXS}>
                    <Typography.Text type="secondary">
                      Microsoft Word Track Changes — Coming soon
                    </Typography.Text>
                    <Typography.Text type="secondary">
                      Native Track Changes is not in this release. Tell us if you need it.
                    </Typography.Text>
                    <Flex justify="flex-end">
                      <Button
                        type="link"
                        onClick={() =>
                          message.success(
                            'We will let you know when Track Changes export is available.',
                          )
                        }
                      >
                        Tell me when available
                      </Button>
                    </Flex>
                  </Flex>
                </Card>
                <Divider style={{ margin: 0 }} />
                {generating ? (
                  <Progress percent={65} />
                ) : (
                  <Flex justify="flex-end">
                    <Button
                      type="primary"
                      size="large"
                      disabled={stale}
                      loading={starting}
                      onClick={requestExport}
                    >
                      Export document
                    </Button>
                  </Flex>
                )}
              </>
            )}
          </Flex>
        </Card>

        <Card style={{ flex: '1 1 0%', minWidth: 0 }}>
          <Flex vertical gap={token.marginMD}>
            <Typography.Title level={5} style={{ margin: 0 }}>
              ConnectED Actions
            </Typography.Title>
            <Typography.Text type="secondary">
              Create a ConnectED action from approved ASC parts, or add them to an existing one in
              this Project.
            </Typography.Text>
            <Card size="small">
              <Flex vertical gap={token.marginSM}>
                <Typography.Text strong>BOM</Typography.Text>
                <Typography.Text type="secondary">
                  Uses approved ASC product recommendations from this SPEC.
                </Typography.Text>
                <Button
                  size="large"
                  disabled={stale || approvedProducts.length === 0}
                  onClick={() => openOutput('bom', 'create')}
                >
                  Add to BOM
                </Button>
              </Flex>
            </Card>
            <Card size="small">
              <Flex vertical gap={token.marginSM}>
                <Typography.Text strong>Submittal Package</Typography.Text>
                <Typography.Text type="secondary">
                  Builds a package from the same approved product recommendations.
                </Typography.Text>
                <Button
                  size="large"
                  disabled={stale || approvedProducts.length === 0}
                  onClick={() => openOutput('submittal', 'create')}
                >
                  Add to Submittal Package
                </Button>
              </Flex>
            </Card>
            <Typography.Text type="secondary">
              Actions remain inside {projectTitle}.
            </Typography.Text>
            {approvedProducts.length === 0 ? (
              <Typography.Text type="secondary">
                Accept a product recommendation before creating a BOM or Submittal Package.
              </Typography.Text>
            ) : null}
          </Flex>
        </Card>
      </Flex>

      <Modal
        open={undecidedWarningOpen}
        onCancel={() => setUndecidedWarningOpen(false)}
        destroyOnHidden
        title="Export with recommendations still open?"
        footer={
          <Flex justify="flex-end" gap={token.marginXS}>
            <Button size="large" onClick={() => setUndecidedWarningOpen(false)}>
              Go back
            </Button>
            <Button type="primary" size="large" loading={starting} onClick={startExport}>
              Export anyway
            </Button>
          </Flex>
        }
      >
        <Flex vertical gap={token.marginMD}>
          <Alert
            type="warning"
            showIcon
            title={
              undecided === 1
                ? '1 recommended change has not been accepted or declined.'
                : `${undecided} recommended changes have not been accepted or declined.`
            }
            description="Language that is still not ASC-friendly stays as it appears in the document. This does not block export."
          />
          <Typography.Link
            onClick={() => {
              setUndecidedWarningOpen(false);
              navigate(specAnalyzePath(document.id));
            }}
          >
            Review remaining items
          </Typography.Link>
        </Flex>
      </Modal>

      <SpecProjectOutputModal
        kind={outputKind ?? 'bom'}
        open={outputKind != null}
        projectTitle={projectTitle}
        documentTitle={document.title}
        versionLabel={versionCopy}
        mode={outputMode}
        onModeChange={setOutputMode}
        name={outputName}
        onNameChange={setOutputName}
        existingOptions={existingOptions}
        selectedExistingId={existingId}
        onSelectExisting={setExistingId}
        submitting={submittingOutput}
        canSubmit={canSubmitOutput}
        noApprovedProducts={approvedProducts.length === 0}
        onCancel={() => setOutputKind(null)}
        onConfirm={() => {
          if (!outputKind) return;
          setSubmittingOutput(true);
          const productRecommendationIds = approvedProducts.map((item) => item.id);
          const titles = approvedProducts.map(
            (item) => item.productEvidence[0]?.name ?? item.title,
          );
          const finish = () => {
            setSubmittingOutput(false);
            setOutputKind(null);
            message.success(
              outputKind === 'bom'
                ? outputMode === 'create'
                  ? 'BOM created from approved product recommendations.'
                  : 'BOM updated from approved product recommendations.'
                : outputMode === 'create'
                  ? 'Submittal Package created from approved product recommendations.'
                  : 'Submittal Package updated from approved product recommendations.',
            );
          };
          const projectId = document.projectId ?? '';
          const request =
            outputKind === 'bom'
              ? outputMode === 'create'
                ? mockSpecProjectOutputRepository.createBom({
                    documentId: document.id,
                    projectId,
                    name: outputName.trim(),
                    productRecommendationIds,
                    titles,
                  })
                : mockSpecProjectOutputRepository.updateBom({
                    documentId: document.id,
                    projectId,
                    bomId: existingId ?? '',
                    name:
                      bomOptions.find((option) => option.id === existingId)?.name ??
                      outputName.trim(),
                    productRecommendationIds,
                  })
              : outputMode === 'create'
                ? mockSpecProjectOutputRepository.createPackage({
                    documentId: document.id,
                    projectId,
                    name: outputName.trim(),
                    productRecommendationIds,
                    titles,
                  })
                : mockSpecProjectOutputRepository.updatePackage({
                    documentId: document.id,
                    projectId,
                    packageId: existingId ?? '',
                    name:
                      packageOptions.find((pkg) => pkg.id === existingId)?.name ??
                      outputName.trim(),
                    productRecommendationIds,
                    titles,
                  });
          void request.finally(finish);
        }}
      />
    </Flex>
  );
}
