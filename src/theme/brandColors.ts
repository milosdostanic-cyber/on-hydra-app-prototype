import type { HydraColorMode } from './hydraColorMode';
import { hydraDarkAlias, hydraLightAlias } from './hydraAlias';
import {
  brandFontFamily,
  hydraBaseNormal,
  hydraLargeStrong,
  hydraTextStyleToReactCss,
} from './hydraTypography';
import {
  bluePrimarySemantics,
  bluePrimarySemanticsDark,
  bluePrimaryStep,
} from './primaryPrimitiveBlue';

/**
 * Ghost primary CSS vars — same slots as `colorPrimary` / hover / active text+fill semantics.
 */
export const brandColors = {
  primary: bluePrimaryStep(6),
  primaryHover: bluePrimaryStep(5),
  primaryDark: bluePrimaryStep(7),
  /** Accent cyan; same as `Primary/primary-4` / `colorLinkHover` */
  primaryAccent: bluePrimaryStep(4),
  semantics: bluePrimarySemantics,
} as const;

/** Ghost primary when UI is in **dark** mode — use with `hydraAntdThemeDark`. */
export const brandColorsDark = {
  primary: bluePrimaryStep(6, 'dark'),
  primaryHover: bluePrimaryStep(5, 'dark'),
  primaryDark: bluePrimaryStep(7, 'dark'),
  primaryAccent: bluePrimaryStep(4, 'dark'),
  semantics: bluePrimarySemanticsDark,
} as const;

export function applyHydraBrandCssVars(root: HTMLElement, mode: HydraColorMode): void {
  const b = mode === 'light' ? brandColors : brandColorsDark;
  root.style.setProperty('--hydra-brand-primary', b.primary);
  root.style.setProperty('--hydra-brand-primary-hover', b.primaryHover);
  root.style.setProperty('--hydra-brand-primary-active', b.primaryDark);
  root.style.setProperty('--hydra-font-family', brandFontFamily);
}

/**
 * Tag label — Figma `Base/Normal` (14/22). antd `Tag` defaults to `fontSizeSM`; vars consumed in `index.css`.
 */
export function applyHydraTagCssVars(root: HTMLElement): void {
  const tagStyle = hydraTextStyleToReactCss(hydraBaseNormal);
  root.style.setProperty('--hydra-tag-font-size', `${tagStyle.fontSize}px`);
  root.style.setProperty('--hydra-tag-line-height', tagStyle.lineHeight as string);
  root.style.setProperty('--hydra-tag-font-weight', String(tagStyle.fontWeight));
}

/**
 * Alert headline (`title` / legacy `message`) — Figma `Large/Strong` + `Color/Neutral/Text/colorText`.
 * antd `Alert` has no component token for title typography; vars are consumed in `index.css`.
 */
export function applyHydraAlertTitleCssVars(root: HTMLElement, mode: HydraColorMode): void {
  const alias = mode === 'light' ? hydraLightAlias : hydraDarkAlias;
  const titleStyle = hydraTextStyleToReactCss(hydraLargeStrong);
  root.style.setProperty('--hydra-alert-title-font-size', `${titleStyle.fontSize}px`);
  root.style.setProperty('--hydra-alert-title-line-height', titleStyle.lineHeight as string);
  root.style.setProperty('--hydra-alert-title-font-weight', String(titleStyle.fontWeight));
  root.style.setProperty('--hydra-alert-title-color', alias.colorText);
}
