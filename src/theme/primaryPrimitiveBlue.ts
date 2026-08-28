import type { HydraColorMode } from './hydraColorMode';

/**
 * Blue primitives `Primary/primary-1` … `primary-10` in Figma **Colors**.
 *
 * **Light** (`5:0`): mirrors **Figma Colors** `Primary/primary-*` (linked community file is source of truth).
 * **Dark** (`5:4`): from `@ant-design/colors` `generate('#0073A5', { theme: 'dark', backgroundColor: '#141414' })`
 * — same model as antd preset dark palettes (e.g. `blueDark`).
 *
 * Used by global primary / links / top bar (`Color/Primary/*`) and Sidebar.
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

/**
 * Ant Design Daybreak Blue `Daybreak Blue/blue-1` … `blue-10` in Figma **Colors**.
 * Repo: antd `colorInfo*` (Alert `type="info"`). Figma Customize Theme `Color/Info/*` stays on `Primary/primary-*`;
 * info Alert variants bind directly to these Daybreak primitives.
 */
export const daybreakBluePrimitiveLight = [
  '#E6F4FF',
  '#BAE0FF',
  '#91CAFF',
  '#69B1FF',
  '#4096FF',
  '#1677FF',
  '#0958D9',
  '#003EB3',
  '#002C8C',
  '#001D66',
] as const;

export const daybreakBluePrimitiveDark = [
  '#111A2C',
  '#112545',
  '#15325B',
  '#15417E',
  '#1554AD',
  '#1668DC',
  '#3C89E8',
  '#65A9F3',
  '#8DC5F8',
  '#B7DCFA',
] as const;

/** @deprecated Use `bluePrimaryPrimitiveLight` (explicit) or `bluePrimaryPrimitiveFor(mode)`. */
export const bluePrimaryPrimitive = bluePrimaryPrimitiveLight;

export function bluePrimaryPrimitiveFor(mode: HydraColorMode): readonly string[] {
  return mode === 'light' ? bluePrimaryPrimitiveLight : bluePrimaryPrimitiveDark;
}

export function daybreakBluePrimitiveFor(mode: HydraColorMode): readonly string[] {
  return mode === 'light' ? daybreakBluePrimitiveLight : daybreakBluePrimitiveDark;
}

/** 1-based step → hex for Hydra `Primary/primary-*`. */
export function bluePrimaryStep(
  n: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
  mode: HydraColorMode = 'light',
): string {
  const ramp = bluePrimaryPrimitiveFor(mode);
  return ramp[n - 1];
}

/** 1-based step → hex for `Daybreak Blue/blue-*` (Info / Alert only). */
export function daybreakBlueStep(
  n: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
  mode: HydraColorMode = 'light',
): string {
  const ramp = daybreakBluePrimitiveFor(mode);
  return ramp[n - 1];
}

/**
 * Softer primary fill for chips / mapped-column highlights — lighter than `primary-1` (`colorPrimaryBg`).
 * Light: ~6% `primary-6` on white; border uses `primary-1`.
 */
export const bluePrimaryBgSubtleLight = '#E6F4F8' as const;
export const bluePrimaryBorderSubtleLight = bluePrimaryPrimitiveLight[0];

export const bluePrimaryBgSubtleDark = bluePrimaryPrimitiveDark[1];
export const bluePrimaryBorderSubtleDark = bluePrimaryPrimitiveDark[2];

function semanticsFromRamp(
  ramp: readonly string[],
  bgSubtle: string,
  borderSubtle: string,
): {
  colorPrimary: string;
  colorPrimaryHover: string;
  colorPrimaryActive: string;
  colorPrimaryBg: string;
  colorPrimaryBgHover: string;
  colorPrimaryBgSubtle: string;
  colorPrimaryBorder: string;
  colorPrimaryBorderHover: string;
  colorPrimaryBorderSubtle: string;
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
    colorPrimaryBgSubtle: bgSubtle,
    colorPrimaryBorder: s(3),
    colorPrimaryBorderSubtle: borderSubtle,
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

/**
 * Figma `Color/Info/*` → `Daybreak Blue/blue-*` (Alert `type="info"`).
 * Hover/text-hover use step 5 (Figma Info mapping).
 */
function infoSemanticsFromRamp(ramp: readonly string[]): {
  colorInfo: string;
  colorInfoBg: string;
  colorInfoBgHover: string;
  colorInfoBorder: string;
  colorInfoBorderHover: string;
  colorInfoHover: string;
  colorInfoActive: string;
  colorInfoText: string;
  colorInfoTextHover: string;
  colorInfoTextActive: string;
} {
  const s = (i: number) => ramp[i - 1];
  return {
    colorInfoBg: s(1),
    colorInfoBgHover: s(2),
    colorInfoBorder: s(3),
    colorInfoBorderHover: s(4),
    colorInfoHover: s(5),
    colorInfo: s(6),
    colorInfoActive: s(7),
    colorInfoTextHover: s(5),
    colorInfoText: s(6),
    colorInfoTextActive: s(7),
  };
}

/** Semantic map for **light** — Figma `Color/Primary/*` → `Primary/primary-*`. */
export const bluePrimarySemantics = semanticsFromRamp(
  bluePrimaryPrimitiveLight,
  bluePrimaryBgSubtleLight,
  bluePrimaryBorderSubtleLight,
);

/** Semantic map for **dark** — same step indices, dark ramp. */
export const bluePrimarySemanticsDark = semanticsFromRamp(
  bluePrimaryPrimitiveDark,
  bluePrimaryBgSubtleDark,
  bluePrimaryBorderSubtleDark,
);

/** Info / Alert only — Figma `Color/Info/*` → `Daybreak Blue/blue-*`. */
export const blueInfoSemantics = infoSemanticsFromRamp(daybreakBluePrimitiveLight);
export const blueInfoSemanticsDark = infoSemanticsFromRamp(daybreakBluePrimitiveDark);
