import type { CSSProperties } from 'react';
import type { GlobalToken } from 'antd/es/theme/interface';

import {
  hydraBaseNormal,
  hydraLargeStrong,
  hydraTextStyleToReactCss,
} from '../theme/hydraTypography';

export type PageDescriptionVariant = 'base' | 'large-strong';

/** Subtitle under page headlines — matches {@link BomPageHeader} / BOM screens. */
export function pageDescriptionStyle(
  token: GlobalToken,
  variant: PageDescriptionVariant = 'base',
): CSSProperties {
  return {
    margin: 0,
    color: token.colorTextDescription,
    ...hydraTextStyleToReactCss(variant === 'large-strong' ? hydraLargeStrong : hydraBaseNormal),
  };
}
