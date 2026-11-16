import { useEffect, useMemo } from 'react';
import type { Decorator, Preview } from '@storybook/react-vite';

import { App as AntdApp, ConfigProvider, theme } from '../src/ui/antd';
import { applyHydraAlertTitleCssVars, applyHydraBrandCssVars, applyHydraTagCssVars } from '../src/theme/brandColors';
import { createHydraAntdTheme, createHydraAntdThemeDark } from '../src/theme/antdTheme';
import type { HydraColorMode } from '../src/theme/hydraColorMode';

import '../src/index.css';
import 'antd/dist/reset.css';

/** Paints the canvas with the theme's container background so dark stories are not captured on white. */
function CanvasBackground() {
  const { token } = theme.useToken();
  useEffect(() => {
    document.body.style.background = token.colorBgContainer;
  }, [token.colorBgContainer]);
  return null;
}

/**
 * Mirrors `HydraThemeProvider` (src/context/HydraThemeContext.tsx), but the color mode comes from
 * the Storybook `theme` global instead of localStorage, so the capture tool can render each mode
 * via `iframe.html?globals=theme:dark`. antd 6 always emits `--ant-*` CSS variables, which the
 * capture tool reads as design tokens.
 */
const withHydraTheme: Decorator = (Story, context) => {
  const colorMode: HydraColorMode = context.globals.theme === 'dark' ? 'dark' : 'light';

  useEffect(() => {
    const root = document.documentElement;
    applyHydraBrandCssVars(root, colorMode);
    applyHydraTagCssVars(root);
    applyHydraAlertTitleCssVars(root, colorMode);
    root.style.colorScheme = colorMode;
  }, [colorMode]);

  const appTheme = useMemo(
    () => (colorMode === 'dark' ? createHydraAntdThemeDark() : createHydraAntdTheme()),
    [colorMode],
  );

  return (
    <ConfigProvider theme={appTheme}>
      <AntdApp>
        <CanvasBackground />
        <Story />
      </AntdApp>
    </ConfigProvider>
  );
};

const preview: Preview = {
  decorators: [withHydraTheme],
  globalTypes: {
    theme: {
      description: 'Hydra color mode',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  parameters: {
    layout: 'centered',
    controls: { expanded: true },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;
