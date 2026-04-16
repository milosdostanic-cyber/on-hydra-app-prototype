/**
 * Typography mirrored from design local text styles (`Title/*`, `Base/*`,
 * `Small/*`, `Large/*`, `Extra Large/*`). No ad-hoc sizes outside this module.
 */

import type { CSSProperties } from 'react';

const W_REG = 400;
const W_SEMI = 600;

export type HydraTextStyle = Readonly<{
  /** Design style path, e.g. `Title/Heading 4` */
  designPath: string;
  fontSize: number;
  lineHeight: number;
  fontWeight: number;
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
}>;

export const hydraFontFamilyName = 'Cairo' as const;
export const hydraFontFamilyFallback = 'sans-serif' as const;
export const brandFontFamily = `'${hydraFontFamilyName}', ${hydraFontFamilyFallback}`;

function unitlessLineHeight(lineHeightPx: number, fontSize: number): number {
  return lineHeightPx / fontSize;
}

export const hydraTitleHeading1 = {
  designPath: 'Title/Heading 1',
  fontSize: 38,
  lineHeight: 46,
  fontWeight: W_SEMI,
} as const satisfies HydraTextStyle;

export const hydraTitleHeading2 = {
  designPath: 'Title/Heading 2',
  fontSize: 30,
  lineHeight: 38,
  fontWeight: W_SEMI,
} as const satisfies HydraTextStyle;

export const hydraTitleHeading3 = {
  designPath: 'Title/Heading 3',
  fontSize: 24,
  lineHeight: 32,
  fontWeight: W_SEMI,
} as const satisfies HydraTextStyle;

export const hydraTitleHeading4 = {
  designPath: 'Title/Heading 4',
  fontSize: 20,
  lineHeight: 28,
  fontWeight: W_SEMI,
} as const satisfies HydraTextStyle;

export const hydraTitleHeading5 = {
  designPath: 'Title/Heading 5',
  fontSize: 16,
  lineHeight: 24,
  fontWeight: W_SEMI,
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
): Pick<CSSProperties, 'fontSize' | 'lineHeight' | 'fontWeight' | 'fontStyle' | 'textDecoration'> {
  const css: Pick<
    CSSProperties,
    'fontSize' | 'lineHeight' | 'fontWeight' | 'fontStyle' | 'textDecoration'
  > = {
    fontSize: style.fontSize,
    lineHeight: `${style.lineHeight}px`,
    fontWeight: style.fontWeight,
  };
  if (style.fontStyle) css.fontStyle = style.fontStyle;
  if (style.textDecoration && style.textDecoration !== 'none') css.textDecoration = style.textDecoration;
  return css;
}
