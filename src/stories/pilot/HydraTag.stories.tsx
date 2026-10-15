import type { Meta, StoryObj } from '@storybook/react-vite';

import { HydraTag } from '../../ui/HydraTag';

/** Hydra's own Tag wrapper (tone colors from theme tokens), not the raw antd Tag. */
const meta = {
  title: 'Components/Tag',
  component: HydraTag,
  args: {
    children: 'Tag',
    tone: 'default',
    bordered: true,
  },
  argTypes: {
    children: { control: 'text', description: 'Label' },
    tone: { control: 'select', options: ['default', 'success', 'warning', 'error', 'processing'] },
    bordered: { control: 'boolean' },
  },
} satisfies Meta<typeof HydraTag>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
