import { useState, type KeyboardEvent } from 'react';

import { hydraSmallStrong, hydraTextStyleToReactCss } from '../../theme/hydraTypography';
import { HydraTag, type HydraTagTone } from '../../ui/HydraTag';
import { Flex, Typography, theme } from '../../ui/antd';
import { recommendationActionLabel } from '../constants/specStatusVocabulary';
import type { SpecRecommendation, SpecRecommendationPriority } from '../data/types';

const PRIORITY_LABEL: Record<SpecRecommendationPriority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const PRIORITY_TONE: Record<SpecRecommendationPriority, HydraTagTone> = {
  high: 'error',
  medium: 'warning',
  low: 'success',
};

function isResolved(recommendation: SpecRecommendation): boolean {
  return recommendation.decision === 'accepted' || recommendation.decision === 'denied';
}

/** Compact recommendation card — Figma Review & Edit `rec_card` (`8066:127217`). */
export function SpecRecommendationListCard({
  recommendation,
  selected,
  onSelect,
}: {
  recommendation: SpecRecommendation;
  selected?: boolean;
  onSelect: () => void;
}) {
  const { token } = theme.useToken();
  const [hovered, setHovered] = useState(false);
  const resolved = isResolved(recommendation);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: 'pointer',
        padding: token.paddingSM,
        borderRadius: token.borderRadius,
        border: `${token.lineWidth}px ${token.lineType} ${
          selected ? token.colorPrimary : hovered ? token.colorPrimaryBorderHover : token.colorBorderSecondary
        }`,
        background: token.colorBgContainer,
      }}
    >
      <Flex vertical gap={token.paddingXS} justify="center">
        <Flex align="center" justify="space-between" gap={token.marginXS} wrap="nowrap">
          <HydraTag>{recommendationActionLabel[recommendation.action]}</HydraTag>
          <HydraTag tone={resolved ? 'processing' : PRIORITY_TONE[recommendation.priority]}>
            {resolved ? 'Resolved' : PRIORITY_LABEL[recommendation.priority]}
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
    </div>
  );
}
