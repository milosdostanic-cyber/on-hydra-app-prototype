import { buttonPrimaryPalette } from './buttonPrimaryPalette';

/**
 * Figma **Customize Theme** group for orange solid primary Button only.
 * Primitives resolve from **Colors** `Hydra Action Orange/hydra-*`.
 */
export const BUTTON_PRIMARY_CUSTOMIZE_GROUP = 'Color/Action' as const;

export const HYDRA_ACTION_ORANGE_PRIMITIVE_PREFIX = 'Hydra Action Orange/hydra-' as const;

/** @deprecated Use `HYDRA_ACTION_ORANGE_PRIMITIVE_PREFIX` — Figma `Volcano/*` is the stock antd ramp. */
export const VOLCANO_PRIMITIVE_PREFIX = HYDRA_ACTION_ORANGE_PRIMITIVE_PREFIX;

/** antd `components.Button` token → Figma variable full path (1:1 with `buttonPrimaryPalette`). */
export const buttonPrimaryCustomizeThemePaths = {
  colorPrimary: `${BUTTON_PRIMARY_CUSTOMIZE_GROUP}/colorAction`,
  colorPrimaryHover: `${BUTTON_PRIMARY_CUSTOMIZE_GROUP}/colorActionHover`,
  colorPrimaryActive: `${BUTTON_PRIMARY_CUSTOMIZE_GROUP}/colorActionActive`,
  colorPrimaryBg: `${BUTTON_PRIMARY_CUSTOMIZE_GROUP}/colorActionBg`,
  colorPrimaryBgHover: `${BUTTON_PRIMARY_CUSTOMIZE_GROUP}/colorActionBgHover`,
  colorPrimaryBorder: `${BUTTON_PRIMARY_CUSTOMIZE_GROUP}/colorActionBorder`,
  colorPrimaryBorderHover: `${BUTTON_PRIMARY_CUSTOMIZE_GROUP}/colorActionBorderHover`,
  colorPrimaryText: `${BUTTON_PRIMARY_CUSTOMIZE_GROUP}/colorActionText`,
  colorPrimaryTextHover: `${BUTTON_PRIMARY_CUSTOMIZE_GROUP}/colorActionTextHover`,
  colorPrimaryTextActive: `${BUTTON_PRIMARY_CUSTOMIZE_GROUP}/colorActionTextActive`,
} as const;

/** Effect-color parity path for `components.Button.primaryShadow`. */
export const buttonPrimaryEffectPaths = {
  primaryShadow: `${BUTTON_PRIMARY_CUSTOMIZE_GROUP}/colorActionShadowColor`,
} as const;

type PathKey = keyof typeof buttonPrimaryCustomizeThemePaths;

const PATH_TO_PALETTE_KEY: Record<PathKey, keyof typeof buttonPrimaryPalette> = {
  colorPrimary: 'rest',
  colorPrimaryHover: 'hover',
  colorPrimaryActive: 'active',
  colorPrimaryBg: 'bg',
  colorPrimaryBgHover: 'bgHover',
  colorPrimaryBorder: 'border',
  colorPrimaryBorderHover: 'borderHover',
  colorPrimaryText: 'text',
  colorPrimaryTextHover: 'textHover',
  colorPrimaryTextActive: 'textActive',
};

/** Semantic Customize Theme row → `Hydra Action Orange/hydra-n` index (1-based, Light). */
const PATH_TO_ACTION_STEP: Record<PathKey, 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10> = {
  colorPrimaryBg: 1,
  colorPrimaryBgHover: 2,
  colorPrimaryBorder: 3,
  colorPrimaryBorderHover: 4,
  colorPrimaryHover: 5,
  colorPrimary: 6,
  colorPrimaryActive: 8,
  colorPrimaryText: 8,
  colorPrimaryTextHover: 5,
  colorPrimaryTextActive: 9,
};

/** Ordered rows for docs / Figma MCP sync scripts. */
export function getButtonPrimaryCustomizeThemeRows(): Array<{
  designPath: string;
  primitivePath: string;
  antdButtonToken: PathKey;
  hex: string;
}> {
  return (Object.keys(buttonPrimaryCustomizeThemePaths) as PathKey[]).map((antdButtonToken) => {
    const step = PATH_TO_ACTION_STEP[antdButtonToken];
    return {
      designPath: buttonPrimaryCustomizeThemePaths[antdButtonToken],
      primitivePath: `${HYDRA_ACTION_ORANGE_PRIMITIVE_PREFIX}${step}`,
      antdButtonToken,
      hex: buttonPrimaryPalette[PATH_TO_PALETTE_KEY[antdButtonToken]],
    };
  });
}
