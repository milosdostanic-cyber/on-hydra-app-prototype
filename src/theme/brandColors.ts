import type { HydraColorMode } from './hydraColorMode';
import { brandFontFamily } from './hydraTypography';
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
