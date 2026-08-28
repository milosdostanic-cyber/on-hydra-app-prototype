import { HydraColorfulTag, HydraTag, type HydraTagTone } from '../../ui/HydraTag';
import { Flex, theme } from '../../ui/antd';
import { recommendationActionLabel } from '../constants/specStatusVocabulary';
import type { SpecRecommendation, SpecRecommendationDecision } from '../data/types';

const PRIORITY_LABEL: Record<SpecRecommendation['priority'], string> = {
  high: 'High priority',
  medium: 'Medium priority',
  low: 'Low priority',
};

const PRIORITY_COLOR: Record<
  SpecRecommendation['priority'],
  'gold' | 'orange' | 'red'
> = {
  high: 'red',
  medium: 'gold',
  low: 'orange',
};

const DECISION_LABEL: Record<SpecRecommendationDecision, string> = {
  'not-reviewed': 'Not reviewed',
  accepted: 'Accepted',
  later: 'Later',
  denied: 'Denied',
};

const DECISION_TONE: Record<
  Exclude<SpecRecommendationDecision, 'not-reviewed'>,
  HydraTagTone
> = {
  accepted: 'success',
  later: 'warning',
  denied: 'error',
};

/** Action, priority, and review-state chips — shared by list cards and detail panel. */
export function SpecRecommendationTags({
  recommendation,
}: {
  recommendation: SpecRecommendation;
}) {
  const { token } = theme.useToken();

  return (
    <Flex gap={token.marginXS} wrap="wrap" align="center">
      <HydraTag>{recommendationActionLabel[recommendation.action]}</HydraTag>
      <HydraColorfulTag preset={PRIORITY_COLOR[recommendation.priority]} bordered={false}>
        {PRIORITY_LABEL[recommendation.priority]}
      </HydraColorfulTag>
      {recommendation.decision !== 'not-reviewed' ? (
        <HydraTag tone={DECISION_TONE[recommendation.decision]}>
          {DECISION_LABEL[recommendation.decision]}
        </HydraTag>
      ) : null}
    </Flex>
  );
}
