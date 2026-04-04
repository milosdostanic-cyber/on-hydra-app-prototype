/**
 * Typography mirrored from the **Figma** Ant Design kit (local text styles / variables).
 * **Source of truth:** Figma — refresh these values after design changes (Figma MCP `get_design_context`,
 * variables panel, or text-style export). Do not set ad-hoc `fontSize` / `lineHeight` / `fontWeight` in components.
 *
 * @see Documentation/hydra-typography.md
 */

/** Figma font family name (matches loaded face in `index.html`). */
export const figmaFontFamilyName = 'Cairo' as const;

export const figmaFontFamilyFallback = 'sans-serif' as const;

/** CSS `font-family` stack for `theme.token.fontFamily` and `--hydra-font-family`. */
export const brandFontFamily = `'${figmaFontFamilyName}', ${figmaFontFamilyFallback}`;

/**
 * **Base/Normal** (Figma text style `Base/Normal` in the kit).
 * Line height is in px for documentation parity; antd derives rhythm from `fontSize` unless overridden per component.
 */
export const figmaTextBaseNormal = {
  fontSize: 14,
  lineHeight: 22,
  fontWeight: 400,
} as const;
