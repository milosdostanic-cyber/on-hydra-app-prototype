import type { HydraColorfulPreset } from '../ui/HydraTag';

/**
 * How many file-type tags stay visible in a drawings cell.
 * Further types collapse into a "+X" tag. See `.cursor/rules/content-file-type-tags.mdc`.
 */
export const CONTENT_FILE_TYPE_TAG_VISIBLE_COUNT = 3;

/**
 * `Tag__Colorful` presets from Part Search – RSFC, frame "Content file type tags" (11341:6250).
 * DWG uses `orange` because that component has no `red` variant.
 */
export const CONTENT_FILE_TYPE_TAG_PRESET: Record<string, HydraColorfulPreset> = {
  RFA: 'blue',
  STEP: 'geekblue',
  PDF: 'cyan',
  DWG: 'orange',
  IGES: 'magenta',
  SAT: 'purple',
  IEZ: 'green',
  TXT: 'gold',
  PNG: 'lime',
};

export function contentFileTypeTagPreset(fileType: string): HydraColorfulPreset | null {
  return CONTENT_FILE_TYPE_TAG_PRESET[fileType.trim().toUpperCase()] ?? null;
}
