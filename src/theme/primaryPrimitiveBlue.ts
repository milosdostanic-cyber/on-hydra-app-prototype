import type { HydraColorMode } from './hydraColorMode';

/**
 * Blue primitives `Primary/primary-1` … `primary-10` in Figma **Colors**.
 *
 * **Light** (`5:0`): mirrors **Figma Colors** `Primary/primary-*` (linked community file is source of truth).
 * **Dark** (`5:4`): from `@ant-design/colors` `generate('#0073A5', { theme: 'dark', backgroundColor: '#141414' })`
 * — same model as antd preset dark palettes (e.g. `blueDark`).
 */
export const bluePrimaryPrimitiveLight = [
  '#B8EAFF',
  '#8BCCD9',
  '#62B7CC',
  '#00B9F0',
  '#1D8BB3',
  '#0073A5',
  '#004173',
  '#00365F',
  '#002A4A',
  '#001D35',
] as const;

export const bluePrimaryPrimitiveDark = [
  '#111A1E',
  '#0F242F',
  '#0E3140',
  '#0B3F55',
  '#075272',
  '#03658F',
  '#1C7FA3',
  '#3B9AB6',
  '#60B2C6',
  '#89C8D5',
] as const;

/** @deprecated Use `bluePrimaryPrimitiveLight` (explicit) or `bluePrimaryPrimitiveFor(mode)`. */
export const bluePrimaryPrimitive = bluePrimaryPrimitiveLight;

export function bluePrimaryPrimitiveFor(mode: HydraColorMode): readonly string[] {
  return mode === 'light' ? bluePrimaryPrimitiveLight : bluePrimaryPrimitiveDark;
}

/** 1-based step → hex for the given mode. */
export function bluePrimaryStep(
  n: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
  mode: HydraColorMode = 'light',
): string {
  const ramp = bluePrimaryPrimitiveFor(mode);
  return ramp[n - 1];
}

function semanticsFromRamp(
  ramp: readonly string[],
): {
  colorPrimary: string;
  colorPrimaryHover: string;
  colorPrimaryActive: string;
  colorPrimaryBg: string;
  colorPrimaryBgHover: string;
  colorPrimaryBorder: string;
  colorPrimaryBorderHover: string;
  colorPrimaryText: string;
  colorPrimaryTextHover: string;
  colorPrimaryTextActive: string;
  colorLink: string;
  colorLinkHover: string;
  colorLinkActive: string;
} {
  const s = (i: number) => ramp[i - 1];
  return {
    colorPrimaryBg: s(1),
    colorPrimaryBgHover: s(2),
    colorPrimaryBorder: s(3),
    colorPrimaryBorderHover: s(4),
    colorPrimaryHover: s(5),
    colorPrimary: s(6),
    colorPrimaryActive: s(7),
    colorPrimaryTextHover: s(4),
    colorPrimaryText: s(6),
    colorPrimaryTextActive: s(7),
    colorLink: s(6),
    colorLinkHover: s(4),
    colorLinkActive: s(7),
  };
}

/** Semantic map for **light** — same as Figma `Color/Primary/*` → `Primary/primary-*` aliases. */
export const bluePrimarySemantics = semanticsFromRamp(bluePrimaryPrimitiveLight);

/** Semantic map for **dark** — same step indices, dark ramp. */
export const bluePrimarySemanticsDark = semanticsFromRamp(bluePrimaryPrimitiveDark);
