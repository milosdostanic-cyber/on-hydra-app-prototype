import {
  askThreadBadgeStatus,
  askThreadStatusLabel,
} from '../constants/specStatusVocabulary';
import type { SpecAskThread } from '../data/types';
import { HydraTag } from '../../ui/HydraTag';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Descriptions,
  Empty,
  Flex,
  Input,
  Typography,
  theme,
} from '../../ui/antd';
import { hydraBaseStrong, hydraTextStyleToReactCss } from '../../theme/hydraTypography';

/**
 * G9 — Ask an Engineer: thread list + conversation + locked context snapshot (AC-030).
 */
export function SpecEngineerThread({
  threads,
  selectedId,
  onSelect,
  canReply,
  canCreateChange,
  replyValue,
  onReplyChange,
  onReply,
  onCreateChangeFromAnswer,
  onViewInEdit,
}: {
  threads: SpecAskThread[];
  selectedId?: string;
  onSelect: (threadId: string) => void;
  canReply: boolean;
  canCreateChange: boolean;
  replyValue: string;
  onReplyChange: (value: string) => void;
  onReply: () => void;
  onCreateChangeFromAnswer: (threadId: string, messageId: string) => void;
  onViewInEdit?: () => void;
}) {
  const { token } = theme.useToken();
  const selected = threads.find((t) => t.id === selectedId) ?? threads[0];

  if (threads.length === 0) {
    return (
      <Empty
        description={
          <Flex vertical gap={token.marginSM}>
            <Typography.Text>No engineer requests yet</Typography.Text>
            <Typography.Text type="secondary">
              Start a request with the document context attached. The snapshot stays locked after submit.
            </Typography.Text>
          </Flex>
        }
      />
    );
  }

  return (
    <Flex gap={token.marginMD} style={{ width: '100%', alignItems: 'stretch' }} wrap="wrap">
      <Card
        size="small"
        title="Requests"
        style={{ flex: `0 0 ${token.controlHeight * 8}px`, maxWidth: '100%' }}
        styles={{ body: { padding: token.paddingSM } }}
      >
        <Flex vertical gap={token.marginXXS} role="listbox" aria-label="Engineer requests">
          {threads.map((thread) => {
            const active = thread.id === selected?.id;
            return (
              <div
                key={thread.id}
                role="option"
                tabIndex={0}
                aria-selected={active}
                onClick={() => onSelect(thread.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelect(thread.id);
                  }
                }}
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
              >
                <Flex vertical gap={token.marginXXS} style={{ width: '100%' }}>
                  <Typography.Text ellipsis style={hydraTextStyleToReactCss(hydraBaseStrong)}>
                    {thread.subject}
                  </Typography.Text>
                  <Badge status={askThreadBadgeStatus(thread.status)} text={askThreadStatusLabel[thread.status]} />
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
              <Flex gap={token.marginSM} align="center" wrap="wrap">
                <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>{selected.subject}</Typography.Text>
                <Badge
                  status={askThreadBadgeStatus(selected.status)}
                  text={askThreadStatusLabel[selected.status]}
                />
              </Flex>
            }
          >
            <Alert
              type="info"
              showIcon
              title="Context snapshot (locked)"
              description="Attached when this request was created. It does not change if the source document later updates."
              style={{ marginBottom: token.marginSM }}
            />
            <Descriptions
              size="small"
              column={1}
              bordered
              items={[
                { key: 'doc', label: 'Document', children: selected.context.documentTitle },
                { key: 'ver', label: 'Version', children: selected.context.versionLabel },
                { key: 'sec', label: 'Section', children: selected.context.sectionLabel },
                {
                  key: 'find',
                  label: 'Finding',
                  children: selected.context.findingTitle ?? '—',
                },
                {
                  key: 'cit',
                  label: 'Citation',
                  children: selected.context.citationExcerpt ?? '—',
                },
              ]}
            />
          </Card>

          <Card size="small" title="Conversation">
            {selected.messages.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No messages yet." />
            ) : (
              <Flex vertical gap={token.marginMD}>
                {selected.messages.map((msg) => (
                  <Flex key={msg.id} gap={token.marginSM} align="flex-start">
                    <Avatar>{msg.author.slice(0, 1)}</Avatar>
                    <Flex vertical gap={token.marginSM} style={{ flex: 1, minWidth: 0 }}>
                      <Flex gap={token.marginXS} align="center" wrap="wrap">
                        <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>{msg.author}</Typography.Text>
                        <HydraTag>
                          {msg.role === 'engineer'
                            ? 'Engineer'
                            : msg.role === 'system'
                              ? 'System'
                              : 'Requester'}
                        </HydraTag>
                        <Typography.Text type="secondary">
                          {new Date(msg.createdAt).toLocaleString()}
                        </Typography.Text>
                      </Flex>
                      <Typography.Paragraph style={{ marginBottom: 0 }}>{msg.body}</Typography.Paragraph>
                      {msg.proposedWording ? (
                        <Card size="small" type="inner" title="Suggested wording">
                          <Flex vertical gap={token.marginXS}>
                            <Typography.Text type="secondary" delete>
                              {msg.proposedWording.originalText}
                            </Typography.Text>
                            <Typography.Text>{msg.proposedWording.proposedText}</Typography.Text>
                            <Typography.Text type="secondary">
                              {msg.proposedWording.rationale}
                            </Typography.Text>
                            {canCreateChange ? (
                              <Button
                                onClick={() => onCreateChangeFromAnswer(selected.id, msg.id)}
                                disabled={Boolean(selected.createdProposalId)}
                              >
                                {selected.createdProposalId
                                  ? 'Pending change already created'
                                  : 'Create change from answer'}
                              </Button>
                            ) : (
                              <Typography.Text type="secondary">
                                Creating a change requires edit access. You can still read the answer.
                              </Typography.Text>
                            )}
                            {selected.createdProposalId && onViewInEdit ? (
                              <Button type="link" onClick={onViewInEdit} style={{ paddingInline: 0 }}>
                                Open pending proposal in Edit
                              </Button>
                            ) : null}
                          </Flex>
                        </Card>
                      ) : null}
                    </Flex>
                  </Flex>
                ))}
              </Flex>
            )}

            {canReply && selected.status !== 'closed' ? (
              <Flex vertical gap={token.marginSM} style={{ marginTop: token.marginMD }}>
                <Input.TextArea
                  rows={3}
                  value={replyValue}
                  onChange={(e) => onReplyChange(e.target.value)}
                  placeholder="Add a follow-up message"
                />
                <Button onClick={onReply} disabled={!replyValue.trim()}>
                  Send message
                </Button>
              </Flex>
            ) : null}
          </Card>
        </Flex>
      ) : null}
    </Flex>
  );
}
