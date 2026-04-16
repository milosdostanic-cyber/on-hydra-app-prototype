import type { HydraColorMode } from './hydraColorMode';

/**
 * Hydra orange ramp in Figma **Colors** as **`Volcano/volcano-1` … `volcano-10`** only.
 * **Customize Theme** `Color/ButtonPrimary/*` aliases these primitives (not a separate ButtonOrange group).
 *
 * **Light**: hand-tuned (seed `#F05A23`).
 * **Dark**: `generate('#F05A23', { theme: 'dark', backgroundColor: '#141414' })` (@ant-design/colors).
 */
export const volcanoPrimitiveLight = [
  '#FFF6F0',
  '#FFDFC9',
  '#FFC3A1',
  '#FFA578',
  '#FC834E',
  '#F05A23',
  '#D64A1C',
  '#C93E14',
  '#9E3010',
  '#6B200B',
] as const;

export const volcanoPrimitiveDark = [
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

/** @deprecated Use `volcanoPrimitiveLight`. */
export const volcanoPrimitiveHydra = volcanoPrimitiveLight;

/** @deprecated Use `volcanoPrimitiveDark`. */
export const volcanoPrimitiveHydraDark = volcanoPrimitiveDark;

export function volcanoPrimitiveFor(mode: HydraColorMode): readonly string[] {
  return mode === 'light' ? volcanoPrimitiveLight : volcanoPrimitiveDark;
}

/** 1-based step → hex (`Volcano/volcano-${n}` in Figma). */
export function volcanoStep(
  n: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
  mode: HydraColorMode = 'light',
): string {
  return volcanoPrimitiveFor(mode)[n - 1];
}
