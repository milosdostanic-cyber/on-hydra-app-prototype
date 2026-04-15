import { theme } from 'antd';

import { bluePrimarySemantics, bluePrimarySemanticsDark } from './primaryPrimitiveBlue';
import { hydraAntdTypographyToken } from './hydraAntdTypography';
import {
  hydraBoxShadow,
  hydraBoxShadowSecondary,
  hydraBoxShadowTertiary,
  hydraNeutralGray3Dark,
  hydraNeutralGray3Light,
} from './hydraSemanticColors';
import { hydraSidebarBrandBandHeightPx } from './hydraMenuMetrics';

/**
 * Ant Design **alias** tokens (spacing, neutrals, surfaces) merged with Hydra `theme.token` overrides.
 * Use in **theme config** and anywhere you need the same resolved values outside React (`useToken`).
 */
export const hydraLightAlias = theme.getDesignToken({
  token: {
    ...hydraAntdTypographyToken,
    ...bluePrimarySemantics,
    /** Figma `colorBgLayout` → `Neutral/gray-3` (not antd default `#f5f5f5`). */
    colorBgLayout: hydraNeutralGray3Light,
    boxShadow: hydraBoxShadow,
    boxShadowSecondary: hydraBoxShadowSecondary,
    boxShadowTertiary: hydraBoxShadowTertiary,
  },
});

/** Alias tokens under antd **dark** algorithm + Hydra dark primary semantics — shell `Layout` surfaces. */
export const hydraDarkAlias = theme.getDesignToken({
  algorithm: theme.darkAlgorithm,
  token: {
    ...hydraAntdTypographyToken,
    ...bluePrimarySemanticsDark,
    /** Figma `colorBgLayout` → `Neutral/gray-3` (not antd dark default `#000000`). */
    colorBgLayout: hydraNeutralGray3Dark,
    boxShadow: hydraBoxShadow,
    boxShadowSecondary: hydraBoxShadowSecondary,
    boxShadowTertiary: hydraBoxShadowTertiary,
  },
});

/** Layout shell metrics derived from `sizeUnit` / `sizeStep` (no magic pixel literals in UI). */
export const shellLayout = {
  /** Figma `Sidebar` logo band + main shell header row (`hydraSidebarBrandBandHeightPx`). */
  headerHeight: hydraSidebarBrandBandHeightPx,
  /** Figma `Sidebar` width 256px = `sizeUnit` 4 × 64. */
  siderWidth: hydraLightAlias.sizeUnit * 64,
  siderCollapsedWidth: hydraLightAlias.sizeUnit * 18,
  contentMinHeight: hydraLightAlias.sizeStep * 80,
  topBarSearchWidth: hydraLightAlias.sizeUnit * 55,
  /** Main column content rail: min reading width on wide viewports, cap on very large screens. */
  contentRailMinWidthPx: 1136,
  contentRailMaxWidthPx: 1440,
  /** Default `pageSize` for list `Table` + standalone `Pagination` (antd default is 10). */
  tablePageSizeDefault: 20,
} as const;
