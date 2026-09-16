/**
 * Typography mirrored from design local text styles (`Title/*`, `Base/*`,
 * `Small/*`, `Large/*`, `Extra Large/*`). No ad-hoc sizes outside this module.
 */

import type { CSSProperties } from 'react';

const W_REG = 400;
const W_SEMI = 600;
/** Figma `Typography/Font Weight/fontWeightHeading` = 800 — Barlow Condensed ExtraBold. */
const W_HEADING = 800;

export type HydraTextStyle = Readonly<{
  /** Design style path, e.g. `Title/Heading 4` */
  designPath: string;
  fontSize: number;
  lineHeight: number;
  fontWeight: number;
  /** When set, overrides the global body family (e.g. Barlow Condensed for headings). */
  fontFamily?: string;
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
}>;

/** Figma `Typography/Font Family/fontFamily` — body / base text. */
export const hydraFontFamilyName = 'Barlow' as const;
/** Figma `Typography/Font Family/fontFamilyHeading` — all Title/Heading styles. */
export const hydraFontFamilyHeadingName = 'Barlow Condensed' as const;
/** Figma `Typography/Font Family/fontFamilyCode` — monospace / code text. */
export const hydraFontFamilyCodeName = 'Courier Prime' as const;

export const hydraFontFamilyFallback = 'sans-serif' as const;
export const brandFontFamily = `'${hydraFontFamilyName}', ${hydraFontFamilyFallback}`;
export const brandHeadingFontFamily = `'${hydraFontFamilyHeadingName}', ${hydraFontFamilyFallback}`;
export const brandCodeFontFamily = `'${hydraFontFamilyCodeName}', monospace`;

/** Figma `Typography/Font Weight/fontWeightHeading` (800) — H1-H2 only. Exported for CSS-var and antd wiring. */
export const hydraBrandFontWeightHeading = W_HEADING;
/** Figma `Typography/Font Weight/fontWeightStrong` (600) — H3-H5 (Barlow Condensed SemiBold). Same token antd uses for `fontWeightStrong`. */
export const hydraBrandFontWeightStrong = W_SEMI;

function unitlessLineHeight(lineHeightPx: number, fontSize: number): number {
  return lineHeightPx / fontSize;
}

export const hydraTitleHeading1 = {
  designPath: 'Title/Heading 1',
  fontSize: 38,
  lineHeight: 46,
  fontWeight: W_HEADING,
  fontFamily: hydraFontFamilyHeadingName,
} as const satisfies HydraTextStyle;

export const hydraTitleHeading2 = {
  designPath: 'Title/Heading 2',
  fontSize: 30,
  lineHeight: 38,
  fontWeight: W_HEADING,
  fontFamily: hydraFontFamilyHeadingName,
} as const satisfies HydraTextStyle;

/** Figma: rebound to `fontWeightStrong` (600/SemiBold) — H3-H5 use the shared 600 weight token, H1-H2 stay ExtraBold. */
export const hydraTitleHeading3 = {
  designPath: 'Title/Heading 3',
  fontSize: 24,
  lineHeight: 32,
  fontWeight: W_SEMI,
  fontFamily: hydraFontFamilyHeadingName,
} as const satisfies HydraTextStyle;

export const hydraTitleHeading4 = {
  designPath: 'Title/Heading 4',
  fontSize: 20,
  lineHeight: 28,
  fontWeight: W_SEMI,
  fontFamily: hydraFontFamilyHeadingName,
} as const satisfies HydraTextStyle;

export const hydraTitleHeading5 = {
  designPath: 'Title/Heading 5',
  fontSize: 16,
  lineHeight: 24,
  fontWeight: W_SEMI,
  fontFamily: hydraFontFamilyHeadingName,
} as const satisfies HydraTextStyle;

export const hydraBaseNormal = {
  designPath: 'Base/Normal',
  fontSize: 14,
  lineHeight: 22,
  fontWeight: W_REG,
} as const satisfies HydraTextStyle;

export const hydraBaseStrong = {
  designPath: 'Base/Strong',
  fontSize: 14,
  lineHeight: 22,
  fontWeight: W_SEMI,
} as const satisfies HydraTextStyle;

export const hydraBaseUnderline = {
  designPath: 'Base/Underline',
  fontSize: 14,
  lineHeight: 22,
  fontWeight: W_REG,
  textDecoration: 'underline',
} as const satisfies HydraTextStyle;

export const hydraBaseDelete = {
  designPath: 'Base/Delete',
  fontSize: 14,
  lineHeight: 22,
  fontWeight: W_REG,
  textDecoration: 'line-through',
} as const satisfies HydraTextStyle;

export const hydraBaseItalic = {
  designPath: 'Base/Italic',
  fontSize: 14,
  lineHeight: 22,
  fontWeight: W_REG,
  fontStyle: 'italic',
} as const satisfies HydraTextStyle;

export const hydraSmallNormal = {
  designPath: 'Small/Normal',
  fontSize: 12,
  lineHeight: 20,
  fontWeight: W_REG,
} as const satisfies HydraTextStyle;

export const hydraSmallStrong = {
  designPath: 'Small/Strong',
  fontSize: 12,
  lineHeight: 20,
  fontWeight: W_SEMI,
} as const satisfies HydraTextStyle;

export const hydraSmallUnderline = {
  designPath: 'Small/Underline',
  fontSize: 12,
  lineHeight: 20,
  fontWeight: W_REG,
  textDecoration: 'underline',
} as const satisfies HydraTextStyle;

export const hydraSmallDelete = {
  designPath: 'Small/Delete',
  fontSize: 12,
  lineHeight: 20,
  fontWeight: W_REG,
  textDecoration: 'line-through',
} as const satisfies HydraTextStyle;

export const hydraSmallItalic = {
  designPath: 'Small/Italic',
  fontSize: 12,
  lineHeight: 20,
  fontWeight: W_REG,
  fontStyle: 'italic',
} as const satisfies HydraTextStyle;

export const hydraLargeNormal = {
  designPath: 'Large/Normal',
  fontSize: 16,
  lineHeight: 24,
  fontWeight: W_REG,
} as const satisfies HydraTextStyle;

export const hydraLargeStrong = {
  designPath: 'Large/Strong',
  fontSize: 16,
  lineHeight: 24,
  fontWeight: W_SEMI,
} as const satisfies HydraTextStyle;

export const hydraLargeUnderline = {
  designPath: 'Large/Underline',
  fontSize: 16,
  lineHeight: 24,
  fontWeight: W_REG,
  textDecoration: 'underline',
} as const satisfies HydraTextStyle;

export const hydraLargeDelete = {
  designPath: 'Large/Delete',
  fontSize: 16,
  lineHeight: 24,
  fontWeight: W_REG,
  textDecoration: 'line-through',
} as const satisfies HydraTextStyle;

export const hydraLargeItalic = {
  designPath: 'Large/Italic',
  fontSize: 16,
  lineHeight: 24,
  fontWeight: W_REG,
  fontStyle: 'italic',
} as const satisfies HydraTextStyle;

export const hydraExtraLargeNormal = {
  designPath: 'Extra Large/Normal',
  fontSize: 20,
  lineHeight: 28,
  fontWeight: W_REG,
} as const satisfies HydraTextStyle;

export const hydraExtraLargeStrong = {
  designPath: 'Extra Large/Strong',
  fontSize: 20,
  lineHeight: 28,
  fontWeight: W_SEMI,
} as const satisfies HydraTextStyle;

export const hydraExtraLargeUnderline = {
  designPath: 'Extra Large/Underline',
  fontSize: 20,
  lineHeight: 28,
  fontWeight: W_REG,
  textDecoration: 'underline',
} as const satisfies HydraTextStyle;

export const hydraExtraLargeDelete = {
  designPath: 'Extra Large/Delete',
  fontSize: 20,
  lineHeight: 28,
  fontWeight: W_REG,
  textDecoration: 'line-through',
} as const satisfies HydraTextStyle;

export const hydraExtraLargeItalic = {
  designPath: 'Extra Large/Italic',
  fontSize: 20,
  lineHeight: 28,
  fontWeight: W_REG,
  fontStyle: 'italic',
} as const satisfies HydraTextStyle;

export const hydraTextBaseNormal = hydraBaseNormal;

export const hydraAntdFontMapFromDesign = {
  fontSize: hydraBaseNormal.fontSize,
  lineHeight: unitlessLineHeight(hydraBaseNormal.lineHeight, hydraBaseNormal.fontSize),
  fontSizeSM: hydraSmallNormal.fontSize,
  lineHeightSM: unitlessLineHeight(hydraSmallNormal.lineHeight, hydraSmallNormal.fontSize),
  fontSizeLG: hydraLargeNormal.fontSize,
  lineHeightLG: unitlessLineHeight(hydraLargeNormal.lineHeight, hydraLargeNormal.fontSize),
  fontSizeXL: hydraExtraLargeNormal.fontSize,
  fontSizeHeading1: hydraTitleHeading1.fontSize,
  lineHeightHeading1: unitlessLineHeight(hydraTitleHeading1.lineHeight, hydraTitleHeading1.fontSize),
  fontSizeHeading2: hydraTitleHeading2.fontSize,
  lineHeightHeading2: unitlessLineHeight(hydraTitleHeading2.lineHeight, hydraTitleHeading2.fontSize),
  fontSizeHeading3: hydraTitleHeading3.fontSize,
  lineHeightHeading3: unitlessLineHeight(hydraTitleHeading3.lineHeight, hydraTitleHeading3.fontSize),
  fontSizeHeading4: hydraTitleHeading4.fontSize,
  lineHeightHeading4: unitlessLineHeight(hydraTitleHeading4.lineHeight, hydraTitleHeading4.fontSize),
  fontSizeHeading5: hydraTitleHeading5.fontSize,
  lineHeightHeading5: unitlessLineHeight(hydraTitleHeading5.lineHeight, hydraTitleHeading5.fontSize),
  fontHeight: hydraBaseNormal.lineHeight,
  fontHeightSM: hydraSmallNormal.lineHeight,
  fontHeightLG: hydraLargeNormal.lineHeight,
  fontWeightStrong: hydraBaseStrong.fontWeight,
} as const;

export function hydraTextStyleToReactCss(
  style: HydraTextStyle,
): Pick<CSSProperties, 'fontFamily' | 'fontSize' | 'lineHeight' | 'fontWeight' | 'fontStyle' | 'textDecoration'> {
  const css: Pick<
    CSSProperties,
    'fontFamily' | 'fontSize' | 'lineHeight' | 'fontWeight' | 'fontStyle' | 'textDecoration'
  > = {
    fontSize: style.fontSize,
    lineHeight: `${style.lineHeight}px`,
    fontWeight: style.fontWeight,
  };
  if (style.fontFamily) css.fontFamily = style.fontFamily;
  if (style.fontStyle) css.fontStyle = style.fontStyle;
  if (style.textDecoration && style.textDecoration !== 'none') css.textDecoration = style.textDecoration;
  return css;
}
