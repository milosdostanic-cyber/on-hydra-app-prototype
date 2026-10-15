import type { StorybookConfig } from '@storybook/react-vite';

/**
 * Storybook for Hydra components — source for the s2f (Storybook → Figma) capture tool.
 * Plan: Documents/plans/2026-10-15-storybook-to-figma-plugin-plan.md
 */
const config: StorybookConfig = {
  stories: ['../src/stories/**/*.stories.@(ts|tsx)'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  core: {
    disableTelemetry: true,
  },
};

export default config;
