import type { HydraColorMode } from './hydraColorMode';

/**
 * Blue primitives `Primary/primary-1` … `primary-10` in Figma **Colors** (single `Value` mode).
 * `Primary/primary-0` is {@link bluePrimaryBgSubtleLight}.
 *
 * Steps 1–6 from `generate('#2576BB')` (RSFC brand Light Blue); steps 7–10 are the brand Navy end
 * (`#004173` … `#0A2238`) that `Color/Sidebar/*` and Dark surfaces resolve to.
 *
 * **Dark ramp below is repo-only:** Figma has no dark primitives — its **Customize Theme** `Dark` mode
 * re-aliases these same steps (see `Documentation/hydra-figma-parity-audit.md` D-01).
 *
 * Used by global primary / links / top bar (`Color/Primary/*`) and Sidebar.
 */
export const bluePrimaryPrimitiveLight = [
  '#EBF5FA',
  '#C7E1ED',
  '#99C6E0',
  '#6EABD4',
  '#4890C7',
  '#2576BB',
  '#004173',
  '#0C3559',
  '#0C2B47',
  '#0A2238',
] as const;

export const bluePrimaryPrimitiveDark = [
  '#131A22',
  '#152434',
  '#193146',
  '#1C405F',
  '#1F5481',
  '#2267A2',
  '#4384B5',
  '#6AA3CA',
  '#95C1DA',
  '#C3DDE9',
] as const;

/**
 * Ant Design Daybreak Blue `Daybreak Blue/blue-1` … `blue-10` in Figma **Colors**.
 * Repo: antd `colorInfo*` (Alert `type="info"`) ↔ Customize Theme `Color/Info/*`; also
 * `Color/Sidebar/colorSidebarItemSelectedBg` (`blue-2`).
 * Steps 8–10 hold the antd **dark** palette values (Figma uses them for dark Bg/Border and Light `TextActive`).
 */
export const daybreakBluePrimitiveLight = [
  '#E6F4FF',
  '#BAE0FF',
  '#91CAFF',
  '#69B1FF',
  '#4096FF',
  '#1677FF',
  '#0958D9',
  '#15325B',
  '#112545',
  '#111A2C',
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
 * `Primary/primary-0` ↔ `Color/Primary/colorPrimaryBgSubtle` — softer than `primary-1` (`colorPrimaryBg`)
 * for chips / mapped-column highlights; `colorPrimaryBorderSubtle` uses `primary-1`.
 */
export const bluePrimaryBgSubtleLight = '#F6FAFC' as const;
export const bluePrimaryBorderSubtleLight = bluePrimaryPrimitiveLight[0];

export const bluePrimaryBgSubtleDark = bluePrimaryPrimitiveDark[1];
export const bluePrimaryBorderSubtleDark = bluePrimaryPrimitiveDark[2];

/**
 * Fills lighten on hover (antd convention, step 5), but **text and links darken** (steps 7 → 8).
 * Lightening text hover put it below WCAG AA on white, so the brand Navy end of the ramp is used instead.
 */
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
    colorPrimaryTextHover: s(7),
    colorPrimaryText: s(6),
    colorPrimaryTextActive: s(8),
    colorLink: s(6),
    colorLinkHover: s(7),
    colorLinkActive: s(8),
  };
}

/**
 * Figma `Color/Info/*` → `Daybreak Blue/blue-*` (Alert `type="info"`).
 * Hover/text-hover use step 5. Light text / text-active are steps 7 / 8 (Figma);
 * the repo-only dark ramp keeps 6 / 7 until the Dark pass.
 */
function infoSemanticsFromRamp(
  ramp: readonly string[],
  textSteps: { text: number; textActive: number },
): {
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
    colorInfoText: s(textSteps.text),
    colorInfoTextActive: s(textSteps.textActive),
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
export const blueInfoSemantics = infoSemanticsFromRamp(daybreakBluePrimitiveLight, { text: 7, textActive: 8 });
export const blueInfoSemanticsDark = infoSemanticsFromRamp(daybreakBluePrimitiveDark, { text: 6, textActive: 7 });
