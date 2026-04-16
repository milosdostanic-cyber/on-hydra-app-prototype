import { buttonPrimaryPalette } from './buttonPrimaryPalette';

/**
 * Figma **Customize Theme** group for orange solid primary Button only.
 * Primitives resolve from **Colors** `Volcano/volcano-*` (not ButtonOrange).
 */
export const BUTTON_PRIMARY_CUSTOMIZE_GROUP = 'Color/ButtonPrimary' as const;

export const VOLCANO_PRIMITIVE_PREFIX = 'Volcano/volcano-' as const;

/** Figma variable full path → hex (1:1 with `buttonPrimaryPalette` + `antdTheme.components.Button`). */
export const buttonPrimaryCustomizeThemePaths = {
  colorPrimary: `${BUTTON_PRIMARY_CUSTOMIZE_GROUP}/colorPrimary`,
  colorPrimaryHover: `${BUTTON_PRIMARY_CUSTOMIZE_GROUP}/colorPrimaryHover`,
  colorPrimaryActive: `${BUTTON_PRIMARY_CUSTOMIZE_GROUP}/colorPrimaryActive`,
  colorPrimaryBG: `${BUTTON_PRIMARY_CUSTOMIZE_GROUP}/colorPrimaryBG`,
  colorPrimaryBGHover: `${BUTTON_PRIMARY_CUSTOMIZE_GROUP}/colorPrimaryBGHover`,
  colorPrimaryBorder: `${BUTTON_PRIMARY_CUSTOMIZE_GROUP}/colorPrimaryBorder`,
  colorPrimaryBorderHover: `${BUTTON_PRIMARY_CUSTOMIZE_GROUP}/colorPrimaryBorderHover`,
  colorPrimaryText: `${BUTTON_PRIMARY_CUSTOMIZE_GROUP}/colorPrimaryText`,
  colorPrimaryTextHover: `${BUTTON_PRIMARY_CUSTOMIZE_GROUP}/colorPrimaryTextHover`,
  colorPrimaryTextActive: `${BUTTON_PRIMARY_CUSTOMIZE_GROUP}/colorPrimaryTextActive`,
} as const;

/** Effect-color parity path for `components.Button.primaryShadow`. */
export const buttonPrimaryEffectPaths = {
  primaryShadow: `${BUTTON_PRIMARY_CUSTOMIZE_GROUP}/primaryShadow`,
} as const;

type PathKey = keyof typeof buttonPrimaryCustomizeThemePaths;

const PATH_TO_PALETTE_KEY: Record<PathKey, keyof typeof buttonPrimaryPalette> = {
  colorPrimary: 'rest',
  colorPrimaryHover: 'hover',
  colorPrimaryActive: 'active',
  colorPrimaryBG: 'bg',
  colorPrimaryBGHover: 'bgHover',
  colorPrimaryBorder: 'border',
  colorPrimaryBorderHover: 'borderHover',
  colorPrimaryText: 'text',
  colorPrimaryTextHover: 'textHover',
  colorPrimaryTextActive: 'textActive',
};

/** Semantic Customize Theme row → `Volcano/volcano-n` index (1-based). */
const PATH_TO_VOLCANO_STEP: Record<PathKey, 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10> = {
  colorPrimaryBG: 1,
  colorPrimaryBGHover: 2,
  colorPrimaryBorder: 3,
  colorPrimaryBorderHover: 4,
  colorPrimaryHover: 5,
  colorPrimary: 6,
  colorPrimaryActive: 8,
  colorPrimaryText: 6,
  colorPrimaryTextHover: 5,
  colorPrimaryTextActive: 8,
};

/** Ordered rows for docs / Figma MCP sync scripts. */
export function getButtonPrimaryCustomizeThemeRows(): Array<{
  designPath: string;
  volcanoPrimitivePath: string;
  antdButtonToken: PathKey;
  hex: string;
}> {
  return (Object.keys(buttonPrimaryCustomizeThemePaths) as PathKey[]).map((antdButtonToken) => {
    const step = PATH_TO_VOLCANO_STEP[antdButtonToken];
    return {
      designPath: buttonPrimaryCustomizeThemePaths[antdButtonToken],
      volcanoPrimitivePath: `${VOLCANO_PRIMITIVE_PREFIX}${step}`,
      antdButtonToken,
      hex: buttonPrimaryPalette[PATH_TO_PALETTE_KEY[antdButtonToken]],
    };
  });
}
