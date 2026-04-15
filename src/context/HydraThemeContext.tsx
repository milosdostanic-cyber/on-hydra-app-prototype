import { useCallback, useEffect, useMemo, useState, createContext, useContext, type ReactNode } from 'react';

import { App as AntdApp, ConfigProvider } from '../ui/antd';
import { applyHydraBrandCssVars } from '../theme/brandColors';
import { createHydraAntdTheme, createHydraAntdThemeDark } from '../theme/antdTheme';
import type { HydraColorMode } from '../theme/hydraColorMode';

const STORAGE_KEY = 'hydra-color-mode';

type HydraThemeContextValue = {
  colorMode: HydraColorMode;
  setColorMode: (mode: HydraColorMode) => void;
};

const HydraThemeContext = createContext<HydraThemeContextValue | null>(null);

function readStoredMode(): HydraColorMode {
  if (typeof window === 'undefined') return 'light';
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

type Props = {
  children: ReactNode;
};

/**
 * Owns Hydra light/dark preference, antd `ConfigProvider` theme, and ghost-primary CSS vars on `:root`.
 */
export function HydraThemeProvider({ children }: Props) {
  const [colorMode, setColorModeState] = useState<HydraColorMode>(readStoredMode);

  useEffect(() => {
    applyHydraBrandCssVars(document.documentElement, colorMode);
    document.documentElement.style.colorScheme = colorMode === 'dark' ? 'dark' : 'light';
    try {
      window.localStorage.setItem(STORAGE_KEY, colorMode);
    } catch {
      /* ignore */
    }
  }, [colorMode]);

  const setColorMode = useCallback((mode: HydraColorMode) => setColorModeState(mode), []);

  const appTheme = useMemo(
    () => (colorMode === 'dark' ? createHydraAntdThemeDark() : createHydraAntdTheme()),
    [colorMode],
  );

  const value = useMemo(() => ({ colorMode, setColorMode }), [colorMode, setColorMode]);

  return (
    <HydraThemeContext.Provider value={value}>
      <ConfigProvider theme={appTheme}>
        <AntdApp>{children}</AntdApp>
      </ConfigProvider>
    </HydraThemeContext.Provider>
  );
}

export function useHydraColorMode(): HydraThemeContextValue {
  const ctx = useContext(HydraThemeContext);
  if (!ctx) throw new Error('useHydraColorMode must be used inside HydraThemeProvider');
  return ctx;
}
