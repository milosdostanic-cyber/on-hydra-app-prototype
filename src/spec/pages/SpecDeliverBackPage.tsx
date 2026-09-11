import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { registerEntry } from '../../context/actionTrailStore';
import { PageBackButton } from '../../shell/PageBackButton';
import { projectTitleById } from '../../shell/projectSeed';
import { HydraTag } from '../../ui/HydraTag';
import {
  Alert,
  App,
  Badge,
  Button,
  Card,
  Empty,
  Flex,
  Input,
  Select,
  Skeleton,
  Steps,
  Tooltip,
  Typography,
  theme,
} from '../../ui/antd';
import { SpecActivityTimeline } from '../components/SpecActivityTimeline';
import { SpecPermissionBoundary } from '../components/SpecPermissionBoundary';
import { SpecWorkspaceHeader } from '../components/SpecWorkspaceHeader';
import {
  DELIVER_BACK_STEP_ORDER,
  accessLevelRestriction,
  canApprove,
  canComment,
  deliverBackBadgeStatus,
  deliverBackStatusLabel,
} from '../constants/specStatusVocabulary';
import { useSpecDemo } from '../context/SpecDemoContext';
import { useSpecWorkspace } from '../context/SpecWorkspaceContext';
import { mockSpecCollaborationRepository } from '../data/repositories/specRepositories';
import { useSpecMockStore } from '../data/specMockStore';
import type { SpecDeliverable } from '../data/types';
import { useSpecDocument } from '../hooks/useSpecDocument';
import { trackSpecEvent } from '../specAnalytics';
import { specHomePath } from '../specNavigation';
import { navigateSpecWorkspaceTab, specWorkspaceTabItems } from '../specWorkspaceTabs';

/**
 * I4 — Deliver-Back lifecycle and approvals (AC-032 → AC-034, AC-033 permissions).
 */
export function SpecDeliverBackPage() {
  const { token } = theme.useToken();
  const { message, modal } = App.useApp();
  const navigate = useNavigate();
  const { specId = '' } = useParams<{ specId: string }>();
  const { document, loading, error } = useSpecDocument(specId);
  const store = useSpecMockStore();
  const workspace = useSpecWorkspace();
  const demo = useSpecDemo();
  const access = demo.role;
  const approvable = canApprove(access);
  const commentable = canComment(access);

  const [deliverables, setDeliverables] = useState<SpecDeliverable[]>([]);
  const [panelLoading, setPanelLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [commentDraft, setCommentDraft] = useState('');

  const reload = useCallback(async (documentId: string) => {
    setPanelLoading(true);
    try {
      const list = await mockSpecCollaborationRepository.listDeliverables(documentId);
      setDeliverables(list);
      setSelectedId((prev) => prev ?? list[0]?.id);
    } finally {
      setPanelLoading(false);
    }
  }, []);

  useEffect(() => {
    if (document) {
      workspace.setDocumentId(document.id);
      trackSpecEvent('spec_deliver_back_opened', { documentId: document.id });
      void reload(document.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document?.id, store.scenarioId, store.deliverables]);

  const selected = useMemo(
    () => deliverables.find((d) => d.id === selectedId) ?? deliverables[0],
    [deliverables, selectedId],
  );

  const currentVersion = selected?.versions.find((v) => v.id === selected.currentVersionId);
  const projectName = document?.projectId ? projectTitleById(document.projectId) : undefined;
  const restriction = accessLevelRestriction[access];

  const stepCurrent = useMemo(() => {
    if (!selected) return 0;
    if (selected.status === 'revision-requested') return 1;
    const idx = DELIVER_BACK_STEP_ORDER.indexOf(selected.status);
    return idx >= 0 ? idx : 0;
  }, [selected]);

  if (loading) return <Skeleton active paragraph={{ rows: 8 }} />;
  if (error || !document) {
    return (
      <Flex vertical gap={token.marginLG}>
        <PageBackButton to={specHomePath()}>Back to Spec</PageBackButton>
        <Alert type="error" showIcon title={error ?? 'Specification not found.'} />
      </Flex>
    );
  }

  return (
    <Flex vertical gap={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to={specHomePath(document.projectId)}>Back to Spec</PageBackButton>

      <SpecWorkspaceHeader
        document={document}
        projectName={projectName}
        tabItems={specWorkspaceTabItems()}
        activeTab="deliver-back"
        onTabChange={(key) => navigateSpecWorkspaceTab(document.id, key, navigate)}
      />

      {access === 'revoked' ? (
        <Alert
          type="error"
          showIcon
          title="Access expired or revoked"
          description="You can view the last shared package if it remains available, but approve and revision actions are blocked."
        />
      ) : !approvable ? (
        <SpecPermissionBoundary access={access} actionLabel="Approve or request revision" />
      ) : null}

      {panelLoading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : deliverables.length === 0 ? (
        <Empty
          description={
            <Flex vertical gap={token.marginSM}>
              <Typography.Text>No Deliver-Back packages yet</Typography.Text>
              <Typography.Text type="secondary">
                Demo → Deliver-Back exchange loads a package mid-lifecycle for review.
              </Typography.Text>
            </Flex>
          }
        />
      ) : (
        <Flex gap={token.marginMD} wrap="wrap" style={{ width: '100%' }}>
          <Card size="small" title="Packages" style={{ flex: `0 0 ${token.controlHeight * 8}px`, maxWidth: '100%' }}>
            <Flex vertical gap={token.marginXXS} role="listbox" aria-label="Deliver-back packages">
              {deliverables.map((item) => {
                const active = item.id === selected?.id;
                return (
                  <div
                    key={item.id}
                    role="option"
                    tabIndex={0}
                    aria-selected={active}
                    style={{
                      cursor: 'pointer',
                      background: active ? token.colorFillAlter : undefined,
                      paddingInline: token.paddingSM,
                      paddingBlock: token.paddingXS,
                      borderRadius: token.borderRadius,
                      borderInlineStart: `${token.lineWidthBold}px ${token.lineType} ${
                        active ? token.colorPrimary : 'transparent'
                      }`,
                    }}
                    onClick={() => setSelectedId(item.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setSelectedId(item.id);
                      }
                    }}
                  >
                    <Flex vertical gap={token.marginXXS}>
                      <Typography.Text strong>{item.title}</Typography.Text>
                      <Badge
                        status={deliverBackBadgeStatus(item.status)}
                        text={deliverBackStatusLabel[item.status]}
                      />
                    </Flex>
                  </div>
                );
              })}
            </Flex>
          </Card>

          {selected ? (
            <Flex vertical gap={token.marginMD} style={{ flex: 1, minWidth: token.controlHeight * 8 }}>
              <Card
                size="small"
                title={
                  <Flex gap={token.marginSM} wrap="wrap" align="center">
                    <Typography.Text strong>{selected.title}</Typography.Text>
                    <Badge
                      status={deliverBackBadgeStatus(selected.status)}
                      text={deliverBackStatusLabel[selected.status]}
                    />
                  </Flex>
                }
                extra={
                  <Select
                    style={{ minWidth: token.controlHeight * 7 }}
                    value={selected.currentVersionId}
                    onChange={(versionId) => {
                      void mockSpecCollaborationRepository
                        .setCurrentVersion(selected.id, versionId)
                        .then(() => reload(document.id));
                    }}
                    options={selected.versions.map((v) => ({
                      value: v.id,
                      label: `${v.label}${v.accepted ? ' (accepted)' : ''}`,
                    }))}
                  />
                }
              >
                <Flex vertical gap={token.marginSM}>
                  <Typography.Text type="secondary">
                    Owner {selected.owner} · Recipient {selected.recipientOrg}
                  </Typography.Text>
                  <Typography.Paragraph>{selected.previewText}</Typography.Paragraph>
                  {currentVersion ? (
                    <Alert
                      type="info"
                      showIcon
                      title={currentVersion.label}
                      description={currentVersion.summary}
                    />
                  ) : null}

                  <Flex gap={token.marginSM} wrap="wrap">
                    {selected.status === 'delivered' ? (
                      <>
                        <Tooltip title={!approvable ? restriction : undefined}>
                          <Button
                            type="primary"
                            size="large"
                            disabled={!approvable || access === 'revoked'}
                            onClick={() => {
                              modal.confirm({
                                title: 'Accept this deliverable?',
                                content:
                                  'Acceptance marks the current version as the final accepted artifact. You can still view and mock-download it afterward.',
                                okText: 'Accept package',
                                onOk: async () => {
                                  await mockSpecCollaborationRepository.setDeliverableStatus(
                                    selected.id,
                                    'accepted',
                                    'You',
                                    'Final version accepted.',
                                  );
                                  registerEntry({
                                    module: 'spec',
                                    subProjectId: document.projectId ?? document.id,
                                    subProjectLabel: document.title,
                                    partKey: 'deliver-back-accepted',
                                    itemIds: [selected.id],
                                  });
                                  trackSpecEvent('spec_deliver_back_accepted', {
                                    documentId: document.id,
                                  });
                                  message.success('Package accepted. Final version remains available.');
                                  void reload(document.id);
                                },
                              });
                            }}
                          >
                            Approve
                          </Button>
                        </Tooltip>
                        <Tooltip title={!approvable ? restriction : undefined}>
                          <Button
                            size="large"
                            disabled={!approvable || access === 'revoked'}
                            onClick={() => {
                              modal.confirm({
                                title: 'Request a revision?',
                                content:
                                  'The package returns to In progress so engineering can update it. This does not accept the current version.',
                                okText: 'Request revision',
                                onOk: async () => {
                                  await mockSpecCollaborationRepository.setDeliverableStatus(
                                    selected.id,
                                    'revision-requested',
                                    'You',
                                    'Revision requested on delivered package.',
                                  );
                                  await mockSpecCollaborationRepository.setDeliverableStatus(
                                    selected.id,
                                    'in-progress',
                                    'ASC Engineer',
                                    'Returned to engineering after revision request.',
                                  );
                                  trackSpecEvent('spec_deliver_back_revision', {
                                    documentId: document.id,
                                  });
                                  message.success('Revision requested. Status moved back to In progress.');
                                  void reload(document.id);
                                },
                              });
                            }}
                          >
                            Request revision
                          </Button>
                        </Tooltip>
                      </>
                    ) : null}

                    {selected.status === 'accepted' ? (
                      <Button
                        type="primary"
                        size="large"
                        onClick={() => {
                          message.success('Mock download started for the accepted artifact.');
                          trackSpecEvent('spec_deliver_back_downloaded', {
                            documentId: document.id,
                          });
                        }}
                      >
                        Download accepted version (mock)
                      </Button>
                    ) : null}

                    {selected.status === 'revision-requested' || selected.status === 'in-progress' ? (
                      <Typography.Text type="secondary">
                        Waiting on engineering. Approve becomes available after the next delivery.
                      </Typography.Text>
                    ) : null}
                  </Flex>
                </Flex>
              </Card>

              <Card size="small" title="Lifecycle">
                <Steps
                  direction="vertical"
                  size="small"
                  current={stepCurrent}
                  status={
                    selected.status === 'revision-requested'
                      ? 'error'
                      : selected.status === 'accepted'
                        ? 'finish'
                        : 'process'
                  }
                  items={DELIVER_BACK_STEP_ORDER.map((status) => ({
                    title: deliverBackStatusLabel[status],
                    description:
                      status === 'delivered' && selected.status === 'revision-requested'
                        ? 'Revision was requested after delivery'
                        : undefined,
                  }))}
                />
                {selected.status === 'revision-requested' ? (
                  <Alert
                    type="warning"
                    showIcon
                    style={{ marginTop: token.marginSM }}
                    title="Revision requested"
                    description="Lifecycle returned toward In progress after delivery."
                  />
                ) : null}
              </Card>

              <Card size="small" title="Activity">
                <SpecActivityTimeline activity={selected.activity} />
              </Card>

              <Card size="small" title="Comments and redlines">
                <Flex vertical gap={token.marginSM}>
                  {selected.redlines.map((rl) => (
                    <HydraTag key={rl.id} tone={rl.status === 'open' ? 'warning' : 'success'}>
                      {rl.status === 'open' ? 'Open redline' : 'Resolved'}: {rl.summary}
                    </HydraTag>
                  ))}
                  {selected.comments.length === 0 ? (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No comments yet." />
                  ) : (
                    <Flex vertical gap={token.marginSM}>
                      {selected.comments.map((c) => (
                        <Flex key={c.id} vertical gap={token.marginXXS}>
                          <Typography.Text strong>
                            {c.author} · {new Date(c.createdAt).toLocaleString()}
                          </Typography.Text>
                          <Typography.Text type="secondary">{c.body}</Typography.Text>
                        </Flex>
                      ))}
                    </Flex>
                  )}
                  {commentable && access !== 'revoked' ? (
                    <Flex vertical gap={token.marginSM}>
                      <Input.TextArea
                        rows={2}
                        value={commentDraft}
                        onChange={(e) => setCommentDraft(e.target.value)}
                        placeholder="Add a comment"
                      />
                      <Button
                        disabled={!commentDraft.trim()}
                        onClick={async () => {
                          await mockSpecCollaborationRepository.addDeliverableComment(
                            selected.id,
                            'You',
                            commentDraft.trim(),
                          );
                          setCommentDraft('');
                          message.success('Comment added.');
                          void reload(document.id);
                        }}
                      >
                        Add comment
                      </Button>
                    </Flex>
                  ) : null}
                </Flex>
              </Card>

              <Card size="small" title="Mock notifications">
                {[...selected.notifications].reverse().length === 0 ? (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No notifications yet." />
                ) : (
                  <Flex vertical gap={token.marginSM}>
                    {[...selected.notifications].reverse().map((n) => (
                      <Flex key={n.id} vertical gap={token.marginXXS}>
                        <Typography.Text strong>{n.title}</Typography.Text>
                        <Typography.Text type="secondary">
                          {new Date(n.at).toLocaleString()} — {n.body}
                        </Typography.Text>
                      </Flex>
                    ))}
                  </Flex>
                )}
              </Card>
            </Flex>
          ) : null}
        </Flex>
      )}
    </Flex>
  );
}
