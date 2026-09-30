/**
 * Menu / submenu layout aligned with design kit menu metrics and Hydra tokens.
 * Horizontal inset for labels uses antd `token.padding` (wired in `antdTheme` from `hydraLightAlias.padding`).
 * Sidebar frame metrics ↔ Figma `Sidebar` (`662:10029`) / nested `Logo Placeholder`, `Menu`, `BT Collapse/Expand`.
 */

/** Figma `Logo Placeholder` frame height — shell header row matches this for alignment. */
export const hydraSidebarBrandBandHeightPx = 62;

/** Figma `RSFC_logo` (740:78253) outer box on `Logo Placeholder`. */
export const hydraSidebarRsfcLogoWidthPx = 120;
export const hydraSidebarRsfcLogoHeightPx = 29;

/** Cube mark leaf inside `RSFC_logo`. */
export const hydraSidebarRsfcLogoMark = {
  width: 27.840415954589844,
  height: 27.96429443359375,
  left: 0,
  top: 0,
} as const;

/** Wordmark leaf inside `RSFC_logo`. */
export const hydraSidebarRsfcLogoWordmark = {
  width: 89.24786376953125,
  height: 22.68994903564453,
  left: 30.196584701538086,
  top: 2.735849142074585,
} as const;

/** Figma `BT Collapse/Expand` — offset from top of sidebar (`Sidebar` root). */
export const hydraSidebarCollapseTriggerTopPx = 51;

/** Square menu / submenu rows (no rounded item plates). */
export const hydraMenuItemBorderRadius = 0;

/** No outer gutter between stacked items — flush to sider edge. */
export const hydraMenuItemMarginInline = 0;

/** `itemMarginBlock` × 2 = Figma `Menu` column `gap` (8px). */
export const hydraMenuItemMarginBlock = 4;
