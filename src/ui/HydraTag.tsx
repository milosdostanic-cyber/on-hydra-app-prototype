import type { CSSProperties, ReactNode } from 'react';

import { Tag, theme } from './antd';
import { hydraBaseNormal } from '../theme/hydraTypography';

export type HydraTagTone = 'default' | 'success' | 'warning' | 'error' | 'processing';

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

type HydraTagProps = {
  children: ReactNode;
  tone?: HydraTagTone;
  icon?: ReactNode;
  style?: CSSProperties;
  onClick?: () => void;
};

export function HydraTag({ children, tone = 'default', icon, style, onClick }: HydraTagProps) {
  const { token } = theme.useToken();
  const colors = toneColors(token, tone);
  return (
    <Tag
      icon={icon}
      onClick={onClick}
      styles={{
        root: {
          marginInline: 0,
          marginBlock: 0,
          borderRadius: token.borderRadiusSM,
          paddingInline: token.paddingSM,
          paddingBlock: token.paddingXXS,
          fontSize: token.fontSizeSM,
          lineHeight: `${token.fontSizeSM * token.lineHeightSM}px`,
          fontWeight: hydraBaseNormal.fontWeight,
          borderWidth: token.lineWidth,
          borderStyle: token.lineType,
          borderColor: colors.borderColor,
          background: colors.background,
          color: colors.textColor,
          display: 'inline-flex',
          alignItems: 'center',
          gap: token.marginXXS,
          ...style,
        },
        icon: {
          color: colors.textColor,
          fontSize: token.fontSizeSM,
          lineHeight: `${token.fontSizeSM * token.lineHeightSM}px`,
        },
      }}
    >
      {children}
    </Tag>
  );
}
