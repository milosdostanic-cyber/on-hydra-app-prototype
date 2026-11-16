import type { GlobalToken } from 'antd/es/theme/interface';
import type { CSSProperties } from 'react';

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Subtle `Color/Action` tint + border for Action Trail emphasis. */
export function actionTrailHighlightStyle(token: GlobalToken, active: boolean): CSSProperties {
  if (!active) return {};
  const bg = token.colorActionBg;
  const border = token.colorActionBorder;
  const base: CSSProperties = {
    ['--action-trail-highlight-bg' as string]: bg,
    ['--action-trail-highlight-border' as string]: border,
    backgroundColor: bg,
    boxShadow: `inset 0 0 0 ${token.lineWidth}px ${border}`,
  };
  if (prefersReducedMotion()) return base;
  return {
    ...base,
    animation: `action-trail-highlight-pulse ${token.motionDurationSlow} ease-out 1`,
  };
}

/** Ant Design Table row — `tr` outline alone is hidden by cell backgrounds; use with `action-trail-table-row` class. */
export function actionTrailTableRowProps(
  token: GlobalToken,
  active: boolean,
): { className?: string; style?: CSSProperties } {
  if (!active) return {};
  return {
    className: 'action-trail-table-row',
    style: actionTrailHighlightStyle(token, true),
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
