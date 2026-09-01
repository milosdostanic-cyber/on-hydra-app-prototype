import { useState, type KeyboardEvent } from 'react';

import { Card, Flex, Typography, theme } from '../../ui/antd';
import { hydraSmallStrong, hydraTextStyleToReactCss } from '../../theme/hydraTypography';
import type { SpecRecommendation } from '../data/types';
import { SpecRecommendationTags } from './SpecRecommendationTags';

export function SpecRecommendationCard({
  recommendation,
  onReview,
}: {
  recommendation: SpecRecommendation;
  onReview: (recommendation: SpecRecommendation) => void;
}) {
  const { token } = theme.useToken();
  const [hovered, setHovered] = useState(false);
  const resolved =
    recommendation.decision === 'accepted' || recommendation.decision === 'denied';

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
        background: resolved ? token.colorFillAlter : token.colorBgContainer,
        transition: `border-color ${token.motionDurationMid}`,
      }}
      styles={{ body: { padding: token.paddingSM, height: '100%' } }}
    >
      <Flex vertical gap={token.paddingXS} justify="center" style={{ height: '100%' }}>
        <SpecRecommendationTags recommendation={recommendation} />
        <Flex vertical gap={token.paddingXXS}>
          <Typography.Text style={resolved ? { color: token.colorTextDescription } : undefined}>
            {recommendation.title}
          </Typography.Text>
          {recommendation.reason ? (
            <Typography.Text
              ellipsis={{ tooltip: recommendation.reason }}
              style={{
                color: token.colorTextDescription,
                ...hydraTextStyleToReactCss(hydraSmallStrong),
                fontWeight: 400,
              }}
            >
              {recommendation.reason}
            </Typography.Text>
          ) : null}
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
