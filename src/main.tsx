import { ConfigProvider } from './ui/antd';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { App } from './App';
import { applyHydraBrandCssVars } from './theme/brandColors';
import { hydraAntdTheme } from './theme/antdTheme';

import './index.css';
import 'antd/dist/reset.css';

applyHydraBrandCssVars(document.documentElement, 'light');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider theme={hydraAntdTheme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </StrictMode>,
);
