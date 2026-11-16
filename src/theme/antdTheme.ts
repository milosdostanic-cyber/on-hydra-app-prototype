import { theme, type ThemeConfig } from 'antd';

import {
  buttonPrimaryControlOutline,
  buttonPrimaryPalette,
  buttonPrimaryPaletteDark,
  buttonPrimaryShadow,
  buttonPrimaryShadowDark,
} from './buttonPrimaryPalette';
import { buttonDangerShadow, buttonDangerShadowDark } from './buttonDangerPalette';
import {
  hydraMenuItemBorderRadius,
  hydraMenuItemMarginBlock,
  hydraMenuItemMarginInline,
} from './hydraMenuMetrics';
import {
  hydraBoxShadow,
  hydraBoxShadowSecondary,
  hydraBoxShadowTertiary,
  hydraColorBgMaskLight,
  hydraColorIconLight,
  hydraErrorSemanticsLight,
  hydraMenuDarkChrome,
  hydraNeutralGray3Dark,
  hydraNeutralGray3Light,
  hydraSuccessSemanticsLight,
  hydraWarningSemanticsLight,
} from './hydraSemanticColors';
import {
  getHydraAntdTypographyToken,
  hydraAntdTypographyComponentConfig,
  type HydraTypographyMode,
} from './hydraAntdTypography';
import type { HydraColorMode } from './hydraColorMode';
import { hydraDarkAlias, hydraLightAlias, hydraLineWidthFocus, shellLayout } from './hydraAlias';
import { bluePrimarySemantics, bluePrimarySemanticsDark, blueInfoSemantics, blueInfoSemanticsDark } from './primaryPrimitiveBlue';
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
    /**
     * Figma DS `Tag` defaults (`type=default, border=true`):
     * bg `colorFillQuaternary`, border `colorBorder`, text `colorText`.
     * Label typography (14/22/400 Base/Normal) — `applyHydraTagCssVars` + `index.css` (antd defaults to `fontSizeSM`).
     */
    Tag: {
      defaultBg: alias.colorFillQuaternary,
      defaultColor: alias.colorText,
    },
  };
}

/**
 * Figma **Customize Theme** `Light` values that antd's dark algorithm must not inherit.
 * `createHydraAntdThemeDark` strips these keys until the Dark pass (audit D-01).
 */
const hydraLightOnlyToken = {
  /** `Color/Neutral/Text/colorIcon` / `colorIconHover` → `Opacity/opacity-100`. */
  colorIcon: hydraColorIconLight,
  colorIconHover: hydraColorIconLight,
  /** `Color/Neutral/Background/colorBgMask` → `Opacity/opacity-65`. */
  colorBgMask: hydraColorBgMaskLight,
  /** `Color/Control/controlOutline` → `Color/Primary/colorPrimaryBorder`. */
  controlOutline: bluePrimarySemantics.colorPrimaryBorder,
  ...hydraSuccessSemanticsLight,
  ...hydraWarningSemanticsLight,
  ...hydraErrorSemanticsLight,
} as const;

/**
 * Global primary = `bluePrimarySemantics` ↔ Figma **Colors** `Primary/primary-*` + **Customize Theme** `Color/Primary/*`.
 * Info / Alert = `blueInfoSemantics` ↔ **Colors** `Daybreak Blue/blue-*` + `Color/Info/*`.
 * Success / Warning / Error ↔ `Polar Green` / `Calendula Gold` / `Dust Red` + `Color/Success|Warning|Error/*`.
 * Orange solid Button = `buttonPrimaryPalette` ↔ **Colors** `Hydra Action Orange/hydra-*` + `Color/Action/*`.
 */
export function createHydraAntdTheme(typographyMode: HydraTypographyMode = 'default'): ThemeConfig {
  const typographyToken = getHydraAntdTypographyToken(typographyMode);
  return {
    token: {
      ...typographyToken,
      ...hydraLightOnlyToken,
      /** Figma **Customize Theme** `Color/Neutral/Background/colorBgLayout` → **Colors** `Neutral/gray-3`. */
      colorBgLayout: hydraNeutralGray3Light,
      /** Figma `Style/lineWidthFocus`. */
      lineWidthFocus: hydraLineWidthFocus,
      /** Figma `Color/Action/colorActionBg` / `colorActionBorder` (non-Button orange tints). */
      colorActionBg: buttonPrimaryPalette.bg,
      colorActionBorder: buttonPrimaryPalette.border,
      colorLink: bluePrimarySemantics.colorLink,
      colorLinkHover: bluePrimarySemantics.colorLinkHover,
      colorLinkActive: bluePrimarySemantics.colorLinkActive,
      colorPrimary: bluePrimarySemantics.colorPrimary,
      colorPrimaryBg: bluePrimarySemantics.colorPrimaryBg,
      colorPrimaryBgHover: bluePrimarySemantics.colorPrimaryBgHover,
      colorPrimaryBgSubtle: bluePrimarySemantics.colorPrimaryBgSubtle,
      colorPrimaryBorder: bluePrimarySemantics.colorPrimaryBorder,
      colorPrimaryBorderSubtle: bluePrimarySemantics.colorPrimaryBorderSubtle,
      colorPrimaryBorderHover: bluePrimarySemantics.colorPrimaryBorderHover,
      colorPrimaryHover: bluePrimarySemantics.colorPrimaryHover,
      colorPrimaryActive: bluePrimarySemantics.colorPrimaryActive,
      colorPrimaryText: bluePrimarySemantics.colorPrimaryText,
      colorPrimaryTextHover: bluePrimarySemantics.colorPrimaryTextHover,
      colorPrimaryTextActive: bluePrimarySemantics.colorPrimaryTextActive,
      /** Figma `Color/Info/*` → Daybreak (Alert `type="info"`). */
      colorInfo: blueInfoSemantics.colorInfo,
      colorInfoBg: blueInfoSemantics.colorInfoBg,
      colorInfoBgHover: blueInfoSemantics.colorInfoBgHover,
      colorInfoBorder: blueInfoSemantics.colorInfoBorder,
      colorInfoBorderHover: blueInfoSemantics.colorInfoBorderHover,
      colorInfoHover: blueInfoSemantics.colorInfoHover,
      colorInfoActive: blueInfoSemantics.colorInfoActive,
      colorInfoText: blueInfoSemantics.colorInfoText,
      colorInfoTextHover: blueInfoSemantics.colorInfoTextHover,
      colorInfoTextActive: blueInfoSemantics.colorInfoTextActive,
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
        dangerShadow: buttonDangerShadow,
        controlOutline: buttonPrimaryControlOutline,
      },
    },
  };
}

export function createHydraAntdThemeDark(typographyMode: HydraTypographyMode = 'default'): ThemeConfig {
  const baseTheme = createHydraAntdTheme(typographyMode);
  const baseToken = Object.fromEntries(
    Object.entries(baseTheme.token ?? {}).filter(([key]) => !(key in hydraLightOnlyToken)),
  );
  return {
    ...baseTheme,
    algorithm: theme.darkAlgorithm,
    token: {
      ...baseToken,
      ...bluePrimarySemanticsDark,
      ...blueInfoSemanticsDark,
      colorBgLayout: hydraNeutralGray3Dark,
      colorActionBg: buttonPrimaryPaletteDark.bg,
      colorActionBorder: buttonPrimaryPaletteDark.border,
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
        dangerShadow: buttonDangerShadowDark,
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
