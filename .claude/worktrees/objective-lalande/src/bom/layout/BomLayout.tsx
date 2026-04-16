import { Outlet } from 'react-router-dom';

import { theme } from '../../ui/antd';

/** Centers BOM content like the Make “hub” width; keeps shell chrome unchanged. */
export function BomLayout() {
  const { token } = theme.useToken();
  return (
    <div
      style={{
        width: '100%',
        maxWidth: token.screenXL,
        marginInline: 'auto',
      }}
    >
      <Outlet />
    </div>
  );
}
