import type { CSSProperties, ReactNode } from 'react';

import { hydraBaseNormal, hydraTextStyleToReactCss } from '../theme/hydraTypography';
import { Tag, theme } from './antd';

export type HydraTagTone = 'default' | 'success' | 'warning' | 'error' | 'processing';

/** Ant Design colorful Tag presets — Figma DS `Tag / Colorful` (node 137:7488). */
export type HydraColorfulPreset =
  | 'magenta'
  | 'red'
  | 'volcano'
  | 'orange'
  | 'gold'
  | 'lime'
  | 'green'
  | 'cyan'
  | 'blue'
  | 'geekblue'
  | 'purple';

function toneColors(token: ReturnType<typeof theme.useToken>['token'], tone: HydraTagTone) {
  if (tone === 'success') {
    return { background: token.colorSuccessBg, borderColor: token.colorSuccessBorder, textColor: token.colorSuccessText };
  }
  if (tone === 'warning') {
    return { background: token.colorWarningBg, borderColor: token.colorWarningBorder, textColor: token.colorWarningText };
  }
  if (tone === 'error') {
    return { background: token.colorErrorBg, borderColor: token.colorErrorBorder, textColor: token.colorErrorText };
  }
  if (tone === 'processing') {
    return { background: token.colorPrimaryBg, borderColor: token.colorPrimaryBorder, textColor: token.colorPrimaryText };
  }
  return {
    background: token.colorFillQuaternary,
    borderColor: token.colorBorder,
    textColor: token.colorText,
  };
}

function hydraTagRootStyle(
  token: ReturnType<typeof theme.useToken>['token'],
  colors?: { background?: string; borderColor?: string; textColor?: string; borderWidth?: number },
  style?: CSSProperties,
): CSSProperties {
  return {
    marginInline: 0,
    marginBlock: 0,
    borderRadius: token.borderRadiusSM,
    paddingInline: token.paddingSM,
    paddingBlock: token.paddingXXS,
    ...hydraTextStyleToReactCss(hydraBaseNormal),
    borderWidth: colors?.borderWidth ?? token.lineWidth,
    borderStyle: token.lineType,
    borderColor: colors?.borderColor,
    background: colors?.background,
    color: colors?.textColor,
    display: 'inline-flex',
    alignItems: 'center',
    gap: token.marginXXS,
    ...style,
  };
}

type HydraTagProps = {
  children: ReactNode;
  tone?: HydraTagTone;
  bordered?: boolean;
  icon?: ReactNode;
  style?: CSSProperties;
  onClick?: () => void;
};

/** Figma DS `Tag / Default` (`type=default, border=true`) — Base/Normal 14/22 Regular. `bordered={false}` for borderless chips. */
export function HydraTag({
  children,
  tone = 'default',
  bordered = true,
  icon,
  style,
  onClick,
}: HydraTagProps) {
  const { token } = theme.useToken();
  const colors = toneColors(token, tone);
  const rootStyle = hydraTagRootStyle(token, {
    background: colors.background,
    borderColor: bordered ? colors.borderColor : undefined,
    textColor: colors.textColor,
    borderWidth: bordered ? undefined : 0,
  }, style);

  return (
    <Tag
      icon={icon}
      bordered={bordered}
      onClick={onClick}
      styles={{
        root: rootStyle,
        icon: {
          color: colors.textColor,
          fontSize: rootStyle.fontSize,
          lineHeight: rootStyle.lineHeight,
        },
      }}
    >
      {children}
    </Tag>
  );
}

type HydraColorfulTagProps = {
  children: ReactNode;
  preset: HydraColorfulPreset;
  /** Figma `Tag / Colorful` — priority chips use `border=false`. */
  bordered?: boolean;
  style?: CSSProperties;
};

/**
 * Figma DS `Tag / Colorful` (node 137:7488) — antd preset ramp `X-1` bg / `X-3` border / `X-6` text.
 * Border is kept (Figma `border=true`); only layout metrics are overridden so colors come from the preset.
 */
export function HydraColorfulTag({
  children,
  preset,
  bordered = false,
  style,
}: HydraColorfulTagProps) {
  const { token } = theme.useToken();
  const rootStyle = hydraTagRootStyle(
    token,
    bordered ? undefined : { borderWidth: 0 },
    style,
  );

  return (
    <Tag color={preset} bordered={bordered} styles={{ root: rootStyle }}>
      {children}
    </Tag>
  );
}
