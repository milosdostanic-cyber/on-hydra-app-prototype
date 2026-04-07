import { volcanoStep } from './primaryPrimitiveOrange';

/**
 * Orange primary for **Button type=primary only** — uses **`Volcano/volcano-*`** steps.
 * Figma: **Customize Theme** `Color/ButtonPrimary/*` → aliases **`Volcano/volcano-*`**.
 */
export const buttonPrimaryPalette = {
  rest: volcanoStep(6),
  hover: volcanoStep(5),
  active: volcanoStep(8),
  bg: volcanoStep(1),
  bgHover: volcanoStep(2),
  border: volcanoStep(3),
  borderHover: volcanoStep(4),
  text: volcanoStep(6),
  textHover: volcanoStep(5),
  textActive: volcanoStep(8),
} as const;

export const buttonPrimaryPaletteDark = {
  rest: volcanoStep(6, 'dark'),
  hover: volcanoStep(5, 'dark'),
  active: volcanoStep(8, 'dark'),
  bg: volcanoStep(1, 'dark'),
  bgHover: volcanoStep(2, 'dark'),
  border: volcanoStep(3, 'dark'),
  borderHover: volcanoStep(4, 'dark'),
  text: volcanoStep(6, 'dark'),
  textHover: volcanoStep(5, 'dark'),
  textActive: volcanoStep(8, 'dark'),
} as const;

/** Ant Design Button component token parity (`components.Button.primaryShadow`). */
export const buttonPrimaryShadow = '0 2px 0 rgba(240, 90, 35, 0.10)' as const;

/** Dark mode shadow tuned to dark primary step (`volcano-6` dark). */
export const buttonPrimaryShadowDark = '0 2px 0 rgba(207, 80, 33, 0.16)' as const;

/** Solid primary Button focus outline (`components.Button.controlOutline`) — document in Figma parity audit if not yet a variable. */
export const buttonPrimaryControlOutline = 'rgba(240, 90, 35, 0.12)' as const;
