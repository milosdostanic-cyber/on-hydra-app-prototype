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
import {
  hydraBoxShadow,
  hydraBoxShadowSecondary,
  hydraBoxShadowTertiary,
  hydraMenuDarkChrome,
  hydraNeutralGray3Dark,
  hydraNeutralGray3Light,
} from './hydraSemanticColors';
import {
  getHydraAntdTypographyToken,
  hydraAntdTypographyComponentConfig,
  type HydraTypographyMode,
} from './hydraAntdTypography';
import type { HydraColorMode } from './hydraColorMode';
import { hydraDarkAlias, hydraLightAlias, shellLayout } from './hydraAlias';
import { bluePrimarySemantics, bluePrimarySemanticsDark } from './primaryPrimitiveBlue';
import { sidebarSemanticsFor } from './sidebarSemantics';

/** Sidebar + `Layout` sider — Figma `Color/Sidebar/*` + alias surfaces for light / dark app mode. */
function buildHydraShellComponents(mode: HydraColorMode): NonNullable<ThemeConfig['components']> {
  const alias = mode === 'light' ? hydraLightAlias : hydraDarkAlias;
  const sidebar = sidebarSemanticsFor(mode);
  return {
    Layout: {
      siderBg: sidebar.colorSidebar,
      triggerBg: sidebar.colorSidebarSubmenuBg,
      triggerColor: hydraMenuDarkChrome.itemText,
      headerBg: alias.colorBgContainer,
      bodyBg: alias.colorFillAlter,
      headerHeight: shellLayout.headerHeight,
    },
    Menu: {
      itemBorderRadius: hydraMenuItemBorderRadius,
      subMenuItemBorderRadius: hydraMenuItemBorderRadius,
      horizontalItemBorderRadius: hydraMenuItemBorderRadius,
      itemMarginInline: hydraMenuItemMarginInline,
      itemMarginBlock: hydraMenuItemMarginBlock,
      /** Align menu row height with global control height (Figma / antd `controlHeightLG`, typically 40px). */
      itemHeight: alias.controlHeightLG,
      itemPaddingInline: alias.padding,
      darkItemBg: sidebar.colorSidebar,
      darkSubMenuItemBg: sidebar.colorSidebarSubmenuBg,
      darkItemSelectedBg: sidebar.colorSidebarItemSelectedBg,
      darkItemSelectedColor: sidebar.colorSidebarItemSelectedText,
      darkItemColor: hydraMenuDarkChrome.itemText,
      darkItemHoverBg: hydraMenuDarkChrome.itemHoverBg,
      darkItemHoverColor: alias.colorWhite,
      darkPopupBg: sidebar.colorSidebar,
    },
    /** BOM spec table: header + borders from alias tokens (same as Figma `colorFillQuaternary` / borders). */
    Table: {
      headerBg: alias.colorFillQuaternary,
      headerColor: alias.colorText,
      headerSplitColor: alias.colorSplit,
      borderColor: alias.colorBorderSecondary,
      rowHoverBg: alias.controlItemBgHover,
    },
  };
}

/**
 * Global primary = `bluePrimarySemantics` ↔ Figma **Colors** `Primary/primary-*` + **Customize Theme** `Color/Primary/*`.
 * Orange solid Button = `buttonPrimaryPalette` ↔ **Colors** `Volcano/volcano-*` + `Color/ButtonPrimary/*`.
 */
export function createHydraAntdTheme(typographyMode: HydraTypographyMode = 'default'): ThemeConfig {
  const typographyToken = getHydraAntdTypographyToken(typographyMode);
  return {
    token: {
      ...typographyToken,
      /** Figma **Customize Theme** `Color/Neutral/Background/colorBgLayout` → **Colors** `Neutral/gray-3`. */
      colorBgLayout: hydraNeutralGray3Light,
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
      boxShadow: hydraBoxShadow,
      boxShadowSecondary: hydraBoxShadowSecondary,
      boxShadowTertiary: hydraBoxShadowTertiary,
    },
    components: {
      ...buildHydraShellComponents('light'),
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
}

export function createHydraAntdThemeDark(typographyMode: HydraTypographyMode = 'default'): ThemeConfig {
  const baseTheme = createHydraAntdTheme(typographyMode);
  return {
    ...baseTheme,
    algorithm: theme.darkAlgorithm,
    token: {
      ...baseTheme.token,
      ...bluePrimarySemanticsDark,
      colorBgLayout: hydraNeutralGray3Dark,
    },
    components: {
      ...baseTheme.components,
      ...buildHydraShellComponents('dark'),
      Button: {
        ...baseTheme.components?.Button,
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
}

/**
 * Default light theme (Typography `Default` mode).
 * For compact mode use `createHydraAntdTheme('compact')`.
 */
export const hydraAntdTheme: ThemeConfig = createHydraAntdTheme();

/**
 * Default dark theme (Typography `Default` mode).
 * For compact mode use `createHydraAntdThemeDark('compact')`.
 */
export const hydraAntdThemeDark: ThemeConfig = createHydraAntdThemeDark();
