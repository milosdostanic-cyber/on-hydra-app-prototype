import { useState } from 'react';

import type { SpecCommentThread } from '../data/types';
import {
  Avatar,
  Button,
  Collapse,
  Empty,
  Flex,
  Input,
  Typography,
  theme,
} from '../../ui/antd';
import { HydraTag } from '../../ui/HydraTag';
import { hydraBaseStrong, hydraTextStyleToReactCss } from '../../theme/hydraTypography';

/**
 * G8 — range-anchored comment threads in the right rail.
 */
export function SpecCommentThreads({
  threads,
  selectedBlockId,
  canComment,
  onReply,
  onAdd,
  onToggleResolved,
  onSelectThread,
}: {
  threads: SpecCommentThread[];
  selectedBlockId?: string | null;
  canComment: boolean;
  onReply: (threadId: string, body: string) => void;
  onAdd: (body: string) => void;
  onToggleResolved: (threadId: string, resolved: boolean) => void;
  onSelectThread?: (thread: SpecCommentThread) => void;
}) {
  const { token } = theme.useToken();
  const [draft, setDraft] = useState('');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  const openThreads = threads.filter((t) => !t.resolved);
  const resolvedThreads = threads.filter((t) => t.resolved);

  return (
    <Flex vertical gap={token.marginMD}>
      <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>Comments</Typography.Text>

      {canComment && selectedBlockId ? (
        <Flex vertical gap={token.marginXS}>
          <Typography.Text type="secondary">Comment on the selected paragraph</Typography.Text>
          <Input.TextArea
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a comment…"
          />
          <Button
            type="primary"
            size="small"
            disabled={!draft.trim()}
            onClick={() => {
              onAdd(draft.trim());
              setDraft('');
            }}
          >
            Add comment
          </Button>
        </Flex>
      ) : canComment ? (
        <Typography.Text type="secondary">Select a paragraph to start a comment.</Typography.Text>
      ) : null}

      {openThreads.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No open comments." />
      ) : (
        <Flex vertical gap={token.marginSM}>
          {openThreads.map((thread) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              selected={thread.blockId === selectedBlockId}
              canComment={canComment}
              replyValue={replyDrafts[thread.id] ?? ''}
              onReplyChange={(v) => setReplyDrafts((prev) => ({ ...prev, [thread.id]: v }))}
              onReply={() => {
                const body = (replyDrafts[thread.id] ?? '').trim();
                if (!body) return;
                onReply(thread.id, body);
                setReplyDrafts((prev) => ({ ...prev, [thread.id]: '' }));
              }}
              onResolve={() => onToggleResolved(thread.id, true)}
              onSelect={() => onSelectThread?.(thread)}
            />
          ))}
        </Flex>
      )}

      {resolvedThreads.length > 0 ? (
        <Collapse
          items={[
            {
              key: 'resolved',
              label: `Resolved (${resolvedThreads.length})`,
              children: (
                <Flex vertical gap={token.marginSM}>
                  {resolvedThreads.map((thread) => (
                    <ThreadCard
                      key={thread.id}
                      thread={thread}
                      selected={thread.blockId === selectedBlockId}
                      canComment={false}
                      replyValue=""
                      onReplyChange={() => undefined}
                      onReply={() => undefined}
                      onResolve={() => onToggleResolved(thread.id, false)}
                      resolveLabel="Reopen"
                      onSelect={() => onSelectThread?.(thread)}
                    />
                  ))}
                </Flex>
              ),
            },
          ]}
        />
      ) : null}
    </Flex>
  );
}

function ThreadCard({
  thread,
  selected,
  canComment,
  replyValue,
  onReplyChange,
  onReply,
  onResolve,
  resolveLabel = 'Resolve',
  onSelect,
}: {
  thread: SpecCommentThread;
  selected: boolean;
  canComment: boolean;
  replyValue: string;
  onReplyChange: (value: string) => void;
  onReply: () => void;
  onResolve: () => void;
  resolveLabel?: string;
  onSelect?: () => void;
}) {
  const { token } = theme.useToken();

  return (
    <div
      onClick={onSelect}
      style={{
        padding: token.paddingMD,
        borderRadius: token.borderRadiusLG,
        border: `${token.lineWidth}px ${token.lineType} ${
          selected ? token.colorPrimaryBorder : token.colorBorderSecondary
        }`,
        background: selected ? token.colorPrimaryBg : token.colorBgContainer,
        cursor: onSelect ? 'pointer' : undefined,
      }}
    >
      <Flex vertical gap={token.marginSM}>
        <Flex justify="space-between" gap={token.marginXS} wrap="wrap">
          <HydraTag>{thread.resolved ? 'Resolved' : 'Open'}</HydraTag>
          <Typography.Text type="secondary">{new Date(thread.createdAt).toLocaleString()}</Typography.Text>
        </Flex>
        {thread.messages.map((msg) => (
          <Flex key={msg.id} gap={token.marginSM} align="flex-start">
            <Avatar size="small">{msg.author.slice(0, 1).toUpperCase()}</Avatar>
            <Flex vertical gap={token.marginXXS} style={{ minWidth: 0, flex: 1 }}>
              <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>{msg.author}</Typography.Text>
              <Typography.Paragraph style={{ marginBottom: 0 }}>{msg.body}</Typography.Paragraph>
              <Typography.Text type="secondary">{new Date(msg.createdAt).toLocaleString()}</Typography.Text>
            </Flex>
          </Flex>
        ))}
        <Flex gap={token.marginXS} wrap="wrap">
          <Button
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onResolve();
            }}
          >
            {resolveLabel}
          </Button>
        </Flex>
        {canComment && !thread.resolved ? (
          <Flex vertical gap={token.marginXS} onClick={(e) => e.stopPropagation()}>
            <Input.TextArea
              rows={2}
              value={replyValue}
              onChange={(e) => onReplyChange(e.target.value)}
              placeholder="Reply…"
            />
            <Button size="small" type="primary" disabled={!replyValue.trim()} onClick={onReply}>
              Reply
            </Button>
          </Flex>
        ) : null}
      </Flex>
    </div>
  );
}
