import type { HydraColorMode } from './hydraColorMode';

/**
 * Hydra orange ramp in Figma **Colors** as **`Hydra Action Orange/hydra-1` … `hydra-10`** (seed `#F05A23`).
 * **Customize Theme** `Color/Action/*` aliases these primitives (solid primary Button).
 * Steps 9–10 hold the antd **dark** palette values (Figma uses them for dark Bg/Border and Light `TextActive`).
 *
 * Figma `Volcano/volcano-*` is the **stock** antd Volcano ramp (`#FA541C`) — not this one.
 */
export const hydraActionOrangePrimitive = [
  '#FFF6F0',
  '#FFDFC9',
  '#FFC3A1',
  '#FFA578',
  '#FC834E',
  '#F05A23',
  '#D64A1C',
  '#C93E14',
  '#411F14',
  '#291712',
] as const;

/**
 * **Repo-only** dark ramp: `generate('#F05A23', { theme: 'dark', backgroundColor: '#141414' })`.
 * Figma has no dark primitives (see `Documentation/hydra-figma-parity-audit.md` D-01).
 */
export const hydraActionOrangePrimitiveDark = [
  '#291712',
  '#411F14',
  '#562919',
  '#77341B',
  '#A3421E',
  '#CF5021',
  '#E57848',
  '#F39E73',
  '#F8BE9D',
  '#FADBC5',
] as const;

export function hydraActionOrangePrimitiveFor(mode: HydraColorMode): readonly string[] {
  return mode === 'light' ? hydraActionOrangePrimitive : hydraActionOrangePrimitiveDark;
}

/** 1-based step → hex (`Hydra Action Orange/hydra-${n}` in Figma). */
export function hydraActionOrangeStep(
  n: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
  mode: HydraColorMode = 'light',
): string {
  return hydraActionOrangePrimitiveFor(mode)[n - 1];
}

/** @deprecated Use `hydraActionOrangePrimitive` — Figma `Volcano/*` is now the stock antd ramp. */
export const volcanoPrimitiveLight = hydraActionOrangePrimitive;

/** @deprecated Use `hydraActionOrangePrimitiveDark`. */
export const volcanoPrimitiveDark = hydraActionOrangePrimitiveDark;

/** @deprecated Use `hydraActionOrangePrimitive`. */
export const volcanoPrimitiveHydra = hydraActionOrangePrimitive;

/** @deprecated Use `hydraActionOrangePrimitiveDark`. */
export const volcanoPrimitiveHydraDark = hydraActionOrangePrimitiveDark;

/** @deprecated Use `hydraActionOrangePrimitiveFor`. */
export const volcanoPrimitiveFor = hydraActionOrangePrimitiveFor;

/** @deprecated Use `hydraActionOrangeStep`. */
export const volcanoStep = hydraActionOrangeStep;
