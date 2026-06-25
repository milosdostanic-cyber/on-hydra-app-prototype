import { Outlet } from 'react-router-dom';

import { BomImportFlowProvider } from '../context/BomImportFlowContext';

/** BOM routes fill shell content rail width (`AppShell` applies min/max rail). */
export function BomLayout() {
  return (
    <BomImportFlowProvider>
      <div style={{ width: '100%' }}>
        <Outlet />
      </div>
    </BomImportFlowProvider>
  );
}
