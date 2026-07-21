import type { CSSProperties, ReactNode } from 'react';
import type { GlobalToken } from 'antd/es/theme/interface';

import { Typography, theme } from '../ui/antd';

/** Subtle shell for the user's original imported value — left accent, no type-scale change. */
export function bomImportedDataShellStyle(token: GlobalToken): CSSProperties {
  return {
    padding: `${token.paddingXXS}px ${token.paddingSM}px`,
    background: token.colorPrimaryBgSubtle,
    borderLeft: `${token.lineWidth * 3}px solid ${token.colorPrimaryBorder}`,
    borderRadius: token.borderRadius,
  };
}

export function bomImportedColumnHeaderStyle(token: GlobalToken): CSSProperties {
  return {
    color: token.colorPrimary,
  };
}

type BomImportedValueCellProps = {
  value?: string;
  children?: ReactNode;
};

export function BomImportedValueCell({ value, children }: BomImportedValueCellProps) {
  const { token } = theme.useToken();
  const display = value?.trim() || '—';

  return (
    <div style={bomImportedDataShellStyle(token)}>
      <Typography.Text ellipsis={{ tooltip: value?.trim() ? display : undefined }} style={{ display: 'block' }}>
        {children ?? display}
      </Typography.Text>
    </div>
  );
}
