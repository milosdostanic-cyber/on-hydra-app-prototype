/**
 * Figma **Hydra Ant Design — DS** `Stat Tile` (page `❖ Stat Tile`, `1992:42`).
 *
 * Token parity (Customize Theme → `theme.useToken()`):
 * - Surface: `colorBgContainer`, `borderRadiusLG`, `boxShadowTertiary`, `lineWidth` stroke by `tone`.
 * - Padding: `paddingSM` block / `paddingMD` inline; gap `marginSM`.
 * - Label: `Base/Normal` + `colorTextDescription`. Value: `Title/Heading 3` + `colorText`.
 */
import type { CSSProperties, ReactNode } from 'react';

import { hydraBaseNormal, hydraTextStyleToReactCss, hydraTitleHeading3 } from '../theme/hydraTypography';
import { Flex, Typography, theme } from 'antd';

/** Figma variant prop `tone`. */
export type StatTileTone = 'neutral' | 'success' | 'warning' | 'error' | 'info';

export type StatTileProps = {
  label: ReactNode;
  value: ReactNode;
  tone?: StatTileTone;
  className?: string;
  style?: CSSProperties;
};

export function StatTile({ label, value, tone = 'neutral', className, style }: StatTileProps) {
  const { token } = theme.useToken();
  const borderColor: Record<StatTileTone, string> = {
    neutral: token.colorBorderSecondary,
    success: token.colorSuccessBorder,
    warning: token.colorWarningBorder,
    error: token.colorErrorBorder,
    info: token.colorInfoBorder,
  };

  return (
    <Flex
      className={className}
      align="center"
      justify="space-between"
      gap={token.marginSM}
      style={{
        boxSizing: 'border-box',
        paddingBlock: token.paddingSM,
        paddingInline: token.paddingMD,
        background: token.colorBgContainer,
        border: `${token.lineWidth}px ${token.lineType} ${borderColor[tone]}`,
        borderRadius: token.borderRadiusLG,
        boxShadow: token.boxShadowTertiary,
        ...style,
      }}
    >
      <Typography.Text
        ellipsis
        style={{ minWidth: 0, color: token.colorTextDescription, ...hydraTextStyleToReactCss(hydraBaseNormal) }}
      >
        {label}
      </Typography.Text>
      <Typography.Text
        style={{ flexShrink: 0, color: token.colorText, ...hydraTextStyleToReactCss(hydraTitleHeading3) }}
      >
        {value}
      </Typography.Text>
    </Flex>
  );
}
