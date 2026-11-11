/**
 * Figma **Hydra Ant Design — DS** `OptionCard` (page `❖ Cards`, `826:944`).
 * Supersedes the older `ExportCard` (`type=action, layout=vertical`).
 *
 * Token parity (Customize Theme → `theme.useToken()`):
 * - `type=action`: `colorBgElevated`, no stroke, `boxShadowTertiary` (hover `boxShadowSecondary`).
 * - `type=option`: `colorBgContainer`, `colorBorderSecondary` stroke (hover `colorPrimaryBorder`), no shadow.
 * - `state=selected` (both types): `colorPrimaryBg` + `colorPrimary` stroke.
 * - `state=disabled`: text `colorTextDisabled`, rest surface.
 * - Padding: `paddingLG` (vertical) or `paddingLG` block + `padding` inline (horizontal); gap `paddingSM`.
 * - Text stack gap `paddingXXS`: title `Title/Heading 5` + `colorText`, description `Base/Normal` +
 *   `colorTextSecondary`, link `Base/Normal` + `colorLink`. Radius `borderRadiusLG`.
 */
import type { CSSProperties, KeyboardEvent, ReactNode } from 'react';
import { useState } from 'react';

import {
  hydraBaseNormal,
  hydraTextStyleToReactCss,
  hydraTitleHeading3,
  hydraTitleHeading5,
} from '../theme/hydraTypography';
import { Checkbox, Flex, Radio, Typography, theme } from 'antd';

export type OptionCardType = 'action' | 'option';
export type OptionCardLayout = 'vertical' | 'horizontal';
/** Figma variant prop `state`. */
export type OptionCardState = 'default' | 'hover' | 'selected' | 'disabled';

export type OptionCardProps = {
  title: ReactNode;
  description?: ReactNode;
  /** Leading 24×24 slot (Figma `🎰 icon`). */
  icon?: ReactNode;
  /** Figma `show tag` — e.g. `<HydraTag>` / colorful `Tag`. */
  tag?: ReactNode;
  /** Figma `show link` — rendered as `Typography.Link`. */
  link?: { label: ReactNode; onClick?: () => void };
  /** Figma `show radio` / `show checkbox` — `type=option` only. */
  control?: 'radio' | 'checkbox';
  type?: OptionCardType;
  layout?: OptionCardLayout;
  /** Controlled visual state; when set, hover tracking is disabled. */
  state?: OptionCardState;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
};

function resolveState(
  controlled: OptionCardState | undefined,
  disabled: boolean,
  selected: boolean,
  hovered: boolean,
): OptionCardState {
  if (controlled !== undefined) return controlled;
  if (disabled) return 'disabled';
  if (selected) return 'selected';
  if (hovered) return 'hover';
  return 'default';
}

export function OptionCard({
  title,
  description,
  icon,
  tag,
  link,
  control,
  type = 'action',
  layout = 'vertical',
  state: controlledState,
  selected = false,
  disabled = false,
  onClick,
  className,
  style,
}: OptionCardProps) {
  const { token } = theme.useToken();
  const [hovered, setHovered] = useState(false);
  const visual = resolveState(controlledState, disabled, selected, hovered);
  const isSelected = visual === 'selected';
  const isDisabled = visual === 'disabled';
  const interactive = Boolean(onClick) && !isDisabled;

  const surface = (() => {
    if (isSelected) return { background: token.colorPrimaryBg, borderColor: token.colorPrimary };
    if (type === 'option') {
      return {
        background: token.colorBgContainer,
        borderColor: visual === 'hover' ? token.colorPrimaryBorder : token.colorBorderSecondary,
      };
    }
    return { background: token.colorBgElevated, borderColor: 'transparent' };
  })();

  const boxShadow =
    type === 'option' ? undefined : visual === 'hover' ? token.boxShadowSecondary : token.boxShadowTertiary;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!interactive) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  const controlNode =
    type === 'option' && control ? (
      <Flex align="center" style={{ flexShrink: 0, height: hydraTitleHeading5.lineHeight }}>
        {control === 'radio' ? (
          <Radio checked={isSelected} disabled={isDisabled} tabIndex={-1} />
        ) : (
          <Checkbox checked={isSelected} disabled={isDisabled} tabIndex={-1} />
        )}
      </Flex>
    ) : null;

  const text = (
    <Flex vertical gap={token.paddingXXS} style={{ flex: 1, minWidth: 0 }}>
      <Typography.Title
        level={5}
        style={{
          margin: 0,
          color: isDisabled ? token.colorTextDisabled : token.colorText,
          ...hydraTextStyleToReactCss(hydraTitleHeading5),
        }}
      >
        {title}
      </Typography.Title>
      {tag ? <Flex>{tag}</Flex> : null}
      {description != null ? (
        <Typography.Text
          style={{
            color: isDisabled ? token.colorTextDisabled : token.colorTextSecondary,
            ...hydraTextStyleToReactCss(hydraBaseNormal),
          }}
        >
          {description}
        </Typography.Text>
      ) : null}
      {link ? (
        <Typography.Link
          disabled={isDisabled}
          onClick={(e) => {
            e.stopPropagation();
            link.onClick?.();
          }}
          style={hydraTextStyleToReactCss(hydraBaseNormal)}
        >
          {link.label}
        </Typography.Link>
      ) : null}
    </Flex>
  );

  const iconNode = icon ? (
    <Flex style={{ flexShrink: 0, fontSize: hydraTitleHeading3.fontSize, lineHeight: 1 }}>{icon}</Flex>
  ) : null;

  return (
    <Flex
      className={className}
      vertical={layout === 'vertical'}
      gap={token.paddingSM}
      role={onClick ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-pressed={onClick ? isSelected : undefined}
      aria-disabled={isDisabled || undefined}
      onClick={interactive ? onClick : undefined}
      onKeyDown={onKeyDown}
      onMouseEnter={controlledState === undefined ? () => setHovered(true) : undefined}
      onMouseLeave={controlledState === undefined ? () => setHovered(false) : undefined}
      style={{
        boxSizing: 'border-box',
        width: '100%',
        paddingBlock: token.paddingLG,
        paddingInline: layout === 'vertical' ? token.paddingLG : token.padding,
        background: surface.background,
        border: `${token.lineWidth}px ${token.lineType} ${surface.borderColor}`,
        borderRadius: token.borderRadiusLG,
        boxShadow,
        cursor: interactive ? 'pointer' : isDisabled ? 'not-allowed' : undefined,
        transition: `border-color ${token.motionDurationMid}, box-shadow ${token.motionDurationMid}, background ${token.motionDurationMid}`,
        ...style,
      }}
    >
      {controlNode}
      {iconNode}
      {text}
    </Flex>
  );
}
