/**
 * Typography mirrored from **Figma** file *Ant Design – DS* local text styles only (`Title/*`, `Base/*`,
 * `Small/*`, `Large/*`, `Extra Large/*`). No ad-hoc sizes outside this module.
 *
 * @see Documentation/hydra-typography.md
 */

import type { CSSProperties } from 'react';

/** Figma `Cairo` Regular → CSS weight */
const W_REG = 400;
/** Figma `Cairo` SemiBold → CSS weight */
const W_SEMI = 600;

export type FigmaTextStyle = Readonly<{
  /** Figma style path, e.g. `Title/Heading 4` */
  figmaPath: string;
  fontSize: number;
  /** Line height in px (Figma). */
  lineHeight: number;
  fontWeight: number;
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
}>;

/** Figma font family name (matches loaded face in `index.html`). */
export const figmaFontFamilyName = 'Cairo' as const;

export const figmaFontFamilyFallback = 'sans-serif' as const;

/** CSS `font-family` stack for `theme.token.fontFamily` and `--hydra-font-family`. */
export const brandFontFamily = `'${figmaFontFamilyName}', ${figmaFontFamilyFallback}`;

function unitlessLineHeight(lineHeightPx: number, fontSize: number): number {
  return lineHeightPx / fontSize;
}

// --- Title (Figma `Title/*`) ---

export const figmaTitleHeading1 = {
  figmaPath: 'Title/Heading 1',
  fontSize: 38,
  lineHeight: 46,
  fontWeight: W_SEMI,
} as const satisfies FigmaTextStyle;

export const figmaTitleHeading2 = {
  figmaPath: 'Title/Heading 2',
  fontSize: 30,
  lineHeight: 38,
  fontWeight: W_SEMI,
} as const satisfies FigmaTextStyle;

export const figmaTitleHeading3 = {
  figmaPath: 'Title/Heading 3',
  fontSize: 24,
  lineHeight: 32,
  fontWeight: W_SEMI,
} as const satisfies FigmaTextStyle;

export const figmaTitleHeading4 = {
  figmaPath: 'Title/Heading 4',
  fontSize: 20,
  lineHeight: 28,
  fontWeight: W_SEMI,
} as const satisfies FigmaTextStyle;

export const figmaTitleHeading5 = {
  figmaPath: 'Title/Heading 5',
  fontSize: 16,
  lineHeight: 24,
  fontWeight: W_SEMI,
} as const satisfies FigmaTextStyle;

// --- Base (Figma `Base/*`, 14 / 22) ---

export const figmaBaseNormal = {
  figmaPath: 'Base/Normal',
  fontSize: 14,
  lineHeight: 22,
  fontWeight: W_REG,
} as const satisfies FigmaTextStyle;

export const figmaBaseStrong = {
  figmaPath: 'Base/Strong',
  fontSize: 14,
  lineHeight: 22,
  fontWeight: W_SEMI,
} as const satisfies FigmaTextStyle;

export const figmaBaseUnderline = {
  figmaPath: 'Base/Underline',
  fontSize: 14,
  lineHeight: 22,
  fontWeight: W_REG,
  textDecoration: 'underline',
} as const satisfies FigmaTextStyle;

export const figmaBaseDelete = {
  figmaPath: 'Base/Delete',
  fontSize: 14,
  lineHeight: 22,
  fontWeight: W_REG,
  textDecoration: 'line-through',
} as const satisfies FigmaTextStyle;

export const figmaBaseItalic = {
  figmaPath: 'Base/Italic',
  fontSize: 14,
  lineHeight: 22,
  fontWeight: W_REG,
  fontStyle: 'italic',
} as const satisfies FigmaTextStyle;

// --- Small (Figma `Small/*`, 12 / 20) ---

export const figmaSmallNormal = {
  figmaPath: 'Small/Normal',
  fontSize: 12,
  lineHeight: 20,
  fontWeight: W_REG,
} as const satisfies FigmaTextStyle;

export const figmaSmallStrong = {
  figmaPath: 'Small/Strong',
  fontSize: 12,
  lineHeight: 20,
  fontWeight: W_SEMI,
} as const satisfies FigmaTextStyle;

export const figmaSmallUnderline = {
  figmaPath: 'Small/Underline',
  fontSize: 12,
  lineHeight: 20,
  fontWeight: W_REG,
  textDecoration: 'underline',
} as const satisfies FigmaTextStyle;

export const figmaSmallDelete = {
  figmaPath: 'Small/Delete',
  fontSize: 12,
  lineHeight: 20,
  fontWeight: W_REG,
  textDecoration: 'line-through',
} as const satisfies FigmaTextStyle;

export const figmaSmallItalic = {
  figmaPath: 'Small/Italic',
  fontSize: 12,
  lineHeight: 20,
  fontWeight: W_REG,
  fontStyle: 'italic',
} as const satisfies FigmaTextStyle;

// --- Large (Figma `Large/*`, 16 / 24) ---

export const figmaLargeNormal = {
  figmaPath: 'Large/Normal',
  fontSize: 16,
  lineHeight: 24,
  fontWeight: W_REG,
} as const satisfies FigmaTextStyle;

export const figmaLargeStrong = {
  figmaPath: 'Large/Strong',
  fontSize: 16,
  lineHeight: 24,
  fontWeight: W_SEMI,
} as const satisfies FigmaTextStyle;

export const figmaLargeUnderline = {
  figmaPath: 'Large/Underline',
  fontSize: 16,
  lineHeight: 24,
  fontWeight: W_REG,
  textDecoration: 'underline',
} as const satisfies FigmaTextStyle;

export const figmaLargeDelete = {
  figmaPath: 'Large/Delete',
  fontSize: 16,
  lineHeight: 24,
  fontWeight: W_REG,
  textDecoration: 'line-through',
} as const satisfies FigmaTextStyle;

export const figmaLargeItalic = {
  figmaPath: 'Large/Italic',
  fontSize: 16,
  lineHeight: 24,
  fontWeight: W_REG,
  fontStyle: 'italic',
} as const satisfies FigmaTextStyle;

// --- Extra Large (Figma `Extra Large/*`, 20 / 28) ---

export const figmaExtraLargeNormal = {
  figmaPath: 'Extra Large/Normal',
  fontSize: 20,
  lineHeight: 28,
  fontWeight: W_REG,
} as const satisfies FigmaTextStyle;

export const figmaExtraLargeStrong = {
  figmaPath: 'Extra Large/Strong',
  fontSize: 20,
  lineHeight: 28,
  fontWeight: W_SEMI,
} as const satisfies FigmaTextStyle;

export const figmaExtraLargeUnderline = {
  figmaPath: 'Extra Large/Underline',
  fontSize: 20,
  lineHeight: 28,
  fontWeight: W_REG,
  textDecoration: 'underline',
} as const satisfies FigmaTextStyle;

export const figmaExtraLargeDelete = {
  figmaPath: 'Extra Large/Delete',
  fontSize: 20,
  lineHeight: 28,
  fontWeight: W_REG,
  textDecoration: 'line-through',
} as const satisfies FigmaTextStyle;

export const figmaExtraLargeItalic = {
  figmaPath: 'Extra Large/Italic',
  fontSize: 20,
  lineHeight: 28,
  fontWeight: W_REG,
  fontStyle: 'italic',
} as const satisfies FigmaTextStyle;

/** @deprecated Use `figmaBaseNormal` — same object; kept for existing imports. */
export const figmaTextBaseNormal = figmaBaseNormal;

/**
 * Maps Figma text styles to Ant Design **map** font tokens so `Typography.Title level={n}` and
 * `token.fontSizeSM` / `fontSizeLG` / `fontSizeXL` match the kit.
 *
 * Also sets **`fontHeight` / `fontHeightSM` / `fontHeightLG`** (px) so controls that size padding from
 * text metrics (Input, Select, Tabs, …) stay aligned after overrides — see `genFontMapToken` in antd.
 */
export const hydraAntdFontMapFromFigma = {
  fontSize: figmaBaseNormal.fontSize,
  lineHeight: unitlessLineHeight(figmaBaseNormal.lineHeight, figmaBaseNormal.fontSize),
  fontSizeSM: figmaSmallNormal.fontSize,
  lineHeightSM: unitlessLineHeight(figmaSmallNormal.lineHeight, figmaSmallNormal.fontSize),
  fontSizeLG: figmaLargeNormal.fontSize,
  lineHeightLG: unitlessLineHeight(figmaLargeNormal.lineHeight, figmaLargeNormal.fontSize),
  fontSizeXL: figmaExtraLargeNormal.fontSize,
  fontSizeHeading1: figmaTitleHeading1.fontSize,
  lineHeightHeading1: unitlessLineHeight(figmaTitleHeading1.lineHeight, figmaTitleHeading1.fontSize),
  fontSizeHeading2: figmaTitleHeading2.fontSize,
  lineHeightHeading2: unitlessLineHeight(figmaTitleHeading2.lineHeight, figmaTitleHeading2.fontSize),
  fontSizeHeading3: figmaTitleHeading3.fontSize,
  lineHeightHeading3: unitlessLineHeight(figmaTitleHeading3.lineHeight, figmaTitleHeading3.fontSize),
  fontSizeHeading4: figmaTitleHeading4.fontSize,
  lineHeightHeading4: unitlessLineHeight(figmaTitleHeading4.lineHeight, figmaTitleHeading4.fontSize),
  fontSizeHeading5: figmaTitleHeading5.fontSize,
  lineHeightHeading5: unitlessLineHeight(figmaTitleHeading5.lineHeight, figmaTitleHeading5.fontSize),
  /** Figma `Base/Normal` line height (px) — antd internal control metrics */
  fontHeight: figmaBaseNormal.lineHeight,
  /** Figma `Small/Normal` line height (px) */
  fontHeightSM: figmaSmallNormal.lineHeight,
  /** Figma `Large/Normal` line height (px) */
  fontHeightLG: figmaLargeNormal.lineHeight,
  /** Figma `Base/Strong` — matches `Typography.Title` weight and `<Text strong>` */
  fontWeightStrong: figmaBaseStrong.fontWeight,
} as const;

/** Inline CSS from a Figma text style (px line-height, optional decoration / italic). */
export function figmaTextStyleToReactCss(
  style: FigmaTextStyle,
): Pick<CSSProperties, 'fontSize' | 'lineHeight' | 'fontWeight' | 'fontStyle' | 'textDecoration'> {
  const css: Pick<
    CSSProperties,
    'fontSize' | 'lineHeight' | 'fontWeight' | 'fontStyle' | 'textDecoration'
  > = {
    fontSize: style.fontSize,
    lineHeight: `${style.lineHeight}px`,
    fontWeight: style.fontWeight,
  };
  if (style.fontStyle) {
    css.fontStyle = style.fontStyle;
  }
  if (style.textDecoration && style.textDecoration !== 'none') {
    css.textDecoration = style.textDecoration;
  }
  return css;
}
