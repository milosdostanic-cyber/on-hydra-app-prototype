import type { HydraColorMode } from './hydraColorMode';
import { hydraNeutralGray12Light } from './hydraSemanticColors';
import { bluePrimaryStep, daybreakBlueStep } from './primaryPrimitiveBlue';

/**
 * Sidebar/menu semantics ↔ **Colors** primitives (Figma `Color/Sidebar/*` → aliases, **Light** mode).
 *
 * | Semantic | Figma primitive |
 * |----------|-----------------|
 * | `colorSidebar` | `Primary/primary-7` |
 * | `colorSidebarHeader` | `Neutral/gray-12` |
 * | `colorSidebarItemSelectedBg` | `Daybreak Blue/blue-2` |
 * | `colorSidebarItemSelectedText` | `Primary/primary-8` |
 * | `colorSidebarSubmenuBg` | `Primary/primary-10` |
 * | `colorSidebarMenuItemText` / `colorSidebarMenuItemHoverBg` | `hydraMenuDarkChrome` |
 *
 * Dark below is repo-only until the Dark pass (Figma Dark: selected bg `primary-8`, selected text `gray-1`).
 */
export const NEUTRAL_GRAY_12_LIGHT = hydraNeutralGray12Light;

export const sidebarSemanticsLight = {
  colorSidebar: bluePrimaryStep(7),
  colorSidebarHeader: hydraNeutralGray12Light,
  colorSidebarItemSelectedBg: daybreakBlueStep(2),
  colorSidebarItemSelectedText: bluePrimaryStep(8),
  colorSidebarSubmenuBg: bluePrimaryStep(10),
} as const;

/** Sidebar/menu surfaces for global **light** vs **dark** app chrome (primitive ramps from Figma `5:0` / `5:4`). */
export function sidebarSemanticsFor(mode: HydraColorMode) {
  if (mode === 'light') return sidebarSemanticsLight;
  return {
    colorSidebar: bluePrimaryStep(7, 'dark'),
    colorSidebarHeader: bluePrimaryStep(1, 'dark'),
    colorSidebarItemSelectedBg: bluePrimaryStep(4, 'dark'),
    colorSidebarItemSelectedText: bluePrimaryStep(9, 'dark'),
    colorSidebarSubmenuBg: bluePrimaryStep(8, 'dark'),
  } as const;
}

/** @deprecated Use `hydraMenuDarkChrome` from [`hydraSemanticColors`](./hydraSemanticColors.ts). */
export { hydraMenuDarkChrome as sidebarOnDarkChrome } from './hydraSemanticColors';
