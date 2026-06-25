import { buttonDangerShadowColorLight } from './buttonDangerPalette';

/**
 * Figma **Customize Theme** group for danger Button drop-shadow.
 * Parallels `Color/ButtonPrimary/primaryShadow` for orange solid primary.
 */
export const BUTTON_DANGER_CUSTOMIZE_GROUP = 'Color/ButtonDanger' as const;

/** Effect-color parity path for `components.Button.dangerShadow`. */
export const buttonDangerEffectPaths = {
  dangerShadow: `${BUTTON_DANGER_CUSTOMIZE_GROUP}/dangerShadow`,
} as const;

/** Figma variable full path → hex (light / single-mode DS). */
export const buttonDangerCustomizeThemePaths = {
  dangerShadow: buttonDangerEffectPaths.dangerShadow,
} as const;

export function getButtonDangerCustomizeThemeRows(): Array<{
  designPath: string;
  antdButtonToken: 'dangerShadow';
  hex: string;
}> {
  return [
    {
      designPath: buttonDangerCustomizeThemePaths.dangerShadow,
      antdButtonToken: 'dangerShadow',
      hex: buttonDangerShadowColorLight,
    },
  ];
}
