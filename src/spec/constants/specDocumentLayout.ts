import type { GlobalToken } from 'antd/es/theme/interface';

/** ISO 216 A4 height / width — used for proportional sheet sizing in the editor. */
export const SPEC_A4_ASPECT_RATIO = 297 / 210;

/** Derives A4 sheet width and height from antd layout tokens (no raw design literals). */
export function specA4Dimensions(token: GlobalToken): {
  width: number;
  height: number;
} {
  const width = token.controlHeight * 25;
  return {
    width,
    height: Math.round(width * SPEC_A4_ASPECT_RATIO),
  };
}
