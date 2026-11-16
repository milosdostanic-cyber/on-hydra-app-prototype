import { Outlet } from 'react-router-dom';

import { useActionTrailModuleLifecycle } from '../../context/ActionTrailContext';
import { BomImportFlowProvider } from '../context/BomImportFlowContext';

/** BOM routes fill shell content rail width (`AppShell` applies min/max rail). */
export function BomLayout() {
  // BOM L1 count stays until the user opens the added part (figure link) — UATL-350.
  useActionTrailModuleLifecycle('bom', { clearBadgeOnEnter: false });

  return (
    <BomImportFlowProvider>
      {/* UX-009: flex column that grows with the work area, so a page can stretch a state card. */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: '1 0 auto' }}>
        <Outlet />
      </div>
    </BomImportFlowProvider>
  );
}
