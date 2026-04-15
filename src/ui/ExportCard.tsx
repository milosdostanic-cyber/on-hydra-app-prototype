/**
 * Figma **Hydra Ant Design — DS** `ExportCard` (`node-id=826-1181`).
 *
 * Token parity (Customize Theme → `theme.useToken()`):
 * - Surface: `colorBgContainer`, `borderRadiusLG`, `paddingLG`, vertical gap `paddingXS` (via `Space` `size={paddingXS}`).
 * - Card elevation: `boxShadowTertiary` (rest, hover, active).
 * - Active chrome: `lineWidth * 2` + `lineType` + `colorPrimary`. Rest/Hover: same width, transparent border (no layout shift vs Figma rest = no stroke).
 * - Title: Figma `Title/Heading 4` → `hydraTitleHeading4`.
 * - Description: Figma `Base/Normal` + `colorTextDescription` → `hydraBaseNormal` + token.
 *
 * Figma variant prop `state`: `Rest` | `Hover` | `Active` — API uses lowercase; export `figmaExportCardState` for label parity.
 */
import type { CSSProperties, KeyboardEvent, ReactNode } from 'react';
import { useCallback, useState } from 'react';

import { hydraBaseNormal, hydraTitleHeading4, hydraTextStyleToReactCss } from '../theme/hydraTypography';
import { Flex, Space, Typography, theme } from './antd';

/** Figma `ExportCard` variant names (PascalCase) for docs / mapping. */
export const figmaExportCardState = ['Rest', 'Hover', 'Active'] as const;
export type FigmaExportCardState = (typeof figmaExportCardState)[number];

export type ExportCardVisualState = 'rest' | 'hover' | 'active';

export type ExportCardProps = {
  className?: string;
  style?: CSSProperties;
  /**
   * Controlled visual state (Figma `state`). When set, hover tracking is disabled.
   * Map from Figma: `Rest` → `rest`, `Hover` → `hover`, `Active` → `active`.
   */
  state?: ExportCardVisualState;
  /** Selected / pressed card — `active` visuals when `state` not controlled. */
  selected?: boolean;
  title: ReactNode;
  description?: ReactNode;
  /** Leading 24×24 slot (Figma `FileExcel`); size icons with `token.fontSizeHeading3`. */
  icon?: ReactNode;
  /** Shown in `active` state on trailing edge, vertically centered (product affordance). */
  endAffordance?: ReactNode;
  onClick?: () => void;
};

function resolveVisualState(
  controlled: ExportCardVisualState | undefined,
  selected: boolean | undefined,
  hovered: boolean,
): ExportCardVisualState {
  if (controlled !== undefined) return controlled;
  if (selected) return 'active';
  if (hovered) return 'hover';
  return 'rest';
}

export function ExportCard({
  className,
  style,
  state: controlledState,
  selected = false,
  title,
  description,
  icon,
  endAffordance,
  onClick,
}: ExportCardProps) {
  const { token } = theme.useToken();
  const [hovered, setHovered] = useState(false);
  const visual = resolveVisualState(controlledState, selected, hovered);
  const isActive = visual === 'active';

  const boxShadow = token.boxShadowTertiary;
  const borderColor = isActive ? token.colorPrimary : 'transparent';

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (!onClick) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    },
    [onClick],
  );

  const body = (
    <Space orientation="vertical" size={token.paddingXS} style={{ flex: 1, minWidth: 0 }}>
      {icon ? <Flex style={{ flexShrink: 0, fontSize: token.fontSizeHeading3, lineHeight: 1 }}>{icon}</Flex> : null}
      <Typography.Title
        level={4}
        style={{
          margin: 0,
          color: token.colorText,
          ...hydraTextStyleToReactCss(hydraTitleHeading4),
        }}
      >
        {title}
      </Typography.Title>
      {description != null ? (
        <Typography.Text
          style={{
            margin: 0,
            display: 'block',
            color: token.colorTextDescription,
            ...hydraTextStyleToReactCss(hydraBaseNormal),
          }}
        >
          {description}
        </Typography.Text>
      ) : null}
    </Space>
  );

  return (
    <div
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
        cursor: onClick ? 'pointer' : undefined,
        background: token.colorBgContainer,
        borderRadius: token.borderRadiusLG,
        padding: token.paddingLG,
        boxShadow,
        border: `${token.lineWidth * 2}px ${token.lineType} ${borderColor}`,
        ...style,
      }}
    >
      {isActive && endAffordance ? (
        <Flex align="center" gap={token.marginMD} style={{ width: '100%' }}>
          {body}
          <Flex align="center" justify="center" style={{ flexShrink: 0 }} aria-hidden>
            {endAffordance}
          </Flex>
        </Flex>
      ) : (
        body
      )}
    </div>
  );
}
