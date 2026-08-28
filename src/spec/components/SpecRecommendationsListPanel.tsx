import { useEffect, useMemo, useRef, useState } from 'react';

import { Divider, Empty, Flex, Tabs, Typography, theme } from '../../ui/antd';
import { SpecPanelScrollBody } from '../layout/SpecPanelScrollBody';
import type { SpecRecommendation, SpecRecommendationDecision } from '../data/types';
import { SpecRecommendationDetailPanel } from './SpecRecommendationDetailPanel';
import { SpecRecommendationListCard } from './SpecRecommendationListCard';

type RecommendationListTab = 'all' | 'to-review' | 'resolved';

function matchesListTab(
  decision: SpecRecommendationDecision,
  tab: RecommendationListTab,
): boolean {
  if (tab === 'all') return true;
  if (tab === 'to-review') return decision === 'not-reviewed' || decision === 'later';
  return decision === 'accepted' || decision === 'denied';
}

/** Review rail — Figma `8066:126383`; cards first; click a card to open detail. */
export function SpecRecommendationsListPanel({
  recommendations,
  selectedIndex,
  detailOpen,
  onDetailOpenChange,
  readOnly,
  saving,
  onSelect,
  onOpenSource,
  onSaveProposal,
  onDecision,
}: {
  recommendations: SpecRecommendation[];
  selectedIndex: number;
  detailOpen: boolean;
  onDetailOpenChange: (open: boolean) => void;
  readOnly?: boolean;
  saving?: boolean;
  onSelect: (index: number) => void;
  onOpenSource: () => void;
  onSaveProposal?: (proposedText: string) => void | Promise<void>;
  onDecision: (
    decision: Exclude<SpecRecommendationDecision, 'not-reviewed'>,
    options?: { proposedText?: string },
  ) => void;
}) {
  const { token } = theme.useToken();
  const listRef = useRef<HTMLDivElement | null>(null);
  const selectedRecommendation = recommendations[selectedIndex];
  const [listTab, setListTab] = useState<RecommendationListTab>('all');
  const panelBorder = `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`;
  const panelChrome = {
    background: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowTertiary,
    border: panelBorder,
  } as const;

  const visibleRecommendations = useMemo(
    () => recommendations.filter((recommendation) => matchesListTab(recommendation.decision, listTab)),
    [listTab, recommendations],
  );

  useEffect(() => {
    if (detailOpen) return;
    const node = listRef.current?.querySelector<HTMLElement>(
      `[data-rec-index="${selectedIndex}"]`,
    );
    node?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [detailOpen, selectedIndex]);

  if (recommendations.length === 0) {
    return (
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No recommendations to review." />
    );
  }

  if (detailOpen && selectedRecommendation) {
    return (
      <SpecRecommendationDetailPanel
        embedded
        recommendation={selectedRecommendation}
        position={selectedIndex + 1}
        total={recommendations.length}
        readOnly={readOnly}
        saving={saving}
        onPrevious={() => onSelect(Math.max(0, selectedIndex - 1))}
        onNext={() => onSelect(Math.min(recommendations.length - 1, selectedIndex + 1))}
        onClose={() => onDetailOpenChange(false)}
        onOpenSource={onOpenSource}
        onSaveProposal={onSaveProposal}
        onDecision={onDecision}
      />
    );
  }

  return (
    <Flex
      vertical
      style={{
        height: '100%',
        minHeight: 0,
        width: '100%',
        overflow: 'hidden',
        ...panelChrome,
      }}
    >
      <Flex
        vertical
        gap={token.paddingSM}
        style={{
          flexShrink: 0,
          width: '100%',
          paddingInline: token.padding,
          paddingBlockStart: token.padding,
        }}
      >
        <Typography.Title level={5} style={{ margin: 0 }}>
          {`Recommendations (${recommendations.length})`}
        </Typography.Title>
        <Divider style={{ margin: 0 }} />
      </Flex>
      <div style={{ flexShrink: 0, paddingInline: token.padding }}>
        <Tabs
          activeKey={listTab}
          aria-label="Recommendation status"
          tabBarGutter={token.paddingXL}
          tabBarStyle={{ marginBottom: 0 }}
          styles={{ content: { display: 'none' } }}
          onChange={(key) => setListTab(key as RecommendationListTab)}
          items={[
            { key: 'all', label: 'All' },
            { key: 'to-review', label: 'To review' },
            { key: 'resolved', label: 'Resolved' },
          ]}
        />
      </div>
      {visibleRecommendations.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            listTab === 'to-review'
              ? 'Nothing left to review in this view.'
              : 'No resolved recommendations yet.'
          }
        />
      ) : (
        <SpecPanelScrollBody scrollRef={listRef}>
          <Flex
            vertical
            gap={token.marginXS}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              paddingTop: token.padding,
              paddingInline: token.padding,
              paddingBottom: token.padding,
            }}
          >
            {visibleRecommendations.map((recommendation) => {
              const index = recommendations.indexOf(recommendation);
              return (
                <div key={recommendation.id} data-rec-index={index}>
                  <SpecRecommendationListCard
                    recommendation={recommendation}
                    selected={index === selectedIndex}
                    onSelect={() => {
                      onSelect(index);
                      onDetailOpenChange(true);
                    }}
                  />
                </div>
              );
            })}
          </Flex>
        </SpecPanelScrollBody>
      )}
    </Flex>
  );
}
