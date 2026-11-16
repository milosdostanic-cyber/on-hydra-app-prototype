import { hydraActionOrangeStep } from './primaryPrimitiveOrange';

/**
 * Orange primary for **Button type=primary only** — uses **`Hydra Action Orange/hydra-*`** steps.
 * Figma: **Customize Theme** `Color/Action/*` → aliases **`Hydra Action Orange/hydra-*`**.
 */
export const buttonPrimaryPalette = {
  rest: hydraActionOrangeStep(6),
  hover: hydraActionOrangeStep(5),
  active: hydraActionOrangeStep(8),
  bg: hydraActionOrangeStep(1),
  bgHover: hydraActionOrangeStep(2),
  border: hydraActionOrangeStep(3),
  borderHover: hydraActionOrangeStep(4),
  text: hydraActionOrangeStep(8),
  textHover: hydraActionOrangeStep(5),
  textActive: hydraActionOrangeStep(9),
} as const;

/** Repo-only dark ramp until the Dark pass (Figma `Color/Action/*` Dark re-aliases the single ramp). */
export const buttonPrimaryPaletteDark = {
  rest: hydraActionOrangeStep(6, 'dark'),
  hover: hydraActionOrangeStep(5, 'dark'),
  active: hydraActionOrangeStep(8, 'dark'),
  bg: hydraActionOrangeStep(1, 'dark'),
  bgHover: hydraActionOrangeStep(2, 'dark'),
  border: hydraActionOrangeStep(3, 'dark'),
  borderHover: hydraActionOrangeStep(4, 'dark'),
  text: hydraActionOrangeStep(6, 'dark'),
  textHover: hydraActionOrangeStep(5, 'dark'),
  textActive: hydraActionOrangeStep(8, 'dark'),
} as const;

/** `components.Button.primaryShadow` ↔ `Color/Action/colorActionShadowColor` (`hydra-6` @ 10%). */
export const buttonPrimaryShadow = '0 2px 0 rgba(240, 90, 35, 0.10)' as const;

/** Dark mode shadow tuned to dark primary step (`volcano-6` dark). */
export const buttonPrimaryShadowDark = '0 2px 0 rgba(207, 80, 33, 0.16)' as const;

/**
 * Solid primary Button focus outline (`components.Button.controlOutline`) — **code-only gap**: Figma has no
 * `Color/Action` outline variable (global `Color/Control/controlOutline` is blue `primary-3`).
 */
export const buttonPrimaryControlOutline = 'rgba(240, 90, 35, 0.12)' as const;
