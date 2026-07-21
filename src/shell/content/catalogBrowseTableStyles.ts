import type { TableProps } from '../../ui/antd';

import { hydraBaseStrong } from '../../theme/hydraTypography';

/** Shared table header styling for product catalog browse screens. */
export function catalogBrowseTableHeaderStyles(token: {
  colorTextDescription: string;
}): TableProps<object>['styles'] {
  return {
    header: {
      cell: {
        color: token.colorTextDescription,
        fontWeight: hydraBaseStrong.fontWeight,
      },
    },
  };
}
