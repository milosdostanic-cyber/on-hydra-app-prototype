import { Outlet } from 'react-router-dom';

/** BOM routes fill shell content rail width (`AppShell` applies min/max rail). */
export function BomLayout() {
  return (
    <div style={{ width: '100%' }}>
      <Outlet />
    </div>
  );
}
