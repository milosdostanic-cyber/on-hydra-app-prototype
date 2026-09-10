import { HydraColorfulTag } from '../../ui/HydraTag';
import { Badge, Flex, theme } from '../../ui/antd';
import {
  recommendationActionColorfulPreset,
  recommendationActionLabel,
  recommendationDecisionBadgeStatus,
} from '../constants/specStatusVocabulary';
import type { SpecRecommendation, SpecRecommendationDecision } from '../data/types';

const DECISION_LABEL: Record<SpecRecommendationDecision, string> = {
  'not-reviewed': 'To review',
  accepted: 'Accepted',
  later: 'Skipped',
  denied: 'Denied',
};

/**
 * Action + review-state row — shared by list cards and the detail panel.
 * Figma `recommendation_card` (node `8362:7673`): colorful action `Tag` on the left,
 * status `Badge` (dot + text) on the right, `justify-between` across the full width.
 */
export function SpecRecommendationTags({
  recommendation,
}: {
  recommendation: SpecRecommendation;
}) {
  const { token } = theme.useToken();

  return (
    <Flex justify="space-between" align="center" style={{ width: '100%' }}>
      <HydraColorfulTag
        preset={recommendationActionColorfulPreset[recommendation.action]}
        style={{ textTransform: 'uppercase' }}
      >
        {recommendationActionLabel[recommendation.action]}
      </HydraColorfulTag>
      <Badge
        status={recommendationDecisionBadgeStatus[recommendation.decision]}
        text={DECISION_LABEL[recommendation.decision]}
        style={{ flexShrink: 0, marginInlineStart: token.marginXS }}
      />
    </Flex>
  );
}
