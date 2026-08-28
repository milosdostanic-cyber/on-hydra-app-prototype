import type { ReactNode } from 'react';

import { accessLevelRestriction, canEdit } from '../constants/specStatusVocabulary';
import type { SpecAccessLevel } from '../data/types';
import { Alert, Flex, Tooltip, theme } from '../../ui/antd';

/**
 * Renders children normally when the role may edit; otherwise shows an access Alert
 * and wraps children in a disabled-with-reason Tooltip (G12).
 */
export function SpecPermissionBoundary({
  access,
  children,
  actionLabel = 'This action',
}: {
  access: SpecAccessLevel;
  children?: ReactNode;
  actionLabel?: string;
}) {
  const { token } = theme.useToken();
  const allowed = canEdit(access);
  const reason = accessLevelRestriction[access];

  if (allowed) {
    return <>{children}</>;
  }

  return (
    <Flex vertical gap={token.marginSM}>
      {reason ? <Alert type="info" showIcon title={reason} /> : null}
      {children ? (
        <Tooltip title={reason ?? `${actionLabel} is not available for your access level.`}>
          <span aria-disabled="true">{children}</span>
        </Tooltip>
      ) : null}
    </Flex>
  );
}
