import { theme, type ThemeConfig } from 'antd';

import {
  buttonPrimaryControlOutline,
  buttonPrimaryPalette,
  buttonPrimaryPaletteDark,
  buttonPrimaryShadow,
  buttonPrimaryShadowDark,
} from './buttonPrimaryPalette';
import {
  hydraMenuItemBorderRadius,
  hydraMenuItemMarginBlock,
  hydraMenuItemMarginInline,
} from './hydraMenuMetrics';
import { hydraMenuDarkChrome } from './hydraSemanticColors';
import { hydraAntdTypographyComponentConfig, hydraAntdTypographyToken } from './hydraAntdTypography';
import { hydraLightAlias, shellLayout } from './hydraAlias';
import { bluePrimarySemantics, bluePrimarySemanticsDark } from './primaryPrimitiveBlue';
import { sidebarSemanticsLight } from './sidebarSemantics';

/** Sidebar + `Layout` sider — Figma `Color/Sidebar/*` ↔ [`sidebarSemanticsLight`](./sidebarSemantics.ts); surfaces from [`hydraLightAlias`](./hydraAlias.ts). */
const hydraShellComponents: NonNullable<ThemeConfig['components']> = {
  Layout: {
    siderBg: sidebarSemanticsLight.colorSidebar,
    triggerBg: sidebarSemanticsLight.colorSidebarSubmenuBg,
    triggerColor: hydraMenuDarkChrome.itemText,
    headerBg: hydraLightAlias.colorBgContainer,
    bodyBg: hydraLightAlias.colorFillAlter,
    headerHeight: shellLayout.headerHeight,
  },
  Menu: {
    itemBorderRadius: hydraMenuItemBorderRadius,
    subMenuItemBorderRadius: hydraMenuItemBorderRadius,
    horizontalItemBorderRadius: hydraMenuItemBorderRadius,
    itemMarginInline: hydraMenuItemMarginInline,
    itemMarginBlock: hydraMenuItemMarginBlock,
    /** Align menu row height with global control height (Figma / antd `controlHeightLG`, typically 40px). */
    itemHeight: hydraLightAlias.controlHeightLG,
    itemPaddingInline: hydraLightAlias.padding,
    darkItemBg: sidebarSemanticsLight.colorSidebar,
    darkSubMenuItemBg: sidebarSemanticsLight.colorSidebarSubmenuBg,
    darkItemSelectedBg: sidebarSemanticsLight.colorSidebarItemSelectedBg,
    darkItemSelectedColor: sidebarSemanticsLight.colorSidebarItemSelectedText,
    darkItemColor: hydraMenuDarkChrome.itemText,
    darkItemHoverBg: hydraMenuDarkChrome.itemHoverBg,
    darkItemHoverColor: hydraLightAlias.colorWhite,
    darkPopupBg: sidebarSemanticsLight.colorSidebar,
  },
};

/**
 * Global primary = `bluePrimarySemantics` ↔ Figma **Colors** `Primary/primary-*` + **Customize Theme** `Color/Primary/*`.
 * Orange solid Button = `buttonPrimaryPalette` ↔ **Colors** `Volcano/volcano-*` + `Color/ButtonPrimary/*`.
 */
export const hydraAntdTheme: ThemeConfig = {
  token: {
    ...hydraAntdTypographyToken,
    colorLink: bluePrimarySemantics.colorLink,
    colorLinkHover: bluePrimarySemantics.colorLinkHover,
    colorLinkActive: bluePrimarySemantics.colorLinkActive,
    colorPrimary: bluePrimarySemantics.colorPrimary,
    colorPrimaryBg: bluePrimarySemantics.colorPrimaryBg,
    colorPrimaryBgHover: bluePrimarySemantics.colorPrimaryBgHover,
    colorPrimaryBorder: bluePrimarySemantics.colorPrimaryBorder,
    colorPrimaryBorderHover: bluePrimarySemantics.colorPrimaryBorderHover,
    colorPrimaryHover: bluePrimarySemantics.colorPrimaryHover,
    colorPrimaryActive: bluePrimarySemantics.colorPrimaryActive,
    colorPrimaryText: bluePrimarySemantics.colorPrimaryText,
    colorPrimaryTextHover: bluePrimarySemantics.colorPrimaryTextHover,
    colorPrimaryTextActive: bluePrimarySemantics.colorPrimaryTextActive,
  },
  components: {
    ...hydraShellComponents,
    ...hydraAntdTypographyComponentConfig,
    Button: {
      colorPrimary: buttonPrimaryPalette.rest,
      colorPrimaryHover: buttonPrimaryPalette.hover,
      colorPrimaryActive: buttonPrimaryPalette.active,
      colorPrimaryBg: buttonPrimaryPalette.bg,
      colorPrimaryBgHover: buttonPrimaryPalette.bgHover,
      colorPrimaryBorder: buttonPrimaryPalette.border,
      colorPrimaryBorderHover: buttonPrimaryPalette.borderHover,
      colorPrimaryText: buttonPrimaryPalette.text,
      colorPrimaryTextHover: buttonPrimaryPalette.textHover,
      colorPrimaryTextActive: buttonPrimaryPalette.textActive,
      primaryShadow: buttonPrimaryShadow,
      controlOutline: buttonPrimaryControlOutline,
    },
  },
};

/**
 * Dark algorithm + Hydra primary/Button overrides aligned with Figma **Colors** Dark (`5:4`).
 * Pair with `applyHydraBrandCssVars(document.documentElement, 'dark')` for ghost buttons.
 */
export const hydraAntdThemeDark: ThemeConfig = {
  ...hydraAntdTheme,
  algorithm: theme.darkAlgorithm,
  token: {
    ...hydraAntdTheme.token,
    ...bluePrimarySemanticsDark,
  },
  components: {
    ...hydraAntdTheme.components,
    Button: {
      ...hydraAntdTheme.components?.Button,
      colorPrimary: buttonPrimaryPaletteDark.rest,
      colorPrimaryHover: buttonPrimaryPaletteDark.hover,
      colorPrimaryActive: buttonPrimaryPaletteDark.active,
      colorPrimaryBg: buttonPrimaryPaletteDark.bg,
      colorPrimaryBgHover: buttonPrimaryPaletteDark.bgHover,
      colorPrimaryBorder: buttonPrimaryPaletteDark.border,
      colorPrimaryBorderHover: buttonPrimaryPaletteDark.borderHover,
      colorPrimaryText: buttonPrimaryPaletteDark.text,
      colorPrimaryTextHover: buttonPrimaryPaletteDark.textHover,
      colorPrimaryTextActive: buttonPrimaryPaletteDark.textActive,
      primaryShadow: buttonPrimaryShadowDark,
    },
  },
};
