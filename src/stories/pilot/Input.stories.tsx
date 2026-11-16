import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Input } from '../../ui/antd';

const meta = {
  title: 'Components/Input',
  component: Input,
  args: {
    placeholder: 'Placeholder',
    defaultValue: '',
    size: 'middle',
    variant: 'outlined',
    status: undefined,
    disabled: false,
    allowClear: false,
    style: { width: 240 },
    onChange: fn(),
  },
  argTypes: {
    placeholder: { control: 'text' },
    defaultValue: { control: 'text', description: 'Value' },
    size: { control: 'inline-radio', options: ['small', 'middle', 'large'] },
    variant: { control: 'select', options: ['outlined', 'filled', 'borderless', 'underlined'] },
    // `none` maps to antd's default (no status) so it can be set from URL args.
    status: { control: 'inline-radio', options: ['none', 'warning', 'error'], mapping: { none: undefined } },
    disabled: { control: 'boolean' },
    allowClear: { control: 'boolean' },
    style: { table: { disable: true } },
    onChange: { table: { disable: true } },
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
