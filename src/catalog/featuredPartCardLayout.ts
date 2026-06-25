import type { GlobalToken } from 'antd/es/theme/interface';

import { hydraBaseNormal } from '../theme/hydraTypography';

/** Featured card metrics — derived from antd `token` + Figma typography mirror only. */
export function getFeaturedPartCardLayout(token: GlobalToken) {
  const imageColumnWidth = token.controlHeight * 5;

  return {
    cardHeight: imageColumnWidth + token.marginMD,
    imageColumnWidth,
    subtitleMinHeight: hydraBaseNormal.lineHeight * 2,
    dividerInset: token.marginXS,
    copyGap: token.marginXS,
    contentPadding: token.paddingLG,
    imagePadding: token.paddingSM,
    cardChromeTransition: `box-shadow ${token.motionDurationMid}, border-color ${token.motionDurationMid}`,
  } as const;
}
