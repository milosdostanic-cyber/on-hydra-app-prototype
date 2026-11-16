import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Select } from '../../ui/antd';

const OPTIONS = [
  { value: 'steel', label: 'Steel' },
  { value: 'aluminum', label: 'Aluminum' },
  { value: 'copper', label: 'Copper' },
];

const meta = {
  title: 'Components/Select',
  component: Select,
  args: {
    placeholder: 'Select material',
    options: OPTIONS,
    size: 'middle',
    variant: 'outlined',
    status: undefined,
    disabled: false,
    loading: false,
    allowClear: false,
    style: { width: 240 },
    onChange: fn(),
  },
  argTypes: {
    placeholder: { control: 'text' },
    size: { control: 'inline-radio', options: ['small', 'middle', 'large'] },
    variant: { control: 'select', options: ['outlined', 'filled', 'borderless', 'underlined'] },
    // `none` maps to antd's default (no status) so it can be set from URL args.
    status: { control: 'inline-radio', options: ['none', 'warning', 'error'], mapping: { none: undefined } },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    allowClear: { control: 'boolean' },
    options: { table: { disable: true } },
    style: { table: { disable: true } },
    onChange: { table: { disable: true } },
  },
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
