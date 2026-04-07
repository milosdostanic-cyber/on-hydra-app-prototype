/**
 * Non-primary semantic colors mirrored from design variables.
 * Only this module (plus `primaryPrimitive*.ts`, `buttonPrimaryPalette.ts`) should hold literal color strings
 * for Hydra — UI and layout code consume tokens via `theme.useToken()` or `sidebarSemanticsLight`.
 */

/** Design variable `Neutral/gray-12` (Light) — sidebar header, dark chrome bases. */
export const hydraNeutralGray12Light = '#141414';

/**
 * Dark `Menu` on Hydra sidebar — neutral roles on `colorSidebar`.
 */
export const hydraMenuDarkChrome = {
  itemText: 'rgba(255, 255, 255, 0.65)',
  itemHoverBg: 'rgba(255, 255, 255, 0.08)',
} as const;
