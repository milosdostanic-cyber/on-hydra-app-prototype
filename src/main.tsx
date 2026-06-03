import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { App } from './App';
import { ActiveProjectProvider } from './context/ActiveProjectContext';
import { BomWorkspaceProvider } from './context/BomWorkspaceContext';
import { HydraThemeProvider } from './context/HydraThemeContext';
import { SubmittalPackagesProvider } from './context/SubmittalPackagesContext';

import './index.css';
import 'antd/dist/reset.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HydraThemeProvider>
      <BrowserRouter>
        <ActiveProjectProvider>
          <BomWorkspaceProvider>
            <SubmittalPackagesProvider>
              <App />
            </SubmittalPackagesProvider>
          </BomWorkspaceProvider>
        </ActiveProjectProvider>
      </BrowserRouter>
    </HydraThemeProvider>
  </StrictMode>,
);
