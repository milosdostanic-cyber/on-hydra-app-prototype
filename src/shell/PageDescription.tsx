import type { CSSProperties, ReactNode } from 'react';

import { Typography, theme } from '../ui/antd';

import { pageDescriptionStyle, type PageDescriptionVariant } from './pageDescriptionStyle';

type PageDescriptionProps = {
  children: ReactNode;
  variant?: PageDescriptionVariant;
  style?: CSSProperties;
};

/** Unified page subtitle — same font metrics and `colorTextDescription` as BOM headers. */
export function PageDescription({ children, variant = 'base', style }: PageDescriptionProps) {
  const { token } = theme.useToken();
  return (
    <Typography.Text style={{ display: 'block', ...pageDescriptionStyle(token, variant), ...style }}>
      {children}
    </Typography.Text>
  );
}
