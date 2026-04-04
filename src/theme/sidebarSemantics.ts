import { figmaNeutralGray12Light } from './figmaSemanticColors';
import { bluePrimaryStep } from './primaryPrimitiveBlue';

/**
 * Sidebar/menu semantics ↔ **Colors** primitives (Figma `Color/Sidebar/*` → aliases).
 *
 * | Semantic | Figma primitive |
 * |----------|-----------------|
 * | `colorSidebar` | `Primary/primary-7` |
 * | `colorSidebarHeader` | `Neutral/gray-12` |
 * | `colorSidebarItemSelectedBg` | `Primary/primary-1` |
 * | `colorSidebarItemSelectedText` | `Primary/primary-8` |
 * | `colorSidebarSubmenuBg` | `Primary/primary-10` |
 *
 * Use **`sidebarSemanticsLight`** when matching Figma **Colors → Light** (`5:0`). When **Colors** is **Dark** (`5:4`), the same aliases resolve to dark `Primary/*` and inverted `Neutral/gray-*` — see Figma variables panel.
 */
export const NEUTRAL_GRAY_12_LIGHT = figmaNeutralGray12Light;

export const sidebarSemanticsLight = {
  colorSidebar: bluePrimaryStep(7),
  colorSidebarHeader: figmaNeutralGray12Light,
  colorSidebarItemSelectedBg: bluePrimaryStep(1),
  colorSidebarItemSelectedText: bluePrimaryStep(8),
  colorSidebarSubmenuBg: bluePrimaryStep(10),
} as const;

/** @deprecated Use `figmaMenuDarkChrome` from [`figmaSemanticColors`](./figmaSemanticColors.ts). */
export { figmaMenuDarkChrome as sidebarOnDarkChrome } from './figmaSemanticColors';
