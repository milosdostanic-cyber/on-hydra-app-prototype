/**
 * Ant Design 5 typography binding — **ConfigProvider `theme.token`** (+ optional **`theme.components`**).
 * All Hydra typography metrics live in [`hydraTypography`](./hydraTypography.ts); this module is the documented bridge
 * into antd’s design token pipeline so every component (`Typography`, `Button`, `Table`, `Input`, `Modal`, …)
 * resolves sizes through the same values.
 *
 * @see https://ant.design/docs/react/customize-theme — *Customize Theme* → Design Token → *Font*
 */

import type { ThemeConfig } from 'antd';
import type { AliasToken } from 'antd/es/theme/interface';

import { brandFontFamily, hydraAntdFontMapFromDesign } from './hydraTypography';

export type HydraTypographyMode = 'default' | 'compact';

const hydraCompactFontMap = {
  fontSize: 12,
  lineHeight: 20 / 12,
  fontSizeSM: 10,
  lineHeightSM: 18 / 10,
  fontSizeLG: 14,
  lineHeightLG: 22 / 14,
  fontSizeXL: 16,
  fontSizeHeading1: 32,
  lineHeightHeading1: 40 / 32,
  fontSizeHeading2: 26,
  lineHeightHeading2: 34 / 26,
  fontSizeHeading3: 20,
  lineHeightHeading3: 28 / 20,
  fontSizeHeading4: 16,
  lineHeightHeading4: 24 / 16,
  fontSizeHeading5: 14,
  lineHeightHeading5: 22 / 14,
  fontHeight: 20,
  fontHeightSM: 18,
  fontHeightLG: 22,
  fontWeightStrong: 600,
} as const;

/**
 * Pass this object into `ConfigProvider` as **`theme.token`** (merged with colors and other seeds in
 * [`antdTheme`](./antdTheme.ts)). Do not set separate font sizes for components elsewhere unless you map
 * them to a named style in `hydraTypography` first.
 */
export const hydraAntdTypographyToken = {
  fontFamily: brandFontFamily,
  fontFamilyCode: brandFontFamily,
  ...hydraAntdFontMapFromDesign,
} as const satisfies Partial<AliasToken>;

/** Typography token selector aligned with Figma `Typography` modes (`Default`, `Compact`). */
export function getHydraAntdTypographyToken(mode: HydraTypographyMode = 'default'): Partial<AliasToken> {
  if (mode === 'compact') {
    return {
      fontFamily: brandFontFamily,
      fontFamilyCode: brandFontFamily,
      ...hydraCompactFontMap,
    };
  }

  return hydraAntdTypographyToken;
}

/**
 * Component-level tokens antd exposes for **Typography** (spacing between titles only; font sizes come from
 * global `fontSizeHeading*` / `lineHeightHeading*` above).
 */
export const hydraAntdTypographyComponentConfig: Pick<
  NonNullable<ThemeConfig['components']>,
  'Typography'
> = {
  Typography: {
    titleMarginTop: '1.2em',
    titleMarginBottom: '0.5em',
  },
};
