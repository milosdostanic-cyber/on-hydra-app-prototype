import type { CSSProperties } from 'react';

import { shellLayout } from '../theme/hydraAlias';

/**
 * Main-column content rail — same width on BOM, breadcrumbs, and project Content body.
 * `AppShell` wraps routes in this; full-bleed pages (e.g. catalog hero) apply it below the hero only.
 */
export const shellContentRailStyle: CSSProperties = {
  width: '100%',
  maxWidth: shellLayout.contentRailMaxWidthPx,
  minWidth: `min(100%, ${shellLayout.contentRailMinWidthPx}px)`,
  marginInline: 'auto',
  boxSizing: 'border-box',
};

/** Figma breadcrumb bar row (`4654:120824`): padding 12×24, height 46. */
export const shellBreadcrumbBarStyle = {
  minHeightPx: 46,
} as const;
