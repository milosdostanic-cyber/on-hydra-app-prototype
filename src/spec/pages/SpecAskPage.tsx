import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { registerEntry } from '../../context/actionTrailStore';
import { PageBackButton } from '../../shell/PageBackButton';
import { projectTitleById } from '../../shell/projectSeed';
import {
  Alert,
  App,
  Button,
  Card,
  Flex,
  Form,
  Input,
  Select,
  Skeleton,
  Typography,
  theme,
} from '../../ui/antd';
import { SpecEngineerThread } from '../components/SpecEngineerThread';
import { SpecPermissionBoundary } from '../components/SpecPermissionBoundary';
import { SpecWorkspaceHeader } from '../components/SpecWorkspaceHeader';
import { canComment, canEdit } from '../constants/specStatusVocabulary';
import { useSpecDemo } from '../context/SpecDemoContext';
import { useSpecWorkspace } from '../context/SpecWorkspaceContext';
import { mockSpecCollaborationRepository } from '../data/repositories/specRepositories';
import { useSpecMockStore } from '../data/specMockStore';
import type { SpecAskContextSnapshot, SpecAskThread, SpecAskUrgency } from '../data/types';
import { useSpecDocument } from '../hooks/useSpecDocument';
import { trackSpecEvent } from '../specAnalytics';
import { specEditPath, specHomePath } from '../specNavigation';
import { navigateSpecWorkspaceTab, specWorkspaceTabItems } from '../specWorkspaceTabs';

type AskLocationState = {
  context?: Partial<SpecAskContextSnapshot>;
  subject?: string;
};

/**
 * I4 — Ask an Engineer (AC-030, AC-031). Context snapshot is locked; answer → pending proposal.
 */
export function SpecAskPage() {
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { specId = '' } = useParams<{ specId: string }>();
  const { document, loading, error } = useSpecDocument(specId);
  const store = useSpecMockStore();
  const workspace = useSpecWorkspace();
  const demo = useSpecDemo();
  const access = demo.role;
  const editable = canEdit(access);
  const commentable = canComment(access);

  const [threads, setThreads] = useState<SpecAskThread[]>([]);
  const [panelLoading, setPanelLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [replyValue, setReplyValue] = useState('');
  const [composerOpen, setComposerOpen] = useState(false);
  const [form] = Form.useForm<{
    subject: string;
    question: string;
    requestType: string;
    urgency: SpecAskUrgency;
  }>();

  const locationState = (location.state as AskLocationState | null) ?? null;

  const reload = useCallback(async (documentId: string) => {
    setPanelLoading(true);
    try {
      const list = await mockSpecCollaborationRepository.listAskThreads(documentId);
      setThreads(list);
      setSelectedId((prev) => prev ?? list[0]?.id);
    } finally {
      setPanelLoading(false);
    }
  }, []);

  useEffect(() => {
    if (document) {
      workspace.setDocumentId(document.id);
      trackSpecEvent('spec_ask_opened', { documentId: document.id });
      void reload(document.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document?.id, store.scenarioId, store.askThreads]);

  const defaultContext = useMemo((): SpecAskContextSnapshot | undefined => {
    if (!document) return undefined;
    const section = store.sections.find((s) => s.documentId === document.id);
    const citation = store.citations.find((c) => c.documentId === document.id);
    const redFlag = store.redFlags.find((f) => section && f.sectionId === section.id);
    const suggestion = store.productSuggestions.find((p) => p.documentId === document.id);
    const fromNav = locationState?.context;
    return {
      documentId: document.id,
      documentTitle: fromNav?.documentTitle ?? document.title,
      versionLabel: fromNav?.versionLabel ?? document.versionLabel,
      sectionId: fromNav?.sectionId ?? section?.id ?? '',
      sectionLabel:
        fromNav?.sectionLabel ??
        (section ? `${section.sectionNumber} — ${section.title}` : 'Section not selected'),
      findingId: fromNav?.findingId ?? suggestion?.id ?? redFlag?.id,
      findingTitle: fromNav?.findingTitle ?? suggestion?.name ?? redFlag?.title,
      citationId: fromNav?.citationId ?? citation?.id,
      citationExcerpt: fromNav?.citationExcerpt ?? citation?.excerpt,
    };
  }, [document, store.sections, store.citations, store.redFlags, store.productSuggestions, locationState]);

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

  return (
    <Flex vertical gap={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to={specHomePath(document.projectId)}>Back to Spec</PageBackButton>

      <SpecWorkspaceHeader
        document={document}
        projectName={projectName}
        tabItems={specWorkspaceTabItems()}
        activeTab="ask"
        onTabChange={(key) => navigateSpecWorkspaceTab(document.id, key, navigate)}
      />

      {access === 'revoked' ? (
        <Alert
          type="error"
          showIcon
          title="Access expired or revoked"
          description="You can view historical requests if shared, but you cannot submit or reply."
        />
      ) : !commentable ? (
        <SpecPermissionBoundary access={access} actionLabel="Ask an Engineer" />
      ) : null}

      <Alert
        type="info"
        showIcon
        title="Ask with attached context"
        description="Your question keeps a locked snapshot of the document, section, finding, and citation. Engineer answers can become pending Edit proposals — they never change the source directly."
      />

      {panelLoading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <Flex vertical gap={token.marginLG}>
          {commentable && access !== 'revoked' ? (
            composerOpen || threads.length === 0 ? (
              <Card
                size="small"
                title="New request"
                extra={
                  threads.length > 0 ? (
                    <Button type="link" onClick={() => setComposerOpen(false)}>
                      Cancel
                    </Button>
                  ) : null
                }
              >
                <Form
                  form={form}
                  layout="vertical"
                  initialValues={{
                    subject: locationState?.subject ?? 'Engineer review request',
                    requestType: 'Requirement clarification',
                    urgency: 'normal' as SpecAskUrgency,
                  }}
                  onFinish={async (values) => {
                    if (!defaultContext) return;
                    const thread = await mockSpecCollaborationRepository.createAskThread({
                      documentId: document.id,
                      subject: values.subject,
                      question: values.question,
                      requestType: values.requestType,
                      urgency: values.urgency,
                      context: defaultContext,
                      author: 'You',
                    });
                    registerEntry({
                      module: 'spec',
                      subProjectId: document.projectId ?? document.id,
                      subProjectLabel: document.title,
                      partKey: 'ask-thread',
                      itemIds: [thread.id],
                    });
                    trackSpecEvent('spec_ask_submitted', { documentId: document.id });
                    message.success('Request submitted with locked context.');
                    form.resetFields(['question']);
                    setSelectedId(thread.id);
                    setComposerOpen(false);
                    void reload(document.id);
                  }}
                >
                  <Form.Item name="subject" label="Subject" rules={[{ required: true, message: 'Add a subject' }]}>
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="question"
                    label="Question"
                    rules={[{ required: true, message: 'Describe what you need' }]}
                  >
                    <Input.TextArea rows={3} placeholder="What should the engineer review?" />
                  </Form.Item>
                  <Flex gap={token.marginSM} wrap="wrap">
                    <Form.Item name="requestType" label="Request type" style={{ flex: 1, minWidth: token.controlHeight * 8 }}>
                      <Select
                        options={[
                          { value: 'Requirement clarification', label: 'Requirement clarification' },
                          { value: 'Product fit', label: 'Product fit' },
                          { value: 'Substitution guidance', label: 'Substitution guidance' },
                          { value: 'Red flag review', label: 'Red flag review' },
                        ]}
                      />
                    </Form.Item>
                    <Form.Item name="urgency" label="Urgency" style={{ width: token.controlHeight * 5 }}>
                      <Select
                        options={[
                          { value: 'normal', label: 'Normal' },
                          { value: 'high', label: 'High' },
                        ]}
                      />
                    </Form.Item>
                  </Flex>
                  <Typography.Paragraph type="secondary">
                    Context preview: {defaultContext?.sectionLabel ?? '—'}
                    {defaultContext?.findingTitle ? ` · ${defaultContext.findingTitle}` : ''}
                  </Typography.Paragraph>
                  <Button type="primary" size="large" htmlType="submit">
                    Submit question
                  </Button>
                </Form>
              </Card>
            ) : (
              <Flex justify="flex-end">
                <Button type="primary" size="large" onClick={() => setComposerOpen(true)}>
                  New request
                </Button>
              </Flex>
            )
          ) : null}

          <SpecEngineerThread
            threads={threads}
            selectedId={selectedId}
            onSelect={setSelectedId}
            canReply={commentable && access !== 'revoked'}
            canCreateChange={editable}
            replyValue={replyValue}
            onReplyChange={setReplyValue}
            onReply={async () => {
              if (!selectedId || !replyValue.trim()) return;
              await mockSpecCollaborationRepository.replyToAskThread(
                selectedId,
                'You',
                replyValue.trim(),
                'requester',
              );
              setReplyValue('');
              message.success('Message sent.');
              void reload(document.id);
            }}
            onCreateChangeFromAnswer={async (threadId, messageId) => {
              const proposal = await mockSpecCollaborationRepository.createProposalFromAnswer(
                threadId,
                messageId,
              );
              if (!proposal) {
                message.error('Could not create a pending change from this answer.');
                return;
              }
              registerEntry({
                module: 'spec',
                subProjectId: document.projectId ?? document.id,
                subProjectLabel: document.title,
                partKey: 'ask-proposal',
                itemIds: [proposal.id],
              });
              trackSpecEvent('spec_ask_change_created', { documentId: document.id });
              message.success('Pending editor proposal created. Review it in Edit — source is unchanged.');
              void reload(document.id);
            }}
            onViewInEdit={() => navigate(specEditPath(document.id))}
          />
        </Flex>
      )}
    </Flex>
  );
}
