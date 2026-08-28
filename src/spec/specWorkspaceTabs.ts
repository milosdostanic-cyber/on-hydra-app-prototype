import type { TabsProps } from '../ui/antd';
import {
  specAnalyzePath,
  specEditPath,
  specExportPath,
} from './specNavigation';

export type SpecWorkspaceTabKey = 'dashboard' | 'review-edit' | 'export';

/** Confirmed Release 1 workspace tabs (Phase 0 decision 2). */
export function specWorkspaceTabItems(): NonNullable<TabsProps['items']> {
  return [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'review-edit', label: 'Review & Edit' },
    { key: 'export', label: 'Export' },
  ];
}

export function navigateSpecWorkspaceTab(
  specId: string,
  key: string,
  navigate: (path: string) => void,
) {
  if (key === 'review-edit') {
    navigate(specEditPath(specId));
    return;
  }
  if (key === 'export') {
    navigate(specExportPath(specId));
    return;
  }
  navigate(specAnalyzePath(specId));
}
