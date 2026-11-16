/**
 * Figma **Hydra Ant Design — DS** `FeatureCard` (page `❖ Cards`, `826:944`).
 *
 * Token parity (Customize Theme → `theme.useToken()`):
 * - Surface: `colorBgContainer`, `lineWidth` `colorBorder` stroke, `borderRadiusLG`, `boxShadowTertiary`.
 *   Hover: `colorPrimaryBorderHover` stroke, no shadow.
 * - Content column: padding `padding` (top / inline) + `paddingSM` (bottom), gap `paddingXXS`.
 *   Title `Title/Heading 4` + `colorPrimaryText`; description `Base/Normal` + `colorTextDescription`;
 *   plain `Divider` then the action slot (Figma `Button type=link`).
 * - Media column: `colorFillQuaternary`, left `colorBorderSecondary` stroke, padding `paddingXS` block / `padding` inline.
 */
import type { CSSProperties, KeyboardEvent, ReactNode } from 'react';
import { useState } from 'react';

import { hydraBaseNormal, hydraTextStyleToReactCss, hydraTitleHeading4 } from '../theme/hydraTypography';
import { Divider, Flex, Typography, theme } from 'antd';

/** Figma variant prop `state`. */
export type FeatureCardState = 'default' | 'hover';

export type FeatureCardProps = {
  title: ReactNode;
  description?: ReactNode;
  /** Media column content (product image). */
  media?: ReactNode;
  /** Footer action below the divider — e.g. `<Button type="link">`. */
  action?: ReactNode;
  state?: FeatureCardState;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
};

export function FeatureCard({
  title,
  description,
  media,
  action,
  state: controlledState,
  onClick,
  className,
  style,
}: FeatureCardProps) {
  const { token } = theme.useToken();
  const [hovered, setHovered] = useState(false);
  const isHover = controlledState !== undefined ? controlledState === 'hover' : hovered;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Flex
      className={className}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onMouseEnter={controlledState === undefined ? () => setHovered(true) : undefined}
      onMouseLeave={controlledState === undefined ? () => setHovered(false) : undefined}
      style={{
        boxSizing: 'border-box',
        width: '100%',
        overflow: 'hidden',
        background: token.colorBgContainer,
        border: `${token.lineWidth}px ${token.lineType} ${isHover ? token.colorPrimaryBorderHover : token.colorBorder}`,
        borderRadius: token.borderRadiusLG,
        boxShadow: isHover ? undefined : token.boxShadowTertiary,
        cursor: onClick ? 'pointer' : undefined,
        transition: `border-color ${token.motionDurationMid}, box-shadow ${token.motionDurationMid}`,
        ...style,
      }}
    >
      <Flex
        vertical
        gap={token.paddingXXS}
        style={{
          flex: 1,
          minWidth: 0,
          paddingTop: token.padding,
          paddingInline: token.padding,
          paddingBottom: token.paddingSM,
        }}
      >
        <Typography.Title
          level={4}
          style={{ margin: 0, color: token.colorPrimaryText, ...hydraTextStyleToReactCss(hydraTitleHeading4) }}
        >
          {title}
        </Typography.Title>
        {description != null ? (
          <Typography.Paragraph
            ellipsis={{ rows: 3 }}
            style={{ margin: 0, color: token.colorTextDescription, ...hydraTextStyleToReactCss(hydraBaseNormal) }}
          >
            {description}
          </Typography.Paragraph>
        ) : null}
        {action ? (
          <Flex vertical>
            <Divider plain style={{ margin: 0 }} />
            <Flex onClick={(e) => e.stopPropagation()}>{action}</Flex>
          </Flex>
        ) : null}
      </Flex>
      {media ? (
        <Flex
          align="center"
          justify="center"
          style={{
            flexShrink: 0,
            paddingBlock: token.paddingXS,
            paddingInline: token.padding,
            background: token.colorFillQuaternary,
            borderLeft: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
          }}
        >
          {media}
        </Flex>
      ) : null}
    </Flex>
  );
}
