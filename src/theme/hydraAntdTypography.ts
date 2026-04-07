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
