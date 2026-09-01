import { HydraTag, type HydraTagTone } from '../../ui/HydraTag';
import { Flex, theme } from '../../ui/antd';
import { recommendationActionLabel } from '../constants/specStatusVocabulary';
import type { SpecRecommendation, SpecRecommendationDecision } from '../data/types';

const DECISION_LABEL: Record<SpecRecommendationDecision, string> = {
  'not-reviewed': 'To review',
  accepted: 'Accepted',
  later: 'Skipped',
  denied: 'Denied',
};

const DECISION_TONE: Record<SpecRecommendationDecision, HydraTagTone> = {
  'not-reviewed': 'processing',
  accepted: 'success',
  later: 'default',
  denied: 'error',
};

/** Action and review-state chips — shared by list cards and detail panel. */
export function SpecRecommendationTags({
  recommendation,
}: {
  recommendation: SpecRecommendation;
}) {
  const { token } = theme.useToken();

  return (
    <Flex gap={token.marginXS} wrap="wrap" align="center">
      <HydraTag>{recommendationActionLabel[recommendation.action]}</HydraTag>
      <HydraTag tone={DECISION_TONE[recommendation.decision]}>
        {DECISION_LABEL[recommendation.decision]}
      </HydraTag>
    </Flex>
  );
}
