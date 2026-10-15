import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Checkbox } from '../../ui/antd';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: {
    children: 'Checkbox',
    checked: false,
    indeterminate: false,
    disabled: false,
    onChange: fn(),
  },
  argTypes: {
    children: { control: 'text', description: 'Label' },
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    disabled: { control: 'boolean' },
    onChange: { table: { disable: true } },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
