import { Navigate, Route, Routes } from 'react-router-dom';

import { SeisBraceProvider } from './context/SeisBraceContext';
import { SeisBraceWizardProvider } from './context/SeisBraceWizardContext';
import { SeisBraceLandingPage } from './pages/SeisBraceLandingPage';
import { WizardPage } from './pages/WizardPage';

/**
 * Nested SeisBrace experience under `/seisbrace/*` (BOM module model). Shell sidebar and top bar
 * stay in {@link AppShell}; construction project comes from `useActiveProject()`.
 */
export function SeisBraceRoutes() {
  return (
    <SeisBraceProvider>
      <SeisBraceWizardProvider>
        <div style={{ width: '100%' }}>
          <Routes>
            <Route index element={<SeisBraceLandingPage />} />
            <Route path="wizard/:step" element={<WizardPage />} />
            <Route path="*" element={<Navigate to="/seisbrace" replace />} />
          </Routes>
        </div>
      </SeisBraceWizardProvider>
    </SeisBraceProvider>
  );
}
