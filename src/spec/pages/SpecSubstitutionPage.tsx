import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { PageBackButton } from '../../shell/PageBackButton';
import { projectTitleById } from '../../shell/projectSeed';
import {
  Alert,
  App,
  Button,
  Card,
  Descriptions,
  Divider,
  Empty,
  Flex,
  Input,
  Skeleton,
  Tooltip,
  Typography,
  theme,
} from '../../ui/antd';
import { SpecEquivalenceMatrix } from '../components/SpecEquivalenceMatrix';
import { SpecPermissionBoundary } from '../components/SpecPermissionBoundary';
import { SpecWorkspaceHeader } from '../components/SpecWorkspaceHeader';
import {
  canEdit,
  substitutionAttachmentKindLabel,
  substitutionRequestStatusLabel,
} from '../constants/specStatusVocabulary';
import { useSpecDemo } from '../context/SpecDemoContext';
import { useSpecWorkspace } from '../context/SpecWorkspaceContext';
import { mockSpecArtifactsRepository } from '../data/repositories/specRepositories';
import { useSpecMockStore } from '../data/specMockStore';
import type { SpecSubstitutionLine, SpecSubstitutionRequest } from '../data/types';
import { useSpecDocument } from '../hooks/useSpecDocument';
import { trackSpecEvent } from '../specAnalytics';
import { specAnalyzePath, specAskPath, specHomePath, specProductsPath } from '../specNavigation';
import { navigateSpecWorkspaceTab, specWorkspaceTabItems } from '../specWorkspaceTabs';
import { HydraTag } from '../../ui/HydraTag';
import { hydraBaseStrong, hydraTextStyleToReactCss } from '../../theme/hydraTypography';

function countNonMeets(lines: SpecSubstitutionLine[]) {
  return lines.reduce(
    (acc, line) => acc + line.equivalence.filter((a) => a.outcome === 'does-not-meet').length,
    0,
  );
}

function countNeedsReview(lines: SpecSubstitutionLine[]) {
  return lines.reduce(
    (acc, line) => acc + line.equivalence.filter((a) => a.outcome === 'needs-review').length,
    0,
  );
}

function countMissingAttachments(lines: SpecSubstitutionLine[]) {
  return lines.reduce((acc, line) => acc + line.attachments.filter((a) => !a.available).length, 0);
}

/**
 * I3 — Substitution Request Generator (PRD FR-15, AC-FR-15).
 * Attribute-level equivalence, honest non-meet flags, savings hooks and
 * attachments, previewed before a mock submission.
 */
export function SpecSubstitutionPage() {
  const { token } = theme.useToken();
  const { modal, message } = App.useApp();
  const navigate = useNavigate();
  const { specId = '' } = useParams<{ specId: string }>();
  const { document, loading, error } = useSpecDocument(specId);
  const store = useSpecMockStore();
  const workspace = useSpecWorkspace();
  const demo = useSpecDemo();
  const access = demo.role;
  const editable = canEdit(access);

  const [request, setRequest] = useState<SpecSubstitutionRequest | undefined>();
  const [notes, setNotes] = useState('');
  const [panelLoading, setPanelLoading] = useState(true);

  const reload = useCallback(async (documentId: string) => {
    setPanelLoading(true);
    try {
      const req = await mockSpecArtifactsRepository.getSubstitution(documentId);
      setRequest(req);
      setNotes(req?.notes ?? '');
    } finally {
      setPanelLoading(false);
    }
  }, []);

  useEffect(() => {
    if (document) {
      workspace.setDocumentId(document.id);
      trackSpecEvent('spec_substitution_opened', { documentId: document.id });
      void reload(document.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document?.id, store.scenarioId, store.substitutionRequests, store.productSuggestions]);

  const lines = useMemo(() => request?.lines ?? [], [request]);
  const nonMeets = countNonMeets(lines);
  const needsReview = countNeedsReview(lines);
  const missingAttachments = countMissingAttachments(lines);

  const projectName = document?.projectId ? projectTitleById(document.projectId) : undefined;

  if (loading) return <Skeleton active paragraph={{ rows: 8 }} />;
  if (error || !document) {
    return (
      <Flex vertical gap={token.marginLG}>
        <PageBackButton to={specHomePath()}>Back to Spec</PageBackButton>
        <Alert type="error" showIcon title={error ?? 'Specification not found.'} />
      </Flex>
    );
  }

  const submitted = request?.status === 'submitted';
  const canSubmit = editable && lines.length > 0 && !submitted;

  const submitRequest = () => {
    modal.confirm({
      title: 'Submit substitution request?',
      icon: <ExclamationCircleOutlined />,
      content: (
        <Flex vertical gap={token.marginXS}>
          <Typography.Text>
            {lines.length} proposed {lines.length === 1 ? 'equal' : 'equals'} will be shared as
            written.
          </Typography.Text>
          {nonMeets > 0 ? (
            <Typography.Text type="danger" style={hydraTextStyleToReactCss(hydraBaseStrong)}>
              {nonMeets} attribute {nonMeets === 1 ? 'does' : 'do'} not meet the specification. The
              request states this openly rather than omitting it.
            </Typography.Text>
          ) : null}
          {needsReview > 0 ? (
            <Typography.Text type="warning">
              {needsReview} attribute {needsReview === 1 ? 'needs' : 'need'} engineer review.
            </Typography.Text>
          ) : null}
          {missingAttachments > 0 ? (
            <Typography.Text type="warning">
              {missingAttachments} supporting {missingAttachments === 1 ? 'document is' : 'documents are'}{' '}
              still missing.
            </Typography.Text>
          ) : null}
          <Typography.Text type="secondary">
            This mock submission marks the request as submitted. No email or file is sent.
          </Typography.Text>
        </Flex>
      ),
      okText: 'Submit request',
      cancelText: 'Keep editing',
      onOk: async () => {
        await mockSpecArtifactsRepository.updateSubstitutionNotes(document.id, notes);
        await mockSpecArtifactsRepository.submitSubstitution(document.id);
        message.success('Substitution request submitted (mock).');
        void reload(document.id);
      },
    });
  };

  return (
    <Flex vertical gap={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to={specHomePath(document.projectId)}>Back to Spec</PageBackButton>

      <SpecWorkspaceHeader
        document={document}
        projectName={projectName}
        tabItems={specWorkspaceTabItems()}
        activeTab="substitution"
        onTabChange={(key) => navigateSpecWorkspaceTab(document.id, key, navigate)}
        actions={
          lines.length > 0 ? (
            <Tooltip
              title={
                submitted
                  ? 'Already submitted in this prototype.'
                  : !editable
                    ? 'Your access level cannot submit this request.'
                    : undefined
              }
            >
              <Button type="primary" size="large" disabled={!canSubmit} onClick={submitRequest}>
                {submitted ? 'Submitted' : 'Submit request'}
              </Button>
            </Tooltip>
          ) : undefined
        }
      />

      {!editable ? <SpecPermissionBoundary access={access} actionLabel="Substitution" /> : null}

      {lines.length > 0 ? (
        nonMeets > 0 ? (
          <Alert
            type="warning"
            showIcon
            title={`${nonMeets} attribute${nonMeets === 1 ? '' : 's'} do not meet the specification`}
            description="Non-compliance is stated in the matrix below instead of being left out. An engineer can still accept an or-equal, but only when the gap is visible."
          />
        ) : (
          <Alert
            type="success"
            showIcon
            title="Every compared attribute meets or exceeds the specification"
            description="Attributes marked Needs review still require an engineer decision. Source analysis stays unchanged."
          />
        )
      ) : (
        <Alert
          type="info"
          showIcon
          title="Preview before sharing"
          description="Lines come from Products you added to substitution. Source analysis stays unchanged."
        />
      )}

      {panelLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : lines.length === 0 ? (
        <Card>
          <Empty
            description={
              <Flex vertical gap={token.marginXS}>
                <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>No substitution lines yet</Typography.Text>
                <Typography.Text type="secondary">
                  Add an ASC suggestion on Products to start an or-equal, or Ask an Engineer when
                  the catalog has no fit.
                </Typography.Text>
              </Flex>
            }
          >
            <Flex gap={token.marginSM} wrap="wrap" justify="center">
              <Button
                type="primary"
                size="large"
                onClick={() => navigate(specProductsPath(document.id))}
              >
                Go to Products
              </Button>
              <Button size="large" onClick={() => navigate(specAskPath(document.id))}>
                Ask an Engineer
              </Button>
            </Flex>
          </Empty>
        </Card>
      ) : (
        <Flex vertical gap={token.marginLG}>
          <Flex gap={token.marginSM} wrap="wrap" align="center">
            <Typography.Title level={5} style={{ margin: 0 }}>
              {request?.title}
            </Typography.Title>
            <HydraTag
              tone={
                submitted ? 'success' : request?.status === 'ready-to-preview' ? 'processing' : 'default'
              }
            >
              {request ? substitutionRequestStatusLabel[request.status] : ''}
            </HydraTag>
            <Typography.Text type="secondary">
              {lines.length} {lines.length === 1 ? 'line' : 'lines'}
            </Typography.Text>
          </Flex>

          {lines.map((line) => {
            const lineNonMeets = line.equivalence.filter((a) => a.outcome === 'does-not-meet');
            return (
              <Card
                key={line.id}
                title={
                  <Flex vertical gap={token.marginXXS} style={{ paddingBlock: token.paddingXS }}>
                    <Typography.Text type="secondary">Specified</Typography.Text>
                    <Typography.Text>{line.specifiedValue}</Typography.Text>
                  </Flex>
                }
              >
                <Flex vertical gap={token.marginMD}>
                  <Flex vertical gap={token.marginXXS}>
                    <Typography.Text type="secondary">Proposed equal</Typography.Text>
                    <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>
                      {line.proposedName} ({line.proposedSku})
                    </Typography.Text>
                    <Typography.Text type="secondary">{line.rationale}</Typography.Text>
                  </Flex>

                  {line.equivalence.length > 0 ? (
                    <Flex vertical gap={token.marginXS}>
                      <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>Equivalence matrix</Typography.Text>
                      <SpecEquivalenceMatrix
                        attributes={line.equivalence}
                        onOpenCitation={(citationId) =>
                          navigate(`${specAnalyzePath(document.id)}?citation=${citationId}`)
                        }
                      />
                      {lineNonMeets.length > 0 ? (
                        <Alert
                          type="error"
                          showIcon
                          title="Stated non-compliance"
                          description={
                            <Flex vertical gap={token.marginXXS}>
                              {lineNonMeets.map((a) => (
                                <Typography.Text key={a.id}>
                                  <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>{a.attribute}:</Typography.Text>{' '}
                                  {a.note ?? `${a.proposedValue} against ${a.specifiedValue}.`}
                                </Typography.Text>
                              ))}
                            </Flex>
                          }
                        />
                      ) : null}
                    </Flex>
                  ) : (
                    <Alert
                      type="warning"
                      showIcon
                      title="No attribute comparison available"
                      description="This suggestion has no equivalence data, so the request cannot claim it is an equal. Ask an Engineer before submitting."
                    />
                  )}

                  {line.savings ? (
                    <Flex vertical gap={token.marginXS}>
                      <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>Savings</Typography.Text>
                      <Descriptions
                        size="small"
                        column={{ xs: 1, sm: 1, md: 3 }}
                        items={[
                          { key: 'material', label: 'Material', children: line.savings.materialLabel },
                          { key: 'labour', label: 'Labour', children: line.savings.labourLabel },
                          { key: 'lead', label: 'Lead time', children: line.savings.leadTimeLabel },
                        ]}
                      />
                      <Typography.Text type="secondary">{line.savings.basis}</Typography.Text>
                    </Flex>
                  ) : null}

                  {line.attachments.length > 0 ? (
                    <Flex vertical gap={token.marginXS}>
                      <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>Supporting documents</Typography.Text>
                      <Flex vertical gap={token.marginXS}>
                        {line.attachments.map((att) => (
                          <Flex key={att.id} gap={token.marginXS} align="flex-start" wrap="wrap">
                            {att.available ? (
                              <CheckCircleOutlined style={{ color: token.colorSuccess }} />
                            ) : (
                              <ExclamationCircleOutlined style={{ color: token.colorWarning }} />
                            )}
                            <Typography.Text>{att.title}</Typography.Text>
                            <HydraTag>{substitutionAttachmentKindLabel[att.kind]}</HydraTag>
                            {att.available ? (
                              <Button
                                type="link"
                                icon={<FileTextOutlined />}
                                onClick={() =>
                                  message.success(`${att.title} — mock download, no file generated.`)
                                }
                              >
                                Download
                              </Button>
                            ) : (
                              <Typography.Text type="warning">
                                {att.note ?? 'Not attached yet.'}
                              </Typography.Text>
                            )}
                          </Flex>
                        ))}
                      </Flex>
                    </Flex>
                  ) : null}
                </Flex>
              </Card>
            );
          })}

          <Divider style={{ margin: 0 }} />

          <Flex vertical gap={token.marginXS}>
            <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>Notes for the engineer</Typography.Text>
            <Input.TextArea
              rows={4}
              value={notes}
              disabled={!editable || submitted}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={async () => {
                if (!editable || submitted) return;
                await mockSpecArtifactsRepository.updateSubstitutionNotes(document.id, notes);
              }}
              placeholder="Add context the engineer should see…"
            />
          </Flex>

          {submitted ? (
            <Alert
              type="success"
              showIcon
              title="Request submitted (mock)"
              description="No real delivery was sent. Track the response under Deliver-Back."
            />
          ) : null}
        </Flex>
      )}
    </Flex>
  );
}
