/**
 * Non-primary semantic colors mirrored from design variables.
 * Only this module (plus `primaryPrimitive*.ts`, `buttonPrimaryPalette.ts`) should hold literal color strings
 * for Hydra — UI and layout code consume tokens via `theme.useToken()` or `sidebarSemanticsLight`.
 *
 * Global elevation: Ant Design `token.boxShadow` / `boxShadowSecondary` / `boxShadowTertiary` stacks (Hydra design system effect styles).
 */

/** Ant Design `ThemeConfig.token.boxShadow` — default card / popover elevation. */
export const hydraBoxShadow = `
      0 6px 16px 0 rgba(0, 0, 0, 0.08),
      0 3px 6px -4px rgba(0, 0, 0, 0.12),
      0 9px 28px 8px rgba(0, 0, 0, 0.05)
    ` as const;

/** Ant Design `ThemeConfig.token.boxShadowSecondary` — secondary elevation (sider, card hover, etc.). */
export const hydraBoxShadowSecondary = `
      0 8px 9px 0 rgba(0, 0, 0, 0.03),
      0 3px 6px -4px rgba(0, 0, 0, 0.07),
      0 9px 28px 8px rgba(0, 0, 0, 0.05)
    ` as const;

/** Ant Design `ThemeConfig.token.boxShadowTertiary` — subtle elevation. */
export const hydraBoxShadowTertiary = `
      0 1px 2px 0 rgba(0, 0, 0, 0.03),
      0 1px 6px -1px rgba(0, 0, 0, 0.02),
      0 2px 4px 0 rgba(0, 0, 0, 0.02)
    ` as const;

/** Design variable `Neutral/gray-12` (Light) — sidebar header, dark chrome bases. */
export const hydraNeutralGray12Light = '#141414';

/**
 * Figma **Colors** `Neutral/gray-3` — **Customize Theme** `Color/Neutral/Background/colorBgLayout` aliases this
 * (page / layout chrome at B1 level; not `colorBgContainer`).
 */
export const hydraNeutralGray3Light = '#F0F2F8';

/**
 * Figma **Customize Theme** `Color/Neutral/Text/colorIcon` (Light) → **Colors** `Opacity/opacity-100`.
 * `colorIconHover` aliases `colorIcon`, so icons stay opaque on hover too.
 */
export const hydraColorIconLight = '#000000';

/** Repo-only dark layout surface until the Dark pass (Figma Dark `colorBgLayout` → `primary-10`). */
export const hydraNeutralGray3Dark = '#1F1F1F';

/** Figma **Colors** `Opacity/opacity-65` ← **Customize Theme** `Color/Neutral/Background/colorBgMask`. */
export const hydraColorBgMaskLight = 'rgba(0, 0, 0, 0.65)';

/**
 * Figma **Colors** status ramps (steps 1–10). Steps 8/9–10 hold antd **dark** palette values,
 * exactly as in Figma (`Polar Green/green-8` is the only stock light step 8).
 */
export const polarGreenPrimitive = [
  '#F6FFED',
  '#D9F7BE',
  '#B7EB8F',
  '#95DE64',
  '#73D13D',
  '#52C41A',
  '#389E0D',
  '#237804',
  '#1D3712',
  '#162312',
] as const;

export const calendulaGoldPrimitive = [
  '#FFFBE6',
  '#FFF1B8',
  '#FFE58F',
  '#FFD666',
  '#FFC53D',
  '#FAAD14',
  '#D48806',
  '#594214',
  '#443111',
  '#2B2111',
] as const;

export const dustRedPrimitive = [
  '#FFF1F0',
  '#FFCCC7',
  '#FFA39E',
  '#FF7875',
  '#FF4D4F',
  '#F5222D',
  '#CF1322',
  '#58181C',
  '#431418',
  '#2A1215',
] as const;

const step = (ramp: readonly string[], n: number) => ramp[n - 1];

/** Light **Customize Theme** `Color/Success/*` → `Polar Green/green-*`. */
export const hydraSuccessSemanticsLight = {
  colorSuccessBg: step(polarGreenPrimitive, 1),
  colorSuccessBgHover: step(polarGreenPrimitive, 2),
  colorSuccessBorder: step(polarGreenPrimitive, 3),
  colorSuccessBorderHover: step(polarGreenPrimitive, 4),
  colorSuccessHover: step(polarGreenPrimitive, 6),
  colorSuccess: step(polarGreenPrimitive, 7),
  colorSuccessActive: step(polarGreenPrimitive, 8),
  colorSuccessTextHover: step(polarGreenPrimitive, 6),
  colorSuccessText: step(polarGreenPrimitive, 8),
  colorSuccessTextActive: step(polarGreenPrimitive, 9),
} as const;

/** Light **Customize Theme** `Color/Warning/*` → `Calendula Gold/gold-*`; outline → `colorWarningBg`. */
export const hydraWarningSemanticsLight = {
  colorWarningBg: step(calendulaGoldPrimitive, 1),
  colorWarningBgHover: step(calendulaGoldPrimitive, 2),
  colorWarningBorder: step(calendulaGoldPrimitive, 3),
  colorWarningBorderHover: step(calendulaGoldPrimitive, 4),
  colorWarningHover: step(calendulaGoldPrimitive, 5),
  colorWarning: step(calendulaGoldPrimitive, 6),
  colorWarningActive: step(calendulaGoldPrimitive, 7),
  colorWarningTextHover: step(calendulaGoldPrimitive, 5),
  colorWarningText: step(calendulaGoldPrimitive, 8),
  colorWarningTextActive: step(calendulaGoldPrimitive, 9),
  colorWarningOutline: step(calendulaGoldPrimitive, 1),
} as const;

/** Light **Customize Theme** `Color/Error/*` → `Dust Red/red-*`; outline → `colorErrorBg`, highlight → `colorError`. */
export const hydraErrorSemanticsLight = {
  colorErrorBg: step(dustRedPrimitive, 1),
  colorErrorBgHover: step(dustRedPrimitive, 2),
  colorErrorBorder: step(dustRedPrimitive, 3),
  colorErrorBorderHover: step(dustRedPrimitive, 4),
  colorErrorHover: step(dustRedPrimitive, 5),
  colorError: step(dustRedPrimitive, 6),
  colorErrorActive: step(dustRedPrimitive, 7),
  colorErrorTextHover: step(dustRedPrimitive, 4),
  colorErrorText: step(dustRedPrimitive, 7),
  colorErrorTextActive: step(dustRedPrimitive, 8),
  colorErrorOutline: step(dustRedPrimitive, 1),
  colorHighlight: step(dustRedPrimitive, 6),
} as const;

/**
 * Dark `Menu` on Hydra sidebar — neutral roles on `colorSidebar`.
 */
export const hydraMenuDarkChrome = {
  /** Figma `Color/Neutral/Text/colorTextLabel` on dark sidebar (`rgba(255,255,255,0.88)`). */
  itemText: 'rgba(255, 255, 255, 0.88)',
  itemHoverBg: 'rgba(255, 255, 255, 0.08)',
} as const;
