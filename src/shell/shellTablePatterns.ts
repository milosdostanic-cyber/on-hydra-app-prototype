import type { GlobalToken } from 'antd/es/theme/interface';
import type { TableProps } from 'antd';

import { hydraBaseStrong, hydraTextStyleToReactCss } from '../theme/hydraTypography';

/** Link-style row actions — matches BOM workspace / site projects tables. */
export const shellTableLinkButtonStyle = { padding: 0, height: 'auto' as const };

export function shellTableCardStyle(token: GlobalToken) {
  return {
    background: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowTertiary,
    overflow: 'hidden' as const,
  };
}

export function shellTableStyles(token: GlobalToken): TableProps['styles'] {
  return {
    header: {
      cell: {
        background: token.colorFillAlter,
        borderBottomColor: token.colorBorderSecondary,
        ...hydraTextStyleToReactCss(hydraBaseStrong),
        color: token.colorTextDescription,
      },
    },
    body: {
      cell: {
        borderBottomColor: token.colorBorderSecondary,
        paddingBlock: token.paddingSM,
      },
    },
  };
}
