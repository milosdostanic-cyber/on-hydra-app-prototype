/**
 * Figma **Hydra Ant Design — DS** `RecommendationCard` (page `❖ Cards`, `826:944`).
 *
 * Token parity (Customize Theme → `theme.useToken()`):
 * - `State=Rest`: `colorBgContainer` + `colorBorderSecondary`. `Hover`: `colorPrimary` stroke.
 *   `Resolved`: `colorFillQuaternary` + `colorBorder` (full opacity).
 * - Padding `paddingSM`, gap `paddingXS`, radius `borderRadius`.
 * - Header row (space-between): tags slot (`Tag__Colorful`) + status slot (`Badge__Status`).
 * - Text stack gap `paddingXXS`: title `Base/Normal` + `colorText`; description `Base/Normal` +
 *   `colorTextDescription`; meta `Small/Medium` + `colorTextDescription`.
 */
import type { CSSProperties, KeyboardEvent, ReactNode } from 'react';
import { useState } from 'react';

import { hydraBaseNormal, hydraSmallMedium, hydraTextStyleToReactCss } from '../theme/hydraTypography';
import { Flex, Typography, theme } from 'antd';

/** Figma variant prop `State`. */
export type RecommendationCardState = 'rest' | 'hover' | 'resolved';

export type RecommendationCardProps = {
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  /** Left header slot — colorful `Tag`s. */
  tags?: ReactNode;
  /** Right header slot — `Badge status`. */
  status?: ReactNode;
  resolved?: boolean;
  /** Controlled visual state; when set, hover tracking is disabled. */
  state?: RecommendationCardState;
  onClick?: () => void;
  'aria-label'?: string;
  className?: string;
  style?: CSSProperties;
};

export function RecommendationCard({
  title,
  description,
  meta,
  tags,
  status,
  resolved = false,
  state: controlledState,
  onClick,
  'aria-label': ariaLabel,
  className,
  style,
}: RecommendationCardProps) {
  const { token } = theme.useToken();
  const [hovered, setHovered] = useState(false);
  const visual: RecommendationCardState =
    controlledState ?? (resolved ? 'resolved' : hovered ? 'hover' : 'rest');

  const borderColor =
    visual === 'resolved' ? token.colorBorder : visual === 'hover' ? token.colorPrimary : token.colorBorderSecondary;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  const trackHover = controlledState === undefined;

  return (
    <Flex
      vertical
      gap={token.paddingXS}
      className={className}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onMouseEnter={trackHover ? () => setHovered(true) : undefined}
      onMouseLeave={trackHover ? () => setHovered(false) : undefined}
      onFocus={trackHover ? () => setHovered(true) : undefined}
      onBlur={trackHover ? () => setHovered(false) : undefined}
      style={{
        boxSizing: 'border-box',
        width: '100%',
        padding: token.paddingSM,
        background: visual === 'resolved' ? token.colorFillQuaternary : token.colorBgContainer,
        border: `${token.lineWidth}px ${token.lineType} ${borderColor}`,
        borderRadius: token.borderRadius,
        cursor: onClick ? 'pointer' : undefined,
        transition: `border-color ${token.motionDurationMid}, background ${token.motionDurationMid}`,
        ...style,
      }}
    >
      {tags || status ? (
        <Flex align="center" justify="space-between" gap={token.paddingXS}>
          <Flex wrap gap={token.paddingXXS} style={{ flex: 1, minWidth: 0 }}>
            {tags}
          </Flex>
          {status ? <Flex style={{ flexShrink: 0 }}>{status}</Flex> : null}
        </Flex>
      ) : null}
      <Flex vertical gap={token.paddingXXS}>
        <Typography.Text style={{ color: token.colorText, ...hydraTextStyleToReactCss(hydraBaseNormal) }}>
          {title}
        </Typography.Text>
        {description != null ? (
          <Typography.Text
            ellipsis
            style={{ color: token.colorTextDescription, ...hydraTextStyleToReactCss(hydraBaseNormal) }}
          >
            {description}
          </Typography.Text>
        ) : null}
        {meta != null ? (
          <Typography.Text
            style={{ color: token.colorTextDescription, ...hydraTextStyleToReactCss(hydraSmallMedium) }}
          >
            {meta}
          </Typography.Text>
        ) : null}
      </Flex>
    </Flex>
  );
}
