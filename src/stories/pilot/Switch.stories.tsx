import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Switch } from '../../ui/antd';

const meta = {
  title: 'Components/Switch',
  component: Switch,
  args: {
    checked: false,
    size: 'default',
    disabled: false,
    loading: false,
    onChange: fn(),
  },
  argTypes: {
    checked: { control: 'boolean' },
    size: { control: 'inline-radio', options: ['default', 'small'] },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    onChange: { table: { disable: true } },
  },
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
