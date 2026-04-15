/**
 * Menu / submenu layout aligned with design kit menu metrics and Hydra tokens.
 * Horizontal inset for labels uses antd `token.padding` (wired in `antdTheme` from `hydraLightAlias.padding`).
 * Sidebar frame metrics ↔ Figma `Sidebar` (`662:10029`) / nested `Logo Placeholder`, `Menu`, `BT Collapse/Expand`.
 */

/** Figma `Logo Placeholder` frame height — shell header row matches this for alignment. */
export const hydraSidebarBrandBandHeightPx = 62;

/** Figma `BT Collapse/Expand` — offset from top of sidebar (`Sidebar` root). */
export const hydraSidebarCollapseTriggerTopPx = 51;

/** Square menu / submenu rows (no rounded item plates). */
export const hydraMenuItemBorderRadius = 0;

/** No outer gutter between stacked items — flush to sider edge. */
export const hydraMenuItemMarginInline = 0;

/** `itemMarginBlock` × 2 = Figma `Menu` column `gap` (8px). */
export const hydraMenuItemMarginBlock = 4;
