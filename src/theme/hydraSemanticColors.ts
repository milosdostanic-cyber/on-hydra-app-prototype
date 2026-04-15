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

/** Figma **Colors** `Neutral/gray-3` (Dark mode `5:4`). */
export const hydraNeutralGray3Dark = '#1F1F1F';

/**
 * Dark `Menu` on Hydra sidebar — neutral roles on `colorSidebar`.
 */
export const hydraMenuDarkChrome = {
  /** Figma `Color/Neutral/Text/colorTextLabel` on dark sidebar (`rgba(255,255,255,0.88)`). */
  itemText: 'rgba(255, 255, 255, 0.88)',
  itemHoverBg: 'rgba(255, 255, 255, 0.08)',
} as const;
