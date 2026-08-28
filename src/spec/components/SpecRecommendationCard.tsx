import { useState, type KeyboardEvent } from 'react';

import { HydraTag, type HydraTagTone } from '../../ui/HydraTag';
import { Card, Flex, Typography, theme } from '../../ui/antd';
import { hydraSmallStrong, hydraTextStyleToReactCss } from '../../theme/hydraTypography';
import { recommendationActionLabel } from '../constants/specStatusVocabulary';
import type {
  SpecRecommendation,
  SpecRecommendationDecision,
} from '../data/types';

const DECISION_LABEL: Record<SpecRecommendationDecision, string> = {
  'not-reviewed': 'To review',
  accepted: 'Resolved',
  later: 'Later',
  denied: 'Denied',
};

const DECISION_TONE: Record<SpecRecommendationDecision, HydraTagTone> = {
  'not-reviewed': 'processing',
  accepted: 'success',
  later: 'warning',
  denied: 'error',
};

export function SpecRecommendationCard({
  recommendation,
  onReview,
}: {
  recommendation: SpecRecommendation;
  onReview: (recommendation: SpecRecommendation) => void;
}) {
  const { token } = theme.useToken();
  const [hovered, setHovered] = useState(false);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onReview(recommendation);
    }
  };

  return (
    <Card
      size="small"
      role="button"
      tabIndex={0}
      aria-label={`Review ${recommendation.title}`}
      onClick={() => onReview(recommendation)}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      style={{
        height: '100%',
        cursor: 'pointer',
        borderColor: hovered ? token.colorPrimaryBorderHover : token.colorBorderSecondary,
        borderRadius: token.borderRadius,
        transition: `border-color ${token.motionDurationMid}`,
      }}
      styles={{ body: { padding: token.paddingSM, height: '100%' } }}
    >
      <Flex vertical gap={token.paddingXS} justify="center" style={{ height: '100%' }}>
        <Flex align="center" justify="space-between" gap={token.marginXS} wrap="nowrap">
          <HydraTag>{recommendationActionLabel[recommendation.action]}</HydraTag>
          <HydraTag
            tone={DECISION_TONE[recommendation.decision]}
            style={
              recommendation.decision === 'not-reviewed'
                ? {
                    background: token.colorInfoBg,
                    borderColor: token.colorInfoBorder,
                    color: token.colorInfoText,
                  }
                : undefined
            }
          >
            {DECISION_LABEL[recommendation.decision]}
          </HydraTag>
        </Flex>
        <Flex vertical gap={token.paddingXXS}>
          <Typography.Text>{recommendation.title}</Typography.Text>
          <Typography.Text
            style={{
              color: token.colorTextDescription,
              ...hydraTextStyleToReactCss(hydraSmallStrong),
            }}
          >
            {`Section ${recommendation.sectionNumber}   |   Page ${recommendation.sourceCitation.page}`}
          </Typography.Text>
        </Flex>
      </Flex>
    </Card>
  );
}
