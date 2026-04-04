import { theme } from 'antd';

import { bluePrimarySemantics } from './primaryPrimitiveBlue';
import { brandFontFamily, figmaTextBaseNormal } from './figmaTypography';

/**
 * Ant Design **alias** tokens (spacing, neutrals, surfaces) merged with Hydra `theme.token` overrides.
 * Use in **theme config** and anywhere you need the same resolved values outside React (`useToken`).
 */
export const hydraLightAlias = theme.getDesignToken({
  token: {
    fontFamily: brandFontFamily,
    fontFamilyCode: brandFontFamily,
    fontSize: figmaTextBaseNormal.fontSize,
    ...bluePrimarySemantics,
  },
});

/** Layout shell metrics derived from `sizeUnit` / `sizeStep` (no magic pixel literals in UI). */
export const shellLayout = {
  headerHeight: hydraLightAlias.sizeUnit * 16,
  siderWidth: hydraLightAlias.sizeUnit * 60,
  siderCollapsedWidth: hydraLightAlias.sizeUnit * 18,
  contentMinHeight: hydraLightAlias.sizeStep * 80,
  topBarSearchWidth: hydraLightAlias.sizeUnit * 55,
} as const;
