import type { GlobalToken } from 'antd/es/theme/interface';
import type { CSSProperties } from 'react';

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Token-only highlight surface for Action Trail sub-project / row emphasis. */
export function actionTrailHighlightStyle(token: GlobalToken, active: boolean): CSSProperties {
  if (!active) return {};
  return {
    backgroundColor: token.colorPrimaryBg,
    outline: `${token.lineWidth}px solid ${token.colorPrimaryBorder}`,
    outlineOffset: token.marginXXS,
    borderRadius: token.borderRadius,
  };
}

/** One-shot badge pulse when unseen count increases. */
export function actionTrailBadgePulseStyle(
  token: GlobalToken,
  pulsing: boolean,
): CSSProperties {
  if (!pulsing || prefersReducedMotion()) return {};
  return {
    animation: `action-trail-badge-pulse ${token.motionDurationSlow} ease-out 1`,
  };
}
