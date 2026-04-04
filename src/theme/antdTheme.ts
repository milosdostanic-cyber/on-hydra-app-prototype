import { theme, type ThemeConfig } from 'antd';

import {
  buttonPrimaryControlOutline,
  buttonPrimaryPalette,
  buttonPrimaryPaletteDark,
} from './buttonPrimaryPalette';
import {
  figmaMenuItemBorderRadius,
  figmaMenuItemMarginBlock,
  figmaMenuItemMarginInline,
} from './figmaMenuMetrics';
import { figmaMenuDarkChrome } from './figmaSemanticColors';
import { hydraAntdTypographyComponentConfig, hydraAntdTypographyToken } from './hydraAntdTypography';
import { hydraLightAlias, shellLayout } from './hydraAlias';
import { bluePrimarySemantics, bluePrimarySemanticsDark } from './primaryPrimitiveBlue';
import { sidebarSemanticsLight } from './sidebarSemantics';

/** Sidebar + `Layout` sider — Figma `Color/Sidebar/*` ↔ [`sidebarSemanticsLight`](./sidebarSemantics.ts); surfaces from [`hydraLightAlias`](./hydraAlias.ts). */
const hydraShellComponents: NonNullable<ThemeConfig['components']> = {
  Layout: {
    siderBg: sidebarSemanticsLight.colorSidebar,
    triggerBg: sidebarSemanticsLight.colorSidebarSubmenuBg,
    triggerColor: figmaMenuDarkChrome.itemText,
    headerBg: hydraLightAlias.colorBgContainer,
    bodyBg: hydraLightAlias.colorFillAlter,
    headerHeight: shellLayout.headerHeight,
  },
  Menu: {
    itemBorderRadius: figmaMenuItemBorderRadius,
    subMenuItemBorderRadius: figmaMenuItemBorderRadius,
    horizontalItemBorderRadius: figmaMenuItemBorderRadius,
    itemMarginInline: figmaMenuItemMarginInline,
    itemMarginBlock: figmaMenuItemMarginBlock,
    itemPaddingInline: hydraLightAlias.padding,
    darkItemBg: sidebarSemanticsLight.colorSidebar,
    darkSubMenuItemBg: sidebarSemanticsLight.colorSidebarSubmenuBg,
    darkItemSelectedBg: sidebarSemanticsLight.colorSidebarItemSelectedBg,
    darkItemSelectedColor: sidebarSemanticsLight.colorSidebarItemSelectedText,
    darkItemColor: figmaMenuDarkChrome.itemText,
    darkItemHoverBg: figmaMenuDarkChrome.itemHoverBg,
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
    },
  },
};
