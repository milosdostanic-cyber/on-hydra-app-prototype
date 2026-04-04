/**
 * Non-primary semantic colors mirrored from **Figma** **Colors** / **Customize Theme**.
 * Only this module (plus `primaryPrimitive*.ts`, `buttonPrimaryPalette.ts`) should hold literal color strings
 * for Hydra — UI and layout code consume tokens via `theme.useToken()` or `sidebarSemanticsLight`.
 *
 * @see Documentation/hydra-primary-figma-mapping.md, hydra-sidebar-figma-mapping.md
 */

/** Figma **Colors** → `Neutral/gray-12` (Light `5:0`) — sidebar header, dark chrome bases. */
export const figmaNeutralGray12Light = '#141414';

/**
 * Dark `Menu` on Hydra sidebar — neutral roles on `colorSidebar` (Figma **Customize Theme** neutrals on dark).
 * Sync with kit variables when names/values change.
 */
export const figmaMenuDarkChrome = {
  itemText: 'rgba(255, 255, 255, 0.65)',
  itemHoverBg: 'rgba(255, 255, 255, 0.08)',
} as const;
