/**
 * Danger Button drop-shadow — mirrors antd `components.Button.dangerShadow`
 * (`0 ${controlOutlineWidth}px 0 ${colorErrorOutline}`).
 * Figma: **Customize Theme** `Color/ButtonDanger/dangerShadow`.
 */
export const buttonDangerShadow = '0 2px 0 rgba(255, 38, 5, 0.06)' as const;

/** Dark mode — antd `colorErrorOutline` with dark algorithm. */
export const buttonDangerShadowDark = '0 2px 0 rgba(238, 38, 56, 0.11)' as const;

/** Effect-color hex for Figma variable (`#FF26050F`). */
export const buttonDangerShadowColorLight = '#FF26050F' as const;

/** Effect-color hex for dark mode (`#EE26381C`). */
export const buttonDangerShadowColorDark = '#EE26381C' as const;
