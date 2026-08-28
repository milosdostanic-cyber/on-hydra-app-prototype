import {
  changeMethodLabel,
  changeStatusLabel,
} from '../constants/specStatusVocabulary';
import type { SpecChangeStatus, SpecTrackedChange } from '../data/types';
import { Button, Card, Empty, Flex, Tabs, Typography, theme } from '../../ui/antd';
import { HydraTag } from '../../ui/HydraTag';

type ChangeFilter = SpecChangeStatus | 'all';

function filterChanges(changes: SpecTrackedChange[], filter: ChangeFilter): SpecTrackedChange[] {
  if (filter === 'all') return changes;
  return changes.filter((c) => c.status === filter);
}

function countBy(changes: SpecTrackedChange[], status: SpecChangeStatus): number {
  return changes.filter((c) => c.status === status).length;
}

/**
 * G5 — track-changes panel: Pending / Accepted / Rejected / All with accept/reject.
 */
export function SpecChangeReviewPanel({
  changes,
  canAct,
  onAccept,
  onReject,
  selectedChangeId,
  onSelect,
}: {
  changes: SpecTrackedChange[];
  canAct: boolean;
  onAccept: (change: SpecTrackedChange) => void;
  onReject: (change: SpecTrackedChange) => void;
  selectedChangeId?: string | null;
  onSelect?: (change: SpecTrackedChange) => void;
}) {
  const { token } = theme.useToken();
  const pending = countBy(changes, 'pending');
  const accepted = countBy(changes, 'accepted');
  const rejected = countBy(changes, 'rejected');

  return (
    <Tabs
      items={[
        {
          key: 'pending',
          label: `Pending (${pending})`,
          children: (
            <ChangeList
              changes={filterChanges(changes, 'pending')}
              empty="No pending changes."
              canAct={canAct}
              onAccept={onAccept}
              onReject={onReject}
              selectedChangeId={selectedChangeId}
              onSelect={onSelect}
              tokenGap={token.marginSM}
            />
          ),
        },
        {
          key: 'accepted',
          label: `Accepted (${accepted})`,
          children: (
            <ChangeList
              changes={filterChanges(changes, 'accepted')}
              empty="No accepted changes yet."
              canAct={false}
              onAccept={onAccept}
              onReject={onReject}
              selectedChangeId={selectedChangeId}
              onSelect={onSelect}
              tokenGap={token.marginSM}
            />
          ),
        },
        {
          key: 'rejected',
          label: `Rejected (${rejected})`,
          children: (
            <ChangeList
              changes={filterChanges(changes, 'rejected')}
              empty="No rejected changes."
              canAct={false}
              onAccept={onAccept}
              onReject={onReject}
              selectedChangeId={selectedChangeId}
              onSelect={onSelect}
              tokenGap={token.marginSM}
            />
          ),
        },
        {
          key: 'all',
          label: `All (${changes.length})`,
          children: (
            <ChangeList
              changes={filterChanges(changes, 'all')}
              empty="No changes on this working copy."
              canAct={canAct}
              onAccept={onAccept}
              onReject={onReject}
              selectedChangeId={selectedChangeId}
              onSelect={onSelect}
              tokenGap={token.marginSM}
              showStatus
            />
          ),
        },
      ]}
    />
  );
}

function ChangeList({
  changes,
  empty,
  canAct,
  onAccept,
  onReject,
  selectedChangeId,
  onSelect,
  tokenGap,
  showStatus,
}: {
  changes: SpecTrackedChange[];
  empty: string;
  canAct: boolean;
  onAccept: (change: SpecTrackedChange) => void;
  onReject: (change: SpecTrackedChange) => void;
  selectedChangeId?: string | null;
  onSelect?: (change: SpecTrackedChange) => void;
  tokenGap: number;
  showStatus?: boolean;
}) {
  const { token } = theme.useToken();

  if (changes.length === 0) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={empty} />;
  }

  return (
    <Flex vertical gap={tokenGap}>
      {changes.map((change) => {
        const selected = change.id === selectedChangeId;
        return (
          <Card
            key={change.id}
            size="small"
            styles={{
              body: {
                padding: token.paddingMD,
                background: selected ? token.colorPrimaryBg : undefined,
              },
            }}
            onClick={() => onSelect?.(change)}
            style={{ cursor: onSelect ? 'pointer' : undefined }}
          >
            <Flex vertical gap={token.marginSM}>
              <Flex gap={token.marginXS} wrap="wrap" align="center">
                <HydraTag>{changeMethodLabel[change.method]}</HydraTag>
                {showStatus ? <HydraTag>{changeStatusLabel[change.status]}</HydraTag> : null}
                {change.guideVersion ? (
                  <HydraTag>Guide {change.guideVersion}</HydraTag>
                ) : null}
                <Typography.Text type="secondary">
                  {change.author} · {new Date(change.createdAt).toLocaleString()}
                </Typography.Text>
              </Flex>
              <Typography.Text delete type="secondary">
                {change.originalText}
              </Typography.Text>
              <Typography.Text>{change.proposedText}</Typography.Text>
              {change.rationale ? (
                <Typography.Text type="secondary">{change.rationale}</Typography.Text>
              ) : null}
              {canAct && change.status === 'pending' ? (
                <Flex gap={token.marginXS}>
                  <Button
                    type="primary"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAccept(change);
                    }}
                  >
                    Accept
                  </Button>
                  <Button
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReject(change);
                    }}
                  >
                    Reject
                  </Button>
                </Flex>
              ) : null}
            </Flex>
          </Card>
        );
      })}
    </Flex>
  );
}
