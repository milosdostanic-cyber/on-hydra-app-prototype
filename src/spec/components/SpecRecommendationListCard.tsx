import { useState, type KeyboardEvent } from 'react';

import { hydraSmallStrong, hydraTextStyleToReactCss } from '../../theme/hydraTypography';
import { Flex, Typography, theme } from '../../ui/antd';
import type { SpecRecommendation } from '../data/types';
import { SpecRecommendationTags } from './SpecRecommendationTags';

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
  // Resolved (accepted/denied) → Figma `recommendation_card` "Resolved" state
  // (node `8362:7688`): colorFillQuaternary fill + colorBorder, full opacity (no dimming).
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
          resolved
            ? token.colorBorder
            : selected
              ? token.colorPrimary
              : hovered
                ? token.colorPrimaryBorderHover
                : token.colorBorderSecondary
        }`,
        background: resolved ? token.colorFillQuaternary : token.colorBgContainer,
        transition: `border-color ${token.motionDurationMid}, background ${token.motionDurationMid}`,
      }}
    >
      <Flex vertical gap={token.paddingXS} justify="center">
        <SpecRecommendationTags recommendation={recommendation} />
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
