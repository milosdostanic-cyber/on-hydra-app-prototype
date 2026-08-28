import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';

import { Flex, theme } from '../../ui/antd';

/**
 * Workspace chrome wrapper for document-scoped Spec routes.
 * Header / tabs are provided by the page; this layout only reserves vertical rhythm.
 */
export function SpecWorkspaceLayout({ header }: { header?: ReactNode }) {
  const { token } = theme.useToken();
  return (
    <Flex vertical gap={token.marginLG} style={{ width: '100%' }}>
      {header}
      <Outlet />
    </Flex>
  );
}
